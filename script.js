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

// --- Synthwave UI Sounds (generated WAV blobs — no WebAudio API) ---
// Generates actual audio files in memory so playback is bulletproof.
const SynthSound = (() => {
  let hoverUrl = null;
  let clickUrl = null;
  let lastHover = 0;

  // Build a 16-bit mono WAV from sample generator function
  function buildWav(duration, sampleRate, generator) {
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const v = new DataView(buffer);

    // WAV header
    const s = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
    s(0, "RIFF");
    v.setUint32(4, 36 + numSamples * 2, true);
    s(8, "WAVE");
    s(12, "fmt ");
    v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);
    v.setUint16(22, 1, true);
    v.setUint32(24, sampleRate, true);
    v.setUint32(28, sampleRate * 2, true);
    v.setUint16(32, 2, true);
    v.setUint16(34, 16, true);
    s(36, "data");
    v.setUint32(40, numSamples * 2, true);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const sample = Math.max(-1, Math.min(1, generator(t, duration)));
      v.setInt16(44 + i * 2, sample * 32767, true);
    }

    return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
  }

  // Hover: soft low hum that swells and fades (not a beep)
  function makeHoverSound() {
    return buildWav(0.25, 22050, (t, dur) => {
      // Gentle envelope: fade in then fade out
      const env = Math.sin(Math.PI * t / dur);
      // Low warm sine + even lower sub
      const wave = Math.sin(2 * Math.PI * 220 * t) * 0.5
                 + Math.sin(2 * Math.PI * 221.5 * t) * 0.3
                 + Math.sin(2 * Math.PI * 110 * t) * 0.2;
      return wave * env * 0.08;
    });
  }

  // Click: deeper synth pad chord that hums and fades
  function makeClickSound() {
    return buildWav(0.4, 22050, (t, dur) => {
      // Quick attack, slow fade
      const env = t < 0.02 ? t / 0.02 : Math.pow(1 - (t - 0.02) / (dur - 0.02), 2);
      // Rich warm chord: root + fifth + octave, all low
      const wave = Math.sin(2 * Math.PI * 165 * t) * 0.4
                 + Math.sin(2 * Math.PI * 165.8 * t) * 0.25
                 + Math.sin(2 * Math.PI * 247 * t) * 0.2
                 + Math.sin(2 * Math.PI * 330 * t) * 0.15;
      return wave * env * 0.1;
    });
  }

  function init() {
    if (!hoverUrl) hoverUrl = makeHoverSound();
    if (!clickUrl) clickUrl = makeClickSound();
  }

  function play(url) {
    try {
      const a = new Audio(url);
      a.volume = 1.0;
      a.play();
    } catch (e) { /* unsupported */ }
  }

  function hover() {
    const now = Date.now();
    if (now - lastHover < 150) return;
    lastHover = now;
    init();
    play(hoverUrl);
  }

  function click() {
    init();
    play(clickUrl);
  }

  return { hover, click };
})();

// Attach sounds via event delegation
document.addEventListener("mouseover", (e) => {
  if (e.target.closest(".btn, .nav-links a, .skill-tag, .project-card, .social-link, .nav-resume, .nav-logo, .nav-toggle")) {
    SynthSound.hover();
  }
});

document.addEventListener("click", (e) => {
  if (e.target.closest(".btn, .nav-links a, .social-link, .nav-resume, .nav-toggle, .skill-tag")) {
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
