/**
 * Faculty Directory Data Store - ECR Routine Web
 */

export const TEACHERS = [
  {
    code: 'HA',
    name: {
      en: 'Hakimin Ahmed',
      bn: 'হাকিমীন আহমেদ'
    },
    subject: {
      en: 'Digital Electronics-II',
      bn: 'ডিজিটাল ইলেকট্রনিক্স-২'
    },
    course: '26841',
    designation: {
      en: 'Part-Time Teacher (Electronics)',
      bn: 'খন্ডকালীন শিক্ষক (ইলেকট্রনিক্স)'
    },
    phone: '01759731841',
    isClassTeacher: true
  },
  {
    code: 'AzR',
    name: {
      en: 'Md. Azizur Rahman',
      bn: 'মো. আজিজুর রহমান'
    },
    subject: {
      en: 'Accounting',
      bn: 'অ্যাকাউন্টিং'
    },
    course: '25841',
    designation: {
      en: 'Instructor (Non-Tech/Accounting)',
      bn: 'ইন্সট্রাক্টর (নন-টেক/অ্যাকাউন্টিং)'
    },
    phone: '01724441634',
    isClassTeacher: false
  },
  {
    code: 'MHR',
    name: {
      en: 'Md. Halim Reja',
      bn: 'মো. হালিম রেজা'
    },
    subject: {
      en: 'Communication Engineering',
      bn: 'কমিউনিকেশন ইঞ্জিনিয়ারিং'
    },
    course: '26842',
    designation: {
      en: 'Instructor (Tech/Electronics)',
      bn: 'ইন্সট্রাক্টর (টেক/ইলেকট্রনিক্স)'
    },
    phone: '01717701784',
    isClassTeacher: false
  },
  {
    code: 'MSH',
    name: {
      en: 'Md. Sazib Hossain',
      bn: 'মো. সজিব হোসেন'
    },
    subject: {
      en: 'Electrical Installation, Planning and Estimating',
      bn: 'ইলেকট্রিক্যাল ইনস্টলেশন, প্ল্যানিং অ্যান্ড এস্টিমেটিং'
    },
    course: '26741',
    designation: {
      en: 'Junior Instructor (Tech/Electrical)',
      bn: 'জুনিয়র ইন্সট্রাক্টর (টেক/ইলেকট্রিক্যাল)'
    },
    phone: '01744287025',
    isClassTeacher: false
  },
  {
    code: 'MAS',
    name: {
      en: 'Md. Abdus Salam',
      bn: 'মো. আব্দুস সালাম'
    },
    subject: {
      en: 'DC Machine',
      bn: 'ডিসি মেশিন'
    },
    course: '26742',
    designation: {
      en: 'Junior Instructor (Tech/Electrical)',
      bn: 'জুনিয়র ইন্সট্রাক্টর (টেক/ইলেকট্রিক্যাল)'
    },
    phone: '01763248085',
    isClassTeacher: false
  },
  {
    code: 'AZ',
    name: {
      en: 'Md. Aktaruzzaman',
      bn: 'মো. আক্তারুজ্জামান'
    },
    subject: {
      en: 'Networks, Filters and Transmission Lines',
      bn: 'নেটওয়ার্কস, ফিল্টার্স অ্যান্ড ট্রান্সমিশন লাইনস'
    },
    course: '26843',
    designation: {
      en: 'Instructor (Tech/Electronics)',
      bn: 'ইন্সট্রাক্টর (টেক/ইলেকট্রনিক্স)'
    },
    phone: '01721141691',
    isClassTeacher: false
  },
  {
    code: 'DS',
    name: {
      en: 'Md. Delowar Syed',
      bn: 'মো. দেলোয়ার সৈয়দ'
    },
    subject: {
      en: 'Electronic Servicing',
      bn: 'ইলেকট্রনিক সার্ভিসিং'
    },
    course: '26844',
    designation: {
      en: 'Junior Instructor (Tech/Electronics)',
      bn: 'জুনিয়র ইন্সট্রাক্টর (টেক/ইলেকট্রনিক্স)'
    },
    phone: '01776895558',
    isClassTeacher: false
  }
];

export const getTeacherByCode = (code) => {
  return TEACHERS.find(t => t.code.toLowerCase() === (code || '').trim().toLowerCase()) || null;
};
