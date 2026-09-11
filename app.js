// Busan 5N5D Tour Web Application Script - Continuous Timeline

document.addEventListener('DOMContentLoaded', () => {

  // DOM Elements
  const clockBusan = document.getElementById('clock-busan');
  const clockVn = document.getElementById('clock-vn');
  const clockLocal = document.getElementById('clock-local');
  const liveStatusBadge = document.getElementById('live-status-badge');
  const simDaySelect = document.getElementById('sim-day');
  const simTimeInput = document.getElementById('sim-time');

  const groupBtnAll = document.getElementById('btn-group-all');
  const groupBtnHn = document.getElementById('btn-group-hn');
  const groupBtnSg = document.getElementById('btn-group-sg');

  const summaryHn = document.getElementById('summary-hn');
  const summarySg = document.getElementById('summary-sg');

  const navTabs = document.querySelectorAll('.nav-tab');
  const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');

  // Hero Live Action Elements
  const heroNowTag = document.getElementById('hero-now-tag');
  const heroNowTitle = document.getElementById('hero-now-title');
  const heroNowDesc = document.getElementById('hero-now-desc');
  const heroNowDay = document.getElementById('hero-now-day');
  const heroNextTime = document.getElementById('hero-next-time');
  const heroNextTitle = document.getElementById('hero-next-title');
  const heroNextDesc = document.getElementById('hero-next-desc');
  const mealTodayBf = document.getElementById('meal-today-bf');
  const mealTodayLunch = document.getElementById('meal-today-lunch');
  const mealTodayDinner = document.getElementById('meal-today-dinner');

  // Daily Meal Database from Excel
  const mealsDb = {
    '09-21': { bf: 'Nghỉ đêm máy bay', lunch: 'N/A', dinner: 'Tập trung ra sân bay' },
    '09-22': { bf: 'Canh sườn bò (Gonghanggalbitang)', lunch: 'Cá nướng Dalbityegueungodeu', dinner: 'Nakgopsae Gaemijib' },
    '09-23': { bf: 'Buffet khách sạn', lunch: 'Buffet lẩu Shabu-Shabu', dinner: 'Đại tiệc Hải Sản Nayeonyine (+Soju, Bia)' },
    '09-24': { bf: 'Buffet khách sạn', lunch: 'Gà hầm sâm bào ngư', dinner: 'Buffet Á-Âu Quo Quo' },
    '09-25': { bf: 'Buffet khách sạn', lunch: 'BBQ Myeongryunjinsa Galbi', dinner: 'Tự túc dùng bữa tối (Seomyeon)' },
    '09-26': { bf: 'Breakfast Box (Burger & Juice)', lunch: 'Bay về Việt Nam', dinner: 'Kết thúc chuyến đi' }
  };

  let globalIsPastExpanded = false;

  // --- 1. CLOCK & TIME SYNC ---
  function updateClocks() {
    const now = new Date();

    // Local Time
    const localStr = now.toLocaleTimeString('vi-VN', { hour12: false });
    if (clockLocal) clockLocal.textContent = localStr;

    // Vietnam Time (UTC+7)
    const vnOptions = { timeZone: 'Asia/Ho_Chi_Minh', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const vnStr = new Intl.DateTimeFormat('vi-VN', vnOptions).format(now);
    if (clockVn) clockVn.textContent = vnStr;

    // Busan Korea Time (UTC+9)
    const busanOptions = { timeZone: 'Asia/Seoul', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const busanStr = new Intl.DateTimeFormat('vi-VN', busanOptions).format(now);
    if (clockBusan) clockBusan.textContent = busanStr;

    // Evaluate live trip sync
    evaluateTripSync();
  }

  // --- 2. TRIP SYNC & LIVE HERO DASHBOARD ---
  function evaluateTripSync() {
    let currentSimDate;
    let isSimulated = false;

    if (simDaySelect.value !== 'real') {
      isSimulated = true;
      const [year, month, day] = simDaySelect.value.split('-');
      const [hours, minutes] = simTimeInput.value.split(':');
      currentSimDate = new Date(year, month - 1, day, hours, minutes);
    } else {
      currentSimDate = new Date(); // Actual current time
    }

    const simHours = String(currentSimDate.getHours()).padStart(2, '0');
    const simMins = String(currentSimDate.getMinutes()).padStart(2, '0');
    const currentTimeMinutes = currentSimDate.getHours() * 60 + currentSimDate.getMinutes();

    // Clear active status on all timeline items
    document.querySelectorAll('#continuous-timeline .timeline-item').forEach(el => el.classList.remove('active-live'));

    // Schedule matrix lookup (Month 09, Days 21 to 26)
    const dayMap = {
      '09-21': { name: 'Đêm 01 (21/09/2025)', tabId: 'tab-day-0', dateStr: '2025-09-21' },
      '09-22': { name: 'Ngày 01 (22/09/2025)', tabId: 'tab-day-1', dateStr: '2025-09-22' },
      '09-23': { name: 'Ngày 02 (23/09/2025)', tabId: 'tab-day-2', dateStr: '2025-09-23' },
      '09-24': { name: 'Ngày 03 (24/09/2025)', tabId: 'tab-day-3', dateStr: '2025-09-24' },
      '09-25': { name: 'Ngày 04 (25/09/2025)', tabId: 'tab-day-4', dateStr: '2025-09-25' },
      '09-26': { name: 'Ngày 05 (26/09/2025)', tabId: 'tab-day-5', dateStr: '2025-09-26' }
    };

    const monthDayKey = `${String(currentSimDate.getMonth() + 1).padStart(2, '0')}-${String(currentSimDate.getDate()).padStart(2, '0')}`;

    let currentDayInfo = dayMap[monthDayKey];
    if (!currentDayInfo) {
      currentDayInfo = dayMap['09-22'];
    }

    // Find active & next items in continuous timeline
    const timelineContainer = document.getElementById('continuous-timeline');
    let activeItem = null;
    let nextItem = null;

    if (timelineContainer) {
      const items = Array.from(timelineContainer.querySelectorAll('.timeline-item[data-date="' + currentDayInfo.dateStr + '"]'));
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const start = item.getAttribute('data-time-start');
        const end = item.getAttribute('data-time-end');

        if (start) {
          const [sH, sM] = start.split(':').map(Number);
          const startMins = sH * 60 + sM;
          let endMins = startMins + 120;
          if (end) {
            const [eH, eM] = end.split(':').map(Number);
            endMins = eH * 60 + eM;
          }

          if (currentTimeMinutes >= startMins && currentTimeMinutes < endMins) {
            activeItem = item;
            item.classList.add('active-live');
            if (i + 1 < items.length) {
              nextItem = items[i + 1];
            }
            break;
          } else if (startMins > currentTimeMinutes && !nextItem) {
            nextItem = item;
          }
        }
      }
    }

    // --- UPDATE HERO DASHBOARD ---
    if (heroNowDay) heroNowDay.innerHTML = `<span>🗓️</span> ${currentDayInfo.name}`;

    if (activeItem) {
      const title = activeItem.querySelector('h4')?.textContent || 'Hoạt động tour';
      const desc = activeItem.querySelector('p')?.textContent || '';
      const startT = activeItem.getAttribute('data-time-start') || '';
      const endT = activeItem.getAttribute('data-time-end') || '';

      if (heroNowTitle) heroNowTitle.textContent = title;
      if (heroNowDesc) heroNowDesc.textContent = desc;
      if (heroNowTag) heroNowTag.textContent = endT ? `${startT} - ${endT}` : startT;

      liveStatusBadge.textContent = `📍 [${currentDayInfo.name} - ${startT}] ${title}`;
      liveStatusBadge.className = "px-2.5 py-0.5 rounded text-white font-bold bg-amber-600 animate-pulse text-[10px] sm:text-xs truncate max-w-full";
    } else {
      if (heroNowTitle) heroNowTitle.textContent = `Thời Gian Tự Do / Nghỉ Ngơi (${simHours}:${simMins})`;
      if (heroNowDesc) heroNowDesc.textContent = `Đang trong thời gian nghỉ ngơi giữa các mốc tham quan theo lịch trình.`;
      if (heroNowTag) heroNowTag.textContent = `${simHours}:${simMins}`;

      liveStatusBadge.textContent = `📍 [${currentDayInfo.name}] ${simHours}:${simMins} - Đang nghỉ ngơi / Tự do`;
      liveStatusBadge.className = "px-2 py-0.5 rounded text-white font-bold bg-sky-600 text-[10px] sm:text-xs truncate max-w-full";
    }

    if (nextItem) {
      const nextTitle = nextItem.querySelector('h4')?.textContent || 'Hoạt động tiếp theo';
      const nextDesc = nextItem.querySelector('p')?.textContent || '';
      const nextStart = nextItem.getAttribute('data-time-start') || '';

      if (heroNextTitle) heroNextTitle.textContent = nextTitle;
      if (heroNextDesc) heroNextDesc.textContent = nextDesc;
      if (heroNextTime) heroNextTime.textContent = nextStart;
    } else {
      if (heroNextTitle) heroNextTitle.textContent = `Hết lịch trình ngày hôm nay`;
      if (heroNextDesc) heroNextDesc.textContent = `Đoàn tự do dạo phố, mua sắm đêm và về lại khách sạn nghỉ ngơi.`;
      if (heroNextTime) heroNextTime.textContent = `Tối`;
    }

    // --- UPDATE TODAY MEALS ROW ---
    const activeMeals = mealsDb[monthDayKey] || mealsDb['09-22'];
    if (mealTodayBf) mealTodayBf.textContent = activeMeals.bf;
    if (mealTodayLunch) mealTodayLunch.textContent = activeMeals.lunch;
    if (mealTodayDinner) mealTodayDinner.textContent = activeMeals.dinner;

    // --- CONTINUOUS TIMELINE PAST COLLAPSE ---
    updateContinuousPastCollapse(currentSimDate, isSimulated);
  }

  // --- 3. UNIFIED CONTINUOUS TIMELINE COLLAPSE ---
  function updateContinuousPastCollapse(refDate, isSimulated) {
    const refYear = refDate.getFullYear();
    const refMonth = String(refDate.getMonth() + 1).padStart(2, '0');
    const refDay = String(refDate.getDate()).padStart(2, '0');
    const refDateStr = `${refYear}-${refMonth}-${refDay}`;
    const refMinutes = refDate.getHours() * 60 + refDate.getMinutes();

    let activeRefDateStr = refDateStr;
    let activeRefMinutes = refMinutes;
    if (!isSimulated && (refDateStr < '2025-09-21' || refDateStr > '2025-09-26')) {
      activeRefDateStr = '2025-09-22';
      activeRefMinutes = 16 * 60;
    }

    const timelineContainer = document.getElementById('continuous-timeline');
    if (!timelineContainer) return;

    const allNodes = Array.from(timelineContainer.querySelectorAll('.timeline-item, .timeline-day-node'));
    if (allNodes.length === 0) return;

    let pastNodes = [];
    allNodes.forEach(node => {
      const nodeDate = node.getAttribute('data-date');
      if (!nodeDate) return;

      if (nodeDate < activeRefDateStr) {
        pastNodes.push(node);
      } else if (nodeDate === activeRefDateStr) {
        if (node.classList.contains('timeline-day-node')) {
          pastNodes.push(node);
        } else {
          const start = node.getAttribute('data-time-start');
          const end = node.getAttribute('data-time-end');
          if (start) {
            const [sH, sM] = start.split(':').map(Number);
            const startMins = sH * 60 + sM;
            let endMins = startMins + 120;
            if (end) {
              const [eH, eM] = end.split(':').map(Number);
              endMins = eH * 60 + eM;
            }
            if (endMins <= activeRefMinutes && !node.classList.contains('active-live')) {
              pastNodes.push(node);
            }
          }
        }
      }
    });

    const existingToggle = timelineContainer.querySelector('.past-toggle-bar');
    if (existingToggle) existingToggle.remove();

    allNodes.forEach(node => {
      node.classList.remove('past-item-collapsed', 'past-item-expanded', 'most-recent-past');
      const badge = node.querySelector('.past-recent-tag');
      if (badge) badge.remove();
    });

    const pastItemsOnly = pastNodes.filter(n => n.classList.contains('timeline-item'));

    if (pastItemsOnly.length > 0) {
      const mostRecentPast = pastItemsOnly[pastItemsOnly.length - 1];
      mostRecentPast.classList.add('most-recent-past');

      const badgeSpan = document.createElement('span');
      badgeSpan.className = 'past-recent-tag px-2 py-0.5 text-[10px] bg-slate-200 text-slate-700 font-bold rounded flex items-center gap-1 border border-slate-300';
      badgeSpan.innerHTML = `<span>⏮️ Mốc vừa qua</span>`;
      const header = mostRecentPast.querySelector('.flex.justify-between');
      if (header) header.appendChild(badgeSpan);

      const mostRecentIndex = pastNodes.indexOf(mostRecentPast);
      const olderPastNodes = pastNodes.slice(0, mostRecentIndex);

      if (olderPastNodes.length > 0) {
        olderPastNodes.forEach(n => n.classList.add('past-item-collapsed'));

        const toggleBar = document.createElement('div');
        toggleBar.className = 'past-toggle-bar my-3 p-3 bg-slate-100/90 hover:bg-slate-200/90 border border-slate-300/80 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer transition shadow-sm select-none';
        toggleBar.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="p-1 bg-slate-200 rounded text-slate-600">📁</span>
            <span>Đã thu gọn <strong>${olderPastNodes.length}</strong> mốc & ngày lịch trình quá khứ</span>
          </div>
          <span class="text-sky-700 font-bold flex items-center gap-1 hover:underline shrink-0">
            <span class="toggle-label">${globalIsPastExpanded ? 'Thu gọn' : `Mở ra xem lại (${olderPastNodes.length})`}</span>
            <span class="toggle-icon transition-transform font-bold" style="transform: ${globalIsPastExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}">▼</span>
          </span>
        `;

        if (globalIsPastExpanded) {
          olderPastNodes.forEach(n => {
            n.classList.remove('past-item-collapsed');
            n.classList.add('past-item-expanded');
          });
        }

        toggleBar.addEventListener('click', () => {
          globalIsPastExpanded = !globalIsPastExpanded;
          olderPastNodes.forEach(n => {
            if (globalIsPastExpanded) {
              n.classList.remove('past-item-collapsed');
              n.classList.add('past-item-expanded');
            } else {
              n.classList.add('past-item-collapsed');
              n.classList.remove('past-item-expanded');
            }
          });
          const label = toggleBar.querySelector('.toggle-label');
          const icon = toggleBar.querySelector('.toggle-icon');
          if (label) label.textContent = globalIsPastExpanded ? 'Thu gọn' : `Mở ra xem lại (${olderPastNodes.length})`;
          if (icon) icon.style.transform = globalIsPastExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
        });

        const firstOlder = olderPastNodes[0];
        firstOlder.parentNode.insertBefore(toggleBar, firstOlder);
      }
    }
  }

  // --- 4. NAVIGATION TABS & MOBILE NAV NAVIGATION ---
  function handleTabClick(targetId) {
    if (targetId === 'live-hero') {
      const hero = document.getElementById('live-action-hero');
      if (hero) {
        hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      mobileNavBtns.forEach(btn => {
        if (btn.getAttribute('data-target') === 'live-hero') {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      return;
    }

    // Nav Tab Highlight
    navTabs.forEach(tab => {
      if (tab.getAttribute('data-tab') === targetId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Mobile Bottom Nav Highlight
    mobileNavBtns.forEach(btn => {
      if (btn.getAttribute('data-target') === targetId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const tabPanes = document.querySelectorAll('.tab-pane');

    if (targetId === 'tab-menu') {
      tabPanes.forEach(pane => {
        if (pane.id === 'tab-menu') {
          pane.classList.add('active-pane');
        } else {
          pane.classList.remove('active-pane');
        }
      });
      const menuSection = document.getElementById('tab-menu');
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (targetId === 'tab-info') {
      tabPanes.forEach(pane => {
        if (pane.id === 'tab-info') {
          pane.classList.add('active-pane');
        } else {
          pane.classList.remove('active-pane');
        }
      });
      const infoSection = document.getElementById('tab-info');
      if (infoSection) {
        infoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Timeline tabs (tab-all, tab-day-0 ... tab-day-5)
      tabPanes.forEach(pane => {
        if (pane.id === 'tab-timeline-main') {
          pane.classList.add('active-pane');
        } else {
          pane.classList.remove('active-pane');
        }
      });

      if (targetId === 'tab-all') {
        const contentArea = document.getElementById('tab-content-area');
        if (contentArea) {
          contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        const dayNum = targetId.replace('tab-', '');
        const targetNode = document.querySelector(`.timeline-day-node[data-day="${dayNum}"]`);
        if (targetNode) {
          if (targetNode.classList.contains('past-item-collapsed')) {
            globalIsPastExpanded = true;
            evaluateTripSync();
          }
          setTimeout(() => {
            targetNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    }
  }

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      handleTabClick(tabId);
    });
  });

  mobileNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      handleTabClick(targetId);
    });
  });

  handleTabClick('tab-all');

  // --- 5. GROUP ORIGIN FILTER (HÀ NỘI / SÀI GÒN) ---
  function filterGroup(group) {
    const hnCards = document.querySelectorAll('.group-hn-card');
    const sgCards = document.querySelectorAll('.group-sg-card');

    groupBtnAll.classList.remove('active');
    groupBtnHn.classList.remove('active');
    groupBtnSg.classList.remove('active');

    if (group === 'hn') {
      groupBtnHn.classList.add('active');
      hnCards.forEach(c => { c.classList.add('highlight-group'); c.classList.remove('dim-group'); });
      sgCards.forEach(c => { c.classList.remove('highlight-group'); c.classList.add('dim-group'); });
      if (summaryHn) summaryHn.classList.remove('hidden');
      if (summarySg) summarySg.classList.add('hidden');
    } else if (group === 'sg') {
      groupBtnSg.classList.add('active');
      sgCards.forEach(c => { c.classList.add('highlight-group'); c.classList.remove('dim-group'); });
      hnCards.forEach(c => { c.classList.remove('highlight-group'); c.classList.add('dim-group'); });
      if (summarySg) summarySg.classList.remove('hidden');
      if (summaryHn) summaryHn.classList.add('hidden');
    } else {
      groupBtnAll.classList.add('active');
      hnCards.forEach(c => { c.classList.remove('highlight-group', 'dim-group'); });
      sgCards.forEach(c => { c.classList.remove('highlight-group', 'dim-group'); });
      if (summaryHn) summaryHn.classList.remove('hidden');
      if (summarySg) summarySg.classList.remove('hidden');
    }
  }

  groupBtnAll.addEventListener('click', () => filterGroup('all'));
  groupBtnHn.addEventListener('click', () => filterGroup('hn'));
  groupBtnSg.addEventListener('click', () => filterGroup('sg'));

  // SIMULATOR CHANGE LISTENERS
  simDaySelect.addEventListener('change', evaluateTripSync);
  simTimeInput.addEventListener('input', evaluateTripSync);

  // START CLOCK TICKER
  updateClocks();
  setInterval(updateClocks, 1000);

});
