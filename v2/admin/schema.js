/* Разделы админки: какие поля у какой записи. Меняя этот файл, можно добавить поле в форму. */
window.ADMIN_SCHEMA = (() => {
  const DAYS = [[1, 'Понедельник'], [2, 'Вторник'], [3, 'Среда'], [4, 'Четверг'], [5, 'Пятница'], [6, 'Суббота'], [7, 'Воскресенье']];
  const DSHORT = ['', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const FORMAT = [['in', 'Очно'], ['online', 'Онлайн'], ['hybrid', 'Очно и онлайн']];
  const today = () => new Intl.DateTimeFormat('ru-RU', {timeZone: 'Asia/Vladivostok'}).format(new Date());
  const hex = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    DAYS, DSHORT,
    sections: [
      {
        id: 'news', group: 'Сайт', title: 'Новости и события', file: 'news', path: null, addTop: true,
        hint: 'Если указать дату события, запись сама появится в календаре, на главной и в архиве новостей.',
        itemTitle: r => r.t || 'Без заголовка',
        itemMeta: r => (r.eventDate ? 'Событие ' + r.eventDate + (r.eventEnd ? '–' + r.eventEnd : '') : 'Новость ' + (r.d || '')) + (r.img ? ' · с фото' : ''),
        newItem: () => ({d: today(), publishedDate: today(), t: '', p: '', body: [], eventDate: null, eventEnd: null, eventDates: [], u: '#home-events', source: 'ПКСО АА Приморья'}),
        fields: [
          {key: 't', label: 'Заголовок', type: 'text', required: true},
          {key: 'd', label: 'Дата публикации', type: 'date-ru', required: true},
          {key: 'eventDate', label: 'Дата события', type: 'date-ru', help: 'Оставьте пустым, если это просто новость, а не событие.'},
          {key: 'eventEnd', label: 'Последний день события', type: 'date-ru', help: 'Только если событие идёт несколько дней.'},
          {key: 'p', label: 'Коротко (1–2 предложения)', type: 'textarea', rows: 3},
          {key: 'body', label: 'Полный текст', type: 'paragraphs', rows: 10, help: 'Абзацы разделяйте пустой строкой.'},
          {key: 'img', label: 'Фото', type: 'upload', kind: 'image', help: 'JPG, PNG или WEBP до 10 МБ. Без узнаваемых лиц.'},
          {key: 'imgAlt', label: 'Что на фото (для незрячих)', type: 'text', showIf: r => r.img},
          {key: 'noFaces', label: 'На фото нет узнаваемых лиц, или они размыты', type: 'checkbox', showIf: r => r.img, requiredIf: r => r.img},
          {key: 'source', label: 'Источник', type: 'text', help: 'Например: ПКСО АА Приморья.'},
          {key: 'u', label: 'Ссылка на подробности', type: 'url', help: 'Необязательно. По умолчанию ведёт к новости на главной.'}
        ]
      },
      {
        id: 'groups', group: 'Расписание', title: 'Группы', file: 'schedule', path: 'groups',
        hint: 'Группу, которая временно не собирается, лучше скрыть, а не удалять.',
        itemTitle: r => r.name || 'Без названия',
        itemMeta: (r, all) => r.city + ' · собраний: ' + (all.meetings || []).filter(m => m.group === r.id).length + (r.allOpen ? ' · все открытые' : ''),
        newItem: (all) => ({id: '', name: '', city: (all.cities[0] || {}).name || '', page: '', map: '', allOpen: false, tags: [], onlineNote: '', hidden: false}),
        idFrom: 'name',
        onDelete: (r, all) => { const n = all.meetings.filter(m => m.group === r.id).length; return {confirm: n ? `Удалить группу «${r.name}» и её собрания (${n})? Лучше скрыть группу — тогда её можно вернуть.` : `Удалить группу «${r.name}»?`, apply: () => { all.meetings = all.meetings.filter(m => m.group !== r.id); }}; },
        fields: [
          {key: 'name', label: 'Название группы', type: 'text', required: true},
          {key: 'city', label: 'Город', type: 'select', required: true, options: all => all.cities.map(c => [c.name, c.name])},
          {key: 'allOpen', label: 'Все собрания открытые', type: 'checkbox', help: 'Если не отмечено, собрания считаются закрытыми (кроме тех, где в примечании сказано иначе).'},
          {key: 'tags', label: 'Метки', type: 'tags', help: 'Через запятую. Например: женская.'},
          {key: 'onlineNote', label: 'Пометка для онлайн-собраний', type: 'text', help: 'Например: временно только онлайн.'},
          {key: 'map', label: 'Ссылка на карту (2ГИС, Яндекс)', type: 'url'},
          {key: 'page', label: 'Страница группы на другом сайте', type: 'url'},
          {key: 'id', label: 'Код (латиницей, для системы)', type: 'slug', readonlyAfterCreate: true},
          {key: 'hidden', label: 'Скрыть с сайта (группа временно не собирается)', type: 'checkbox'}
        ]
      },
      {
        id: 'meetings', group: 'Расписание', title: 'Собрания', file: 'schedule', path: 'meetings',
        hint: 'Время — по Владивостоку. Собрание длится час.',
        filter: {label: 'Группа', options: all => [['', 'Все группы'], ...all.groups.map(g => [g.id, g.name + ' · ' + g.city])], match: (r, v) => !v || r.group === v},
        sort: (a, b, all) => groupName(all, a.group).localeCompare(groupName(all, b.group), 'ru') || a.day - b.day || a.time.localeCompare(b.time),
        itemTitle: (r, all) => groupName(all, r.group),
        itemMeta: (r, all) => DSHORT[r.day] + ' ' + r.time + ' · ' + (FORMAT.find(f => f[0] === r.format) || ['', 'Очно'])[1] + (r.address ? ' · ' + addrName(all, r.address) : ''),
        newItem: (all, filterValue) => ({group: filterValue || '', day: 1, time: '19:00', address: '', format: 'in', link: '', platform: '', note: ''}),
        fields: [
          {key: 'group', label: 'Группа', type: 'select', required: true, options: all => [['', '— выберите —'], ...all.groups.map(g => [g.id, g.name + ' · ' + g.city])]},
          {key: 'day', label: 'День недели', type: 'select', number: true, required: true, options: () => DAYS},
          {key: 'time', label: 'Начало (по Владивостоку)', type: 'time', required: true},
          {key: 'format', label: 'Формат', type: 'select', options: () => FORMAT},
          {key: 'address', label: 'Адрес', type: 'select', options: all => [['', '— без адреса (только онлайн) —'], ...all.addresses.map(a => [a.id, a.address])], help: 'Нового адреса нет в списке? Добавьте его в разделе «Адреса».'},
          {key: 'link', label: 'Ссылка для подключения', type: 'url', showIf: r => r.format !== 'in'},
          {key: 'platform', label: 'Платформа', type: 'text', showIf: r => r.format !== 'in', help: 'Zoom, MAX, Яндекс Телемост…'},
          {key: 'note', label: 'Примечание', type: 'text', help: 'Например: «Последняя суббота месяца — открытое». Слова «открытое/закрытое» сайт понимает сам.'}
        ]
      },
      {
        id: 'addresses', group: 'Расписание', title: 'Адреса', file: 'schedule', path: 'addresses',
        itemTitle: r => r.address || 'Без адреса',
        itemMeta: (r, all) => { const g = [...new Set(all.meetings.filter(m => m.address === r.id).map(m => groupName(all, m.group)))]; return g.length ? 'Группы: ' + g.join(', ') : 'Не используется'; },
        newItem: () => ({id: 'a-' + hex(3), address: '', entrance: ''}),
        onDelete: (r, all) => { const n = all.meetings.filter(m => m.address === r.id).length; return n ? {block: `Этот адрес указан в собраниях (${n}). Сначала поменяйте адрес у этих собраний.`} : {confirm: `Удалить адрес «${r.address}»?`}; },
        fields: [
          {key: 'address', label: 'Адрес', type: 'text', required: true, help: 'Улица, дом, помещение. Например: ул. Ленина, 22, Дом культуры, 1 этаж.'},
          {key: 'entrance', label: 'Как найти вход', type: 'text'}
        ]
      },
      {
        id: 'cities', group: 'Расписание', title: 'Города', file: 'schedule', path: 'cities',
        itemTitle: r => r.name, itemMeta: (r, all) => 'Групп: ' + all.groups.filter(g => g.city === r.name).length,
        newItem: () => ({name: '', in: ''}),
        onDelete: (r, all) => { const n = all.groups.filter(g => g.city === r.name).length; return n ? {block: `В городе есть группы (${n}). Сначала перенесите или удалите их.`} : {confirm: `Удалить город «${r.name}»?`}; },
        fields: [
          {key: 'name', label: 'Город', type: 'text', required: true},
          {key: 'in', label: 'Как писать после «в»', type: 'text', help: 'Например: «Находке», «Большом Камне». Для заголовка «Ближайшие собрания в …».'}
        ]
      },
      {
        id: 'online', group: 'Расписание', title: 'Онлайн-группы', file: 'online', path: null,
        hint: 'Онлайн-группы без своего адреса. Онлайн-собрания очных групп (например, «Пристань 611») добавляются в разделе «Собрания».',
        itemTitle: r => r.name, itemMeta: r => (r.platform || '') + (r.tz === 'MSK' ? ' · время по Москве' : ' · время по Владивостоку'),
        newItem: () => ({id: '', name: '', platform: 'Zoom', link: '', access: '', tz: 'MSK', everyHours: 0, times: [{time: '19:00', days: [1, 2, 3, 4, 5, 6, 7]}], big: '', when: '', inSchedule: true, hidden: false}),
        idFrom: 'name',
        fields: [
          {key: 'name', label: 'Название', type: 'text', required: true},
          {key: 'platform', label: 'Платформа', type: 'text', help: 'Zoom, MAX, Яндекс Телемост…'},
          {key: 'link', label: 'Ссылка для подключения', type: 'url', required: true},
          {key: 'access', label: 'Данные для входа', type: 'text', help: 'Например: ID 4513655750, код 283176.'},
          {key: 'tz', label: 'Время указано по', type: 'select', options: () => [['MSK', 'Москве'], ['VL', 'Владивостоку']]},
          {key: 'times', label: 'Время собраний', type: 'times', help: 'Сайт сам пересчитает московское время на владивостокское.'},
          {key: 'everyHours', label: 'Собрания каждые N часов (0 — нет)', type: 'number', min: 0, max: 24},
          {key: 'big', label: 'Крупная строка на карточке', type: 'text', help: 'Необязательно. Время в фигурных скобках пересчитается: «{07:00} и {13:00}».'},
          {key: 'when', label: 'Строка «Когда»', type: 'text', help: 'Необязательно. Например: «каждый день; во вторник и четверг первое собрание в {06:30}».'},
          {key: 'inSchedule', label: 'Показывать в расписании собраний', type: 'checkbox'},
          {key: 'id', label: 'Код (латиницей)', type: 'slug', readonlyAfterCreate: true},
          {key: 'hidden', label: 'Скрыть с сайта', type: 'checkbox'}
        ]
      },
      {
        id: 'speakers', group: 'Сайт', title: 'Спикерские', file: 'speakers', path: null, addTop: true,
        hint: 'Имя — только с первой буквой фамилии: «Ирина Л.». Раздел на сайте закрыт паролем (меняется в «Настройках»).',
        filter: {label: 'Год', options: all => [['', 'Все годы'], ...[...new Set(all.map(r => r.year).filter(Boolean))].sort().reverse().map(y => [y, y])], match: (r, v) => !v || r.year === v},
        itemTitle: r => r.name, itemMeta: r => (r.date ? r.date.split('-').reverse().join('.') : 'без даты') + ' · ' + (r.fellowship || 'АА'),
        newItem: () => ({id: 'speaker-' + hex(6), name: '', description: '', date: '', year: '', fellowship: 'АА', src: '', hidden: false}),
        warn: r => (r.name && !/^[А-ЯЁA-Z][а-яёa-z-]+( [А-ЯЁA-Z]\.)?$/.test(r.name.trim())) ? 'Проверьте имя: принято «Имя Ф.» — без полной фамилии.' : '',
        fields: [
          {key: 'name', label: 'Имя', type: 'text', required: true, help: 'Например: Ирина Л.'},
          {key: 'description', label: 'Подпись', type: 'textarea', rows: 3, required: true, help: 'Например: Ирина Л., 21 год трезвости, на группе «Вторяк», Владивосток 19/11/2026'},
          {key: 'date', label: 'Дата выступления', type: 'date'},
          {key: 'fellowship', label: 'Содружество', type: 'select', options: () => [['АА', 'АА'], ['Ал-Анон', 'Ал-Анон']]},
          {key: 'src', label: 'Аудиозапись', type: 'upload', kind: 'audio', required: true, allowUrl: true, help: 'Загрузите mp3 или вставьте ссылку https://…'},
          {key: 'hidden', label: 'Скрыть с сайта', type: 'checkbox'}
        ]
      },
      ...[['phones', 'Телефоны', 'Номер', 'tel'], ['emails', 'Почта', 'Адрес почты', 'mail']].map(([path, title, valueLabel, kind]) => ({
        id: 'contacts-' + path, group: 'Контакты', title, file: 'contacts', path,
        itemTitle: r => r.label, itemMeta: r => r.value + (r.note ? ' · ' + r.note : ''),
        newItem: () => ({label: '', value: '', href: '', note: '', hidden: false}),
        fields: [
          {key: 'label', label: kind === 'tel' ? 'Город или подпись' : 'Подпись', type: 'text', required: true},
          {key: 'value', label: valueLabel, type: 'text', required: true, help: kind === 'tel' ? 'Как показывать: +7 924 128-30-49. Ссылка для звонка сделается сама.' : ''},
          {key: 'href', label: 'Ссылка (необязательно)', type: 'text', help: kind === 'tel' ? 'Для WhatsApp: https://wa.me/79084467957' : ''},
          {key: 'note', label: 'Пояснение', type: 'text'},
          {key: 'hidden', label: 'Скрыть с сайта', type: 'checkbox'}
        ]
      })),
      {
        id: 'contacts-links', group: 'Контакты', title: 'Полезные ссылки', file: 'contacts', path: 'links',
        itemTitle: r => r.title, itemMeta: r => r.url,
        newItem: () => ({url: 'https://', title: '', text: '', hidden: false}),
        fields: [
          {key: 'title', label: 'Название', type: 'text', required: true},
          {key: 'url', label: 'Адрес', type: 'url', required: true},
          {key: 'text', label: 'Описание', type: 'text'},
          {key: 'hidden', label: 'Скрыть с сайта', type: 'checkbox'}
        ]
      }
    ]
  };
  function groupName(all, id) { const g = (all.groups || []).find(x => x.id === id); return g ? g.name : '(нет группы)'; }
  function addrName(all, id) { const a = (all.addresses || []).find(x => x.id === id); return a ? a.address : '(нет адреса)'; }
})();
