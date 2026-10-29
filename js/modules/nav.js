/**
 * Navigation Module - ECR Routine Web
 * Handles Topbar Header and Fixed Bottom Navigation (M3)
 */

import { store } from './state.js';
import { t } from './i18n.js';

// SVG Icons Constants
const ICONS = {
  pulse: `<svg class="nav-pulse-icon" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M4 16h5l2.5-6 4 13 4-9 2.5 4h6"/>
    <circle cx="4" cy="16" r="1.5" fill="currentColor"/>
    <circle cx="28" cy="18" r="1.5" fill="currentColor"/>
  </svg>`,
  sun: `<svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>`,
  moon: `<svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>`,
  share: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>`,
  calendar: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <path d="M12 14v4M10 16l2 2 2-2"/>
  </svg>`,
  install: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>`,
  today: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <circle cx="12" cy="15" r="2" fill="currentColor"/>
  </svg>`,
  routine: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>`,
  faculty: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>`,
  more: `<svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
    <circle cx="19" cy="12" r="2" fill="currentColor"/>
    <circle cx="5" cy="12" r="2" fill="currentColor"/>
  </svg>`
};

// Internal reference to deferred PWA install prompt
let deferredInstallPrompt = null;
let isPwaListenerInitialized = false;

// Toast helper
export function showToast(message) {
  if (typeof window.toast === 'function') {
    window.toast(message);
    return;
  }
  let toastEl = document.getElementById('toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'toast';
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(window.__ecrToastTimer);
  window.__ecrToastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2200);
}

// Resolve container element helper
function resolveContainer(container) {
  if (!container) return null;
  if (typeof container === 'string') {
    return document.querySelector(container);
  }
  return container;
}

/**
 * Handle URL sharing with fallback to clipboard
 */
async function handleShare() {
  const state = store.getState();
  const shareData = {
    title: `${t('appTitle', state.lang)} • ${t('deptTitle', state.lang)}`,
    text: `${t('appTitle', state.lang)} — 4th Semester Class Routine (ENT 4/2)`,
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  // Fallback to clipboard
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(window.location.href);
      showToast(t('copiedToClipboard', state.lang) || 'Link copied to clipboard!');
    } else {
      showToast(window.location.href);
    }
  } catch (clipboardErr) {
    showToast(window.location.href);
  }
}

/**
 * Handle Calendar Export
 */
function handleCalendarExport() {
  const state = store.getState();
  window.dispatchEvent(new CustomEvent('ecr:export-calendar', { detail: { state } }));
  if (typeof window.exportCalendar === 'function') {
    window.exportCalendar();
  } else {
    showToast(t('exportIcs', state.lang) || 'Exporting calendar...');
  }
}

/**
 * Handle Section Navigation Jump
 */
export function navigateToSection(sectionId) {
  if (typeof store.setActiveSection === 'function') {
    store.setActiveSection(sectionId);
  } else {
    store.state.activeSection = sectionId;
    store.notify(['activeSection']);
  }

  if (sectionId === 'today') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (sectionId === 'routine') {
    const routineEl = document.getElementById('routine');
    if (routineEl) {
      routineEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else if (sectionId === 'faculty') {
    const facultyEl = document.getElementById('faculty');
    if (facultyEl) {
      facultyEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else if (sectionId === 'more') {
    const moreEl = document.getElementById('more') || document.querySelector('footer');
    if (moreEl) {
      moreEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

/**
 * Render Header (Topbar) Component
 * @param {HTMLElement|string} containerEl - Target element or selector
 * @returns {HTMLElement} Mounted topbar element
 */
export function renderHeader(containerEl) {
  const container = resolveContainer(containerEl);
  if (!container) {
    console.error('[Nav] renderHeader: container element not found');
    return null;
  }

  const state = store.getState();
  const lang = state.lang || 'en';
  const theme = state.theme || 'dark';

  container.innerHTML = `
    <div class="topbar-inner">
      <a class="topbar-brand" href="#today" id="topbarBrandLink" aria-label="${t('appTitle', lang)}">
        <div class="nav-logo-box" aria-hidden="true">
          <img src="icons/cnpi-logo.png" alt="ENT Pulse Logo" class="nav-logo-img" />
        </div>
        <div class="topbar-brand-text">
          <div class="topbar-title-row">
            <span class="topbar-title" id="topbarTitle">${t('appTitle', lang)}</span>
            <span class="topbar-pill-badge">ENT 4/2</span>
          </div>
          <span class="topbar-subtitle" id="topbarSubtitle">${lang === 'bn' ? '৪র্থ পর্ব • ইলেকট্রনিক্স (CNPI)' : '4th Sem • Electronics (CNPI)'}</span>
        </div>
      </a>

      <div class="topbar-actions">
        <!-- Install app button (hidden by default) -->
        <button
          class="nav-action-btn nav-install-btn hidden"
          id="topbarInstallBtn"
          type="button"
          aria-label="${t('installApp', lang)}"
          title="${t('installApp', lang)}"
          hidden
          style="display: none;"
        >
          ${ICONS.install}
        </button>

        <!-- Calendar Export button -->
        <button
          class="nav-action-btn nav-calendar-btn"
          id="topbarCalendarBtn"
          type="button"
          aria-label="${t('exportIcs', lang)}"
          title="${t('exportIcs', lang)}"
        >
          ${ICONS.calendar}
        </button>

        <!-- Share button -->
        <button
          class="nav-action-btn nav-share-btn"
          id="topbarShareBtn"
          type="button"
          aria-label="${t('shareApp', lang)}"
          title="${t('shareApp', lang)}"
        >
          ${ICONS.share}
        </button>

        <!-- Bangla / Language toggle ('বাং' / 'EN') -->
        <button
          class="nav-action-btn nav-lang-btn"
          id="topbarLangBtn"
          type="button"
          aria-label="${t('toggleLanguage', lang)}"
          title="${t('toggleLanguage', lang)}"
        >
          ${lang === 'en' ? 'বাং' : 'EN'}
        </button>

        <!-- Theme toggle (sun/moon icon) -->
        <button
          class="nav-action-btn nav-theme-btn"
          id="topbarThemeBtn"
          type="button"
          aria-label="${t('toggleTheme', lang)}"
          title="${t('toggleTheme', lang)}"
        >
          ${theme === 'dark' ? ICONS.sun : ICONS.moon}
        </button>

        <!-- Academic Info Profile Avatar -->
        <button
          class="nav-profile-avatar-btn"
          id="topbarProfileBtn"
          type="button"
          aria-label="Academic Information"
          title="Academic Information"
        >
          <div class="nav-profile-inner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-profile-icon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </button>
      </div>
    </div>
  `;

  // Attach button event listeners
  const brandLink = container.querySelector('#topbarBrandLink');
  const themeBtn = container.querySelector('#topbarThemeBtn');
  const langBtn = container.querySelector('#topbarLangBtn');
  const shareBtn = container.querySelector('#topbarShareBtn');
  const calendarBtn = container.querySelector('#topbarCalendarBtn');
  const installBtn = container.querySelector('#topbarInstallBtn');
  const profileBtn = container.querySelector('#topbarProfileBtn');

  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      const moreEl = document.getElementById('more') || document.querySelector('footer');
      if (moreEl) {
        moreEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (brandLink) {
    brandLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToSection('today');
    });
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      store.toggleTheme();
    });
  }

  if (langBtn) {
    langBtn.addEventListener('click', () => {
      store.toggleLang();
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      handleShare();
    });
  }

  if (calendarBtn) {
    calendarBtn.addEventListener('click', () => {
      handleCalendarExport();
    });
  }

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        try {
          const choiceResult = await deferredInstallPrompt.userChoice;
          if (choiceResult.outcome === 'accepted') {
            showToast('ENT Pulse installing...');
          }
        } finally {
          deferredInstallPrompt = null;
          installBtn.classList.add('hidden');
          installBtn.setAttribute('hidden', '');
          installBtn.style.display = 'none';
        }
      }
    });
  }

  // Set up PWA installation listeners once
  if (!isPwaListenerInitialized && typeof window !== 'undefined') {
    isPwaListenerInitialized = true;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      const btn = document.getElementById('topbarInstallBtn');
      if (btn) {
        btn.classList.remove('hidden');
        btn.removeAttribute('hidden');
        btn.style.display = 'inline-flex';
      }
    });

    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      const btn = document.getElementById('topbarInstallBtn');
      if (btn) {
        btn.classList.add('hidden');
        btn.setAttribute('hidden', '');
        btn.style.display = 'none';
      }
      showToast('ENT Pulse installed');
    });
  }

  return container;
}

/**
 * Render Bottom Navigation Bar Component
 * @param {HTMLElement|string} containerEl - Target element or selector
 * @returns {HTMLElement} Mounted bottom navigation element
 */
export function renderBottomNav(containerEl) {
  const container = resolveContainer(containerEl);
  if (!container) {
    console.error('[Nav] renderBottomNav: container element not found');
    return null;
  }

  const state = store.getState();
  const lang = state.lang || 'en';
  const activeSection = state.activeSection || 'today';

  const navItems = [
    { id: 'today', labelKey: 'navToday', icon: ICONS.today },
    { id: 'routine', labelKey: 'navRoutine', icon: ICONS.routine },
    { id: 'faculty', labelKey: 'navFaculty', icon: ICONS.faculty },
    { id: 'more', labelKey: 'navMore', icon: ICONS.more }
  ];

  container.innerHTML = `
    <nav class="app-bottom-nav bottom-nav" id="appBottomNav" aria-label="Main Navigation">
      <div class="bottom-nav-inner">
        ${navItems.map(item => `
          <button
            class="bottom-nav-item ${activeSection === item.id ? 'active' : ''}"
            data-nav="${item.id}"
            type="button"
            aria-label="${t(item.labelKey, lang)}"
          >
            <div class="bottom-nav-indicator">
              ${item.icon}
            </div>
            <span class="bottom-nav-label" data-label-key="${item.labelKey}">
              ${t(item.labelKey, lang)}
            </span>
          </button>
        `).join('')}
      </div>
    </nav>
  `;

  // Attach navigation item listeners
  const buttons = container.querySelectorAll('.bottom-nav-item');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const navId = btn.getAttribute('data-nav');
      navigateToSection(navId);
    });
  });

  return container.firstElementChild;
}

/**
 * Initializes automatic ScrollSpy to update active bottom nav tab on user scroll
 */
export function initScrollSpy() {
  const sections = ['today', 'routine', 'faculty', 'more'];
  const sectionEls = sections.map(id => document.getElementById(id)).filter(Boolean);
  
  if (!('IntersectionObserver' in window) || sectionEls.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    const visibleEntries = entries.filter(e => e.isIntersecting);
    if (visibleEntries.length > 0) {
      visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      const topSectionId = visibleEntries[0].target.id;
      if (topSectionId && store.getState().activeSection !== topSectionId) {
        store.setActiveSection(topSectionId);
      }
    }
  }, {
    rootMargin: '-70px 0px -40% 0px',
    threshold: [0.1, 0.4]
  });

  sectionEls.forEach(el => observer.observe(el));
}

/**
 * Subscribe to Store Updates
 * Reacts to language, theme, and activeSection changes
 */
store.subscribe((state, changedKeys) => {
  const lang = state.lang || 'en';
  const theme = state.theme || 'dark';
  const activeSection = state.activeSection || 'today';

  // 1. Language Changes
  if (changedKeys.includes('lang')) {
    const titleEl = document.getElementById('topbarTitle');
    const subtitleEl = document.getElementById('topbarSubtitle');
    const brandLink = document.getElementById('topbarBrandLink');
    const langBtn = document.getElementById('topbarLangBtn');
    const themeBtn = document.getElementById('topbarThemeBtn');
    const shareBtn = document.getElementById('topbarShareBtn');
    const calendarBtn = document.getElementById('topbarCalendarBtn');
    const installBtn = document.getElementById('topbarInstallBtn');

    if (titleEl) titleEl.textContent = t('appTitle', lang);
    if (subtitleEl) subtitleEl.textContent = t('deptTitle', lang);
    if (brandLink) brandLink.setAttribute('aria-label', t('appTitle', lang));

    if (langBtn) {
      langBtn.textContent = lang === 'en' ? 'বাং' : 'EN';
      langBtn.setAttribute('aria-label', t('toggleLanguage', lang));
      langBtn.setAttribute('title', t('toggleLanguage', lang));
    }

    if (themeBtn) {
      themeBtn.setAttribute('aria-label', t('toggleTheme', lang));
      themeBtn.setAttribute('title', t('toggleTheme', lang));
    }

    if (shareBtn) {
      shareBtn.setAttribute('aria-label', t('shareApp', lang));
      shareBtn.setAttribute('title', t('shareApp', lang));
    }

    if (calendarBtn) {
      calendarBtn.setAttribute('aria-label', t('exportIcs', lang));
      calendarBtn.setAttribute('title', t('exportIcs', lang));
    }

    if (installBtn) {
      installBtn.setAttribute('aria-label', t('installApp', lang));
      installBtn.setAttribute('title', t('installApp', lang));
    }

    // Update Bottom Nav labels
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      const navId = item.getAttribute('data-nav');
      const labelKey = `nav${navId.charAt(0).toUpperCase() + navId.slice(1)}`;
      const localizedLabel = t(labelKey, lang);
      item.setAttribute('aria-label', localizedLabel);
      const labelEl = item.querySelector('.bottom-nav-label');
      if (labelEl) {
        labelEl.textContent = localizedLabel;
      }
    });
  }

  // 2. Theme Changes
  if (changedKeys.includes('theme')) {
    const themeBtn = document.getElementById('topbarThemeBtn');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
      themeBtn.setAttribute('aria-label', t('toggleTheme', lang));
      themeBtn.setAttribute('title', t('toggleTheme', lang));
    }
  }

  // 3. Active Section Changes
  if (changedKeys.includes('activeSection')) {
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      const navId = item.getAttribute('data-nav');
      if (navId === activeSection) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
});
