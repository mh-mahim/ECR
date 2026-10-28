/**
 * Routine Data Store - ENT Pulse / ECR Web
 * Source of truth for academic routine schedules, periods, and subject metadata.
 * Timezone: Asia/Dhaka (BST, UTC+6)
 */

export const ACADEMIC_INFO = {
  institution: {
    en: "Chapainawabganj Govt. Polytechnic Institute",
    bn: "চাঁপাইনবাবগঞ্জ পলিটেকনিক ইনস্টিটিউট",
    short: "CNPI"
  },
  department: {
    en: "Electronics Technology",
    bn: "ইলেকট্রনিক্স টেকনোলজি",
    code: "ENT"
  },
  session: "2026–27",
  semester: "4",
  shift: "2",
  group: "ENT 4/2",
  classTeacher: {
    code: "HA",
    name: {
      en: "Hakimin Ahmed",
      bn: "হাকিমীন আহমেদ"
    },
    designation: {
      en: "Part-Time Teacher (Electronics)",
      bn: "খন্ডকালীন শিক্ষক (ইলেকট্রনিক্স)"
    },
    phone: "01759731841"
  }
};

export const WORKING_DAYS = [
  { id: 'Sunday', en: 'Sunday', bn: 'রবিবার', shortEn: 'SUN', shortBn: 'রবি', isWeekend: false },
  { id: 'Monday', en: 'Monday', bn: 'সোমবার', shortEn: 'MON', shortBn: 'সোম', isWeekend: false },
  { id: 'Tuesday', en: 'Tuesday', bn: 'মঙ্গলবার', shortEn: 'TUE', shortBn: 'মঙ্গল', isWeekend: false },
  { id: 'Wednesday', en: 'Wednesday', bn: 'বুধবার', shortEn: 'WED', shortBn: 'বুধ', isWeekend: false },
  { id: 'Thursday', en: 'Thursday', bn: 'বৃহস্পতিবার', shortEn: 'THU', shortBn: 'বৃহঃ', isWeekend: false }
];

export const ALL_DAYS = [
  ...WORKING_DAYS,
  { id: 'Friday', en: 'Friday', bn: 'শুক্রবার', shortEn: 'FRI', shortBn: 'শুক্র', isWeekend: true },
  { id: 'Saturday', en: 'Saturday', bn: 'শনিবার', shortEn: 'SAT', shortBn: 'শনি', isWeekend: true }
];

export const PERIODS = [
  { id: 1, name: { en: '1st', bn: '১ম' }, start: '01:30 PM', end: '02:15 PM' },
  { id: 2, name: { en: '2nd', bn: '২য়' }, start: '02:15 PM', end: '03:00 PM' },
  { id: 3, name: { en: '3rd', bn: '৩য়' }, start: '03:00 PM', end: '03:45 PM' },
  { id: 4, name: { en: '4th', bn: '৪র্থ' }, start: '03:45 PM', end: '04:30 PM' },
  { id: 5, name: { en: '5th', bn: '৫ম' }, start: '04:30 PM', end: '05:15 PM' },
  { id: 6, name: { en: '6th', bn: '৬ষ্ঠ' }, start: '05:15 PM', end: '06:00 PM' },
  { id: 7, name: { en: '7th', bn: '৭ম' }, start: '06:00 PM', end: '06:45 PM' }
];

export const SUBJECTS = {
  '26841': {
    code: '26841',
    name: {
      en: 'Digital Electronics-II',
      bn: 'ডিজিটাল ইলেকট্রনিক্স-২'
    },
    short: 'DE-2'
  },
  '25841': {
    code: '25841',
    name: {
      en: 'Accounting',
      bn: 'অ্যাকাউন্টিং'
    },
    short: 'ACC'
  },
  '26842': {
    code: '26842',
    name: {
      en: 'Communication Engineering',
      bn: 'কমিউনিকেশন ইঞ্জিনিয়ারিং'
    },
    short: 'CE'
  },
  '26741': {
    code: '26741',
    name: {
      en: 'Electrical Installation, Planning and Estimating',
      bn: 'ইলেকট্রিক্যাল ইনস্টলেশন, প্ল্যানিং অ্যান্ড এস্টিমেটিং'
    },
    short: 'EIPE'
  },
  '26742': {
    code: '26742',
    name: {
      en: 'DC Machine',
      bn: 'ডিসি মেশিন'
    },
    short: 'DCM'
  },
  '26843': {
    code: '26843',
    name: {
      en: 'Networks, Filters and Transmission Lines',
      bn: 'নেটওয়ার্কস, ফিল্টার্স অ্যান্ড ট্রান্সমিশন লাইনস'
    },
    short: 'NFTL'
  },
  '26844': {
    code: '26844',
    name: {
      en: 'Electronic Servicing',
      bn: 'ইলেকট্রনিক সার্ভিসিং'
    },
    short: 'ES'
  }
};

export const RAW_ROUTINE = [
  // Sunday
  { day: 'Sunday', p: 1, subject: 'Electrical Installation, Planning and Estimating', course: '26741', teacher: 'MSH', room: 'N-312', type: 'Theory' },
  { day: 'Sunday', p: 2, subject: 'DC Machine', course: '26742', teacher: 'MAS', room: 'EPL (S-516)', type: 'Lab' },
  { day: 'Sunday', p: 3, subject: 'DC Machine', course: '26742', teacher: 'MAS', room: 'EPL (S-516)', type: 'Lab' },
  { day: 'Sunday', p: 4, subject: 'Communication Engineering', course: '26842', teacher: 'MHR', room: 'N-312', type: 'Theory' },
  { day: 'Sunday', p: 5, subject: 'Electronic Servicing', course: '26844', teacher: 'DS', room: 'Basic Ent Lab (S-317)', type: 'Lab' },
  { day: 'Sunday', p: 6, subject: 'Electronic Servicing', course: '26844', teacher: 'DS', room: 'Basic Ent Lab (S-317)', type: 'Lab' },

  // Monday
  { day: 'Monday', p: 1, subject: 'Digital Electronics-II', course: '26841', teacher: 'HA', room: 'N-312', type: 'Theory' },
  { day: 'Monday', p: 2, subject: 'Electrical Installation, Planning and Estimating', course: '26741', teacher: 'MSH', room: 'N-312', type: 'Theory' },
  { day: 'Monday', p: 3, subject: 'Networks, Filters and Transmission Lines', course: '26843', teacher: 'AZ', room: 'Basic Ent Lab (S-317)', type: 'Lab' },
  { day: 'Monday', p: 4, subject: 'Networks, Filters and Transmission Lines', course: '26843', teacher: 'AZ', room: 'Basic Ent Lab (S-317)', type: 'Lab' },
  { day: 'Monday', p: 5, subject: 'DC Machine', course: '26742', teacher: 'MAS', room: 'N-312', type: 'Theory' },

  // Tuesday
  { day: 'Tuesday', p: 1, subject: 'Communication Engineering', course: '26842', teacher: 'MHR', room: 'Digital Ent Lab (N-313)', type: 'Lab' },
  { day: 'Tuesday', p: 2, subject: 'Communication Engineering', course: '26842', teacher: 'MHR', room: 'Digital Ent Lab (N-313)', type: 'Lab' },
  { day: 'Tuesday', p: 3, subject: 'Digital Electronics-II', course: '26841', teacher: 'HA', room: 'N-312', type: 'Theory' },
  { day: 'Tuesday', p: 4, subject: 'Networks, Filters and Transmission Lines', course: '26843', teacher: 'AZ', room: 'N-312', type: 'Theory' },
  { day: 'Tuesday', p: 5, subject: 'Electrical Installation, Planning and Estimating', course: '26741', teacher: 'MSH', room: 'N-312', type: 'Theory' },

  // Wednesday
  { day: 'Wednesday', p: 1, subject: 'Accounting', course: '25841', teacher: 'AzR', room: 'N-312', type: 'Theory' },
  { day: 'Wednesday', p: 2, subject: 'Networks, Filters and Transmission Lines', course: '26843', teacher: 'AZ', room: 'N-312', type: 'Theory' },
  { day: 'Wednesday', p: 3, subject: 'Digital Electronics-II', course: '26841', teacher: 'HA', room: 'Digital Ent Lab (N-313)', type: 'Lab' },
  { day: 'Wednesday', p: 4, subject: 'Digital Electronics-II', course: '26841', teacher: 'HA', room: 'Digital Ent Lab (N-313)', type: 'Lab' },
  { day: 'Wednesday', p: 5, subject: 'DC Machine', course: '26742', teacher: 'MAS', room: 'N-312', type: 'Theory' },

  // Thursday
  { day: 'Thursday', p: 1, subject: 'DC Machine', course: '26742', teacher: 'MAS', room: 'N-312', type: 'Theory' },
  { day: 'Thursday', p: 2, subject: 'Communication Engineering', course: '26842', teacher: 'MHR', room: 'N-312', type: 'Theory' },
  { day: 'Thursday', p: 3, subject: 'Accounting', course: '25841', teacher: 'AzR', room: 'S-214', type: 'Theory' },
  { day: 'Thursday', p: 4, subject: 'Electrical Installation, Planning and Estimating', course: '26741', teacher: 'MSH', room: 'EWM (S-314)', type: 'Lab' },
  { day: 'Thursday', p: 5, subject: 'Electrical Installation, Planning and Estimating', course: '26741', teacher: 'MSH', room: 'EWM (S-314)', type: 'Lab' }
];

export const AVAILABLE_GROUPS = [
  { id: 'ENT-4-2', name: 'ENT 4/2', semester: '4', shift: '2', title: '4th Semester • 2nd Shift (Current)' }
];
