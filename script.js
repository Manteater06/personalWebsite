/* ========================================
   CYBERPUNK PERSONAL WEBSITE — SCRIPTS
   ======================================== */

// --- Typewriter Effect ---
const typewriterEl = document.getElementById("typewriter");
const phrases = [
  "Software Developer",
  "Electronics Enthusiast",
  "Robotics Tinkerer",
  "Problem Solver",
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typewrite() {
  const current = phrases[phraseIndex];

  if (isDeleting) {
    typewriterEl.textContent = current.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typewriterEl.textContent = current.substring(0, charIndex + 1);
    charIndex++;
  }

  let delay = isDeleting ? 40 : 80;

  if (!isDeleting && charIndex === current.length) {
    delay = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    delay = 400;
  }

  setTimeout(typewrite, delay);
}

typewrite();

// --- Navigation scroll effect ---
const nav = document.getElementById("nav");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});

// --- Mobile nav toggle ---
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");

navToggle.addEventListener("click", () => {
  navToggle.classList.toggle("active");
  navLinks.classList.toggle("open");
});

// Close mobile nav when a link is clicked
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navToggle.classList.remove("active");
    navLinks.classList.remove("open");
  });
});

// --- Scroll reveal animations ---
function addRevealClasses() {
  const targets = document.querySelectorAll(
    ".about-text, .about-terminal, .skill-category, .project-card, .contact-container"
  );
  targets.forEach((el) => el.classList.add("reveal"));
}

addRevealClasses();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".reveal").forEach((el) => {
  revealObserver.observe(el);
});

// --- Stat counter animation ---
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute("data-target"), 10);
        animateCounter(el, target);
        statObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll(".stat-number").forEach((el) => {
  statObserver.observe(el);
});

function animateCounter(el, target) {
  let current = 0;
  const increment = Math.max(1, Math.floor(target / 30));
  const interval = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    el.textContent = current;
  }, 40);
}

// --- Synthwave UI Sounds (Web Audio API) ---
// AudioContext is created lazily and resumed on every play attempt.
// No separate "unlock" step needed — we resume inside each play call.
const SynthSound = (() => {
  let ctx = null;
  let lastHover = 0;

  function ensureCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }

  function hover() {
    const now = Date.now();
    if (now - lastHover < 120) return;
    lastHover = now;

    try {
      const c = ensureCtx();
      const t = c.currentTime;

      // Warm, soft sine pad blip — like a synth key tap
      const osc1 = c.createOscillator();
      const osc2 = c.createOscillator();
      const gain = c.createGain();
      const filter = c.createBiquadFilter();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(680, t);
      osc1.frequency.linearRampToValueAtTime(720, t + 0.15);

      // Slight detune for warm analog feel
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(684, t);
      osc2.frequency.linearRampToValueAtTime(724, t + 0.15);

      // Low-pass filter to keep it soft
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
      gain.gain.linearRampToValueAtTime(0, t + 0.18);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(c.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.2);
      osc2.stop(t + 0.2);
    } catch (e) {
      // silently fail if Web Audio is unsupported
    }
  }

  function click() {
    try {
      const c = ensureCtx();
      const t = c.currentTime;

      const osc1 = c.createOscillator();
      const osc2 = c.createOscillator();
      const gain = c.createGain();
      const filter = c.createBiquadFilter();

      // Warm sine chord — like pressing a synth key
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(440, t);
      osc1.frequency.linearRampToValueAtTime(480, t + 0.25);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(660, t);
      osc2.frequency.linearRampToValueAtTime(620, t + 0.25);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1500, t);
      filter.frequency.linearRampToValueAtTime(600, t + 0.3);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.015);
      gain.gain.linearRampToValueAtTime(0, t + 0.3);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(c.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.35);
      osc2.stop(t + 0.35);
    } catch (e) {
      // silently fail
    }
  }

  return { hover, click };
})();

// Attach sounds using event delegation on the whole document
// This way even dynamically added elements get sounds
document.addEventListener("mouseover", (e) => {
  if (
    e.target.closest(
      ".btn, .nav-links a, .skill-tag, .project-card, .social-link, .nav-resume, .nav-logo, .nav-toggle"
    )
  ) {
    SynthSound.hover();
  }
});

document.addEventListener("click", (e) => {
  if (
    e.target.closest(
      ".btn, .nav-links a, .social-link, .nav-resume, .nav-toggle, .skill-tag"
    )
  ) {
    SynthSound.click();
  }
});

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const targetId = anchor.getAttribute("href");
    if (targetId === "#") return;
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: "smooth" });
    }
  });
});
