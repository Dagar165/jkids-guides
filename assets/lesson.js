// Общая логика лекций: прогресс чтения, подсветка раздела, задания, квиз и отчёт для Сергея.
// Подключается из guides/<slug>/index.html как ../../assets/lesson.js. Всё хранится только в этом браузере.
(function () {
  'use strict';
  var KEY = 'jkids:' + location.pathname;
  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { state = {}; }
  state.tasks = state.tasks || {};
  state.quiz = state.quiz || {};
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* приватный режим */ } }

  // Прогресс чтения
  var bar = document.querySelector('.progress span');
  function onScroll() {
    if (!bar) return;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? Math.min(100, h.scrollTop / max * 100) : 0) + '%';
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Подсветка текущего раздела в чипах
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chips a'));
  if ('IntersectionObserver' in window && chips.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        chips.forEach(function (c) {
          var on = c.getAttribute('href') === '#' + en.target.id;
          c.classList.toggle('on', on);
          if (on && c.scrollIntoView) c.parentNode.scrollTo({ left: c.offsetLeft - 16, behavior: 'smooth' });
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    chips.forEach(function (c) {
      var t = document.querySelector(c.getAttribute('href'));
      if (t) io.observe(t);
    });
  }

  // Задания
  var tasks = Array.prototype.slice.call(document.querySelectorAll('.task[data-id]'));
  tasks.forEach(function (t) {
    var box = t.querySelector('input[type=checkbox]');
    if (!box) return;
    box.checked = !!state.tasks[t.dataset.id];
    t.classList.toggle('done', box.checked);
    box.addEventListener('change', function () {
      state.tasks[t.dataset.id] = box.checked;
      t.classList.toggle('done', box.checked);
      save();
    });
  });

  // Квиз: <div class="q" data-answer="b"> ... <button data-v="a">…</button> ... <p class="explain" hidden>
  var qs = Array.prototype.slice.call(document.querySelectorAll('.q'));
  var scoreEl = document.querySelector('.score');
  function renderScore() {
    if (!scoreEl) return;
    var answered = 0, right = 0;
    qs.forEach(function (q, i) { if (state.quiz[i] != null) { answered++; if (state.quiz[i] === q.dataset.answer) right++; } });
    scoreEl.textContent = answered ? 'Верно ' + right + ' из ' + qs.length + (answered < qs.length ? ' (отвечено ' + answered + ')' : '') : '';
  }
  function reveal(q, picked) {
    q.querySelectorAll('button').forEach(function (b) {
      b.disabled = true;
      if (b.dataset.v === q.dataset.answer) b.classList.add('right');
      else if (b.dataset.v === picked) b.classList.add('wrong');
    });
    var ex = q.querySelector('.explain');
    if (ex) ex.hidden = false;
  }
  qs.forEach(function (q, i) {
    if (state.quiz[i] != null) reveal(q, state.quiz[i]);
    q.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.quiz[i] = b.dataset.v;
        save();
        reveal(q, b.dataset.v);
        renderScore();
      });
    });
  });
  renderScore();

  // Сброс квиза
  var reset = document.querySelector('[data-reset-quiz]');
  if (reset) reset.addEventListener('click', function () {
    state.quiz = {};
    save();
    qs.forEach(function (q) {
      q.querySelectorAll('button').forEach(function (b) { b.disabled = false; b.classList.remove('right', 'wrong'); });
      var ex = q.querySelector('.explain');
      if (ex) ex.hidden = true;
    });
    renderScore();
  });

  // Отчёт: собирает отмеченные задания и результат квиза, чтобы вставить в чат команды
  var report = document.querySelector('[data-report]');
  var toast = document.querySelector('.toast');
  if (report) report.addEventListener('click', function () {
    var title = document.querySelector('h1') ? document.querySelector('h1').textContent.trim() : document.title;
    var done = tasks.filter(function (t) { return state.tasks[t.dataset.id]; })
      .map(function (t) { return '✅ ' + t.querySelector('h3').textContent.trim(); });
    var right = qs.filter(function (q, i) { return state.quiz[i] === q.dataset.answer; }).length;
    var text = 'Лекция: ' + title + '\n' +
      'Квиз: ' + right + ' из ' + qs.length + '\n' +
      (done.length ? 'Сделал(а):\n' + done.join('\n') : 'Задания пока не отмечены') +
      '\nСсылки на результаты: ';
    function ok() { if (toast) toast.textContent = 'Скопировано. Вставь в чат команды и добавь ссылки на свои результаты.'; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, function () { prompt('Скопируй отчёт:', text); });
    } else { prompt('Скопируй отчёт:', text); }
  });
})();
