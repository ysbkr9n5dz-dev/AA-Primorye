<?php
/* Создание пользователей админки.
 *  Через консоль сервера:   php admin/setup.php <логин> "<Имя>"   — пароль спросит.
 *  Через браузер (если нет консоли): впишите ключ в admin/private/config.php
 *  ('setup_key' => 'длинная-случайная-строка'), откройте admin/setup.php?key=...,
 *  создайте пользователей и сразу удалите ключ из config.php.
 */
declare(strict_types=1);
require __DIR__ . '/lib.php';

if (PHP_SAPI === 'cli') {
    [$self, $login, $name] = $argv + [null, null, ''];
    if (!$login) { fwrite(STDERR, "Использование: php admin/setup.php <логин> \"<Имя>\"\n"); exit(1); }
    fwrite(STDOUT, "Пароль для $login (не короче 10 символов): ");
    system('stty -echo 2>/dev/null'); $p = trim((string)fgets(STDIN)); system('stty echo 2>/dev/null'); fwrite(STDOUT, "\n");
    try { add_user($login, $p, $name); log_event('setup', 'пользователь создан', $login); echo "Готово: $login\n"; }
    catch (Throwable $e) { fwrite(STDERR, $e->getMessage() . "\n"); exit(1); }
    exit(0);
}

security_headers();
$key = (string)config()['setup_key'];
if ($key === '' || !hash_equals($key, (string)($_GET['key'] ?? $_POST['key'] ?? ''))) { http_response_code(404); exit('Not found'); }
$msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try { add_user((string)$_POST['login'], (string)$_POST['password'], (string)($_POST['name'] ?? '')); log_event('setup', 'пользователь создан', (string)$_POST['login']); $msg = 'Пользователь создан. Когда создадите всех, удалите setup_key из config.php.'; }
    catch (Throwable $e) { $msg = 'Ошибка: ' . $e->getMessage(); }
}
?><!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Настройка админки</title><link rel="stylesheet" href="admin.css">
<main class="login"><form method="post" class="login-card">
<h1>Новый пользователь</h1><p class="muted">Уже есть: <?= htmlspecialchars(implode(', ', array_keys(users())) ?: 'никого') ?></p>
<?php if ($msg): ?><p class="warn"><?= htmlspecialchars($msg) ?></p><?php endif; ?>
<input type="hidden" name="key" value="<?= htmlspecialchars($key) ?>">
<label>Логин<input name="login" required autocapitalize="none"></label>
<label>Имя<input name="name" placeholder="Например: Роман"></label>
<label>Пароль (не короче 10 символов)<input name="password" type="password" required minlength="10"></label>
<button class="primary">Создать</button></form></main></html>
