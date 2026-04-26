const STORAGE_KEY = "avvalin-language";
const DEFAULT_LANGUAGE = "ru";
const SUPPORTED_LANGUAGES = new Set(["ru", "tj"]);

const DEFAULT_META = {
  ru: {
    title: "Avvalin — химчистка ковров и мебели в Панджакенте",
    description:
      "Avvalin — профессиональная химчистка ковров, мягкой мебели, одеял, курпача и штор в Панджакенте.",
  },
  tj: {
    title: "Avvalin — кимиёшӯйии қолин ва мебел дар Панҷакент",
    description:
      "Avvalin — кимиёшӯйии касбии қолинҳо, мебели мулоим, кӯрпа, курпача ва пардаҳо дар Панҷакент.",
  },
};

const getPageMeta = (language) => {
  const body = document.body;
  const titleKey = language === "ru" ? "titleRu" : "titleTj";
  const descriptionKey = language === "ru" ? "descriptionRu" : "descriptionTj";

  return {
    title: body?.dataset[titleKey] || DEFAULT_META[language].title,
    description: body?.dataset[descriptionKey] || DEFAULT_META[language].description,
  };
};

const getWhatsAppNumber = () => document.body?.dataset.whatsappNumber || "992920102222";

const getCurrentLanguage = () => {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return SUPPORTED_LANGUAGES.has(stored) ? stored : DEFAULT_LANGUAGE;
};

const updateNodeText = (language) => {
  document.querySelectorAll("[data-ru][data-tj]").forEach((element) => {
    const value = element.dataset[language];

    if (!value) {
      return;
    }

    element.textContent = value;
  });

  document.querySelectorAll("[data-placeholder-ru][data-placeholder-tj]").forEach((element) => {
    const value = element.dataset[language === "ru" ? "placeholderRu" : "placeholderTj"];

    if (value) {
      element.setAttribute("placeholder", value);
    }
  });

  document.querySelectorAll("[data-alt-ru][data-alt-tj]").forEach((element) => {
    const value = element.dataset[language === "ru" ? "altRu" : "altTj"];

    if (value) {
      element.setAttribute("alt", value);
    }
  });

  document.querySelectorAll("[data-aria-ru][data-aria-tj]").forEach((element) => {
    const value = element.dataset[language === "ru" ? "ariaRu" : "ariaTj"];

    if (value) {
      element.setAttribute("aria-label", value);
    }
  });
};

const updateLanguageButtons = (language) => {
  document.querySelectorAll("[data-lang-button]").forEach((button) => {
    const active = button.dataset.langButton === language;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
};

const updateProcessSummary = (language) => {
  const currentStep =
    document.querySelector(".process-step.is-active") || document.querySelector(".process-step");
  const summary = document.querySelector("[data-process-summary]");

  if (!currentStep || !summary) {
    return;
  }

  summary.textContent =
    currentStep.dataset[language === "ru" ? "summaryRu" : "summaryTj"] || summary.textContent;
};

const updateMeta = (language) => {
  const content = getPageMeta(language);
  const description = document.querySelector('meta[name="description"]');

  if (!content) {
    return;
  }

  document.title = content.title;

  if (description) {
    description.setAttribute("content", content.description);
  }
};

const applyLanguage = (language) => {
  updateNodeText(language);
  updateLanguageButtons(language);
  updateProcessSummary(language);
  updateMeta(language);
  document.documentElement.lang = language === "tj" ? "tg" : "ru";
  document.body.dataset.language = language;
  window.localStorage.setItem(STORAGE_KEY, language);
};

const initLanguage = () => {
  const initialLanguage = getCurrentLanguage();

  document.querySelectorAll("[data-lang-button]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextLanguage = button.dataset.langButton;

      if (SUPPORTED_LANGUAGES.has(nextLanguage)) {
        applyLanguage(nextLanguage);
      }
    });
  });

  applyLanguage(initialLanguage);
};

const initMobileMenu = () => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  const backdrop = document.querySelector("[data-menu-backdrop]");
  const closeBtn = document.querySelector("[data-menu-close]");
  const links = document.querySelectorAll("[data-menu-link]");

  if (!toggle || !menu) {
    return;
  }

  const setMenuState = (open) => {
    toggle.classList.toggle("is-open", open);
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
  };

  toggle.addEventListener("click", () => {
    setMenuState(!menu.classList.contains("is-open"));
  });

  if (backdrop) {
    backdrop.addEventListener("click", () => setMenuState(false));
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => setMenuState(false));
  }

  links.forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      setMenuState(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 900) {
      setMenuState(false);
    }
  });
};

const initHeaderScroll = () => {
  const header = document.querySelector("[data-header]");

  if (!header) {
    return;
  }

  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateHeader = () => {
    const currentScrollY = window.scrollY;

    header.classList.toggle("is-top", currentScrollY < 80);

    if (currentScrollY < 80) {
      header.classList.remove("is-hidden");
    } else if (currentScrollY > lastScrollY) {
      header.classList.add("is-hidden");
    } else {
      header.classList.remove("is-hidden");
    }

    lastScrollY = currentScrollY;
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateHeader();
};

const initWipeSection = () => {
  const section = document.querySelector("[data-wipe-section]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!section || reducedMotion) {
    return;
  }

  let isActive = false;
  let ticking = false;

  const updateProgress = () => {
    const rect = section.getBoundingClientRect();
    const total = Math.max(section.offsetHeight - window.innerHeight, 1);
    const passed = Math.min(Math.max(-rect.top, 0), total);
    const progress = Math.min(Math.max(passed / total, 0), 1);
    const diagonal = 12;
    const value = `${progress * (100 + diagonal)}%`;

    document.documentElement.style.setProperty("--wipe-progress", value);
    ticking = false;
  };

  const onScroll = () => {
    if (!isActive || ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(updateProgress);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isActive = entry.isIntersecting;

        if (isActive) {
          onScroll();
        }
      });
    },
    { threshold: 0 }
  );

  observer.observe(section);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateProgress();
};

const initProcessSection = () => {
  const steps = Array.from(document.querySelectorAll(".process-step"));
  const numberNode = document.querySelector("[data-process-number]");
  const summaryNode = document.querySelector("[data-process-summary]");
  const figures = Array.from(document.querySelectorAll("[data-process-figure]"));

  if (!steps.length || !numberNode || !summaryNode || !figures.length) {
    return;
  }

  const setActiveStep = (step) => {
    const language = document.body.dataset.language || DEFAULT_LANGUAGE;
    const stepId = step.dataset.step || "01";

    steps.forEach((item) => item.classList.toggle("is-active", item === step));
    figures.forEach((figure) => {
      figure.classList.toggle("is-active", figure.dataset.processFigure === stepId);
    });

    numberNode.textContent = stepId;
    summaryNode.textContent = step.dataset[language === "ru" ? "summaryRu" : "summaryTj"] || "";
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) {
        setActiveStep(visible.target);
      }
    },
    {
      threshold: [0.35, 0.6, 0.85],
      rootMargin: "-18% 0px -24% 0px",
    }
  );

  steps.forEach((step) => observer.observe(step));
  setActiveStep(steps[0]);
};

const initRequestForm = () => {
  const form = document.querySelector("[data-request-form]");

  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const serviceField = form.querySelector('select[name="service"]');
    const service =
      serviceField instanceof HTMLSelectElement
        ? serviceField.options[serviceField.selectedIndex]?.textContent?.trim() || ""
        : String(formData.get("service") || "").trim();
    const comment = String(formData.get("comment") || "").trim();
    const whatsappNumber = form.dataset.whatsappNumber || getWhatsAppNumber();

    const text = `Здравствуйте! Меня зовут ${name}. Телефон: ${phone}. Услуга: ${service}. ${
      comment || ""
    }`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });
};

const initFloatingWhatsApp = () => {
  const floatingButton = document.querySelector("[data-floating-wa]");
  const requestSection = document.querySelector("#request");

  if (!floatingButton || !requestSection) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        floatingButton.classList.toggle("is-hidden", entry.isIntersecting);
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(requestSection);
};

document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
  initMobileMenu();
  initHeaderScroll();
  initWipeSection();
  initProcessSection();
  initRequestForm();
  initFloatingWhatsApp();
});
