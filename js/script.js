document.addEventListener('DOMContentLoaded', () => {

  const WHATSAPP_NUMBER = '5527988861917';

  // ===== AOS init =====
  if (window.AOS) {
    AOS.init({ duration: 700, once: true, offset: 60 });
  }

  // ===== Navbar scroll state + mobile CTA bar =====
  const nav = document.getElementById('mainNav');
  const mobileCta = document.getElementById('mobileCta');
  const hero = document.getElementById('top');
  const offer = document.getElementById('orcamento');

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);

    // The sticky bar shows after the hero and hides once the offer/form is on screen
    const pastHero = window.scrollY > hero.offsetHeight - 120;
    const offerTop = offer.getBoundingClientRect().top;
    const atOffer = offerTop < window.innerHeight && offer.getBoundingClientRect().bottom > 0;
    mobileCta.classList.toggle('show', pastHero && !atOffer);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Close mobile menu after clicking a link
  document.querySelectorAll('#navMenu .nav-link, #navMenu .btn').forEach(link => {
    link.addEventListener('click', () => {
      const menu = document.getElementById('navMenu');
      if (menu.classList.contains('show')) {
        bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }
    });
  });

  // ===== Lead form: opens WhatsApp with a pre-filled message =====
  const form = document.getElementById('leadForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = form.querySelector('#leadName');
      const name = nameInput.value.trim();
      if (!name) {
        nameInput.classList.add('is-invalid');
        nameInput.focus();
        return;
      }
      nameInput.classList.remove('is-invalid');

      const type = form.querySelector('#leadType').value;
      const details = form.querySelector('#leadMsg').value.trim();

      let text = `Olá, Lucas! Sou ${name} e vi seu portfólio.\nPreciso de: ${type}.`;
      if (details) text += `\nSobre o projeto: ${details}`;

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    });

    form.querySelector('#leadName').addEventListener('input', (e) => {
      e.target.classList.remove('is-invalid');
    });
  }

  // ===== Footer year =====
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
