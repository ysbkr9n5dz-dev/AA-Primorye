<?php
/* Админка сайта АА Приморья: общие функции.
 * Данные сайта: ../content/*.json (их читает сайт), файлы: ../media/.
 * Служебные данные админки (пользователи, журнал, копии, блокировки) — в private/,
 * каждый файл начинается с "<?php exit; ?>", поэтому через браузер их не прочитать
 * даже на сервере nginx, где .htaccess не работает.
 */
declare(strict_types=1);

const ADMIN_VERSION = '1.0';
define('SITE_DIR', dirname(__DIR__));
define('CONTENT_DIR', SITE_DIR . '/content');
define('MEDIA_DIR', SITE_DIR . '/media');
define('PRIVATE_DIR', __DIR__ . '/private');
const GUARD = "<?php exit; ?>\n";

/* Файлы, которые админка может править, и что из них попадает в content.js */
const EDITABLE = ['schedule', 'online', 'news', 'speakers', 'contacts', 'settings'];
const BUNDLE = ['schedule', 'online', 'news', 'contacts', 'selftest', 'settings'];
const EXTRA = ['readings', 'speakers'];

const UPLOAD_RULES = [
    'image' => ['ext' => ['jpg', 'jpeg', 'png', 'webp'], 'mime' => ['image/jpeg', 'image/png', 'image/webp'], 'max' => 10 * 1024 * 1024],
    'pdf'   => ['ext' => ['pdf'], 'mime' => ['application/pdf'], 'max' => 60 * 1024 * 1024],
    'audio' => ['ext' => ['mp3', 'm4a'], 'mime' => ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'application/octet-stream'], 'max' => 250 * 1024 * 1024],
];

function config(): array {
    static $cfg = null;
    if ($cfg === null) {
        $file = PRIVATE_DIR . '/config.php';
        $cfg = (is_file($file) ? (include $file) : []) + [
            'session_hours' => 12,
            'max_attempts' => 5,          // неудачных входов подряд
            'lock_minutes' => 15,         // на сколько блокировать
            'keep_backups' => 60,         // копий на каждый файл
            'setup_key' => '',            // ключ первичной настройки (пусто — выключено)
        ];
    }
    return $cfg;
}

/* ---------- служебные файлы private/*.php ---------- */
function private_path(string $name): string { return PRIVATE_DIR . '/' . $name . '.php'; }
function private_read(string $name, $default) {
    $f = private_path($name);
    if (!is_file($f)) return $default;
    $raw = substr((string)file_get_contents($f), strlen(GUARD));
    $data = json_decode($raw, true);
    return $data === null ? $default : $data;
}
function private_write(string $name, $data): void {
    if (!is_dir(PRIVATE_DIR)) mkdir(PRIVATE_DIR, 0750, true);
    atomic_write(private_path($name), GUARD . json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}
function atomic_write(string $file, string $data): void {
    $tmp = $file . '.tmp-' . bin2hex(random_bytes(4));
    if (file_put_contents($tmp, $data, LOCK_EX) === false) throw new RuntimeException('Не удалось записать файл. Проверьте права на папку.');
    if (!rename($tmp, $file)) { @unlink($tmp); throw new RuntimeException('Не удалось сохранить файл.'); }
}

/* ---------- пользователи ---------- */
function users(): array { return private_read('users', []); }
function save_users(array $users): void { private_write('users', $users); }
function add_user(string $login, string $password, string $name = ''): void {
    $login = mb_strtolower(trim($login));
    if (!preg_match('/^[a-z0-9._-]{3,32}$/', $login)) throw new InvalidArgumentException('Логин: 3–32 латинских буквы, цифры, точка, дефис.');
    check_password_strength($password);
    $users = users();
    $users[$login] = ['name' => $name ?: $login, 'hash' => password_hash($password, PASSWORD_DEFAULT), 'created' => date('c')];
    save_users($users);
}
function check_password_strength(string $p): void {
    if (mb_strlen($p) < 10) throw new InvalidArgumentException('Пароль администратора — не короче 10 символов.');
}

/* ---------- сессия и защита ---------- */
function start_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    session_name('aa_admin');
    session_set_cookie_params(['lifetime' => 0, 'path' => dirname($_SERVER['SCRIPT_NAME']) . '/', 'secure' => $https, 'httponly' => true, 'samesite' => 'Strict']);
    session_start();
    $limit = config()['session_hours'] * 3600;
    if (!empty($_SESSION['user']) && time() - ($_SESSION['seen'] ?? 0) > $limit) { $_SESSION = []; session_regenerate_id(true); }
    if (!empty($_SESSION['user'])) $_SESSION['seen'] = time();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
}
function current_user(): ?string { return $_SESSION['user'] ?? null; }
function client_ip(): string { return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'; }

function login_locked(string $login): int {
    $a = private_read('attempts', []);
    $key = hash('sha256', mb_strtolower($login) . '|' . client_ip());
    $rec = $a[$key] ?? null;
    if (!$rec) return 0;
    $left = $rec['until'] - time();
    return $left > 0 ? $left : 0;
}
function note_attempt(string $login, bool $ok): void {
    $a = private_read('attempts', []);
    $key = hash('sha256', mb_strtolower($login) . '|' . client_ip());
    foreach ($a as $k => $r) if (($r['until'] ?? 0) < time() - 86400) unset($a[$k]);
    if ($ok) { unset($a[$key]); private_write('attempts', $a); return; }
    $r = $a[$key] ?? ['fails' => 0, 'until' => 0];
    $r['fails']++;
    if ($r['fails'] >= config()['max_attempts']) { $r['until'] = time() + config()['lock_minutes'] * 60; $r['fails'] = 0; }
    $a[$key] = $r;
    private_write('attempts', $a);
}
function try_login(string $login, string $password): array {
    $login = mb_strtolower(trim($login));
    if ($left = login_locked($login)) return [false, 'Слишком много попыток. Повторите через ' . ceil($left / 60) . ' мин.'];
    $u = users()[$login] ?? null;
    $ok = $u && password_verify($password, $u['hash']);
    if (!$u) password_verify($password, '$2y$10$abcdefghijklmnopqrstuuJ0Q9Y1YQ6m2bX6zJm6x3n8cGQ8ZJmS'); // одинаковое время ответа
    note_attempt($login, $ok);
    if (!$ok) { log_event($login ?: '?', 'вход', 'неверный логин или пароль'); return [false, 'Неверный логин или пароль.']; }
    session_regenerate_id(true);
    $_SESSION['user'] = $login;
    $_SESSION['seen'] = time();
    $_SESSION['csrf'] = bin2hex(random_bytes(16));
    log_event($login, 'вход', '');
    return [true, ''];
}

/* ---------- журнал ---------- */
function log_event(string $user, string $action, string $detail): void {
    $log = private_read('log', []);
    array_unshift($log, ['at' => date('c'), 'user' => $user, 'action' => $action, 'detail' => mb_substr($detail, 0, 300), 'ip' => client_ip()]);
    private_write('log', array_slice($log, 0, 500));
}

/* ---------- данные сайта ---------- */
function content_path(string $name): string {
    if (!in_array($name, array_merge(EDITABLE, BUNDLE, EXTRA), true)) throw new InvalidArgumentException('Неизвестный раздел.');
    return CONTENT_DIR . '/' . $name . '.json';
}
function read_content(string $name) {
    $raw = @file_get_contents(content_path($name));
    if ($raw === false) throw new RuntimeException("Нет файла $name.json");
    $data = json_decode($raw, true);
    if ($data === null) throw new RuntimeException("Файл $name.json повреждён");
    return $data;
}
function version_of(string $name): string { return substr(sha1((string)@file_get_contents(content_path($name))), 0, 12); }

function backup_content(string $name, string $user): void {
    $dir = PRIVATE_DIR . '/backups';
    if (!is_dir($dir)) mkdir($dir, 0750, true);
    $raw = (string)@file_get_contents(content_path($name));
    if ($raw === '') return;
    $file = $dir . '/' . $name . '-' . date('Ymd-His') . '-' . preg_replace('/[^a-z0-9._-]/', '', $user) . '.php';
    file_put_contents($file, GUARD . $raw, LOCK_EX);
    $all = glob($dir . '/' . $name . '-*.php') ?: [];
    rsort($all);
    foreach (array_slice($all, config()['keep_backups']) as $old) @unlink($old);
}
function list_backups(string $name): array {
    $out = [];
    foreach (glob(PRIVATE_DIR . '/backups/' . $name . '-*.php') ?: [] as $f) {
        if (preg_match('/-(\d{8})-(\d{6})-([a-z0-9._-]*)\.php$/', $f, $m)) {
            $out[] = ['id' => basename($f, '.php'), 'at' => DateTime::createFromFormat('Ymd His', $m[1] . ' ' . $m[2])->format('c'), 'user' => $m[3], 'size' => filesize($f)];
        }
    }
    usort($out, fn($a, $b) => strcmp($b['at'], $a['at']));
    return $out;
}
function restore_backup(string $name, string $id, string $user): void {
    if (!preg_match('/^' . preg_quote($name, '/') . '-\d{8}-\d{6}-[a-z0-9._-]*$/', $id)) throw new InvalidArgumentException('Неверная копия.');
    $f = PRIVATE_DIR . '/backups/' . $id . '.php';
    if (!is_file($f)) throw new RuntimeException('Копия не найдена.');
    $data = json_decode(substr((string)file_get_contents($f), strlen(GUARD)), true);
    if ($data === null) throw new RuntimeException('Копия повреждена.');
    write_content($name, $data, $user, 'восстановление из копии ' . $id);
}

function write_content(string $name, $data, string $user, string $detail): void {
    backup_content($name, $user);
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false) throw new RuntimeException('Не удалось сохранить данные.');
    atomic_write(content_path($name), $json . "\n");
    build_bundle();
    log_event($user, 'сохранение: ' . $name, $detail);
}

/* Тот же результат, что tools/build_content.py: сайт читает content/content.js */
function build_bundle(): void {
    $data = [];
    foreach (BUNDLE as $name) $data[$name] = read_content($name);
    $data['settings']['speakersVersion'] = substr(sha1((string)file_get_contents(content_path('speakers'))), 0, 10);
    $data['settings']['readingsVersion'] = substr(sha1((string)file_get_contents(content_path('readings'))), 0, 10);
    unset($data['settings']['speakersPasswordNote']);
    $payload = str_replace('<', '<', json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    atomic_write(CONTENT_DIR . '/content.js', "/* Собрано из v2/content/*.json. Не править вручную. */\nwindow.AA_CONTENT=" . $payload . ";\n");
}

/* ---------- ответы API ---------- */
function json_out(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function security_headers(): void {
    header('X-Frame-Options: DENY');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: same-origin');
    header("Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; media-src 'self' https:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
}
