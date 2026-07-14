"use strict";
document.documentElement.classList.add("js-enabled");

const rrForm = document.querySelector("#rr-form");
const submitButton = document.querySelector("#rr-submit");
const messageElement = document.querySelector("#rr-message");
const resultsElement = document.querySelector("#rr-results");

const rankElement = document.querySelector("#rank-result");
const rrElement = document.querySelector("#rr-result");
const recentElement = document.querySelector("#recent-result");

const yearElement = document.querySelector("#current-year");

yearElement.textContent = new Date().getFullYear();

rrForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(rrForm);

  const name = formData.get("name")?.trim();
  const tag = formData.get("tag")?.trim();
  const region = formData.get("region")?.trim();

  clearResults();

  if (!name || !tag || !region) {
    showError("Enter a Riot name, tag, and region.");
    return;
  }

  setLoading(true);

  const searchParameters = new URLSearchParams({
    name,
    tag,
    region
  });

  try {
    const response = await fetch(
      `/api/stats?${searchParameters.toString()}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to retrieve rank information."
      );
    }

    displayResults(data);
  } catch (error) {
    console.error("RR lookup error:", error);

    showError(
      error.message ||
      "The rank service is currently unavailable. Try again shortly."
    );
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Checking…" : "Check RR";

  if (isLoading) {
    messageElement.classList.remove("error");
    messageElement.textContent = "Retrieving rank information…";
  }
}

function clearResults() {
  resultsElement.hidden = true;

  messageElement.textContent = "";
  messageElement.classList.remove("error");

  rankElement.textContent = "—";
  rrElement.textContent = "—";
  recentElement.textContent = "—";
}

function showError(message) {
  resultsElement.hidden = true;

  messageElement.textContent = message;
  messageElement.classList.add("error");
}

function displayResults(data) {
  rankElement.textContent = data.rank || "Unavailable";
  rrElement.textContent = data.rr ?? "—";
  recentElement.textContent = data.recentRR ?? "Unavailable";

  messageElement.textContent = "";
  messageElement.classList.remove("error");

  resultsElement.hidden = false;
}

const revealElements = document.querySelectorAll(".reveal");

function revealVisibleElements() {
  revealElements.forEach((element) => {
    const rectangle = element.getBoundingClientRect();

    if (
      rectangle.top < window.innerHeight * 0.95 &&
      rectangle.bottom > 0
    ) {
      element.classList.add("visible");
    }
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.05,
      rootMargin: "0px 0px 80px 0px"
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });

  window.addEventListener("load", revealVisibleElements);
  window.addEventListener("hashchange", revealVisibleElements);

  requestAnimationFrame(revealVisibleElements);
} else {
  revealElements.forEach((element) => {
    element.classList.add("visible");
  });
}