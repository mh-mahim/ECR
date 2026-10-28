/**
 * Application Orchestrator - ENT Pulse / ECR Web
 * Material Design 3 Class Routine Web App
 * Session: 2026-27 | ENT 4/2 | CNPI
 */

import { store } from './modules/state.js';
import { t } from './modules/i18n.js';
import { renderHeader, renderBottomNav } from './modules/nav.js';
import { renderHero, startHeroTimer } from './modules/hero.js';
import { renderRoutineViews } from './modules/routine-views.js';
import { renderSearchBar, renderFacultySection, setupModalManager, showToast } from './modules/search-modals.js';
import { renderNoticeBanner, generateIcsCalendar, initPwa } from './modules/utilities.js';

// Expose globals for inline button fallbacks
window.generateIcsCalendar = generateIcsCalendar;
window.showToast = showToast;

document.addEventListener('DOMContentLoaded', () => {
  const state = store.getState();

  // 1. Synchronize initial Theme & Language to DOM
  document.documentElement.setAttribute('data-theme', state.theme);
  document.body.setAttribute('data-theme', state.theme);
  document.documentElement.setAttribute('lang', state.lang);

  // 2. Parse URL query params for deep-linking (e.g. ?day=Monday&q=DE-2)
  const params = new URLSearchParams(window.location.search);
  const paramDay = params.get('day');
  if (paramDay && ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].includes(paramDay)) {
    store.setSelectedDay(paramDay);
  }
  const paramQuery = params.get('q') || params.get('search');
  if (paramQuery) {
    store.setSearchQuery(paramQuery);
  }
  const paramView = params.get('view');
  if (paramView && ['day', 'week'].includes(paramView.toLowerCase())) {
    store.setViewMode(paramView.toLowerCase());
  }

  // 3. Mount App Header
  const headerContainer = document.getElementById('headerMount');
  if (headerContainer) {
    renderHeader(headerContainer);
  }

  // 4. Mount Announcement / Notice Banner
  const noticeContainer = document.getElementById('noticeMount');
  if (noticeContainer) {
    renderNoticeBanner(noticeContainer);
  }

  // 5. Mount Now-Next Hero Console & start live timer
  const heroContainer = document.getElementById('heroMount');
  if (heroContainer) {
    renderHero(heroContainer);
    startHeroTimer(heroContainer);
  }

  // 6. Mount Search Bar & Filter Chips
  const searchContainer = document.getElementById('searchMount');
  if (searchContainer) {
    renderSearchBar(searchContainer);
  }

  // 7. Mount Routine Views (Day View & Week View Matrix)
  const routineContainer = document.getElementById('routineMount');
  if (routineContainer) {
    renderRoutineViews(routineContainer);
  }

  // 8. Mount Faculty Directory
  const facultyContainer = document.getElementById('facultyMount');
  if (facultyContainer) {
    renderFacultySection(facultyContainer);
  }

  // 9. Mount Bottom Navigation Bar
  const bottomNavContainer = document.getElementById('bottomNavMount');
  if (bottomNavContainer) {
    renderBottomNav(bottomNavContainer);
  }

  // 10. Mount Modal System & Toast Manager
  setupModalManager();

  // 11. Listen for Calendar Export event
  window.addEventListener('ecr:export-calendar', () => {
    generateIcsCalendar();
  });

  // 12. Initialize PWA Service Worker & Install Handler
  const installBtn = document.getElementById('installAppBtn');
  initPwa(installBtn);

  // 13. Dynamic footer localization
  const updateFooter = () => {
    const lang = store.getState().lang;
    const footerCredit = document.getElementById('footerCredit');
    if (footerCredit) {
      footerCredit.innerHTML = lang === 'bn'
        ? `তৈরি ও রক্ষণাবেক্ষণে: <a href="https://mhmahim.me" target="_blank" rel="noopener noreferrer">মো. মাহিম (M. H. Mahim)</a> • ক্লাস রিপ্রেজেন্টেটিভ`
        : `Developed & maintained by <a href="https://mhmahim.me" target="_blank" rel="noopener noreferrer">M. H. Mahim</a> • Class Representative`;
    }
  };
  updateFooter();
  store.subscribe((_, changed) => {
    if (changed.includes('lang')) updateFooter();
  });

  // Remove preloader if present
  document.body.classList.add('app-loaded');
});
