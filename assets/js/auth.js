const AUTH_KEY = "chumbi_auth";
const USER_KEY = "chumbi_user";

const setAuth = (email) => {
  localStorage.setItem(AUTH_KEY, "true");
  if (email) {
    localStorage.setItem(USER_KEY, email);
  }
};

const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
};

const isAuthed = () => localStorage.getItem(AUTH_KEY) === "true";
const getUser = () => localStorage.getItem(USER_KEY);

const handleForm = (form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailInput = form.querySelector("input[name='email']");
    const emailValue = emailInput ? emailInput.value.trim() : "";
    setAuth(emailValue || "miembro@chumbi.digital");
    form.reset();
    window.location.href = "../exclusive/index.html";
  });
};

const handleLogout = (button) => {
  button.addEventListener("click", () => {
    clearAuth();
    window.location.href = "../auth/login.html";
  });
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-auth-form]").forEach((form) => {
    handleForm(form);
  });

  document.querySelectorAll("[data-auth-logout]").forEach((button) => {
    handleLogout(button);
  });

  if (document.body.dataset.page === "exclusive") {
    const locked = document.querySelector("[data-auth-locked]");
    const unlocked = document.querySelector("[data-auth-unlocked]");
    const username = document.querySelector("[data-auth-username]");

    if (isAuthed()) {
      if (locked) {
        locked.classList.add("is-hidden");
      }
      if (unlocked) {
        unlocked.classList.remove("is-hidden");
      }
      if (username) {
        username.textContent = getUser() || "miembro";
      }
    } else {
      if (locked) {
        locked.classList.remove("is-hidden");
      }
      if (unlocked) {
        unlocked.classList.add("is-hidden");
      }
    }
  }
});
