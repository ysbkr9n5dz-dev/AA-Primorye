<?php
/* API админки. Все действия — POST с JSON и заголовком X-CSRF. */
declare(strict_types=1);
require __DIR__ . '/lib.php';
require __DIR__ . '/validate.php';

security_headers();
start_session();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['error' => 'Только POST'], 405);
$isUpload = isset($_GET['upload']);
$in = $isUpload ? $_POST : (json_decode((string)file_get_contents('php://input'), true) ?: []);
$action = (string)($isUpload ? 'upload' : ($in['action'] ?? ''));

if ($action === 'login') {
    if (!hash_equals($_SESSION['csrf'], (string)($_SERVER['HTTP_X_CSRF'] ?? ''))) json_out(['error' => 'Обновите страницу и попробуйте снова.'], 403);
    [$ok, $msg] = try_login((string)($in['login'] ?? ''), (string)($in['password'] ?? ''));
    $ok ? json_out(['ok' => true, 'csrf' => $_SESSION['csrf']]) : json_out(['error' => $msg], 401);
}

$user = current_user();
if (!$user || !isset(users()[$user])) json_out(['error' => 'Войдите снова.', 'relogin' => true], 401);
if (!hash_equals($_SESSION['csrf'], (string)($_SERVER['HTTP_X_CSRF'] ?? ''))) json_out(['error' => 'Сессия устарела. Обновите страницу.'], 403);

try {
    switch ($action) {
        case 'me':
            json_out(['user' => $user, 'name' => users()[$user]['name'] ?? $user]);

        case 'logout':
            log_event($user, 'выход', '');
            $_SESSION = [];
            session_regenerate_id(true);
            json_out(['ok' => true]);

        case 'load':
            $name = (string)($in['file'] ?? '');
            if (!in_array($name, EDITABLE, true)) throw new InvalidArgumentException('Неизвестный раздел.');
            $data = read_content($name);
            if ($name === 'settings') $data = ['speakersPasswordSet' => !empty($data['speakersPasswordSha256'])];
            json_out(['data' => $data, 'version' => version_of($name)]);

        case 'save':
            $name = (string)($in['file'] ?? '');
            if (!in_array($name, EDITABLE, true) || $name === 'settings') throw new InvalidArgumentException('Неизвестный раздел.');
            if (($in['version'] ?? '') !== version_of($name)) json_out(['error' => 'Этот раздел только что изменил другой редактор. Список обновлён — проверьте его правки и повторите своё действие.', 'conflict' => true], 409);
            $data = validate_content($name, $in['data'] ?? null);
            write_content($name, $data, $user, (string)($in['summary'] ?? ''));
            json_out(['ok' => true, 'version' => version_of($name), 'data' => $data]);

        case 'speakers-password':
            $p = trim((string)($in['password'] ?? ''));
            if (mb_strlen($p) < 4) throw new InvalidArgumentException('Пароль спикерских — не короче 4 символов.');
            write_content('settings', validate_settings(['speakersPasswordSha256' => hash('sha256', $p)]), $user, 'смена пароля спикерских');
            json_out(['ok' => true]);

        case 'my-password':
            $u = users();
            if (!password_verify((string)($in['old'] ?? ''), $u[$user]['hash'])) throw new InvalidArgumentException('Текущий пароль введён неверно.');
            check_password_strength((string)($in['new'] ?? ''));
            $u[$user]['hash'] = password_hash((string)$in['new'], PASSWORD_DEFAULT);
            save_users($u);
            log_event($user, 'смена своего пароля', '');
            json_out(['ok' => true]);

        case 'backups':
            $name = (string)($in['file'] ?? '');
            if (!in_array($name, EDITABLE, true)) throw new InvalidArgumentException('Неизвестный раздел.');
            json_out(['backups' => list_backups($name)]);

        case 'restore':
            $name = (string)($in['file'] ?? '');
            if (!in_array($name, EDITABLE, true)) throw new InvalidArgumentException('Неизвестный раздел.');
            restore_backup($name, (string)($in['id'] ?? ''), $user);
            json_out(['ok' => true, 'version' => version_of($name)]);

        case 'log':
            json_out(['log' => array_map(fn($e) => array_diff_key($e, ['ip' => 1]), array_slice(private_read('log', []), 0, 200))]);

        case 'upload':
            $kind = (string)($in['kind'] ?? '');
            $rule = UPLOAD_RULES[$kind] ?? null;
            $f = $_FILES['file'] ?? null;
            if (!$rule || !$f) throw new InvalidArgumentException('Файл не получен.');
            if ($f['error'] === UPLOAD_ERR_INI_SIZE || $f['error'] === UPLOAD_ERR_FORM_SIZE) throw new InvalidArgumentException('Файл больше, чем разрешает сервер (' . ini_get('upload_max_filesize') . '). Попросите администратора сервера увеличить upload_max_filesize и post_max_size.');
            if ($f['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp_name'])) throw new InvalidArgumentException('Файл не загрузился, попробуйте ещё раз.');
            if ($f['size'] > $rule['max']) throw new InvalidArgumentException('Файл слишком большой: до ' . round($rule['max'] / 1048576) . ' МБ.');
            $ext = strtolower(pathinfo((string)$f['name'], PATHINFO_EXTENSION));
            $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']) ?: '';
            if (!in_array($ext, $rule['ext'], true) || !in_array($mime, $rule['mime'], true)) throw new InvalidArgumentException('Этот тип файла здесь не подходит: нужны ' . implode(', ', $rule['ext']) . '.');
            if ($kind === 'image' && !@getimagesize($f['tmp_name'])) throw new InvalidArgumentException('Файл не похож на изображение.');
            $sub = date('Y/m');
            $dir = MEDIA_DIR . '/' . $sub;
            if (!is_dir($dir) && !mkdir($dir, 0755, true)) throw new RuntimeException('Не удалось создать папку media. Проверьте права.');
            $base = preg_replace('/[^a-z0-9-]+/', '-', strtolower(translit(pathinfo((string)$f['name'], PATHINFO_FILENAME))));
            $name = trim(substr($base, 0, 50), '-') ?: 'file';
            $name .= '-' . bin2hex(random_bytes(3)) . '.' . ($ext === 'jpeg' ? 'jpg' : $ext);
            if (!move_uploaded_file($f['tmp_name'], $dir . '/' . $name)) throw new RuntimeException('Не удалось сохранить файл.');
            @chmod($dir . '/' . $name, 0644);
            log_event($user, 'загрузка файла', "media/$sub/$name");
            json_out(['ok' => true, 'path' => "media/$sub/$name", 'size' => $f['size']]);
    }
    json_out(['error' => 'Неизвестное действие.'], 400);
} catch (Invalid $e) {
    json_out(['error' => $e->getMessage()], 422);
} catch (InvalidArgumentException $e) {
    json_out(['error' => $e->getMessage()], 422);
} catch (Throwable $e) {
    error_log('[aa-admin] ' . $e);
    json_out(['error' => 'Не удалось выполнить действие: ' . $e->getMessage()], 500);
}

function translit(string $s): string {
    $map = ['а'=>'a','б'=>'b','в'=>'v','г'=>'g','д'=>'d','е'=>'e','ё'=>'e','ж'=>'zh','з'=>'z','и'=>'i','й'=>'y','к'=>'k','л'=>'l','м'=>'m','н'=>'n','о'=>'o','п'=>'p','р'=>'r','с'=>'s','т'=>'t','у'=>'u','ф'=>'f','х'=>'h','ц'=>'ts','ч'=>'ch','ш'=>'sh','щ'=>'sch','ъ'=>'','ы'=>'y','ь'=>'','э'=>'e','ю'=>'yu','я'=>'ya'];
    return strtr(mb_strtolower($s), $map);
}
