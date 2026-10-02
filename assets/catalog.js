'use strict';
(() => {
  const legacy = /^#lesson-\d+(?:-block-\d+)?$/;
  if (legacy.test(location.hash)) {
    location.replace(new URL('guides/marketing/' + location.hash, location.href).href);
    return;
  }
  const cards = document.getElementById('materials');
  const search = document.getElementById('search');
  const count = document.getElementById('count');
  let items = [];
  function escape(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function normal(value) { return value.toLocaleLowerCase('ru').replace(/ё/g,'е'); }
  function valid(item) {
    return item && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) && typeof item.title==='string' && typeof item.description==='string' && Array.isArray(item.outcomes) && item.outcomes.every(x=>typeof x==='string') && Array.isArray(item.tags) && item.tags.every(x=>typeof x==='string') && item.path===`guides/${item.id}/` && /^\d{4}-\d{2}-\d{2}$/.test(item.added);
  }
  function render() {
    const terms = normal(search.value.trim()).split(/\s+/).filter(Boolean);
    const shown = items.filter(item => terms.every(term=>normal([item.title,item.description,...item.tags,...item.outcomes].join(' ')).includes(term)));
    count.textContent = shown.length===items.length ? `Методичек: ${items.length}` : `Найдено: ${shown.length} из ${items.length}`;
    cards.innerHTML = shown.map(item => `<article class="card"><div class="card-top"><span class="type guide">Методичка</span><span class="card-date">Добавлено ${escape(item.added.split('-').reverse().join('.'))}</span></div><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p><strong class="outcome-heading">Что будем тренировать</strong><ul class="outcomes">${item.outcomes.map(t=>`<li>${escape(t)}</li>`).join('')}</ul><div class="topics">${item.tags.map(tag=>`<span class="topic">${escape(tag)}</span>`).join('')}</div><div class="card-bottom"><span class="card-note">${escape(item.note||'Полный разбор и практика')}</span><a class="open" href="${escape(item.path)}" aria-label="Открыть: ${escape(item.title)}">Открыть →</a></div></article>`).join('') || `<p class="notice">${items.length ? 'По этому запросу пока нет материалов. Измени поисковый запрос.' : 'Первые материалы скоро появятся здесь.'}</p>`;
  }
  async function load() {
    cards.setAttribute('aria-busy','true');
    try {
      const response = await fetch('catalog.json',{cache:'no-cache'});
      if (!response.ok) throw new Error('Catalog request failed');
      const catalog = await response.json();
      if (catalog.version!==2 || !Array.isArray(catalog.items) || !catalog.items.every(valid)) throw new Error('Invalid catalog');
      items = catalog.items;
      render();
    } catch (_) {
      count.textContent = '';
      cards.innerHTML = '<div class="notice">Оглавление не загрузилось. Проверь соединение и попробуй ещё раз.<button class="retry" id="retry">Повторить</button><p><a href="guides/marketing/">Открыть маркетинг напрямую</a></p></div>';
      document.getElementById('retry').addEventListener('click',load);
    } finally { cards.setAttribute('aria-busy','false'); }
  }
  search.addEventListener('input',render);
  load();
})();
