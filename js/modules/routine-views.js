/**
 * Routine Views Module - ENT Pulse / ECR Web
 * Renders the responsive Day View and Week View Timetable Matrix.
 * Handles state subscriptions, search/type filtering, live class highlighting, and modal triggers.
 */

import { WORKING_DAYS, PERIODS, RAW_ROUTINE, SUBJECTS } from '../data/routine-data.js';
import { getTeacherByCode } from '../data/faculty-data.js';
import { getDhakaNow, getMergedDayClasses } from './time-engine.js';
import { store } from './state.js';
import { t, toBanglaDigits } from './i18n.js';

/**
 * Escapes HTML characters to prevent XSS vulnerabilities
 */
const esc = (str) => {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));
};

/**
 * Formats time string (e.g. "01:30 PM") with optional Bangla digit conversion
 */
const formatTime = (timeStr, lang = 'en') => {
  if (!timeStr) return '';
  const cleanTime = String(timeStr).replace(/^0(?=\d)/, '');
  return lang === 'bn' ? toBanglaDigits(cleanTime) : cleanTime;
};

/**
 * Checks if a class block is currently in session right now in Dhaka BST time
 */
const isBlockLiveNow = (dayId, startMinutes, endMinutes, dhakaNow) => {
  if (!dhakaNow || dhakaNow.day !== dayId) return false;
  return dhakaNow.minutesFromMidnight >= startMinutes && dhakaNow.minutesFromMidnight < endMinutes;
};

/**
 * Checks whether a class block matches active filterType and searchQuery
 */
const doesBlockMatch = (block, filterType = 'all', searchQuery = '') => {
  // 1. Filter Type check ('all' | 'lab' | 'theory')
  if (filterType === 'lab' && block.type?.toLowerCase() !== 'lab') {
    return false;
  }
  if (filterType === 'theory' && block.type?.toLowerCase() !== 'theory') {
    return false;
  }

  // 2. Search Query check
  const query = (searchQuery || '').trim().toLowerCase();
  if (!query) return true;

  const teacherCode = (block.teacher || '').toLowerCase();
  // Exact match for teacher short-code
  if (teacherCode === query) {
    return true;
  }

  // Teacher short-code collision guard:
  // If the query is an exact match for another known teacher code (e.g. 'az', 'azr', 'ha', 'ds', 'mhr', 'msh', 'mas'),
  // then it was specifically aimed at that teacher. Reject non-matching teacher codes immediately.
  const allTeacherCodes = ['ha', 'az', 'ds', 'azr', 'mhr', 'msh', 'mas'];
  if (allTeacherCodes.includes(query)) {
    return false;
  }

  const teacher = getTeacherByCode(block.teacher);
  const subj = SUBJECTS[block.course];

  const searchable = [
    block.subject || '',
    subj?.name?.en || '',
    subj?.name?.bn || '',
    subj?.short || '',
    block.course || '',
    block.teacher || '',
    teacher?.name?.en || '',
    teacher?.name?.bn || '',
    block.room || '',
    block.type || ''
  ].join(' ').toLowerCase();

  return searchable.includes(query);
};

/**
 * Builds enriched class metadata payload for modal dialog
 */
const buildClassPayload = (block, lang, isLive) => {
  const teacher = getTeacherByCode(block.teacher);
  const subj = SUBJECTS[block.course];

  const localizedSubject = (lang === 'bn' && subj?.name?.bn) ? subj.name.bn : (subj?.name?.en || block.subject);
  const localizedTeacher = teacher
    ? ((lang === 'bn' && teacher.name?.bn) ? teacher.name.bn : teacher.name.en)
    : block.teacher;

  return {
    ...block,
    teacherObj: teacher,
    subjectMeta: subj,
    localizedSubject,
    localizedTeacher,
    isLive: Boolean(isLive)
  };
};

/**
 * Main routine view renderer mounted into containerEl
 * @param {HTMLElement} containerEl
 * @returns {Function} cleanup unmount function
 */
export const renderRoutineViews = (containerEl) => {
  if (!containerEl) {
    console.error('[routine-views] Missing target container element.');
    return () => {};
  }

  // Local storage / cache for quick lookup of class payloads by block ID
  let classPayloadMap = new Map();

  /**
   * Renders the complete HTML tree for routine views
   */
  const render = () => {
    const state = store.getState();
    const { selectedDay, viewMode, filterType, searchQuery, lang } = state;
    const dhakaNow = getDhakaNow();

    // Reset payload cache
    classPayloadMap.clear();

    const isDayView = viewMode === 'day';

    // 1. Toolbar: View Switcher (Day/Week) & Filter Chips
    const toolbarHtml = `
      <div class="views-toolbar">
        <!-- View Switcher: Segmented Pill Button ('Day View' / 'Week View') -->
        <div class="view-switcher" role="tablist" aria-label="${t('allClasses', lang)}">
          <button 
            type="button" 
            role="tab" 
            aria-selected="${isDayView}" 
            class="view-segment-btn ${isDayView ? 'active' : ''}" 
            data-action="switch-view" 
            data-mode="day"
            title="${t('dayView', lang)}"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>
            <span>${t('dayView', lang)}</span>
          </button>
          <button 
            type="button" 
            role="tab" 
            aria-selected="${!isDayView}" 
            class="view-segment-btn ${!isDayView ? 'active' : ''}" 
            data-action="switch-view" 
            data-mode="week"
            title="${t('weekView', lang)}"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M9 4v18M15 4v18"/></svg>
            <span>${t('weekView', lang)}</span>
          </button>
        </div>

        <!-- Filter Chips Bar (All / Lab / Theory) -->
        <div class="filter-chips-bar" role="group" aria-label="Filter class types">
          <button 
            type="button" 
            class="filter-chip-btn ${filterType === 'all' ? 'active' : ''}" 
            data-action="set-filter" 
            data-filter="all"
          >
            <span>${t('filterAll', lang)}</span>
          </button>
          <button 
            type="button" 
            class="filter-chip-btn ${filterType === 'lab' ? 'active' : ''}" 
            data-action="set-filter" 
            data-filter="lab"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v7.31L4.17 18.2A2 2 0 0 0 5.86 21h12.28a2 2 0 0 0 1.69-2.8L14 9.31V2"/></svg>
            <span>${t('filterLab', lang)}</span>
          </button>
          <button 
            type="button" 
            class="filter-chip-btn ${filterType === 'theory' ? 'active' : ''}" 
            data-action="set-filter" 
            data-filter="theory"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10"/></svg>
            <span>${t('filterTheory', lang)}</span>
          </button>
        </div>
      </div>
    `;

    // 2. Day Tabs Bar (Rendered for Day View: sticky, horizontal scroll with hidden scrollbar, M3 pills)
    const dayTabsHtml = `
      <div class="day-tabs-bar-wrapper ${!isDayView ? 'view-hidden' : ''}">
        <div class="day-tabs-scroll" role="tablist" aria-label="Select day">
          ${WORKING_DAYS.map(day => {
            const isSelected = selectedDay === day.id;
            const isToday = dhakaNow.day === day.id;
            const dayName = lang === 'bn' ? day.bn : day.en;
            const dayShort = lang === 'bn' ? day.shortBn : day.shortEn;

            return `
              <button
                type="button"
                role="tab"
                aria-selected="${isSelected}"
                class="day-tab-pill ${isSelected ? 'active' : ''} ${isToday ? 'is-today' : ''}"
                data-action="select-day"
                data-day="${day.id}"
              >
                <div class="day-tab-pill-content">
                  <span class="day-tab-pill-name">${dayShort.toUpperCase()}</span>
                  <span class="day-tab-pill-sub">${isToday ? t('today', lang) : dayName}</span>
                </div>
                <span class="day-tab-dot" aria-hidden="true"></span>
                ${isToday ? `<span class="day-tab-today-badge">${t('today', lang)}</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // 3. Day View Content (filtered blocks for selected day)
    const rawBlocks = getMergedDayClasses(selectedDay, RAW_ROUTINE);
    const filteredBlocks = rawBlocks.filter(block => doesBlockMatch(block, filterType, searchQuery));

    const selectedDayObj = WORKING_DAYS.find(d => d.id === selectedDay) || WORKING_DAYS[0];
    const selectedDayLabel = lang === 'bn' ? selectedDayObj.bn : selectedDayObj.en;

    // Day Summary Header
    const countLabel = lang === 'bn' ? `${toBanglaDigits(filteredBlocks.length)} টি ক্লাস` 
      : `${filteredBlocks.length} ${filteredBlocks.length === 1 ? 'class' : 'classes'}`;

    let classListHtml = '';

    if (filteredBlocks.length === 0) {
      classListHtml = `
        <div class="views-empty-state">
          <svg class="views-empty-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <div class="views-empty-title">${t('noSearchResults', lang)}</div>
          <p class="views-empty-desc">${lang === 'bn' ? 'নির্বাচিত দিনে বা ফিল্টারে কোনো ক্লাস খুঁজে পাওয়া যায়নি।' : 'No classes match your current day, filter or search term.'}</p>
          ${(filterType !== 'all' || searchQuery) ? `
            <button type="button" class="views-clear-btn" data-action="reset-filters">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              <span>${t('clearSearch', lang)}</span>
            </button>
          ` : ''}
        </div>
      `;
    } else {
      classListHtml = filteredBlocks.map(block => {
        const isLive = isBlockLiveNow(selectedDay, block.startMinutes, block.endMinutes, dhakaNow);
        const isLab = block.type?.toLowerCase() === 'lab';
        const payload = buildClassPayload(block, lang, isLive);

        const payloadKey = `card-${block.day}-${block.p}`;
        classPayloadMap.set(payloadKey, payload);

        const startP = PERIODS.find(p => p.id === block.periodStart);
        const endP = PERIODS.find(p => p.id === block.periodEnd);

        const startPName = lang === 'bn' ? (startP?.name?.bn || `${block.periodStart}`) : (startP?.name?.en || `${block.periodStart}`);
        const endPName = lang === 'bn' ? (endP?.name?.bn || `${block.periodEnd}`) : (endP?.name?.en || `${block.periodEnd}`);

        const periodTag = block.span > 1 
          ? `${startPName}–${endPName}` 
          : `${startPName}`;

        const typeLabel = isLab ? t('lab', lang) : t('theory', lang);

        return `
          <article 
            class="class-card ${isLive ? 'is-live' : ''} ${isLab ? 'card-lab' : 'card-theory'}" 
            data-action="open-class-modal" 
            data-payload-key="${payloadKey}"
            tabindex="0"
            role="button"
            aria-label="${esc(payload.localizedSubject)}, ${periodTag}"
          >
            <!-- Live Indicator Pill -->
            ${isLive ? `
              <div class="live-class-pill">
                <span class="pulse-live-dot"></span>
                <span>${t('inClass', lang)}</span>
              </div>
            ` : ''}

            <!-- Column 1: Time Slot Badge (Left vertical column) -->
            <div class="slot-badge-column">
              <span class="slot-period-tag">${periodTag}</span>
              <div class="slot-time-range">
                <span>${formatTime(block.startTime, lang)}</span>
                <span class="slot-time-arrow">${t('to', lang)}</span>
                <span class="slot-time-end">${formatTime(block.endTime, lang)}</span>
              </div>
            </div>

            <!-- Column 2: Class Info (Middle column) -->
            <div class="class-info-column">
              <h3 class="class-subject-title">${esc(payload.localizedSubject)}</h3>
              
              <div class="class-teacher-row">
                <span class="teacher-name-text">${esc(payload.localizedTeacher)}</span>
                <span class="teacher-code-pill">${esc(block.teacher)}</span>
              </div>

              <div class="class-chips-row">
                <span class="info-chip chip-code" title="${t('courseCode', lang)}">
                  <svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  <span>${lang === 'bn' ? toBanglaDigits(block.course) : block.course}</span>
                </span>

                <span class="info-chip ${isLab ? 'chip-lab' : 'chip-theory'}">
                  ${isLab 
                    ? `<svg viewBox="0 0 24 24"><path d="M10 2v7.31L4.17 18.2A2 2 0 0 0 5.86 21h12.28a2 2 0 0 0 1.69-2.8L14 9.31V2"/></svg>` 
                    : `<svg viewBox="0 0 24 24"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/></svg>`
                  }
                  <span>${typeLabel}</span>
                </span>

                <span class="info-chip chip-room" title="${t('room', lang)}">
                  <svg viewBox="0 0 24 24"><path d="M3 21h18M3 7v14M21 7v14M6 3h12a3 3 0 0 1 3 3v1H3V6a3 3 0 0 1 3-3z"/></svg>
                  <span>${esc(block.room)}</span>
                </span>
              </div>
            </div>

            <!-- Column 3: Arrow / Action (Right column) -->
            <div class="class-action-column" aria-hidden="true">
              <svg class="action-arrow-icon" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </article>
        `;
      }).join('');
    }

    const dayViewHtml = `
      <div class="day-view-container ${!isDayView ? 'view-hidden' : ''}">
        <div class="day-summary-bar">
          <div class="day-summary-title">
            <span class="day-summary-dot"></span>
            <span>${selectedDayLabel}</span>
          </div>
          <div class="day-summary-count">${countLabel}</div>
        </div>
        <div class="day-classes-list">
          ${classListHtml}
        </div>
      </div>
    `;

    // 4. Week View: Timetable Matrix
    const tableHeadHtml = `
      <thead>
        <tr>
          <th>
            <span class="matrix-th-title">${lang === 'bn' ? 'দিন / সময়' : 'Day / Time'}</span>
          </th>
          ${PERIODS.map(period => {
            const pName = lang === 'bn' ? period.name.bn : period.name.en;
            return `
              <th>
                <span class="matrix-th-title">${pName} ${t('period', lang)}</span>
                <span class="matrix-th-time">${formatTime(period.start, lang)} – ${formatTime(period.end, lang)}</span>
              </th>
            `;
          }).join('')}
        </tr>
      </thead>
    `;

    let tableBodyRows = '';

    for (const day of WORKING_DAYS) {
      const isToday = dhakaNow.day === day.id;
      const dayName = lang === 'bn' ? day.bn : day.en;
      const dayShort = lang === 'bn' ? day.shortBn : day.shortEn;

      // Fetch merged blocks for this day
      const dayBlocks = getMergedDayClasses(day.id, RAW_ROUTINE);

      let rowCellsHtml = '';
      let p = 1;

      while (p <= 7) {
        const block = dayBlocks.find(b => b.periodStart === p);

        if (block) {
          const span = block.span || 1;
          const isLive = isBlockLiveNow(day.id, block.startMinutes, block.endMinutes, dhakaNow);
          const isLab = block.type?.toLowerCase() === 'lab';
          const matchesFilter = doesBlockMatch(block, filterType, searchQuery);
          const payload = buildClassPayload(block, lang, isLive);

          const payloadKey = `week-${day.id}-${block.p}`;
          classPayloadMap.set(payloadKey, payload);

          rowCellsHtml += `
            <td 
              colspan="${span}" 
              class="matrix-class-cell ${isLab ? 'is-lab' : ''} ${isLive ? 'is-live' : ''} ${!matchesFilter ? 'is-dimmed' : ''}" 
              data-action="open-class-modal" 
              data-payload-key="${payloadKey}"
              tabindex="0"
              role="button"
              aria-label="${esc(payload.localizedSubject)} (${dayName}, Period ${block.p})"
            >
              <div class="matrix-cell-content">
                <div class="matrix-cell-subject">${esc(payload.localizedSubject)}</div>
                <div class="matrix-cell-meta">${esc(block.course)} • ${esc(block.teacher)}</div>
                <div class="matrix-cell-room">${esc(block.room)}</div>
              </div>
              ${isLive ? `<span class="matrix-live-badge">${t('inClass', lang)}</span>` : ''}
            </td>
          `;

          p += span;
        } else {
          rowCellsHtml += `
            <td colspan="1" class="matrix-empty-cell" aria-label="No class">—</td>
          `;
          p += 1;
        }
      }

      tableBodyRows += `
        <tr>
          <td class="matrix-day-cell ${isToday ? 'is-today' : ''}">
            <span class="matrix-day-name">${dayName}</span>
            <span class="matrix-day-short">${dayShort}</span>
            ${isToday ? `<span class="matrix-day-today-tag">${t('today', lang)}</span>` : ''}
          </td>
          ${rowCellsHtml}
        </tr>
      `;
    }

    const weekViewHtml = `
      <div class="week-view-container ${isDayView ? 'view-hidden' : ''}">
        <div class="week-matrix-scroll-wrapper" tabindex="0" role="region" aria-label="${t('weekView', lang)}">
          <table class="week-matrix-table">
            ${tableHeadHtml}
            <tbody>
              ${tableBodyRows}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const contentHtml = dayViewHtml + weekViewHtml;

    // Assemble outer container HTML
    containerEl.innerHTML = `
      <section class="routine-views-section" id="routine-views-root">
        ${toolbarHtml}
        ${dayTabsHtml}
        ${contentHtml}
      </section>
    `;
  };

  // Initial render
  render();

  /**
   * Event delegation on containerEl to handle clicks & keyboard activations
   */
  const handleClick = (e) => {
    // 1. View Switcher buttons
    const switchBtn = e.target.closest('[data-action="switch-view"]');
    if (switchBtn) {
      const mode = switchBtn.dataset.mode;
      if (mode && (mode === 'day' || mode === 'week')) {
        store.setViewMode(mode);
      }
      return;
    }

    // 2. Filter Chip buttons
    const filterBtn = e.target.closest('[data-action="set-filter"]');
    if (filterBtn) {
      const filter = filterBtn.dataset.filter;
      if (filter) {
        store.setFilterType(filter);
      }
      return;
    }

    // 3. Day Tab Pills
    const dayTab = e.target.closest('[data-action="select-day"]');
    if (dayTab) {
      const day = dayTab.dataset.day;
      if (day) {
        store.setSelectedDay(day);
      }
      return;
    }

    // 4. Reset Filters button
    const clearBtn = e.target.closest('[data-action="reset-filters"]');
    if (clearBtn) {
      store.setFilterType('all');
      store.setSearchQuery('');
      return;
    }

    // 5. Class Card or Week Matrix Cell click -> store.openModal('class', classData)
    const cardEl = e.target.closest('[data-action="open-class-modal"]');
    if (cardEl) {
      const key = cardEl.dataset.payloadKey;
      if (key && classPayloadMap.has(key)) {
        const classData = classPayloadMap.get(key);
        store.openModal('class', classData);
      }
    }
  };

  /**
   * Accessible keyboard activation (Enter or Space)
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const actionable = e.target.closest('[data-action]');
      if (actionable) {
        e.preventDefault();
        actionable.click();
      }
    }
  };

  containerEl.addEventListener('click', handleClick);
  containerEl.addEventListener('keydown', handleKeyDown);

  /**
   * State store subscription
   * Listens to store for: selectedDay, viewMode, filterType, searchQuery, lang
   */
  const unsubscribe = store.subscribe((state, changedKeys) => {
    const relevantKeys = ['selectedDay', 'viewMode', 'filterType', 'searchQuery', 'lang', 'theme'];
    const shouldRerender = changedKeys.some(key => relevantKeys.includes(key));
    if (shouldRerender) {
      render();
    }
  });

  /**
   * Ticker to keep live class glow/highlight and "LIVE NOW" badges strictly accurate in real time
   */
  const liveTicker = setInterval(() => {
    render();
  }, 30000);

  // Return unmount/cleanup function
  return () => {
    containerEl.removeEventListener('click', handleClick);
    containerEl.removeEventListener('keydown', handleKeyDown);
    unsubscribe();
    clearInterval(liveTicker);
  };
};
