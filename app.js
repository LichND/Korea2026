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

  // Countdown Elements
  const preTripCountdown = document.getElementById('pre-trip-countdown');
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins = document.getElementById('cd-mins');
  const cdSecs = document.getElementById('cd-secs');

  // Meal Quick Jump Elements
  const btnMealBf = document.getElementById('btn-hero-meal-bf');
  const btnMealLunch = document.getElementById('btn-hero-meal-lunch');
  const btnMealDinner = document.getElementById('btn-hero-meal-dinner');
  let currentActiveMealDay = '09-22';

  // Daily Meal Database from Excel
  const mealsDb = {
    '09-21': { bf: 'Nghỉ đêm máy bay', lunch: 'N/A', dinner: 'Tập trung ra sân bay' },
    '09-22': { bf: 'Canh sườn bò (Gonghanggalbitang)', lunch: 'Cá nướng Dalbityegueungodeu', dinner: 'Đại tiệc Hải Sản Nayeonyine (+Soju, Bia)' },
    '09-23': { bf: 'Buffet khách sạn', lunch: 'Buffet lẩu Shabu-Shabu', dinner: 'Buffet Đặc Biệt Grand Apple (Tiệc Sinh Nhật ZPS)' },
    '09-24': { bf: 'Buffet khách sạn', lunch: 'Gà hầm sâm bào ngư', dinner: 'Lẩu Nakgopsae Gaemijib' },
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
      const [year, month, day] = simDaySelect.value.split('-').map(Number);
      const [hours, minutes] = simTimeInput.value.split(':').map(Number);
      currentSimDate = new Date(year, month - 1, day, hours, minutes, 0);
    } else {
      currentSimDate = new Date(); // Actual current browser time (includes live seconds!)
    }

    const currentTs = currentSimDate.getTime();
    const refYear = currentSimDate.getFullYear();

    // Key Tour Milestones in Timestamps (21/09 21:00 to 26/09 23:59:59)
    const departureTs = new Date(refYear, 8, 21, 21, 0, 0).getTime();
    const tourEndTs = new Date(refYear, 8, 26, 23, 59, 59).getTime();

    const simMonth = String(currentSimDate.getMonth() + 1).padStart(2, '0');
    const simDay = String(currentSimDate.getDate()).padStart(2, '0');
    const monthDayKey = `${simMonth}-${simDay}`;
    const simHours = String(currentSimDate.getHours()).padStart(2, '0');
    const simMins = String(currentSimDate.getMinutes()).padStart(2, '0');
    const currentTimeMinutes = currentSimDate.getHours() * 60 + currentSimDate.getMinutes();

    // Clear active status on all timeline items
    document.querySelectorAll('#continuous-timeline .timeline-item').forEach(el => el.classList.remove('active-live'));

    // CASE A: BEFORE TRIP (currentTs < departureTs)
    if (currentTs < departureTs) {
      if (preTripCountdown) preTripCountdown.classList.remove('hidden');

      // Live countdown calculation in milliseconds
      const diffMs = departureTs - currentTs;

      if (diffMs > 0) {
        const cdD = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const cdH = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
        const cdM = Math.floor((diffMs / (1000 * 60)) % 60);
        const cdS = Math.floor((diffMs / 1000) % 60);

        if (cdDays) cdDays.textContent = String(cdD).padStart(2, '0');
        if (cdHours) cdHours.textContent = String(cdH).padStart(2, '0');
        if (cdMins) cdMins.textContent = String(cdM).padStart(2, '0');
        if (cdSecs) cdSecs.textContent = String(cdS).padStart(2, '0');
      } else {
        if (cdDays) cdDays.textContent = '00';
        if (cdHours) cdHours.textContent = '00';
        if (cdMins) cdMins.textContent = '00';
        if (cdSecs) cdSecs.textContent = '00';
      }

      if (heroNowDay) heroNowDay.innerHTML = `<span>✈️</span> Chuyến đi sắp khởi hành (21/09 - 26/09)`;
      if (heroNowTitle) heroNowTitle.textContent = `Chương Trình Tham Quan Busan 5N5Đ`;
      if (heroNowDesc) heroNowDesc.textContent = `Chuyến đi chuẩn bị diễn ra. Bạn đang ở chế độ xem Full Lịch Trình 5N5Đ. Chọn một ngày trong bộ "Giả lập" ở góc trên để trải nghiệm thời gian thực!`;
      if (heroNowTag) heroNowTag.textContent = `Sắp diễn ra`;

      if (heroNextTitle) heroNextTitle.textContent = `Đêm 1 (21/09) • Khởi hành đi Busan`;
      if (heroNextDesc) heroNextDesc.textContent = `21:00 HN đón tại ROX 54A Nguyễn Chí Thanh / 22:00 SG đón tại Cột 10 Tân Sơn Nhất.`;
      if (heroNextTime) heroNextTime.textContent = `21/09`;

      liveStatusBadge.textContent = `✈️ Sắp khởi hành: Chuyến đi Busan diễn ra từ 21/09 đến 26/09`;
      liveStatusBadge.className = "px-2 py-0.5 rounded text-white font-bold bg-sky-600 text-[10px] sm:text-xs truncate max-w-full";

      const activeMeals = mealsDb['09-22'];
      currentActiveMealDay = '09-22';
      if (mealTodayBf) mealTodayBf.textContent = activeMeals.bf;
      if (mealTodayLunch) mealTodayLunch.textContent = activeMeals.lunch;
      if (mealTodayDinner) mealTodayDinner.textContent = activeMeals.dinner;

      updateContinuousPastCollapse('BEFORE_TRIP');
      updateMealPastCollapse('BEFORE_TRIP');
      return;
    }

    // Hide pre-trip countdown when trip is ongoing or completed
    if (preTripCountdown) preTripCountdown.classList.add('hidden');

    // CASE B: AFTER TRIP (currentTs > tourEndTs)
    if (currentTs > tourEndTs) {
      if (heroNowDay) heroNowDay.innerHTML = `<span>🏁</span> Chuyến đi đã hoàn thành (26/09)`;
      if (heroNowTitle) heroNowTitle.textContent = `Chuyến Đi Busan 5N5Đ Đã Kết Thúc Tốt Đẹp`;
      if (heroNowDesc) heroNowDesc.textContent = `Đoàn đã đáp chuyến bay về đến Việt Nam an toàn. Cảm ơn quý khách đã đồng hành cùng Sắc Việt Travel!`;
      if (heroNowTag) heroNowTag.textContent = `Đã hoàn thành`;

      if (heroNextTitle) heroNextTitle.textContent = `Xem lại kỷ niệm & thực đơn 5 ngày`;
      if (heroNextDesc) heroNextDesc.textContent = `Bấm nút bên dưới để mở lại toàn bộ lịch trình quá khứ hoặc xem bảng thực đơn.`;
      if (heroNextTime) heroNextTime.textContent = `Hoàn thành`;

      liveStatusBadge.textContent = `🏁 Chuyến đi Busan 5N5Đ đã hoàn thành thành công tốt đẹp!`;
      liveStatusBadge.className = "px-2 py-0.5 rounded text-white font-bold bg-emerald-600 text-[10px] sm:text-xs truncate max-w-full";

      const activeMeals = mealsDb['09-26'];
      currentActiveMealDay = '09-26';
      if (mealTodayBf) mealTodayBf.textContent = activeMeals.bf;
      if (mealTodayLunch) mealTodayLunch.textContent = activeMeals.lunch;
      if (mealTodayDinner) mealTodayDinner.textContent = activeMeals.dinner;

      updateContinuousPastCollapse('AFTER_TRIP', currentTs, refYear);
      updateMealPastCollapse('AFTER_TRIP', currentTs, refYear);
      return;
    }

    // CASE C: DURING TRIP (departureTs <= currentTs && currentTs <= tourEndTs)
    const dayMap = {
      '09-21': { name: 'Đêm 01 (21/09/2025)', dateStr: `${refYear}-09-21` },
      '09-22': { name: 'Ngày 01 (22/09/2025)', dateStr: `${refYear}-09-22` },
      '09-23': { name: 'Ngày 02 (23/09/2025)', dateStr: `${refYear}-09-23` },
      '09-24': { name: 'Ngày 03 (24/09/2025)', dateStr: `${refYear}-09-24` },
      '09-25': { name: 'Ngày 04 (25/09/2025)', dateStr: `${refYear}-09-25` },
      '09-26': { name: 'Ngày 05 (26/09/2025)', dateStr: `${refYear}-09-26` }
    };
    let currentDayInfo = dayMap[monthDayKey] || dayMap['09-22'];

    const timelineContainer = document.getElementById('continuous-timeline');
    let activeItem = null;
    let nextItem = null;

    if (timelineContainer) {
      const items = Array.from(timelineContainer.querySelectorAll('.timeline-item'));
      const dayItems = items.filter(item => {
        const itemDate = item.getAttribute('data-date');
        return itemDate && itemDate.endsWith(monthDayKey);
      });

      for (let i = 0; i < dayItems.length; i++) {
        const item = dayItems[i];
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
            if (i + 1 < dayItems.length) {
              nextItem = dayItems[i + 1];
            }
            break;
          } else if (startMins > currentTimeMinutes && !nextItem) {
            nextItem = item;
          }
        }
      }
    }

    // --- UPDATE HERO DASHBOARD FOR DURING TRIP ---
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

    const activeMeals = mealsDb[monthDayKey] || mealsDb['09-22'];
    currentActiveMealDay = mealsDb[monthDayKey] ? monthDayKey : '09-22';
    if (mealTodayBf) mealTodayBf.textContent = activeMeals.bf;
    if (mealTodayLunch) mealTodayLunch.textContent = activeMeals.lunch;
    if (mealTodayDinner) mealTodayDinner.textContent = activeMeals.dinner;

    updateContinuousPastCollapse('DURING_TRIP', currentTs, refYear);
    updateMealPastCollapse('DURING_TRIP', currentTs, refYear);
  }

  // --- 3. UNIFIED CONTINUOUS TIMELINE COLLAPSE LOGIC ---
  function updateContinuousPastCollapse(mode, currentTs, refYear) {
    const timelineContainer = document.getElementById('continuous-timeline');
    if (!timelineContainer) return;

    const allNodes = Array.from(timelineContainer.querySelectorAll('.timeline-item, .timeline-day-node'));
    if (allNodes.length === 0) return;

    // Reset visibility of all nodes & cleanup
    const existingToggle = timelineContainer.querySelector('.past-toggle-bar');
    if (existingToggle) existingToggle.remove();

    allNodes.forEach(node => {
      node.classList.remove('past-item-collapsed', 'past-item-expanded', 'most-recent-past');
      const badge = node.querySelector('.past-recent-tag');
      if (badge) badge.remove();
    });

    if (mode === 'BEFORE_TRIP') {
      return;
    }

    let pastNodes = [];
    if (mode === 'AFTER_TRIP') {
      pastNodes = allNodes;
    } else if (mode === 'DURING_TRIP') {
      allNodes.forEach(node => {
        const nodeDateStr = node.getAttribute('data-date');
        if (!nodeDateStr) return;

        const [, m, d] = nodeDateStr.split('-').map(Number);
        if (node.classList.contains('timeline-day-node')) {
          const nodeEndTs = new Date(refYear, m - 1, d, 23, 59, 59).getTime();
          if (nodeEndTs < currentTs) {
            pastNodes.push(node);
          }
        } else {
          const start = node.getAttribute('data-time-start');
          const end = node.getAttribute('data-time-end');
          if (start) {
            const [sH, sM] = start.split(':').map(Number);
            let eH = sH + 2, eM = sM;
            if (end) {
              [eH, eM] = end.split(':').map(Number);
            }
            const itemEndTs = new Date(refYear, m - 1, d, eH, eM, 0).getTime();
            if (itemEndTs <= currentTs && !node.classList.contains('active-live')) {
              pastNodes.push(node);
            }
          }
        }
      });
    }

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

  // --- 3.5 UNIFIED MEAL PAST COLLAPSE LOGIC ---
  let globalIsMealPastExpanded = false;

  function updateMealPastCollapse(mode, currentTs, refYear) {
    const menuSection = document.getElementById('tab-menu');
    if (!menuSection) return;

    const existingToggle = menuSection.querySelector('.meal-past-toggle-bar');
    if (existingToggle) existingToggle.remove();

    const allDayContainers = Array.from(menuSection.querySelectorAll('[data-meal-day]'));
    const allMealCards = Array.from(menuSection.querySelectorAll('[data-meal-type]'));

    // Reset styles and badges
    allMealCards.forEach(card => {
      card.classList.remove('past-item-collapsed', 'past-item-expanded', 'most-recent-past');
      const badge = card.querySelector('.past-recent-tag');
      if (badge) badge.remove();
    });

    allDayContainers.forEach(container => {
      container.classList.remove('past-item-collapsed', 'past-item-expanded');
    });

    if (mode === 'BEFORE_TRIP') {
      return;
    }

    let pastMealCards = [];
    let fullyPastDayContainers = [];

    allDayContainers.forEach(container => {
      const dayStr = container.getAttribute('data-meal-day');
      const parts = dayStr.split('-').map(Number);
      const m = parts.length === 3 ? parts[1] : parts[0];
      const d = parts.length === 3 ? parts[2] : parts[1];
      const cardsInDay = Array.from(container.querySelectorAll('[data-meal-type]'));
      let pastCardsCount = 0;

      cardsInDay.forEach(card => {
        const mealType = card.getAttribute('data-meal-type');
        let eH = 23, eM = 59, eS = 59;
        // User time windows: Breakfast (00:00-10:00), Lunch (10:00-15:00), Dinner (15:00-23:59:59)
        if (mealType === 'bf') { eH = 10; eM = 0; eS = 0; }
        else if (mealType === 'lunch') { eH = 15; eM = 0; eS = 0; }
        else if (mealType === 'dinner') { eH = 23; eM = 59; eS = 59; }

        const mealEndTs = new Date(refYear, m - 1, d, eH, eM, eS).getTime();
        if (mode === 'AFTER_TRIP' || mealEndTs <= currentTs) {
          pastMealCards.push(card);
          pastCardsCount++;
        }
      });

      const dayEndTs = new Date(refYear, m - 1, d, 23, 59, 59).getTime();
      if (mode === 'AFTER_TRIP' || (dayEndTs <= currentTs && pastCardsCount === cardsInDay.length)) {
        fullyPastDayContainers.push(container);
      }
    });

    if (pastMealCards.length > 0) {
      const mostRecentPast = pastMealCards[pastMealCards.length - 1];
      mostRecentPast.classList.add('most-recent-past');

      const badgeSpan = document.createElement('span');
      badgeSpan.className = 'past-recent-tag px-1.5 py-0.5 text-[9px] bg-slate-200 text-slate-700 font-bold rounded flex items-center gap-1 border border-slate-300 ml-auto shrink-0';
      badgeSpan.innerHTML = `<span>⏮️ Bữa vừa qua</span>`;
      const header = mostRecentPast.querySelector('.flex.items-center.justify-between') || mostRecentPast;
      header.appendChild(badgeSpan);

      const mostRecentIndex = pastMealCards.indexOf(mostRecentPast);
      const olderPastCards = pastMealCards.slice(0, mostRecentIndex);
      const olderDayContainers = fullyPastDayContainers.filter(container => !container.contains(mostRecentPast));

      if (olderPastCards.length > 0) {
        olderPastCards.forEach(c => c.classList.add('past-item-collapsed'));
        olderDayContainers.forEach(dc => dc.classList.add('past-item-collapsed'));

        const toggleBar = document.createElement('div');
        toggleBar.className = 'meal-past-toggle-bar my-3 p-3 bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200/80 rounded-xl text-xs font-semibold text-amber-900 flex items-center justify-between cursor-pointer transition shadow-sm select-none';
        toggleBar.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="p-1 bg-amber-200/80 rounded text-amber-900">📁</span>
            <span>Đã thu gọn <strong>${olderPastCards.length}</strong> bữa ăn & ngày thực đơn quá khứ</span>
          </div>
          <span class="text-amber-800 font-bold flex items-center gap-1 hover:underline shrink-0">
            <span class="toggle-label">${globalIsMealPastExpanded ? 'Thu gọn' : `Mở ra xem lại (${olderPastCards.length})`}</span>
            <span class="toggle-icon transition-transform font-bold" style="transform: ${globalIsMealPastExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}">▼</span>
          </span>
        `;

        if (globalIsMealPastExpanded) {
          olderPastCards.forEach(c => {
            c.classList.remove('past-item-collapsed');
            c.classList.add('past-item-expanded');
          });
          olderDayContainers.forEach(dc => {
            dc.classList.remove('past-item-collapsed');
            dc.classList.add('past-item-expanded');
          });
        }

        toggleBar.addEventListener('click', () => {
          globalIsMealPastExpanded = !globalIsMealPastExpanded;
          olderPastCards.forEach(c => {
            if (globalIsMealPastExpanded) {
              c.classList.remove('past-item-collapsed');
              c.classList.add('past-item-expanded');
            } else {
              c.classList.add('past-item-collapsed');
              c.classList.remove('past-item-expanded');
            }
          });
          olderDayContainers.forEach(dc => {
            if (globalIsMealPastExpanded) {
              dc.classList.remove('past-item-collapsed');
              dc.classList.add('past-item-expanded');
            } else {
              dc.classList.add('past-item-collapsed');
              dc.classList.remove('past-item-expanded');
            }
          });

          const label = toggleBar.querySelector('.toggle-label');
          const icon = toggleBar.querySelector('.toggle-icon');
          if (label) label.textContent = globalIsMealPastExpanded ? 'Thu gọn' : `Mở ra xem lại (${olderPastCards.length})`;
          if (icon) icon.style.transform = globalIsMealPastExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
        });

        const firstTarget = olderDayContainers.length > 0 ? olderDayContainers[0] : olderPastCards[0];
        if (firstTarget && firstTarget.parentNode) {
          firstTarget.parentNode.insertBefore(toggleBar, firstTarget);
        }
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
      // Timeline tabs
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

  // --- 6. MEAL QUICK JUMP TO TIMELINE CARD ---
  function jumpToMeal(mealType) {
    handleTabClick('tab-menu');

    setTimeout(() => {
      let targetCard = document.querySelector(`[data-meal-day="${currentActiveMealDay}"] [data-meal-type="${mealType}"]`);

      if (targetCard && (targetCard.classList.contains('past-item-collapsed') || targetCard.closest('.past-item-collapsed'))) {
        globalIsMealPastExpanded = true;
        evaluateTripSync();
      }

      setTimeout(() => {
        if (!targetCard) {
          targetCard = document.querySelector(`[data-meal-day="${currentActiveMealDay}"]`);
        }
        if (!targetCard) {
          targetCard = document.querySelector('[data-meal-day="09-22"]');
        }

        if (targetCard) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetCard.classList.add('ring-4', 'ring-amber-400', 'transition-all', 'duration-300');
          setTimeout(() => {
            targetCard.classList.remove('ring-4', 'ring-amber-400');
          }, 1800);
        }
      }, 100);
    }, 150);
  }

  if (btnMealBf) btnMealBf.addEventListener('click', (e) => { e.stopPropagation(); jumpToMeal('bf'); });
  if (btnMealLunch) btnMealLunch.addEventListener('click', (e) => { e.stopPropagation(); jumpToMeal('lunch'); });
  if (btnMealDinner) btnMealDinner.addEventListener('click', (e) => { e.stopPropagation(); jumpToMeal('dinner'); });

  window.jumpToMeal = jumpToMeal;

  // SIMULATOR CHANGE LISTENERS
  if (simDaySelect) simDaySelect.addEventListener('change', evaluateTripSync);
  if (simTimeInput) simTimeInput.addEventListener('input', evaluateTripSync);

  // --- 7. CHEAT CODE: CLICK LOCAL CLOCK 5 TIMES TO TOGGLE TIME SIMULATOR ---
  const clockLocalWrapper = document.getElementById('clock-local-wrapper') || clockLocal;
  const simControlContainer = document.getElementById('sim-control-container');
  let clickCount = 0;
  let clickResetTimer = null;

  function showToast(message) {
    let toast = document.getElementById('cheat-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cheat-toast';
      toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900/95 text-amber-300 border border-amber-500/40 text-xs font-semibold px-4 py-2 rounded-full shadow-2xl z-50 transition-all duration-300 transform scale-95 opacity-0 pointer-events-none flex items-center gap-2';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove('scale-95', 'opacity-0');
    toast.classList.add('scale-100', 'opacity-100');

    setTimeout(() => {
      toast.classList.remove('scale-100', 'opacity-100');
      toast.classList.add('scale-95', 'opacity-0');
    }, 2200);
  }

  if (clockLocalWrapper) {
    clockLocalWrapper.addEventListener('click', () => {
      clickCount++;
      if (clickResetTimer) clearTimeout(clickResetTimer);

      if (clickCount >= 5) {
        clickCount = 0;
        if (simControlContainer) {
          const isHidden = simControlContainer.classList.toggle('hidden');
          showToast(isHidden ? '🔒 Đã ẩn bộ giả lập thời gian' : '🔓 Đã kích hoạt bộ giả lập thời gian!');
        }
      } else {
        clickResetTimer = setTimeout(() => {
          clickCount = 0;
        }, 1200);
      }
    });
  }

  // START CLOCK TICKER
  updateClocks();
  setInterval(updateClocks, 1000);

});
