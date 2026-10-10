document.addEventListener('DOMContentLoaded', () => {

  const WHATSAPP_NUMBER = '5527988861917';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== Analytics events (no-op if gtag is blocked) =====
  const track = (event, params) => {
    if (typeof window.gtag === 'function') window.gtag('event', event, params);
  };

  // ===== Mobile menu: hamburger morph + staggered overlay =====
  const burger = document.getElementById('burger');
  const overlay = document.getElementById('menuOverlay');

  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      overlay.hidden = false;
      void overlay.offsetHeight; // commit the hidden→visible state so the transition runs
      overlay.classList.add('open');
      overlay.querySelector('a').focus({ preventScroll: true });
    } else {
      overlay.classList.remove('open');
      setTimeout(() => { if (!overlay.classList.contains('open')) overlay.hidden = true; }, reduceMotion ? 0 : 500);
    }
  };

  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  overlay.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      burger.focus();
    }
  });

  // ===== Scroll entry (IntersectionObserver, no scroll listeners) =====
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealEls.forEach((el) => io.observe(el));
  }

  // ===== Mobile CTA island: visible after the hero, hidden over the contact form =====
  const mobileCta = document.getElementById('mobileCta');
  const state = { heroVisible: true, contactVisible: false };
  const syncCta = () => mobileCta.classList.toggle('show', !state.heroVisible && !state.contactVisible);
  if ('IntersectionObserver' in window) {
    const ctaIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target.id === 'topo') state.heroVisible = entry.isIntersecting;
        if (entry.target.id === 'contato') state.contactVisible = entry.isIntersecting;
      });
      syncCta();
    }, { rootMargin: '-80px 0px 0px 0px' });
    ctaIo.observe(document.getElementById('topo'));
    ctaIo.observe(document.getElementById('contato'));
  }

  // ===== Project galleries (native <dialog>) =====
  const galleries = {
    chale: {
      title: 'Chalé Entardecer',
      images: [
        ['chale-shot-1.jpg', 'Topo da página, com a fachada ao pôr do sol'],
        ['chale-shot-2.jpg', 'Seção sobre o chalé'],
        ['chale-shot-3.jpg', 'O que muda no fim de semana'],
        ['chale-shot-4.jpg', 'Depoimentos de hóspedes'],
        ['chale-shot-5.jpg', 'Consulta de datas e reserva'],
      ],
    },
    formattec: {
      title: 'Formattec Formaturas',
      images: [
        ['formattec-shot-1.jpg', 'Topo do site'],
        ['formattec-shot-2.jpg', 'Serviços'],
        ['formattec-shot-3.jpg', 'Galeria de eventos'],
        ['formattec-shot-4.jpg', 'Depoimentos'],
        ['formattec-shot-5.jpg', 'Pedido de orçamento'],
      ],
    },
    app: {
      title: 'Formattec App',
      images: [
        ['formattecapp-shot-1.jpg', 'Progresso das turmas e cadeados'],
        ['formattecapp-shot-2.jpg', 'Missão final e experiência desbloqueada'],
      ],
    },
  };

  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbTitle = document.getElementById('lightboxTitle');
  const lbCount = document.getElementById('lightboxCount');
  let current = { key: null, index: 0, opener: null };

  const render = () => {
    const g = galleries[current.key];
    const [file, alt] = g.images[current.index];
    lbImg.src = `../assets/projects/${file}`;
    lbImg.alt = `${g.title}: ${alt}`;
    lbTitle.textContent = g.title;
    lbCount.textContent = `${current.index + 1} / ${g.images.length}`;
  };

  const step = (delta) => {
    const total = galleries[current.key].images.length;
    current.index = (current.index + delta + total) % total;
    render();
  };

  document.querySelectorAll('[data-gallery]').forEach((btn) => {
    btn.addEventListener('click', () => {
      current = { key: btn.dataset.gallery, index: Number(btn.dataset.index) || 0, opener: btn };
      render();
      lightbox.showModal();
      track('view_gallery', { project: btn.dataset.gallery });
    });
  });

  document.getElementById('lightboxPrev').addEventListener('click', () => step(-1));
  document.getElementById('lightboxNext').addEventListener('click', () => step(1));
  document.getElementById('lightboxClose').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener('close', () => current.opener?.focus());

  // ===== Lead form: opens WhatsApp with a pre-filled message =====
  const form = document.getElementById('leadForm');
  const nameInput = document.getElementById('leadName');
  const nameError = document.getElementById('leadNameError');

  const setNameError = (show) => {
    nameError.hidden = !show;
    nameInput.setAttribute('aria-invalid', String(show));
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (!name) {
      setNameError(true);
      nameInput.focus();
      return;
    }
    setNameError(false);

    const type = document.getElementById('leadType').value;
    const details = document.getElementById('leadMsg').value.trim();

    let text = `Olá, Lucas! Sou ${name} e vi seu portfólio.\nPreciso de: ${type}.`;
    if (details) text += `\nSobre o projeto: ${details}`;

    // Only the project type goes to Analytics — never the name or message
    track('generate_lead', { method: 'whatsapp_form', project_type: type });
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });

  nameInput.addEventListener('input', () => {
    if (nameInput.value.trim()) setNameError(false);
  });

  document.querySelectorAll('a[href^="https://wa.me"]').forEach((link) => {
    link.addEventListener('click', () => track('whatsapp_click', { location: 'contact_section' }));
  });

  // ===== Footer year =====
  document.getElementById('year').textContent = new Date().getFullYear();
});
