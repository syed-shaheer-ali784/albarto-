
const loader = document.getElementById("loader");
const countdownElement = document.getElementById("countdown");
const stopButton = document.getElementById("stopBomb");
const buttonArea = document.getElementById("buttonArea");
const message = document.getElementById("message");
const aboutPage = document.getElementById("aboutPage");

document.getElementById("year").textContent = new Date().getFullYear();

let seconds = 5;
let exploded = false;
let buttonMoves = 0;
let countdownTimer;
let finishTimer;

function moveButton() {
    if (exploded) return;

    const areaRect = buttonArea.getBoundingClientRect();
    const buttonRect = stopButton.getBoundingClientRect();

    const maxX = Math.max(0, areaRect.width - buttonRect.width);
    const maxY = Math.max(0, areaRect.height - buttonRect.height);

    const currentX = stopButton.offsetLeft;
    const currentY = stopButton.offsetTop;

    // Move to the opposite side from the button's current position.
    let newX = currentX < maxX / 2 ? maxX : 0;
    let newY = currentY < maxY / 2 ? maxY : 0;

    // If there's no vertical room, move horizontally.
    if (maxY < 5) newY = 8;

    stopButton.style.left = `${newX}px`;
    stopButton.style.top = `${newY}px`;
    stopButton.style.transform = "none";

    buttonMoves++;

    if (buttonMoves === 1) {
        message.textContent = "HAHA! Button bhaag gaya 😂 Dobara pakro!";
    } else if (buttonMoves === 3) {
        message.textContent = "Itna asaan nahi hai, boss! 😈";
    } else {
        message.textContent = "Missed again! Countdown chal rahi hai 💣";
    }
}

// Mouse cursor approaches the button: make it escape.
stopButton.addEventListener("mouseenter", moveButton);

// Also make it difficult to catch on touch screens.
stopButton.addEventListener("touchstart", function (event) {
    event.preventDefault();
    moveButton();
}, { passive: false });

// Start the five-second countdown.
countdownTimer = setInterval(function () {
    if (exploded) return;

    seconds--;

    if (seconds > 0) {
        countdownElement.textContent = seconds;
        countdownElement.classList.remove("tick");

        // Restart the number animation.
        void countdownElement.offsetWidth;
        countdownElement.classList.add("tick");
    } else {
        clearInterval(countdownTimer);
        explodeBomb();
    }
}, 1000);

function explodeBomb() {
    if (exploded) return;
    exploded = true;

    countdownElement.textContent = "0";
    stopButton.style.pointerEvents = "none";
    stopButton.style.opacity = "0";
    message.textContent = "Too late! 💥";
    loader.classList.add("explode");

    // Let the smoke effect play, then reveal the About page.
    finishTimer = setTimeout(function () {
        loader.classList.add("hide");
        aboutPage.classList.add("show");

        setTimeout(function () {
            loader.style.display = "none";
        }, 900);
    }, 3200);
}

// Safety cleanup if the page is unloaded.
window.addEventListener("pagehide", function () {
    clearInterval(countdownTimer);
    clearTimeout(finishTimer);
});
