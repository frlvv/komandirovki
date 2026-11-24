    (function () {
      'use strict';

      const icon = (name, size = 16) =>
        `<img class="ui-icon" src="./assets/${name}.svg" width="${size}" height="${size}" alt="" aria-hidden="true">`;
      const ICON = {
        plane: icon('flight',24), airborne: icon('airborne'), chevron: icon('chevron'),
        check: icon('tick'), lock: icon('lock',18), dot: icon('notice',18)
      };

      const ORIGIN_CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург'];

      const OFFICE_CITIES = [
        { name: 'Казань', locative: 'Казани', genitive: 'Казани', office: true },
        { name: 'Санкт-Петербург', locative: 'Санкт-Петербурге', genitive: 'Санкт-Петербурга', office: true },
        { name: 'Екатеринбург', locative: 'Екатеринбурге', genitive: 'Екатеринбурга', office: true },
        { name: 'Новосибирск', locative: 'Новосибирске', genitive: 'Новосибирска', office: true }
      ];

      const OTHER_CITIES = [
        { name: 'Сочи', locative: 'Сочи', genitive: 'Сочи', office: false },
        { name: 'Нижний Новгород', locative: 'Нижнем Новгороде', genitive: 'Нижнего Новгорода', office: false },
        { name: 'Самара', locative: 'Самаре', genitive: 'Самары', office: false }
      ];

      const ALL_DEST_CITIES = [...OFFICE_CITIES, ...OTHER_CITIES];

      const PROJECTS = [
        { name: 'Мобильный банк', manager: 'Антон С.', initials: 'АС' },
        { name: 'Дизайн-система', manager: 'Анна Соколова', initials: 'АС' },
        { name: 'Инфраструктура', manager: 'Дмитрий Волков', initials: 'ДВ' },
        { name: 'Бизнес-кабинет', manager: 'Елена Морозова', initials: 'ЕМ' }
      ];

      const GOAL_CHIPS = [
        'Встреча с командой',
        'Конференция',
        'Работа в офисе',
        'Партнёры', 'Обучение'
      ];

      const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
      const HERO_PHRASES = ['в командировку', 'на встречу', 'на конференцию', 'на обучение'];
      const heroStart = performance.now();
      let stopHero = () => {};
      const morphLibrary = import('./assets/vendor/torph.mjs').catch(() => null);

      const MEETING_OPTIONS = [
        { id: 'any', label: 'Не важно', short: 'Не важно', minutes: null },
        { id: '10:00', label: 'К 10:00', short: '10:00', minutes: 10 * 60 },
        { id: '11:00', label: 'К 11:00', short: '11:00', minutes: 11 * 60 },
        { id: '14:00', label: 'К 14:00', short: '14:00', minutes: 14 * 60 }
      ];

      const TAXI_MINUTES = 40;
      const AIRPORT_MINUTES = 85;
      const WORK_START = 9 * 60;
      const WORK_END = 18 * 60;
      const FLIGHT_LIMIT = 22000;
      const HOTEL_NIGHT_LIMIT = 5000;

      const minutes = value => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
      function flights(direction, source) {
        return source.map(([depart, arrive, airline, price], index) => {
          const depMin = minutes(depart);
          const arrMin = minutes(arrive);
          const duration = arrMin - depMin;
          return { id: direction + '-' + (index + 1), depart, arrive, depMin, arrMin, airline, price,
            duration: `${Math.floor(duration / 60)} ч ${duration % 60} мин`, bag: 'Без багажа' };
        });
      }
      const OUTBOUND_FLIGHTS = flights('out', [
        ['07:05', '08:45', 'Победа', 5890], ['07:30', '09:10', 'Победа', 5961],
        ['08:50', '10:30', 'Аэрофлот', 9483], ['10:40', '12:20', 'Аэрофлот', 9483],
        ['13:10', '14:45', 'Аэрофлот', 9483], ['17:20', '19:00', 'Аэрофлот', 15360]
      ]);
      const RETURN_FLIGHTS = flights('ret', [
        ['16:10', '17:45', 'Победа', 6240], ['18:50', '20:25', 'Аэрофлот', 9080],
        ['19:40', '21:15', 'Аэрофлот', 9200], ['21:10', '22:45', 'ЮТэйр', 8400]
      ]);
      const KAZAN_OFFICE = { coordinates: [55.778872, 49.129573], address: 'Спартаковская ул., 6, этаж 6' };
      const KAZAN_HOTELS = [
        { id: 'office', name: 'Отель IT-hotel ГАУ ИТ-парк', night: 3562.5, rating: '8,2',
          commuteShort: '≈5 мин пешком', commuteFull: '≈5 мин до офиса', leaveOffset: 10,
          breakfast: true, freeCancel: true, photo: 'hotel-it-park.webp',
          address: 'Петербургская ул., 52', coordinates: [55.780214, 49.133444], checkIn: '15:00', checkOut: '12:00', luggage: true },
        { id: 'alt', name: 'Студия 3 Тат Хаус', night: 1473.5, rating: '7,9',
          commuteShort: '≈3 мин пешком', commuteFull: '≈3 мин до офиса', leaveOffset: 8,
          breakfast: false, freeCancel: true, photo: 'hotel-tat-house.webp',
          address: 'Спартаковская ул., 35', coordinates: [55.779752, 49.130740], checkIn: '14:00', checkOut: '12:00' },
        { id: 'bilyar', name: 'Биляр Палас', night: 5840, rating: '8,7',
          commuteShort: '≈11 мин пешком', commuteFull: '≈11 мин до офиса', leaveOffset: 16,
          breakfast: true, photo: 'hotel-bilyar.webp', address: 'Ул. Островского, 61',
          coordinates: [55.784083, 49.124886], checkIn: '15:00', checkOut: '12:00', luggage: true },
        { id: 'grand-kazan', name: 'Grand Hotel Kazan', night: 6900,
          commuteShort: '≈14 мин пешком', commuteFull: '≈14 мин до офиса', leaveOffset: 19,
          photo: 'hotel-grand-kazan.webp', address: 'Петербургская ул., 1',
          coordinates: [55.785962, 49.125194], checkIn: '14:00', checkOut: '12:00', luggage: true },
        { id: 'davydov', name: 'Давыдов', night: 4380,
          commuteShort: '≈15 мин пешком', commuteFull: '≈15 мин до офиса', leaveOffset: 20,
          breakfast: true, photo: 'hotel-davydov.webp', address: 'Ул. Нурсултана Назарбаева, 35а',
          coordinates: [55.772815, 49.139025], checkIn: '14:00', checkOut: '12:00' },
        { id: 'suleiman', name: 'Сулейман Палас', night: 4990,
          commuteShort: '≈10 мин пешком', commuteFull: '≈10 мин до офиса', leaveOffset: 15,
          photo: 'hotel-suleiman.webp', address: 'Петербургская ул., 55',
          coordinates: [55.781276, 49.134190], checkIn: '14:00', checkOut: '12:00' },
        { id: 'usadba', name: 'Татарская усадьба', night: 4390,
          commuteMode: 'transport', commuteShort: '≈20 мин на транспорте', commuteFull: '≈20 мин до офиса', leaveOffset: 25,
          photo: 'hotel-usadba.webp', address: 'Ул. Шигабутдина Марджани, 8',
          coordinates: [55.780932, 49.116682], checkIn: '14:00', checkOut: '12:00' },
        { id: 'cosmos', name: 'Cosmos Казань', night: 6150,
          commuteMode: 'transport', commuteShort: '≈25 мин на транспорте', commuteFull: '≈25 мин до офиса', leaveOffset: 30,
          photo: 'hotel-cosmos.webp', address: 'Ул. Лесгафта, 7',
          coordinates: [55.78696, 49.14410], checkIn: '14:00', checkOut: '12:00' },
        { id: 'nogai', name: 'Ногай', night: 5650,
          commuteMode: 'transport', commuteShort: '≈25 мин на транспорте', commuteFull: '≈25 мин до офиса', leaveOffset: 30,
          photo: 'hotel-nogai.webp', address: 'Профсоюзная ул., 16Б',
          coordinates: [55.791623, 49.115219], checkIn: '15:00', checkOut: '12:00' },
        { id: 'tasigo', name: 'Kazan Palace by TASIGO', night: 8190,
          commuteShort: '≈13 мин пешком', commuteFull: '≈13 мин до офиса', leaveOffset: 18,
          photo: 'hotel-tasigo.webp', address: 'Ул. Калинина, 3Б',
          coordinates: [55.782739, 49.137720], checkIn: '15:00', checkOut: '12:00' }
      ];

      const HOTELS = [
        { id: 'office', name: 'Отель у офиса', photo: 'hotel-office.webp', night: 6000, commuteShort: '5 мин пешком', commuteFull: '5 мин пешком до офиса', leaveOffset: 10, breakfast: true, x: 58, y: 29 },
        { id: 'alt', name: 'Отель Альтернатива', photo: 'hotel-alt.webp', night: 4800, commuteShort: '25 мин на транспорте', commuteFull: '25 мин на транспорте до офиса', leaveOffset: 35, breakfast: true, x: 24, y: 66 },
        { id: 'plaza', name: 'Центр Плаза', photo: 'hotel-plaza.webp', night: 4500, commuteShort: '18 мин на транспорте', commuteFull: '18 мин на транспорте до офиса', leaveOffset: 28, breakfast: false, x: 78, y: 63 },
        { id: 'grand', name: 'Гранд Отель', photo: 'hotel-grand.webp', night: 7500, commuteShort: '10 мин пешком', commuteFull: '10 мин пешком до офиса', leaveOffset: 15, breakfast: true, x: 37, y: 25 }
      ];

      const REASON_CHIPS = [
        '5 мин пешком до офиса',
        'Успею на утренний созвон',
        'Нет свободных номеров в лимите'
      ];

      function createInitialState() {
        return {
          step: 1, // 1: Новая командировка, 2: Билеты, 3: Гостиница, 4: Статус
          origin: 'Москва',
          dest: '',
          destSearch: '',
          startDay: null,
          endDay: null,
          meetingId: 'any',
          project: 'Мобильный банк',
          goal: '',

          openPopover: null, // 'origin' | 'dest' | 'dates' | 'project' | null
          searchError: { dest: false, dates: false },

          flightTab: 'out', // 'out' | 'ret'
          outFlightId: null,
          retFlightId: null,
          hoverFlightId: null,
          timelineCollapsed: true,
          hotelStop: false,
          hotelFilter: 'all',
          hotelInspectId: null,

          hotelId: null, // auto-selected to 'office' on first open of Step 3

          infoTip: null, // 'flight' | 'hotel' | null
          reason: '',
          reasonError: false,
          autoBuy: true,
          submittedTime: ''
        };
      }

      let state = createInitialState();

      const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n) + '\u00a0₽';
      const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const toTime = (m) => String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');

      function pluralNights(n) {
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod10 === 1 && mod100 !== 11) return `${n} ночь`;
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} ночи`;
        return `${n} ночей`;
      }

      function getNights() {
        if (state.startDay && state.endDay && state.endDay > state.startDay) {
          return state.endDay - state.startDay;
        }
        return 2;
      }

      function getDatesLabel() {
        if (!state.startDay) return '';
        if (!state.endDay) return `${state.startDay} декабря — обратно`;
        return `${state.startDay}–${state.endDay} декабря · ${pluralNights(getNights())}`;
      }

      function getShortDates() {
        if (!state.startDay || !state.endDay) return '';
        return `${state.startDay}–${state.endDay} декабря`;
      }

      function getDestObj() {
        return ALL_DEST_CITIES.find(c => c.name === state.dest) || { name: state.dest || 'Казань', locative: state.dest || 'Казани', genitive: state.dest || 'Казани', office: true };
      }

      function getProjectObj() {
        return PROJECTS.find(p => p.name === state.project) || PROJECTS[0];
      }

      function getMeeting() {
        return MEETING_OPTIONS.find(m => m.id === state.meetingId) ||
          (/^\d\d:\d\d$/.test(state.meetingId) ? {id:state.meetingId,label:'К ' + state.meetingId,short:state.meetingId,minutes:minutes(state.meetingId)} : MEETING_OPTIONS[0]);
      }

      function getOutFlight() {
        return OUTBOUND_FLIGHTS.find(f => f.id === state.outFlightId) || null;
      }

      function getRetFlight() {
        return RETURN_FLIGHTS.find(f => f.id === state.retFlightId) || null;
      }

      function hotelName(hotel) {
        if (hotel.id === 'office' && !getDestObj().office) return 'Отель в центре';
        if (hotel.id === 'plaza' && state.dest !== 'Казань') return 'Сити Плаза';
        return hotel.name;
      }

      function getAvailableHotels() {
        return state.dest === 'Казань' ? KAZAN_HOTELS : HOTELS;
      }

      function getHotel() {
        return getAvailableHotels().find(h => h.id === state.hotelId) || null;
      }

      function getFlightsTotal() {
        const o = getOutFlight();
        const r = getRetFlight();
        return (o ? o.price : 0) + (r ? r.price : 0);
      }

      function getHotelTotal(hotel) {
        if (!hotel) return 0;
        return hotel.night * getNights();
      }

      function getHotelLimitTotal() {
        return HOTEL_NIGHT_LIMIT * getNights();
      }

      function getOverrunInfo() {
        const fTotal = getFlightsTotal();
        const flightOver = fTotal > FLIGHT_LIMIT ? fTotal - FLIGHT_LIMIT : 0;
        const hotel = getHotel();
        const hTotal = getHotelTotal(hotel);
        const hLimit = getHotelLimitTotal();
        const hotelOver = hotel && hTotal > hLimit ? hTotal - hLimit : 0;

        return {
          flightOver,
          hotelOver,
          totalOver: flightOver + hotelOver,
          hasOver: flightOver > 0 || hotelOver > 0
        };
      }

      function getTripTotal() {
        return getFlightsTotal() + getHotelTotal(getHotel());
      }

      function isStep1Complete() {
        return Boolean(state.dest && state.dest !== state.origin && state.startDay && state.endDay);
      }

      function hotelMorningTiming(hotel) {
        const m = getMeeting();
        if (m.minutes === null) return hotel.commuteFull;
        const leave = toTime(m.minutes - hotel.leaveOffset);
        return `К ${m.short} → выход в ${leave} · ${hotel.commuteShort}`;
      }

      function enterStep3() {
        state.step = 3;
        state.openPopover = null;
        state.infoTip = null;
      }

      function currentHHMM() {
        const now = new Date();
        return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      }

      function renderDestItems() {
        const q = state.destSearch.trim().toLowerCase();
        const offices = OFFICE_CITIES.filter(c => c.name.toLowerCase().includes(q));
        const others = OTHER_CITIES.filter(c => c.name.toLowerCase().includes(q));

        let html = '';
        if (offices.length) {
          html += `<div class="pop-group-title">Города с офисами</div>`;
          html += offices.map(c => `
            <button type="button" class="pop-item ${state.dest === c.name ? 'selected' : ''}" data-action="pick-dest" data-val="${esc(c.name)}">
              <span>${esc(c.name)}</span>
              <span class="office-pill">Офис</span>
            </button>
          `).join('');
        }
        if (others.length) {
          html += `<div class="pop-group-title">Другие города</div>`;
          html += others.map(c => `
            <button type="button" class="pop-item ${state.dest === c.name ? 'selected' : ''}" data-action="pick-dest" data-val="${esc(c.name)}">
              <span>${esc(c.name)}</span>
            </button>
          `).join('');
        }
        if (!offices.length && !others.length) {
          html = `<div style="padding:10px 12px; font-size:13px; color:var(--ink-tertiary);">Город не найден</div>`;
        }
        return html;
      }

      function renderCalendarPopover() {
        // May 2026 starts on Friday (4 leading blanks for Mon-Thu)
        let cells = '';
        for (let i = 0; i < 1; i++) cells += `<div></div>`;
        for (let d = 1; d <= 31; d++) {
          const isEdge = state.startDay === d || state.endDay === d;
          const inRange = state.startDay && state.endDay && d > state.startDay && d < state.endDay;
          const cls = isEdge ? 'edge' : (inRange ? 'in-range' : '');
          cells += `<button type="button" class="cal-day ${cls}" data-action="cal-day" data-day="${d}" aria-label="${d} декабря" aria-pressed="${isEdge}">${d}</button>`;
        }

        const hint = !state.startDay
          ? 'Выберите вылет'
          : (!state.endDay ? 'Выберите возвращение' : getDatesLabel());

        return `
          <div class="popover cal-pop align-right" data-popover="true">
            <div class="cal-head">
              <span class="cal-month">Декабрь 2026</span>
              <span class="cal-hint">${hint}</span>
            </div>
            <div class="cal-grid">
              <div class="cal-wd">Пн</div>
              <div class="cal-wd">Вт</div>
              <div class="cal-wd">Ср</div>
              <div class="cal-wd">Чт</div>
              <div class="cal-wd">Пт</div>
              <div class="cal-wd">Сб</div>
              <div class="cal-wd">Вс</div>
              ${cells}
            </div>
          </div>
        `;
      }

      function renderProjectOptions() {
        return `<div class="popover project-options" data-popover="true">
          ${PROJECTS.map(p => `
            <button type="button" class="pop-item ${state.project === p.name ? 'selected' : ''}" data-action="pick-project" data-val="${esc(p.name)}">
              <span>${esc(p.name)}</span><small>${esc(p.manager)}</small>
            </button>`).join('')}
        </div>`;
      }

      function renderProjectTrigger(project, triggerClass) {
        const open = state.openPopover === 'project';
        return `<div class="approval-project">
          <button type="button" class="project-trigger ${triggerClass}" data-action="open-pop" data-pop="project" aria-expanded="${open}">${esc(project.name)} ${icon('edit')}</button>
          ${open ? renderProjectOptions() : ''}
        </div>`;
      }

      function renderStep1() {
        const datesText = getDatesLabel();
        const meeting = getMeeting();
        const proj = getProjectObj();
        const hasErr = state.searchError.dest || state.searchError.dates;

        return `
          <div class="start-shell">
            <section class="start-hero" aria-labelledby="start-title">
              <div class="hero-copy">
                <h1 class="start-title" id="start-title" aria-label="Собираемся в командировку"><span class="hero-morph" aria-hidden="true">Собираемся в командировку</span></h1>
                <p>Подберите рейсы и отель, затем отправьте поездку на согласование.</p>
              </div>
              <div class="search-bar">

              <div class="seg">
                <button type="button" class="seg-btn ${state.openPopover === 'origin' ? 'open' : ''}" data-action="open-pop" data-pop="origin" aria-expanded="${state.openPopover === 'origin'}">
                  <span class="seg-label">Откуда</span>
                  <span class="seg-val">${esc(state.origin)}</span>
                </button>
                ${state.openPopover === 'origin' ? `
                  <div class="popover" data-popover="true">
                    ${ORIGIN_CITIES.map(c => `
                      <button type="button" class="pop-item ${state.origin === c ? 'selected' : ''}" data-action="pick-origin" data-val="${esc(c)}">
                        <span>${esc(c)}</span>
                      </button>
                    `).join('')}
                  </div>
                ` : ''}
              </div>

              <div class="seg">
                <button type="button" class="seg-btn ${state.openPopover === 'dest' ? 'open' : ''} ${state.searchError.dest ? 'invalid' : ''}" data-action="open-pop" data-pop="dest" aria-expanded="${state.openPopover === 'dest'}">
                  <span class="seg-label">Куда</span>
                  <span class="seg-val ${!state.dest ? 'placeholder' : ''}">${state.dest ? esc(state.dest) : 'Город назначения'}</span>
                </button>
                ${state.openPopover === 'dest' ? `
                  <div class="popover wide" data-popover="true">
                    <input
                      id="dest-search-input"
                      type="text"
                      class="pop-search"
                      placeholder="Поиск города" aria-label="Поиск города"
                      value="${esc(state.destSearch)}"
                      autocomplete="off"
                    />
                    <div id="dest-list-box">${renderDestItems()}</div>
                  </div>
                ` : ''}
              </div>

              <div class="seg">
                <button type="button" class="seg-btn ${state.openPopover === 'dates' ? 'open' : ''} ${state.searchError.dates ? 'invalid' : ''}" data-action="open-pop" data-pop="dates" aria-expanded="${state.openPopover === 'dates'}">
                  <span class="seg-label">Даты</span>
                  <span class="seg-val ${!datesText ? 'placeholder' : ''}"${datesText ? ` title="${esc(datesText)}"` : ''}>${datesText ? esc(datesText) : 'Туда — обратно'}</span>
                </button>
                ${state.openPopover === 'dates' ? renderCalendarPopover() : ''}
              </div>

              <div class="seg">
                <button type="button" class="seg-btn" data-action="edit-meeting" data-time-anchor="home" aria-haspopup="dialog" aria-expanded="false">
                  <span class="seg-label">В офисе к</span>
                  <span class="seg-val ${meeting.id === 'any' ? 'placeholder' : ''}">${esc(meeting.short)}</span>
                </button>
              </div>
              </div>
            </section>

            ${hasErr ? `
              <div class="search-err" role="alert">
                ${state.searchError.dest && state.searchError.dates
                  ? 'Выберите город назначения и даты поездки'
                  : state.searchError.dest
                    ? (state.dest === state.origin ? 'Города вылета и назначения должны отличаться' : 'Выберите город назначения')
                    : 'Выберите даты вылета и возвращения'}
              </div>
            ` : ''}

            <div class="start-cards">

              <div class="start-card">
                <div class="card-field">
                  <label class="card-label" for="goal-input">Цель поездки</label>
                  <input
                    id="goal-input"
                    type="text"
                    class="text-input"
                    placeholder="Например, конференция"
                    value="${esc(state.goal)}"
                  />
                </div>
                <div class="chips-row" id="goal-chips">
                  ${GOAL_CHIPS.map((g, idx) => `
                    <button type="button" class="chip ${state.goal === g ? 'active' : ''}" data-action="pick-goal" data-idx="${idx}">
                      ${esc(g)}
                    </button>
                  `).join('')}
                </div>
              </div>

              <div class="start-project-column"><div class="start-card project-card">
                <div class="card-field">
                  <span class="card-label">${isStep1Complete() ? 'Проект' : 'Проект и бюджет'}</span>
                  <button type="button" class="select-btn ${state.openPopover === 'project' ? 'open' : ''}" data-action="open-pop" data-pop="project" aria-expanded="${state.openPopover === 'project'}">
                    <span>${esc(proj.name)}</span>
                    <span style="color:var(--ink-tertiary); display:inline-flex;">${ICON.chevron}</span>
                  </button>
                  ${state.openPopover === 'project' ? renderProjectOptions() : ''}
                </div>

                <div class="manager-strip">
                  <img src="./assets/manager.svg" alt="">
                  <div><small>${isStep1Complete() ? 'Согласует' : 'Руководитель'}</small><div>${esc(proj.manager)}</div></div>
                </div>
              </div>
              <button type="button" class="btn-primary start-cta" data-action="find-tickets">Подобрать рейсы и отель</button>
              </div>
            </div>
            <button type="button" class="demo-link try-example" data-action="quick-fill-anton">Заполнить пример</button>
            <section class="guide" aria-labelledby="guide-title">
              <h2 id="guide-title">Это важно знать</h2>
              <div class="guide-grid">
                ${[['rules','rules','Правила командировок','Что оплачивает компания и как устроен процесс','Смотреть правила'],['limits','notice','Превышение лимита','Как объяснить причину и получить согласование','Что делать при превышении'],['documents','documents','После поездки','Какие документы собрать после возвращения','Список документов']].map(([id,image,title,copy,action]) => `<article class="guide-card">
                  <img src="./assets/${image}.svg" alt=""><h3>${title}</h3><p>${copy}</p>
                  <button type="button" class="btn-secondary" data-action="help" data-id="${id === 'limits' ? 'overrun' : id}">Подробнее<span class="sr-only"> · ${action}</span></button>
                </article>`).join('')}
              </div>
            </section>
          </div>
        `;
      }


      const particleField = '<span class="speed-particles" aria-hidden="true"></span>';

      function renderJourneyFill(progress, cap) {
        return `<div class="journey-progress" data-journey-progress="${progress}" data-journey-cap="${cap}" aria-hidden="true">
          <canvas class="journey-progress-canvas"></canvas>
          <div class="journey-progress-paint">${particleField}</div>
        </div>`;
      }

      function renderStepPreview(stage, content) {
        if (!content) return '';
        return `<div class="step-peek" id="step-peek-${stage}" data-peek="${stage}">${content}</div>`;
      }

      function renderFlightPreview(flight, outbound) {
        if (!flight) return '';
        const route = outbound ? [state.origin, state.dest] : [state.dest, state.origin];
        return `<div class="step-peek-row">
          ${icon('flight', 20)}
          <div><strong>${esc(route.join(' – '))}</strong><small>${flight.depart}–${flight.arrive} · ${esc(flight.airline)}</small></div>
          <b>${fmt(flight.price)}</b>
        </div>`;
      }

      function renderStepsBar() {
        const out = getOutFlight();
        const back = getRetFlight();
        const hotel = getHotel();
        const active = state.step === 5 ? 2 : state.step === 3 ? 1 : 0;
        const cap = active + 1;
        const progress = active ? cap : out && back ? 1 : out ? .985 : .955;
        const flightPreview = renderFlightPreview(out, true) + renderFlightPreview(back, false);
        const hotelPreview = hotel ? `<div class="step-peek-row">
          <img class="step-peek-photo" src="./assets/${esc(hotel.photo)}" alt="">
          <div><strong>${esc(hotelName(hotel))}</strong><small>${pluralNights(getNights())}</small></div><b>${fmt(getHotelTotal(hotel))}</b>
        </div>` : '';
        const summaryPreview = out && back && hotel ? `<div class="step-peek-row">
          ${icon('progress-review', 20)}
          <div><strong>Итого за поездку</strong><small>Согласует ${esc(getProjectObj().manager)}</small></div><b>${fmt(getTripTotal())}</b>
        </div>` : '';
        const steps = [
          [2, 'Билеты', [out, back].filter(Boolean).map(flight => `${flight.depart}–${flight.arrive}`).join(', ') || 'Туда и обратно', false, flightPreview, 'progress-plane'],
          [3, 'Проживание', hotel ? hotelName(hotel) : 'Не выбрано', !out || !back, hotelPreview, 'progress-stay'],
          [5, 'Сводка', 'Проверьте перед отправкой', !out || !back || !hotel, summaryPreview, 'progress-review']
        ];

        return `
          <div class="trip-heading">
            <h1>${esc(state.goal || 'Командировка')}</h1>
            <div class="trip-meta"><span>${icon('route')} ${esc(state.origin)} – ${esc(state.dest)}</span>
              <span>${icon('date')} ${getShortDates()}</span><span>${icon('stay')} ${pluralNights(getNights())}</span></div>
          </div>
          <div class="journey-step-shell">
            <nav class="steps-bar speed-steps" aria-label="Шаги командировки">
              ${renderJourneyFill(progress, cap)}
              ${steps.map(([stage, name, detail, disabled, preview, glyph], i) => `
                <button class="step-card ${i <= active ? 'active' : ''}" type="button"
                  data-action="go-step" data-step="${stage}" ${i === active ? 'aria-current="step"' : ''} ${disabled ? 'disabled' : ''}
                  ${preview ? `aria-describedby="step-peek-${stage}"` : ''}>
                  <span class="sc-dot step-glyph" aria-hidden="true">${icon(glyph,24)}
                    ${i > 0 ? `<span class="step-glyph-variant">${icon(i === 1 ? 'progress-stay-filled' : 'progress-review-active',24)}</span>` : ''}
                  </span>
                  <span><span class="sc-label">${name}</span><span class="sc-value" title="${esc(detail)}">${esc(detail)}</span></span>
                </button>`).join('')}
            </nav>
            ${steps.map(([stage, , , , preview]) => renderStepPreview(stage, preview)).join('')}
          </div>`;
      }

      function getArrival(flight) {
        if (!state.hotelStop) return flight.arrMin + TAXI_MINUTES;
        const hotel = getHotel();
        return flight.arrMin + 35 + 10 + (hotel ? hotel.leaveOffset - 5 : 15);
      }

      const weekdays = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
      const dayLabel = day => day + ' декабря, ' + weekdays[new Date(2026, 11, day).getDay()];

      function renderTimelineHead(outbound, office, status, tone, meeting) {
        const showMeeting = outbound && office && (state.timelineCollapsed || !status);
        const statusIcon = tone === 'late' ? icon('budget-alert',16) : tone === 'ok' ? ICON.check : '';
        return `<div class="tl-top">
          <button class="tl-collapse-toggle" type="button" data-action="toggle-timeline" aria-expanded="${!state.timelineCollapsed}" aria-controls="journey-chart">
            <span class="tl-title">Таймлайн</span>
            <span class="tl-status ${tone}">${statusIcon} ${status || 'Наведитесь на рейс'}</span>
          </button>
          ${showMeeting ? `<button class="meeting-tag tl-meeting-tag" data-action="edit-meeting" data-time-anchor="timeline" aria-haspopup="dialog" aria-expanded="false" type="button">${meeting === null ? 'Указать встречу' : 'Встреча ' + toTime(meeting)} ${icon('edit')}</button>` : ''}
          ${outbound && office ? `<button class="tl-hotel-switch" type="button" data-action="toggle-hotel-stop" role="switch" aria-checked="${state.hotelStop}">
            <span class="switch ${state.hotelStop ? 'on' : ''}"><span class="switch-knob"></span></span>Завезти вещи в отель
          </button>` : ''}
          <span class="tl-chevron" aria-hidden="true">${icon('timeline-chevron',14)}</span>
        </div>`;
      }

      function buildTimelineHTML() {
        const outbound = state.flightTab === 'out';
        const list = outbound ? OUTBOUND_FLIGHTS : RETURN_FLIGHTS;
        const flight = list.find(item => item.id === state.hoverFlightId) || (outbound ? getOutFlight() : getRetFlight());
        const meeting = getMeeting().minutes;
        const office = getDestObj().office;
        if (!flight) return renderTimelineHead(outbound, office, '', 'neutral', meeting) +
          `<div id="journey-chart" class="tl-body tl-empty-body" ${state.timelineCollapsed ? 'hidden' : ''}></div>`;

        const arrival = getArrival(flight);
        const leave = flight.depMin - AIRPORT_MINUTES - TAXI_MINUTES;
        const hasMeeting = outbound && office && meeting !== null;
        const balance = hasMeeting ? meeting - arrival : leave - WORK_END;
        const nearbyMeeting = hasMeeting && meeting >= flight.depMin - 60 && meeting <= arrival + 120;
        const start = outbound
          ? Math.max(0, Math.floor((Math.min(flight.depMin, nearbyMeeting ? meeting : flight.depMin) - 15) / 30) * 30)
          : Math.max(WORK_START, Math.floor((Math.min(leave, WORK_END) - 60) / 30) * 30);
        const end = Math.ceil(((outbound ? Math.max(arrival, nearbyMeeting ? meeting : arrival) : flight.arrMin) + 15) / 30) * 30;
        const span = end - start;
        const tickStep = span > 300 ? 60 : 30;
        const tickTimes = [];
        for (let t = start; t <= end; t += tickStep) tickTimes.push(t);
        const pos = value => Math.min(100, Math.max(0, 100 * (value - start) / span));
        const clock = time => toTime(time);
        const durationLabel = value => {
          const hours = Math.floor(value / 60);
          const mins = value % 60;
          return [hours ? hours + ' ч' : '', mins || !hours ? mins + ' мин' : ''].filter(Boolean).join(' ');
        };
        const status = outbound ? (hasMeeting
          ? (balance >= 0 ? 'Успеваете с запасом в ' : 'Опоздание на ') + durationLabel(Math.abs(balance))
          : (office ? 'В офисе ≈' + clock(arrival) : 'Прилёт в ' + flight.arrive))
          : (balance < 0 ? 'Уйти из офиса в ' + clock(leave) : 'Успеете завершить рабочий день');
        const stop = outbound && state.hotelStop && office;
        const flightSegment = [flight.depMin,flight.arrMin,'flight',`${ICON.airborne} ${flight.depart}–${flight.arrive}`];
        const segments = outbound
          ? [flightSegment, ...(office
            ? stop ? [[flight.arrMin,flight.arrMin+35,'taxi','≈35 мин'],[flight.arrMin+35,flight.arrMin+45,'hotel','Отель'],[flight.arrMin+45,arrival,'taxi','≈'+(arrival-flight.arrMin-45)+' мин']]
              : [[flight.arrMin,arrival,'taxi','≈40 мин']]
            : [])]
          : [[WORK_START,Math.min(leave, WORK_END),'work','Рабочий день'],[leave,leave+TAXI_MINUTES,'taxi','Такси'],
            [leave+TAXI_MINUTES,flight.depMin,'airport','Аэропорт'],flightSegment];
        const closeMarkers = nearbyMeeting && Math.abs(pos(meeting) - pos(arrival)) < 16;
        const markerLeft = nearbyMeeting ? Math.min(pos(meeting) + (closeMarkers && arrival <= meeting ? 5 : 0), 92) : 0;

        return `
          ${renderTimelineHead(outbound, office, status, (hasMeeting || !outbound) && balance < 0 ? 'late' : 'ok', meeting)}
          <div class="tl-body" id="journey-chart" ${state.timelineCollapsed ? 'hidden' : ''}><div class="journey-chart" aria-label="${flight.depart}–${flight.arrive}, ${status}">
            <div class="chart-badges">
              ${outbound && office ? `<span class="arrival-tag ${closeMarkers ? (arrival <= meeting ? 'edge-left' : 'edge-right') : ''}" style="left:${pos(arrival)}%">≈${clock(arrival)}</span>` : ''}
              ${nearbyMeeting ? `<button class="meeting-tag ${closeMarkers && arrival > meeting ? 'edge-left' : ''}" data-action="edit-meeting" data-time-anchor="timeline" aria-haspopup="dialog" aria-expanded="false" type="button"
                style="left:${markerLeft}%">Встреча ${clock(meeting)} ${icon('edit')}</button>` :
                outbound && office ? `<button type="button" class="meeting-tag meeting-add" data-action="edit-meeting" data-time-anchor="timeline" aria-haspopup="dialog" aria-expanded="false">${meeting === null ? 'Указать встречу' : 'Встреча ' + clock(meeting)}</button>` : ''}
            </div>
            <div class="journey-track">
              ${tickTimes.map(time => `<i class="journey-rule" style="left:${pos(time)}%"></i>`).join('')}
              ${segments.filter(([from,to]) => to > from).map(([from,to,tone,label]) => `<span class="journey-segment seg-${tone}" style="left:${pos(from)}%;width:${pos(to)-pos(from)}%">${label}</span>`).join('')}
              ${outbound && office ? `<i class="arrival-dot" style="left:${pos(arrival)}%"></i>` : ''}
              ${nearbyMeeting ? `<i class="meeting-line" style="left:${pos(meeting)}%"></i>` : ''}
            </div>
            <div class="journey-axis" aria-hidden="true">${tickTimes.map((time,i) => `<span style="left:${pos(time)}%" class="${i === 0 ? 'first' : i === tickTimes.length - 1 && pos(time) > 95 ? 'last' : ''}">${clock(time)}</span>`).join('')}</div>
          </div>
          ${stop ? '<p class="hotel-stop-note">Если приедете до заселения, уточните хранение багажа у отеля.</p>' : ''}</div>`;
      }

      const airportCodes = {'Москва':'SVO','Казань':'KZN','Санкт-Петербург':'LED','Екатеринбург':'SVX',
        'Новосибирск':'OVB','Сочи':'AER','Нижний Новгород':'GOJ','Самара':'KUF'};

      const airlineLogos = {'Победа': 'pobeda', 'Аэрофлот': 'aeroflot', 'ЮТэйр': 'utair'};

      function renderStep2() {
        const outbound = state.flightTab === 'out';
        const options = outbound ? OUTBOUND_FLIGHTS : RETURN_FLIGHTS;
        const selected = outbound ? getOutFlight() : getRetFlight();
        const complement = outbound ? getRetFlight() : getOutFlight();
        const start = outbound ? state.origin : state.dest;
        const end = outbound ? state.dest : state.origin;
        return `
          <div class="flight-module">
            <div class="dir-tabs" role="group" aria-label="Направление перелёта">
              ${[['out',state.origin,state.dest,state.startDay],['ret',state.dest,state.origin,state.endDay]].map(([tab,from,to,day]) => `
                <button type="button" class="dir-tab ${state.flightTab === tab ? 'active' : ''}" data-action="flight-tab" data-tab="${tab}"
                  aria-pressed="${state.flightTab === tab}" ${tab === 'ret' && !getOutFlight() ? 'disabled' : ''}>
                  ${icon('direction',36)}<span><strong>${esc(from)} – ${esc(to)}</strong><small>${dayLabel(day)}</small></span>
                </button>`).join('')}
            </div>
            <section class="timeline-card" id="timeline-card" aria-label="План дня">${buildTimelineHTML()}</section>
            <div class="flight-list" aria-label="Доступные рейсы">
              ${options.map(f => {
                const chosen = selected?.id === f.id;
                const over = f.price + (complement?.price || 0) > FLIGHT_LIMIT;
                return `<article class="flight-card ${chosen ? 'selected' : ''}" data-hover-flight="${f.id}" tabindex="0">
                  <div class="fc-route">
                    <span class="fc-end"><strong class="fc-time">${f.depart}</strong><span class="fc-city">${airportCodes[start] || '—'}</span></span>
                    <div class="fc-duration"><span>В пути ${f.duration}</span><span class="fc-connector" aria-hidden="true"></span><span class="fc-direct">Прямой</span></div>
                    <span class="fc-end"><strong class="fc-time">${f.arrive}</strong><span class="fc-city">${airportCodes[end] || '—'}</span></span>
                  </div>
                  <div class="fc-airline"><img class="airline-logo" src="./assets/airline-${airlineLogos[f.airline]}.svg" width="54" height="24" alt="">${f.airline}<span class="fc-bag">${f.bag} ${icon('bag',24)}</span></div>
                  <div class="fc-right"><strong class="fc-price">${fmt(f.price)}</strong><small class="${over ? 'over-price' : ''}">${over ? 'Выше лимита' : 'В лимите'}</small></div>
                  <div class="fc-actions"><button type="button" class="flight-choose" data-action="${outbound ? 'pick-out' : 'pick-ret'}" data-id="${f.id}" aria-pressed="${chosen}">${chosen ? 'Выбран' : 'Выбрать'}</button>
                    <button type="button" class="text-action" data-action="flight-details" data-id="${f.id}">Подробнее ${ICON.chevron}</button></div>
                </article>`;
              }).join('')}
            </div>
          </div>`;
      }

      function renderReview() {
        const out = getOutFlight();
        const back = getRetFlight();
        const hotel = getHotel();
        const proj = getProjectObj();
        const overrun = getOverrunInfo();
        const total = getTripTotal();
        return `<section class="review-page">
          <header class="review-heading">
            <div class="review-eyebrow">Проверьте перед отправкой</div>
            <h1>Сводка поездки</h1>
            <p>${esc(state.origin)} — ${esc(state.dest)} <span>·</span> ${getShortDates()}</p>
          </header>

          <section class="review-card review-itinerary" aria-labelledby="review-itinerary-title">
            <div class="review-section-head"><div><span class="review-kicker">Маршрут</span><h2 id="review-itinerary-title">Билеты</h2></div>
              <button class="text-action" data-action="go-step" data-step="2">Изменить</button></div>
            <div class="review-flight-pair">
              <div class="review-flight"><span class="review-icon">${icon('flight',22)}</span><div class="review-flight-copy"><strong>${esc(state.origin)} → ${esc(state.dest)}</strong><span>${dayLabel(state.startDay)} · ${out.depart}–${out.arrive}</span></div><b>${fmt(out.price)}</b></div>
              <div class="review-flight"><span class="review-icon return">${icon('flight',22)}</span><div class="review-flight-copy"><strong>${esc(state.dest)} → ${esc(state.origin)}</strong><span>${dayLabel(state.endDay)} · ${back.depart}–${back.arrive}</span></div><b>${fmt(back.price)}</b></div>
            </div>
            <div class="review-subtotal"><span>Билеты туда и обратно</span><strong>${fmt(getFlightsTotal())}</strong></div>
          </section>

          <section class="review-card review-stay" aria-labelledby="review-stay-title">
            <div class="review-section-head"><div><span class="review-kicker">Проживание</span><h2 id="review-stay-title">${esc(hotelName(hotel))}</h2></div>
              <button class="text-action" data-action="go-step" data-step="3">Изменить</button></div>
            <div class="review-stay-details"><span>${pluralNights(getNights())}</span><span>${esc(hotel.commuteFull || 'Поездка до офиса')}</span>${hotel.address ? `<span>${esc(hotel.address)}</span>` : ''}${hotel.checkIn ? `<span>Заезд ${state.startDay} декабря с ${hotel.checkIn}</span><span>Выезд ${state.endDay} декабря до ${hotel.checkOut}</span>` : ''}</div>
            <div class="review-subtotal"><span>Проживание</span><strong>${fmt(getHotelTotal(hotel))}</strong></div>
          </section>

          ${overrun.hasOver ? `<section class="review-card review-reason ${state.reasonError ? 'has-error' : ''}" aria-labelledby="review-reason-title">
            <div class="review-section-head"><div><span class="review-kicker">Нужно пояснение</span><h2 id="review-reason-title">Выше ориентира на ${fmt(overrun.totalOver)}</h2></div></div>
            <p class="review-reason-copy">Руководитель увидит сумму превышения и ваш комментарий к поездке.</p>
            <div class="overrun-chips review-reason-chips" id="reason-chips">
              ${REASON_CHIPS.map((c, idx) => `<button type="button" class="overrun-chip ${state.reason === c ? 'active' : ''}" data-action="pick-reason" data-idx="${idx}">${esc(c)}</button>`).join('')}
            </div>
            <textarea id="reason-textarea" class="reason-area ${state.reasonError ? 'error' : ''}" rows="3"
              aria-label="Обоснование превышения лимита" aria-invalid="${state.reasonError}" placeholder="Почему этот вариант подходит для поездки?">${esc(state.reason)}</textarea>
            <div id="reason-err" class="reason-err" role="alert" style="display:${state.reasonError ? 'block' : 'none'};">Добавьте пояснение, чтобы отправить поездку на согласование</div>
          </section>` : ''}

          <section class="review-card review-approval" aria-labelledby="review-approval-title">
            <div class="review-section-head"><div><span class="review-kicker">Согласование</span><h2 id="review-approval-title">${esc(proj.name)}</h2></div></div>
            <div class="review-approval-row">${icon('manager',24)}<div><span>Согласует поездку</span><strong>${esc(proj.manager)}</strong></div></div>
            <div class="review-autobuy">
              <div><strong>Купить после одобрения</strong><p>${state.autoBuy ? 'Оплатим билеты и отель с бюджета проекта' : 'После одобрения можно будет подтвердить покупку вручную'}</p></div>
              <button type="button" class="switch ${state.autoBuy ? 'on' : ''}" data-action="toggle-autobuy" role="switch" aria-checked="${state.autoBuy}" aria-label="Купить после одобрения"><span class="switch-knob"></span></button>
            </div>
          </section>
          <div class="review-total"><span>Итого за поездку</span><strong>${total ? fmt(total) : 'до ' + fmt(FLIGHT_LIMIT + getHotelLimitTotal())}</strong></div>
        </section>`;
      }

      const HELP = {
  "limits": [
    "Ориентиры по лимитам",
    "При выборе билетов и отеля покажем ориентиры по бюджету. Если вариант дороже, можно объяснить выбор при согласовании.",
    "Авиабилеты по России",
    "до 22 000 ₽ туда и обратно",
    "Отели в Казани и регионах",
    "до 5 000 ₽ за ночь",
    "Отели в Москве и Петербурге",
    "до 7 000 ₽ за ночь",
    "Суточные",
    "700 ₽ в день"
  ],
  "approval": [
    "Согласование и покупка",
    "Поездку согласует руководитель выбранного проекта. До его одобрения деньги не списываются.",
    "Автопокупка",
    "Если она включена, после одобрения оплатим билеты и отель с бюджета проекта и пришлём документы.",
    "Цена фиксируется при покупке",
    "Если билет подорожает больше чем на 10%, запросим подтверждение."
  ],
  "documents": [
    "Документы после поездки",
    "За билеты и отель, оформленные через сервис, документы автоматически попадут в бухгалтерию.",
    "Посадочные талоны",
    "Сохраните электронные копии.",
    "Суточные",
    "Придут на зарплатную карту за день до вылета. Отчёт по ним не нужен.",
    "Такси до аэропорта",
    "Оплачивается через корпоративный аккаунт."
  ],
  "rules": [
    "Правила командировок",
    "Компания оплачивает дорогу, проживание с завтраком, корпоративное такси и суточные.",
    "Перелёт",
    "Выбирайте экономкласс с багажом. Прямые рейсы в приоритете.",
    "Отель",
    "Выбирайте по времени в пути до офиса. Ориентир по цене виден при подборе.",
    "Перенос или отмена",
    "Заявку можно отозвать. Для обмена купленных билетов обратитесь в поддержку."
  ],
  "overrun": [
    "Если поездка дороже лимита",
    "Можно выбрать вариант дороже ориентира и объяснить, почему он подходит лучше.",
    "Добавьте комментарий",
    "Поле появится в панели бюджета. Руководитель увидит причину и сумму превышения.",
    "Пример",
    "Отель рядом с офисом позволяет успеть на утреннюю встречу и сэкономить на такси."
  ]
};

      function openDialog(title, content) {
        const dialog = document.getElementById('help-dialog');
        dialog.innerHTML = `<button class="dialog-close" type="button" data-action="close-dialog" aria-label="Закрыть">×</button>
          <h2 id="help-title">${title}</h2>${content}`;
        if (!dialog.open) dialog.showModal();
      }

      function renderHotelCard(hotel) {
        const selected = state.hotelId === hotel.id;
        const total = getHotelTotal(hotel);
        const excess = Math.max(0, total - getHotelLimitTotal());
        const inspected = state.hotelInspectId === hotel.id;
        const byTransport = hotel.commuteMode === 'transport' || hotel.commuteShort.includes('на транспорте');
        return `<article class="hotel-card${selected ? ' selected' : ''}${inspected ? ' inspected' : ''}" data-hotel-id="${hotel.id}">
          <img class="hc-photo" src="./assets/${hotel.photo}" width="349" height="210" alt="" loading="lazy">
          <button type="button" class="hotel-inspect-hit" data-action="inspect-hotel" data-id="${hotel.id}"
            aria-label="Условия заселения: ${esc(hotelName(hotel))}" aria-controls="hotel-stay-details"></button>
          <div class="hc-details">
            <div class="hc-top"><h2 class="hc-name">${esc(hotelName(hotel))}</h2>
              ${hotel.rating ? `<span class="hc-rating" aria-label="Оценка ${hotel.rating} из 10">${hotel.rating}</span>` : ''}
            </div>
            <ul class="hc-features">
              ${getDestObj().office ? `<li class="${byTransport ? 'hc-transit' : 'hc-walk'}" title="${esc(hotel.commuteShort)}">${icon(byTransport ? 'transport' : 'walk')} ${esc(hotel.commuteFull)}</li>` : ''}
              ${hotel.breakfast ? `<li>${icon('breakfast')} Завтрак</li>` : ''}
              ${hotel.freeCancel ? `<li>${icon('cancel-free')} Бесплатная отмена</li>` : ''}
            </ul>
          </div>
          <div class="hc-bottom">
            <div class="hc-cost"><strong aria-label="${fmt(total)} за ${pluralNights(getNights())}">${fmt(total)}</strong><small class="hc-sub">${excess ? 'Выше лимита' : 'В лимите'}</small></div>
            <button type="button" class="flight-choose hotel-choose" data-action="pick-hotel" data-id="${hotel.id}"
              aria-label="${selected ? 'Выбран' : 'Выбрать'}: ${esc(hotelName(hotel))}" aria-pressed="${selected}">${selected ? 'Выбран' : 'Выбрать'}</button>
          </div>
        </article>`;
      }

      function renderHotelTiming(hotel) {
        if (!hotel) return '<div class="map-overlay-card" id="hotel-stay-details" aria-live="polite"><p>Нажмите на отель, чтобы посмотреть время заезда и условия хранения багажа.</p></div>';
        const checkIn = hotel.checkIn || '14:00';
        const checkOut = hotel.checkOut || '12:00';
        const flight = getOutFlight();
        const arrival = flight && state.hotelStop ? flight.arrMin + 35 : null;
        const early = arrival !== null && arrival < minutes(checkIn);
        const luggage = hotel.luggage ? 'Можно оставить вещи до заселения.' : 'Хранение вещей до заселения нужно уточнить у отеля.';
        return `<div class="map-overlay-card" id="hotel-stay-details" aria-live="polite">
          <h3 class="hotel-inspect-title">${esc(hotelName(hotel))}</h3>
          ${hotel.address ? `<p class="hotel-inspect-address">${esc(hotel.address)}</p>` : ''}
          <dl class="hotel-stay-times">
            <div><dt>Заезд</dt><dd>${state.startDay} декабря с ${checkIn}</dd></div>
            <div><dt>Выезд</dt><dd>${state.endDay} декабря до ${checkOut}</dd></div>
          </dl>
          <p class="moc-sub">${early ? `Будете у отеля около ${toTime(arrival)}. ` : ''}${luggage}</p>
        </div>`;
      }

      function renderStep3() {
        const hotels = getAvailableHotels();
        const isKazan = state.dest === 'Казань';
        const filters = [
          ['all','Все отели',() => true],
          ['limit','В лимите',hotel => getHotelTotal(hotel) <= getHotelLimitTotal()],
          ['near','До 10 мин от офиса',hotel => hotel.leaveOffset <= 15],
          ['breakfast','С завтраком',hotel => hotel.breakfast]
        ];
        const filter = filters.find(([id]) => state.hotelFilter === id) || filters[0];
        const shown = hotels.filter(filter[2]);
        return `
          <div class="hotel-filters" aria-label="Фильтры отелей">${filters.filter(([id]) => id !== 'near' || getDestObj().office).map(([id,label]) =>
            `<button type="button" class="chip ${state.hotelFilter === id ? 'active' : ''}" data-action="hotel-filter" data-id="${id}" aria-pressed="${state.hotelFilter === id}">${label}</button>`).join('')}</div>
          <div class="hotels-split">
            <section class="hotel-list" aria-label="Отели в ${esc(getDestObj().locative)}">
              ${shown.length ? shown.map(renderHotelCard).join('') : '<p class="hotel-empty">По этому фильтру отелей нет</p>'}
            </section>
            <section class="map-shell" aria-label="Карта и время заселения">
              ${isKazan ? '<div class="map-canvas" data-kazan-map aria-label="Карта Казани с офисом Т-Банка и отелями"></div>' : ''}
              ${renderHotelTiming(hotels.find(h => h.id === state.hotelInspectId) || getHotel())}
            </section>
          </div>`;
      }

      let kazanMap = null;
      let hotelHoverId = null;

      function highlightHotel(id, pan = false) {
        hotelHoverId = id;
        document.querySelectorAll('[data-hotel-id]').forEach(card => {
          card.classList.toggle('map-highlighted', card.dataset.hotelId === id);
        });
        if (!kazanMap) return;
        for (const {hotels, marker} of kazanMap.markers) {
          const hovered = hotels.some(hotel => hotel.id === id);
          const selected = hotels.some(hotel => hotel.id === state.hotelId);
          marker.getElement()?.classList.toggle('map-highlighted', hovered);
          marker.setZIndexOffset(hovered ? 1000 : selected ? 500 : 0);
          if (hovered && hotels.length === 1) marker.openTooltip();
          else marker.closeTooltip();
          if (hovered && pan) kazanMap.map.panInside(marker.getLatLng(), {padding:[50,44],animate:true});
        }
      }

      function inspectHotel(id, scrollToCard = false) {
        state.hotelInspectId = id;
        render();
        if (!scrollToCard) return;

        const card = document.querySelector(`[data-hotel-id="${id}"]`);
        card?.scrollIntoView({block:'start', behavior:motionPreference.matches ? 'instant' : 'smooth'});
      }

      function hotelCardFrom(target) {
        return target?.closest?.('[data-hotel-id]');
      }

      document.addEventListener('pointerover', event => {
        const card = hotelCardFrom(event.target);
        if (event.pointerType !== 'touch' && card && card !== hotelCardFrom(event.relatedTarget)) highlightHotel(card.dataset.hotelId, true);
      });
      document.addEventListener('pointerout', event => {
        const card = hotelCardFrom(event.target);
        if (card && card !== hotelCardFrom(event.relatedTarget)) highlightHotel(null);
      });
      document.addEventListener('focusin', event => {
        const card = hotelCardFrom(event.target);
        if (card) highlightHotel(card.dataset.hotelId, true);
      });
      document.addEventListener('focusout', event => {
        const card = hotelCardFrom(event.target);
        if (card && card !== hotelCardFrom(event.relatedTarget)) highlightHotel(null);
      });

      function updateHotelMap(app) {
        const slot = app.querySelector('[data-kazan-map]');
        if (!slot) {
          kazanMap?.map.remove();
          kazanMap = null;
          hotelHoverId = null;
          return;
        }
        const L = window.L;
        if (!L) {
          slot.innerHTML = '<p class="map-unavailable">Карта не загрузилась.</p>';
          return;
        }

        if (!kazanMap) {
          const extent = [[55.764, 49.113], [55.793, 49.149]];
          const map = L.map(slot, {
            scrollWheelZoom:true, wheelPxPerZoomLevel:125, minZoom:11, maxZoom:19, zoomSnap:.5,
            maxBounds:[[55.71,49.05],[55.87,49.24]], maxBoundsViscosity:.8
          });
          map.attributionControl.setPrefix(false);
          const fallback = L.imageOverlay('./assets/kazan-map-wide.webp', extent, {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            minZoom:11, maxZoom:19, updateWhenIdle:true
          });
          tiles.once('tileload', () => fallback.setOpacity(0));
          tiles.on('tileerror', () => fallback.setOpacity(1));
          tiles.addTo(map);
          const officeMarker = L.marker(KAZAN_OFFICE.coordinates, {
            icon: L.divIcon({className:'hotel-map-office', html:icon('map-bank',36), iconSize:[36,36], iconAnchor:[18,18]}),
            alt:'ИТ-хаб Т-Банка', title:'ИТ-хаб Т-Банка'
          }).addTo(map);
          officeMarker.bindPopup(`<strong>ИТ-хаб Т-Банка</strong><br>${KAZAN_OFFICE.address}`);
          map.fitBounds([KAZAN_OFFICE.coordinates, ...KAZAN_HOTELS.map(hotel => hotel.coordinates)], {padding:[54,48],maxZoom:16});
          kazanMap = {slot,map,markers:[],hotels:[]};
          map.on('zoomend resize', placeKazanPrices);
        } else {
          slot.replaceWith(kazanMap.slot);
          kazanMap.map.invalidateSize({pan:false});
        }

        const visible = new Set([...app.querySelectorAll('[data-hotel-id]')].map(card => card.dataset.hotelId));
        kazanMap.hotels = KAZAN_HOTELS.filter(hotel => visible.has(hotel.id));
        placeKazanPrices();
      }

      function clusterHotelPrices(map, hotels) {
        const groups = [];
        for (const hotel of hotels) {
          const point = map.project(hotel.coordinates);
          const group = groups.find(group => Math.abs(point.x - group.point.x) < 76 && Math.abs(point.y - group.point.y) < 34);
          if (group) group.hotels.push(hotel);
          else groups.push({point, hotels:[hotel]});
        }
        return groups;
      }

      function placeKazanPrices() {
        if (!kazanMap) return;
        const {map, hotels} = kazanMap;
        kazanMap.markers.forEach(({marker}) => marker.remove());
        kazanMap.markers = clusterHotelPrices(map, hotels).map(({hotels}) => {
          const [first] = hotels;
          const isCluster = hotels.length > 1;
          const zoom = () => {
            const bounds = L.latLngBounds(hotels.map(hotel => hotel.coordinates));
            const zoomTo = map.getBoundsZoom(bounds, false, L.point(76,80));
            map.setView(bounds.getCenter(), Math.min(map.getMaxZoom(), Math.max(zoomTo, map.getZoom() + 1)));
          };
          const price = Math.min(...hotels.map(getHotelTotal));
          const over = price > getHotelLimitTotal();
          const selected = !isCluster && state.hotelId === first.id;
          const coordinates = isCluster ? L.latLngBounds(hotels.map(hotel => hotel.coordinates)).getCenter() : first.coordinates;
          const marker = L.marker(coordinates, {
            icon: L.divIcon({
              className:`hotel-map-pin${isCluster ? ' hotel-map-cluster' : ''}`,
              html:`<span class="map-price ${over ? 'over' : 'in'}${selected ? ' selected' : ''}">${isCluster ? 'от ' : ''}${fmt(price)}</span>`,
              iconSize:[76,30], iconAnchor:[38,36], tooltipAnchor:[0,-36]
            })
          }).addTo(map);
          const element = marker.getElement();
          element.setAttribute('aria-label', isCluster ? `${hotels.length} ${hotels.length <= 4 ? 'отеля' : 'отелей'}, от ${fmt(price)}` : `${first.name}, ${fmt(price)}`);
          element.classList.toggle('inspected', !isCluster && state.hotelInspectId === first.id);
          marker.on('click', isCluster ? zoom : () => inspectHotel(first.id, true));
          if (!isCluster) {
            marker.bindTooltip(esc(first.name), {direction:'top', className:'hotel-map-tooltip'});
            marker.on('mouseover', () => highlightHotel(first.id));
            marker.on('mouseout', () => highlightHotel(null));
          }
          return {hotels, marker};
        });
        highlightHotel(hotelHoverId);
      }

      const limitPosition = 75;

      function budgetPosition(current, limit) {
        if (current <= limit) return current / limit * limitPosition;
        return limitPosition + Math.min(25, Math.max(6, (current - limit) / limit * 55));
      }

      function budgetAmount(current, limit) {
        return current
          ? `${fmt(current)} <span class="limit-muted">/ ${fmt(limit)}</span>`
          : `до ${fmt(limit)}`;
      }

      function renderThermostat(id, label, current, limit, tooltipText) {
        const position = budgetPosition(current, limit);
        const isOpen = state.infoTip === id;

        return `
          <div class="thermo-item" data-budget="${id}">
            <div class="thermo-top">
              <div class="thermo-label-wrap">
                <span class="thermo-name">${label}</span>
                <button type="button" class="info-btn ${isOpen ? 'open' : ''}" data-action="toggle-tip" data-tip="${id}" aria-expanded="${isOpen}" aria-describedby="budget-tip-${id}" aria-label="Подробнее об ориентире: ${label}">${icon('budget-info',14)}</button>
                <div class="info-tooltip" id="budget-tip-${id}" role="tooltip" data-popover="true">${tooltipText}</div>
              </div>
              <span class="thermo-nums ${current ? '' : 'empty'} ${current > limit ? 'over' : ''}">${budgetAmount(current, limit)}</span>
            </div>
            <div class="thermo-track">
              <div class="thermo-fill-in speed-meter" data-speed="${id}-in" style="--progress:${Math.min(position, limitPosition)}%">${particleField}</div>
              <div class="thermo-fill-over speed-meter" data-speed="${id}-over" style="--progress:${Math.max(0, position - limitPosition)}%">${particleField}</div>
              ${id === 'flight' ? '<div class="thermo-preview" aria-hidden="true"></div>' : ''}
              <div class="thermo-tick" style="left:${limitPosition}%"></div>
            </div>
          </div>
        `;
      }

      function refreshFlightBudgetPreview(flight) {
        const budget = document.querySelector('[data-budget="flight"]');
        const total = document.querySelector('[data-flight-total]');
        if (!budget || !total) return;
        const selected = state.flightTab === 'out' ? getOutFlight() : getRetFlight();
        const complement = state.flightTab === 'out' ? getRetFlight() : getOutFlight();
        const preview = flight && flight.id !== selected?.id;
        const price = preview ? (complement?.price || 0) + flight.price : getFlightsTotal();
        const amount = budget.querySelector('.thermo-nums');
        amount.innerHTML = budgetAmount(price, FLIGHT_LIMIT);
        amount.classList.toggle('empty', price === 0);
        amount.classList.toggle('over', price > FLIGHT_LIMIT);

        const start = budgetPosition(complement?.price || 0, FLIGHT_LIMIT);
        const end = budgetPosition(price, FLIGHT_LIMIT);
        budget.style.setProperty('--preview-start', `${start}%`);
        budget.style.setProperty('--preview-width', `${Math.max(0, end - start)}%`);
        budget.style.setProperty('--preview-limit', `${Math.min(100, Math.max(0, (limitPosition - start) / (end - start) * 100) || 0)}%`);
        budget.classList.toggle('previewing', Boolean(preview));
        const tripPrice = price + getHotelTotal(getHotel());
        total.textContent = tripPrice ? fmt(tripPrice) : 'до ' + fmt(FLIGHT_LIMIT + getHotelLimitTotal());
      }

      function renderSidebar() {
        const outF = getOutFlight();
        const retF = getRetFlight();
        const hotel = getHotel();
        const nights = getNights();
        const dest = getDestObj();
        const proj = getProjectObj();

        const fTotal = getFlightsTotal();
        const hTotal = getHotelTotal(hotel);
        const hLimit = getHotelLimitTotal();
        const total = getTripTotal();
        const overrun = getOverrunInfo();

        const readyToSubmit = Boolean(outF && retF && hotel);

        let ctaText = 'Отправить на согласование';
        let ctaAction = 'submit-trip';
        let ctaDisabled = !readyToSubmit;

        if (!outF || !retF) {
          ctaText = state.step === 2 ? (outF ? 'Выберите обратный рейс' : 'Выберите рейс туда') : 'Выбрать авиабилеты';
          ctaAction = 'go-step-2';
          ctaDisabled = state.step === 2;
        } else if (state.step === 2 || !hotel) {
          ctaText = state.step === 2 ? 'Перейти к отелям' : 'Выберите отель';
          ctaAction = 'go-step-3';
          ctaDisabled = state.step === 3;
        } else if (state.step === 3) {
          ctaText = 'Перейти к сводке';
          ctaAction = 'go-step-5';
        }

        const flightTip = `Ориентир компании для ${esc(dest.genitive)} — до ${fmt(FLIGHT_LIMIT)} туда и обратно.`;
        const hotelTip = `Ориентир для ${esc(dest.genitive)} — до ${fmt(HOTEL_NIGHT_LIMIT)} за ночь (${fmt(hLimit)} за ${pluralNights(nights)}).`;

        if (state.step === 2 || state.step === 3) return `
          <aside class="side-col flight-side">
            <div class="flight-side-group">
            <div class="budget-card flight-budget">
              <h2 class="bc-title">Бюджет на поездку</h2>
              <div class="thermo-list">
                ${renderThermostat('flight', 'Авиабилеты', fTotal, FLIGHT_LIMIT, flightTip)}
                ${overrun.flightOver ? '<p class="budget-overline">Лимит на авиабилеты превышен</p>' : ''}
                ${renderThermostat('hotel', 'Отель', hTotal, hLimit, hotelTip)}
                ${overrun.hotelOver ? '<p class="budget-overline">Лимит на отель превышен</p>' : ''}
              </div>
            </div>
            <div class="side-total total-row"><span>Итого</span><strong data-flight-total>${total ? fmt(total) : 'до ' + fmt(FLIGHT_LIMIT + hLimit)}</strong></div>
            </div>
            <div class="flight-side-group">
            <div class="flight-approval">
              <h2 class="bc-title">Согласование</h2>
              <div class="approval-line"><span>Проект</span>${renderProjectTrigger(proj, '')}</div>
              <div class="approval-line"><span>Согласует поездку</span><strong>${esc(proj.manager)}</strong></div>
            </div>
            <div class="side-reassurance${overrun.hasOver ? ' over' : ''}">
              ${overrun.hasOver ? `${icon('budget-alert',24)}<span>Потребуется пояснение превышения лимита</span>` : `${icon('approval',24)}<span>Все по кайфу</span>`}
            </div>
            </div>
            <button type="button" class="btn-primary btn-full" data-action="${ctaAction}" ${ctaDisabled ? 'disabled' : ''}>
              ${!outF || !retF ? 'Выберите билеты' : ctaText}
            </button>
          </aside>`;

        return `
          <aside class="side-col">
            <div class="budget-card">
              <h2 class="bc-title">Бюджет и согласование</h2>
              ${renderProjectTrigger(proj, 'project-pill')}
              <div class="thermo-list">
                ${renderThermostat('flight', 'Авиабилеты', fTotal, FLIGHT_LIMIT, flightTip)}
                ${renderThermostat('hotel', 'Отель', hTotal, hLimit, hotelTip)}
              </div>

              <div class="total-block">
                <div class="total-row">
                  <span class="total-label">Итого</span>
                  <span class="total-sum">${total > 0 ? fmt(total) : 'до ' + fmt(FLIGHT_LIMIT + hLimit)}</span>
                </div>

              </div>

              <div class="approval-block">
                <div class="approver-row">
                  ${icon('manager',24)}
                  <div>
                    <div class="approver-name"><small>Согласует</small><br>${esc(proj.manager)}</div>
                    <div class="approver-sub ${overrun.hasOver ? 'over' : ''}">
                      ${overrun.hasOver
                        ? `Согласует поездку и превышение +${fmt(overrun.totalOver)}`
                        : 'Стандартное согласование поездки'}
                    </div>
                  </div>
                </div>

                <button type="button" class="btn-primary btn-full" data-action="${ctaAction}" ${ctaDisabled ? 'disabled' : ''}>
                  ${ctaText}
                </button>
              </div>
            </div>
          </aside>
        `;
      }

      function renderStep4() {
        const outF = getOutFlight();
        const retF = getRetFlight();
        const hotel = getHotel();
        const proj = getProjectObj();
        const total = getTripTotal();
        const overrun = getOverrunInfo();

        return `
          <div class="status-shell">
            <section class="status-card">
              <div class="confirmation-head">
                <span class="approval-pill">На согласовании</span>
                <h1 class="status-h1">Заявка отправлена</h1>
                <div class="confirmation-lock">${ICON.lock}<div><strong>Билеты и отель ещё не куплены</strong>
                  <p>Цена сейчас ${fmt(total)}. ${state.autoBuy ? 'Оплатим с бюджета проекта после одобрения.' : 'После одобрения попросим подтвердить покупку.'}</p></div></div>
              </div>

              <div class="tracker">
                <div class="t-row">
                  <div class="t-rail">
                    <div class="t-node done">${ICON.check}</div>
                    <div class="t-stem"></div>
                  </div>
                  <div class="t-content">
                    <div class="t-title">Заявка создана</div>
                    <div class="t-sub">${esc(state.origin)} → ${esc(state.dest)} · ${getShortDates()}</div>
                  </div>
                </div>

                <div class="t-row">
                  <div class="t-rail">
                    <div class="t-node active">${ICON.dot}</div>
                    <div class="t-stem"></div>
                  </div>
                  <div class="t-content">
                    <div class="t-title">Согласование · ${esc(proj.manager)}</div>
                    <div class="t-sub">
                      ${overrun.hasOver
                        ? `В процессе · включая превышение +${fmt(overrun.totalOver)}`
                        : 'В процессе · стандартное согласование поездки'}
                    </div>
                    ${overrun.hasOver ? `<div class="t-quote">«${esc(state.reason.trim())}»</div>` : ''}
                  </div>
                </div>

                <div class="t-row">
                  <div class="t-rail">
                    <div class="t-node next">3</div>
                  </div>
                  <div class="t-content" style="padding-bottom:0;">
                    <div class="t-title muted">
                      ${state.autoBuy ? 'Автоматическая покупка' : 'Ваше подтверждение и покупка вручную'}
                    </div>
                    <div class="t-sub">
                      ${state.autoBuy
                        ? 'Пришлём билеты и ваучер после оплаты'
                        : 'После одобрения пришлём уведомление, чтобы вы проверили и подтвердили покупку'}
                    </div>
                  </div>
                </div>
              </div>

              <div class="status-summary">
                <div>
                  <div class="ss-k">Маршрут и даты</div>
                  <div class="ss-v">${esc(state.origin)} → ${esc(state.dest)} · ${esc(getShortDates())}</div>
                </div>
                <div>
                  <div class="ss-k">Проект и оплата</div>
                  <div class="ss-v">${esc(proj.name)} · чеки не нужны</div>
                </div>
                <div>
                  <div class="ss-k">Билеты</div>
                  <div class="ss-v">${outF.depart}→${outF.arrive}, ${retF.depart}→${retF.arrive} · ${fmt(getFlightsTotal())}</div>
                </div>
                <div>
                  <div class="ss-k">Гостиница · ${pluralNights(getNights())}</div>
                  <div class="ss-v">${esc(hotelName(hotel))} · ${fmt(getHotelTotal(hotel))}</div>
                </div>
              </div>

              <div class="status-actions">
                <button type="button" class="btn-secondary" data-action="back-to-edit">
                  Отозвать и изменить
                </button>
                <button type="button" class="btn-primary" data-action="new-trip">
                  Новая командировка
                </button>
              </div>
            </section>
          </div>
        `;
      }

      let timePicker = null;
      const wheelRow = 36;
      const wheelAngle = Math.PI / 9;
      const wheelRadius = wheelRow / 2 / Math.tan(wheelAngle / 2);
      const twoDigits = value => String(value).padStart(2, '0');

      function connectTimeWheel(element, initial, count) {
        const rows = Array.from(element.querySelectorAll('span'));
        const wrap = value => (value % count + count) % count;
        let position = initial;
        let destination = initial;
        let frame;
        let wheelTimer;
        let drag;

        function paint(value) {
          position = value;
          const center = Math.round(position);
          const selected = wrap(center);
          element.setAttribute('aria-valuenow', selected);
          element.setAttribute('aria-valuetext', twoDigits(selected));
          rows.forEach((row, index) => {
            const offset = center + index - 3 - position;
            const angle = offset * wheelAngle;
            const scale = .8 + .2 * Math.cos(angle);
            row.textContent = twoDigits(wrap(center + index - 3));
            row.style.transform = `translateY(${Math.sin(angle) * wheelRadius}px) scale(${scale})`;
            row.style.opacity = Math.max(0, 1 - Math.abs(offset) * .29);
          });
        }

        function cancelMotion() {
          cancelAnimationFrame(frame);
          clearTimeout(wheelTimer);
        }

        function snap(target, velocity = 0) {
          cancelMotion();
          destination = target;
          const from = position;
          if (motionPreference.matches || Math.abs(target - from) < .001) {
            paint(target);
            return;
          }

          const started = performance.now();
          const displacement = from - target;
          const isFlick = velocity !== 0;
          function tick(now) {
            const elapsed = (now - started) / 1000;
            // The flick uses the reference's 140 stiffness and 24 damping.
            const delta = isFlick
              ? (displacement + (velocity + 10 * displacement) * (1 - Math.exp(-4 * elapsed)) / 4) * Math.exp(-10 * elapsed)
              : displacement * Math.exp(-14 * elapsed) * (Math.cos(13 * elapsed) + 14 / 13 * Math.sin(13 * elapsed));
            if (elapsed >= (isFlick ? 1.2 : .4) || (isFlick && elapsed > .35 && Math.abs(delta) < .005)) {
              paint(target);
              return;
            }
            paint(target + delta);
            frame = requestAnimationFrame(tick);
          }
          frame = requestAnimationFrame(tick);
        }

        element.addEventListener('wheel', event => {
          event.preventDefault();
          cancelMotion();
          const units = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1;
          paint(position + event.deltaY * units * .4 / wheelRow);
          destination = Math.round(position);
          wheelTimer = setTimeout(() => snap(Math.round(position)), 120);
        }, {passive:false});

        element.addEventListener('keydown', event => {
          const shifts = {ArrowUp:1, ArrowDown:-1, PageUp:5, PageDown:-5};
          if (Object.hasOwn(shifts, event.key)) {
            event.preventDefault();
            snap(destination + shifts[event.key]);
          } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            snap(destination - wrap(destination) + (event.key === 'End' ? count - 1 : 0));
          }
        });

        element.addEventListener('pointerdown', event => {
          if (!event.isPrimary || event.button !== 0) return;
          cancelMotion();
          element.setPointerCapture(event.pointerId);
          drag = {id:event.pointerId, y:event.clientY, initial:position, samples:[[event.timeStamp, position]]};
        });

        element.addEventListener('pointermove', event => {
          if (!drag || drag.id !== event.pointerId) return;
          const distance = event.clientY - drag.y;
          if (!drag.moving && Math.abs(distance) < 4) return;
          drag.moving = true;
          paint(drag.initial - distance / wheelRow);
          drag.samples.push([event.timeStamp, position]);
          while (drag.samples.length > 2 && event.timeStamp - drag.samples[0][0] > 80) drag.samples.shift();
        });

        function release(event) {
          if (!drag || drag.id !== event.pointerId) return;
          const {moving, samples} = drag;
          drag = null;
          if (event.type === 'pointercancel') {
            snap(Math.round(position));
            return;
          }
          if (!moving) {
            const bounds = element.getBoundingClientRect();
            const ratio = (event.clientY - bounds.top - bounds.height / 2) / wheelRadius;
            const offset = Math.asin(Math.max(-1, Math.min(1, ratio))) / wheelAngle;
            snap(Math.round(position) + Math.round(offset));
            return;
          }
          const [start, first] = samples[0];
          const [end, last] = samples.at(-1);
          const velocity = end > start && event.timeStamp - end <= 80 ? (last - first) * 1000 / (end - start) : 0;
          if (Math.abs(velocity) < 2 || motionPreference.matches) snap(Math.round(position));
          else snap(Math.round(position + velocity * .32), velocity);
        }
        element.addEventListener('pointerup', release);
        element.addEventListener('pointercancel', release);
        paint(initial);
        return {value:() => wrap(drag ? Math.round(position) : destination), cancel:cancelMotion};
      }

      function closeTimePicker(restoreFocus = false) {
        if (!timePicker) return;
        const {element, anchor, dispose} = timePicker;
        timePicker = null;
        dispose();
        element.remove();
        anchor.setAttribute('aria-expanded', 'false');
        anchor.removeAttribute('aria-controls');
        anchor.classList.remove('open');
        if (restoreFocus) anchor.focus({preventScroll:true});
      }

      function openTimePicker(anchor) {
        if (!anchor) return;
        const element = document.createElement('section');
        element.id = 'meeting-time-picker';
        element.className = 'popover time-picker';
        element.dataset.popover = 'true';
        element.setAttribute('role', 'dialog');
        element.setAttribute('aria-label', 'Время встречи');
        const column = (name, max) => `<div class="wheel-column subtitle" tabindex="0" role="spinbutton" aria-label="${name}" aria-valuemin="0" aria-valuemax="${max}">${'<span aria-hidden="true"></span>'.repeat(7)}</div>`;
        element.innerHTML = `
          <div class="time-wheels">${column('Часы',23)}<span class="wheel-separator subtitle" aria-hidden="true">:</span>${column('Минуты',59)}</div>
          <div class="time-actions">
            <button type="button" class="btn-secondary" data-time-clear>Не важно</button>
            <button type="button" class="btn-primary" data-time-save>Готово</button>
          </div>`;
        document.body.append(element);
        const [hours, mins] = element.querySelectorAll('.wheel-column');
        const initial = getMeeting().minutes ?? 600;
        const hourWheel = connectTimeWheel(hours, Math.floor(initial / 60), 24);
        const minuteWheel = connectTimeWheel(mins, initial % 60, 60);
        const context = anchor.dataset.timeAnchor;
        anchor.setAttribute('aria-controls', element.id);
        anchor.setAttribute('aria-expanded', 'true');
        anchor.classList.add('open');

        function position() {
          if (!anchor.isConnected) {
            closeTimePicker();
            return;
          }
          const bounds = anchor.getBoundingClientRect();
          const maxLeft = document.documentElement.clientWidth - element.offsetWidth - 8;
          element.style.left = Math.max(8, Math.min(maxLeft, bounds.right - element.offsetWidth)) + 'px';
          const below = window.innerHeight - bounds.bottom - 8;
          const top = below >= element.offsetHeight ? bounds.bottom + 8 : bounds.top - element.offsetHeight - 8;
          element.style.top = Math.max(8, Math.min(window.innerHeight - element.offsetHeight - 8, top)) + 'px';
        }

        function commit(value) {
          closeTimePicker();
          state.meetingId = value;
          render();
          document.querySelector(`[data-time-anchor="${context}"]`)?.focus({preventScroll:true});
        }

        element.querySelector('[data-time-clear]').addEventListener('click', () => commit('any'));
        element.querySelector('[data-time-save]').addEventListener('click', () => commit(`${twoDigits(hourWheel.value())}:${twoDigits(minuteWheel.value())}`));
        window.addEventListener('resize', position);
        window.addEventListener('scroll', position, true);
        timePicker = {element, anchor, dispose() {
          hourWheel.cancel();
          minuteWheel.cancel();
          window.removeEventListener('resize', position);
          window.removeEventListener('scroll', position, true);
        }};
        position();
        hours.focus({preventScroll:true});
      }

      let journeyPosition = 0;
      let stopJourneyProgress = () => {};
      let setJourneyTarget = null;
      let journeyBackTimer = 0;

      function animateJourneyProgress(app) {
        const layer = app.querySelector('[data-journey-progress]');
        if (!layer) return;

        let target = Number(layer.dataset.journeyProgress);
        setJourneyTarget = next => { target = next; };
        const cap = Number(layer.dataset.journeyCap);
        const canvas = layer.querySelector('.journey-progress-canvas');
        const context = canvas.getContext('2d', {alpha:true});
        const W = 900;
        const H = 80;
        canvas.width = W;
        canvas.height = H;
        const image = context.createImageData(W, H);
        const pixels = image.data;
        // RGB stays the reference blue; alpha alone shapes the moving edge.
        for (let i = 0; i < pixels.length; i += 4) {
          const x = (i / 4) % W;
          pixels[i] = 38;
          pixels[i + 1] = 94 + Math.round(18 * x / W);
          pixels[i + 2] = 235;
        }
        let reducedMotion = motionPreference.matches;
        const start = Math.min(journeyPosition, cap);
        let current = reducedMotion ? target : start;
        let frame;
        let width = 0;
        const glyphs = [...app.querySelectorAll('.step-glyph')];
        let samples = [];

        function draw(now) {
          // Use the supplied low-pass interpolation so stage changes glide into place.
          const delta = Math.min(50, Math.max(0, now - (draw.lastNow || now)));
          draw.lastNow = now;
          if (reducedMotion) current = target;
          else current += (target - current) * (1 - Math.exp(-delta / 160));
          if (Math.abs(target - current) < .001) current = target;
          journeyPosition = current;

          const t = reducedMotion ? 0 : now * 0.00080;
          const visiblePosition = Math.min(current, cap);
          const limit = Math.max(0, visiblePosition) * W / 3;
          const completion = Math.max(0, Math.min(1, (visiblePosition - 2.84) / .16));
          const fullFill = completion * completion * (3 - 2 * completion);
          const tailAlpha = Math.round(fullFill * 255);
          for (let y = 0; y < H; y++) {
            const v = y / H;
            const edge = limit - 14
              - 15 * (0.5 + 0.5 * Math.sin(t + v * 3))
              - 8 * (0.5 + 0.5 * Math.cos(t * 0.71 - v * 4));
            const spread = 95 + 18 * Math.sin(t * 0.83 + v * 3);
            let x = 0;
            for (; x < W && x < edge - spread; x++) pixels[(y * W + x) * 4 + 3] = 255;
            for (; x < W && x < edge; x++) {
              const q = Math.max(0, Math.min(1, (edge - x) / spread));
              const alpha = q * q * (3 - 2 * q);
              pixels[(y * W + x) * 4 + 3] = Math.round((alpha * (1 - fullFill) + fullFill) * 255);
            }
            for (; x < W; x++) pixels[(y * W + x) * 4 + 3] = tailAlpha;
          }
          context.putImageData(image, 0, 0);
          glyphs.forEach((glyph, index) => {
            glyph.classList.toggle('on-fill', pixels[samples[index]] >= 155);
          });
          layer.style.setProperty('--journey-stop', `${width * visiblePosition / 3}px`);
        }

        function tick(now) {
          draw(now);
          frame = requestAnimationFrame(tick);
        }

        function resize() {
          width = layer.clientWidth;
          const left = layer.getBoundingClientRect().left;
          samples = glyphs.map(glyph => {
            const box = glyph.getBoundingClientRect();
            const x = Math.round((box.left + box.width / 2 - left) * W / Math.max(1,width));
            return (Math.floor(H / 2) * W + Math.max(0, Math.min(W - 1, x))) * 4 + 3;
          });
          draw(performance.now());
        }

        const observer = new ResizeObserver(resize);
        observer.observe(layer);
        function updateMotion() {
          cancelAnimationFrame(frame);
          reducedMotion = motionPreference.matches;
          if (motionPreference.matches) current = target;
          draw(performance.now());
          if (!motionPreference.matches) frame = requestAnimationFrame(tick);
        }

        resize();
        updateMotion();
        motionPreference.addEventListener('change', updateMotion);
        stopJourneyProgress = () => {
          cancelAnimationFrame(frame);
          observer.disconnect();
          motionPreference.removeEventListener('change', updateMotion);
        };
      }

      const previousProgress = new Map();
      let previousScreen = null;
      function animateProgress() {
        document.querySelectorAll('[data-speed]').forEach(el => {
          const key = el.dataset.speed;
          const to = el.style.getPropertyValue('--progress');
          const from = previousProgress.get(key) || '0%';
          previousProgress.set(key,to);
          if (to !== from && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
            el.animate([{width:from},{width:to}],{duration:900,easing:'cubic-bezier(.16,1,.3,1)'});
          }
        });
      }

      function startHero() {
        const element = document.querySelector('.hero-morph');
        if (!element) return;
        const cadence = 3700;
        const currentIndex = () => Math.floor((performance.now() - heroStart) / cadence);
        const phrase = index => 'Собираемся ' + HERO_PHRASES[index % HERO_PHRASES.length];
        const start = motionPreference.matches ? 0 : currentIndex();
        element.textContent = phrase(start);

        let morph;
        let timer;
        let index = start;
        const show = text => morph ? morph.update(text) : (element.textContent = text);
        const update = () => {
          const next = motionPreference.matches ? 0 : currentIndex();
          if (next !== index) show(phrase(index = next));
        };
        morphLibrary.then(library => {
          if (!library || !element.isConnected) return;
          morph = new library.TextMorph({element, locale:'ru', duration:720, ease:'cubic-bezier(.22,1,.36,1)'});
          morph.update(phrase(index));
        });
        const queue = () => {
          update();
          timer = setTimeout(queue, cadence - (performance.now() - heroStart) % cadence + 16);
        };
        queue();
        stopHero = () => {
          clearTimeout(timer);
          morph?.destroy();
        };
      }

      function navigateJourneyStep(next) {
        clearTimeout(journeyBackTimer);
        const commit = () => {
          if (next === 3) enterStep3();
          else {
            state.step = next;
            state.openPopover = null;
            state.infoTip = null;
          }
          render();
          window.scrollTo({ top: 0, behavior: motionPreference.matches ? 'instant' : 'smooth' });
        };
        const nextCap = next === 2 ? 1 : 2;
        if (next > 1 && next < state.step && !motionPreference.matches && setJourneyTarget && journeyPosition > nextCap + .025) {
          setJourneyTarget(nextCap);
          journeyBackTimer = setTimeout(commit, 520);
          return;
        }
        commit();
      }

      function render() {
        clearTimeout(journeyBackTimer);
        setJourneyTarget = null;
        stopJourneyProgress();
        stopJourneyProgress = () => {};
        closeTimePicker();
        stopHero();
        stopHero = () => {};
        const active = document.activeElement;
        const focusAttributes = active?.dataset?.action && Object.entries(active.dataset);
        const restoreFocus = () => {
          if (!focusAttributes || document.activeElement !== document.body) return;
          const focusable = Array.from(document.querySelectorAll('[data-action]:not(:disabled)'));
          const match = focusable.find(element => element.classList[0] === active.classList[0] &&
            focusAttributes.every(([name, value]) => element.dataset[name] === value));
          match?.focus({preventScroll: true});
        };
        const app = document.getElementById('app');

        if (state.step === 1) {
          journeyPosition = 0;
          previousProgress.clear();
          previousScreen = null;
          app.innerHTML = renderStep1();
          updateHotelMap(app);
          startHero();
          bindInputs();
          restoreFocus();
          return;
        }

        if (state.step === 4) {
          app.innerHTML = renderStep4();
          updateHotelMap(app);
          return;
        }

        const screen = state.step === 2 ? state.flightTab : String(state.step);
        const entering = previousScreen !== screen;
        previousScreen = screen;
        const workspaceHTML = state.step === 2 ? renderStep2() : state.step === 3 ? renderStep3() : renderReview();
        app.innerHTML = `
          <div class="workspace-grid ${state.step === 3 ? 'hotels-workspace' : ''}">
            <div class="main-col">
              ${renderStepsBar()}
              <div class="workspace-content ${entering ? 'entering' : ''}">${workspaceHTML}</div>
            </div>
            ${renderSidebar()}
          </div>
        `;

        animateJourneyProgress(app);
        updateHotelMap(app);
        animateProgress();
        if (state.hoverFlightId) refreshFlightBudgetPreview([...OUTBOUND_FLIGHTS, ...RETURN_FLIGHTS].find(f => f.id === state.hoverFlightId));
        bindInputs();
        restoreFocus();
      }

      function bindInputs() {
        const destInput = document.getElementById('dest-search-input');
        if (destInput) {
          destInput.focus();
          destInput.setSelectionRange(destInput.value.length, destInput.value.length);
          destInput.addEventListener('input', function (e) {
            state.destSearch = e.target.value;
            const box = document.getElementById('dest-list-box');
            if (box) box.innerHTML = renderDestItems();
          });
        }

        const goalInput = document.getElementById('goal-input');
        if (goalInput) {
          goalInput.addEventListener('input', function (e) {
            state.goal = e.target.value;
            const chips = document.querySelectorAll('#goal-chips .chip');
            chips.forEach((btn, idx) => {
              btn.classList.toggle('active', state.goal === GOAL_CHIPS[idx]);
            });
          });
        }

        const reasonArea = document.getElementById('reason-textarea');
        if (reasonArea) {
          reasonArea.addEventListener('input', function (e) {
            state.reason = e.target.value;
            if (state.reason.trim() && state.reasonError) {
              state.reasonError = false;
              reasonArea.classList.remove('error');
              reasonArea.setAttribute('aria-invalid', 'false');
              const err = document.getElementById('reason-err');
              if (err) err.style.display = 'none';
            }
            const chips = document.querySelectorAll('#reason-chips .overrun-chip');
            chips.forEach((btn, idx) => {
              btn.classList.toggle('active', state.reason === REASON_CHIPS[idx]);
            });
          });
        }
      }

      function previewFlight(card) {
        const nextId = card?.dataset.hoverFlight ?? null;
        if (state.step !== 2 || nextId === state.hoverFlightId) return;
        state.hoverFlightId = nextId;
        refreshFlightBudgetPreview([...OUTBOUND_FLIGHTS, ...RETURN_FLIGHTS].find(f => f.id === nextId));
        const container = document.getElementById('timeline-card');
        if (!container) return;
        const previous = container.querySelector('.seg-flight')?.offsetLeft;
        container.innerHTML = buildTimelineHTML();
        const segment = container.querySelector('.seg-flight');
        if (segment && previous !== undefined && !matchMedia('(prefers-reduced-motion: reduce)').matches)
          segment.animate([{transform:'translateX(' + (previous - segment.offsetLeft) + 'px)',opacity:.65},{transform:'none',opacity:1}],{duration:320,easing:'cubic-bezier(.2,.75,.2,1)'});

      }

      document.addEventListener('pointermove', e => {
        if (e.target.closest('.journey-step-shell')) previewFlight(null);
        const flight = e.target.closest('[data-hover-flight]');
        if (e.pointerType !== 'touch' && flight) previewFlight(flight);
      });
      document.addEventListener('focusin', e => {
        if (e.target.matches(':focus-visible')) previewFlight(e.target.closest('[data-hover-flight]'));
      });
      document.addEventListener('pointerout', e => {
        if (e.target.closest('[data-hover-flight]') && !e.relatedTarget?.closest?.('[data-hover-flight]')) {
          previewFlight(null);
        }
      });
      document.addEventListener('focusout', e => {
        if (e.target.closest('[data-hover-flight]') && !e.relatedTarget?.closest?.('[data-hover-flight]')) {
          previewFlight(document.querySelector('[data-hover-flight]:hover'));
        }
      });
      document.addEventListener('pointerleave', e => {
        if (e.target instanceof Element && e.target.matches('.flight-list')) previewFlight(null);
      }, true);

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && timePicker) {
          closeTimePicker(true);
          return;
        }
        if (e.key !== 'Escape' || (!state.openPopover && !state.infoTip)) return;
        const pop = state.openPopover;
        const tip = state.infoTip;
        state.openPopover = null;
        state.infoTip = null;
        render();
        document.querySelector(pop ? `[data-pop="${pop}"]` : `[data-tip="${tip}"]`)?.focus();
      });

      function clearTripSelections() {
        state.outFlightId = null;
        state.retFlightId = null;
        state.hoverFlightId = null;
        state.hotelId = null;
        state.hotelInspectId = null;
        state.hotelStop = false;
        state.hotelFilter = 'all';
        state.reason = '';
        state.reasonError = false;
      }

      document.addEventListener('click', function (e) {
        if (timePicker && !timePicker.element.contains(e.target) && !e.target.closest('[data-time-anchor]')) closeTimePicker();
        const insidePop = e.target.closest('[data-popover="true"]');
        const isPopTrigger = e.target.closest('[data-action="open-pop"], [data-action="toggle-tip"], [data-time-anchor]');
        const target = e.target.closest('[data-action]');

        if (!insidePop && !isPopTrigger && (state.openPopover || state.infoTip)) {
          state.openPopover = null;
          state.infoTip = null;
          if (!target) {
            render();
            return;
          }
        }

        if (!target) return;
        const action = target.getAttribute('data-action');

        if (action === 'help') {
          const [title, body, ...items] = HELP[target.dataset.id];
          const rows = items.filter((_, i) => i % 2 === 0).map((heading,i) =>
            `<div><strong>${esc(heading)}</strong><p>${esc(items[i * 2 + 1])}</p></div>`).join('');
          openDialog(esc(title), '<p class="help-intro">' + esc(body) + '</p><div class="help-rows">' + rows + '</div>');
        } else if (action === 'close-dialog') {
          document.getElementById('help-dialog').close();
        } else if (action === 'edit-meeting') {
          if (timePicker) {
            closeTimePicker(true);
            return;
          }
          if (state.openPopover || state.infoTip) {
            state.openPopover = null;
            state.infoTip = null;
            const context = target.dataset.timeAnchor;
            render();
            openTimePicker(document.querySelector(`[data-time-anchor="${context}"]`));
          } else {
            openTimePicker(target);
          }
        } else if (action === 'toggle-hotel-stop') {
          state.hotelStop = !state.hotelStop;
          render();
        } else if (action === 'toggle-timeline') {
          state.timelineCollapsed = !state.timelineCollapsed;
          render();
        } else if (action === 'inspect-hotel') {
          inspectHotel(target.dataset.id);
        } else if (action === 'hotel-filter') {
          state.hotelFilter = target.dataset.id;
          render();
        } else if (action === 'flight-details') {
          const f = [...OUTBOUND_FLIGHTS,...RETURN_FLIGHTS].find(item => item.id === target.dataset.id);
          openDialog(f.airline + ' · ' + f.depart + '–' + f.arrive, '<p>Прямой рейс · ' + f.duration + '</p><p>' + f.bag + ' · ' + fmt(f.price) + '</p>');
        } else if (action === 'open-pop') {
          const pop = target.getAttribute('data-pop');
          state.openPopover = state.openPopover === pop ? null : pop;
          state.destSearch = '';
          render();
        } else if (action === 'pick-origin') {
          if (state.origin !== target.dataset.val) clearTripSelections();
          state.origin = target.dataset.val;
          state.openPopover = null;
          render();
        } else if (action === 'pick-dest') {
          if (state.dest !== target.dataset.val) clearTripSelections();
          state.dest = target.dataset.val;
          state.searchError.dest = false;
          state.openPopover = !state.startDay ? 'dates' : null;
          render();
        } else if (action === 'cal-day') {
          const day = Number(target.getAttribute('data-day'));
          clearTripSelections();
          if (!state.startDay || (state.startDay && state.endDay)) {
            state.startDay = day;
            state.endDay = null;
          } else if (day > state.startDay) {
            state.endDay = day;
            state.searchError.dates = false;
            state.openPopover = null;
          } else {
            state.startDay = day;
            state.endDay = null;
          }
          render();
        } else if (action === 'pick-project') {
          state.project = target.getAttribute('data-val');
          state.openPopover = null;
          render();
          document.querySelector('[data-pop="project"]')?.focus({preventScroll:true});
        } else if (action === 'pick-goal') {
          state.goal = GOAL_CHIPS[Number(target.getAttribute('data-idx'))];
          render();
        } else if (action === 'quick-fill-anton') {
          if (state.origin !== 'Москва' || state.dest !== 'Казань' || state.startDay !== 12 || state.endDay !== 14) {
            clearTripSelections();
          }
          state.origin = 'Москва';
          state.dest = 'Казань';
          state.startDay = 14;
          state.endDay = 16;
          state.meetingId = '10:00';
          state.project = 'Мобильный банк';
          state.goal = 'Встреча с командой';
          state.searchError = { dest: false, dates: false };
          state.openPopover = null;
          render();
        } else if (action === 'find-tickets') {
          const destOk = Boolean(state.dest && state.dest !== state.origin);
          const datesOk = Boolean(state.startDay && state.endDay);
          if (!destOk || !datesOk) {
            state.searchError = { dest: !destOk, dates: !datesOk };
            state.openPopover = null;
            render();
            return;
          }
          state.searchError = { dest: false, dates: false };
          state.openPopover = null;
          state.step = 2;
          state.flightTab = 'out';
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (action === 'go-step') {
          const next = Number(target.getAttribute('data-step'));
          if (next > 1 && !isStep1Complete()) return;
          if (next >= 3 && (!getOutFlight() || !getRetFlight())) return;
          if (next === 5 && !getHotel()) return;
          navigateJourneyStep(next);
        } else if (action === 'go-step-2') {
          navigateJourneyStep(2);
        } else if (action === 'go-step-3') {
          if (getOutFlight() && getRetFlight()) navigateJourneyStep(3);
        } else if (action === 'go-step-5') {
          if (getOutFlight() && getRetFlight() && getHotel()) navigateJourneyStep(5);
        } else if (action === 'flight-tab') {
          const tab = target.getAttribute('data-tab');
          if (tab === 'ret' && !state.outFlightId) return;
          state.flightTab = tab;
          state.hoverFlightId = null;
          render();
        } else if (action === 'pick-out') {
          state.outFlightId = target.getAttribute('data-id');
          state.hoverFlightId = null;
          state.flightTab = 'ret';
          state.reasonError = false;
          render();
          document.querySelector('.dir-tab.active')?.focus({preventScroll: true});
        } else if (action === 'pick-ret') {
          state.retFlightId = target.getAttribute('data-id');
          state.hoverFlightId = null;
          state.reasonError = false;
          render();
        } else if (action === 'pick-hotel') {
          state.hotelId = target.getAttribute('data-id');
          state.hotelInspectId = state.hotelId;
          state.reasonError = false;
          render();
        } else if (action === 'toggle-tip') {
          const tip = target.getAttribute('data-tip');
          state.infoTip = state.infoTip === tip ? null : tip;
          render();
        } else if (action === 'pick-reason') {
          state.reason = REASON_CHIPS[Number(target.getAttribute('data-idx'))];
          state.reasonError = false;
          render();
        } else if (action === 'switch-alt') {
          state.hotelId = 'alt';
          state.reasonError = false;
          render();
        } else if (action === 'toggle-autobuy') {
          state.autoBuy = !state.autoBuy;
          render();
        } else if (action === 'submit-trip') {
          if (!getOutFlight() || !getRetFlight() || !getHotel()) return;
          const overrun = getOverrunInfo();
          if (overrun.hasOver && !state.reason.trim()) {
            state.reasonError = true;
            render();
            const area = document.getElementById('reason-textarea');
            if (area) area.focus();
            return;
          }
          state.reasonError = false;
          state.submittedTime = currentHHMM();
          state.step = 4;
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (action === 'back-to-edit') {
          state.step = 5;
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (action === 'new-trip') {
          state = createInitialState();
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });

      render();
    })();
