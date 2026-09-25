'use strict';
(() => {
  const config = window.SCAMVANTA_ANALYTICS_CONFIG || {};
  const id = config.measurementId;
  const configured = config.enabled === true && typeof id === 'string' && /^G-[A-Z0-9]+$/.test(id);
  const key = 'scamspotter.analytics-consent.v1';
  const protectedBrowser = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  const categories = ['Phishing emails','Text-message scams','Fake websites','Password security','Online shopping scams','Social engineering','Tech-support scams'];
  const modes = [...categories, 'Mixed challenge', 'Missed-scenario practice'];
  const lessons = ['overview','urgency','secrets','sender','domains','attachments','payments','offers','impersonation','procedures','verify'];
  const screens = ['home','categories','quiz','results','progress','learn','how','about'];
  let allowed = false, ready = false, loading = false, failed = false, queue = [], currentScreen = null;
  try { allowed = localStorage.getItem(key) === 'allowed'; } catch { /* In-memory choice only. */ }
  function permitted() { return configured && allowed && !protectedBrowser && !failed; }
  function gtag() { window.dataLayer.push(arguments); }
  // Only known enum values and bounded numbers can leave this boundary.
  function sanitize(name, p) {
    if (name === 'page_view' && screens.includes(p.screen)) return {page_title:`ScamVanta — ${p.screen}`, page_location:location.origin + location.pathname + '#' + p.screen, page_referrer:''};
    if (name === 'category_selected' && categories.includes(p.category)) return {category:p.category};
    if (name === 'scenario_answered' && categories.includes(p.category) && ['Beginner','Intermediate','Advanced'].includes(p.difficulty) && typeof p.correct === 'boolean') return {category:p.category,difficulty:p.difficulty,correct:p.correct ? 1 : 0};
    if (name === 'lesson_viewed' && lessons.includes(p.lesson)) return {lesson:p.lesson};
    if (name === 'retry_missed') return {};
    if (name === 'quiz_start' && modes.includes(p.category)) return {category:p.category};
    if (name === 'quiz_complete' && modes.includes(p.category) && Number.isInteger(p.score) && p.score >= 0 && p.score <= 1000000 && Number.isInteger(p.accuracy) && p.accuracy >= 0 && p.accuracy <= 100) return {category:p.category,score:p.score,accuracy:p.accuracy};
    return null;
  }
  function track(name, params = {}) {
    try {
      if (!permitted()) return;
      const clean = sanitize(name, params);
      if (!clean) return;
      if (ready) gtag('event', name, clean);
      else if (queue.length < 100) queue.push([name, clean]);
    } catch { /* Analytics must never interrupt training. */ }
  }
  function screen(route, topic) {
    const safe = screens.includes(route) ? route : 'home';
    const lesson = lessons.includes(topic) ? topic : 'overview';
    const signature = safe === 'learn' ? `${safe}/${lesson}` : safe;
    if (currentScreen === signature) return;
    currentScreen = signature;
    track('page_view', {screen:safe});
    if (safe === 'learn') track('lesson_viewed', {lesson});
  }
  function load() {
    if (!permitted() || loading || ready) return;
    loading = true;
    try {
      window.dataLayer = window.dataLayer || [];
      window.gtag = gtag;
      gtag('consent', 'default', {analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      gtag('js', new Date());
      gtag('config', id, {send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,
        cookie_expires:0,cookie_domain:location.hostname,cookie_path:location.pathname.replace(/[^/]*$/, ''),
        page_location:location.origin + location.pathname,page_referrer:'',page_title:'ScamVanta',ignore_referrer:true});
      const script = document.createElement('script');
      script.async = true;
      script.referrerPolicy = 'no-referrer';
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
      const timeout = setTimeout(() => { failed = true; queue = []; }, 10000);
      script.onload = () => {
        clearTimeout(timeout);
        if (!permitted()) return;
        ready = true;
        const pending = queue; queue = [];
        pending.forEach(([name, params]) => gtag('event', name, params));
      };
      script.onerror = () => { clearTimeout(timeout); failed = true; queue = []; };
      document.head.append(script);
    } catch { failed = true; queue = []; }
  }
  const status = document.getElementById('analytics-status');
  const accept = document.getElementById('analytics-allow');
  const decline = document.getElementById('analytics-decline');
  function update() {
    status.textContent = !configured ? 'Optional analytics is not configured. No analytics data is sent.' : protectedBrowser ? 'Analytics is off because your browser requests privacy.' : allowed ? 'Optional analytics is allowed. You can turn it off at any time.' : 'Optional analytics is off. You can choose to share usage statistics.';
    accept.hidden = !configured || protectedBrowser || allowed;
    decline.hidden = !configured || protectedBrowser || !allowed;
  }
  accept.addEventListener('click', () => {
    allowed = true; failed = false;
    try { localStorage.setItem(key, 'allowed'); } catch {}
    update(); load(); currentScreen = null;
    const [route, topic] = location.hash.slice(1).split('/'); screen(route, topic);
  });
  decline.addEventListener('click', () => {
    allowed = false; queue = [];
    window['ga-disable-' + id] = true;
    try { localStorage.setItem(key, 'denied'); } catch {}
    // Remove this integration's session cookies at its configured path.
    const path = location.pathname.replace(/[^/]*$/, '');
    for (const name of ['_ga', '_ga_' + String(id).slice(2)]) {
      document.cookie = `${name}=; Max-Age=0; path=${path}`;
      document.cookie = `${name}=; Max-Age=0; path=${path}; domain=${location.hostname}`;
    }
    location.reload();
  });
  window.addEventListener('storage', event => {
    if ((event.key === key || event.key === null) && event.newValue !== 'allowed' && allowed) {
      allowed = false; queue = []; window['ga-disable-' + id] = true; location.reload();
    }
  });
  window.ScamVantaAnalytics = Object.freeze({track, screen});
  update(); load();
})();
