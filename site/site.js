// Reveal sections as they scroll into view
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
// anything already on screen shows at once (also covers browsers without IntersectionObserver quirks)
requestAnimationFrame(() => document.querySelectorAll('.hero .reveal').forEach((el) => el.classList.add('in')));

// Hero TV: cycle through screenshots
const shots = [...document.querySelectorAll('#hero-screen img')];
let cur = 0;
if (shots.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setInterval(() => {
    shots[cur].classList.remove('on');
    cur = (cur + 1) % shots.length;
    shots[cur].classList.add('on');
  }, 4200);
}

// Install tabs
const tabs = [...document.querySelectorAll('.tabs button')];
tabs.forEach((t) => t.addEventListener('click', () => {
  tabs.forEach((x) => x.setAttribute('aria-selected', String(x === t)));
  document.querySelectorAll('[data-panel]').forEach((p) => {
    const show = p.dataset.panel === t.dataset.tab;
    p.hidden = !show;
    if (show) p.classList.add('in');
  });
}));

// Copy buttons
document.querySelectorAll('.copy').forEach((b) => b.addEventListener('click', async () => {
  const text = b.parentElement.querySelector('code').innerText;
  try {
    await navigator.clipboard.writeText(text);
    b.textContent = 'Copied';
  } catch {
    b.textContent = 'Select & copy';
  }
  setTimeout(() => { b.textContent = 'Copy'; }, 1600);
}));
