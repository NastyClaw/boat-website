(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fmt = (n) => Number(n).toLocaleString('en-UG', { maximumFractionDigits: 0 });
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cfg = window.BOAT_SITE || {};

  /* ---------- Site config: app link + optional public contact details ---------- */
  if (cfg.appUrl) $$('[data-app-link]').forEach((a) => (a.href = cfg.appUrl));
  if (cfg.region) $$('[data-region]').forEach((el) => (el.textContent = cfg.region));
  const c = cfg.contact || {};
  const list = $('#contact-list');
  const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  const addContact = (icon, html) => {
    const li = document.createElement('li');
    li.innerHTML = `<svg class="ic" aria-hidden="true"><use href="#i-${icon}"/></svg>${html}`;
    list.appendChild(li);
  };
  if (c.phone) addContact('phone', `<a class="u-link" href="tel:${esc(c.phone.replace(/[^\d+]/g, ''))}">${esc(c.phone)}</a>`);
  if (c.whatsapp) addContact('phone', `<a class="u-link" href="https://wa.me/${esc(c.whatsapp.replace(/\D/g, ''))}" target="_blank" rel="noopener">WhatsApp</a>`);
  if (c.email) addContact('mail', `<a class="u-link" href="mailto:${esc(c.email)}">${esc(c.email)}</a>`);
  if (c.address) addContact('pin', `<span>${esc(c.address)}</span>`);
  if (c.hours) addContact('calendar', `<span>${esc(c.hours)}</span>`);
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Header: scroll state + mobile menu ---------- */
  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const nav = $('#site-nav');
  const menuBtn = $('#menu-toggle');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });
  window.matchMedia('(min-width: 921px)').addEventListener('change', (m) => m.matches && setMenu(false));

  // Active section highlighting in nav
  const navLinks = $$('.nav > a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => so.observe(s));
  }

  /* ---------- Hero interactive workspace preview ---------- */
  const HERO_VIEWS = {
    business: {
      url: 'boat-frontend.vercel.app · Business dashboard',
      mode: 'General Business mode',
      title: 'Business dashboard',
      sub: 'Sales, spending, money owed and accounting in one shared workspace.',
      cta: 'New quick sale',
      kpis: [
        ['Sales this month', 'UGX 18,450,000'],
        ['Expenses this month', 'UGX 9,120,500'],
        ['Customers owing', 'UGX 3,760,000'],
        ['Suppliers to pay', 'UGX 2,215,000'],
      ],
      tasksTitle: 'Common tasks',
      tasks: ['New sales invoice', 'Money Out', 'Cash stock purchase', 'Reconcile accounts', 'Financial reports', 'Review customers owing'],
      alertsTitle: 'Needs attention',
      alerts: [
        ['amber', 'Overdue customer invoices', 'Review customers owing'],
        ['rose', 'Overdue supplier bills', 'Review suppliers to pay'],
      ],
    },
    school: {
      url: 'boat-frontend.vercel.app · School dashboard',
      mode: 'School operations',
      title: 'School dashboard',
      sub: 'Students, fees, collections, available funds and approvals in one view.',
      cta: 'Receive payment',
      kpis: [
        ['Active students', '642'],
        ['Fees collected', 'UGX 214.6M'],
        ['Unpaid fees', 'UGX 58.3M'],
        ['Collection rate', '78.6%'],
      ],
      tasksTitle: 'Common tasks',
      tasks: ['Receive fee payment', 'Create term charges', 'Student register', 'View receipts', 'Arrears & credit control', 'Collections summary'],
      alertsTitle: 'Tasks & alerts',
      alerts: [
        ['amber', 'Term fee reminders queued', 'Open reminder automation'],
        ['rose', 'Pending bursary approvals', 'Review approval inbox'],
      ],
    },
    approvals: {
      url: 'boat-frontend.vercel.app · Finance overview',
      mode: 'Payments, reporting & assurance',
      title: 'Finance overview',
      sub: 'Trace purchase orders, goods received, supplier bills and payment release.',
      cta: 'Review queue',
      kpis: [
        ['Collected This Term', 'UGX 96.4M'],
        ['Spent This Term', 'UGX 41.2M'],
        ['Available Cash & Bank', 'UGX 55.2M'],
        ['Pending Approvals', '7', true],
      ],
      tasksTitle: 'Approval workflow',
      tasks: ['Purchase order', 'Goods received', 'Three-way match', 'Supplier bill', 'Approval matrix', 'Payment release'],
      alertsTitle: 'Approval inbox',
      alerts: [
        ['amber', 'Supplier bill awaiting checker', 'Review supporting voucher'],
        ['rose', 'Expense request pending sign-off', 'Open approval matrix'],
      ],
    },
  };

  const heroBtns = $$('#hero-switcher [role="tab"]');
  const heroContent = $('#hero-win-content');
  let heroTimer = null;

  const renderHeroView = (key) => {
    const v = HERO_VIEWS[key];
    if (!v) return;
    $('#hero-win-url').textContent = v.url;
    $('#hw-mode').textContent = v.mode;
    $('#hw-title').textContent = v.title;
    $('#hw-sub').textContent = v.sub;
    $('#hw-cta').textContent = v.cta;
    $('#hw-kpis').innerHTML = v.kpis
      .map(([lbl, val, acc]) => `<div class="kpi${acc ? ' accent' : ''}"><small>${esc(lbl)}</small><b>${esc(val)}</b></div>`)
      .join('');
    $('#hw-grid').innerHTML = `
      <div class="panel">
        <h4>${esc(v.tasksTitle)}</h4>
        <div class="tasks">${v.tasks.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
      </div>
      <div class="panel">
        <h4>${esc(v.alertsTitle)}</h4>
        <ul class="alerts">${v.alerts.map(([dot, title, cta]) => `<li><span class="dot ${dot}"></span>${esc(title)}<em>${esc(cta)}</em></li>`).join('')}</ul>
      </div>`;
    $$('.hero .ws-item').forEach((el) => el.classList.toggle('active', el.dataset.side === key));
  };

  const switchHeroView = (btn, instant = false) => {
    const key = btn.dataset.heroView;
    heroBtns.forEach((b) => {
      const on = b === btn;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    clearTimeout(heroTimer);
    if (instant || reduceMotion()) {
      heroContent.classList.remove('swapping');
      renderHeroView(key);
      return;
    }
    heroContent.classList.add('swapping');
    heroTimer = setTimeout(() => {
      renderHeroView(key);
      requestAnimationFrame(() => heroContent.classList.remove('swapping'));
    }, 95);
  };

  heroBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => switchHeroView(btn, false));
    btn.addEventListener('keydown', (e) => {
      const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: heroBtns.length - 1 };
      if (e.key in map) {
        e.preventDefault();
        const next = heroBtns[(map[e.key] + heroBtns.length) % heroBtns.length];
        switchHeroView(next, true); // zero delay on keyboard actions
        next.focus();
      }
    });
  });

  /* ---------- Feature tabs + GPU-composited sliding indicator ---------- */
  const tabList = $('#feature-tabs');
  const tabs = $$('[role="tab"]', tabList);
  const indicator = $('#tab-indicator');

  const moveIndicator = (tab, instant = false) => {
    if (!tab || !indicator || !tabList) return;
    if (instant || reduceMotion()) indicator.classList.add('no-anim');
    const pad = 6;
    const innerW = tabList.clientWidth - pad * 2;
    const left = Math.max(0, tab.offsetLeft - pad);
    const right = Math.max(0, innerW - (left + tab.offsetWidth));
    indicator.style.clipPath = `inset(0 ${right}px 0 ${left}px round 999px)`;
    if (instant || reduceMotion()) {
      requestAnimationFrame(() => indicator.classList.remove('no-anim'));
    }
  };

  const selectTab = (tab, { focus = true, instant = false } = {}) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = $('#' + t.getAttribute('aria-controls'));
      if (on) {
        panel.hidden = false;
        if (!instant && !reduceMotion()) {
          panel.classList.add('entering');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => panel.classList.remove('entering'));
          });
        } else {
          panel.classList.remove('entering');
        }
      } else {
        panel.hidden = true;
        panel.classList.remove('entering');
      }
    });
    moveIndicator(tab, instant);
    if (focus) tab.focus();
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: instant || reduceMotion() ? 'auto' : 'smooth' });
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t, { focus: false, instant: false }));
    t.addEventListener('keydown', (e) => {
      const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (e.key in map) {
        e.preventDefault();
        selectTab(tabs[(map[e.key] + tabs.length) % tabs.length], { focus: true, instant: true });
      }
    });
  });

  const syncActiveIndicator = () => {
    const active = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    moveIndicator(active, true);
  };
  syncActiveIndicator();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncActiveIndicator);
  window.addEventListener('resize', syncActiveIndicator, { passive: true });

  /* ---------- How It Works pointer progress track ---------- */
  const journeySteps = $$('#journey-list li');
  const journeyFill = $('#journey-fill');
  if (journeyFill && journeySteps.length) {
    const setStep = (idx) => {
      journeyFill.style.transform = `scaleX(${(idx + 1) / journeySteps.length})`;
      journeySteps.forEach((li, i) => li.classList.toggle('step-active', i <= idx));
    };
    setStep(0);
    journeySteps.forEach((li, i) => {
      li.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse') setStep(i);
      });
    });
    $('#journey-list').addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse') setStep(0);
    });
  }

  /* ---------- Pricing interactions ---------- */
  const dm = $('#dm-toggle');
  const total = $('#impl-total');
  const note = $('#impl-note');
  let dmTimer = null;

  dm.addEventListener('change', () => {
    const on = dm.checked;
    dm.closest('li').classList.toggle('on', on);
    note.textContent = on ? 'Including data management · UGX 500,000 without it' : 'Without data management · UGX 700,000 with it';
    clearTimeout(dmTimer);
    if (reduceMotion()) {
      total.textContent = fmt(on ? 700000 : 500000);
      return;
    }
    total.classList.add('updating');
    dmTimer = setTimeout(() => {
      total.textContent = fmt(on ? 700000 : 500000);
      requestAnimationFrame(() => total.classList.remove('updating'));
    }, 80);
  });

  const students = $('#students');
  const estOut = $('#est-out');
  const presetChips = $$('.preset-chip');

  const updateEst = () => {
    const n = Math.max(0, Math.floor(Number(students.value) || 0));
    estOut.textContent = n > 0 ? `≈ UGX ${fmt(n * 1000)} per month for ${fmt(n)} students` : 'Enter the number of students';
    presetChips.forEach((chip) => {
      const match = Number(chip.dataset.students) === n;
      chip.classList.toggle('active', match);
      chip.setAttribute('aria-pressed', String(match));
    });
  };
  students.addEventListener('input', updateEst);
  presetChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      students.value = chip.dataset.students;
      updateEst();
    });
  });
  updateEst();

  /* ---------- Smooth, interruptible FAQ accordion ---------- */
  $$('#faq-list details').forEach((det) => {
    const summary = $('summary', det);
    const body = $('.faq-body', det);
    if (!summary || !body) return;
    let animEnd = null;

    summary.addEventListener('click', (e) => {
      if (reduceMotion()) return; // native instant toggle under reduced motion
      e.preventDefault();
      if (animEnd) {
        body.removeEventListener('transitionend', animEnd);
        animEnd = null;
      }

      if (det.open && !det.dataset.closing) {
        // Interruptible close from current live height
        det.dataset.closing = '1';
        const currentH = body.getBoundingClientRect().height;
        body.style.height = currentH + 'px';
        body.style.opacity = getComputedStyle(body).opacity;
        requestAnimationFrame(() => {
          body.style.height = '0px';
          body.style.opacity = '0';
        });
        animEnd = (ev) => {
          if (ev.propertyName !== 'height') return;
          det.open = false;
          delete det.dataset.closing;
          body.style.height = '';
          body.style.opacity = '';
          body.removeEventListener('transitionend', animEnd);
          animEnd = null;
        };
        body.addEventListener('transitionend', animEnd);
      } else {
        // Interruptible open from current live height
        delete det.dataset.closing;
        const startH = det.open ? body.getBoundingClientRect().height : 0;
        det.open = true;
        body.style.height = 'auto';
        const targetH = body.scrollHeight;
        body.style.height = startH + 'px';
        body.style.opacity = startH > 0 ? getComputedStyle(body).opacity : '0';
        requestAnimationFrame(() => {
          body.style.height = targetH + 'px';
          body.style.opacity = '1';
        });
        animEnd = (ev) => {
          if (ev.propertyName !== 'height') return;
          body.style.height = '';
          body.style.opacity = '';
          body.removeEventListener('transitionend', animEnd);
          animEnd = null;
        };
        body.addEventListener('transitionend', animEnd);
      }
    });
  });

  /* ---------- Demo booking form ---------- */
  const form = $('#demo-form');
  const typeSel = $('#f-type');
  const sizeSel = $('#f-size');
  const dateIn = $('#f-date');
  const msgIn = $('#f-msg');
  const msgCount = $('#msg-count');
  const alertBox = $('#form-alert');
  const submitBtn = $('#demo-submit');
  const success = $('#form-success');

  const SIZES = {
    business: ['1–10 people', '11–50 people', '51–200 people', '201+ people'],
    school: ['Up to 300 students', '301–800 students', '801–1,500 students', '1,501+ students'],
  };
  const fillSizes = () => {
    const isSchool = typeSel.value === 'School';
    const opts = typeSel.value ? SIZES[isSchool ? 'school' : 'business'] : [];
    const prev = sizeSel.value;
    sizeSel.innerHTML = `<option value="" selected disabled>${typeSel.value ? (isSchool ? 'Number of students' : 'Number of staff') : 'Select type first'}</option>` +
      opts.map((o) => `<option${o === prev ? ' selected' : ''}>${o}</option>`).join('');
    if (!opts.includes(prev)) fieldOf('organizationSize')?.classList.remove('valid');
  };
  typeSel.addEventListener('change', fillSizes);

  // Prefill organization type from "Request a quote" & Solution card CTAs
  $$('[data-prefill-type]').forEach((a) =>
    a.addEventListener('click', () => {
      typeSel.value = a.dataset.prefillType;
      fillSizes();
      clearError('organizationType');
      fieldOf('organizationType')?.classList.add('valid');
    })
  );

  const localISO = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const today = new Date();
  dateIn.min = localISO(today);
  dateIn.max = localISO(new Date(today.getTime() + 365 * 86400000));

  const stamp = () => ($('#f-started').value = String(Date.now()));
  stamp();

  const fieldOf = (name) => form.elements[name]?.closest('.field');
  const setError = (name, msg) => {
    const f = fieldOf(name); const e = $('#e-' + name); const input = form.elements[name];
    if (!f || !e) return;
    f.classList.remove('valid');
    f.classList.add('invalid');
    e.textContent = msg;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', 'e-' + name);
  };
  const clearError = (name) => {
    const f = fieldOf(name); const e = $('#e-' + name); const input = form.elements[name];
    if (!f || !e) return;
    f.classList.remove('invalid');
    e.textContent = '';
    input.removeAttribute('aria-invalid');
  };

  const validators = {
    name: (v) => (v.trim().length < 2 ? 'Please enter your full name.' : ''),
    organization: (v) => (v.trim().length < 2 ? 'Please enter your organization’s name.' : ''),
    organizationType: (v) => (!v ? 'Please choose an organization type.' : ''),
    organizationSize: (v) => (!v ? 'Please choose your organization size.' : ''),
    email: (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Please enter a valid email address.' : ''),
    phone: (v) => {
      const d = v.replace(/\D/g, '');
      return !/^[+\d\s().-]+$/.test(v.trim()) || d.length < 9 || d.length > 15 ? 'Please enter a valid phone number, e.g. +256 7XX XXX XXX.' : '';
    },
    preferredDate: (v) => {
      if (!v) return 'Please choose a preferred demo date.';
      if (v < dateIn.min) return 'Please choose today or a future date.';
      if (v > dateIn.max) return 'Please choose a date within the next 12 months.';
      return '';
    },
    message: (v) => (v.length > 2000 ? 'Please keep your message under 2,000 characters.' : ''),
  };

  Object.keys(validators).forEach((name) => {
    const el = form.elements[name];
    const check = (markValid) => {
      const m = validators[name](el.value);
      if (m) {
        setError(name, m);
      } else {
        clearError(name);
        if (markValid && name !== 'message' && el.value.trim()) fieldOf(name)?.classList.add('valid');
      }
    };
    el.addEventListener('blur', () => check(true));
    el.addEventListener('change', () => { if (el.tagName === 'SELECT' || el.type === 'date') check(true); });
    el.addEventListener('input', () => {
      if (fieldOf(name)?.classList.contains('invalid')) check(true);
      else if (name !== 'message' && el.value.trim() && !validators[name](el.value)) fieldOf(name)?.classList.add('valid');
      else fieldOf(name)?.classList.remove('valid');
    });
  });

  msgIn.addEventListener('input', () => {
    const len = msgIn.value.length;
    msgCount.textContent = len > 200 ? `${fmt(len)} / 2,000` : 'Optional';
  });

  const showAlert = (msg) => { alertBox.textContent = msg; alertBox.hidden = false; };
  const setLoading = (on) => {
    submitBtn.classList.toggle('loading', on);
    submitBtn.disabled = on;
    $('.btn-label', submitBtn).textContent = on ? 'Booking demo…' : 'Book a demo';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.hidden = true;
    let firstBad = null;
    for (const [name, fn] of Object.entries(validators)) {
      const msg = fn(form.elements[name].value);
      if (msg) { setError(name, msg); firstBad ||= form.elements[name]; }
      else {
        clearError(name);
        if (name !== 'message' && form.elements[name].value.trim()) fieldOf(name)?.classList.add('valid');
      }
    }
    if (firstBad) { firstBad.focus(); return; }

    const payload = Object.fromEntries(new FormData(form).entries());
    setLoading(true);
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20000);
      const res = await fetch('/api/book-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        if (data.errors) {
          Object.entries(data.errors).forEach(([k, v]) => setError(k, v));
          const first = Object.keys(data.errors)[0];
          form.elements[first]?.focus();
        }
        showAlert(data.message || 'We couldn’t send your booking. Please try again.');
        return;
      }
      $('#s-date').textContent = new Date(payload.preferredDate + 'T00:00:00').toLocaleDateString('en-UG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      $('#s-email').textContent = payload.email;
      $('#s-ref').textContent = data.reference || '';
      form.hidden = true;
      success.classList.add('entering');
      success.classList.remove('celebrate');
      success.hidden = false;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          success.classList.remove('entering');
          success.classList.add('celebrate');
        });
      });
      success.focus();
      success.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'center' });
    } catch (err) {
      showAlert(err.name === 'AbortError'
        ? 'The request timed out. Please check your connection and try again.'
        : 'We couldn’t reach the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  });

  $('#book-another').addEventListener('click', () => {
    form.reset();
    $$('.field', form).forEach((f) => f.classList.remove('valid', 'invalid'));
    msgCount.textContent = 'Optional';
    fillSizes();
    stamp();
    success.hidden = true;
    success.classList.remove('celebrate', 'entering');
    form.hidden = false;
    form.elements.name.focus();
  });
})();
