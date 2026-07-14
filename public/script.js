"use strict";

/*
  Add this class immediately.

  CSS without JavaScript shows all content normally.
  CSS with JavaScript enables the reveal animation.
*/
document.documentElement.classList.add("js-enabled");

const currentYearElement =
  document.querySelector("#current-year");

if (currentYearElement) {
  currentYearElement.textContent =
    String(new Date().getFullYear());
}

/*
  Reveal animation
*/

const revealElements =
  document.querySelectorAll(".reveal");

function revealElement(element) {
  if (!element) return;

  element.classList.add("visible");
}

function revealElementsInViewport() {
  revealElements.forEach((element) => {
    const rectangle =
      element.getBoundingClientRect();

    const isVisible =
      rectangle.top < window.innerHeight * 0.95 &&
      rectangle.bottom > 0;

    if (isVisible) {
      revealElement(element);
    }
  });
}

if (
  "IntersectionObserver" in window &&
  revealElements.length > 0
) {
  const revealObserver =
    new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          revealElement(entry.target);
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
} else {
  revealElements.forEach((element) => {
    revealElement(element);
  });
}

/*
  Handles:
  - initial page load
  - direct links such as /#socials
  - browser back/forward hash navigation
  - layout changes after fonts load
*/

window.addEventListener(
  "load",
  revealElementsInViewport
);

window.addEventListener(
  "hashchange",
  () => {
    window.requestAnimationFrame(
      revealElementsInViewport
    );
  }
);

window.addEventListener(
  "resize",
  revealElementsInViewport
);

window.requestAnimationFrame(
  revealElementsInViewport
);

/*
  RR checker
*/

const rrForm =
  document.querySelector("#rr-form");

const submitButton =
  document.querySelector("#rr-submit");

const messageElement =
  document.querySelector("#rr-message");

const resultsElement =
  document.querySelector("#rr-results");

const rankElement =
  document.querySelector("#rank-result");

const rrElement =
  document.querySelector("#rr-result");

const recentElement =
  document.querySelector("#recent-result");

if (rrForm) {
  rrForm.addEventListener(
    "submit",
    handleRRSubmit
  );
}

async function handleRRSubmit(event) {
  event.preventDefault();

  const formData =
    new FormData(rrForm);

  const name =
    String(formData.get("name") || "").trim();

  const tag =
    String(formData.get("tag") || "").trim();

  const region =
    String(formData.get("region") || "").trim();

  if (!name || !tag || !region) {
    showError(
      "Enter a Riot name, tag, and region."
    );

    return;
  }

  setLoadingState(true);

  if (resultsElement) {
    resultsElement.hidden = true;
  }

  if (messageElement) {
    messageElement.textContent =
      "Retrieving rank information…";

    messageElement.classList.remove("error");
  }

  try {
    const parameters =
      new URLSearchParams({
        name,
        tag,
        region
      });

    const response =
      await fetch(
        `/api/stats?${parameters.toString()}`
      );

    const data =
      await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.error ||
        data?.message ||
        "Unable to retrieve rank information."
      );
    }

    displayResults(data || {});
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to retrieve rank information.";

    showError(errorMessage);
  } finally {
    setLoadingState(false);
  }
}

function setLoadingState(isLoading) {
  if (!submitButton) return;

  submitButton.disabled = isLoading;

  submitButton.textContent =
    isLoading
      ? "Checking…"
      : "Check RR";
}

function showError(message) {
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.classList.add("error");
  }

  if (resultsElement) {
    resultsElement.hidden = true;
  }
}

function displayResults(data) {
  if (rankElement) {
    rankElement.textContent =
      data.rank || "Unavailable";
  }

  if (rrElement) {
    rrElement.textContent =
      data.rr ?? "—";
  }

  if (recentElement) {
    recentElement.textContent =
      data.recentRR ?? "Unavailable";
  }

  if (messageElement) {
    messageElement.textContent = "";
    messageElement.classList.remove("error");
  }

  if (resultsElement) {
    resultsElement.hidden = false;
  }
}