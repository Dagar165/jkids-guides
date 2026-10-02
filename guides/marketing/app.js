'use strict';
(() => {
  const main = document.getElementById('main'), topics = document.getElementById('topics'), search = document.getElementById('search'), nav = document.getElementById('navigation');
  const groups = [{name:'Сначала: клиент и его выбор',ids:[1,2,4,5,6,7,8,9,10,11]}, {name:'Затем: материал и проверка',ids:[12,13,16,17,18]}, {name:'Дополнительные разборы',ids:[3,14,15]}, {name:'Источники и правила чтения',ids:[0,19]}];
  const order = groups.flatMap(g=>g.ids);
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = value => String(value).toLocaleLowerCase('ru').replace(/ё/g,'е');
  let source, learning;
  const instruction = id => learning.lessons.find(l=>l.id===id);
  const title = id => instruction(id)?.title || source[id].title;
  function navState(){ if (matchMedia('(min-width:761px)').matches) nav.open=true; }
  function renderNav() {
    const terms = norm(search.value.trim()).split(/\s+/).filter(Boolean);
    let count=0;
    topics.innerHTML = '<a href="#overview">Маршрут обучения и итоговая работа</a>' + groups.map(g=>{
      const links=g.ids.filter(id=>{
        const corpus=norm(JSON.stringify([source[id],instruction(id),id===17?learning.forms:[]]));
        return terms.every(t=>corpus.includes(t));
      }); count+=links.length;
      return links.length?`<p class="nav-group">${esc(g.name)}</p>`+links.map(id=>`<a href="#lesson-${id}" ${location.hash.match(/^#lesson-(\d+)/)?.[1]===String(id)?'aria-current="page"':''}>${esc(title(id))}${terms.length?'<small>Найдено в разделе</small>':''}</a>`).join(''):'';
    }).join('');
    if (!count) topics.innerHTML+='<p class="muted">Совпадений нет. Попробуй другое слово.</p>';
    document.getElementById('search-status').textContent=terms.length?`Разделов с совпадениями: ${count}`:'Полный разбор сохранён в каждом разделе';
  }
  function caseBlock(){return `<div class="case"><b>Общая учебная ситуация</b><p class="muted">Придумана для тренировки. Это не интервью, не данные о клиентах и не описание возможностей JKids.</p><blockquote>${esc(learning.case)}</blockquote></div>`;}
  function sourceBlocks(id){
    let lastRole='';
    const labels={theory:'Объяснение и разбор',example:'Случай из лекции',jkids:'Применение к JKids · адаптация',practice:'Рабочее применение · адаптация',source:'Источник и границы'};
    return source[id].blocks.map((b,i)=>{
      let label='';
      if(b.role!==lastRole && b.type!=='h'){label=`<p class="source-label">${esc(labels[b.role]||'Разбор')}</p>`;} lastRole=b.role;
      let body='';
      if(b.type==='h') body=`<h3>${esc(b.text)}</h3>`;
      else if(b.type==='table') body=`<div class="table-scroll" role="region" tabindex="0" aria-label="Таблица: ${esc(b.rows[0].join(', '))}"><table><thead><tr>${b.rows[0].map(x=>`<th scope="col">${esc(x)}</th>`).join('')}</tr></thead><tbody>${b.rows.slice(1).map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      else if(b.type==='list') body=`<ul>${b.items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
      else if(b.type==='form') body=`<div class="template">${esc(b.text)}</div><button class="button secondary" data-template="${id}:${i}">Скопировать пустой бланк</button>`;
      else body=`<p>${esc(b.text)}</p>`;
      return `${label}<div class="source-block ${esc(b.role||'')}" id="lesson-${id}-block-${i}">${body}</div>`;
    }).join('');
  }
  function forms(){return `<section class="panel" id="forms"><p class="eyebrow">Заполненные образцы · учебная адаптация</p><h2>Четыре формы: данные, решение и смысл полей</h2><p>Все образцы опираются на вымышленную историю выше. «Неизвестно» здесь означает запрос на данные. Эти брифы ещё нельзя считать готовыми к публикации или запуску.</p>${learning.forms.map((f,i)=>`<article class="form-example"><h3>${esc(f.title)}</h3><p>${esc(f.purpose)}</p>${f.rows.map(r=>`<div class="field"><strong>${esc(r[0])}</strong><div><p>${esc(r[1])}</p><small>Зачем поле: ${esc(r[2])}</small></div></div>`).join('')}<button class="button secondary" data-example="${i}">Скопировать заполненный образец</button></article>`).join('')}</section>`;}
  function criteria(items){return `<ul class="criteria">${items.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`;}
  function overview(){
    main.innerHTML=`<p class="eyebrow">Методичка для команды · маркетинг с основ</p><h1>От истории клиента<br>к обоснованному материалу</h1><p class="lead">Учимся понимать выбор семьи и объяснять свои решения: кому говорим, на какой вопрос отвечаем, чем подтверждаем и куда ведём дальше.</p><div class="panel goal"><strong>Итоговая работа</strong><p>Разбор одного обращения, задание на материал и план его проверки. Ты должна суметь объяснить каждое решение. Работу проверяет руководитель или коллега по конкретным критериям; чтение само по себе не подтверждает навык.</p><a class="button" href="#lesson-1">Начать с задачи маркетинга →</a></div><section class="panel"><h2>Как изучать</h2><ol><li>Прочитай, какое действие тренируем и зачем оно нужно в работе.</li><li>Разбери понятия и полный материал лекции. Его примеры и оговорки сохранены.</li><li>Посмотри решение с рассуждением: важен выбор действия, а не копирование формулировки.</li><li>Напиши ответ на учебную задачу, затем открой разбор и исправь слабые места.</li><li>Повтори действие на реальном случае. Получи замечания и доработай результат.</li></ol><p>В другой день попробуй новый случай без образца. Если можешь объяснить выбор и перенести его на новую ситуацию, есть основание оценивать применение.</p></section><section class="panel"><h2>Что является источником</h2><p>Факты и случаи — из двух расшифровок и фотографий слайдов. Опыт и прогнозы лектора не превращены в универсальные правила. Учебные пояснения, задания и ситуации добавлены редактором и помечены как адаптация.</p><p>«Неизвестно» — нормальный ответ, если данных нет. Возможности курса, цены, гарантии и результаты JKids нельзя выводить из вымышленного примера.</p><a href="#lesson-19">Карта источников и неясные места →</a></section>${groups.slice(0,3).map(g=>`<section style="margin:32px 0"><h2>${esc(g.name)}</h2><div class="route-list">${g.ids.map(id=>`<a class="route-item" href="#lesson-${id}"><strong>${esc(title(id))}</strong><p>${esc(instruction(id).outcome)}</p><span>Объяснение → пример → самостоятельное решение</span></a>`).join('')}</div></section>`).join('')}<section class="panel"><h2>Перед итоговой работой</h2><p>Если сложно отличить задачу от препятствия, вернись к разделу 6. Если не получается выбрать доказательство — к разделу 7. Если непонятно, что должен делать материал — к разделам 1 и 11.</p><a class="button" href="#lesson-18">Самостоятельная работа и критерии →</a></section>`;
  }
  function lesson(id){
    const l=instruction(id);
    let body=`<a class="return" href="#overview">← Маршрут и все темы</a><p class="eyebrow">${l?'Учебный раздел':'Источник и правила чтения'}</p><h1>${esc(title(id))}</h1>`;
    if(l){
      body+=`<div class="panel goal"><strong>Какое действие тренируем</strong><p class="lead">${esc(l.outcome)}</p><h3>Зачем это в работе</h3><p>${esc(l.why)}</p></div><nav class="section-links" aria-label="Внутри темы"><a href="#lesson-${id}-terms">Понятия</a><a href="#lesson-${id}-lecture">Полный разбор</a><a href="#lesson-${id}-worked">Решение с объяснением</a>${id===17?`<a href="#lesson-${id}-forms">Заполненные образцы</a>`:''}<a href="#lesson-${id}-practice">Твоя задача</a><a href="#lesson-${id}-transfer">Применение в работе</a></nav><section class="panel" id="terms"><p class="eyebrow">База перед разбором</p><h2>Понятия простыми словами</h2><dl class="glossary">${l.terms.map(([a,b])=>`<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl></section>`;
    }
    const reference=`<section class="panel lecture" id="lecture"><p class="eyebrow">Лекция и редакторская адаптация</p><h2>${id===17?'Пустые бланки для своей работы':l?'Объяснение, случаи и оговорки лекции':'Содержание и границы источников'}</h2><p class="muted">Здесь подписаны случаи лектора, редакторское применение и источники. Читай объяснение вместе с ограничениями примеров.</p>${sourceBlocks(id)}</section>`;
    if(id!==17) body+=reference;
    if(l){
      body+=`<section class="panel" id="worked"><p class="eyebrow">Учебная адаптация · ход решения</p><h2>Посмотри, как принимаем решение</h2>${[3,14,15,18].includes(id)?'':caseBlock()}<ol class="steps">${l.steps.map(([a,b])=>`<li><div><strong>${esc(a)}</strong><p>${esc(b)}</p></div></li>`).join('')}</ol><div class="compare"><div><small>Решение, которое не помогает</small><p>${esc(l.wrong)}</p></div><div><small>Обоснованный вариант</small><p>${esc(l.right)}</p></div></div></section>`;
      if(id===17) body+=forms()+reference;
      body+=`<section class="panel practice" id="practice"><p class="eyebrow">Самостоятельная учебная задача</p><h2>Теперь реши сама</h2><p class="task">${esc(l.task)}</p><label class="answer-label" for="answer">Твоё решение и объяснение «потому что…»</label><textarea id="answer" placeholder="Напиши решение. Отдельно отметь, чего не знаешь и что нужно проверить."></textarea><p class="save-note" id="save-state">Черновик сохраняется только в этом браузере на этом устройстве. Команда его не получает. Для обсуждения скопируй ответ.</p><button class="button secondary" id="copy-answer">Скопировать ответ</button><details class="feedback"><summary>После своего ответа: открыть разбор</summary><div><p>${esc(l.feedback)}</p><h4>Как проверить своё решение</h4>${criteria(l.criteria)}<p>Сравни ход мысли, а не совпадение слов. Если связь потеряна, исправь ответ и объясни изменение.</p></div></details></section><section class="panel" id="transfer"><p class="eyebrow">Перенос в работу</p><h2>Повтори на реальной ситуации</h2><p>${esc(l.transfer)}</p><h3>Что показать проверяющему</h3><p>Исходную ситуацию без лишних личных данных, своё решение, основания и неизвестные сведения. Попроси указать конкретное место, где логика или доказательство не работают.</p>${criteria(l.criteria)}</section>`;
    }
    const pos=order.indexOf(id);
    body+=`<p id="copy-status" role="status" aria-live="polite"></p><nav class="prev-next" aria-label="Продолжить обучение">${pos>0?`<a href="#lesson-${order[pos-1]}">← ${esc(title(order[pos-1]))}</a>`:'<a href="#overview">← Маршрут</a>'}${pos<order.length-1?`<a href="#lesson-${order[pos+1]}">${esc(title(order[pos+1]))} →</a>`:'<a href="#overview">Все темы →</a>'}</nav>`;
    main.innerHTML=body;
    bindActions(id);
  }
  async function copy(text,button){
    const original=button.textContent;
    try {await navigator.clipboard.writeText(text);button.textContent='Скопировано';setTimeout(()=>{if(button.isConnected)button.textContent=original;},2200);}
    catch(_){document.getElementById('copy-status').textContent='Копирование недоступно. Выдели текст и скопируй вручную.';}
  }
  function bindActions(id){
    const answer=document.getElementById('answer');
    if(answer){
      const key=`jkids-marketing-v2-answer-${id}`;
      try{answer.value=localStorage.getItem(key)||'';}catch(_){}
      answer.addEventListener('input',()=>{try{localStorage.setItem(key,answer.value);}catch(_){document.getElementById('save-state').textContent='Браузер не разрешает сохранить черновик. Скопируй ответ перед выходом.';}});
      document.getElementById('copy-answer').addEventListener('click',e=>copy(`${title(id)}\n\nЗадание: ${instruction(id).task}\n\nМоё решение:\n${answer.value}`,e.currentTarget));
    }
    main.querySelectorAll('[data-template]').forEach(b=>b.addEventListener('click',()=>{const [n,k]=b.dataset.template.split(':').map(Number);copy(source[n].blocks[k].text,b);}));
    main.querySelectorAll('[data-example]').forEach(b=>b.addEventListener('click',()=>{const f=learning.forms[Number(b.dataset.example)];copy(`${f.title}\nУчебный образец, не реальные данные JKids\n\n${f.rows.map(r=>`${r[0]}: ${r[1]}\nЗачем: ${r[2]}`).join('\n\n')}`,b);}));
  }
  let current='';
  function route(){
    const match=location.hash.match(/^#lesson-(\d+)(?:-block-(\d+)|-(terms|lecture|worked|forms|practice|transfer))?$/);
    if(match && source[Number(match[1])]){
      const id=Number(match[1]),key=`lesson-${id}`;
      if(current!==key){lesson(id);current=key;window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});}
      if(match[2]!==undefined) document.getElementById(`lesson-${id}-block-${match[2]}`)?.scrollIntoView();
      if(match[3]) document.getElementById(match[3])?.scrollIntoView();
      if(!matchMedia('(min-width:761px)').matches)nav.open=false;
    }else if(!location.hash||location.hash==='#overview'){
      overview();current='overview';window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});
      if(!matchMedia('(min-width:761px)').matches)nav.open=false;
    }else if(!current){overview();current='overview';}
    renderNav();
    document.title=`${current==='overview'?'Маркетинг: маршрут обучения':title(Number(current.split('-')[1]))} — JKids`;
  }
  async function load(){
    try{
      const res=await Promise.all([fetch('source-content.json?v=2'),fetch('learning.json?v=2')]);
      if(res.some(r=>!r.ok))throw new Error('load');
      [source,learning]=await Promise.all(res.map(r=>r.json()));
      if(!Array.isArray(source)||source.length!==20||learning.version!==2||learning.lessons.length!==18)throw new Error('data');
      navState();route();main.setAttribute('aria-busy','false');
      search.addEventListener('input',renderNav);window.addEventListener('hashchange',route);
      matchMedia('(min-width:761px)').addEventListener('change',e=>{nav.open=e.matches;});
    }catch(_){main.setAttribute('aria-busy','false');main.innerHTML='<section class="panel"><h1>Методичка не загрузилась</h1><p>Проверь соединение и обнови страницу.</p><button class="button" id="reload">Попробовать снова</button><p><a href="../../">Все методички</a></p></section>';document.getElementById('reload').onclick=()=>location.reload();}
  }
  load();
})();
