(() => {
'use strict';
const csrfMeta = document.querySelector('meta[name="csrf"]');
let csrf = csrfMeta ? csrfMeta.content : '';
const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') n.className = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else if (k === 'text') n.textContent = v; else n.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  return n;
};

async function api(action, body = {}) {
  const r = await fetch('api.php', {method: 'POST', headers: {'Content-Type': 'application/json', 'X-CSRF': csrf}, body: JSON.stringify({action, ...body}), credentials: 'same-origin'});
  let data = {};
  try { data = await r.json(); } catch (e) { data = {error: 'Сервер ответил неожиданно (' + r.status + ').'}; }
  if (data.relogin) { location.reload(); throw new Error(data.error); }
  if (!r.ok) { const err = new Error(data.error || 'Ошибка ' + r.status); err.conflict = !!data.conflict; throw err; }
  return data;
}

/* ---------- вход ---------- */
const loginForm = $('#login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('#login-error'), btn = loginForm.querySelector('button');
    err.hidden = true; btn.disabled = true;
    try {
      await api('login', {login: loginForm.login.value, password: loginForm.password.value});
      location.reload();
    } catch (x) { err.textContent = x.message; err.hidden = false; btn.disabled = false; loginForm.password.select(); }
  });
  return;
}

const app = $('#app');
if (!app) return;
const S = window.ADMIN_SCHEMA;
const files = {};                    // имя файла → {data, version}
let current = null, filterValue = '', search = '', editing = null, toastTimer = 0;

/* ---------- каркас ---------- */
const nav = el('nav', {class: 'side', 'aria-label': 'Разделы админки'});
const main = el('main', {class: 'main', tabindex: '-1'});
const toast = el('div', {class: 'toast', role: 'status', 'aria-live': 'polite', hidden: true});
const menuBtn = el('button', {class: 'menu-btn', type: 'button', 'aria-expanded': 'false', onclick: () => { const open = document.body.classList.toggle('nav-open'); menuBtn.setAttribute('aria-expanded', String(open)); }}, 'Разделы');
app.append(
  el('header', {class: 'top'},
    menuBtn,
    el('div', {class: 'brand'}, el('img', {src: '../assets/images/icon-192.png', alt: '', width: 32, height: 32}), el('span', {}, 'Админка · АА Приморья')),
    el('div', {class: 'who'}, el('span', {}, app.dataset.name), el('a', {href: '../', target: '_blank', rel: 'noopener'}, 'Открыть сайт'), el('button', {type: 'button', class: 'link', onclick: async () => { await api('logout'); location.reload(); }}, 'Выйти'))
  ),
  el('div', {class: 'layout'}, nav, main), toast
);
function say(text, bad = false) { toast.textContent = text; toast.className = 'toast' + (bad ? ' bad' : ''); toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, bad ? 8000 : 3500); }

function buildNav() {
  nav.replaceChildren();
  const groups = {};
  for (const s of S.sections) (groups[s.group] = groups[s.group] || []).push(s);
  for (const [g, list] of Object.entries(groups)) {
    nav.append(el('p', {class: 'nav-group'}, g));
    for (const s of list) nav.append(el('a', {href: '#' + s.id, 'aria-current': current && current.id === s.id ? 'page' : null}, s.title));
  }
  nav.append(el('p', {class: 'nav-group'}, 'Служебное'), el('a', {href: '#settings', 'aria-current': location.hash === '#settings' ? 'page' : null}, 'Настройки и история'));
}

async function load(file, force = false) {
  if (!files[file] || force) { const r = await api('load', {file}); files[file] = {data: r.data, version: r.version}; }
  return files[file];
}
const clone = v => JSON.parse(JSON.stringify(v));
const listOf = (s, data) => s.path ? data[s.path] : data;

async function route() {
  document.body.classList.remove('nav-open'); menuBtn.setAttribute('aria-expanded', 'false');
  const id = location.hash.slice(1) || 'news';
  editing = null; search = ''; filterValue = '';
  if (id === 'settings') { current = null; buildNav(); return renderSettings(); }
  current = S.sections.find(s => s.id === id) || S.sections[0];
  buildNav();
  main.replaceChildren(el('p', {class: 'muted pad'}, 'Загрузка…'));
  try { await load(current.file); renderList(); } catch (e) { main.replaceChildren(el('p', {class: 'error pad'}, e.message)); }
}
window.addEventListener('hashchange', route);

/* ---------- список записей ---------- */
function renderList() {
  const s = current, file = files[s.file], all = file.data, list = listOf(s, all) || [];
  const head = el('div', {class: 'list-head'},
    el('div', {}, el('h1', {}, s.title), s.hint ? el('p', {class: 'muted'}, s.hint) : null),
    el('button', {type: 'button', class: 'primary', onclick: () => openEditor(-1)}, '+ Добавить'));
  const tools = el('div', {class: 'tools'});
  const q = el('input', {type: 'search', placeholder: 'Поиск', value: search, 'aria-label': 'Поиск по списку', oninput: () => { search = q.value; draw(); }});
  tools.append(q);
  if (s.filter) {
    const sel = el('select', {'aria-label': s.filter.label, onchange: () => { filterValue = sel.value; draw(); }});
    for (const [v, t] of s.filter.options(all)) sel.append(el('option', {value: v, selected: v === filterValue}, t));
    tools.append(sel);
  }
  const box = el('ol', {class: 'items'});
  const count = el('p', {class: 'muted count'});
  main.replaceChildren(head, tools, count, box);

  function draw() {
    const needle = search.trim().toLowerCase();
    let rows = list.map((r, i) => ({r, i})).filter(({r}) => (!s.filter || s.filter.match(r, filterValue)) && (!needle || JSON.stringify(r).toLowerCase().includes(needle)));
    if (s.sort) rows.sort((a, b) => s.sort(a.r, b.r, all));
    count.textContent = rows.length === list.length ? `Записей: ${list.length}` : `Показано ${rows.length} из ${list.length}`;
    box.replaceChildren(...rows.map(({r, i}) => {
      const actions = el('div', {class: 'row-actions'});
      if (!s.sort && !needle && !filterValue) {
        actions.append(el('button', {type: 'button', class: 'icon', 'aria-label': 'Выше', title: 'Выше', disabled: i === 0, onclick: () => move(i, -1)}, '↑'),
                       el('button', {type: 'button', class: 'icon', 'aria-label': 'Ниже', title: 'Ниже', disabled: i === list.length - 1, onclick: () => move(i, 1)}, '↓'));
      }
      if ('hidden' in r) actions.append(el('button', {type: 'button', class: 'line', onclick: () => toggleHidden(i)}, r.hidden ? 'Показать' : 'Скрыть'));
      actions.append(el('button', {type: 'button', class: 'line', onclick: () => openEditor(i)}, 'Изменить'),
                     el('button', {type: 'button', class: 'line danger', onclick: () => remove(i)}, 'Удалить'));
      return el('li', {class: 'item' + (r.hidden ? ' is-hidden' : '')},
        el('div', {class: 'item-text'}, el('strong', {}, s.itemTitle(r, all)), el('span', {class: 'muted'}, (r.hidden ? 'Скрыто · ' : '') + (s.itemMeta ? s.itemMeta(r, all) : ''))),
        actions);
    }));
    if (!rows.length) box.append(el('li', {class: 'empty muted'}, 'Ничего не найдено.'));
  }
  draw();
}

async function commit(mutate, summary) {
  const s = current, file = files[s.file];
  const next = clone(file.data);
  mutate(next);
  try {
    const r = await api('save', {file: s.file, version: file.version, data: next, summary});
    files[s.file] = {data: r.data, version: r.version};
    say('Сохранено. На сайте — сразу после обновления страницы.');
    return true;
  } catch (e) {
    if (e.conflict) { say(e.message, true); await load(s.file, true); renderList(); return false; }
    say(e.message, true); return false;
  }
}
function move(i, d) { commit(all => { const l = listOf(current, all); [l[i], l[i + d]] = [l[i + d], l[i]]; }, 'порядок').then(ok => ok && renderList()); }
function toggleHidden(i) { const l = listOf(current, files[current.file].data); const name = current.itemTitle(l[i], files[current.file].data); commit(all => { const x = listOf(current, all)[i]; x.hidden = !x.hidden; }, (l[i].hidden ? 'показано: ' : 'скрыто: ') + name).then(ok => ok && renderList()); }
function remove(i) {
  const all = files[current.file].data, r = listOf(current, all)[i];
  const rule = current.onDelete ? current.onDelete(r, all) : {confirm: `Удалить «${current.itemTitle(r, all)}»? Это можно отменить только через «Настройки и история».`};
  if (rule.block) { say(rule.block, true); return; }
  if (!confirm(rule.confirm)) return;
  commit(next => { const l = listOf(current, next); const gone = l.splice(i, 1)[0]; if (current.onDelete) { const again = current.onDelete(gone, next); if (again.apply) again.apply(); } }, 'удалено: ' + current.itemTitle(r, all)).then(ok => ok && renderList());
}

/* ---------- форма записи ---------- */
const DIG = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'};
const slugify = t => t.toLowerCase().split('').map(c => DIG[c] ?? c).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'item';
const ruToIso = v => v ? v.split('.').reverse().join('-') : '';
const isoToRu = v => v ? v.split('-').reverse().join('.') : null;

function openEditor(index) {
  const s = current, all = files[s.file].data, list = listOf(s, all);
  const isNew = index < 0;
  const rec = isNew ? s.newItem(all, filterValue) : clone(list[index]);
  editing = {index, rec};
  const form = el('form', {class: 'editor', novalidate: true});
  const err = el('p', {class: 'error', role: 'alert', hidden: true});
  const warnBox = el('p', {class: 'warn', hidden: true});
  const fieldsBox = el('div', {class: 'fields'});
  form.append(
    el('div', {class: 'list-head'}, el('div', {}, el('p', {class: 'crumb'}, el('a', {href: '#' + s.id, onclick: e => { e.preventDefault(); renderList(); }}, '← ' + s.title)), el('h1', {}, isNew ? 'Новая запись' : s.itemTitle(rec, all)))),
    fieldsBox, warnBox, err,
    el('div', {class: 'form-actions'},
      el('button', {type: 'submit', class: 'primary'}, 'Сохранить'),
      el('button', {type: 'button', class: 'line', onclick: () => renderList()}, 'Отмена'))
  );
  main.replaceChildren(form);
  main.focus();

  function drawFields() {
    fieldsBox.replaceChildren(...s.fields.filter(f => !f.showIf || f.showIf(rec)).map(f => field(f)));
    const w = s.warn ? s.warn(rec) : '';
    warnBox.textContent = w; warnBox.hidden = !w;
  }
  function field(f) {
    const id = 'f-' + f.key;
    const wrap = el('div', {class: 'field' + (f.type === 'checkbox' ? ' check' : '')});
    const label = el('label', {for: id}, f.label, (f.required || (f.requiredIf && f.requiredIf(rec))) ? el('span', {class: 'req', 'aria-hidden': 'true'}, ' *') : null);
    let input;
    const v = rec[f.key];
    const set = (val, redraw = false) => { rec[f.key] = val; if (f.key === s.idFrom && isNew) autoId(); if (redraw) drawFields(); else { const w = s.warn ? s.warn(rec) : ''; warnBox.textContent = w; warnBox.hidden = !w; } };
    switch (f.type) {
      case 'textarea': case 'paragraphs':
        input = el('textarea', {id, rows: f.rows || 4, oninput: () => set(f.type === 'paragraphs' ? input.value.split(/\n\s*\n/).map(x => x.trim()).filter(Boolean) : input.value)});
        input.value = f.type === 'paragraphs' ? (Array.isArray(v) ? v.join('\n\n') : (v || '')) : (v || '');
        break;
      case 'checkbox':
        input = el('input', {id, type: 'checkbox', checked: !!v, onchange: () => set(input.checked, true)});
        wrap.append(input, label); if (f.help) wrap.append(el('p', {class: 'help'}, f.help)); return wrap;
      case 'select': {
        input = el('select', {id, onchange: () => set(f.number ? Number(input.value) : input.value, true)});
        for (const [val, text] of f.options(all)) input.append(el('option', {value: val, selected: String(val) === String(v ?? '')}, text));
        break;
      }
      case 'date-ru': input = el('input', {id, type: 'date', value: ruToIso(v), onchange: () => set(isoToRu(input.value))}); break;
      case 'date': input = el('input', {id, type: 'date', value: v || '', onchange: () => set(input.value)}); break;
      case 'time': input = el('input', {id, type: 'time', value: v || '', step: 300, onchange: () => set(input.value)}); break;
      case 'number': input = el('input', {id, type: 'number', min: f.min, max: f.max, value: v ?? 0, oninput: () => set(Number(input.value) || 0)}); break;
      case 'tags': input = el('input', {id, type: 'text', value: (v || []).join(', '), oninput: () => set(input.value.split(',').map(x => x.trim()).filter(Boolean))}); break;
      case 'slug': input = el('input', {id, type: 'text', value: v || '', readonly: !isNew && f.readonlyAfterCreate, pattern: '[a-z0-9-]+', oninput: () => set(input.value)}); break;
      case 'times': input = timesEditor(id, v || [], val => set(val)); break;
      case 'upload': input = uploader(id, f, v || '', val => set(val, true)); break;
      default: input = el('input', {id, type: f.type === 'url' ? 'url' : 'text', value: v ?? '', inputmode: f.type === 'url' ? 'url' : null, oninput: () => set(input.value)});
    }
    wrap.append(label, input);
    if (f.help) wrap.append(el('p', {class: 'help'}, f.help));
    return wrap;
  }
  function autoId() {
    const idField = s.fields.find(f => f.type === 'slug');
    if (!idField) return;
    const taken = new Set(list.map(x => x.id));
    let base = slugify(rec[s.idFrom] || ''), id = base, n = 2;
    while (taken.has(id)) id = base + '-' + n++;
    rec.id = id;
    const inp = $('#f-id', form); if (inp) inp.value = id;
  }
  drawFields();
  if (isNew && s.idFrom) autoId();

  form.addEventListener('submit', async e => {
    e.preventDefault();
    err.hidden = true;
    for (const f of s.fields) {
      if (f.showIf && !f.showIf(rec)) continue;
      const v = rec[f.key];
      const empty = v === undefined || v === null || v === '' || v === false || (Array.isArray(v) && !v.length);
      if ((f.required || (f.requiredIf && f.requiredIf(rec))) && empty) { err.textContent = `Заполните поле «${f.label}».`; err.hidden = false; const n = $('#f-' + f.key, form); if (n) n.focus(); return; }
      if (f.type === 'time' && v && !/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) { err.textContent = 'Время в формате ЧЧ:ММ.'; err.hidden = false; return; }
    }
    const btn = form.querySelector('button[type=submit]'); btn.disabled = true;
    const title = s.itemTitle(rec, all);
    const ok = await commit(next => { const l = listOf(s, next); if (isNew) { s.addTop ? l.unshift(rec) : l.push(rec); } else l[index] = rec; }, (isNew ? 'добавлено: ' : 'изменено: ') + title);
    btn.disabled = false;
    if (ok) renderList();
  });
}

function timesEditor(id, value, onChange) {
  const rows = clone(value);
  const box = el('div', {class: 'times', id});
  function draw() {
    box.replaceChildren(...rows.map((r, i) => el('div', {class: 'time-row'},
      el('input', {type: 'time', value: r.time, 'aria-label': 'Время', onchange: e => { r.time = e.target.value; onChange(clone(rows)); }}),
      el('div', {class: 'days'}, ...S.DSHORT.slice(1).map((d, k) => el('button', {type: 'button', class: 'day', 'aria-pressed': String(r.days.includes(k + 1)), onclick: e => { const n = k + 1; r.days = r.days.includes(n) ? r.days.filter(x => x !== n) : [...r.days, n].sort(); e.target.setAttribute('aria-pressed', String(r.days.includes(n))); onChange(clone(rows)); }}, d))),
      el('button', {type: 'button', class: 'icon', 'aria-label': 'Убрать это время', onclick: () => { rows.splice(i, 1); draw(); onChange(clone(rows)); }}, '×'))),
      el('button', {type: 'button', class: 'line small', onclick: () => { rows.push({time: '19:00', days: [1, 2, 3, 4, 5, 6, 7]}); draw(); onChange(clone(rows)); }}, '+ Добавить время'));
  }
  draw();
  return box;
}

function uploader(id, f, value, onChange) {
  const box = el('div', {class: 'upload'});
  const preview = el('div', {class: 'preview'});
  const status = el('p', {class: 'help', role: 'status'});
  const file = el('input', {id, type: 'file', accept: f.kind === 'image' ? 'image/jpeg,image/png,image/webp' : f.kind === 'audio' ? 'audio/mpeg,audio/mp4,.mp3,.m4a' : 'application/pdf'});
  const url = f.allowUrl ? el('input', {type: 'url', placeholder: 'или ссылка https://…', value: /^https?:/.test(value) ? value : '', 'aria-label': 'Ссылка на файл', onchange: () => { if (url.value) onChange(url.value.trim()); }}) : null;
  const src = v => /^https?:/.test(v) ? v : '../' + v;
  if (value) {
    if (f.kind === 'image') preview.append(el('img', {src: src(value), alt: 'Выбранное фото'}));
    else if (f.kind === 'audio') preview.append(el('audio', {controls: true, preload: 'none', src: src(value)}));
    preview.append(el('p', {class: 'help'}, value), el('button', {type: 'button', class: 'line small', onclick: () => onChange('')}, 'Убрать файл'));
  }
  file.addEventListener('change', () => {
    const chosen = file.files[0];
    if (!chosen) return;
    const fd = new FormData(); fd.append('file', chosen); fd.append('kind', f.kind);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'api.php?upload=1'); xhr.setRequestHeader('X-CSRF', csrf);
    xhr.upload.onprogress = e => { if (e.lengthComputable) status.textContent = 'Загрузка: ' + Math.round(e.loaded / e.total * 100) + '%'; };
    xhr.onload = () => { let r = {}; try { r = JSON.parse(xhr.responseText); } catch (e) {} if (xhr.status === 200 && r.path) { say('Файл загружен. Не забудьте нажать «Сохранить».'); onChange(r.path); } else { status.textContent = r.error || 'Файл не загрузился.'; status.classList.add('error'); } };
    xhr.onerror = () => { status.textContent = 'Нет связи с сервером.'; };
    status.textContent = 'Загрузка…'; xhr.send(fd);
  });
  box.append(preview, file, url, status);
  return box;
}

/* ---------- настройки и история ---------- */
async function renderSettings() {
  main.replaceChildren(el('h1', {}, 'Настройки и история'));
  const sched = await load('schedule');
  const verified = el('input', {type: 'text', value: sched.data.verified || '', id: 's-verified'});
  main.append(card('Дата сверки расписания', 'Показывается в шапке сайта: «Время и типы собраний сверены … ».',
    el('div', {class: 'field'}, el('label', {for: 's-verified'}, 'Например: 23 ноября 2026 года'), verified),
    el('button', {type: 'button', class: 'primary', onclick: async () => { current = S.sections.find(s => s.id === 'groups'); const ok = await commit(all => { all.verified = verified.value.trim(); }, 'дата сверки'); current = null; if (ok) say('Дата сверки сохранена.'); }}, 'Сохранить дату')));

  const sp = el('input', {type: 'text', id: 's-sp', autocomplete: 'off'});
  main.append(card('Пароль раздела «Спикерские»', 'Посетители вводят его, чтобы слушать записи. Сообщайте его членам содружества.',
    el('div', {class: 'field'}, el('label', {for: 's-sp'}, 'Новый пароль (не короче 4 символов)'), sp),
    el('button', {type: 'button', class: 'primary', onclick: async () => { try { await api('speakers-password', {password: sp.value}); sp.value = ''; say('Пароль спикерских изменён.'); } catch (e) { say(e.message, true); } }}, 'Сменить пароль')));

  const o = el('input', {type: 'password', id: 's-old', autocomplete: 'current-password'}), n = el('input', {type: 'password', id: 's-new', autocomplete: 'new-password'});
  main.append(card('Мой пароль для входа', 'Не короче 10 символов.',
    el('div', {class: 'field'}, el('label', {for: 's-old'}, 'Текущий пароль'), o),
    el('div', {class: 'field'}, el('label', {for: 's-new'}, 'Новый пароль'), n),
    el('button', {type: 'button', class: 'primary', onclick: async () => { try { await api('my-password', {old: o.value, new: n.value}); o.value = n.value = ''; say('Пароль изменён.'); } catch (e) { say(e.message, true); } }}, 'Сменить пароль')));

  const names = {news: 'Новости и события', schedule: 'Расписание (группы, собрания, адреса, города)', online: 'Онлайн-группы', speakers: 'Спикерские', contacts: 'Контакты'};
  const which = el('select', {id: 's-file'}, ...Object.entries(names).map(([k, v]) => el('option', {value: k}, v)));
  const bl = el('ol', {class: 'items compact'});
  const showBackups = async () => {
    bl.replaceChildren(el('li', {class: 'muted'}, 'Загрузка…'));
    const r = await api('backups', {file: which.value});
    bl.replaceChildren(...r.backups.map(b => el('li', {class: 'item'}, el('div', {class: 'item-text'}, el('strong', {}, new Date(b.at).toLocaleString('ru-RU')), el('span', {class: 'muted'}, 'до правки пользователя ' + b.user)),
      el('button', {type: 'button', class: 'line', onclick: async () => { if (!confirm('Вернуть раздел к состоянию на ' + new Date(b.at).toLocaleString('ru-RU') + '? Текущее состояние тоже сохранится в копиях.')) return; try { await api('restore', {file: which.value, id: b.id}); delete files[which.value]; say('Раздел восстановлен.'); showBackups(); } catch (e) { say(e.message, true); } }}, 'Вернуть'))));
    if (!r.backups.length) bl.append(el('li', {class: 'muted'}, 'Копий пока нет — они появляются при каждом сохранении.'));
  };
  which.onchange = showBackups;
  main.append(card('Резервные копии', 'Перед каждым сохранением раздел копируется. Если что-то сломалось — верните прошлую версию.', el('div', {class: 'field'}, el('label', {for: 's-file'}, 'Раздел'), which), bl));
  showBackups();

  const lg = el('ol', {class: 'items compact'});
  main.append(card('Журнал изменений', 'Кто, что и когда менял.', lg));
  const r = await api('log');
  lg.replaceChildren(...r.log.map(e => el('li', {class: 'item'}, el('div', {class: 'item-text'}, el('strong', {}, e.action + (e.detail ? ': ' + e.detail : '')), el('span', {class: 'muted'}, new Date(e.at).toLocaleString('ru-RU') + ' · ' + e.user)))));
}
function card(title, text, ...kids) { return el('section', {class: 'card'}, el('h2', {}, title), text ? el('p', {class: 'muted'}, text) : null, ...kids); }

route();
})();
