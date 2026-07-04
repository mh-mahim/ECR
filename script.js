const i18n = {
    en: {
        ongoing: "Class Ongoing",
        scheduleFor: "Schedule for",
        viewAll: "View All",
        cardView: "Card View",
        facultyTitle: "Faculty Directory",
        allWeek: "All Week",
        timeCol: "Time",
        noClasses: "No classes scheduled for",
        developedBy: "Developed with ❤️ by",
        redesigned: "© 2026 CNPI ENT-3/2. Redesigned.",
        classDetails: "Class Details",
        subject: "Subject",
        teacher: "Teacher",
        room: "Room",
        teacherProfile: "Teacher Profile",
        download: "Download",
        shortCode: "Short Code",
        phone: "Phone",
        viewProfile: "View Profile",
        copy: "Copy",
        call: "Call",
        days: {
            "Sunday": "Sunday", "Monday": "Monday", "Tuesday": "Tuesday",
            "Wednesday": "Wednesday", "Thursday": "Thursday"
        },
        shortDays: {
            "Sunday": "Sun", "Monday": "Mon", "Tuesday": "Tue",
            "Wednesday": "Wed", "Thursday": "Thu"
        }
    },
    bn: {
        ongoing: "Class Ongoing",
        scheduleFor: "Schedule for",
        viewAll: "View All",
        cardView: "Card View",
        facultyTitle: "Faculty Directory",
        allWeek: "All Week",
        timeCol: "Time",
        noClasses: "No classes scheduled for",
        developedBy: "Developed with ❤️ by",
        redesigned: "© 2026 CNPI ENT-3/2. Redesigned.",
        classDetails: "Class Details",
        subject: "Subject",
        teacher: "Teacher",
        room: "Room",
        teacherProfile: "Teacher Profile",
        download: "Download",
        shortCode: "Short Code",
        phone: "Phone",
        viewProfile: "View Profile",
        copy: "Copy",
        call: "Call",
        days: {
            "Sunday": "Sunday", "Monday": "Monday", "Tuesday": "Tuesday",
            "Wednesday": "Wednesday", "Thursday": "Thursday"
        },
        shortDays: {
            "Sunday": "Sun", "Monday": "Mon", "Tuesday": "Tue",
            "Wednesday": "Wed", "Thursday": "Thu"
        }
    }
};

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const periods = [
    { id: 1, name: { en: "1st", bn: "1st" }, time: { en: "01:30 PM - 02:15 PM", bn: "01:30 PM - 02:15 PM" }, rawTime: "01:30 PM - 02:15 PM" },
    { id: 2, name: { en: "2nd", bn: "2nd" }, time: { en: "02:15 PM - 03:00 PM", bn: "02:15 PM - 03:00 PM" }, rawTime: "02:15 PM - 03:00 PM" },
    { id: 3, name: { en: "3rd", bn: "3rd" }, time: { en: "03:00 PM - 03:45 PM", bn: "03:00 PM - 03:45 PM" }, rawTime: "03:00 PM - 03:45 PM" },
    { id: 4, name: { en: "4th", bn: "4th" }, time: { en: "03:45 PM - 04:30 PM", bn: "03:45 PM - 04:30 PM" }, rawTime: "03:45 PM - 04:30 PM" },
    { id: 5, name: { en: "5th", bn: "5th" }, time: { en: "04:30 PM - 05:15 PM", bn: "04:30 PM - 05:15 PM" }, rawTime: "04:30 PM - 05:15 PM" },
    { id: 6, name: { en: "6th", bn: "6th" }, time: { en: "05:15 PM - 06:00 PM", bn: "05:15 PM - 06:00 PM" }, rawTime: "05:15 PM - 06:00 PM" },
    { id: 7, name: { en: "7th", bn: "7th" }, time: { en: "06:00 PM - 06:45 PM", bn: "06:00 PM - 06:45 PM" }, rawTime: "06:00 PM - 06:45 PM" }
];

// App State
let currentLang = "en"; // Default to English
let currentDayStr = "Sunday";
let isTableView = false;

// DOM Elements
const timeDisplay = document.getElementById('current-time');
const dateDisplay = document.getElementById('current-date');
const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');
const dayTabs = document.querySelectorAll('.day-tab');
const selectedDayTitle = document.getElementById('selected-day-title');
const cardsContainer = document.getElementById('routine-cards-container');
const tableContainer = document.getElementById('routine-table-container');
const viewAllBtn = document.getElementById('view-all-btn');
const viewAllText = document.getElementById('view-all-text');
const facultyGrid = document.getElementById('faculty-grid');
const modalOverlay = document.getElementById('teacher-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal-btn');
const liveIndicator = document.getElementById('live-class-indicator');

// Init
function init() {
    setupTheme();
    setupLang();
    setInitialDay();
    updateClock();
    setInterval(updateClock, 1000);
    renderCardsView(currentDayStr);
    renderTableView();
    renderFaculty();
    setupEventListeners();
}

function setupTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
    } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function setupLang() {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
        currentLang = savedLang;
    }
    updateTranslations();
}

function toggleLang() {
    currentLang = currentLang === 'en' ? 'bn' : 'en';
    localStorage.setItem('lang', currentLang);
    updateTranslations();
    
    // Re-render components with new language
    updateDayTabs();
    if (isTableView) {
        renderTableView();
    } else {
        renderCardsView(currentDayStr);
    }
    renderFaculty();
}

function updateTranslations() {
    // Update simple text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLang][key]) {
            el.textContent = i18n[currentLang][key];
        }
    });

    langToggle.textContent = currentLang === 'en' ? 'BN' : 'EN';
    
    // Update view all btn text based on state
    if (isTableView) {
        viewAllText.textContent = i18n[currentLang].cardView;
    } else {
        viewAllText.textContent = i18n[currentLang].viewAll;
    }
}

function setInitialDay() {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = daysOfWeek[new Date().getDay()];
    if (days.includes(today)) {
        currentDayStr = today;
    }
    updateDayTabs();
}

function updateDayTabs() {
    dayTabs.forEach(tab => {
        const dayStr = tab.dataset.day;
        tab.textContent = i18n[currentLang].shortDays[dayStr];
        
        if (dayStr === currentDayStr) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    if (isTableView) {
        selectedDayTitle.textContent = i18n[currentLang].allWeek;
    } else {
        selectedDayTitle.textContent = i18n[currentLang].days[currentDayStr];
    }
}

function parseTimeToDate(timeStr) {
    const startStr = timeStr.split(' - ')[0];
    const endStr = timeStr.split(' - ')[1];
    function convertTo24(time12) {
        let [time, modifier] = time12.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') hours = '00';
        if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
        return { h: parseInt(hours), m: parseInt(minutes) };
    }
    const start = convertTo24(startStr);
    const end = convertTo24(endStr);
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), start.h, start.m);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), end.h, end.m);
    return { start: startDate, end: endDate };
}

function updateClock() {
    const now = new Date();
    const langCode = 'en-US';
    dateDisplay.textContent = now.toLocaleDateString(langCode, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    timeDisplay.textContent = now.toLocaleTimeString(langCode, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    
    // Check live class
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = daysOfWeek[now.getDay()];
    
    let isClassLive = false;
    
    if (days.includes(today) && today === currentDayStr) {
        periods.forEach(p => {
            const timeObj = parseTimeToDate(p.rawTime);
            if (now >= timeObj.start && now < timeObj.end) {
                const classInfo = routineData.find(r => r.day === today && r.period === p.id);
                if (classInfo) {
                    isClassLive = true;
                }
            }
        });
    }
    
    if (isClassLive) {
        liveIndicator.classList.remove('hidden');
    } else {
        liveIndicator.classList.add('hidden');
    }
    
    // Update progress bars every second
    const nowTime = now.getTime();
    document.querySelectorAll('.progress-fill').forEach(fill => {
        const start = parseInt(fill.getAttribute('data-start'));
        const end = parseInt(fill.getAttribute('data-end'));
        if (nowTime >= start && nowTime <= end) {
            let percent = ((nowTime - start) / (end - start)) * 100;
            fill.style.width = `${percent}%`;
        } else if (nowTime > end) {
            fill.style.width = `100%`;
        }
    });
    
    // Re-render only at the exact start/end of a period (00, 15, 30, 45) and second 0
    const m = now.getMinutes();
    if (!isTableView && now.getSeconds() === 0 && (m === 0 || m === 15 || m === 30 || m === 45)) {
        renderCardsView(currentDayStr);
    }
}

function getTranslatedStr(obj, key) {
    if (!obj || !obj[key]) return key;
    return obj[key][currentLang] || key;
}

function renderCardsView(day) {
    cardsContainer.innerHTML = '';
    
    const dayClasses = routineData.filter(r => r.day === day).sort((a, b) => a.period - b.period);
    
    if (dayClasses.length === 0) {
        cardsContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); font-weight: 600;">${i18n[currentLang].noClasses} ${i18n[currentLang].days[day]}.</div>`;
        return;
    }

    const groupedClasses = [];
    let i = 0;
    while (i < dayClasses.length) {
        let cls = dayClasses[i];
        let span = 1;
        while (i + span < dayClasses.length) {
            let nextCls = dayClasses[i + span];
            if (nextCls.sub === cls.sub && nextCls.code === cls.code && nextCls.room === cls.room && nextCls.period === cls.period + span) {
                span++;
            } else {
                break;
            }
        }
        groupedClasses.push({ cls, span });
        i += span;
    }

    const now = new Date();
    const today = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()];

    groupedClasses.forEach((group, index) => {
        const cls = group.cls;
        const span = group.span;
        
        const startPeriodInfo = periods.find(p => p.id === cls.period);
        const endPeriodInfo = periods.find(p => p.id === cls.period + span - 1);
        
        const startTimeObj = parseTimeToDate(startPeriodInfo.rawTime);
        const endTimeObj = parseTimeToDate(endPeriodInfo.rawTime);
        
        let isLive = false;
        if (day === today && now >= startTimeObj.start && now < endTimeObj.end) {
            isLive = true;
        }

        const teacher = teacherData.find(t => t.code === cls.code) || { name: cls.code };
        
        let progressHtml = '';
        if (isLive) {
            progressHtml = `
                <div class="progress-bar-container">
                    <div class="progress-fill" data-start="${startTimeObj.start.getTime()}" data-end="${endTimeObj.end.getTime()}"></div>
                </div>
            `;
        }
        
        const card = document.createElement('div');
        const animDelay = `delay-${Math.min((index % 4) + 1, 4)}`;
        card.className = `class-card animate-fade-up with-glow ${animDelay} ${isLive ? 'is-live' : ''}`;
        card.style.setProperty('--glow-delay', `-${Math.random() * 4}s`);
        
        let periodNameText = startPeriodInfo.name[currentLang];
        if (span > 1) {
            periodNameText += " - " + endPeriodInfo.name[currentLang];
        }
        
        let timePartsStart = startPeriodInfo.time[currentLang].split(' - ');
        let timePartsEnd = endPeriodInfo.time[currentLang].split(' - ');
        let combinedTimeText = timePartsStart[0] + "<br>-<br>" + timePartsEnd[1];
        
        const fullTimeStr = timePartsStart[0] + " - " + timePartsEnd[1];

        card.innerHTML = `
            ${progressHtml}
            <div class="time-slot">
                <span class="period-name">${periodNameText}</span>
                <span class="period-time" style="font-size: 0.85rem;">${combinedTimeText}</span>
            </div>
            <div class="class-details">
                <div class="subject-name">${getTranslatedStr(subT, cls.sub)}</div>
                <div class="subject-code">${getTranslatedStr(teacherNameT, teacher.name)} (${cls.code})</div>
                <div class="meta-info">
                    <span class="meta-badge room"><span class="material-icons-round" style="font-size: 14px;">room</span> ${getTranslatedStr(roomT, cls.room)}</span>
                </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; padding: 0 16px; gap: 8px;">
                <button class="icon-btn" onclick="event.stopPropagation(); copyToClipboard('${getTranslatedStr(subT, cls.sub)} \\nTeacher: ${getTranslatedStr(teacherNameT, teacher.name)} \\nRoom: ${getTranslatedStr(roomT, cls.room)}', this)" style="width: 36px; height: 36px; box-shadow: none;" title="Copy">
                    <span class="material-icons-round" style="font-size: 18px;">content_copy</span>
                </button>
                <button class="icon-btn" style="width: 36px; height: 36px; box-shadow: none;" title="${i18n[currentLang].classDetails}">
                    <span class="material-icons-round" style="font-size: 18px;">chevron_right</span>
                </button>
            </div>
        `;
        
        card.addEventListener('click', () => showClassModal(cls, fullTimeStr));
        cardsContainer.appendChild(card);
    });
}

function renderTableView() {
    const thead = document.getElementById('table-head');
    const tbody = document.getElementById('table-body');
    
    // Clear existing dynamic heads
    const thDays = thead.querySelectorAll('th:not(.time-col-header)');
    thDays.forEach(th => th.remove());
    tbody.innerHTML = '';
    
    // Setup head
    days.forEach(day => {
        const th = document.createElement('th');
        th.textContent = i18n[currentLang].days[day];
        th.id = `th-table-${day}`;
        thead.appendChild(th);
    });
    
    const skipMap = {};
    
    periods.forEach(p => {
        const tr = document.createElement('tr');
        
        // Time col
        const timeParts = p.time[currentLang].split(' - ');
        tr.innerHTML = `
            <td class="time-cell">
                <div class="time-cell-period">${p.name[currentLang]}</div>
                <div>${timeParts[0]}</div>
                <div style="font-size: 0.7rem; color: var(--text-muted); margin: 2px 0;">-</div>
                <div>${timeParts[1]}</div>
            </td>
        `;
        
        days.forEach(day => {
            const key = `${day}-${p.id}`;
            if (skipMap[key]) return;
            
            const classInfo = routineData.find(r => r.day === day && r.period === p.id);
            const td = document.createElement('td');
            td.id = `td-${day}-${p.id}`;
            
            if (classInfo) {
                let span = 1;
                for (let nextId = p.id + 1; nextId <= periods.length; nextId++) {
                    const nextClass = routineData.find(r => r.day === day && r.period === nextId);
                    if (nextClass && nextClass.sub === classInfo.sub && nextClass.code === classInfo.code) {
                        span++;
                        skipMap[`${day}-${nextId}`] = true;
                    } else {
                        break;
                    }
                }
                
                if (span > 1) td.rowSpan = span;
                td.className = "class-cell with-glow";
                td.style.setProperty('--glow-delay', `-${Math.random() * 4}s`);
                td.innerHTML = `
                    <div class="class-cell-content">
                        <span class="cell-sub">${getTranslatedStr(subT, classInfo.sub)}</span>
                        <span class="cell-code">${classInfo.code}</span>
                        <span class="cell-room">${getTranslatedStr(roomT, classInfo.room)}</span>
                    </div>
                `;
                td.addEventListener('click', () => showClassModal(classInfo, p.time[currentLang]));
            } else {
                td.className = "empty-cell";
                td.textContent = "-";
            }
            
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
    
    highlightTodayInTable();
}

function highlightTodayInTable() {
    const today = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
    document.querySelectorAll('th, td').forEach(el => el.classList.remove('highlight-today-th', 'highlight-today-td'));
    
    if (days.includes(today)) {
        const th = document.getElementById(`th-table-${today}`);
        if (th) th.classList.add('highlight-today-th');
        
        document.querySelectorAll(`[id^="td-${today}"]`).forEach(td => {
            td.classList.add('highlight-today-td');
        });
    }
}

function renderFaculty() {
    facultyGrid.innerHTML = '';
    teacherData.forEach((t, index) => {
        const card = document.createElement('div');
        const animDelay = `delay-${Math.min((index % 4) + 1, 4)}`;
        card.className = `faculty-card animate-fade-up with-glow ${animDelay}`;
        card.style.setProperty('--glow-delay', `-${Math.random() * 4}s`);
        
        // Translating phone number digits
        const phoneStr = currentLang === 'bn' ? t.phone.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]) : t.phone;
        
        card.innerHTML = `
            <div class="faculty-avatar" style="margin-bottom: 12px; display: inline-flex; justify-content: center; align-items: center; width: 60px; height: 60px; border-radius: 50%; background: var(--accent-light); color: var(--accent); border: 2px solid var(--accent);"><span class="material-icons-round" style="font-size: 36px;">person</span></div>
            <div class="arrow-icon"><span class="material-icons-round">open_in_new</span></div>
            <h3>${getTranslatedStr(teacherNameT, t.name)}</h3>
            <div class="desig">${getTranslatedStr(desigT, t.desig)}</div>
            <div class="details" style="margin-bottom: 6px;"><span class="material-icons-round">menu_book</span> ${getTranslatedStr(subT, t.sub)}</div>
            <div class="details"><span class="material-icons-round">phone_iphone</span> ${phoneStr}</div>
            <div style="display: flex; gap: 8px; margin-top: 16px;">
                <button class="action-btn" onclick="event.stopPropagation(); window.location.href='tel:${t.phone}'" style="flex: 1; background: var(--bg-secondary); border: 2px solid var(--card-border); color: var(--text-primary); padding: 10px; border-radius: var(--radius-sm); font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <span class="material-icons-round" style="font-size: 18px;">call</span>
                </button>
                <button class="action-btn" style="flex: 3; background: var(--accent); color: white; border: none; padding: 10px; border-radius: var(--radius-sm); font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <span class="material-icons-round" style="font-size: 18px;">visibility</span> ${i18n[currentLang].viewProfile}
                </button>
            </div>
        `;
        card.addEventListener('click', () => showTeacherModal(t));
        facultyGrid.appendChild(card);
    });
}

function showClassModal(info, time) {
    const t = teacherData.find(x => x.code === info.code);
    const teacherName = t ? t.name : info.code;
    
    modalBody.innerHTML = `
        <div class="modal-header-line"></div>
        <h2 class="modal-title">${i18n[currentLang].classDetails}</h2>
        
        <div class="modal-info-box">
            <div class="info-row">
                <div class="info-icon"><span class="material-icons-round">menu_book</span></div>
                <div class="info-text">
                    <span class="info-label">${i18n[currentLang].subject}</span>
                    <span class="info-val">${getTranslatedStr(subT, info.sub)}</span>
                </div>
            </div>
        </div>
        
        <div class="modal-info-box">
            <div class="info-row">
                <div class="info-icon icon-amber"><span class="material-icons-round">person</span></div>
                <div class="info-text">
                    <span class="info-label">${i18n[currentLang].teacher}</span>
                    <span class="info-val"><a href="#" onclick="showTeacherModalByCode('${info.code}'); return false;">${getTranslatedStr(teacherNameT, teacherName)} (${info.code})</a></span>
                </div>
            </div>
            <div class="info-row" style="margin-top: 8px;">
                <div class="info-icon icon-rose"><span class="material-icons-round">room</span></div>
                <div class="info-text">
                    <span class="info-label">${i18n[currentLang].room}</span>
                    <span class="info-val" style="color: var(--accent);">${getTranslatedStr(roomT, info.room)}</span>
                </div>
            </div>
        </div>
        
        <div class="modal-info-box" style="background: var(--accent-blue-light); border-color: var(--accent-blue-light);">
            <div class="info-row" style="align-items: center;">
                <div class="info-icon icon-blue"><span class="material-icons-round">event</span></div>
                <div class="info-text">
                    <span class="info-val" style="color: var(--accent);">${i18n[currentLang].days[info.day]} &bull; ${time}</span>
                </div>
            </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button class="action-btn" onclick="copyToClipboard('${getTranslatedStr(subT, info.sub)}\\nTeacher: ${getTranslatedStr(teacherNameT, teacherName)}\\nRoom: ${getTranslatedStr(roomT, info.room)}\\nTime: ${i18n[currentLang].days[info.day]} ${time}', this)" style="flex: 1; background: var(--bg-secondary); border: 2px solid var(--card-border); color: var(--text-primary); border-radius: var(--radius-sm); padding: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                <span class="material-icons-round" style="font-size: 18px;">content_copy</span> ${i18n[currentLang].copy}
            </button>
        </div>
    `;
    modalOverlay.classList.remove('hidden');
}

function showTeacherModal(t) {
    const phoneStr = currentLang === 'bn' ? t.phone.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]) : t.phone;

    modalBody.innerHTML = `
        <div class="modal-header-line"></div>
        <h2 class="modal-title">${i18n[currentLang].teacherProfile}</h2>
        
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 80px; height: 80px; background: var(--accent-light); color: var(--accent); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; border: 4px solid var(--accent);">
                <span class="material-icons-round" style="font-size: 48px;">person</span>
            </div>
            <h3 style="font-size: 1.3rem; margin-top: 12px; font-weight: 800;">${getTranslatedStr(teacherNameT, t.name)}</h3>
            <div style="color: var(--accent); font-weight: 700; font-size: 0.9rem;">${getTranslatedStr(desigT, t.desig)}</div>
        </div>
        
        <div class="modal-info-box">
            <div class="info-row">
                <div class="info-icon icon-blue"><span class="material-icons-round">badge</span></div>
                <div class="info-text">
                    <span class="info-label">${i18n[currentLang].shortCode}</span>
                    <span class="info-val">${t.code}</span>
                </div>
            </div>
            <div class="info-row" style="margin-top: 12px;">
                <div class="info-icon icon-rose"><span class="material-icons-round">menu_book</span></div>
                <div class="info-text">
                    <span class="info-label">${i18n[currentLang].subject}</span>
                    <span class="info-val">${getTranslatedStr(subT, t.sub)}</span>
                </div>
            </div>
            <div class="info-row" style="margin-top: 12px;">
                <div class="info-icon icon-amber"><span class="material-icons-round">phone</span></div>
                <div class="info-text">
                    <span class="info-label">${i18n[currentLang].phone}</span>
                    <span class="info-val"><a href="tel:${t.phone}">${phoneStr}</a></span>
                </div>
            </div>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 24px;">
            <a href="tel:${t.phone}" class="action-btn" style="flex: 1; text-align: center; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px; background: var(--accent); color: white; border: none; border-radius: var(--radius-sm); padding: 12px; font-weight: bold; transition: all 0.2s;">
                <span class="material-icons-round" style="font-size: 18px;">call</span> ${i18n[currentLang].call}
            </a>
            <button class="action-btn" onclick="copyToClipboard('${getTranslatedStr(teacherNameT, t.name)}\\n${t.phone}', this)" style="flex: 1; background: var(--bg-secondary); border: 2px solid var(--card-border); color: var(--text-primary); border-radius: var(--radius-sm); padding: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                <span class="material-icons-round" style="font-size: 18px;">content_copy</span> ${i18n[currentLang].copy}
            </button>
        </div>
    `;
    modalOverlay.classList.remove('hidden');
}

window.showTeacherModalByCode = function(code) {
    const t = teacherData.find(x => x.code === code);
    if (t) {
        showTeacherModal(t);
    }
};

window.copyToClipboard = function(text, btnElement) {
    navigator.clipboard.writeText(text).then(() => {
        const btn = btnElement || (window.event ? window.event.currentTarget : null);
        if (!btn) return;
        const icon = btn.querySelector('.material-icons-round');
        if (!icon) return;
        const origIcon = icon.textContent;
        icon.textContent = 'check';
        btn.style.borderColor = 'var(--accent)';
        btn.style.color = 'var(--accent)';
        setTimeout(() => {
            icon.textContent = origIcon;
            btn.style.borderColor = '';
            btn.style.color = '';
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
};

function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    langToggle.addEventListener('click', toggleLang);
    
    dayTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            currentDayStr = e.target.dataset.day;
            updateDayTabs();
            
            if (isTableView) {
                isTableView = false;
                tableContainer.classList.add('hidden');
                cardsContainer.classList.remove('hidden');
                viewAllText.textContent = i18n[currentLang].viewAll;
            }
            
            renderCardsView(currentDayStr);
        });
    });
    
    viewAllBtn.addEventListener('click', () => {
        isTableView = !isTableView;
        if (isTableView) {
            cardsContainer.classList.add('hidden');
            tableContainer.classList.remove('hidden');
            viewAllText.textContent = i18n[currentLang].cardView;
            viewAllBtn.querySelector('.material-icons-round').textContent = 'view_agenda';
            selectedDayTitle.textContent = i18n[currentLang].allWeek;
            dayTabs.forEach(tab => tab.classList.remove('active'));
            highlightTodayInTable();
            renderTableView();
        } else {
            tableContainer.classList.add('hidden');
            cardsContainer.classList.remove('hidden');
            viewAllText.textContent = i18n[currentLang].viewAll;
            viewAllBtn.querySelector('.material-icons-round').textContent = 'calendar_view_week';
            updateDayTabs();
            renderCardsView(currentDayStr);
        }
    });
    
    closeModalBtn.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
    });
    
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.add('hidden');
        }
    });
}

// Start app
document.addEventListener('DOMContentLoaded', () => {
    if (typeof appConfig !== 'undefined') {
        const titleEl = document.getElementById('app-title-display');
        const subtitleEl = document.getElementById('semester-subtitle-display');
        if (titleEl && appConfig.title) titleEl.textContent = appConfig.title;
        if (subtitleEl && appConfig.semesterName) subtitleEl.textContent = appConfig.semesterName;
    }
    
    init();
});

// Mouse Interaction Glow
const cursorGlow = document.getElementById('cursor-glow');
let mouseX = 0, mouseY = 0;
let glowX = 0, glowY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    glowX += (mouseX - glowX) * 0.15;
    glowY += (mouseY - glowY) * 0.15;
    if (cursorGlow) {
        cursorGlow.style.transform = `translate(calc(${glowX}px - 50%), calc(${glowY}px - 50%))`;
    }
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Download Functionality
const downloadBtn = document.getElementById('download-btn');
const downloadMenu = document.getElementById('download-menu');
const dlImgBtn = document.getElementById('dl-img');
const dlPdfBtn = document.getElementById('dl-pdf');

downloadBtn.addEventListener('click', () => {
    downloadMenu.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    if (!downloadBtn.contains(e.target) && !downloadMenu.contains(e.target)) {
        downloadMenu.classList.add('hidden');
    }
});

async function captureRoutine() {
    // Force table view to render if not visible
    const wasHidden = tableContainer.classList.contains('hidden');
    if (wasHidden) {
        tableContainer.classList.remove('hidden');
        renderTableView();
    }
    
    // Inject credit header temporarily
    const creditDiv = document.createElement('div');
    creditDiv.innerHTML = `
        <div style="text-align: center; padding-bottom: 20px;">
            <div style="font-size: 2.2rem; font-weight: 900; color: var(--accent); margin-bottom: 5px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">CNPI Routine Pro</div>
            <div style="font-size: 1.2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Electronics Department • Third Semester • Second Shift (ENT-3/2)</div>
            <div style="font-size: 1rem; font-weight: 700; color: var(--text-secondary);">Developed with ❤️ by M. H. Mahim</div>
        </div>
    `;
    tableContainer.insertBefore(creditDiv, tableContainer.firstChild);

    // Make tableContainer gorgeous for the capture
    const originalBg = tableContainer.style.background;
    const originalPadding = tableContainer.style.padding;
    const originalBorder = tableContainer.style.border;
    const originalBorderRadius = tableContainer.style.borderRadius;
    const originalWidth = tableContainer.style.width;
    const originalMaxWidth = tableContainer.style.maxWidth;
    const originalOverflow = tableContainer.style.overflow;
    
    // Hide scrollbars globally during capture
    const hideScrollStyle = document.createElement('style');
    hideScrollStyle.innerHTML = '::-webkit-scrollbar { display: none !important; } * { scrollbar-width: none !important; }';
    document.head.appendChild(hideScrollStyle);

    // Clean up inner glass-panel so the gradient shines through perfectly
    const glassPanel = tableContainer.querySelector('.glass-panel');
    let origGlassBg = '', origGlassBorder = '', origGlassBoxShadow = '';
    if (glassPanel) {
        origGlassBg = glassPanel.style.background;
        origGlassBorder = glassPanel.style.border;
        origGlassBoxShadow = glassPanel.style.boxShadow;
        glassPanel.style.background = 'transparent';
        glassPanel.style.border = 'none';
        glassPanel.style.boxShadow = 'none';
    }

    tableContainer.style.background = document.body.getAttribute('data-theme') === 'dark' 
        ? 'linear-gradient(135deg, #09090b 0%, #1a1a2e 100%)' 
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
    tableContainer.style.padding = '40px';
    tableContainer.style.border = '4px solid var(--accent)';
    tableContainer.style.borderRadius = '24px';
    tableContainer.style.width = 'max-content';
    tableContainer.style.maxWidth = 'none';
    tableContainer.style.overflow = 'visible';
    
    // We might need a small delay for DOM to update
    await new Promise(r => setTimeout(r, 100));
    
    const canvas = await window.html2canvas(tableContainer, {
        scale: 2,
        backgroundColor: null,
        scrollX: 0,
        scrollY: 0,
        windowWidth: tableContainer.scrollWidth + 100
    });
    
    // Restore styles
    tableContainer.style.background = originalBg;
    tableContainer.style.padding = originalPadding;
    tableContainer.style.border = originalBorder;
    tableContainer.style.borderRadius = originalBorderRadius;
    tableContainer.style.width = originalWidth;
    tableContainer.style.maxWidth = originalMaxWidth;
    tableContainer.style.overflow = originalOverflow;
    
    if (glassPanel) {
        glassPanel.style.background = origGlassBg;
        glassPanel.style.border = origGlassBorder;
        glassPanel.style.boxShadow = origGlassBoxShadow;
    }
    hideScrollStyle.remove();
    creditDiv.remove();
    
    if (wasHidden) {
        tableContainer.classList.add('hidden');
    }
    return canvas;
}

dlImgBtn.addEventListener('click', async () => {
    downloadMenu.classList.add('hidden');
    const canvas = await captureRoutine();
    const link = document.createElement('a');
    link.download = `CNPI-Routine-${currentLang}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
});

dlPdfBtn.addEventListener('click', async () => {
    downloadMenu.classList.add('hidden');
    const canvas = await captureRoutine();
    const imgData = canvas.toDataURL('image/png');
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`CNPI-Routine-${currentLang}.pdf`);
});
