/**
 * Utilities Module - ENT Pulse / ECR Routine Web
 * Handles iCalendar (RFC 5545) export, Academic Notice Banners, and PWA Lifecycle.
 */

import { store } from './state.js';
import { RAW_ROUTINE, PERIODS, ACADEMIC_INFO } from '../data/routine-data.js';
import { TEACHERS } from '../data/faculty-data.js';

/**
 * Converts 12-hour AM/PM time (e.g. '01:30 PM') to iCalendar 24-hour time (e.g. '133000')
 */
function parseTimeTo24(timeStr) {
  if (!timeStr) return '000000';
  const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return '000000';
  let h = parseInt(m[1], 10);
  const min = m[2].padStart(2, '0');
  const ampm = m[3].toUpperCase();
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}${min}00`;
}

/**
 * Escapes characters for RFC 5545 compliance
 */
function escapeIcsText(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Folds lines longer than 75 characters per RFC 5545
 */
function foldIcsLine(line) {
  if (line.length <= 75) return line;
  let folded = '';
  let rem = line;
  while (rem.length > 75) {
    folded += rem.substring(0, 75) + '\r\n ';
    rem = rem.substring(75);
  }
  folded += rem;
  return folded;
}

/**
 * Merges consecutive periods of identical subjects into continuous calendar blocks
 */
function mergeRoutineBlocks(routineList) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const blocks = [];

  for (const day of days) {
    const dayClasses = routineList
      .filter(c => c.day === day)
      .sort((a, b) => a.p - b.p);

    let i = 0;
    while (i < dayClasses.length) {
      const current = dayClasses[i];
      let span = 1;
      while (
        i + span < dayClasses.length &&
        dayClasses[i + span].p === current.p + span &&
        dayClasses[i + span].subject === current.subject &&
        dayClasses[i + span].teacher === current.teacher &&
        dayClasses[i + span].room === current.room
      ) {
        span++;
      }
      blocks.push({
        ...current,
        span,
        endP: current.p + span - 1
      });
      i += span;
    }
  }

  return blocks;
}

/**
 * Generates and triggers browser download of an RFC 5545 compliant .ics calendar file
 * with recurring weekly schedule for ENT 4/2 classes.
 */
export function generateIcsCalendar() {
  const routineData = (typeof RAW_ROUTINE !== 'undefined' && RAW_ROUTINE.length)
    ? RAW_ROUTINE
    : (window.routine || []);
  const periodList = (typeof PERIODS !== 'undefined' && PERIODS.length)
    ? PERIODS
    : (window.periods || []);
  const teacherList = (typeof TEACHERS !== 'undefined' && TEACHERS.length)
    ? TEACHERS
    : (window.teachers || []);

  const dayDateMap = {
    Sunday: '20260301',
    Monday: '20260302',
    Tuesday: '20260303',
    Wednesday: '20260304',
    Thursday: '20260305'
  };

  const dayByDayMap = {
    Sunday: 'SU',
    Monday: 'MO',
    Tuesday: 'TU',
    Wednesday: 'WE',
    Thursday: 'TH'
  };

  const blocks = mergeRoutineBlocks(routineData);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ENT Pulse//Electronics Routine ENT 4-2//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:ENT 4/2 Class Routine',
    'X-WR-TIMEZONE:Asia/Dhaka',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Dhaka',
    'X-LIC-LOCATION:Asia/Dhaka',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0600',
    'TZOFFSETTO:+0600',
    'TZNAME:BST',
    'DTSTART:19700101T000000',
    'END:STANDARD',
    'END:VTIMEZONE'
  ];

  for (const block of blocks) {
    const baseDate = dayDateMap[block.day];
    const byDay = dayByDayMap[block.day];
    if (!baseDate || !byDay) continue;

    const startPeriod = periodList.find(p => p.id === block.p);
    const endPeriod = periodList.find(p => p.id === block.endP);
    if (!startPeriod || !endPeriod) continue;

    const startTime24 = parseTimeTo24(startPeriod.start);
    const endTime24 = parseTimeTo24(endPeriod.end);

    const teacher = teacherList.find(t => t.code === block.teacher);
    const teacherName = teacher?.name?.en || teacher?.name || block.teacher;
    const teacherPhone = teacher?.phone || 'N/A';
    const teacherDesig = teacher?.designation?.en || teacher?.desig || 'Faculty';

    const uid = `ent-pulse-4-2-${block.day.toLowerCase()}-p${block.p}-${block.course}@cnpi.edu.bd`;
    const summary = `${block.subject} (${block.course}) [${block.teacher}]`;
    const location = block.room || 'CNPI Campus';

    const descLines = [
      `Subject: ${block.subject}`,
      `Course Code: ${block.course}`,
      `Teacher: ${teacherName} (${block.teacher})`,
      `Designation: ${teacherDesig}`,
      `Phone: ${teacherPhone}`,
      `Room / Lab: ${block.room}`,
      `Class Load: ${block.span} Period${block.span > 1 ? 's' : ''} (${startPeriod.name.en || startPeriod.name} to ${endPeriod.name.en || endPeriod.name})`,
      `Type: ${block.type || 'Theory/Lab'}`,
      `Class: ENT 4/2 (4th Semester, 2nd Shift)`,
      `Institute: Chapainawabganj Govt. Polytechnic Institute (CNPI)`
    ];
    const description = descLines.join('\n');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:20260301T000000Z`);
    lines.push(`DTSTART;TZID=Asia/Dhaka:${baseDate}T${startTime24}`);
    lines.push(`DTEND;TZID=Asia/Dhaka:${baseDate}T${endTime24}`);
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${byDay}`);
    lines.push(`SUMMARY:${escapeIcsText(summary)}`);
    lines.push(`LOCATION:${escapeIcsText(location)}`);
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:OPAQUE');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  const icsContent = lines.map(foldIcsLine).join('\r\n') + '\r\n';

  // Trigger browser download
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = 'ENT_4_2_Routine.ics';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);

  return icsContent;
}

/**
 * Renders the notice banner if not dismissed in store.
 * Wires dismiss button to persist state and animate closure.
 * @param {HTMLElement|string} containerEl - Parent container element or CSS selector
 */
export function renderNoticeBanner(containerEl) {
  const target = (typeof containerEl === 'string')
    ? document.querySelector(containerEl)
    : containerEl;

  if (!target) {
    console.warn('[Notice] Container element not found');
    return null;
  }

  const currentState = store.getState();
  if (currentState.noticeDismissed) {
    return null;
  }

  // Remove existing banner if present
  const existing = target.querySelector('.notice-banner');
  if (existing) existing.remove();

  const banner = document.createElement('aside');
  banner.className = 'notice-banner';
  banner.id = 'academicNoticeBanner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Academic Announcement');

  banner.innerHTML = `
    <div class="notice-card">
      <div class="notice-icon-wrapper" aria-hidden="true">
        <svg class="notice-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      </div>
      <div class="notice-content">
        <div class="notice-header">
          <span class="notice-badge">Official Routine</span>
          <span class="notice-date">Session 2026–27 • 4th Sem (ENT 4/2)</span>
        </div>
        <p class="notice-message">
          <strong>Academic Schedule Active:</strong> Regular classes run Sunday–Thursday from <strong>01:30 PM to 06:45 PM</strong> at CNPI Campus. Please verify lab rooms and maintain regular attendance.
        </p>
      </div>
      <button class="notice-dismiss-btn" id="dismissNoticeBtn" aria-label="Dismiss notice" title="Dismiss notice">
        <svg class="notice-dismiss-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `;

  // Attach dismiss handler
  const dismissBtn = banner.querySelector('#dismissNoticeBtn');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      banner.classList.add('dismissing');
      setTimeout(() => {
        banner.remove();
      }, 300);
      store.dismissNotice();
    });
  }

  // Prepend to target container
  target.prepend(banner);

  // Subscribe to external dismissal in store
  store.subscribe((state, changedKeys) => {
    if (changedKeys.includes('noticeDismissed') && state.noticeDismissed) {
      if (banner.isConnected) {
        banner.classList.add('dismissing');
        setTimeout(() => banner.remove(), 300);
      }
    }
  });

  return banner;
}

/**
 * Initializes PWA Service Worker, captures beforeinstallprompt, and wires install button.
 * @param {HTMLElement|string} installBtnEl - Install button element or selector
 */
export function initPwa(installBtnEl) {
  const btn = (typeof installBtnEl === 'string')
    ? document.querySelector(installBtnEl)
    : installBtnEl;

  let deferredPrompt = null;

  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(registration => {
          console.log('[PWA] Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.warn('[PWA] Service Worker registration failed:', error);
        });
    });
  }

  // 2. Capture beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;

    if (btn) {
      btn.classList.remove('hidden');
      btn.style.display = 'grid';
      btn.setAttribute('aria-hidden', 'false');
    }
  });

  // 3. Wire install button click
  if (btn) {
    btn.addEventListener('click', async () => {
      if (!deferredPrompt) return;

      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      console.log('[PWA] User choice outcome:', choiceResult.outcome);

      deferredPrompt = null;
      btn.classList.add('hidden');
      btn.style.display = 'none';
      btn.setAttribute('aria-hidden', 'true');
    });
  }

  // 4. Handle post-install event
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (btn) {
      btn.classList.add('hidden');
      btn.style.display = 'none';
      btn.setAttribute('aria-hidden', 'true');
    }
    console.log('[PWA] ENT Pulse installed successfully');
  });

  return {
    getPrompt: () => deferredPrompt,
    promptInstall: async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        return await deferredPrompt.userChoice;
      }
      return null;
    }
  };
}
