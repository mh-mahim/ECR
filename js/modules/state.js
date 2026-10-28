/**
 * State Management & Event Bus - ECR Routine Web
 * Centralized store with localStorage persistence
 */

import { getDhakaNow } from './time-engine.js';
import { WORKING_DAYS } from '../data/routine-data.js';

const STORAGE_KEY_THEME = 'ecr_theme_pref';
const STORAGE_KEY_LANG = 'ecr_lang_pref';
const STORAGE_KEY_VIEW = 'ecr_view_pref';
const STORAGE_KEY_NOTICE = 'ecr_notice_dismissed_v1';

class Store {
  constructor() {
    const dhaka = getDhakaNow();
    const isTodayWorking = WORKING_DAYS.some(d => d.id === dhaka.day);
    const initialDay = isTodayWorking ? dhaka.day : 'Sunday';

    // Retrieve saved preferences or defaults
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
    const savedLang = localStorage.getItem(STORAGE_KEY_LANG) || 'en';
    const savedView = localStorage.getItem(STORAGE_KEY_VIEW) || 'day';
    const savedNoticeDismissed = localStorage.getItem(STORAGE_KEY_NOTICE) === 'true';

    this.state = {
      theme: savedTheme,
      lang: savedLang,
      viewMode: savedView, // 'day' | 'week'
      selectedDay: initialDay,
      searchQuery: '',
      filterType: 'all', // 'all' | 'lab' | 'theory'
      activeModal: null, // null | { type: 'class' | 'faculty' | 'notice', data: ... }
      noticeDismissed: savedNoticeDismissed
    };

    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(changedKeys = []) {
    for (const listener of this.listeners) {
      listener(this.state, changedKeys);
    }
  }

  setTheme(theme) {
    if (this.state.theme === theme) return;
    this.state.theme = theme;
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    this.notify(['theme']);
  }

  toggleTheme() {
    const nextTheme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setLang(lang) {
    if (this.state.lang === lang) return;
    this.state.lang = lang;
    localStorage.setItem(STORAGE_KEY_LANG, lang);
    document.documentElement.setAttribute('lang', lang);
    this.notify(['lang']);
  }

  toggleLang() {
    const nextLang = this.state.lang === 'en' ? 'bn' : 'en';
    this.setLang(nextLang);
  }

  setViewMode(viewMode) {
    if (this.state.viewMode === viewMode) return;
    this.state.viewMode = viewMode;
    localStorage.setItem(STORAGE_KEY_VIEW, viewMode);
    this.notify(['viewMode']);
  }

  setSelectedDay(day) {
    if (this.state.selectedDay === day) return;
    this.state.selectedDay = day;
    this.notify(['selectedDay']);
  }

  setSearchQuery(query) {
    this.state.searchQuery = query || '';
    this.notify(['searchQuery']);
  }

  setFilterType(type) {
    if (this.state.filterType === type) return;
    this.state.filterType = type;
    this.notify(['filterType']);
  }

  openModal(type, data) {
    this.state.activeModal = { type, data };
    this.notify(['activeModal']);
  }

  closeModal() {
    if (!this.state.activeModal) return;
    this.state.activeModal = null;
    this.notify(['activeModal']);
  }

  dismissNotice() {
    this.state.noticeDismissed = true;
    localStorage.setItem(STORAGE_KEY_NOTICE, 'true');
    this.notify(['noticeDismissed']);
  }
}

export const store = new Store();
