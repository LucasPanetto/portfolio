document.addEventListener('DOMContentLoaded', () => {

  // ===== AOS init =====
  if (window.AOS) {
    AOS.init({ duration: 700, once: true, offset: 60 });
  }

  // ===== Navbar scroll state =====
  const nav = document.getElementById('mainNav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');

    backToTop.classList.toggle('show', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  // Close mobile menu after clicking a link
  document.querySelectorAll('#navMenu .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const menu = document.getElementById('navMenu');
      if (menu.classList.contains('show')) {
        bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }
    });
  });

  // ===== Typewriter effect =====
  const roles = [
    'Design moderno.',
    'Copy que converte.',
    'Performance de verdade.',
    'Resultado mensurável.'
  ];
  const typedEl = document.querySelector('.typed-role');
  if (typedEl) {
    let roleIndex = 0, charIndex = 0, deleting = false;

    const type = () => {
      const current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        typedEl.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(type, 1400);
          return;
        }
      } else {
        charIndex--;
        typedEl.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(type, deleting ? 40 : 70);
    };
    type();
  }

  // ===== Animated counters =====
  const counters = document.querySelectorAll('.stat-number');
  let countersStarted = false;

  const animateCounters = () => {
    if (countersStarted) return;
    countersStarted = true;
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.count, 10);
      const duration = 1400;
      const startTime = performance.now();

      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else counter.textContent = target;
      };
      requestAnimationFrame(step);
    });
  };

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) animateCounters();
      });
    }, { threshold: 0.4 });
    observer.observe(heroStats);
  }

  // ===== Portfolio cards: open modal via keyboard too =====
  document.querySelectorAll('.portfolio-card[data-bs-toggle="modal"]').forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // ===== Back to top =====
  const backToTop = document.getElementById('backToTop');
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===== Contact form (front-end only) =====
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Mensagem enviada!';
      btn.disabled = true;
      form.reset();
      setTimeout(() => {
        btn.innerHTML = original;
        btn.disabled = false;
      }, 3000);
    });
  }

  // ===== Footer year =====
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
