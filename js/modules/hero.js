/**
 * Hero Section Module (Now - Next Live Engine)
 * Material Design 3 (M3) System - ECR Routine Web
 * Timezone: Asia/Dhaka (BST, UTC+6)
 */

import { getLiveScheduleStatus, formatDuration } from './time-engine.js';
import { RAW_ROUTINE, ACADEMIC_INFO, SUBJECTS } from '../data/routine-data.js';
import { getTeacherByCode } from '../data/faculty-data.js';
import { store } from './state.js';
import { t, toBanglaDigits } from './i18n.js';

let currentContainer = null;
let timerId = null;
let isSubscribed = false;

/**
 * Escapes unsafe HTML characters
 */
const escapeHtml = (str) => {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));
};

/**
 * Resolves current schedule status into one of 5 canonical states:
 * 'LIVE NOW', 'UP NEXT', 'BREAK', 'DAY FINISHED', 'WEEKEND'
 */
export const resolveScheduleState = (status) => {
  if (!status || status.state === 'WEEKEND') {
    return 'WEEKEND';
  }
  if (status.state === 'DAY_FINISHED') {
    return 'DAY FINISHED';
  }
  if (status.state === 'IN_CLASS') {
    return 'LIVE NOW';
  }
  if (status.state === 'UP_NEXT') {
    // If upcoming class is beyond period 1, we are in a break between classes
    const next = status.nextClass;
    const isBreak = next && (
      (next.p && next.p > 1) ||
      (next.periodStart && next.periodStart > 1)
    );
    return isBreak ? 'BREAK' : 'UP NEXT';
  }
  return 'WEEKEND';
};

/**
 * Returns localized text for the 5 status pill states
 */
export const getStatusPillText = (statusKey, lang = 'en') => {
  if (lang === 'bn') {
    switch (statusKey) {
      case 'LIVE NOW':
        return t('inClass', 'bn'); // 'এখন চলছে'
      case 'UP NEXT':
        return t('upNext', 'bn'); // 'পরবর্তী ক্লাস'
      case 'BREAK':
        return 'বিরতি';
      case 'DAY FINISHED':
        return t('dayCompleted', 'bn'); // 'আজকের সব ক্লাস সম্পন্ন'
      case 'WEEKEND':
        return t('weekend', 'bn'); // 'সাপ্তাহিক ছুটি'
      default:
        return statusKey;
    }
  }
  return statusKey; // 'LIVE NOW' | 'UP NEXT' | 'BREAK' | 'DAY FINISHED' | 'WEEKEND'
};

/**
 * Returns CSS class modifier for the status pill
 */
export const getStatusPillClass = (statusKey) => {
  switch (statusKey) {
    case 'LIVE NOW':
      return 'status-live';
    case 'UP NEXT':
      return 'status-next';
    case 'BREAK':
      return 'status-break';
    case 'DAY FINISHED':
      return 'status-finished';
    case 'WEEKEND':
      return 'status-weekend';
    default:
      return 'status-live';
  }
};

/**
 * Formats seconds remaining into large digital countdown digits
 * Displays mm:ss or hh:mm:ss, localized to Bengali digits when required
 */
export const formatTimerDigits = (totalSeconds, lang = 'en') => {
  if (totalSeconds == null || totalSeconds <= 0) {
    return lang === 'bn' ? toBanglaDigits('00:00') : '00:00';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');

  let timeStr = '';
  if (hours > 0) {
    timeStr = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  } else {
    timeStr = `${pad(minutes)}:${pad(seconds)}`;
  }

  return lang === 'bn' ? toBanglaDigits(timeStr) : timeStr;
};

/**
 * Formats period ordinal string (e.g. 1st, 1st–2nd)
 */
const formatPeriodLabel = (startP, endP, lang = 'en') => {
  const pStart = startP || 1;
  const pEnd = endP || pStart;
  const rangeStr = pStart === pEnd ? `${pStart}` : `${pStart}–${pEnd}`;

  if (lang === 'bn') {
    return `${toBanglaDigits(rangeStr)} পিরিয়ড`;
  }
  return pStart === pEnd ? `Period ${pStart}` : `Periods ${rangeStr}`;
};

/**
 * Generates the complete HTML skeleton for the Hero card
 */
const generateHeroHTML = (lang = 'en') => {
  const teacher = ACADEMIC_INFO.classTeacher;
  const teacherName = teacher.name[lang] || teacher.name.en;
  const totalLoadValue = lang === 'bn' ? `${toBanglaDigits(26)} পিরিয়ড` : '26 periods';
  const totalLoadSub = lang === 'bn' ? 'সাপ্তাহিক ক্লাস লোড' : 'Weekly Routine';
  const workingDaysValue = t('sunThu', lang);
  const workingDaysSub = lang === 'bn' ? `${toBanglaDigits(5)} দিন • ২য় শিফট` : '5 Days • 2nd Shift';
  const instituteValue = ACADEMIC_INFO.institution.short;
  const instituteSub = lang === 'bn' ? 'ইলেকট্রনিক্স (৪র্থ/২য়)' : 'Electronics (ENT 4/2)';

  const sessionLabel = lang === 'bn' ? `সেশন ${toBanglaDigits('2026–27')}` : 'Session 2026–27';
  const semesterLabel = lang === 'bn' ? '৪র্থ পর্ব' : '4th Semester';
  const shiftLabel = lang === 'bn' ? '২য় শিফট' : 'Second Shift';

  return `
    <!-- Top Row: Badges, Status Pill & Dhaka Live Clock -->
    <div class="hero-header">
      <div class="hero-badges-group">
        <span class="hero-batch-badge badge-primary">${ACADEMIC_INFO.group}</span>
        <span class="hero-batch-badge">${semesterLabel}</span>
        <span class="hero-batch-badge">${shiftLabel}</span>
        <span class="hero-batch-badge">${sessionLabel}</span>
      </div>

      <div class="hero-clock-chip" title="Dhaka Time (BST, UTC+6)">
        <svg class="hero-clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <polyline points="12 7 12 12 15 15"/>
        </svg>
        <span id="heroClockTime">--:--:--</span>
      </div>
    </div>

    <!-- Active Class & Countdown Area -->
    <div class="hero-body">
      <div class="hero-subject-area">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <div class="hero-status-pill status-live" id="heroStatusPill">
            <span class="hero-status-dot" aria-hidden="true"></span>
            <span id="heroStatusText">LIVE NOW</span>
          </div>
          <span class="hero-kicker" id="heroKicker" style="margin-bottom: 0;">Schedule Console</span>
        </div>

        <h1 class="hero-headline" id="heroSubjectHeadline">Checking Schedule…</h1>
        <div class="hero-subtitle" id="heroSubjectMeta">
          <span class="hero-sub-item">Please wait a moment</span>
        </div>
      </div>

      <div class="hero-timer-box" id="heroTimerBox">
        <div>
          <div class="hero-timer-label" id="heroTimerLabel">Countdown</div>
          <div class="hero-timer-digits" id="heroTimerDigits">--:--</div>
        </div>
        <div class="hero-timer-sub" id="heroTimerSub">Synchronizing…</div>
      </div>
    </div>

    <!-- Progress Bar (6px, rounded-full, smooth transition) -->
    <div class="hero-progress-container">
      <div class="hero-progress-track" role="progressbar" id="heroProgressWrapper" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <div class="hero-progress-bar" id="heroProgressBar" style="width: 0%;"></div>
      </div>
    </div>

    <!-- Up-Next Ticker (conditionally shown) -->
    <div class="hero-next-ticker" id="heroNextPreview" style="display: none;"></div>

    <!-- Academic Info Chips: Class teacher, Total load, Working days, CNPI -->
    <div class="hero-chips-grid">
      <!-- 1. Class Teacher -->
      <div class="hero-chip">
        <div class="hero-chip-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="hero-chip-content">
          <span class="hero-chip-label">${t('classTeacher', lang)}</span>
          <strong class="hero-chip-value" title="${escapeHtml(teacherName)}">${escapeHtml(teacherName)}</strong>
          <span class="hero-chip-sub">${escapeHtml(teacher.code)} • ${escapeHtml(teacher.phone)}</span>
        </div>
      </div>

      <!-- 2. Total Load -->
      <div class="hero-chip">
        <div class="hero-chip-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <div class="hero-chip-content">
          <span class="hero-chip-label">${t('totalLoad', lang)}</span>
          <strong class="hero-chip-value">${totalLoadValue}</strong>
          <span class="hero-chip-sub">${totalLoadSub}</span>
        </div>
      </div>

      <!-- 3. Working Days -->
      <div class="hero-chip">
        <div class="hero-chip-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="hero-chip-content">
          <span class="hero-chip-label">${t('activeDays', lang)}</span>
          <strong class="hero-chip-value">${workingDaysValue}</strong>
          <span class="hero-chip-sub">${workingDaysSub}</span>
        </div>
      </div>

      <!-- 4. CNPI -->
      <div class="hero-chip">
        <div class="hero-chip-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>
        <div class="hero-chip-content">
          <span class="hero-chip-label">${lang === 'bn' ? 'ইনস্টিটিউট' : 'Institute'}</span>
          <strong class="hero-chip-value">${escapeHtml(instituteValue)}</strong>
          <span class="hero-chip-sub">${instituteSub}</span>
        </div>
      </div>
    </div>
  `;
};

/**
 * Updates the live status, active subject, countdown timer, and progress bar
 */
const updateHeroLiveState = (container) => {
  if (!container) return;

  const status = getLiveScheduleStatus(RAW_ROUTINE);
  const state = store.getState();
  const lang = state.lang || 'en';

  const statusKey = resolveScheduleState(status);
  const pillClass = getStatusPillClass(statusKey);
  const pillText = getStatusPillText(statusKey, lang);

  // Update Clock
  const clockEl = container.querySelector('#heroClockTime');
  if (clockEl) {
    clockEl.textContent = lang === 'bn' ? toBanglaDigits(status.timeString) : status.timeString;
  }

  // Update Status Pill
  const pillEl = container.querySelector('#heroStatusPill');
  const pillTextEl = container.querySelector('#heroStatusText');
  if (pillEl) {
    pillEl.className = `hero-status-pill ${pillClass}`;
  }
  if (pillTextEl) {
    pillTextEl.textContent = pillText;
  }

  // Content placeholders
  let kickerText = '';
  let headlineText = '';
  let subtitleHTML = '';
  let timerLabel = '';
  let timerDigits = '';
  let timerSub = '';
  let progressPercent = 0;
  let nextTickerHTML = '';

  switch (statusKey) {
    case 'LIVE NOW': {
      const cur = status.currentClass;
      const subjObj = SUBJECTS[cur.course];
      headlineText = subjObj?.name?.[lang] || cur.subject;

      const teacherObj = getTeacherByCode(cur.teacher);
      const teacherName = teacherObj?.name?.[lang] || teacherObj?.name?.en || cur.teacher;

      const pStart = cur.periodStart || cur.p;
      const pEnd = cur.periodEnd || (cur.p + (cur.span || 1) - 1);
      const periodLabel = formatPeriodLabel(pStart, pEnd, lang);
      const typeLabel = cur.type === 'Lab'
        ? (lang === 'bn' ? 'ব্যবহারিক (ল্যাব)' : 'Practical Lab')
        : (lang === 'bn' ? 'তাত্ত্বিক (থিওরি)' : 'Theory Class');

      kickerText = `${typeLabel} • ${periodLabel}`;

      subtitleHTML = `
        <span class="hero-sub-item">
          <svg class="hero-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <strong>${escapeHtml(cur.room)}</strong>
        </span>
        <span class="hero-sub-item">
          <svg class="hero-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          ${escapeHtml(teacherName)} (${escapeHtml(cur.teacher)})
        </span>
        <span class="hero-sub-chip ${cur.type === 'Lab' ? 'chip-lab' : 'chip-theory'}">
          ${cur.type === 'Lab' ? (lang === 'bn' ? 'ল্যাব' : 'Lab') : (lang === 'bn' ? 'থিওরি' : 'Theory')}
        </span>
        <span class="hero-sub-item" style="font-family: var(--font-mono); font-size: 0.8em; opacity: 0.85;">
          ${cur.startTime} – ${cur.endTime}
        </span>
      `;

      timerLabel = t('endsIn', lang);
      timerDigits = formatTimerDigits(status.secondsRemaining, lang);
      timerSub = `${formatDuration(status.secondsRemaining, lang)} ${lang === 'bn' ? 'বাকি' : 'remaining'}`;
      progressPercent = Math.min(100, Math.max(0, status.progressPercent));

      if (status.nextClass) {
        const next = status.nextClass;
        const nextSubj = SUBJECTS[next.course]?.name?.[lang] || next.subject;
        const nextTeacher = getTeacherByCode(next.teacher)?.name?.[lang] || next.teacher;
        nextTickerHTML = `
          <span class="hero-next-ticker-label">${lang === 'bn' ? 'পরবর্তী' : 'Up Next'}:</span>
          <span><strong>${escapeHtml(nextSubj)}</strong> (${escapeHtml(next.course)}) • ${escapeHtml(next.room)} • ${escapeHtml(nextTeacher)} • ${escapeHtml(next.startTime)}</span>
        `;
      }
      break;
    }

    case 'BREAK': {
      const next = status.nextClass;
      const nextSubj = next ? (SUBJECTS[next.course]?.name?.[lang] || next.subject) : '';
      const nextTeacher = next ? (getTeacherByCode(next.teacher)?.name?.[lang] || next.teacher) : '';
      const nextTypeLabel = next?.type === 'Lab'
        ? (lang === 'bn' ? 'ব্যবহারিক ল্যাব' : 'Practical Lab')
        : (lang === 'bn' ? 'তাত্ত্বিক ক্লাস' : 'Theory Class');

      kickerText = lang === 'bn' ? `বিরতি চলছে • পরবর্তী: ${nextTypeLabel}` : `Break Time • Up Next: ${nextTypeLabel}`;
      headlineText = nextSubj || (lang === 'bn' ? 'বিরতি সময়' : 'Break Time');

      subtitleHTML = next ? `
        <span class="hero-sub-item">
          <svg class="hero-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <strong>${escapeHtml(next.room)}</strong>
        </span>
        <span class="hero-sub-item">
          <svg class="hero-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          ${escapeHtml(nextTeacher)} (${escapeHtml(next.teacher)})
        </span>
        <span class="hero-sub-chip ${next.type === 'Lab' ? 'chip-lab' : 'chip-theory'}">
          ${next.type === 'Lab' ? (lang === 'bn' ? 'ল্যাব' : 'Lab') : (lang === 'bn' ? 'থিওরি' : 'Theory')}
        </span>
        <span class="hero-sub-item" style="font-family: var(--font-mono); font-size: 0.8em; opacity: 0.85;">
          ${t('nextClassStartsAt', lang)} ${next.startTime}
        </span>
      ` : `<span class="hero-sub-item">${t('freePeriod', lang)}</span>`;

      timerLabel = t('nextClassIn', lang);
      timerDigits = formatTimerDigits(status.secondsRemaining, lang);
      timerSub = `${formatDuration(status.secondsRemaining, lang)} ${lang === 'bn' ? 'বাকি' : 'to start'}`;
      progressPercent = 0;
      break;
    }

    case 'UP_NEXT': {
      const next = status.nextClass;
      const nextSubj = next ? (SUBJECTS[next.course]?.name?.[lang] || next.subject) : '';
      const nextTeacher = next ? (getTeacherByCode(next.teacher)?.name?.[lang] || next.teacher) : '';
      const nextTypeLabel = next?.type === 'Lab'
        ? (lang === 'bn' ? 'ব্যবহারিক ল্যাব' : 'Practical Lab')
        : (lang === 'bn' ? 'তাত্ত্বিক ক্লাস' : 'Theory Class');

      kickerText = lang === 'bn' ? `ক্লাস শুরু হতে বাকি • ${nextTypeLabel}` : `Upcoming First Class • ${nextTypeLabel}`;
      headlineText = nextSubj || (lang === 'bn' ? 'পরবর্তী ক্লাস' : 'Upcoming Class');

      subtitleHTML = next ? `
        <span class="hero-sub-item">
          <svg class="hero-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <strong>${escapeHtml(next.room)}</strong>
        </span>
        <span class="hero-sub-item">
          <svg class="hero-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          ${escapeHtml(nextTeacher)} (${escapeHtml(next.teacher)})
        </span>
        <span class="hero-sub-chip ${next.type === 'Lab' ? 'chip-lab' : 'chip-theory'}">
          ${next.type === 'Lab' ? (lang === 'bn' ? 'ল্যাব' : 'Lab') : (lang === 'bn' ? 'থিওরি' : 'Theory')}
        </span>
        <span class="hero-sub-item" style="font-family: var(--font-mono); font-size: 0.8em; opacity: 0.85;">
          ${t('nextClassStartsAt', lang)} ${next.startTime}
        </span>
      ` : `<span class="hero-sub-item">${t('routineRuns', lang)}</span>`;

      timerLabel = t('nextClassIn', lang);
      timerDigits = formatTimerDigits(status.secondsRemaining, lang);
      timerSub = `${formatDuration(status.secondsRemaining, lang)} ${lang === 'bn' ? 'বাকি' : 'to start'}`;
      progressPercent = 0;
      break;
    }

    case 'DAY FINISHED': {
      kickerText = lang === 'bn' ? 'আজকের পাঠদান সম্পন্ন' : 'Routine Completed';
      headlineText = t('dayCompleted', lang);
      subtitleHTML = `<span class="hero-sub-item">${t('noMoreToday', lang)}</span>`;
      timerLabel = lang === 'bn' ? 'আজকের পাঠদান' : 'Day Status';
      timerDigits = lang === 'bn' ? toBanglaDigits('00:00') : '00:00';
      timerSub = lang === 'bn' ? 'সব ক্লাস সম্পন্ন' : 'All classes completed';
      progressPercent = 100;
      break;
    }

    case 'WEEKEND':
    default: {
      kickerText = lang === 'bn' ? 'সাপ্তাহিক ছুটি' : 'Weekly Holiday';
      headlineText = lang === 'bn' ? 'আজ সাপ্তাহিক ছুটি — ক্লাস বন্ধ' : 'Weekend / Off-Day';
      subtitleHTML = `<span class="hero-sub-item">${t('enjoyWeekend', lang)}</span>`;
      timerLabel = lang === 'bn' ? 'সাপ্তাহিক ছুটি' : 'Off-Day';
      timerDigits = lang === 'bn' ? toBanglaDigits('00:00') : '00:00';
      timerSub = lang === 'bn' ? 'ছুটি উপভোগ করুন' : 'Enjoy your weekend';
      progressPercent = 0;
      break;
    }
  }

  // Apply to DOM
  const kickerEl = container.querySelector('#heroKicker');
  const headlineEl = container.querySelector('#heroSubjectHeadline');
  const metaEl = container.querySelector('#heroSubjectMeta');
  const timerLabelEl = container.querySelector('#heroTimerLabel');
  const timerDigitsEl = container.querySelector('#heroTimerDigits');
  const timerSubEl = container.querySelector('#heroTimerSub');
  const progressBarEl = container.querySelector('#heroProgressBar');
  const progressWrapperEl = container.querySelector('#heroProgressWrapper');
  const nextPreviewEl = container.querySelector('#heroNextPreview');

  if (kickerEl) kickerEl.textContent = kickerText;
  if (headlineEl) headlineEl.textContent = headlineText;
  if (metaEl) metaEl.innerHTML = subtitleHTML;
  if (timerLabelEl) timerLabelEl.textContent = timerLabel;
  if (timerDigitsEl) timerDigitsEl.textContent = timerDigits;
  if (timerSubEl) timerSubEl.textContent = timerSub;

  if (progressBarEl) {
    progressBarEl.style.width = `${progressPercent.toFixed(1)}%`;
  }
  if (progressWrapperEl) {
    progressWrapperEl.setAttribute('aria-valuenow', String(Math.round(progressPercent)));
  }

  if (nextPreviewEl) {
    if (nextTickerHTML) {
      nextPreviewEl.innerHTML = nextTickerHTML;
      nextPreviewEl.style.display = 'flex';
    } else {
      nextPreviewEl.style.display = 'none';
      nextPreviewEl.innerHTML = '';
    }
  }
};

/**
 * Starts a 1-second timer loop updating the hero card
 * Returns a function to cancel the timer
 */
export const startHeroTimer = (containerEl) => {
  const container = typeof containerEl === 'string'
    ? document.querySelector(containerEl)
    : containerEl;

  if (!container) return null;

  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  // Run first update synchronously
  updateHeroLiveState(container);

  timerId = setInterval(() => {
    if (!container.isConnected) {
      clearInterval(timerId);
      timerId = null;
      return;
    }
    updateHeroLiveState(container);
  }, 1000);

  return () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  };
};

/**
 * Renders the hero card into containerEl, sets up store subscriptions for language changes,
 * and launches the 1-second live timer
 */
export const renderHero = (containerEl) => {
  const container = typeof containerEl === 'string'
    ? document.querySelector(containerEl)
    : containerEl;

  if (!container) {
    console.warn('[hero.js] renderHero target container not found:', containerEl);
    return;
  }

  currentContainer = container;
  container.classList.add('hero-card');

  // Subscribe to store language changes once
  if (!isSubscribed) {
    store.subscribe((state, changedKeys = []) => {
      if (changedKeys.includes('lang') || changedKeys.length === 0) {
        if (currentContainer && currentContainer.isConnected) {
          renderHero(currentContainer);
        }
      }
    });
    isSubscribed = true;
  }

  const lang = store.getState().lang || 'en';

  // Inject full hero markup
  container.innerHTML = generateHeroHTML(lang);

  // Initialize and start live timer
  startHeroTimer(container);
};
