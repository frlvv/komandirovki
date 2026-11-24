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
        ['13:10', '14:45', 'Аэрофлот', 9483]
      ]);
      const RETURN_FLIGHTS = flights('ret', [
        ['16:10', '17:45', 'Победа', 6240], ['18:50', '20:25', 'Аэрофлот', 9080],
        ['19:40', '21:15', 'Аэрофлот', 9200], ['21:10', '22:45', 'ЮТэйр', 8400]
      ]);
      const HOTELS = [
        { id: 'office', name: 'Отель у офиса', night: 6000, commuteShort: '5 мин пешком', commuteFull: '5 мин пешком до офиса', leaveOffset: 10, breakfast: true, x: 58, y: 29 },
        { id: 'alt', name: 'Отель Альтернатива', night: 4800, commuteShort: '25 мин на транспорте', commuteFull: '25 мин на транспорте до офиса', leaveOffset: 35, breakfast: true, x: 24, y: 66 },
        { id: 'plaza', name: 'Центр Плаза', night: 4500, commuteShort: '18 мин на транспорте', commuteFull: '18 мин на транспорте до офиса', leaveOffset: 28, breakfast: false, x: 78, y: 63 },
        { id: 'grand', name: 'Гранд Отель', night: 7500, commuteShort: '10 мин пешком', commuteFull: '10 мин пешком до офиса', leaveOffset: 15, breakfast: true, x: 37, y: 25 }
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

          openPopover: null, // 'origin' | 'dest' | 'dates' | 'meeting' | 'project' | null
          searchError: { dest: false, dates: false },

          flightTab: 'out', // 'out' | 'ret'
          outFlightId: null,
          retFlightId: null,
          hoverFlightId: null,
          hotelStop: false,
          hotelFilter: 'all',

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

      function getHotel() {
        return HOTELS.find(h => h.id === state.hotelId) || null;
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

      function renderStep1() {
        const datesText = getDatesLabel();
        const meeting = getMeeting();
        const proj = getProjectObj();
        const hasErr = state.searchError.dest || state.searchError.dates;

        return `
          <div class="start-shell ${isStep1Complete() ? 'has-trip' : ''}">
            <section class="start-hero" aria-labelledby="start-title">
              <div class="hero-copy">
                <h1 class="start-title" id="start-title">Собираемся в командировку</h1>
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
                  <span class="seg-val ${!datesText ? 'placeholder' : ''}">${datesText ? esc(datesText) : 'Туда — обратно'}</span>
                </button>
                ${state.openPopover === 'dates' ? renderCalendarPopover() : ''}
              </div>

              <div class="seg">
                <button type="button" class="seg-btn ${state.openPopover === 'meeting' ? 'open' : ''}" data-action="open-pop" data-pop="meeting" aria-expanded="${state.openPopover === 'meeting'}">
                  <span class="seg-label">В офисе к</span>
                  <span class="seg-val ${meeting.id === 'any' ? 'placeholder' : ''}">${esc(meeting.label)}</span>
                </button>
                ${state.openPopover === 'meeting' ? `
                  <div class="popover align-right" style="min-width:200px;" data-popover="true">
                    ${MEETING_OPTIONS.map(m => `
                      <button type="button" class="pop-item ${state.meetingId === m.id ? 'selected' : ''}" data-action="pick-meeting" data-id="${m.id}">
                        <span>${esc(m.label)}</span>
                      </button>
                    `).join('')}
                  </div>
                ` : ''}
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
                  ${state.openPopover === 'project' ? `
                    <div class="popover" style="width:100%;" data-popover="true">
                      ${PROJECTS.map(p => `
                        <button type="button" class="pop-item ${state.project === p.name ? 'selected' : ''}" data-action="pick-project" data-val="${esc(p.name)}">
                          <span>${esc(p.name)}</span>
                          <span style="font-size:12px; color:var(--ink-tertiary);">${esc(p.manager)}</span>
                        </button>
                      `).join('')}
                    </div>
                  ` : ''}
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

      function renderStepsBar() {
        const out = getOutFlight();
        const back = getRetFlight();
        const hotel = getHotel();
        const active = state.step === 5 ? 2 : state.step === 3 ? 1 : 0;
        const progress = state.step === 5 ? 100 : state.step === 3 ? (hotel ? 78 : 67) : out && back ? 56 : out ? 42 : 33.34;
        const steps = [
          [2, 'Билеты', [out?.depart, back?.depart].filter(Boolean).join(' · ') || 'Туда и обратно', false],
          [3, 'Проживание', hotel ? hotelName(hotel) : 'Не выбрано', !out || !back],
          [5, 'Сводка', 'Проверьте перед отправкой', !out || !back || !hotel]
        ];

        return `
          <div class="trip-heading">
            <h1>${esc(state.goal || 'Командировка')}</h1>
            <div class="trip-meta"><span>${icon('route')} ${esc(state.origin)} – ${esc(state.dest)}</span>
              <span>${icon('date')} ${getShortDates()}</span><span>${icon('stay')} ${pluralNights(getNights())}</span></div>
          </div>
          <nav class="steps-bar speed-steps" aria-label="Шаги командировки">
            <div class="speed-fill" data-speed="journey" style="--progress:${progress}%">${particleField}</div>
            ${steps.map(([stage,name,detail,disabled],i) => `
              <button class="step-card ${i <= active ? 'active' : ''}" type="button"
                data-action="go-step" data-step="${stage}" ${i === active ? 'aria-current="step"' : ''} ${disabled ? 'disabled' : ''}>
                <span class="sc-dot" aria-hidden="true">${i === 0 ? ICON.plane : i === 1 ? icon('stay',24) : icon('summary',24)}</span>
                <span><span class="sc-label">${name === 'Проживание' ? 'Проживание' : name}</span><span class="sc-value" title="${esc(detail)}">${esc(detail)}</span></span>
              </button>`).join('')}
          </nav>`;
      }

      function getArrival(flight) {
        if (!state.hotelStop) return flight.arrMin + TAXI_MINUTES;
        const hotel = getHotel();
        return flight.arrMin + 35 + 10 + (hotel ? hotel.leaveOffset - 5 : 15);
      }

      const weekdays = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
      const dayLabel = day => day + ' декабря, ' + weekdays[new Date(2026, 11, day).getDay()];

      function buildTimelineHTML() {
        const outbound = state.flightTab === 'out';
        const list = outbound ? OUTBOUND_FLIGHTS : RETURN_FLIGHTS;
        const flight = list.find(item => item.id === state.hoverFlightId) ||
          (outbound ? getOutFlight() : getRetFlight()) || list[outbound ? 1 : 0];
        const meeting = getMeeting().minutes;
        const office = getDestObj().office;
        const arrival = getArrival(flight);
        const leave = flight.depMin - AIRPORT_MINUTES - TAXI_MINUTES;
        const hasMeeting = outbound && office && meeting !== null;
        const balance = (hasMeeting ? meeting - arrival : leave - WORK_END);
        const start = outbound ? Math.min(420, Math.floor(flight.depMin / 30) * 30) : 8 * 60;
        const end = outbound ? Math.max(630, Math.ceil((Math.max(arrival, hasMeeting ? meeting : 0) + 15) / 30) * 30)
          : Math.max(22 * 60, Math.ceil((flight.arrMin + 15) / 60) * 60);
        const span = end - start;
        const tickStep = span > 300 ? (outbound ? 60 : 120) : 30;
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
        const closeMarkers = hasMeeting && Math.abs(pos(meeting) - pos(arrival)) < 16;
        const markerLeft = hasMeeting ? Math.min(pos(meeting) + (closeMarkers && arrival <= meeting ? 5 : 0), 92) : 0;
        const date = outbound ? state.startDay : state.endDay;

        return `
          <div class="tl-top">
            <h2 class="tl-title">Таймлайн на ${date} декабря</h2>
            <span class="tl-status ${(hasMeeting || !outbound) && balance < 0 ? 'late' : 'ok'}">${(hasMeeting || !outbound) && balance < 0 ? '!' : ICON.check} ${status}</span>
            ${outbound && office ? `<button class="tl-hotel-switch" type="button" data-action="toggle-hotel-stop" role="switch" aria-checked="${state.hotelStop}">
              <span class="switch ${state.hotelStop ? 'on' : ''}"><span class="switch-knob"></span></span>Завезти вещи в отель
            </button>` : ''}
          </div>
          <div class="journey-chart" aria-label="${flight.depart}–${flight.arrive}, ${status}">
            <div class="chart-badges">
              ${outbound && office ? `<span class="arrival-tag ${closeMarkers ? (arrival <= meeting ? 'edge-left' : 'edge-right') : ''}" style="left:${pos(arrival)}%">≈${clock(arrival)}</span>` : ''}
              ${hasMeeting ? `<button class="meeting-tag ${closeMarkers && arrival > meeting ? 'edge-left' : ''}" data-action="edit-meeting" type="button"
                style="left:${markerLeft}%">Встреча ${clock(meeting)} ${icon('edit')}</button>` :
                outbound && office ? '<button type="button" class="meeting-tag meeting-add" data-action="edit-meeting">Указать встречу</button>' : ''}
            </div>
            <div class="journey-track">
              ${tickTimes.map(time => `<i class="journey-rule" style="left:${pos(time)}%"></i>`).join('')}
              ${segments.filter(([from,to]) => to > from).map(([from,to,tone,label]) => `<span class="journey-segment seg-${tone}" style="left:${pos(from)}%;width:${pos(to)-pos(from)}%">${label}</span>`).join('')}
              ${outbound && office ? `<i class="arrival-dot" style="left:${pos(arrival)}%"></i>` : ''}
              ${hasMeeting ? `<i class="meeting-line" style="left:${pos(meeting)}%"></i>` : ''}
            </div>
            <div class="journey-axis" aria-hidden="true">${tickTimes.map((time,i) => `<span style="left:${pos(time)}%" class="${i === 0 ? 'first' : i === tickTimes.length - 1 && pos(time) > 95 ? 'last' : ''}">${clock(time)}</span>`).join('')}</div>
          </div>
          ${stop ? '<p class="hotel-stop-note">Если приедете до заселения, уточните хранение багажа у отеля.</p>' : ''}`;
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
                    <span class="fc-duration"><span>В пути ${f.duration}</span><span>Прямой</span></span>
                    <span class="fc-end"><strong class="fc-time">${f.arrive}</strong><span class="fc-city">${airportCodes[end] || '—'}</span></span>
                  </div>
                  <div class="fc-airline"><img class="airline-logo" src="./assets/airline-${airlineLogos[f.airline]}.svg" width="54" height="24" alt="">${f.airline}<span class="fc-bag">${f.bag} ${icon('bag',20)}</span></div>
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
        return `<section class="review-card">
          <h2>Сводка поездки</h2>
          <div class="review-row"><div><strong>Билеты туда и обратно</strong><p>${esc(state.origin)} – ${esc(state.dest)} · ${getShortDates()}</p><p>${out.depart}–${out.arrive} и ${back.depart}–${back.arrive}</p></div>
            <div><b>${fmt(getFlightsTotal())}</b><button class="text-action" data-action="go-step" data-step="2">Изменить</button></div></div>
          <div class="review-row"><div><strong>${esc(hotelName(hotel))}</strong><p>${pluralNights(getNights())} · ${hotel.commuteFull}</p></div>
            <div><b>${fmt(getHotelTotal(hotel))}</b><button class="text-action" data-action="go-step" data-step="3">Изменить</button></div></div>
          <div class="review-row"><div><strong>Проект и согласование</strong><p>${esc(getProjectObj().name)} · ${esc(getProjectObj().manager)}</p></div></div>
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

      function renderHotelHeader() {
        const out = getOutFlight();
        const back = getRetFlight();
        const hotel = getHotel();
        const meeting = getMeeting();
        return `<header class="hotel-heading"><h1>Отели в ${esc(getDestObj().locative)}</h1><p>${getShortDates()} · ${pluralNights(getNights())}</p></header>
          <nav class="hotel-stages" aria-label="Шаги командировки">
            <button class="hotel-stage" data-action="go-step" data-step="1"><small>${ICON.check} Маршрут</small><strong>${esc(state.origin)} → ${esc(state.dest)}</strong>
              <span>${getShortDates()} · ${pluralNights(getNights())}${meeting.minutes !== null ? ' · В офисе к ' + meeting.short : ''}</span></button>
            <button class="hotel-stage" data-action="go-step" data-step="2"><small>${ICON.check} Билеты</small><strong>Туда · ${out.depart}–${out.arrive}</strong><span>Обратно · ${back.depart}–${back.arrive} · 2 из 2</span></button>
            <div class="hotel-stage current"><small>${icon('stay')} Отель</small><strong>${hotel ? esc(hotelName(hotel)) : 'Выберите отель'}</strong>
              <span>${hotel ? esc(hotel.commuteFull) + ' · ' : ''}Заезд ${state.startDay} декабря · выезд ${state.endDay} декабря</span></div>
            <div class="hotel-stage-rail"><span class="speed-fill" data-speed="hotel-stage" style="--progress:${hotel ? 86 : 66.66}%">${particleField}</span></div>
          </nav>`;
      }

      function renderStep3() {
        const dest = getDestObj();
        const nights = getNights();
        const hLimit = getHotelLimitTotal();
        const activeHotel = getHotel() || HOTELS[0];
        const shownHotels = HOTELS.filter(h => state.hotelFilter === 'all' || (state.hotelFilter === 'limit' && getHotelTotal(h) <= hLimit) || (state.hotelFilter === 'near' && h.leaveOffset <= 15) || (state.hotelFilter === 'breakfast' && h.breakfast));
        const activeTotal = getHotelTotal(activeHotel);
        const chosenHotel = getHotel();

        return `
          <div class="hotel-filters">${[['all','Все отели'],['limit','В лимите'],['near','До 10 мин от офиса'],['breakfast','С завтраком']].map(([id,label])=>`<button type="button" class="chip ${state.hotelFilter === id ? 'active' : ''}" data-action="hotel-filter" data-id="${id}" aria-pressed="${state.hotelFilter === id}">${label}</button>`).join('')}</div>
          <div class="hotels-split">
            <div class="hotel-list">
              ${shownHotels.map(h => {
                const isSelected = state.hotelId === h.id;
                const total = getHotelTotal(h);
                const over = total > hLimit ? total - hLimit : 0;
                const tone = over > 0 ? 'over' : 'in';

                return `
                  <button type="button" class="hotel-card ${isSelected ? 'selected' : ''}" data-action="pick-hotel" data-id="${h.id}" aria-pressed="${isSelected}">
                    <span class="hc-top"><span><strong class="hc-name">${hotelName(h)}</strong>
                      <small class="hc-sub">${h.id === 'grand' ? '★★★★★' : '★★★★'} · ${h.breakfast ? 'Завтрак включён' : 'Без завтрака'}</small></span>
                      <span class="hc-cost"><strong>${fmt(h.night)} / ночь</strong><small class="hc-sub">${fmt(total)} за ${pluralNights(nights)}</small></span></span>
                    <span class="hc-bottom"><span>${dest.office ? h.commuteFull : 'Отель в городе'}</span><span class="${tone}">${over > 0 ? '+' + fmt(over) + ' к лимиту' : 'В лимите'}</span></span>
                  </button>
                `;
              }).join('')}
            </div>

            <section class="map-shell" aria-label="Карта отелей">
              <div class="map-canvas">
                <img class="map-art" src="./assets/kazan-map.svg" width="414" height="460" alt="">
                ${dest.office && chosenHotel ? `<svg class="map-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line
                  x1="52" y1="42" x2="${activeHotel.x}" y2="${activeHotel.y}" stroke="#dd9315" stroke-width=".5" stroke-dasharray="1.4 1.4"/></svg>` : ''}
                ${dest.office ? `<div class="map-office">
                  <span>Офис Т-Банка</span>
                </div>` : ''}

                ${shownHotels.map(h => {
                  const isSelected = state.hotelId === h.id;
                  const isOver = getHotelTotal(h) > hLimit;
                  const tone = isOver ? 'over' : 'in';
                  return `
                    <button
                      type="button"
                      class="map-pin ${tone} ${isSelected ? 'selected' : ''}"
                      style="left:${h.x}%; top:${h.y}%;"
                      data-action="pick-hotel"
                      data-id="${h.id}"
                      aria-label="${hotelName(h)}, ${fmt(h.night)} за ночь"
                      aria-pressed="${isSelected}"
                    >
                      ${fmt(h.night)}
                    </button>
                  `;
                }).join('')}

              </div>
              <p class="map-caption">Расположение условное</p>
              <div class="map-overlay-card"><div><div class="moc-title">Заезд с 14:00 · выезд до 12:00</div>
                <div class="moc-sub">${getOutFlight() && dest.office ? 'Если поедете через отель, будете там около ' + toTime(getOutFlight().arrMin + 35) + '. Хранение багажа до заезда нужно уточнить.' : 'Уточните хранение багажа, если приедете до заселения.'}</div>
              </div></div>
            </section>
          </div>
        `;
      }

      function renderThermostat(id, label, current, limit, tooltipText) {
        const LIMIT_POS = 75;
        let inPct = 0;
        let overPct = 0;
        if (current > 0) {
          if (current <= limit) {
            inPct = (current / limit) * LIMIT_POS;
          } else {
            inPct = LIMIT_POS;
            const excessRatio = (current - limit) / limit;
            overPct = Math.min(25, Math.max(6, excessRatio * 55));
          }
        }
        const isOver = current > limit;
        const isOpen = state.infoTip === id;

        return `
          <div class="thermo-item">
            <div class="thermo-top">
              <div class="thermo-label-wrap">
                <span class="thermo-name">${label}</span>
                <button type="button" class="info-btn ${isOpen ? 'open' : ''}" data-action="toggle-tip" data-tip="${id}" aria-expanded="${isOpen}" aria-label="Подробнее об ориентире: ${label}">i</button>
              </div>
              ${current > 0
                ? `<span class="thermo-nums ${isOver ? 'over' : ''}">${fmt(current)} <span class="limit-muted">/ ${fmt(limit)}</span></span>`
                : `<span class="thermo-nums empty">до ${fmt(limit)}</span>`}
            </div>
            ${isOpen ? `<div class="info-tooltip" data-popover="true">${tooltipText}</div>` : ''}
            <div class="thermo-track">
              <div class="thermo-fill-in speed-meter" data-speed="${id}-in" style="--progress:${inPct}%">${particleField}</div>
              <div class="thermo-fill-over speed-meter" data-speed="${id}-over" style="--progress:${overPct}%">${particleField}</div>
              <div class="thermo-tick" style="left:${LIMIT_POS}%;"></div>
            </div>
          </div>
        `;
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

        const altTotal = 4800 * nights;
        const altSavings = hotel ? Math.max(0, hTotal - altTotal) : 0;

        const readyToSubmit = Boolean(outF && retF && hotel);

        let ctaText = 'Отправить на согласование';
        let ctaAction = 'submit-trip';
        let ctaDisabled = !readyToSubmit;

        if (!outF || !retF) {
          ctaText = state.step === 2 ? (outF ? 'Выберите обратный рейс' : 'Выберите рейс туда') : 'Выбрать авиабилеты';
          ctaAction = 'go-step-2';
          ctaDisabled = state.step === 2;
        } else if (state.step === 2 || !hotel) {
          ctaText = 'Выбрать отель';
          ctaAction = 'go-step-3';
          ctaDisabled = state.step === 3;
        } else if (state.step === 3) {
          ctaText = 'Перейти к сводке';
          ctaAction = 'go-step-5';
        }

        const flightTip = `Ориентир компании для ${esc(dest.genitive)} — до ${fmt(FLIGHT_LIMIT)} туда и обратно.`;
        const hotelTip = `Ориентир для ${esc(dest.genitive)} — до ${fmt(HOTEL_NIGHT_LIMIT)} за ночь (${fmt(hLimit)} за ${pluralNights(nights)}).`;

        if (state.step === 2) return `
          <aside class="side-col flight-side">
            <div class="budget-card flight-budget">
              <h2 class="bc-title">Бюджет на поездку</h2>
              <div class="thermo-list">
                ${renderThermostat('flight', 'Авиабилеты', fTotal, FLIGHT_LIMIT, flightTip)}
                ${renderThermostat('hotel', 'Отель', hTotal, hLimit, hotelTip)}
              </div>
            </div>
            <div class="side-total total-row"><span>Итого</span><strong>${total ? fmt(total) : 'до ' + fmt(FLIGHT_LIMIT + hLimit)}</strong></div>
            <div class="flight-approval"><h2 class="bc-title">Согласование</h2>
              <div class="approval-line"><span>Проект</span><button type="button" data-action="edit-project">${esc(proj.name)} ${icon('edit')}</button></div>
              <div class="approval-line"><span>Согласует поездку</span><strong>${esc(proj.manager)}</strong></div>
            </div>
            <div class="side-reassurance">${icon('approval',24)} ${overrun.hasOver ? 'Есть превышение лимита' : 'Все по кайфу'}</div>
            <button type="button" class="btn-primary btn-full" data-action="${ctaAction}" ${ctaDisabled ? 'disabled' : ''}>
              ${!outF || !retF ? 'Выберите билеты' : ctaText}
            </button>
          </aside>`;

        return `
          <aside class="side-col">
            <div class="budget-card">
              <h2 class="bc-title">Бюджет и согласование</h2>
              <div class="project-pill">${esc(proj.name)}</div>
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

              ${overrun.hasOver ? `
                <div class="overrun-box">
                  <div class="overrun-head">Выше ориентира на ${fmt(overrun.totalOver)}</div>
                  <div class="overrun-sub">Объясните выбор руководителю</div>

                  <div class="overrun-chips" id="reason-chips">
                    ${REASON_CHIPS.map((c, idx) => `
                      <button type="button" class="overrun-chip ${state.reason === c ? 'active' : ''}" data-action="pick-reason" data-idx="${idx}">
                        ${esc(c)}
                      </button>
                    `).join('')}
                  </div>

                  <textarea
                    id="reason-textarea"
                    class="reason-area ${state.reasonError ? 'error' : ''}"
                    rows="2"
                    aria-label="Обоснование превышения лимита"
                    aria-invalid="${state.reasonError}"
                    placeholder="Комментарий для руководителя"
                  >${esc(state.reason)}</textarea>

                  <div id="reason-err" class="reason-err" role="alert" style="display:${state.reasonError ? 'block' : 'none'};">
                    Укажите причину превышения для руководителя
                  </div>

                  ${overrun.hotelOver > 0 && altSavings > 0 ? `
                    <button type="button" class="replace-alt-btn" data-action="switch-alt">
                      Выбрать «Альтернативу» в лимите (−${fmt(altSavings)})
                    </button>
                  ` : ''}
                </div>
              ` : ''}

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

                <div class="toggle-box">
                  <div>
                    <div class="toggle-title">Купить после одобрения</div>
                    <div class="toggle-desc">
                      ${state.autoBuy
                        ? 'Оплатим с бюджета проекта'
                        : 'После одобрения вернём заявку для ручного подтверждения'}
                    </div>
                  </div>
                  <button type="button" class="switch ${state.autoBuy ? 'on' : ''}" data-action="toggle-autobuy" role="switch" aria-checked="${state.autoBuy}" aria-label="Купить после одобрения">
                    <span class="switch-knob"></span>
                  </button>
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

      function render() {
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
          previousProgress.clear();
          previousScreen = null;
          app.innerHTML = renderStep1();
          bindInputs();
          restoreFocus();
          return;
        }

        if (state.step === 4) {
          app.innerHTML = renderStep4();
          return;
        }

        const screen = state.step === 2 ? state.flightTab : String(state.step);
        const entering = previousScreen !== screen;
        previousScreen = screen;
        const workspaceHTML = state.step === 2 ? renderStep2() : state.step === 3 ? renderStep3() : renderReview();
        app.innerHTML = `
          ${state.step === 3 ? renderHotelHeader() : ''}
          <div class="workspace-grid ${state.step === 3 ? 'hotels-workspace' : ''}">
            <div class="main-col">
              ${state.step === 3 ? '' : renderStepsBar()}
              <div class="workspace-content ${entering ? 'entering' : ''}">${workspaceHTML}</div>
            </div>
            ${renderSidebar()}
          </div>
        `;

        animateProgress();
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
        const container = document.getElementById('timeline-card');
        if (!container) return;
        const previous = container.querySelector('.seg-flight')?.offsetLeft;
        container.innerHTML = buildTimelineHTML();
        const segment = container.querySelector('.seg-flight');
        if (segment && previous !== undefined && !matchMedia('(prefers-reduced-motion: reduce)').matches)
          segment.animate([{transform:'translateX(' + (previous - segment.offsetLeft) + 'px)',opacity:.65},{transform:'none',opacity:1}],{duration:320,easing:'cubic-bezier(.2,.75,.2,1)'});

      }

      document.addEventListener('mouseover', e => previewFlight(e.target.closest('[data-hover-flight]')));
      document.addEventListener('focusin', e => {
        if (e.target.matches(':focus-visible')) previewFlight(e.target.closest('[data-hover-flight]'));
      });
      document.addEventListener('mouseout', e => {
        if (e.target.closest('[data-hover-flight]') && !e.relatedTarget?.closest?.('[data-hover-flight]')) {
          previewFlight(null);
        }
      });
      document.addEventListener('keydown', e => {
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
        state.hotelStop = false;
        state.hotelFilter = 'all';
        state.reason = '';
        state.reasonError = false;
      }

      document.addEventListener('click', function (e) {
        const insidePop = e.target.closest('[data-popover="true"]');
        const isPopTrigger = e.target.closest('[data-action="open-pop"], [data-action="toggle-tip"]');
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
        } else if (action === 'edit-project') {
          openDialog('Проект', '<div class="help-rows">' + PROJECTS.map(p => `<button class="pop-item" data-action="pick-project" data-val="${esc(p.name)}">${esc(p.name)}<span>${esc(p.manager)}</span></button>`).join('') + '</div>');
        } else if (action === 'edit-meeting') {
          openDialog('Время встречи', `<label class="dialog-field">К которому часу быть в офисе
            <input type="time" id="meeting-time-edit" value="${getMeeting().short.match(/^\d\d:\d\d$/) ? getMeeting().short : '10:00'}" required></label>
            <button type="button" class="btn-primary" data-action="save-meeting">Сохранить</button>`);
        } else if (action === 'save-meeting') {
          const field = document.getElementById('meeting-time-edit');
          if (!field.reportValidity()) return;
          state.meetingId = field.value;
          document.getElementById('help-dialog').close();
          render();
        } else if (action === 'toggle-hotel-stop') {
          state.hotelStop = !state.hotelStop;
          render();
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
        } else if (action === 'pick-meeting') {
          state.meetingId = target.getAttribute('data-id');
          state.openPopover = null;
          render();
        } else if (action === 'pick-project') {
          document.getElementById('help-dialog').close();
          state.project = target.getAttribute('data-val');
          state.openPopover = null;
          render();
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
          if (next === 3) {
            enterStep3();
          } else {
            state.step = next;
            state.openPopover = null;
            state.infoTip = null;
          }
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (action === 'go-step-2') {
          state.step = 2;
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (action === 'go-step-3') {
          if (!getOutFlight() || !getRetFlight()) return;
          enterStep3();
          render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (action === 'go-step-5') {
          if (getOutFlight() && getRetFlight() && getHotel()) {
            state.step = 5;
            render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
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
