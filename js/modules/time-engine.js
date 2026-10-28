/**
 * Time Engine Module - ECR Routine Web
 * Handles all time computations locked to Asia/Dhaka (BST, UTC+6) timezone.
 */

import { PERIODS, WORKING_DAYS } from '../data/routine-data.js';

/**
 * Converts "01:30 PM" to minutes from 00:00 (midnight)
 */
export const timeStringToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

/**
 * Returns current date and time components computed in Asia/Dhaka timezone.
 */
export const getDhakaNow = () => {
  const now = new Date();
  
  // Format to Asia/Dhaka string parts
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });

  const parts = formatter.formatToParts(now);
  const map = {};
  for (const part of parts) {
    map[part.type] = part.value;
  }

  const hours = parseInt(map.hour, 10);
  const minutes = parseInt(map.minute, 10);
  const seconds = parseInt(map.second, 10);
  const dayName = map.weekday; // 'Sunday', 'Monday', etc.

  const minutesFromMidnight = hours * 60 + minutes + (seconds / 60);

  return {
    day: dayName,
    hours,
    minutes,
    seconds,
    minutesFromMidnight,
    timeString12: now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  };
};

/**
 * Merges consecutive identical slots on a given day into spanned blocks
 */
export const getMergedDayClasses = (dayName, rawRoutine) => {
  const daySlots = rawRoutine
    .filter(slot => slot.day === dayName)
    .sort((a, b) => a.p - b.p);

  const blocks = [];
  let i = 0;

  while (i < daySlots.length) {
    const current = daySlots[i];
    let span = 1;

    while (
      i + span < daySlots.length &&
      daySlots[i + span].p === current.p + span &&
      daySlots[i + span].course === current.course &&
      daySlots[i + span].teacher === current.teacher &&
      daySlots[i + span].room === current.room
    ) {
      span++;
    }

    const startPeriod = PERIODS.find(p => p.id === current.p);
    const endPeriod = PERIODS.find(p => p.id === current.p + span - 1);

    blocks.push({
      ...current,
      span,
      periodStart: current.p,
      periodEnd: current.p + span - 1,
      startTime: startPeriod ? startPeriod.start : '',
      endTime: endPeriod ? endPeriod.end : '',
      startMinutes: startPeriod ? timeStringToMinutes(startPeriod.start) : 0,
      endMinutes: endPeriod ? timeStringToMinutes(endPeriod.end) : 0
    });

    i += span;
  }

  return blocks;
};

/**
 * Calculates real-time schedule status for "Now / Next" card
 */
export const getLiveScheduleStatus = (rawRoutine) => {
  const dhaka = getDhakaNow();
  const isWorkingDay = WORKING_DAYS.some(d => d.id === dhaka.day);

  if (!isWorkingDay) {
    return {
      state: 'WEEKEND',
      day: dhaka.day,
      timeString: dhaka.timeString12,
      currentClass: null,
      nextClass: null,
      secondsRemaining: 0,
      progressPercent: 0
    };
  }

  const todayBlocks = getMergedDayClasses(dhaka.day, rawRoutine);
  const nowMins = dhaka.minutesFromMidnight;

  // 1. Check if currently inside an active class block
  for (const block of todayBlocks) {
    if (nowMins >= block.startMinutes && nowMins < block.endMinutes) {
      const elapsedMins = nowMins - block.startMinutes;
      const totalMins = block.endMinutes - block.startMinutes;
      const progressPercent = Math.min(100, Math.max(0, (elapsedMins / totalMins) * 100));
      const secondsRemaining = Math.max(0, Math.round((block.endMinutes - nowMins) * 60));

      // Look ahead for next class after this one
      const nextClass = todayBlocks.find(b => b.startMinutes >= block.endMinutes) || null;

      return {
        state: 'IN_CLASS',
        day: dhaka.day,
        timeString: dhaka.timeString12,
        currentClass: block,
        nextClass,
        secondsRemaining,
        progressPercent
      };
    }
  }

  // 2. Check if before or between classes (break or waiting for next class)
  const upcomingClasses = todayBlocks
    .filter(b => b.startMinutes > nowMins)
    .sort((a, b) => a.startMinutes - b.startMinutes);

  if (upcomingClasses.length > 0) {
    const nextClass = upcomingClasses[0];
    const secondsToStart = Math.max(0, Math.round((nextClass.startMinutes - nowMins) * 60));

    return {
      state: 'UP_NEXT',
      day: dhaka.day,
      timeString: dhaka.timeString12,
      currentClass: null,
      nextClass,
      secondsRemaining: secondsToStart,
      progressPercent: 0
    };
  }

  // 3. All classes completed for today
  return {
    state: 'DAY_FINISHED',
    day: dhaka.day,
    timeString: dhaka.timeString12,
    currentClass: null,
    nextClass: null,
    secondsRemaining: 0,
    progressPercent: 100
  };
};

/**
 * Formats seconds into "Xm Ys" or "Xh Ym"
 */
export const formatDuration = (totalSeconds, lang = 'en') => {
  if (totalSeconds <= 0) return '0s';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return lang === 'bn'
      ? `${hours} ঘণ্টা ${minutes} মিনিট`
      : `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return lang === 'bn'
      ? `${minutes} মি. ${seconds} সে.`
      : `${minutes}m ${seconds}s`;
  }
  return lang === 'bn'
    ? `${seconds} সেকেন্ড`
    : `${seconds}s`;
};
