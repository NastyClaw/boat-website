(() => {
  'use strict';

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const formatUGX = (n) => 'UGX ' + Math.round(n).toLocaleString('en-US');

  function animateValue(el, from, to, duration = 220, formatter = formatUGX) {
    if (!el) return;
    if (prefersReducedMotion() || from === to) {
      el.textContent = formatter(to);
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatter(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* =========================================================
     1. Public Site Config (site-config.js)
     ========================================================= */
  const cfg = window.BOAT_SITE || {};
  if (cfg.appUrl) {
    document.querySelectorAll('.js-app-link').forEach((a) => {
      a.href = cfg.appUrl;
    });
  }
  const regionEl = document.getElementById('site-region');
  if (regionEl && cfg.region) regionEl.textContent = cfg.region;

  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const contactList = document.getElementById('public-contact-list');
  if (contactList && cfg.contact) {
    const items = [];
    const c = cfg.contact;
    if (c.phone) {
      const tel = c.phone.replace(/[^\d+]/g, '');
      items.push({ label: 'Phone', text: c.phone, href: `tel:${tel}` });
    }
    if (c.whatsapp) {
      const wa = c.whatsapp.replace(/\D/g, '');
      items.push({ label: 'WhatsApp', text: `+${wa}`, href: `https://wa.me/${wa}` });
    }
    if (c.email) {
      items.push({ label: 'Enquiries', text: c.email, href: `mailto:${c.email}` });
    }
    if (c.address) items.push({ label: 'Office', text: c.address });
    if (c.hours) items.push({ label: 'Hours', text: c.hours });

    if (items.length > 0) {
      contactList.innerHTML = '';
      items.forEach((it) => {
        const li = document.createElement('li');
        const strong = document.createElement('strong');
        strong.textContent = `${it.label}: `;
        li.appendChild(strong);
        if (it.href) {
          const a = document.createElement('a');
          a.href = it.href;
          if (it.href.startsWith('http')) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
          }
          a.textContent = it.text;
          li.appendChild(a);
        } else {
          li.appendChild(document.createTextNode(it.text));
        }
        contactList.appendChild(li);
      });
      contactList.hidden = false;
    }
  }

  /* =========================================================
     2. Mobile Navigation Drawer
     ========================================================= */
  const menuBtn = document.getElementById('menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const menuIconPath = document.getElementById('menu-icon-path');
  let drawerTimer = null;

  function setDrawerOpen(open) {
    if (!menuBtn || !drawer) return;
    clearTimeout(drawerTimer);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (menuIconPath) {
      menuIconPath.setAttribute('d', open ? 'M5 5L15 15M15 5L5 15' : 'M3 6H17M3 10H17M3 14H17');
    }
    if (open) {
      drawer.hidden = false;
      requestAnimationFrame(() => {
        drawer.dataset.open = 'true';
      });
    } else {
      drawer.dataset.open = 'false';
      drawerTimer = setTimeout(() => {
        drawer.hidden = true;
      }, 220);
    }
  }

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
      setDrawerOpen(!isOpen);
    });
    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setDrawerOpen(false));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        setDrawerOpen(false);
        menuBtn.focus();
      }
    });
    document.addEventListener('click', (e) => {
      if (
        menuBtn.getAttribute('aria-expanded') === 'true' &&
        !drawer.contains(e.target) &&
        !menuBtn.contains(e.target)
      ) {
        setDrawerOpen(false);
      }
    });
  }

  /* =========================================================
     3. ScrollReveal & Active Nav Highlight
     ========================================================= */
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  const navLinks = Array.from(document.querySelectorAll('.primary-nav .nav-link'));
  const navTargets = navLinks
    .map((link) => {
      const id = link.getAttribute('href')?.slice(1);
      const sec = id ? document.getElementById(id) : null;
      return sec ? { link, sec } : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && navTargets.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.removeAttribute('aria-current'));
            const match = navTargets.find((t) => t.sec === entry.target);
            if (match) match.link.setAttribute('aria-current', 'true');
          }
        });
      },
      { rootMargin: '-28% 0px -58% 0px', threshold: 0 }
    );
    navTargets.forEach((t) => navObserver.observe(t.sec));
  }

  /* =========================================================
     4. Hero Micro-Interactions: Money Rails & Sparkline Scrub
     ========================================================= */
  const railData = {
    all: { label: 'Cash, MoMo & bank accounts', kpi: 'UGX 46.8M', tag: '' },
    Cash: { label: 'Physical cash drawers & petty cash', kpi: 'UGX 6.4M', tag: 'CASH' },
    'MTN MoMo': { label: 'MTN MoMo merchant & fee collections', kpi: 'UGX 14.2M', tag: 'MTN' },
    'Airtel Money': { label: 'Airtel Money collections', kpi: 'UGX 8.1M', tag: 'AIRTEL' },
    Bank: { label: 'Reconciled UGX bank accounts', kpi: 'UGX 16.0M', tag: 'BANK' },
    Cheque: { label: 'Cleared & pending cheques', kpi: 'UGX 2.1M', tag: 'CHEQUE' },
    Excel: { label: 'Opening balances imported via Excel/CSV', kpi: 'Balanced', tag: 'IMPORT' },
  };

  const railButtons = document.querySelectorAll('.rail-pill');
  const heroEntries = document.querySelectorAll('#hero-entries .entry-row');
  const cashSub = document.getElementById('cash-sub');
  const cashKpi = document.getElementById('cash-kpi');
  const cashTag = document.getElementById('cash-rail-tag');

  railButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const rail = btn.dataset.rail || 'all';
      railButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));

      const info = railData[rail] || railData.all;
      if (cashSub) cashSub.textContent = info.label;
      if (cashKpi) cashKpi.textContent = info.kpi;
      if (cashTag) {
        if (info.tag) {
          cashTag.textContent = info.tag;
          cashTag.hidden = false;
        } else {
          cashTag.hidden = true;
        }
      }

      heroEntries.forEach((row) => {
        const channels = row.dataset.channel || '';
        if (rail === 'all') {
          row.dataset.dimmed = 'false';
          row.dataset.highlighted = 'false';
        } else if (channels.includes(rail)) {
          row.dataset.dimmed = 'false';
          row.dataset.highlighted = 'true';
        } else {
          row.dataset.dimmed = 'true';
          row.dataset.highlighted = 'false';
        }
      });
    });
  });

  // Interactive hover scrub on Cash & bank sparkline
  const sparkSvg = document.getElementById('cash-spark');
  const sparkDot = document.getElementById('spark-dot');
  const sparkTooltip = document.getElementById('spark-tooltip');
  const sparkPoints = [
    { x: 2, y: 46, label: 'Wk 1 · UGX 34.2M' },
    { x: 32, y: 39, label: 'Wk 2 · UGX 37.5M' },
    { x: 62, y: 44, label: 'Wk 3 · UGX 35.9M' },
    { x: 92, y: 26, label: 'Wk 4 · UGX 41.0M' },
    { x: 122, y: 23, label: 'Wk 5 · UGX 42.4M' },
    { x: 152, y: 25, label: 'Wk 6 · UGX 41.8M' },
    { x: 182, y: 18, label: 'Wk 7 · UGX 44.6M' },
    { x: 214, y: 12, label: 'Wk 8 · UGX 46.8M' },
  ];

  if (sparkSvg && sparkDot && sparkTooltip) {
    sparkSvg.addEventListener('pointermove', (e) => {
      const rect = sparkSvg.getBoundingClientRect();
      if (!rect.width) return;
      const relX = ((e.clientX - rect.left) / rect.width) * 220;
      let nearest = sparkPoints[sparkPoints.length - 1];
      let bestDist = Infinity;
      sparkPoints.forEach((pt) => {
        const d = Math.abs(pt.x - relX);
        if (d < bestDist) {
          bestDist = d;
          nearest = pt;
        }
      });
      sparkDot.setAttribute('cx', String(nearest.x));
      sparkDot.setAttribute('cy', String(nearest.y));
      sparkTooltip.textContent = nearest.label;
      sparkTooltip.dataset.visible = 'true';
    });

    sparkSvg.addEventListener('pointerleave', () => {
      const last = sparkPoints[sparkPoints.length - 1];
      sparkDot.setAttribute('cx', String(last.x));
      sparkDot.setAttribute('cy', String(last.y));
      sparkTooltip.dataset.visible = 'false';
    });
  }

  /* =========================================================
     5. Product Section Interactive Previews (#product)
     ========================================================= */
  const bizViews = {
    sales: {
      m1: ['Today’s receipts', 'UGX 3,480,000'],
      m2: ['Mobile money', 'UGX 2,150,000'],
      m3: ['Cash drawer', 'UGX 1,330,000'],
      rows: [
        ['POS #1084 · Counter wholesale', 'Receipt issued · Posted to Sales', 'MTN MoMo', 'is-mint', '+1,250,000', true],
        ['INV-0392 · Clinic supply order', 'Part-payment received', 'Airtel Money', 'is-mint', '+900,000', true],
        ['POS #1085 · Walk-in cash batch', 'Drawer reconciled', 'Cash', '', '+1,330,000', true],
      ],
    },
    owing: {
      m1: ['Customers owing', 'UGX 8,920,000'],
      m2: ['Due this week', 'UGX 3,100,000'],
      m3: ['Open invoices', '14 active'],
      rows: [
        ['INV-0388 · Kampala Hardware Ltd', 'Due in 4 days · Statement sent', 'Credit sale', 'is-amber', 'UGX 2,400,000', false],
        ['INV-0391 · Sunrise Pharmacy', 'Part-paid UGX 1.5M · Balance open', 'MTN MoMo', '', 'UGX 700,000', false],
        ['INV-0379 · Metro Catering', 'Scheduled bank settlement', 'Bank', '', 'UGX 1,850,000', false],
      ],
    },
    expenses: {
      m1: ['Money Out (week)', 'UGX 2,190,000'],
      m2: ['Suppliers to pay', 'UGX 4,600,000'],
      m3: ['Vouchers posted', '19 entries'],
      rows: [
        ['EXP-0214 · Electricity & water', 'Receipt attached · Utilities', 'MTN MoMo', '', '−420,000', false],
        ['EXP-0215 · Delivery fuel & riders', 'Approved petty cash voucher', 'Cash', '', '−310,000', false],
        ['BILL-0109 · Packaging supplier', 'Matched to GRN #184', 'Bank transfer', 'is-mint', '−1,460,000', false],
      ],
    },
  };

  const bizTabs = document.querySelectorAll('[data-biz-tab]');
  const bizRowsEl = document.getElementById('biz-rows');
  bizTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.bizTab;
      const view = bizViews[key];
      if (!view || !bizRowsEl) return;
      bizTabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));

      document.getElementById('biz-m1-label').textContent = view.m1[0];
      document.getElementById('biz-m1-val').textContent = view.m1[1];
      document.getElementById('biz-m2-label').textContent = view.m2[0];
      document.getElementById('biz-m2-val').textContent = view.m2[1];
      document.getElementById('biz-m3-label').textContent = view.m3[0];
      document.getElementById('biz-m3-val').textContent = view.m3[1];

      bizRowsEl.innerHTML = view.rows
        .map(
          ([title, sub, badge, badgeCls, amt, pos]) => `
          <div class="ui-row">
            <div>
              <span class="ui-row-main">${title}</span>
              <span class="ui-row-sub">${sub}</span>
            </div>
            <span class="ui-badge ${badgeCls}">${badge}</span>
            <span class="entry-amt ${pos ? 'is-pos' : ''}">${amt}</span>
          </div>`
        )
        .join('');
    });
  });

  // Feature 2: School Finance stream filter
  const schoolViews = {
    all: {
      billed: 'UGX 272.9M',
      collected: 'UGX 214.6M',
      outstanding: 'UGX 58.3M',
      rows: [
        ['ST-0412 · S.4 East (Boarding)', 'Receipt #R-1904 · Tuition & boarding', 'Cleared', 'is-mint', 'UGX 0 bal'],
        ['ST-0289 · P.7 North (Day)', '25% bursary applied · MTN MoMo part-pay', 'Reminder queued', 'is-amber', 'UGX 240,000'],
        ['ST-0519 · S.2 West (Boarding)', 'Bank deposit Slip #88412', 'Paid 850,000', 'is-mint', 'UGX 150,000'],
      ],
    },
    day: {
      billed: 'UGX 104.4M',
      collected: 'UGX 84.1M',
      outstanding: 'UGX 20.3M',
      rows: [
        ['ST-0289 · P.7 North (Day)', '25% bursary applied · MTN MoMo part-pay', 'Reminder queued', 'is-amber', 'UGX 240,000'],
        ['ST-0144 · P.5 East (Day)', 'Receipt #R-1911 · Airtel Money', 'Cleared', 'is-mint', 'UGX 0 bal'],
        ['ST-0308 · S.1 South (Day)', 'Sibling discount 10% · Cash counter', 'Part-paid', '', 'UGX 180,000'],
      ],
    },
    boarding: {
      billed: 'UGX 168.5M',
      collected: 'UGX 130.5M',
      outstanding: 'UGX 38.0M',
      rows: [
        ['ST-0412 · S.4 East (Boarding)', 'Receipt #R-1904 · Tuition & boarding', 'Cleared', 'is-mint', 'UGX 0 bal'],
        ['ST-0519 · S.2 West (Boarding)', 'Bank deposit Slip #88412', 'Paid 850,000', 'is-mint', 'UGX 150,000'],
        ['ST-0602 · S.6 Sciences (Boarding)', 'Special lab & boarding structure', 'Reminder queued', 'is-amber', 'UGX 390,000'],
      ],
    },
  };

  const schoolTabs = document.querySelectorAll('[data-school-tab]');
  const schoolRowsEl = document.getElementById('school-rows');
  schoolTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const view = schoolViews[tab.dataset.schoolTab];
      if (!view || !schoolRowsEl) return;
      schoolTabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));

      document.getElementById('sch-billed').textContent = view.billed;
      document.getElementById('sch-collected').textContent = view.collected;
      document.getElementById('sch-outstanding').textContent = view.outstanding;

      schoolRowsEl.innerHTML = view.rows
        .map(
          ([title, sub, badge, badgeCls, amt]) => `
          <div class="ui-row">
            <div>
              <span class="ui-row-main">${title}</span>
              <span class="ui-row-sub">${sub}</span>
            </div>
            <span class="ui-badge ${badgeCls}">${badge}</span>
            <span class="entry-amt">${amt}</span>
          </div>`
        )
        .join('');
    });
  });

  // Feature 3: Maker-Checker Approve toggle
  const approveBtn = document.getElementById('demo-approve-btn');
  const poBadge = document.getElementById('po-demo-badge');
  const poSub = document.getElementById('po-demo-sub');
  const poAudit = document.getElementById('po-audit-note');

  if (approveBtn && poBadge && poSub) {
    approveBtn.addEventListener('click', () => {
      const approved = approveBtn.dataset.approved !== 'true';
      approveBtn.dataset.approved = String(approved);
      if (approved) {
        approveBtn.textContent = 'Approved · Undo';
        poBadge.textContent = 'Approved & posted';
        poBadge.className = 'ui-badge is-mint';
        poSub.textContent = 'Checker sign-off recorded · Posted to Payables';
        if (poAudit) poAudit.textContent = 'Audit log updated: Checker approved PO-0418 just now';
      } else {
        approveBtn.textContent = '✓ Approve PO-0418';
        poBadge.textContent = 'Awaiting checker';
        poBadge.className = 'ui-badge is-amber';
        poSub.textContent = 'PO = GRN #219 = Supplier Bill · Variance UGX 0';
        if (poAudit) poAudit.textContent = 'Every approval records user, timestamp & audit trail';
      }
    });
  }

  /* =========================================================
     6. Pricing Controls (#pricing)
     ========================================================= */
  const dmSwitch = document.getElementById('dm-switch');
  const setupTotalDisplay = document.getElementById('setup-total-display');
  const setupSummaryAmt = document.getElementById('setup-summary-amt');
  const setupCaption = document.getElementById('setup-total-caption');
  const dmFeeLine = document.getElementById('dm-fee-line');
  const dmLineStatus = document.getElementById('dm-line-status');
  const bookSetupBtn = document.getElementById('book-setup-btn');
  let currentSetupTotal = 500000;

  if (dmSwitch) {
    dmSwitch.addEventListener('click', () => {
      const includeDm = dmSwitch.getAttribute('aria-checked') !== 'true';
      dmSwitch.setAttribute('aria-checked', String(includeDm));
      const nextTotal = includeDm ? 700000 : 500000;

      animateValue(setupTotalDisplay, currentSetupTotal, nextTotal, 220);
      animateValue(setupSummaryAmt, currentSetupTotal, nextTotal, 220);
      currentSetupTotal = nextTotal;

      if (setupCaption) {
        setupCaption.textContent = includeDm
          ? 'One-time total including optional historical data management (UGX 300,000)'
          : 'One-time total without optional data management (UGX 700,000 with data management)';
      }
      if (dmFeeLine) dmFeeLine.dataset.optionalOff = String(!includeDm);
      if (dmLineStatus) {
        dmLineStatus.textContent = includeDm
          ? 'Included in total · Historical records & opening balances'
          : 'Optional add-on · Toggle above to include';
      }
    });
  }

  if (bookSetupBtn) {
    bookSetupBtn.addEventListener('click', () => {
      const msgEl = document.getElementById('f-message');
      const includeDm = dmSwitch?.getAttribute('aria-checked') === 'true';
      if (msgEl && !msgEl.value.trim()) {
        msgEl.value = includeDm
          ? 'Interested in business implementation with optional data management (UGX 700,000 one-time).'
          : 'Interested in standard business implementation without data management (UGX 500,000 one-time).';
      }
    });
  }

  // School Monthly Subscription Estimator
  const studentSlider = document.getElementById('student-slider');
  const studentCountOut = document.getElementById('student-count-out');
  const schoolMonthlyOut = document.getElementById('school-monthly-out');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const bookMonthlyBtn = document.getElementById('book-monthly-btn');
  let schoolEstimatorTouched = false;

  function updateSchoolSlider(students, markTouched = false) {
    if (!studentSlider) return;
    const min = Number(studentSlider.min) || 50;
    const max = Number(studentSlider.max) || 2000;
    const val = Math.max(min, Math.min(max, Number(students) || 450));
    studentSlider.value = String(val);
    const pct = ((val - min) / (max - min)) * 100;
    studentSlider.style.setProperty('--fill', `${pct.toFixed(1)}%`);

    if (studentCountOut) studentCountOut.textContent = val.toLocaleString('en-US');
    if (schoolMonthlyOut) schoolMonthlyOut.textContent = `${formatUGX(val * 1000)} / mo`;

    presetBtns.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(Number(btn.dataset.students) === val));
    });
    if (markTouched) schoolEstimatorTouched = true;
  }

  if (studentSlider) {
    updateSchoolSlider(Number(studentSlider.value), false);
    studentSlider.addEventListener('input', () => {
      updateSchoolSlider(Number(studentSlider.value), true);
    });
    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        updateSchoolSlider(Number(btn.dataset.students), true);
      });
    });
  }

  function schoolSizeBucket(students) {
    if (students <= 300) return 'Up to 300 students';
    if (students <= 800) return '301–800 students';
    if (students <= 1500) return '801–1,500 students';
    return '1,501+ students';
  }

  if (bookMonthlyBtn) {
    bookMonthlyBtn.addEventListener('click', () => {
      if (!schoolEstimatorTouched || !studentSlider) return;
      const students = Number(studentSlider.value) || 450;
      const orgTypeEl = document.getElementById('f-org-type');
      const orgSizeEl = document.getElementById('f-org-size');
      const msgEl = document.getElementById('f-message');
      if (orgTypeEl) orgTypeEl.value = 'School';
      if (orgSizeEl) orgSizeEl.value = schoolSizeBucket(students);
      if (msgEl && !msgEl.value.trim()) {
        msgEl.value = `School with approximately ${students.toLocaleString('en-US')} students (${formatUGX(students * 1000)}/month subscription estimate). Please share a custom implementation quote.`;
      }
    });
  }

  /* =========================================================
     7. Audience / Quote Pre-fill Links
     ========================================================= */
  document.querySelectorAll('.js-prefill-org').forEach((link) => {
    link.addEventListener('click', () => {
      const orgType = link.dataset.orgType;
      const orgSize = link.dataset.orgSize;
      const isQuote = link.dataset.quote === 'true';

      const typeEl = document.getElementById('f-org-type');
      const sizeEl = document.getElementById('f-org-size');
      const msgEl = document.getElementById('f-message');

      if (typeEl && orgType) typeEl.value = orgType;
      if (sizeEl && orgSize) sizeEl.value = orgSize;
      if (isQuote && msgEl && !msgEl.value.trim()) {
        msgEl.value = 'Please prepare a custom implementation and monthly subscription quote for our organization.';
      }

      if (link.getAttribute('href') === '#book') {
        setTimeout(() => {
          document.getElementById('f-name')?.focus({ preventScroll: true });
        }, 350);
      }
    });
  });

  // Auto-suggest matching size group when organizationType changes
  const orgTypeSelect = document.getElementById('f-org-type');
  const orgSizeSelect = document.getElementById('f-org-size');
  if (orgTypeSelect && orgSizeSelect) {
    orgTypeSelect.addEventListener('change', () => {
      const t = orgTypeSelect.value;
      const cur = orgSizeSelect.value;
      if (t === 'School' && cur && !cur.includes('students')) {
        orgSizeSelect.value = '301–800 students';
      } else if (t && t !== 'School' && cur.includes('students')) {
        orgSizeSelect.value = t === 'Small business' ? '1–10 people' : t === 'Medium-sized business' ? '11–50 people' : '201+ people';
      }
    });
  }

  /* =========================================================
     8. Interruptible Smooth FAQ Accordion
     ========================================================= */
  document.querySelectorAll('details.faq-item').forEach((details) => {
    const summary = details.querySelector('summary');
    const body = details.querySelector('.faq-body');
    if (!summary || !body) return;

    let anim = null;

    summary.addEventListener('click', (e) => {
      if (prefersReducedMotion() || !body.animate) return;
      e.preventDefault();
      if (anim) anim.cancel();

      const isOpening = !details.open;
      if (isOpening) {
        const startHeight = 0;
        details.open = true;
        const endHeight = body.offsetHeight;
        anim = body.animate(
          [
            { height: `${startHeight}px`, opacity: 0 },
            { height: `${endHeight}px`, opacity: 1 },
          ],
          { duration: 220, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
        );
        anim.onfinish = () => {
          anim = null;
        };
      } else {
        const startHeight = body.offsetHeight;
        anim = body.animate(
          [
            { height: `${startHeight}px`, opacity: 1 },
            { height: '0px', opacity: 0 },
          ],
          { duration: 180, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
        );
        anim.onfinish = () => {
          details.open = false;
          anim = null;
        };
      }
    });
  });

  /* =========================================================
     9. Demo Booking Form Validation & Submission (#demo-form)
     ========================================================= */
  const form = document.getElementById('demo-form');
  const startedInput = document.getElementById('f-started');
  const dateInput = document.getElementById('f-date');
  const errorBanner = document.getElementById('form-error-banner');
  const submitBtn = document.getElementById('submit-demo-btn');
  const submitLabel = document.getElementById('submit-btn-label');
  const successPanel = document.getElementById('booking-success');
  const bookAnotherBtn = document.getElementById('book-another-btn');

  function eatDateISO(offsetDays = 0) {
    const d = new Date(Date.now() + 3 * 3600 * 1000 + offsetDays * 86400 * 1000);
    return d.toISOString().slice(0, 10);
  }

  if (startedInput) startedInput.value = String(Date.now());
  if (dateInput) {
    const minDate = eatDateISO(0);
    const maxDate = eatDateISO(365);
    dateInput.min = minDate;
    dateInput.max = maxDate;
    if (!dateInput.value) dateInput.value = eatDateISO(1);
  }

  const validators = {
    name: (v) => (v.trim().length >= 2 && v.trim().length <= 100 ? '' : 'Please enter your full name.'),
    organization: (v) =>
      v.trim().length >= 2 && v.trim().length <= 150 ? '' : 'Please enter your organization’s name.',
    organizationType: (v) =>
      ['Small business', 'Medium-sized business', 'Large organization', 'School'].includes(v)
        ? ''
        : 'Please choose an organization type.',
    organizationSize: (v) =>
      [
        '1–10 people',
        '11–50 people',
        '51–200 people',
        '201+ people',
        'Up to 300 students',
        '301–800 students',
        '801–1,500 students',
        '1,501+ students',
      ].includes(v)
        ? ''
        : 'Please choose your organization size.',
    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) && v.trim().length <= 254
        ? ''
        : 'Please enter a valid email address.',
    phone: (v) => {
      const clean = v.trim();
      const digits = clean.replace(/\D/g, '');
      return /^[+\d\s().-]+$/.test(clean) && digits.length >= 9 && digits.length <= 15
        ? ''
        : 'Please enter a valid phone number, e.g. +256 7XX XXX XXX.';
    },
    preferredDate: (v) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Please choose a preferred demo date.';
      if (v < eatDateISO(0)) return 'Please choose today or a future date.';
      if (v > eatDateISO(365)) return 'Please choose a date within the next 12 months.';
      return '';
    },
    message: (v) => {
      if (v.length > 2000) return 'Please keep your message under 2,000 characters.';
      if ((v.match(/https?:\/\//gi) || []).length > 2) return 'Please remove links from your message.';
      return '';
    },
  };

  function setFieldError(name, msg) {
    const errEl = form?.querySelector(`[data-err-for="${name}"]`);
    const control = form?.elements?.namedItem(name);
    const wrapper = control?.closest?.('.field');
    if (errEl) errEl.textContent = msg || '';
    if (wrapper) wrapper.dataset.invalid = msg ? 'true' : 'false';
    if (control && control.setAttribute) {
      if (msg) control.setAttribute('aria-invalid', 'true');
      else control.removeAttribute('aria-invalid');
    }
  }

  if (form) {
    Object.keys(validators).forEach((fieldName) => {
      const ctrl = form.elements.namedItem(fieldName);
      if (!ctrl || !ctrl.addEventListener) return;
      ctrl.addEventListener('blur', () => {
        setFieldError(fieldName, validators[fieldName](ctrl.value || ''));
      });
      ctrl.addEventListener('input', () => {
        const wrapper = ctrl.closest?.('.field');
        if (wrapper?.dataset.invalid === 'true') {
          setFieldError(fieldName, validators[fieldName](ctrl.value || ''));
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorBanner) errorBanner.hidden = true;

      const payload = {
        name: form.elements.name.value.trim(),
        organization: form.elements.organization.value.trim(),
        organizationType: form.elements.organizationType.value,
        organizationSize: form.elements.organizationSize.value,
        email: form.elements.email.value.trim(),
        phone: form.elements.phone.value.trim(),
        preferredDate: form.elements.preferredDate.value,
        message: form.elements.message.value.trim(),
        website: form.elements.website.value,
        startedAt: Number(form.elements.startedAt.value || Date.now()),
      };

      let firstInvalid = null;
      Object.keys(validators).forEach((key) => {
        const msg = validators[key](payload[key] || '');
        setFieldError(key, msg);
        if (msg && !firstInvalid) firstInvalid = form.elements.namedItem(key);
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (submitLabel) {
        submitLabel.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span> Sending request…';
      }

      try {
        const res = await fetch('/api/book-demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.ok) {
          if (data.errors && typeof data.errors === 'object') {
            let firstServerErr = null;
            Object.entries(data.errors).forEach(([k, v]) => {
              setFieldError(k, String(v));
              if (!firstServerErr) firstServerErr = form.elements.namedItem(k);
            });
            firstServerErr?.focus?.();
          }
          if (errorBanner) {
            errorBanner.textContent =
              data.message || 'We could not submit your request right now. Please check your details and try again.';
            errorBanner.hidden = false;
          }
          return;
        }

        const confirmName = document.getElementById('confirm-name');
        const confirmOrg = document.getElementById('confirm-org');
        const confirmRef = document.getElementById('confirm-ref');
        if (confirmName) confirmName.textContent = payload.name;
        if (confirmOrg) confirmOrg.textContent = payload.organization;
        if (confirmRef) confirmRef.textContent = data.reference || 'BOAT-RECEIVED';

        form.hidden = true;
        if (successPanel) successPanel.hidden = false;
      } catch {
        if (errorBanner) {
          errorBanner.textContent = 'Network error — please check your internet connection and try again.';
          errorBanner.hidden = false;
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (submitLabel) submitLabel.textContent = 'Book my demo';
      }
    });
  }

  if (bookAnotherBtn && form && successPanel) {
    bookAnotherBtn.addEventListener('click', () => {
      form.reset();
      if (dateInput) dateInput.value = eatDateISO(1);
      if (startedInput) startedInput.value = String(Date.now());
      Object.keys(validators).forEach((k) => setFieldError(k, ''));
      if (errorBanner) errorBanner.hidden = true;
      successPanel.hidden = true;
      form.hidden = false;
      document.getElementById('f-name')?.focus();
    });
  }
})();
