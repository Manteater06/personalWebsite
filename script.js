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
let audioCtx = null;
let audioUnlocked = false;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume suspended context (browser autoplay policy)
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Unlock audio on very first user interaction
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  getAudioCtx();
  document.removeEventListener("click", unlockAudio);
  document.removeEventListener("touchstart", unlockAudio);
  document.removeEventListener("mousemove", unlockAudio);
}
document.addEventListener("click", unlockAudio);
document.addEventListener("touchstart", unlockAudio);
document.addEventListener("mousemove", unlockAudio);

function playHoverSound() {
  const ctx = getAudioCtx();
  if (ctx.state !== "running") return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(1100, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
}

function playClickSound() {
  const ctx = getAudioCtx();
  if (ctx.state !== "running") return;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = "square";
  osc1.frequency.setValueAtTime(520, ctx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.03);
  osc1.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.15);

  osc2.type = "sine";
  osc2.frequency.setValueAtTime(1040, ctx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.35, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);
  osc1.start(ctx.currentTime);
  osc2.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.2);
  osc2.stop(ctx.currentTime + 0.2);
}

// Throttle hover sounds so they don't stack up
let lastHoverTime = 0;
function throttledHoverSound() {
  const now = Date.now();
  if (now - lastHoverTime > 100) {
    lastHoverTime = now;
    playHoverSound();
  }
}

// Attach to interactive elements
const hoverTargets = document.querySelectorAll(
  ".btn, .nav-links a, .skill-tag, .project-card, .social-link, .nav-resume, .nav-logo"
);

hoverTargets.forEach((el) => {
  el.addEventListener("mouseenter", throttledHoverSound);
});

const clickTargets = document.querySelectorAll(
  ".btn, .nav-links a, .social-link, .nav-resume, .nav-toggle"
);

clickTargets.forEach((el) => {
  el.addEventListener("click", playClickSound);
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
