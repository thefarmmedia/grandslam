/*
 * Grand Slam Entertainment — shared site data.
 * Single source of truth for operating hours and NAP (name/address/phone),
 * loaded by every page via <script src="/site-data.js"> BEFORE any script
 * that reads GS_HOURS_PERIODS / GS_BUSINESS / GS helper functions below.
 *
 * To change the seasonal schedule, edit GS_HOURS_PERIODS here only —
 * every page, the booking calendar, the homepage status badge, and all
 * schema on the site read from this file.
 */
(function(global){
  'use strict';

  var GS_BUSINESS = {
    name: 'Grand Slam Entertainment',
    streetAddress: '1000 Pat Nash Dr',
    addressLocality: 'Branson',
    addressRegion: 'MO',
    postalCode: '65616',
    addressCountry: 'US',
    phoneDisplay: '(417) 343-6540',
    phoneTel: '+14173436540',
    latitude: 36.6434,
    longitude: -93.2185,
    url: 'https://play-grandslam.com/'
  };

  // Seasonal hours. Each period covers a date range (inclusive) with the
  // days it's open (0=Sun..6=Sat) and the open/close time for those days.
  // An empty `days` array means fully closed for that whole date range.
  var GS_HOURS_PERIODS = [
    { start:'2026-07-01', end:'2026-08-16', days:[0,1,2,3,5,6], open:'12:00', close:'22:00', label:'July – August 16', hoursLabel:'Mon–Sun, 12pm–10pm (closed Thursdays)' },
    { start:'2026-08-17', end:'2026-09-10', days:[],            open:null,    close:null,    label:'August 17 – September 10', hoursLabel:'Closed' },
    { start:'2026-09-11', end:'2026-09-30', days:[5,6],         open:'18:00', close:'24:00', label:'September 11 – September 30', hoursLabel:'Fridays & Saturdays, 6pm–Midnight' },
    { start:'2026-10-01', end:'2026-10-31', days:[0,4,5,6],     open:'18:00', close:'23:00', label:'October', hoursLabel:'Thursday–Sunday, 6pm–11pm' }
  ];

  function pad2(n){ return n < 10 ? '0'+n : ''+n; }

  function todayStr(now){
    now = now || new Date();
    return now.getFullYear()+'-'+pad2(now.getMonth()+1)+'-'+pad2(now.getDate());
  }

  // Returns null if the date falls outside the published schedule,
  // { closed:true } if the date is within schedule but closed that day,
  // or { closed:false, open:'HH:MM', close:'HH:MM' } if open.
  function getDayHours(dateStr){
    if(!dateStr) return null;
    var period = GS_HOURS_PERIODS.filter(function(p){ return dateStr >= p.start && dateStr <= p.end; })[0];
    if(!period) return null;
    var day = new Date(dateStr+'T12:00:00').getDay();
    if(period.days.indexOf(day) === -1) return { closed:true };
    return { closed:false, open:period.open, close:period.close };
  }

  function timeToMin(t){ var p = t.split(':').map(Number); return p[0]*60+p[1]; }

  function formatTime12(t){
    var p = t.split(':').map(Number);
    var h = p[0] % 24, mm = p[1];
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12; if(h12 === 0) h12 = 12;
    return h12+':'+pad2(mm)+' '+ampm;
  }

  function timeSlots(open, close){
    var start = timeToMin(open), end = timeToMin(close);
    var slots = [];
    for(var m = start; m < end; m += 30) slots.push(m);
    return slots.map(function(m){
      var h = pad2(Math.floor(m/60) % 24), mm = pad2(m % 60);
      return { value: h+':'+mm, label: formatTime12(h+':'+mm) };
    });
  }

  // Current open/closed status for "today", derived the same way for
  // every page — no page should hardcode "Open Now" as static text.
  function getCurrentStatus(now){
    now = now || new Date();
    var dateStr = todayStr(now);
    var hours = getDayHours(dateStr);

    if(!hours){
      return { state:'unknown', label:'Reservations Open', detail:'See current schedule below.' };
    }
    if(hours.closed){
      return { state:'closed', label:'Closed Today', detail:'See current schedule below.' };
    }
    var nowMin = now.getHours()*60 + now.getMinutes();
    var openMin = timeToMin(hours.open), closeMin = timeToMin(hours.close);
    if(nowMin >= openMin && nowMin < closeMin){
      return { state:'open', label:'Open Now', detail:'Open until '+formatTime12(hours.close)+' today.' };
    }
    if(nowMin < openMin){
      return { state:'closed', label:'Opens Today at '+formatTime12(hours.open), detail:'' };
    }
    return { state:'closed', label:'Closed for the Day', detail:'See current schedule below.' };
  }

  global.GS_BUSINESS = GS_BUSINESS;
  global.GS_HOURS_PERIODS = GS_HOURS_PERIODS;
  global.GS_getDayHours = getDayHours;
  global.GS_timeSlots = timeSlots;
  global.GS_formatTime12 = formatTime12;
  global.GS_getCurrentStatus = getCurrentStatus;
  global.GS_pad2 = pad2;
})(window);
