'use strict';
(() => {
  const KEY = 'scamspotter.v1';
  function analytics(name, params) {
    try { window.ScamVantaAnalytics?.track(name, params); } catch { /* Keep training available. */ }
  }
  const CATEGORIES = [
    ['Phishing emails', '✉', 'Look beyond the subject line.', 'sender'],
    ['Text-message scams', '▤', 'Think before you tap.', 'urgency'],
    ['Fake websites', '⌘', 'A familiar look can be deceiving.', 'domains'],
    ['Password security', '⚿', 'Keep the keys to your accounts safe.', 'secrets'],
    ['Online shopping scams', '▱', 'Know when a deal is a warning.', 'offers'],
    ['Social engineering', '♧', 'Recognize the pressure to trust.', 'impersonation'],
    ['Tech-support scams', '⚙', 'Tell real help from a harmful request.', 'procedures']
  ];
  const LESSONS = [
    ['urgency','Urgent or threatening language','Scammers try to make you act before you think. A deadline, account threat, or emergency is a reason to pause and verify.','Try this: step away from the message before deciding what to do.'],
    ['secrets','Requests for passwords or verification codes','Keep passwords, recovery codes, and login approvals private. A person asking for a code may be trying to enter your account or authorize a payment.','Try this: approve only sign-ins you initiated and understand.'],
    ['sender','Suspicious sender addresses','A display name can be copied. Inspect the full address and compare it with a known contact, but remember that even a real account can be compromised.','Try this: verify an unexpected request through another trusted channel.'],
    ['domains','Look-alike domains','Read the whole address. Extra words and look-alike letters can hide a different destination. A padlock means the connection is encrypted; it does not prove the site is honest.','Example: school.example.org.accounts.example.net belongs under example.net.'],
    ['attachments','Unexpected attachments','An attachment may contain harmful software or a fake sign-in form. Familiar-looking names and file icons are not a guarantee of safety.','Try this: confirm unexpected files with the sender using contact details you already know.'],
    ['payments','Unusual payment methods','Requests for gift-card codes, cryptocurrency, or off-platform transfers deserve extra caution. These methods may provide limited ways to recover money.','Try this: check the actual purchase-protection terms before paying.'],
    ['offers','Offers that seem too good to be true','Huge discounts, surprise prizes, and easy jobs can be bait. Check the details, the seller, and the conditions independently.','Try this: research beyond reviews displayed on the seller’s own page.'],
    ['impersonation','Impersonation of trusted people or companies','Names, logos, photos, caller labels, and even voices can be copied or manipulated. Familiarity alone is not verification.','Try this: call the person back using a number you already have.'],
    ['procedures','Pressure to bypass normal procedures','Be wary of demands to keep secrets, disable protection, install remote access, or skip normal approval and payment steps.','Try this: ask a trusted teacher, colleague, or support team before proceeding.'],
    ['verify','Verify a message independently','Use an existing bookmark, an official app, a number on your card or bill, or contact information in original records. Avoid the contact details supplied in the suspicious message.','Try this: open a fresh route to the organization instead of replying or following the link.']
  ];
  const DISCLAIMER = 'ScamVanta is an independent educational project. All scenarios, names, messages, and addresses are fictional and are provided for educational purposes only. Never interact with a suspicious message or link. Verify concerns through an organization’s official website or phone number.';
  const main = document.getElementById('main');
  const data = window.SCENARIOS;
  const byId = new Map();
  let state, lastSaved = null, storageAvailable = true;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function append(parent, ...children) { children.forEach(child => parent.append(child)); return parent; }
  function button(text, callback, kind = '') {
    const node = el('button', `button ${kind}`, text);
    node.type = 'button'; node.addEventListener('click', callback); return node;
  }
  function link(text, route, kind = '') { const a = el('a', kind, text); a.href = `#${route}`; return a; }
  function notice(text) { const box = document.getElementById('storage-notice'); box.textContent = text; box.hidden = false; }
  function hideNotice() { document.getElementById('storage-notice').hidden = true; }
  function validText(value) { return typeof value === 'string' && value.trim().length > 0; }
  function validateScenarios() {
    if (!Array.isArray(data) || data.length < 30) throw Error('At least 30 scenarios are required.');
    for (const s of data) {
      if (!s || !validText(s.id) || !/^[a-z0-9-]+$/.test(s.id) || byId.has(s.id) ||
          !CATEGORIES.some(c => c[0] === s.category) ||
          !['Beginner','Intermediate','Advanced'].includes(s.difficulty) ||
          !['title','format','message','explanation','action'].every(k => validText(s[k])) ||
          !Array.isArray(s.options) || s.options.length < 2 || s.options.length > 4 || !s.options.every(validText) ||
          new Set(s.options).size !== s.options.length || !Number.isInteger(s.correct) || s.correct < 0 || s.correct >= s.options.length ||
          !Array.isArray(s.warnings) || !s.warnings.length || !s.warnings.every(validText)) throw Error(`Invalid scenario: ${s && s.id}`);
      byId.set(s.id, s);
    }
    if (!CATEGORIES.every(c => data.some(s => s.category === c[0]))) throw Error('Every category needs scenarios.');
  }
  const fresh = () => ({version:1,theme:'dark',history:[],session:null});
  const validChoice = a => a && byId.has(a.id) && Number.isInteger(a.choice) && a.choice >= 0 && a.choice < byId.get(a.id).options.length;
  /* Scores are derived from validated answer records, never trusted from storage.
     The session's answers must agree with its history to prevent duplicate awards. */
  function validateState(value) {
    if (!value || value.version !== 1 || !['dark','light'].includes(value.theme) || !Array.isArray(value.history)) throw Error('Invalid saved progress');
    const seen = new Set();
    for (const answer of value.history) {
      if (!validChoice(answer) || !validText(answer.run) || seen.has(`${answer.run}/${answer.id}`)) throw Error('Invalid answer record');
      seen.add(`${answer.run}/${answer.id}`);
    }
    const s = value.session;
    if (s !== null) {
      if (!s || !validText(s.id) || !validText(s.label) || !Array.isArray(s.ids) || !s.ids.length ||
          !s.ids.every(id => byId.has(id)) || new Set(s.ids).size !== s.ids.length ||
          !Array.isArray(s.orders) || s.orders.length !== s.ids.length ||
          !Number.isInteger(s.index) || s.index < 0 || s.index > s.ids.length || !Array.isArray(s.answers) ||
          !(s.answers.length === s.index || (s.index < s.ids.length && s.answers.length === s.index + 1))) throw Error('Invalid session');
      s.orders.forEach((order,i) => {
        const count = byId.get(s.ids[i]).options.length;
        if (!Array.isArray(order) || order.length !== count || new Set(order).size !== count ||
            !order.every(n => Number.isInteger(n) && n >= 0 && n < count)) throw Error('Invalid option order');
      });
      if (!s.answers.every((a,i) => validChoice(a) && a.id === s.ids[i])) throw Error('Invalid session answers');
      const records = value.history.filter(a => a.run === s.id);
      if (records.length !== s.answers.length || !records.every((a,i) => a.id === s.answers[i].id && a.choice === s.answers[i].choice)) throw Error('Session/history mismatch');
    }
    return value;
  }
  function readState() {
    let raw;
    try { raw = localStorage.getItem(KEY); storageAvailable = true; }
    catch { storageAvailable = false; notice('Browser storage is unavailable. You can train, but progress and theme changes will last only until this page closes.'); return state || fresh(); }
    lastSaved = raw;
    if (!raw) return fresh();
    try { return validateState(JSON.parse(raw)); }
    catch { notice('Saved progress could not be read safely. A fresh training record is ready. Other browser data has not been changed.'); return fresh(); }
  }
  function save() {
    try { const raw = JSON.stringify(state); localStorage.setItem(KEY,raw); lastSaved = raw; storageAvailable = true; }
    catch { storageAvailable = false; notice('Progress could not be saved in this browser. You can keep training in this tab; avoid reloading if you want to keep this session.'); }
  }
  // Recheck before mutations so a second tab cannot award an already-recorded answer.
  function syncBeforeChange() {
    if (!storageAvailable) return false;
    try {
      if (localStorage.getItem(KEY) !== lastSaved) {
        state = readState(); applyTheme(); render();
        notice('Progress changed in another tab. This view has been refreshed; please make your choice again.'); return true;
      }
    } catch { storageAvailable = false; }
    return false;
  }
  function stats(answers) {
    const result = {total:answers.length,correct:0,score:0,streak:0,best:0,categories:{}};
    let lastRun = null;
    CATEGORIES.forEach(c => { result.categories[c[0]] = {total:0,correct:0}; });
    answers.forEach(a => {
      if (a.run && a.run !== lastRun) result.streak = 0;
      lastRun = a.run;
      const scenario = byId.get(a.id), correct = a.choice === scenario.correct;
      const category = result.categories[scenario.category]; category.total++;
      if (correct) { result.correct++; category.correct++; result.streak++; result.score += 100 + Math.min(result.streak - 1,5) * 10; }
      else result.streak = 0;
      result.best = Math.max(result.best,result.streak);
    });
    result.accuracy = result.total ? Math.round(result.correct / result.total * 100) : 0;
    return result;
  }
  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
    return result;
  }
  function unfinished() { return state.session && state.session.index < state.session.ids.length; }
  function go(route) { if (location.hash === `#${route}`) render(); else location.hash = route; }
  function confirmAction(title, description, actionText, callback) {
    const dialog = document.getElementById('confirm-dialog');
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-description').textContent = description;
    const accept = document.getElementById('confirm-accept'); accept.textContent = actionText;
    accept.onclick = () => { dialog.close(); callback(); };
    document.getElementById('confirm-cancel').onclick = () => dialog.close();
    dialog.showModal(); document.getElementById('confirm-cancel').focus();
  }
  function resetProgress() {
    confirmAction('Reset all progress?', 'This deletes your scores, completed scenarios, current session, and theme preference from this browser. It cannot be undone.', 'Reset Progress', () => {
      state = fresh(); save(); if (storageAvailable) hideNotice(); applyTheme(); go('home');
    });
  }
  function startSession(category = null, retryIds = null) {
    if (syncBeforeChange()) return;
    const launch = () => {
      if (syncBeforeChange()) return;
      const pool = retryIds ? retryIds.map(id => byId.get(id)) : data.filter(s => !category || s.category === category);
      // Prefer unseen scenarios; after those, prefer the least recently encountered.
      // Shuffle first so scenarios with the same priority are not in source order.
      const lastSeen = new Map(); state.history.forEach((a,i) => lastSeen.set(a.id,i));
      let candidates = shuffle(pool).sort((a,b) => (lastSeen.get(a.id) ?? -1) - (lastSeen.get(b.id) ?? -1));
      const limit = retryIds ? pool.length : category ? Math.min(5,pool.length) : Math.min(10,pool.length);
      let selected = candidates.slice(0,limit);
      // Mixed sessions cover each category when possible, while still favoring fresh material.
      if (!category && !retryIds) {
        const representatives = CATEGORIES.map(c => candidates.find(s => s.category === c[0]));
        const ids = new Set(representatives.map(s => s.id));
        selected = [...representatives,...candidates.filter(s => !ids.has(s.id)).slice(0,limit - representatives.length)];
      }
      selected = shuffle(selected);
      const previous = state.history.at(-1)?.id;
      if (selected.length > 1 && selected[0].id === previous) [selected[0],selected[1]] = [selected[1],selected[0]];
      state.session = {id:`${Date.now()}-${Math.random().toString(36).slice(2)}`, label:retryIds ? 'Missed-scenario practice' : category || 'Mixed challenge', ids:selected.map(s => s.id), orders:selected.map(s => shuffle(s.options.map((_,i) => i))), index:0, answers:[]};
      save();
      if (category) analytics('category_selected', {category});
      if (retryIds) analytics('retry_missed');
      analytics('quiz_start', {category:state.session.label});
      go('quiz');
    };
    if (unfinished()) confirmAction('Start a new session?', 'Your answered questions stay in your overall progress. This replaces the unfinished session. Choose Cancel to keep it.', 'Start new session',launch);
    else launch();
  }
  function intro(kicker,title,description) {
    return append(el('div','page-intro'),el('div','eyebrow',kicker),el('h1','',title),el('p','',description));
  }
  function topicCard(category, launch = false) {
    const [name,symbol,description] = category;
    const card = el(launch ? 'button' : 'a','card topic-card');
    if (launch) { card.type = 'button'; card.style.textAlign = 'left'; card.addEventListener('click',() => startSession(name)); }
    else card.href = '#categories';
    append(card,el('span','symbol',symbol),el('span','arrow','↗'),el('h3','',name),el('p','',description),el('span','card-meta',`${data.filter(s => s.category === name).length} scenarios · all levels`)); return card;
  }
  function home() {
    const hero = el('section','hero'), copy = el('div');
    append(copy,el('div','eyebrow','Your instincts. A little sharper.'));
    const heading = el('h1'); append(heading,document.createTextNode('Can you spot the scam '),el('em','','before it spots you?'));
    append(copy,heading,el('p','intro','A convincing message. A tempting offer. Something feels off. Practice finding the warning signs in fictional digital situations—before they happen in real life.'));
    const actions = el('div','actions'); append(actions,link('Start Training  ↗','categories','button'));
    const resume = button('Continue',() => go('quiz'),'secondary'); resume.disabled = !unfinished();
    if (!unfinished()) resume.title = 'Start a session to save your progress.';
    append(actions,resume); append(copy,actions,el('p','micro','No account. No timer. Just better decisions.'));
    const demo = el('aside','demo'); demo.setAttribute('aria-label','Example scam message with a warning sign identified');
    append(demo,append(el('div','demo-top'),el('span','','SPOT THE SIGNAL'),el('span','','FICTIONAL EXAMPLE')));
    const body = el('div','demo-body');
    append(body,append(el('div','sender'),el('span','avatar','✉'),append(el('div'),el('strong','','Campus Account Team'),el('small','','security@campus-check.example.com'))),el('h3','','Your account is on hold.'));
    const demoText = el('p'); append(demoText,document.createTextNode('Confirm your password in the '),el('span','flag','next 15 minutes'),document.createTextNode(' or lose access to your student account.'));
    append(body,demoText,el('div','demo-url','campus-check.example.com/verify'));
    append(demo,body,append(el('div','demo-bottom'),el('b','','!'),el('span','','Urgency is a signal. Pause before you act.')));
    append(hero,copy,demo); main.append(hero);
    const facts = el('div','facts'); [['35','original scenarios'],['7','everyday scam categories'],['100%','account-free learning']].forEach(([n,t]) => append(facts,append(el('div','fact'),el('strong','',n === '35' ? String(data.length) : n),el('span','',t)))); main.append(facts);
    append(main,append(el('div','section-heading'),el('h2','','Small practice. Stronger instincts.'),link('Explore all 7 categories →','categories')));
    const grid = el('div','grid'); [CATEGORIES[0],CATEGORIES[2],CATEGORIES[5]].forEach(c => grid.append(topicCard(c))); main.append(grid);
    append(main,append(el('div','home-bottom'),append(el('div','actions'),link('How It Works','how','button secondary'),link('Learn the Warning Signs →','learn')),button('Reset Progress',resetProgress,'quiet')));
  }
  function categories() {
    main.append(intro('Training room','Choose your challenge.','Focus on one topic or mix things up. Take your time—there are no points for rushing.'));
    if (unfinished()) append(main,append(el('div','card mixed-card'),append(el('div'),el('h3','','Your session is waiting'),el('p','',`${state.session.label} · ${state.session.answers.length} of ${state.session.ids.length} answered`)),button('Continue',() => go('quiz'),'secondary')));
    append(main,append(el('div','card mixed-card'),append(el('div'),el('div','eyebrow','A little of everything'),el('h2','','Mixed challenge'),el('p','','10 scenarios across all 7 categories. A fresh chance to sharpen your instincts.')),button('Start mixed challenge ↗',() => startSession())));
    const grid = el('div','grid'); CATEGORIES.forEach(c => grid.append(topicCard(c,true))); main.append(grid);
  }
  function submitAnswer(choice) {
    if (syncBeforeChange()) return;
    const s = state.session;
    if (!s || s.index >= s.ids.length || s.answers.length !== s.index) return;
    const answer = {id:s.ids[s.index],choice};
    if (!validChoice(answer)) return;
    s.answers.push(answer); state.history.push({...answer,run:s.id}); save();
    const scenario = byId.get(answer.id);
    analytics('scenario_answered', {category:scenario.category,difficulty:scenario.difficulty,correct:choice === scenario.correct});
    render(false);
    const feedback = document.getElementById('feedback'); feedback.focus(); feedback.scrollIntoView({block:'nearest'});
  }
  function nextQuestion() {
    if (syncBeforeChange()) return;
    const s = state.session;
    if (!s || s.answers.length !== s.index + 1) return;
    s.index++; save();
    if (s.index === s.ids.length) {
      const totals = stats(s.answers);
      analytics('quiz_complete', {category:s.label,score:totals.score,accuracy:totals.accuracy});
      go('results');
    } else render();
  }
  function quiz() {
    const session = state.session;
    if (!session) { categories(); return; }
    if (!unfinished()) { results(); return; }
    const s = byId.get(session.ids[session.index]), answer = session.answers[session.index], totals = stats(session.answers);
    const wrap = el('div','quiz-wrap');
    append(wrap,append(el('div','session-bar'),el('h1','',session.label),append(el('div','score-row'),append(el('span','','Score '),el('strong','',totals.score)),append(el('span','','Streak '),el('strong','',`${totals.streak} in a row`))),link('Save & leave','home','button quiet')));
    append(wrap,append(el('div','progress-label'),el('span','',`Question ${session.index + 1} of ${session.ids.length}`),el('span','',`${session.answers.length} answered`)));
    const progress = el('progress'); progress.max = session.ids.length; progress.value = session.answers.length; progress.setAttribute('aria-label','Session completion'); wrap.append(progress);
    append(wrap,append(el('div','badges'),el('span','badge',s.category),el('span','badge',s.difficulty)),el('h2','quiz-title',s.title));
    append(wrap,append(el('section','message'),append(el('div','message-label'),el('span','',s.format),el('span','','Fictional training scenario')),el('p','message-text',s.message)));
    const prompt = el('h3','question-label','What is the safest response?'); prompt.id = 'answer-prompt'; wrap.append(prompt);
    const choices = el('div','answers'); choices.setAttribute('role','group'); choices.setAttribute('aria-labelledby','answer-prompt');
    session.orders[session.index].forEach((choice,i) => {
      const option = el('button','answer'); option.type = 'button'; option.dataset.number = i + 1;
      const key = el('span','key',i + 1); key.setAttribute('aria-hidden','true');
      append(option,key,el('span','',s.options[choice]));
      option.addEventListener('click',() => submitAnswer(choice));
      if (answer) {
        option.disabled = true;
        if (choice === s.correct) { option.classList.add('correct'); option.lastChild.append(el('small','',answer.choice === choice ? '✓ Your answer · Best response' : '✓ Best response')); }
        else if (choice === answer.choice) { option.classList.add('incorrect'); option.lastChild.append(el('small','','× Your answer · Not the safest response')); }
      }
      choices.append(option);
    });
    append(wrap,choices,el('p','quiz-help','Use Tab and Enter, or press 1–4 to answer. Choosing an answer submits it. No time limit.'));
    if (answer) {
      const correct = answer.choice === s.correct;
      const feedback = el('section','feedback'); feedback.id = 'feedback'; feedback.tabIndex = -1; feedback.setAttribute('aria-labelledby','feedback-title');
      const title = el('h2','',correct ? `✓ Well spotted! +${100 + Math.min(totals.streak - 1,5) * 10} points` : '× Not quite. Here’s what to look for.'); title.id = 'feedback-title';
      append(feedback,title);
      if (!correct) feedback.append(el('p','',`The safest response is: ${s.options[s.correct]}`));
      append(feedback,el('p','',s.explanation),el('h3','','Warning signs'));
      const warnings = el('ul'); s.warnings.forEach(w => warnings.append(el('li','',w))); feedback.append(warnings);
      append(feedback,el('h3','','Your safer next step'),el('p','safe-action',s.action),append(el('div','actions'),button(session.index === session.ids.length - 1 ? 'See results →' : 'Next →',nextQuestion)));
      wrap.append(feedback);
    }
    main.append(wrap);
  }
  function statCards(items) { const grid = el('div','stats-grid'); items.forEach(([value,label]) => grid.append(append(el('div','stat'),el('strong','',String(value)),el('span','',label)))); return grid; }
  function performance(totals) {
    const panel = el('section','card'); panel.append(el('h2','','By category'));
    CATEGORIES.forEach(([name]) => {
      const c = totals.categories[name], row = el('div','performance-row');
      append(row,append(el('div','performance-label'),el('strong','',name),el('span','',c.total ? `${c.correct}/${c.total} correct` : 'Not tried')));
      const bar = el('progress'); bar.max = c.total || 1; bar.value = c.correct; bar.setAttribute('aria-label',`${name}: ${c.correct} correct out of ${c.total}`); row.append(bar); panel.append(row);
    }); return panel;
  }
  function recommendations(totals) {
    const panel = el('section','card'); panel.append(el('h2','','Your next step'));
    const weak = CATEGORIES.filter(c => totals.categories[c[0]].total && totals.categories[c[0]].correct < totals.categories[c[0]].total).sort((a,b) => {
      const x = totals.categories[a[0]], y = totals.categories[b[0]]; return x.correct/x.total - y.correct/y.total;
    }).slice(0,3);
    if (!weak.length) panel.append(el('p','',totals.total ? 'Strong work. Keep practicing different situations, and revisit independent verification—it helps across every category.' : 'Start with a mixed challenge to discover which topics you would benefit from practicing.'));
    else {
      panel.append(el('p','','Start with these topics, based on your missed responses:'));
      const list = el('ul'); weak.forEach(c => list.append(append(el('li'),link(c[0],`learn/${c[3]}`)))); panel.append(list);
    }
    panel.append(link('Learn the Warning Signs →','learn')); return panel;
  }
  function results() {
    const s = state.session;
    if (!s) { categories(); return; }
    if (unfinished()) { quiz(); return; }
    const totals = stats(s.answers), missed = s.answers.filter(a => a.choice !== byId.get(a.id).correct);
    main.append(intro('Session complete',totals.accuracy >= 80 ? 'Your instincts are getting sharper.' : 'Every mistake is a useful signal.',`${s.label} · You answered ${totals.correct} correctly and ${missed.length} incorrectly. Take what you learned into your next challenge.`));
    main.append(statCards([[totals.score,'Total score'],[`${totals.accuracy}%`,'Accuracy'],[totals.best,'Best streak'],[`${totals.total}/${s.ids.length}`,'Questions answered']]));
    append(main,append(el('div','split'),performance(totals),recommendations(totals)),el('h2','','Review missed scenarios'));
    if (!missed.length) main.append(el('p','empty','No missed scenarios this time. Nicely spotted!'));
    missed.forEach(a => {
      const scenario = byId.get(a.id), details = el('details'), body = el('div','detail-body');
      append(details,el('summary','',`${scenario.title} · ${scenario.category}`));
      append(body,el('p','message-text',scenario.message),el('p','',`Your answer: ${scenario.options[a.choice]}`),el('p','',`Best response: ${scenario.options[scenario.correct]}`),el('p','',scenario.explanation));
      const list = el('ul'); scenario.warnings.forEach(w => list.append(el('li','',w)));
      append(body,el('h3','','Warning signs'),list,el('p','safe-action',scenario.action)); append(details,body); main.append(details);
    });
    const actions = el('div','actions');
    const retry = button('Retry missed scenarios',() => startSession(null,missed.map(a => a.id)),'secondary'); retry.disabled = !missed.length;
    append(actions,retry,button('New mixed challenge',() => startSession()),link('Return home','home','button secondary')); main.append(actions);
  }
  function progressPage() {
    const totals = stats(state.history), unique = new Set(state.history.map(a => a.id)).size;
    main.append(intro('Your learning record','Progress, one decision at a time.','Saved in this browser, on this device. Repeat attempts count toward your overall accuracy.'));
    main.append(statCards([[totals.total,'Scenarios completed'],[totals.total ? `${totals.accuracy}%` : '—','Overall accuracy'],[totals.best,'Best streak'],[`${unique}/${data.length}`,'Unique scenarios completed']]));
    if (!totals.total) main.append(el('p','empty','Your first decision starts your learning record. Choose a category to begin.'));
    append(main,append(el('div','split'),performance(totals),recommendations(totals)));
    const actions = el('div','actions');
    if (unfinished()) actions.append(button('Continue',() => go('quiz')));
    else actions.append(link('Start Training','categories','button'));
    if (state.session && !unfinished()) actions.append(link('View last results','results','button secondary'));
    append(actions,button('Reset Progress',resetProgress,'quiet')); main.append(actions);
  }
  function learn(topic) {
    main.append(intro('Learn the warning signs','Pause. Look closer. Verify.','One clue is not always proof of a scam. Look at the whole situation, and independently check any request that puts your information, money, or account access at risk.'));
    const grid = el('div','grid learning-grid');
    LESSONS.forEach(([id,title,description,example],i) => {
      const card = el('section','card'); card.id = `lesson-${id}`; card.tabIndex = -1;
      append(card,el('span','number',String(i + 1).padStart(2,'0')),el('h2','',title),el('p','',description),el('p','example',example)); grid.append(card);
    }); main.append(grid);
    append(main,append(el('div','home-bottom'),link('Put it into practice ↗','categories','button'),link('How It Works','how')));
    if (topic) requestAnimationFrame(() => { const card = document.getElementById(`lesson-${topic}`); if (card) {card.focus(); card.scrollIntoView({block:'start'});} });
  }
  function how() {
    main.append(intro('The field guide','How It Works','A safe place to practice the decisions that matter.'));
    const section = el('section','prose'), list = el('ol');
    ['Choose a category for 5 questions, or a mixed challenge for 10. Mixed challenges include every category.','Read the fictional situation. Any address shown in a scenario is plain text, not a link.','Pick the safest response. Click an answer, use Tab then Enter, or press its number key. Your choice is submitted immediately.','Read the feedback and warning signs. Press Next when you are ready; nothing advances automatically.','Review your results, study recommended topics, and retry missed scenarios.'].forEach(t => list.append(el('li','',t)));
    append(section,list,el('h2','','Points for careful thinking'),el('p','','A correct answer earns 100 points. Consecutive correct answers add a bonus of 10, 20, 30, 40, then 50 points per answer. The bonus is capped at 50. An incorrect answer earns 0 and resets the streak. Each new session starts a new streak. Speed never changes your score.'),el('h2','','Pick up where you left off'),el('p','','Each answer and your place in the session are saved automatically when browser storage is available. Use Save & leave, then Continue. A saved answer stays locked after reloading so it cannot earn points twice. A new session replaces the current one only after confirmation.'),link('Start Training ↗','categories','button')); main.append(section);
  }
  function about() {
    main.append(intro('About ScamVanta','Practice for a more careful click.','An independent educational project for students and anyone learning to recognize online scams.'));
    const section = el('section','prose');
    append(section,el('h2','','Fictional situations. Practical habits.'),el('p','',DISCLAIMER),el('p','','This app is educational and cannot guarantee protection from every scam. New tactics emerge, and legitimate situations can sometimes look unusual. When unsure, pause and verify independently.'),el('h2','','Private by design'),el('p','','ScamVanta has no accounts or personal-information fields. Detailed answers, unfinished sessions, and theme preferences stay in localStorage. Optional Google Analytics sends limited usage events only when configured by the owner and allowed by you. These include answer correctness and numeric quiz results, not message text or saved history. Google processes browser and connection metadata and session cookies. See Optional usage statistics in the footer for details and controls. Training works without analytics.'),el('h2','','Made for different ways of learning'),el('p','','Use a keyboard, touch, or mouse. The app offers light and dark themes, visible focus indicators, reduced-motion support, and text labels alongside correct and incorrect colors. No timed questions.'),el('h2','','If you have already interacted with a scam'),el('p','','Stop communicating with the sender. Contact the affected organization through a trusted channel. If you shared a password, change it and any reused copies through official account settings. If money or card details were involved, contact your bank or payment provider promptly using known contact information.'),link('Learn the Warning Signs →','learn','button secondary')); main.append(section);
  }
  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    const target = state.theme === 'dark' ? 'light' : 'dark';
    document.getElementById('theme-label').textContent = `${target === 'light' ? 'Light' : 'Dark'} mode`;
    document.getElementById('theme-toggle').setAttribute('aria-label',`Switch to ${target} theme`);
    document.querySelector('meta[name="theme-color"]').content = state.theme === 'dark' ? '#0b1220' : '#f4f7fc';
  }
  function render(focus = true) {
    const [route,topic] = location.hash.slice(1).split('/');
    main.replaceChildren();
    const screens = {home, categories, quiz, results, progress:progressPage, learn:() => learn(topic), how, about};
    (screens[route] || home)();
    const name = {home:'Learn to spot online scams',categories:'Choose your challenge',quiz:'Training',results:'Your results',progress:'My progress',learn:'Learn the warning signs',how:'How it works',about:'About'};
    document.title = `ScamVanta — ${name[route] || name.home}`;
    try { window.ScamVantaAnalytics?.screen(route, topic); } catch { /* Keep navigation available. */ }
    document.querySelectorAll('#navigation a').forEach(a => { if (a.hash === `#${route}` || (route === 'quiz' && a.hash === '#categories')) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
    document.getElementById('navigation').classList.remove('open'); document.getElementById('menu-toggle').setAttribute('aria-expanded','false');
    if (focus) { main.focus(); window.scrollTo(0,0); }
  }
  try { validateScenarios(); }
  catch (error) { append(main,el('h1','','Training could not load'),el('p','','The scenario data is missing or invalid. Check scenarios.js against the instructions in README.md, then reload.')); console.error(error); return; }
  state = readState(); applyTheme();
  // Skip navigation without changing the hash-based application screen.
  document.querySelector('.skip').addEventListener('click',event => { event.preventDefault(); main.focus(); main.scrollIntoView({block:'start'}); });
  document.getElementById('theme-toggle').addEventListener('click',() => { if (syncBeforeChange()) return; state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyTheme(); save(); });
  document.getElementById('menu-toggle').addEventListener('click',() => { const open = document.getElementById('navigation').classList.toggle('open'); document.getElementById('menu-toggle').setAttribute('aria-expanded',String(open)); });
  document.addEventListener('keydown',event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat || document.getElementById('confirm-dialog').open || !['#quiz'].includes(location.hash) || !/^[1-4]$/.test(event.key)) return;
    if (event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    const choice = main.querySelector(`.answer[data-number="${event.key}"]:not(:disabled)`);
    if (choice) { event.preventDefault(); choice.click(); }
  });
  window.addEventListener('hashchange',() => render());
  window.addEventListener('storage',event => { if (event.key === KEY || event.key === null) { state = readState(); applyTheme(); render(); } });
  render(false);
})();
