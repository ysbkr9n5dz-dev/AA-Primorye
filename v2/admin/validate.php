<?php
/* Проверка данных перед сохранением. Ошибка = понятная фраза по-русски, файл не меняется. */
declare(strict_types=1);

final class Invalid extends RuntimeException {}

function fail(string $where, string $msg): void { throw new Invalid($where . ': ' . $msg); }
function s($v): string { return is_string($v) ? trim($v) : (is_null($v) ? '' : (is_scalar($v) ? (string)$v : '')); }
function req(array $r, string $k, string $where, string $label): string {
    $v = s($r[$k] ?? '');
    if ($v === '') fail($where, "заполните поле «$label»");
    if (mb_strlen($v) > 5000) fail($where, "поле «$label» слишком длинное");
    return $v;
}
function opt(array $r, string $k, int $max = 5000): string {
    $v = s($r[$k] ?? '');
    if (mb_strlen($v) > $max) throw new Invalid("поле $k слишком длинное");
    return $v;
}
function url_ok(string $v, bool $allowLocal = true): bool {
    if ($v === '') return true;
    if ($allowLocal && preg_match('#^(media|assets|library-files)/[A-Za-z0-9._/\-]+$#', $v) && !str_contains($v, '..')) return true;
    if ($allowLocal && preg_match('/^#[a-z0-9-]+$/', $v)) return true;
    return (bool)preg_match('#^https?://[^\s<>"]+$#i', $v);
}
function date_ru(?string $v): bool { return $v === null || $v === '' || (bool)preg_match('/^(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.20\d\d$/', $v); }
function time_ok(string $v): bool { return (bool)preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $v); }
function slug_ok(string $v): bool { return (bool)preg_match('/^[a-z0-9][a-z0-9-]{1,40}$/', $v); }
function list_of($v, string $where): array { if (!is_array($v) || ($v && array_keys($v) !== range(0, count($v) - 1))) fail($where, 'ожидается список'); return $v; }

function validate_content(string $name, $data) {
    switch ($name) {
        case 'schedule': return validate_schedule($data);
        case 'online': return validate_online($data);
        case 'news': return validate_news($data);
        case 'speakers': return validate_speakers($data);
        case 'contacts': return validate_contacts($data);
        case 'settings': return validate_settings($data);
    }
    throw new Invalid('Неизвестный раздел');
}

function validate_schedule($d): array {
    if (!is_array($d)) fail('Расписание', 'неверный формат');
    $cities = [];
    foreach (list_of($d['cities'] ?? [], 'Города') as $i => $c) {
        $n = req($c, 'name', 'Город №' . ($i + 1), 'Название');
        if (isset($cities[$n])) fail("Город «$n»", 'повторяется');
        $cities[$n] = true;
        $d['cities'][$i] = ['name' => $n, 'in' => opt($c, 'in', 80) ?: $n];
    }
    $groups = []; $names = [];
    foreach (list_of($d['groups'] ?? [], 'Группы') as $i => $g) {
        $w = 'Группа «' . s($g['name'] ?? ('№' . ($i + 1))) . '»';
        $id = req($g, 'id', $w, 'Код');
        if (!slug_ok($id)) fail($w, 'код — латинские буквы, цифры и дефис');
        if (isset($groups[$id])) fail($w, "код «$id» уже занят");
        $groups[$id] = true;
        $names[$id] = req($g, 'name', $w, 'Название');
        $city = req($g, 'city', $w, 'Город');
        if (!isset($cities[$city])) fail($w, "города «$city» нет в списке городов");
        foreach (['page', 'map'] as $k) if (!url_ok(s($g[$k] ?? ''), false)) fail($w, 'ссылка должна начинаться с https://');
        $g['allOpen'] = !empty($g['allOpen']);
        $g['hidden'] = !empty($g['hidden']);
        $g['tags'] = array_values(array_filter(array_map('s', is_array($g['tags'] ?? null) ? $g['tags'] : [])));
        $d['groups'][$i] = $g;
    }
    $addr = [];
    foreach (list_of($d['addresses'] ?? [], 'Адреса') as $i => $a) {
        $w = 'Адрес «' . s($a['address'] ?? ('№' . ($i + 1))) . '»';
        $id = req($a, 'id', $w, 'Код');
        if (!slug_ok($id)) fail($w, 'код — латинские буквы, цифры и дефис');
        if (isset($addr[$id])) fail($w, "код «$id» уже занят");
        $addr[$id] = true;
        req($a, 'address', $w, 'Адрес');
    }
    foreach (list_of($d['meetings'] ?? [], 'Собрания') as $i => $m) {
        $dn = ['', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][(int)($m['day'] ?? 0)] ?? '';
        $w = 'Собрание ' . trim(($names[s($m['group'] ?? '')] ?? '') . ' ' . $dn . ' ' . s($m['time'] ?? ''));
        $g = req($m, 'group', $w, 'Группа');
        if (!isset($groups[$g])) fail($w, 'выберите группу из списка');
        $day = (int)($m['day'] ?? 0);
        if ($day < 1 || $day > 7) fail($w, 'выберите день недели');
        if (!time_ok(s($m['time'] ?? ''))) fail($w, 'время в формате ЧЧ:ММ, например 19:00');
        $f = s($m['format'] ?? 'in') ?: 'in';
        if (!in_array($f, ['in', 'online', 'hybrid'], true)) fail($w, 'неверный формат собрания');
        $a = s($m['address'] ?? '');
        if ($a !== '' && !isset($addr[$a])) fail($w, 'выберите адрес из списка');
        if ($f !== 'online' && $a === '') fail($w, 'для очного собрания нужен адрес');
        if ($f !== 'in' && s($m['link'] ?? '') === '') fail($w, 'для онлайн-собрания нужна ссылка');
        if (!url_ok(s($m['link'] ?? ''), false)) fail($w, 'ссылка должна начинаться с https://');
        $d['meetings'][$i] = ['group' => $g, 'day' => $day, 'time' => s($m['time']), 'address' => $a, 'format' => $f, 'link' => s($m['link'] ?? ''), 'platform' => opt($m, 'platform', 80), 'note' => opt($m, 'note', 500)];
    }
    $d['verified'] = opt($d, 'verified', 80);
    return $d;
}

function validate_online($d): array {
    $ids = [];
    foreach (list_of($d, 'Онлайн-группы') as $i => $o) {
        $w = 'Онлайн-группа «' . s($o['name'] ?? ('№' . ($i + 1))) . '»';
        $id = req($o, 'id', $w, 'Код');
        if (!slug_ok($id)) fail($w, 'код — латинские буквы, цифры и дефис');
        if (isset($ids[$id])) fail($w, "код «$id» уже занят");
        $ids[$id] = true;
        req($o, 'name', $w, 'Название');
        if (!url_ok(s($o['link'] ?? ''), false)) fail($w, 'ссылка должна начинаться с https://');
        if (!in_array(s($o['tz'] ?? ''), ['MSK', 'VL'], true)) fail($w, 'выберите часовой пояс');
        $o['everyHours'] = max(0, min(24, (int)($o['everyHours'] ?? 0)));
        $times = [];
        foreach (list_of($o['times'] ?? [], $w . ', время') as $t) {
            if (!time_ok(s($t['time'] ?? ''))) fail($w, 'время в формате ЧЧ:ММ');
            $days = array_values(array_unique(array_filter(array_map('intval', is_array($t['days'] ?? null) ? $t['days'] : []), fn($x) => $x >= 1 && $x <= 7)));
            sort($days);
            if (!$days) fail($w, 'у времени ' . s($t['time']) . ' не выбраны дни');
            $times[] = ['time' => s($t['time']), 'days' => $days];
        }
        if (!$times && !$o['everyHours']) fail($w, 'добавьте время собраний или укажите «каждые N часов»');
        $o['times'] = $times;
        $o['inSchedule'] = !empty($o['inSchedule']);
        $o['hidden'] = !empty($o['hidden']);
        foreach (['platform', 'access', 'big', 'when'] as $k) $o[$k] = opt($o, $k, 300);
        $d[$i] = $o;
    }
    return $d;
}

function ru_to_iso(string $v): string { [$dd, $mm, $yy] = explode('.', $v); return "$yy-$mm-$dd"; }

function validate_news($d): array {
    foreach (list_of($d, 'Новости') as $i => $n) {
        $w = 'Новость «' . mb_substr(s($n['t'] ?? ('№' . ($i + 1))), 0, 40) . '»';
        req($n, 't', $w, 'Заголовок');
        $date = req($n, 'd', $w, 'Дата');
        if (!date_ru($date)) fail($w, 'дата в формате ДД.ММ.ГГГГ');
        foreach (['eventDate', 'eventEnd', 'publishedDate', 'sourceDate'] as $k) {
            $v = $n[$k] ?? null;
            if ($v === '') $n[$k] = $v = null;
            if (!date_ru($v)) fail($w, 'дата в формате ДД.ММ.ГГГГ');
        }
        if (!empty($n['eventEnd']) && empty($n['eventDate'])) fail($w, 'укажите дату начала события');
        $dates = [];
        if (!empty($n['eventDate'])) {
            $a = new DateTime(ru_to_iso($n['eventDate']));
            $b = new DateTime(ru_to_iso($n['eventEnd'] ?: $n['eventDate']));
            if ($b < $a) fail($w, 'дата окончания раньше даты начала');
            if ($a->diff($b)->days > 31) fail($w, 'событие длиннее месяца — проверьте даты');
            for ($x = clone $a; $x <= $b; $x->modify('+1 day')) $dates[] = $x->format('d.m.Y');
        }
        $n['eventDates'] = $dates;
        if (!url_ok(s($n['u'] ?? ''))) fail($w, 'ссылка должна начинаться с https:// или быть адресом раздела сайта');
        if (s($n['u'] ?? '') === '') $n['u'] = '#home-events';
        $img = s($n['img'] ?? '');
        if (!url_ok($img)) fail($w, 'неверный путь к фото');
        if ($img !== '' && empty($n['noFaces'])) fail($w, 'подтвердите, что на фото нет узнаваемых лиц (или они размыты)');
        if (isset($n['body'])) {
            $body = is_array($n['body']) ? $n['body'] : preg_split('/\n\s*\n/', s($n['body']));
            $n['body'] = array_values(array_filter(array_map('s', $body)));
            if (!$n['body']) unset($n['body']);
        }
        $d[$i] = $n;
    }
    return $d;
}

function validate_speakers($d): array {
    $ids = [];
    foreach (list_of($d, 'Спикерские') as $i => $r) {
        $w = 'Спикерская «' . s($r['name'] ?? ('№' . ($i + 1))) . '»';
        $id = req($r, 'id', $w, 'Код');
        if (!preg_match('/^speaker-[a-z0-9]{6,20}$/', $id)) fail($w, 'неверный код записи');
        if (isset($ids[$id])) fail($w, 'код записи повторяется');
        $ids[$id] = true;
        req($r, 'name', $w, 'Имя');
        req($r, 'description', $w, 'Подпись');
        $src = req($r, 'src', $w, 'Аудиофайл');
        if (!url_ok($src)) fail($w, 'аудио — ссылка https:// или загруженный файл');
        $date = s($r['date'] ?? '');
        if ($date !== '' && !preg_match('/^20\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/', $date)) fail($w, 'неверная дата');
        $r['year'] = $date ? substr($date, 0, 4) : '';
        if (!in_array(s($r['fellowship'] ?? 'АА'), ['АА', 'Ал-Анон'], true)) fail($w, 'выберите АА или Ал-Анон');
        $r['hidden'] = !empty($r['hidden']);
        $d[$i] = $r;
    }
    return $d;
}

function validate_contacts($d): array {
    if (!is_array($d)) fail('Контакты', 'неверный формат');
    foreach (['phones' => 'Телефон', 'emails' => 'Почта'] as $k => $label) {
        foreach (list_of($d[$k] ?? [], $label) as $i => $c) {
            $w = $label . ' «' . s($c['label'] ?? ('№' . ($i + 1))) . '»';
            req($c, 'label', $w, 'Подпись');
            $value = req($c, 'value', $w, $k === 'phones' ? 'Номер' : 'Адрес');
            $href = s($c['href'] ?? '');
            if ($href === '') $href = $k === 'phones' ? 'tel:' . preg_replace('/[^\d+]/', '', $value) : 'mailto:' . $value;
            if (!preg_match('#^(tel:\+?\d{6,15}|mailto:[^\s@<>"]+@[^\s@<>"]+|https://[^\s<>"]+)$#', $href)) fail($w, 'проверьте номер или адрес');
            $d[$k][$i] = ['label' => s($c['label']), 'value' => $value, 'href' => $href, 'note' => opt($c, 'note', 300), 'hidden' => !empty($c['hidden'])];
        }
    }
    foreach (list_of($d['links'] ?? [], 'Ссылки') as $i => $l) {
        $w = 'Ссылка «' . s($l['title'] ?? ('№' . ($i + 1))) . '»';
        $u = req($l, 'url', $w, 'Адрес');
        if (!url_ok($u, false)) fail($w, 'ссылка должна начинаться с https://');
        $d['links'][$i] = ['url' => $u, 'title' => req($l, 'title', $w, 'Название'), 'text' => opt($l, 'text', 500), 'hidden' => !empty($l['hidden'])];
    }
    return $d;
}

function validate_settings($d): array {
    if (!is_array($d) || !preg_match('/^[a-f0-9]{64}$/', s($d['speakersPasswordSha256'] ?? ''))) fail('Настройки', 'неверный пароль спикерских');
    return ['speakersPasswordSha256' => s($d['speakersPasswordSha256']), 'speakersPasswordNote' => 'Пароль меняется в админке. Здесь хранится только его отпечаток (SHA-256).'];
}
