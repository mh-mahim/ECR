/**
 * Search, Filters, Faculty Directory & Modals Module
 * ECR Routine Web • Material Design 3
 */

import { TEACHERS, getTeacherByCode } from '../data/faculty-data.js';
import { SUBJECTS, WORKING_DAYS } from '../data/routine-data.js';
import { store } from './state.js';
import { t, toBanglaDigits } from './i18n.js';

let toastTimeoutId = null;
let modalManagerInitialized = false;

/* ==========================================================================
   Helper Utilities
   ========================================================================== */

/**
 * Escapes HTML entities to prevent XSS
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, (match) => {
    switch (match) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return match;
    }
  });
}

/**
 * Formats time string (e.g. "01:30 PM") with optional Bangla digit conversion
 */
function formatTime(timeStr, lang = 'en') {
  if (!timeStr) return '';
  const cleanTime = String(timeStr).replace(/^0(?=\d)/, '');
  return lang === 'bn' ? toBanglaDigits(cleanTime) : cleanTime;
}

/**
 * Resolve target container element from string selector or Element
 */
function resolveElement(target) {
  if (!target) return null;
  if (typeof target === 'string') {
    return document.querySelector(target);
  }
  return target instanceof Element ? target : null;
}

/**
 * Safely copy text to user clipboard with toast feedback
 */
async function copyToClipboard(text, successToastMsg) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    showToast(successToastMsg || 'Copied to clipboard!');
  } catch (err) {
    console.warn('Clipboard write failed, showing raw content:', err);
    showToast(text);
  }
}

/**
 * Native Web Share with clipboard fallback
 */
async function shareContent(shareData, fallbackToastMsg) {
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      if (err.name === 'AbortError') return; // User cancelled
    }
  }
  const textToCopy = `${shareData.title || ''}\n${shareData.text || ''}\n${shareData.url || ''}`.trim();
  await copyToClipboard(textToCopy, fallbackToastMsg || 'Details copied to clipboard!');
}

/* ==========================================================================
   Toast Notification Pill
   ========================================================================== */

/**
 * Displays an M3 toast notification pill at the bottom-center
 * @param {string} message - Text or message to display
 * @param {number} [duration=2200] - Duration in ms before auto-dismissal
 */
export function showToast(message, duration = 2200) {
  let toastEl = document.getElementById('toast') || document.querySelector('.toast-pill') || document.querySelector('.toast');

  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'toast';
    toastEl.className = 'toast-pill toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }

  // Render toast message with check icon
  toastEl.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
    <span>${escapeHtml(message)}</span>
  `;

  // Force reflow and show
  toastEl.classList.remove('show');
  void toastEl.offsetWidth;
  toastEl.classList.add('show');

  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }

  toastTimeoutId = setTimeout(() => {
    toastEl.classList.remove('show');
    toastTimeoutId = null;
  }, duration);
}

/* ==========================================================================
   Search Bar (M3 Pill Design)
   ========================================================================== */

/**
 * Renders the clean M3 Search Bar into containerEl
 * Wires search input to store.setSearchQuery
 * @param {string|Element} containerEl - Container element or CSS selector
 */
export function renderSearchBar(containerEl) {
  const container = resolveElement(containerEl);
  if (!container) {
    console.warn('[search-modals] renderSearchBar: container element not found:', containerEl);
    return;
  }

  const { lang, searchQuery } = store.getState();

  // Clean Search markup with M3 container, search icon, and clear button
  container.innerHTML = `
    <div class="search-bar">
      <svg class="search-icon search-ico" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7"/>
        <path d="m16.5 16.5 4.5 4.5"/>
      </svg>
      <input 
        type="search" 
        class="search-input" 
        id="routineSearchInput" 
        placeholder="${escapeHtml(t('searchPlaceholder', lang))}"
        value="${escapeHtml(searchQuery || '')}"
        aria-label="${escapeHtml(t('searchPlaceholder', lang))}"
        autocomplete="off"
        spellcheck="false"
      />
      <button 
        type="button" 
        class="search-clear-btn ${searchQuery ? 'is-visible' : ''}" 
        id="routineSearchClearBtn" 
        aria-label="${escapeHtml(t('clearSearch', lang))}"
        title="${escapeHtml(t('clearSearch', lang))}"
        tabindex="${searchQuery ? '0' : '-1'}"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `;

  const inputEl = container.querySelector('#routineSearchInput');
  const clearBtn = container.querySelector('#routineSearchClearBtn');

  // Input event: wire to store
  if (inputEl) {
    inputEl.addEventListener('input', (e) => {
      const val = e.target.value;
      store.setSearchQuery(val);
      if (clearBtn) {
        if (val) {
          clearBtn.classList.add('is-visible');
          clearBtn.setAttribute('tabindex', '0');
        } else {
          clearBtn.classList.remove('is-visible');
          clearBtn.setAttribute('tabindex', '-1');
        }
      }
    });

    // Clear search on Escape key inside input
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && inputEl.value) {
        e.stopPropagation();
        inputEl.value = '';
        store.setSearchQuery('');
        if (clearBtn) {
          clearBtn.classList.remove('is-visible');
          clearBtn.setAttribute('tabindex', '-1');
        }
      }
    });
  }

  // Clear button click
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (inputEl) {
        inputEl.value = '';
        inputEl.focus();
      }
      store.setSearchQuery('');
      clearBtn.classList.remove('is-visible');
      clearBtn.setAttribute('tabindex', '-1');
    });
  }

  // Store subscription to update search placeholder & input value on state changes
  store.subscribe((state, changedKeys) => {
    if (changedKeys.includes('lang')) {
      const currentLang = state.lang;
      if (inputEl) {
        inputEl.setAttribute('placeholder', t('searchPlaceholder', currentLang));
        inputEl.setAttribute('aria-label', t('searchPlaceholder', currentLang));
      }
      if (clearBtn) {
        clearBtn.setAttribute('aria-label', t('clearSearch', currentLang));
        clearBtn.setAttribute('title', t('clearSearch', currentLang));
      }
    }

    if (changedKeys.includes('searchQuery')) {
      if (inputEl && inputEl.value !== state.searchQuery) {
        inputEl.value = state.searchQuery;
      }
      if (clearBtn) {
        if (state.searchQuery) {
          clearBtn.classList.add('is-visible');
          clearBtn.setAttribute('tabindex', '0');
        } else {
          clearBtn.classList.remove('is-visible');
          clearBtn.setAttribute('tabindex', '-1');
        }
      }
    }
  });
}

/* ==========================================================================
   Faculty Directory Section
   ========================================================================== */

/**
 * Extracts initials from teacher code or full name
 */
function getTeacherInitials(name, code) {
  if (code && code.length <= 3) return code;
  if (!name) return 'FC';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Renders the responsive Faculty Directory Grid into containerEl with Section Header
 * 1 column on mobile, 2 columns on tablet/desktop.
 * Clicking a teacher card opens their profile in the modal.
 * Clicking the phone call button triggers direct tel: call.
 * @param {string|Element} containerEl - Container element or CSS selector
 */
export function renderFacultySection(containerEl) {
  const container = resolveElement(containerEl);
  if (!container) {
    console.warn('[search-modals] renderFacultySection: container element not found:', containerEl);
    return;
  }

  function renderContent() {
    const { lang } = store.getState();
    const sectionTitle = t('facultySectionKicker', lang);
    const sectionSubtitle = t('facultySectionTitle', lang);
    const totalTeachers = lang === 'bn' 
      ? `${toBanglaDigits(TEACHERS.length)} জন শিক্ষক` 
      : `${TEACHERS.length} Faculty Members`;

    const cardsHtml = TEACHERS.map((teacher) => {
      const name = teacher.name?.[lang] || teacher.name?.en || '';
      const subject = teacher.subject?.[lang] || teacher.subject?.en || '';
      const designation = teacher.designation?.[lang] || teacher.designation?.en || '';
      const courseCode = lang === 'bn' ? toBanglaDigits(teacher.course) : teacher.course;
      const initials = getTeacherInitials(teacher.name?.en || teacher.code, teacher.code);
      const isClassTeacher = Boolean(teacher.isClassTeacher);
      const classTeacherLabel = lang === 'bn' ? 'ক্লাস শিক্ষক' : 'Class Teacher';
      const callFacultyTitle = lang === 'bn' ? 'শিক্ষককে কল করুন' : 'Call Faculty';

      return `
        <article 
          class="faculty-card" 
          data-teacher-code="${escapeHtml(teacher.code)}"
          tabindex="0"
          role="button"
          aria-label="${escapeHtml(name)} - ${escapeHtml(subject)}"
        >
          <div class="avatar3d faculty-avatar" aria-hidden="true">${escapeHtml(initials)}</div>

          <div class="faculty-info">
            <h3 class="faculty-name">${escapeHtml(name)}</h3>
            <p class="faculty-designation">${escapeHtml(designation)}</p>
            
            <div class="faculty-meta faculty-chips">
              <span class="faculty-chip-tag">${escapeHtml(courseCode)}</span>
              <span class="faculty-chip-tag">${escapeHtml(teacher.code)}</span>
              ${isClassTeacher ? `<span class="faculty-class-teacher-badge">★ ${escapeHtml(classTeacherLabel)}</span>` : ''}
            </div>
          </div>

          <a 
            class="call-btn faculty-call-btn" 
            href="tel:${escapeHtml(teacher.phone)}" 
            aria-label="${escapeHtml(callFacultyTitle)}: ${escapeHtml(name)}"
            title="${escapeHtml(callFacultyTitle)}"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </a>
        </article>
      `;
    }).join('');

    container.innerHTML = `
      <div class="section-header faculty-header">
        <div class="section-header-text">
          <div class="section-kicker">
            <svg class="section-kicker-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>${escapeHtml(sectionTitle)}</span>
          </div>
          <h2 class="section-title">${escapeHtml(sectionSubtitle)}</h2>
        </div>
        <span class="section-badge">${escapeHtml(totalTeachers)}</span>
      </div>
      <div class="faculty-grid">
        ${cardsHtml}
      </div>
    `;

    // Attach card click handlers (opens faculty modal)
    container.querySelectorAll('.faculty-card').forEach((card) => {
      const teacherCode = card.getAttribute('data-teacher-code');
      const teacher = getTeacherByCode(teacherCode);

      card.addEventListener('click', (e) => {
        if (e.target.closest('.call-btn, .faculty-call-btn')) return;
        if (teacher) {
          store.openModal('faculty', teacher);
        }
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.closest('.call-btn, .faculty-call-btn')) return;
          e.preventDefault();
          if (teacher) {
            store.openModal('faculty', teacher);
          }
        }
      });
    });

    // Stop propagation on call buttons
    container.querySelectorAll('.call-btn, .faculty-call-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });
  }

  // Initial render
  renderContent();

  // Re-render when language changes
  store.subscribe((state, changedKeys) => {
    if (changedKeys.includes('lang')) {
      renderContent();
    }
  });
}

/* ==========================================================================
   Modal Manager (Class Details & Faculty Profile)
   ========================================================================== */

/**
 * Ensures modal DOM elements exist and sets up modal manager listeners
 * Listens to store.activeModal and displays either class details or faculty profile.
 * Supports bottom-sheet mobile interaction, backdrop tap, and Escape key dismissal.
 */
export function setupModalManager() {
  if (modalManagerInitialized) return;
  modalManagerInitialized = true;

  // Find existing overlay/modal or inject if absent
  let overlayEl = document.getElementById('overlay') || document.querySelector('.modal-overlay') || document.querySelector('.overlay');

  if (!overlayEl) {
    overlayEl = document.createElement('div');
    overlayEl.id = 'overlay';
    overlayEl.className = 'modal-overlay overlay';
    overlayEl.setAttribute('role', 'dialog');
    overlayEl.setAttribute('aria-modal', 'true');
    overlayEl.setAttribute('aria-hidden', 'true');

    overlayEl.innerHTML = `
      <div class="modal-sheet modal" role="document">
        <div class="modal-grab-handle grab" aria-hidden="true"></div>
        <div class="modal-header modal-top">
          <span class="modal-badge badge primary" id="modalTag">Details</span>
          <button class="modal-close-btn close" id="modalCloseBtn" type="button" aria-label="Close modal">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body" id="modalBody"></div>
      </div>
    `;
    document.body.appendChild(overlayEl);
  } else {
    overlayEl.classList.add('modal-overlay');
    const sheetEl = overlayEl.querySelector('.modal, .modal-sheet');
    if (sheetEl) sheetEl.classList.add('modal-sheet');
  }

  const modalBody = overlayEl.querySelector('#modalBody') || overlayEl.querySelector('.modal-body');
  const modalTag = overlayEl.querySelector('#modalTag') || overlayEl.querySelector('.modal-badge');
  const closeBtn = overlayEl.querySelector('.modal-close-btn, .close');

  function closeModal() {
    overlayEl.classList.remove('show', 'active');
    overlayEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openModal() {
    overlayEl.classList.add('show', 'active');
    overlayEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 60);
    }
  }

  // Backdrop click listener
  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) {
      store.closeModal();
    }
  });

  // Close button click listener
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      store.closeModal();
    });
  }

  // Escape key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && store.getState().activeModal) {
      store.closeModal();
    }
  });

  /**
   * Renders Class Details content inside modalBody
   */
  function renderClassModal(classData, lang) {
    const teacher = getTeacherByCode(classData.teacher);
    const teacherName = teacher?.name?.[lang] || teacher?.name?.en || classData.teacher || 'N/A';
    const teacherPhone = teacher?.phone || '';

    // Subject title
    const subjectEntry = SUBJECTS[classData.course];
    const subjectName = subjectEntry?.name?.[lang] || subjectEntry?.name?.en || classData.subject || 'Class';
    const courseCode = lang === 'bn' ? toBanglaDigits(classData.course) : classData.course;

    // Time & period calculation
    const startPeriodNum = classData.periodStart || classData.p || 1;
    const endPeriodNum = classData.periodEnd || (startPeriodNum + (classData.span || 1) - 1);
    const periodRange = startPeriodNum === endPeriodNum 
      ? `${startPeriodNum}` 
      : `${startPeriodNum}–${endPeriodNum}`;
    const periodLabel = lang === 'bn'
      ? `${toBanglaDigits(periodRange)} ${t('period', lang)}`
      : `${classData.span > 1 ? 'Periods' : 'Period'} ${periodRange}`;

    // Precise start & end time
    const startTime = classData.startTime || classData.start || '';
    const endTime = classData.endTime || classData.end || '';
    const timeRange = (startTime && endTime)
      ? `${formatTime(startTime, lang)} ${t('to', lang)} ${formatTime(endTime, lang)}`
      : (classData.time ? formatTime(classData.time, lang) : '');

    // Localized Day Name
    const dayObj = WORKING_DAYS.find(d => d.id === classData.day);
    const dayLabel = dayObj ? (lang === 'bn' ? dayObj.bn : dayObj.en) : (classData.day || '');

    const subheaderParts = [dayLabel, timeRange, periodLabel].filter(Boolean);
    const subheader = subheaderParts.join(' • ');

    // Type: Theory vs Practical Lab
    const isLab = (classData.type && classData.type.toLowerCase().includes('lab')) ||
                  (classData.room && classData.room.toLowerCase().includes('lab'));
    const typeLabel = isLab ? t('lab', lang) : t('theory', lang);

    // Modal tag
    if (modalTag) {
      modalTag.textContent = lang === 'bn' ? 'ক্লাসের বিবরণ' : 'Class Details';
    }

    modalBody.innerHTML = `
      <div class="modal-title-wrap">
        <h2 class="modal-title">${escapeHtml(subjectName)}</h2>
        <div class="modal-lead modal-subtitle">${escapeHtml(subheader)}</div>
      </div>

      <div class="modal-detail-grid detail-grid">
        <div class="modal-detail-item detail">
          <span class="detail-label">${escapeHtml(t('courseCode', lang))}</span>
          <b class="detail-value mono highlight">${escapeHtml(courseCode)}</b>
        </div>

        <div class="modal-detail-item detail">
          <span class="detail-label">${escapeHtml(t('faculty', lang))}</span>
          <b class="detail-value">${escapeHtml(teacherName)} (${escapeHtml(classData.teacher)})</b>
        </div>

        <div class="modal-detail-item detail">
          <span class="detail-label">${escapeHtml(t('room', lang))}</span>
          <b class="detail-value">${escapeHtml(classData.room || 'N/A')}</b>
        </div>

        <div class="modal-detail-item detail">
          <span class="detail-label">${escapeHtml(t('type', lang))}</span>
          <b class="detail-value">${escapeHtml(typeLabel)}</b>
        </div>
      </div>

      <div class="modal-actions">
        ${teacherPhone ? `
          <a class="modal-btn primary modal-btn-primary" href="tel:${escapeHtml(teacherPhone)}">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span>${escapeHtml(t('callFaculty', lang))}</span>
          </a>
        ` : `
          <button type="button" class="modal-btn primary modal-btn-primary" id="btnViewTeacherProfile">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="7" r="4"/><path d="M6 21v-2a6 6 0 0 1 12 0v2"/>
            </svg>
            <span>${escapeHtml(lang === 'bn' ? 'শিক্ষকের প্রোফাইল' : 'Teacher Profile')}</span>
          </button>
        `}

        <button type="button" class="modal-btn secondary modal-btn-secondary" id="btnCopyCourseCode">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          <span>${escapeHtml(t('copyCode', lang))}</span>
        </button>

        <button type="button" class="modal-btn tertiary modal-btn-tertiary" id="btnShareClass">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>
          </svg>
          <span>${escapeHtml(lang === 'bn' ? 'শেয়ার' : 'Share')}</span>
        </button>
      </div>
    `;

    // Wire action buttons
    const btnCopyCode = modalBody.querySelector('#btnCopyCourseCode');
    if (btnCopyCode) {
      btnCopyCode.addEventListener('click', () => {
        copyToClipboard(classData.course, t('copiedToClipboard', lang));
      });
    }

    const btnShare = modalBody.querySelector('#btnShareClass');
    if (btnShare) {
      btnShare.addEventListener('click', () => {
        shareContent({
          title: `ENT Pulse: ${subjectName}`,
          text: `${subjectName} (${classData.course}) • ${dayLabel} • Room: ${classData.room} • Faculty: ${teacherName} (${classData.teacher})`,
          url: window.location.href
        }, t('copiedToClipboard', lang));
      });
    }

    const btnTeacherProfile = modalBody.querySelector('#btnViewTeacherProfile');
    if (btnTeacherProfile && teacher) {
      btnTeacherProfile.addEventListener('click', () => {
        store.openModal('faculty', teacher);
      });
    }
  }

  /**
   * Renders Faculty Profile content inside modalBody
   */
  function renderFacultyModal(teacherData, lang) {
    const teacher = typeof teacherData === 'string' ? getTeacherByCode(teacherData) : teacherData;
    if (!teacher) return;

    const name = teacher.name?.[lang] || teacher.name?.en || 'Teacher';
    const designation = teacher.designation?.[lang] || teacher.designation?.en || '';
    const subject = teacher.subject?.[lang] || teacher.subject?.en || '';
    const courseCode = lang === 'bn' ? toBanglaDigits(teacher.course) : teacher.course;
    const phone = lang === 'bn' ? toBanglaDigits(teacher.phone) : teacher.phone;
    const isClassTeacher = Boolean(teacher.isClassTeacher);
    const classTeacherBadge = isClassTeacher ? ` • ${lang === 'bn' ? 'ক্লাস শিক্ষক' : 'Class Teacher'}` : '';

    if (modalTag) {
      modalTag.textContent = lang === 'bn' ? 'শিক্ষক প্রোফাইল' : 'Faculty Profile';
    }

    modalBody.innerHTML = `
      <div class="modal-title-wrap">
        <h2 class="modal-title">${escapeHtml(name)}</h2>
        <div class="modal-lead modal-subtitle">${escapeHtml(designation)}${escapeHtml(classTeacherBadge)}</div>
      </div>

      <div class="modal-detail-grid detail-grid">
        <div class="modal-detail-item detail">
          <span class="detail-label">${escapeHtml(t('faculty', lang))}</span>
          <b class="detail-value">${escapeHtml(subject)}</b>
        </div>

        <div class="modal-detail-item detail">
          <span class="detail-label">${escapeHtml(t('courseCode', lang))}</span>
          <b class="detail-value mono highlight">${escapeHtml(courseCode)}</b>
        </div>

        <div class="modal-detail-item detail">
          <span class="detail-label">${escapeHtml(t('teacherCode', lang))}</span>
          <b class="detail-value mono">${escapeHtml(teacher.code)}</b>
        </div>

        <div class="modal-detail-item detail">
          <span class="detail-label">Phone</span>
          <b class="detail-value mono">${escapeHtml(phone)}</b>
        </div>
      </div>

      <div class="modal-actions">
        <a class="modal-btn primary modal-btn-primary" href="tel:${escapeHtml(teacher.phone)}">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <span>${escapeHtml(t('callFaculty', lang))}</span>
        </a>

        <button type="button" class="modal-btn secondary modal-btn-secondary" id="btnCopyPhone">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          <span>${escapeHtml(t('copyNumber', lang))}</span>
        </button>

        <button type="button" class="modal-btn tertiary modal-btn-tertiary" id="btnShareFaculty">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>
          </svg>
          <span>${escapeHtml(lang === 'bn' ? 'শেয়ার' : 'Share')}</span>
        </button>
      </div>
    `;

    // Wire action buttons
    const btnCopyPhone = modalBody.querySelector('#btnCopyPhone');
    if (btnCopyPhone) {
      btnCopyPhone.addEventListener('click', () => {
        copyToClipboard(teacher.phone, t('copiedToClipboard', lang));
      });
    }

    const btnShare = modalBody.querySelector('#btnShareFaculty');
    if (btnShare) {
      btnShare.addEventListener('click', () => {
        shareContent({
          title: `ENT Faculty: ${name}`,
          text: `${name} • ${designation} • Subject: ${subject} (${teacher.course}) • Phone: ${teacher.phone}`,
          url: window.location.href
        }, t('copiedToClipboard', lang));
      });
    }
  }

  /**
   * Listen to store changes and trigger modal updates
   */
  store.subscribe((state, changedKeys) => {
    if (changedKeys.includes('activeModal') || (state.activeModal && changedKeys.includes('lang'))) {
      const { activeModal, lang } = state;

      if (!activeModal) {
        closeModal();
        return;
      }

      if (activeModal.type === 'class') {
        renderClassModal(activeModal.data, lang);
        openModal();
      } else if (activeModal.type === 'faculty') {
        renderFacultyModal(activeModal.data, lang);
        openModal();
      } else if (activeModal.type === 'notice') {
        if (modalTag) modalTag.textContent = 'Notice';
        modalBody.innerHTML = `
          <h2 class="modal-title">${escapeHtml(activeModal.data?.title || 'Announcement')}</h2>
          <p class="modal-lead">${escapeHtml(activeModal.data?.body || '')}</p>
          <div class="modal-actions">
            <button type="button" class="modal-btn primary modal-btn-primary" onclick="store.closeModal()">
              <span>${escapeHtml(t('close', lang))}</span>
            </button>
          </div>
        `;
        openModal();
      }
    }
  });
}
