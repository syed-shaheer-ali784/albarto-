
document.addEventListener("DOMContentLoaded", () => {
  const lampOverlay = document.getElementById("lampOverlay");
  const lampInstruction = document.getElementById("lampInstruction");
  const siteContent = document.getElementById("siteContent");
  const ropeArea = document.getElementById("ropeArea");
  const lampCord = document.getElementById("lampCord");
  const ropeKnob = ropeArea?.querySelector(".rope-knob");

  const checkoutForm = document.getElementById("checkoutForm");
  const orderItems = document.getElementById("orderItems");
  const subtotalElement = document.getElementById("subtotal");
  const deliveryElement = document.getElementById("delivery");
  const totalElement = document.getElementById("total");

  const successOverlay = document.getElementById("successOverlay");
  const successMessage = document.getElementById("successMessage");
  const closeSuccess = document.getElementById("closeSuccess");

  if (!lampOverlay || !siteContent || !ropeArea) {
    console.error("Lamp elements missing. Check checkout.html IDs.");
    return;
  }

  // ===== LAMP ON / OFF =====
  let lightIsOn = false;
  let isDragging = false;
  let startY = 0;
  let pullDistance = 0;
  let lastPullTime = 0;

  const minimumPull = 35;

  function setLamp(on) {
    lightIsOn = on;

    lampOverlay.classList.toggle("light-on", on);

    // Checkout is locked until the lamp turns on.
    siteContent.inert = !on;
    siteContent.setAttribute("aria-hidden", String(!on));

    if (lampInstruction) {
      lampInstruction.textContent = on
        ? "Pull the black rope again to turn off the light"
        : "Pull the black rope to turn on the light";
    }

    ropeArea.setAttribute(
      "aria-label",
      on ? "Pull to turn off the lamp" : "Pull to turn on the lamp"
    );

    // Keep the lamp and rope visible at all times.
    ropeArea.style.pointerEvents = "auto";
  }

  function animatePull() {
    ropeArea.classList.add("pulling");

    if (lampCord) {
      lampCord.style.height = "132px";
    }

    if (ropeKnob) {
      ropeKnob.style.top = "126px";
    }

    window.setTimeout(() => {
      ropeArea.classList.remove("pulling");

      if (lampCord) {
        lampCord.style.height = "";
      }

      if (ropeKnob) {
        ropeKnob.style.top = "";
      }
    }, 420);
  }

  function completePull() {
    const now = Date.now();

    // Prevent accidental double toggles.
    if (now - lastPullTime < 650) return;

    lastPullTime = now;
    animatePull();
    setLamp(!lightIsOn);
  }

  function onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;

    isDragging = true;
    startY = event.clientY;
    pullDistance = 0;

    ropeArea.classList.add("pulling");

    if (ropeArea.setPointerCapture && event.pointerId !== undefined) {
      try {
        ropeArea.setPointerCapture(event.pointerId);
      } catch (_) {}
    }

    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!isDragging) return;

    pullDistance = Math.max(0, event.clientY - startY);
    const distance = Math.min(pullDistance, 65);

    if (lampCord) {
      lampCord.style.height = `${105 + distance}px`;
    }

    if (ropeKnob) {
      ropeKnob.style.top = `${99 + distance}px`;
    }
  }

  function onPointerUp() {
    if (!isDragging) return;

    isDragging = false;
    ropeArea.classList.remove("pulling");

    if (pullDistance >= minimumPull) {
      completePull();
    } else {
      if (lampCord) lampCord.style.height = "";
      if (ropeKnob) ropeKnob.style.top = "";
    }

    pullDistance = 0;
  }

  ropeArea.addEventListener("pointerdown", onPointerDown);
  ropeArea.addEventListener("pointermove", onPointerMove);
  ropeArea.addEventListener("pointerup", onPointerUp);
  ropeArea.addEventListener("pointercancel", onPointerUp);

  // Also allow a click/tap on the rope knob to toggle the lamp.
  ropeArea.addEventListener("click", (event) => {
    if (event.detail === 0) completePull();
  });

  // Start with the light off.
  setLamp(false);

  // ===== CART / ORDER SUMMARY =====
  function readCart() {
    try {
      const saved = JSON.parse(localStorage.getItem("albertoCart") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      console.error("Could not read cart:", error);
      return [];
    }
  }

  function money(amount) {
    return "Rs. " + Number(amount || 0).toLocaleString("en-PK");
  }

  function getProductName(item) {
    return item.name || item.title || item.productName || "Luxury Watch";
  }

  function getProductPrice(item) {
    const price = Number(item.price ?? item.amount ?? 0);
    return Number.isFinite(price) && price >= 0 ? price : 0;
  }

  function getQuantity(item) {
    const quantity = Number(item.quantity ?? item.qty ?? 1);
    return Number.isFinite(quantity) && quantity > 0
      ? Math.floor(quantity)
      : 1;
  }

  function renderOrder() {
    if (!orderItems) return;

    const cart = readCart();
    orderItems.innerHTML = "";

    if (cart.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-cart";
      empty.textContent =
        "Your cart is empty. Add a watch from the collection first.";
      orderItems.appendChild(empty);
    } else {
      cart.forEach((item) => {
        const row = document.createElement("div");
        row.className = "order-product";

        const info = document.createElement("div");
        info.className = "product-info";

        const name = document.createElement("span");
        name.textContent = getProductName(item);

        const quantity = document.createElement("small");
        quantity.textContent = "Quantity: " + getQuantity(item);

        const price = document.createElement("strong");
        price.textContent = money(
          getProductPrice(item) * getQuantity(item)
        );

        info.appendChild(name);
        info.appendChild(quantity);
        row.appendChild(info);
        row.appendChild(price);
        orderItems.appendChild(row);
      });
    }

    const subtotal = cart.reduce(
      (sum, item) => sum + getProductPrice(item) * getQuantity(item),
      0
    );

    if (subtotalElement) subtotalElement.textContent = money(subtotal);

    // Free delivery for this demo checkout.
    if (deliveryElement) deliveryElement.textContent = "Free";
    if (totalElement) totalElement.textContent = money(subtotal);
  }

  renderOrder();

  // ===== PLACE ORDER =====
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!lightIsOn) {
        alert("Please turn on the lamp first.");
        return;
      }

      if (!checkoutForm.reportValidity()) return;

      const cart = readCart();

      if (cart.length === 0) {
        alert("Your cart is empty. Please add a watch before placing an order.");
        return;
      }

      const formData = new FormData(checkoutForm);
      const subtotal = cart.reduce(
        (sum, item) => sum + getProductPrice(item) * getQuantity(item),
        0
      );

      const order = {
        orderNumber: "AC-" + Date.now().toString().slice(-8),
        date: new Date().toISOString(),
        customer: {
          name: String(formData.get("customerName") || "").trim(),
          email: String(formData.get("customerEmail") || "").trim(),
          phone: String(formData.get("customerPhone") || "").trim(),
          address: String(formData.get("customerAddress") || "").trim(),
          city: String(formData.get("customerCity") || "").trim(),
          postalCode: String(formData.get("customerPostal") || "").trim()
        },
        payment: String(formData.get("payment") || "Cash on Delivery"),
        items: cart,
        subtotal,
        delivery: 0,
        total: subtotal
      };

      // Save this demo order in this browser.
      try {
        const previousOrders = JSON.parse(
          localStorage.getItem("albertoOrders") || "[]"
        );

        const orders = Array.isArray(previousOrders) ? previousOrders : [];
        orders.push(order);

        localStorage.setItem("albertoOrders", JSON.stringify(orders));
        localStorage.removeItem("albertoCart");
      } catch (error) {
        alert("The order could not be saved in this browser. Please try again.");
        console.error("Order save failed:", error);
        return;
      }

      if (successMessage) {
        successMessage.textContent =
          "Order " + order.orderNumber +
          " has been saved in this browser. This demo does not send your order to a shop.";
      }

      if (successOverlay) {
        successOverlay.hidden = false;
      }

      renderOrder();
    });
  }

  if (closeSuccess && successOverlay) {
    closeSuccess.addEventListener("click", () => {
      successOverlay.hidden = true;
    });
  }
});
