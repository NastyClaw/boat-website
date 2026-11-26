(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fmt = (n) => Number(n).toLocaleString('en-UG', { maximumFractionDigits: 0 });
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cfg = window.BOAT_SITE || {};

  /* ---------- Site config ---------- */
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

  /* ---------- Header & Mobile Drawer ---------- */
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
  window.matchMedia('(min-width: 941px)').addEventListener('change', (m) => m.matches && setMenu(false));

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

  /* ---------- Hero Interactive Application Workspace ---------- */
  const HERO_VIEWS = {
    business: {
      org: 'Lake View Traders · General Business',
      mode: 'General Business mode',
      title: 'Business dashboard',
      period: 'Period · Nov 2026',
      kpis: [
        ['Sales this month', 'UGX 18,450,000', false],
        ['Expenses this month', 'UGX 9,120,500', false],
        ['Customers owing', 'UGX 3,760,000', false],
        ['Suppliers to pay', 'UGX 2,215,000', true],
      ],
      chartTitle: 'Monthly inflows vs. spending',
      bars: [
        ['Jun', 58, 34, 'Jun · UGX 12.4M in / 7.1M out'],
        ['Jul', 66, 39, 'Jul · UGX 14.1M in / 8.0M out'],
        ['Aug', 62, 36, 'Aug · UGX 13.6M in / 7.4M out'],
        ['Sep', 76, 43, 'Sep · UGX 16.2M in / 8.8M out'],
        ['Oct', 81, 41, 'Oct · UGX 17.0M in / 8.5M out'],
        ['Nov', 90, 45, 'Nov · UGX 18.45M in / 9.12M out'],
      ],
      tableTitle: 'Recent cashbook & ledger entries',
      headers: ['Ref', 'Entry', 'Channel', 'Amount (UGX)'],
      rows: [
        ['RCP-1048', 'Customer invoice receipt', 'MTN MoMo', '+1,450,000'],
        ['PV-0392', 'Approved supplier settlement', 'Bank', '−820,000'],
        ['RCP-1049', 'Counter quick sale batch', 'Cash', '+640,000'],
        ['JNL-0114', 'Monthly utilities accrual', 'Journal', '−295,000'],
      ],
    },
    school: {
      org: 'Kampala Horizon School · School Bursar',
      mode: 'School finance operations',
      title: 'School dashboard',
      period: 'Term 3 · 642 Students',
      kpis: [
        ['Term fees billed', 'UGX 272,900,000', false],
        ['Fees collected', 'UGX 214,600,000', true],
        ['Unpaid balances', 'UGX 58,300,000', false],
        ['Available cash & bank', 'UGX 94,180,000', false],
      ],
      chartTitle: 'Fee collection rate by class group',
      bars: [
        ['Nur', 71, 29, 'Nursery · 71% collected (UGX 36.2M)'],
        ['P.1–3', 75, 25, 'P.1–P.3 · 75% collected (UGX 44.5M)'],
        ['P.4', 77, 23, 'Primary 4 · 77% collected (UGX 27.6M)'],
        ['P.5', 79, 21, 'Primary 5 · 79% collected (UGX 54.2M)'],
        ['P.6', 82, 18, 'Primary 6 · 82% collected (UGX 53.9M)'],
        ['P.7', 88, 12, 'Primary 7 · 88% collected (UGX 48.15M)'],
      ],
      tableTitle: 'Recent student fee receipts & vote items',
      headers: ['Receipt', 'Student / Vote', 'Method', 'Amount (UGX)'],
      rows: [
        ['SFR-8821', 'P.7A · Term 3 tuition balance', 'SchoolPay / Bank', '+650,000'],
        ['SFR-8822', 'P.5B · Boarding & meals installment', 'Airtel Money', '+420,000'],
        ['VB-0209', 'Laboratory supplies vote release', 'Bank transfer', '−1,150,000'],
        ['SFR-8823', 'P.3A · Tuition receipt', 'MTN MoMo', '+380,000'],
      ],
    },
    approvals: {
      org: 'Nile Valley Group · Procure-to-Pay',
      mode: 'Payments, reporting & assurance',
      title: 'Approval & reconciliation centre',
      period: 'Close · Open period',
      kpis: [
        ['Collected this period', 'UGX 96,400,000', false],
        ['Approved expenditure', 'UGX 41,200,000', false],
        ['Cash & bank verified', 'UGX 55,200,000', false],
        ['Awaiting checker sign-off', '3 vouchers', true],
      ],
      chartTitle: 'Budget vs. actual spend by department',
      bars: [
        ['Ops', 74, 68, 'Operations · UGX 14.2M actual / 15.5M budget'],
        ['Store', 64, 61, 'Stores · UGX 9.8M actual / 10.4M budget'],
        ['Admin', 52, 49, 'Admin · UGX 6.4M actual / 6.8M budget'],
        ['Fleet', 69, 58, 'Transport · UGX 5.9M actual / 7.0M budget'],
        ['IT', 40, 38, 'Systems · UGX 2.4M actual / 2.6M budget'],
        ['Maint', 46, 44, 'Maintenance · UGX 2.5M actual / 2.7M budget'],
      ],
      tableTitle: 'Maker-checker approval queue',
      headers: ['Voucher', 'Item & 3-way match', 'Stage', 'Amount (UGX)'],
      rows: [
        ['BILL-219', 'PO-088 / GRN-084 stationery', 'Matched', '3,450,000'],
        ['EXP-402', 'Generator fuel requisition', 'Checker', '680,000'],
        ['PAY-115', 'Approved supplier release', 'Sign-off', '6,120,000'],
        ['PCV-067', 'Petty cash float count', 'Verified', '500,000'],
      ],
    },
  };

  const heroBtns = $$('#hero-switcher [role="tab"]');
  const heroCanvas = $('#hero-win-content');
  const chartReadout = $('#chart-readout');
  const heroBars = $('#hero-bars');
  let heroTimer = null;

  const bindBarHover = () => {
    const cols = $$('.bc-col', heroBars);
    cols.forEach((col) => {
      const activate = () => {
        cols.forEach((c) => c.classList.toggle('active', c === col));
        chartReadout.textContent = col.dataset.label || '';
      };
      col.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') activate(); });
      col.addEventListener('click', activate);
      col.addEventListener('focus', activate);
    });
  };
  bindBarHover();

  const renderHeroView = (key) => {
    const v = HERO_VIEWS[key];
    if (!v) return;
    $('#af-org-name').textContent = v.org;
    $('#hw-mode').textContent = v.mode;
    $('#hw-title').textContent = v.title;
    $('#hw-period').textContent = v.period;
    $('#hw-kpis').innerHTML = v.kpis
      .map(([lbl, val, hi]) => `<div class="afm${hi ? ' afm-highlight' : ''}"><span>${esc(lbl)}</span><strong class="mono">${esc(val)}</strong></div>`)
      .join('');
    $('#hw-chart-title').textContent = v.chartTitle;
    heroBars.innerHTML = v.bars
      .map(([m, hIn, hOut, label], idx) => `<button type="button" class="bc-col${idx === v.bars.length - 1 ? ' active' : ''}" data-label="${esc(label)}"><span class="bc-in" style="--h:${hIn}%"></span><span class="bc-out" style="--h:${hOut}%"></span><em>${esc(m)}</em></button>`)
      .join('');
    chartReadout.textContent = v.bars[v.bars.length - 1][3];
    bindBarHover();

    $('#hw-table-title').textContent = v.tableTitle;
    $('#hw-table').innerHTML = `
      <thead><tr>${v.headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${v.rows.map(([r0, r1, r2, r3]) => `<tr><td class="mono">${esc(r0)}</td><td>${esc(r1)}</td><td>${esc(r2)}</td><td class="mono">${esc(r3)}</td></tr>`).join('')}</tbody>`;
    $$('.af-sidebar .afs-item').forEach((el) => el.classList.toggle('active', el.dataset.side === key));
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
      heroCanvas.classList.remove('swapping');
      renderHeroView(key);
      return;
    }
    heroCanvas.classList.add('swapping');
    heroTimer = setTimeout(() => {
      renderHeroView(key);
      requestAnimationFrame(() => heroCanvas.classList.remove('swapping'));
    }, 85);
  };

  heroBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => switchHeroView(btn, false));
    btn.addEventListener('keydown', (e) => {
      const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: heroBtns.length - 1 };
      if (e.key in map) {
        e.preventDefault();
        const next = heroBtns[(map[e.key] + heroBtns.length) % heroBtns.length];
        switchHeroView(next, true);
        next.focus();
      }
    });
  });

  /* ---------- Feature Tabs + Sliding Ink Pill ---------- */
  const tabList = $('#feature-tabs');
  const tabs = $$('[role="tab"]', tabList);
  const indicator = $('#tab-indicator');

  const moveIndicator = (tab, instant = false) => {
    if (!tab || !indicator || !tabList) return;
    if (instant || reduceMotion()) indicator.classList.add('no-anim');
    const pad = 4;
    const innerW = tabList.clientWidth - pad * 2;
    const left = Math.max(0, tab.offsetLeft - pad);
    const right = Math.max(0, innerW - (left + tab.offsetWidth));
    indicator.style.clipPath = `inset(0 ${right}px 0 ${left}px round 7px)`;
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

  /* ---------- How It Works Pointer Rail ---------- */
  const journeySteps = $$('#journey-list li');
  const journeyFill = $('#journey-fill');
  if (journeyFill && journeySteps.length) {
    const setStep = (idx) => {
      journeyFill.style.transform = `scaleX(${(idx + 1) / journeySteps.length})`;
      journeySteps.forEach((li, i) => li.classList.toggle('step-active', i <= idx));
    };
    setStep(0);
    journeySteps.forEach((li, i) => {
      li.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setStep(i); });
    });
    $('#journey-list').addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') setStep(0); });
  }

  /* ---------- Pricing Schedule Interactions ---------- */
  const dm = $('#dm-toggle');
  const total = $('#impl-total');
  const note = $('#impl-note');
  let dmTimer = null;

  dm.addEventListener('change', () => {
    const on = dm.checked;
    dm.closest('li').classList.toggle('on', on);
    note.textContent = on
      ? 'Includes optional data management · UGX 500,000 without it'
      : 'Without data management · UGX 700,000 with optional data management';
    clearTimeout(dmTimer);
    if (reduceMotion()) {
      total.textContent = fmt(on ? 700000 : 500000);
      return;
    }
    total.classList.add('updating');
    dmTimer = setTimeout(() => {
      total.textContent = fmt(on ? 700000 : 500000);
      requestAnimationFrame(() => total.classList.remove('updating'));
    }, 75);
  });

  const students = $('#students');
  const estOut = $('#est-out');
  const presetChips = $$('.preset-chip');

  const updateEst = () => {
    const n = Math.max(0, Math.floor(Number(students.value) || 0));
    estOut.textContent = n > 0
      ? `${fmt(n)} students = UGX ${fmt(n * 1000)} / month`
      : 'Enter student enrollment to calculate monthly subscription';
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

  /* ---------- Smooth Interruptible FAQ Accordion ---------- */
  $$('#faq-list details').forEach((det) => {
    const summary = $('summary', det);
    const body = $('.faq-body', det);
    if (!summary || !body) return;
    let animEnd = null;

    summary.addEventListener('click', (e) => {
      if (reduceMotion()) return;
      e.preventDefault();
      if (animEnd) {
        body.removeEventListener('transitionend', animEnd);
        animEnd = null;
      }

      if (det.open && !det.dataset.closing) {
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

  /* ---------- Demo Booking Form ---------- */
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
    sizeSel.innerHTML = `<option value="" selected disabled>${typeSel.value ? (isSchool ? 'Student enrollment' : 'Staff size') : 'Select type first'}</option>` +
      opts.map((o) => `<option${o === prev ? ' selected' : ''}>${o}</option>`).join('');
  };
  typeSel.addEventListener('change', fillSizes);

  $$('[data-prefill-type]').forEach((a) =>
    a.addEventListener('click', () => {
      typeSel.value = a.dataset.prefillType;
      fillSizes();
      clearError('organizationType');
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
    el.addEventListener('blur', () => {
      const m = validators[name](el.value);
      m ? setError(name, m) : clearError(name);
    });
    el.addEventListener('input', () => {
      if (fieldOf(name)?.classList.contains('invalid') && !validators[name](el.value)) clearError(name);
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
      else clearError(name);
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
    $$('.field', form).forEach((f) => f.classList.remove('invalid'));
    msgCount.textContent = 'Optional';
    fillSizes();
    stamp();
    success.hidden = true;
    success.classList.remove('celebrate', 'entering');
    form.hidden = false;
    form.elements.name.focus();
  });
})();
