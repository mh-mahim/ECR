/**
 * Internationalization (i18n) Module
 * English & Bangla translations with digit conversion
 */

const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBanglaDigits = (numStr) => {
  return String(numStr).replace(/[0-9]/g, (d) => BANGLA_DIGITS[d] || d);
};

export const TRANSLATIONS = {
  en: {
    appTitle: 'ENT Pulse',
    deptTitle: 'Electronics Technology',
    semesterLabel: '4th Semester (ENT 4/2)',
    heroSubtitle: 'Chapainawabganj Govt. Polytechnic Institute • Session 2026–27',
    classTeacher: 'Class Teacher',
    totalLoad: 'Total Load',
    loadUnit: 'periods / week',
    activeDays: 'Active Days',
    sunThu: 'Sun – Thu',
    shiftLabel: 'Second Shift',
    
    // Now / Next Card
    liveConsole: 'Live Schedule',
    inClass: 'LIVE NOW',
    upNext: 'UP NEXT',
    freePeriod: 'Break / Free Period',
    dayCompleted: 'Classes Finished Today',
    weekend: 'Weekend / Off-Day',
    nextClassIn: 'Starts in',
    endsIn: 'Ends in',
    nextClassStartsAt: 'Next class at',
    routineRuns: 'Routine runs Sunday to Thursday',
    noMoreToday: 'No more classes scheduled today.',
    enjoyWeekend: 'Enjoy your weekend! Next routine day: Sunday.',
    
    // Views & Tabs
    dayView: 'Day View',
    weekView: 'Week View',
    today: 'TODAY',
    allClasses: 'All Classes',
    filterAll: 'All',
    filterLab: 'Labs Only',
    filterTheory: 'Theory Only',
    searchPlaceholder: 'Search subject, teacher, code or room...',
    noSearchResults: 'No matching classes found.',
    clearSearch: 'Clear search',
    
    // Class Card & Modal
    period: 'Period',
    to: 'to',
    room: 'Room',
    courseCode: 'Course Code',
    faculty: 'Faculty',
    teacherCode: 'Teacher Code',
    designation: 'Designation',
    type: 'Type',
    lab: 'Practical Lab',
    theory: 'Theory Class',
    close: 'Close',
    callFaculty: 'Call Faculty',
    copyNumber: 'Copy Number',
    copyCode: 'Copy Course Code',
    shareClass: 'Share Class Info',
    copiedToClipboard: 'Copied to clipboard!',
    
    // Actions & Tools
    addToCalendar: 'Add to Calendar',
    exportIcs: 'Export .ics',
    printRoutine: 'Print / Save PDF',
    installApp: 'Install App',
    shareApp: 'Share App',
    toggleTheme: 'Toggle Theme',
    toggleLanguage: 'বাংলায় দেখুন',
    
    // Navigation
    navToday: 'Today',
    navRoutine: 'Routine',
    navFaculty: 'Faculty',
    navSettings: 'Settings',
    navMore: 'More',

    // Notice
    dismissNotice: 'Dismiss'
  },
  bn: {
    appTitle: 'ইএনটি পালস',
    deptTitle: 'ইলেকট্রনিক্স টেকনোলজি',
    semesterLabel: '৪র্থ পর্ব (ইএনটি ৪/২)',
    heroSubtitle: 'চাঁপাইনবাবগঞ্জ পলিটেকনিক ইনস্টিটিউট • সেশন ২০২৬–২৭',
    classTeacher: 'ক্লাস শিক্ষক',
    totalLoad: 'মোট ক্লাস লোড',
    loadUnit: 'টি পিরিয়ড / সপ্তাহ',
    activeDays: 'ক্লাসের দিনসমূহ',
    sunThu: 'রবি – বৃহস্পতি',
    shiftLabel: '২য় শিফট',
    
    // Now / Next Card
    liveConsole: 'লাইভ ক্লাসের তথ্য',
    inClass: 'এখন চলছে',
    upNext: 'পরবর্তী ক্লাস',
    freePeriod: 'বিরতি / ফ্রি পিরিয়ড',
    dayCompleted: 'আজকের সব ক্লাস সম্পন্ন',
    weekend: 'সাপ্তাহিক ছুটি',
    nextClassIn: 'শুরু হতে বাকি',
    endsIn: 'শেষ হতে বাকি',
    nextClassStartsAt: 'পরবর্তী ক্লাস শুরু',
    routineRuns: 'ক্লাস রুটিন রবিবার থেকে বৃহস্পতিবার',
    noMoreToday: 'আজকের মতো আর কোনো ক্লাস নেই।',
    enjoyWeekend: 'শুভ ছুটির দিন! পরবর্তী ক্লাস রবিবার।',
    
    // Views & Tabs
    dayView: 'দৈনিক ভিউ',
    weekView: 'সাপ্তাহিক ভিউ',
    today: 'আজ',
    allClasses: 'সকল ক্লাস',
    filterAll: 'সব',
    filterLab: 'শুধু ল্যাব',
    filterTheory: 'শুধু থিওরি',
    searchPlaceholder: 'বিষয়, শিক্ষক, কোড বা রুম খুঁজুন...',
    noSearchResults: 'কোনো ক্লাস পাওয়া যায়নি।',
    clearSearch: 'সার্চ মুছুন',
    
    // Class Card & Modal
    period: 'পিরিয়ড',
    to: 'থেকে',
    room: 'রুম',
    courseCode: 'কোর্স কোড',
    faculty: 'শিক্ষক',
    teacherCode: 'শিক্ষক কোড',
    designation: 'পদবী',
    type: 'ধরণ',
    lab: 'ব্যবহারিক (ল্যাব)',
    theory: 'তাত্ত্বিক (থিওরি)',
    close: 'বন্ধ করুন',
    callFaculty: 'শিক্ষককে কল করুন',
    copyNumber: 'নম্বর কপি করুন',
    copyCode: 'কোর্স কোড কপি করুন',
    shareClass: 'ক্লাসের তথ্য শেয়ার করুন',
    copiedToClipboard: 'ক্লিপবোর্ডে কপি হয়েছে!',
    
    // Actions & Tools
    addToCalendar: 'ক্যালেন্ডারে যুক্ত করুন',
    exportIcs: 'ক্যালেন্ডার ফাইল (.ics)',
    printRoutine: 'প্রিন্ট / PDF সংরক্ষণ',
    installApp: 'অ্যাপ ইনস্টল করুন',
    shareApp: 'শেয়ার করুন',
    toggleTheme: 'থিম পরিবর্তন',
    toggleLanguage: 'Switch to English',
    
    // Navigation
    navToday: 'আজকের ক্লাস',
    navRoutine: 'রুটিন',
    navFaculty: 'শিক্ষকবৃন্দ',
    navSettings: 'সেটিংস',
    navMore: 'আরও',

    // Notice
    dismissNotice: 'মুছে ফেলুন'
  }
};

export const t = (key, lang = 'en') => {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
};
