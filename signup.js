
const intro = document.getElementById("intro");
const helicopter = document.getElementById("helicopter");
const clickMe = document.getElementById("clickMe");
const flash = document.getElementById("flash");
const smoke = document.getElementById("smoke");
const signupPanel = document.getElementById("signupPanel");

let started = false;

function startExperience() {
  if (started) return;
  started = true;

  clickMe.disabled = true;

  // Helicopter crash animation
  intro.classList.add("crashing");

  // Crash flash
  setTimeout(() => {
    flash.classList.remove("active");
    void flash.offsetWidth;
    flash.classList.add("active");
  }, 650);

  // Smoke fills the screen
  setTimeout(() => {
    smoke.classList.add("active");
  }, 700);

  // Hide intro after crash
  setTimeout(() => {
    intro.style.display = "none";
  }, 1500);

  // Reveal Create Account after smoke begins clearing
  setTimeout(() => {
    signupPanel.classList.add("show");
  }, 3200);

  // Allow scrolling on smaller screens
  setTimeout(() => {
    document.body.style.overflowY = "auto";
  }, 3200);
}

clickMe.addEventListener("click", startExperience);
helicopter.addEventListener("click", startExperience);

// Show / hide password
document.querySelectorAll(".show-password").forEach(button => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.target);

    if (input.type === "password") {
      input.type = "text";
      button.textContent = "HIDE";
    } else {
      input.type = "password";
      button.textContent = "SHOW";
    }
  });
});

// Front-end form demo: does not create a real account
const signupForm = document.getElementById("signupForm");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const message = document.getElementById("message");

signupForm.addEventListener("submit", event => {
  event.preventDefault();
  message.textContent = "";

  if (password.value !== confirmPassword.value) {
    message.textContent = "Your passwords do not match.";
    confirmPassword.focus();
    return;
  }

  message.textContent =
    "Your form is ready! Connect an authentication service to create a real account.";
});
