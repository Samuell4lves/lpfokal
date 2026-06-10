/* ============================================================
   FOKAL COMPANY — Interações
   Vanilla JS, sem dependências. Pronto pra receber GSAP depois.
   ============================================================ */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Navbar: estado ao rolar + barra de progresso ---------- */
  const nav = document.getElementById("nav");
  const navProgress = document.getElementById("navProgress");
  const onScroll = () => {
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
    if (navProgress) {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      navProgress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 2. Menu mobile ---------- */
  const burger = document.getElementById("burger");
  const navMobile = document.getElementById("navMobile");
  burger.addEventListener("click", () => {
    const open = navMobile.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    navMobile.setAttribute("aria-hidden", String(!open));
  });
  navMobile.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navMobile.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- 3. Scroll reveal (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (prefersReduced) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- 4. Contadores animados ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const prefix = el.dataset.prefix || "";
    if (prefersReduced) {
      el.textContent = prefix + target;
      return;
    }
    const duration = 2200;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = prefix + Math.round(eased * target);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => counterIO.observe(el));

  /* ---------- 5. Cursor focal (apenas pointer fino) ---------- */
  const cursor = document.querySelector(".focal-cursor");
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (cursor && finePointer && !prefersReduced) {
    let x = 0, y = 0, cx = 0, cy = 0;
    document.addEventListener("mousemove", (e) => {
      x = e.clientX; y = e.clientY;
      cursor.classList.add("is-active");
    });
    document.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
    const loop = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    const hoverTargets = document.querySelectorAll("a, button, .pain, .svc, .step, .faq__item summary");
    hoverTargets.forEach((t) => {
      t.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      t.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  /* ---------- 6. Spotlight que segue o mouse nos cards ---------- */
  if (!prefersReduced) {
    document.querySelectorAll(".pain, .svc, .step, .pillar").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- 6b. Parallax sutil do glow do hero ---------- */
  const heroGlow = document.querySelector(".hero__glow");
  if (heroGlow && !prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      const dx = (e.clientX / window.innerWidth - 0.5) * 44;
      const dy = (e.clientY / window.innerHeight - 0.5) * 28;
      heroGlow.style.transform = `translateX(calc(-50% + ${dx}px)) translateY(${dy}px)`;
    }, { passive: true });
  }

  /* ---------- 7. Botões magnéticos ---------- */
  if (finePointer && !prefersReduced) {
    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${mx * 0.18}px, ${my * 0.22}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- 7b. Hero vídeo — garante autoplay ---------- */
  const heroVideo = document.querySelector(".scope__video");
  if (heroVideo) {
    const tryPlay = () => {
      const p = heroVideo.play();
      if (p && p.catch) p.catch(() => {});
    };
    tryPlay();
    heroVideo.addEventListener("canplay", tryPlay, { once: true });
    // Alguns navegadores só liberam após interação do usuário:
    document.addEventListener("pointerdown", tryPlay, { once: true });
  }

  /* ---------- 8. FAQ — fecha os outros ao abrir ---------- */
  const faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- 9. Máscara simples de WhatsApp ---------- */
  const wa = document.getElementById("whatsapp");
  if (wa) {
    wa.addEventListener("input", (e) => {
      let v = e.target.value.replace(/\D/g, "").slice(0, 11);
      if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
      else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
      else if (v.length > 0) v = `(${v}`;
      e.target.value = v;
    });
  }

  /* ---------- 10. Submit do formulário ---------- */
  /* TODO integração: trocar o bloco abaixo pelo POST do seu backend /
     CRM / e-mail. Pixel Meta e GA já são disparados em conversão. */
  const form = document.getElementById("leadForm");
  const success = document.getElementById("formSuccess");
  const submitBtn = document.getElementById("submitBtn");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando…";

      // Simulação de envio — substituir por fetch() real.
      setTimeout(() => {
        // Disparo de conversão (hooks prontos):
        if (typeof window.fbq === "function") window.fbq("track", "Lead");
        if (typeof window.gtag === "function") window.gtag("event", "generate_lead");

        form.reset();
        success.hidden = false;
        submitBtn.textContent = "Enviado ✓";
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = "Solicitar avaliação gratuita";
        }, 2500);
      }, 900);
    });
  }
})();
