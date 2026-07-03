// Application Configuration
const appConfig = {
    title: "CNPI Routine Pro",
    semesterName: "Electronics Department • Third Semester • Second Shift (ENT-3/2)",
    author: "M. H. Mahim",
    portfolioUrl: "https://mhmahim.me"
};

// Subject Names Translation
const subT = {
    "Electrical Circuits-II": { bn: "ইলেকট্রিক্যাল সার্কিটস-২", en: "Electrical Circuits-II" },
    "Physics-II": { bn: "ফিজিক্স-২", en: "Physics-II" },
    "Digital Ent-1": { bn: "ডিজিটাল এন্টারপ্রেনিয়রশিপ-১", en: "Digital Ent-1" },
    "Computer App": { bn: "কম্পিউটার অ্যাপ্লিকেশন", en: "Computer App" },
    "Power Electronics": { bn: "পাওয়ার ইলেকট্রনিক্স", en: "Power Electronics" },
    "Mathematics-III": { bn: "ম্যাথমেটিক্স-৩", en: "Mathematics-III" },
    "Computer Office App": { bn: "কম্পিউটার অফিস অ্যাপ.", en: "Computer Office App" }
};

// Room/Lab Names Translation
const roomT = {
    "EWM": { bn: "EWM", en: "EWM" },
    "S-316": { bn: "S-316", en: "S-316" },
    "Software Lab": { bn: "সফটওয়্যার ল্যাব", en: "Software Lab" },
    "Digital Ent": { bn: "ডিজিটাল এন্ট.", en: "Digital Ent" },
    "Basic Ent Lab": { bn: "বেসিক এন্ট. ল্যাব", en: "Basic Ent Lab" },
    "Physics Lab": { bn: "ফিজিক্স ল্যাব", en: "Physics Lab" }
};

// Teacher Names Translation
const teacherNameT = {
    "Md. Delowar Syed": { bn: "মো. দেলোয়ার সৈয়দ", en: "Md. Delowar Syed" },
    "Mahabubul Alam": { bn: "মাহাবুবুল আলম", en: "Mahabubul Alam" },
    "Md. Abdul Quader Zilani": { bn: "মো. আব্দুল কাদের জিলানী", en: "Md. Abdul Quader Zilani" },
    "Md. Halim Reja": { bn: "মো. হালিম রেজা", en: "Md. Halim Reja" },
    "Md. Abdus Salam": { bn: "মো. আব্দুস সালাম", en: "Md. Abdus Salam" },
    "Md. Masud Rana": { bn: "মো. মাসুদ রানা", en: "Md. Masud Rana" },
    "MR": { bn: "মো. মাসুদ রানা", en: "Md. Masud Rana" }
};

// Designations Translation
const desigT = {
    "Jr. Instructor": { bn: "Jr. Instructor", en: "Jr. Instructor" },
    "Instructor": { bn: "Instructor", en: "Instructor" }
};

// Routine Data Structure
const routineData = [
    { day: "Sunday", period: 1, sub: "Electrical Circuits-II", code: "MAS", room: "EWM" },
    { day: "Sunday", period: 2, sub: "Electrical Circuits-II", code: "MAS", room: "EWM" },
    { day: "Sunday", period: 3, sub: "Physics-II", code: "AQZ", room: "S-316" },
    { day: "Sunday", period: 4, sub: "Digital Ent-1", code: "MR", room: "S-316" },
    { day: "Sunday", period: 5, sub: "Computer App", code: "MHR", room: "Software Lab" },
    { day: "Sunday", period: 6, sub: "Computer App", code: "MHR", room: "Software Lab" },
    
    { day: "Monday", period: 1, sub: "Digital Ent-1", code: "MR", room: "Digital Ent" },
    { day: "Monday", period: 2, sub: "Digital Ent-1", code: "MR", room: "Digital Ent" },
    { day: "Monday", period: 3, sub: "Electrical Circuits-II", code: "MAS", room: "S-316" },
    { day: "Monday", period: 4, sub: "Power Electronics", code: "DS", room: "S-316" },
    { day: "Monday", period: 5, sub: "Mathematics-III", code: "MA", room: "S-316" },

    { day: "Tuesday", period: 1, sub: "Power Electronics", code: "DS", room: "S-316" },
    { day: "Tuesday", period: 2, sub: "Digital Ent-1", code: "MR", room: "S-316" },
    { day: "Tuesday", period: 3, sub: "Mathematics-III", code: "MA", room: "S-316" },
    { day: "Tuesday", period: 4, sub: "Mathematics-III", code: "MA", room: "S-316" },
    { day: "Tuesday", period: 5, sub: "Physics-II", code: "AQZ", room: "S-316" },

    { day: "Wednesday", period: 1, sub: "Electrical Circuits-II", code: "MAS", room: "S-316" },
    { day: "Wednesday", period: 2, sub: "Physics-II", code: "AQZ", room: "S-316" },
    { day: "Wednesday", period: 3, sub: "Power Electronics", code: "DS", room: "Basic Ent Lab" },
    { day: "Wednesday", period: 4, sub: "Power Electronics", code: "DS", room: "Basic Ent Lab" },
    { day: "Wednesday", period: 5, sub: "Mathematics-III", code: "MA", room: "S-316" },

    { day: "Thursday", period: 1, sub: "Computer App", code: "MHR", room: "Software Lab" },
    { day: "Thursday", period: 2, sub: "Computer App", code: "MHR", room: "Software Lab" },
    { day: "Thursday", period: 3, sub: "Mathematics-III", code: "MA", room: "S-316" },
    { day: "Thursday", period: 4, sub: "Electrical Circuits-II", code: "MAS", room: "S-316" },
    { day: "Thursday", period: 5, sub: "Physics-II", code: "AQZ", room: "Physics Lab" },
    { day: "Thursday", period: 6, sub: "Physics-II", code: "AQZ", room: "Physics Lab" }
];

// Teacher Information
const teacherData = [
    { name: "Md. Delowar Syed", code: "DS", sub: "Power Electronics", phone: "01776895558", desig: "Jr. Instructor" },
    { name: "Mahabubul Alam", code: "MA", sub: "Mathematics-III", phone: "01745867997", desig: "Jr. Instructor" },
    { name: "Md. Abdul Quader Zilani", code: "AQZ", sub: "Physics-II", phone: "01717928560", desig: "Instructor" },
    { name: "Md. Halim Reja", code: "MHR", sub: "Computer Office App", phone: "01717701784", desig: "Instructor" },
    { name: "Md. Abdus Salam", code: "MAS", sub: "Electrical Circuits-II", phone: "01763248085", desig: "Jr. Instructor" },
    { name: "Md. Masud Rana", code: "MR", sub: "Digital Ent-1", phone: "01721532450", desig: "Jr. Instructor" }
];
