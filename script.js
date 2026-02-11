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

// --- Synthwave UI Sounds (generated WAV blobs) ---
// Pre-generates multiple sound variants for natural feel.
const SynthSound = (() => {
  const hoverUrls = [];
  const clickUrls = [];
  let lastHover = 0;
  let ready = false;

  function buildWav(duration, sampleRate, generator) {
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const v = new DataView(buffer);
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

  function init() {
    if (ready) return;
    ready = true;

    // Generate 5 hover variants with different pitches
    const hoverPitches = [520, 580, 640, 700, 760];
    hoverPitches.forEach((hz) => {
      hoverUrls.push(buildWav(0.45, 22050, (t, dur) => {
        const env = Math.sin(Math.PI * t / dur);
        const wave = Math.sin(2 * Math.PI * hz * t) * 0.4
                   + Math.sin(2 * Math.PI * (hz + 1.5) * t) * 0.3
                   + Math.sin(2 * Math.PI * (hz * 0.5) * t) * 0.15;
        return wave * env * 0.06;
      }));
    });

    // Generate 5 click variants with different chords
    const clickChords = [
      [330, 495, 660],
      [370, 555, 740],
      [415, 622, 830],
      [350, 525, 700],
      [392, 588, 784],
    ];
    clickChords.forEach(([r, f, o]) => {
      clickUrls.push(buildWav(0.6, 22050, (t, dur) => {
        const env = t < 0.015 ? t / 0.015 : Math.pow(1 - (t - 0.015) / (dur - 0.015), 1.5);
        const wave = Math.sin(2 * Math.PI * r * t) * 0.35
                   + Math.sin(2 * Math.PI * (r + 1.2) * t) * 0.2
                   + Math.sin(2 * Math.PI * f * t) * 0.2
                   + Math.sin(2 * Math.PI * o * t) * 0.12;
        return wave * env * 0.07;
      }));
    });
  }

  function play(urls) {
    try {
      const url = urls[Math.floor(Math.random() * urls.length)];
      const a = new Audio(url);
      a.volume = 0.8;
      a.play();
    } catch (e) { /* unsupported */ }
  }

  function hover() {
    const now = Date.now();
    if (now - lastHover < 130) return;
    lastHover = now;
    init();
    play(hoverUrls);
  }

  function click() {
    init();
    play(clickUrls);
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
