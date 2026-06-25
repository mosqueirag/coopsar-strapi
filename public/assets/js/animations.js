const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function applyStagger(container) {
  [...container.children].forEach((child, index) => {
    child.style.setProperty("--stagger-index", index);
  });
}

function markAnimatedElements(root = document) {
  const sectionSelectors = [
    ".section",
    ".page-section",
    ".page-hero .container",
    ".hero-content",
    ".hero-card",
    ".section-heading",
    ".status-card",
    ".map-placeholder",
    ".form-card",
  ];

  root.querySelectorAll(sectionSelectors.join(",")).forEach((node) => {
    node.classList.add("slide-up");
  });

  root.querySelectorAll(".quick-grid, .services-grid, .news-grid, .grid-2, .grid-3, .steps, .channels-grid, .alert-list, .faq-list").forEach((node) => {
    node.classList.add("stagger");
    applyStagger(node);
  });

  root.querySelectorAll(".quick-card, .card, .news-card, .contact-card, .step-card, .alert-banner, .status-card, .form-card").forEach((node) => {
    node.classList.add("animated-card", "slide-up");
  });

  root.querySelectorAll(".hero-card, .service-image").forEach((node) => {
    node.classList.add("floating");
  });

  const statusDot = root.querySelector(".status-dot");
  if (statusDot) statusDot.classList.add("soft-pulse");
}

function setupRevealObserver() {
  const revealItems = document.querySelectorAll(".fade-in, .slide-up");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
  );

  revealItems.forEach((item) => observer.observe(item));
}

function setupHeaderMotion() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupDismissibleAlerts(root = document) {
  root.querySelectorAll(".alert-banner").forEach((alert) => {
    if (alert.querySelector(".close-alert")) return;

    const text = alert.textContent.toLowerCase();
    if (text.includes("urgente") || text.includes("corte") || text.includes("importante")) {
      alert.classList.add("is-urgent");
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "close-alert";
    button.setAttribute("aria-label", "Cerrar alerta");
    button.textContent = "×";
    button.addEventListener("click", () => {
      alert.style.opacity = "0";
      alert.style.transform = "translateY(-6px)";
      setTimeout(() => alert.remove(), prefersReducedMotion ? 0 : 180);
    });
    alert.appendChild(button);
  });
}

function setupFormMotion() {
  document.querySelectorAll("[data-contact-form], [data-newsletter]").forEach((form) => {
    form.addEventListener("submit", () => {
      const submit = form.querySelector("button[type='submit']");
      const message = form.querySelector(".form-message") || form.nextElementSibling;

      form.querySelectorAll("input, textarea").forEach((input) => {
        input.classList.toggle("is-invalid", !input.checkValidity());
      });

      if (submit) {
        submit.classList.add("is-loading");
        setTimeout(() => submit.classList.remove("is-loading"), prefersReducedMotion ? 0 : 520);
      }

      if (message) {
        message.classList.remove("is-visible");
        requestAnimationFrame(() => message.classList.add("is-visible"));
      }
    });

    form.querySelectorAll("input, textarea").forEach((input) => {
      input.addEventListener("input", () => {
        if (input.checkValidity()) input.classList.remove("is-invalid");
      });
    });
  });
}

export function refreshAnimations(root = document) {
  markAnimatedElements(root);
  setupDismissibleAlerts(root);
  setupRevealObserver();
}

export function initAnimations() {
  markAnimatedElements();
  setupHeaderMotion();
  setupDismissibleAlerts();
  setupFormMotion();
  setupRevealObserver();
}
