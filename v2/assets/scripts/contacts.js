/* Контакты: телефоны, почта и ссылки из content/contacts.json (через content/content.js). */
(() => {
  const data = (window.AA_CONTENT || {}).contacts;
  if (!data) return;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; };
  const card = item => {
    const box = el('div', 'pcard');
    box.append(el('span', null, item.label));
    const a = el('a', null, item.value);
    a.href = item.href;
    if (/^https?:/.test(item.href)) { a.target = '_blank'; a.rel = 'noopener'; }
    box.append(a);
    if (item.note) box.append(el('em', null, item.note));
    return box;
  };
  const fill = (id, items, make) => { const box = document.getElementById(id); if (box) box.replaceChildren(...(items || []).filter(i => !i.hidden).map(make)); };
  fill('contact-phones', data.phones, card);
  fill('contact-emails', data.emails, card);
  fill('contact-links', data.links, item => {
    const li = el('li'), a = el('a', null, item.title);
    a.href = item.url; a.target = '_blank'; a.rel = 'noopener';
    li.append(a, el('span', null, item.text));
    return li;
  });
})();
