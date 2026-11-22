<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';
security_headers();
start_session();
$user = current_user();
$logged = $user && isset(users()[$user]);
$noUsers = !users();
$csrf = htmlspecialchars($_SESSION['csrf'], ENT_QUOTES);
?><!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="csrf" content="<?= $csrf ?>">
<title>Админка · АА Приморья</title>
<link rel="icon" href="../favicon.ico">
<link rel="stylesheet" href="admin.css?v=<?= ADMIN_VERSION ?>">
</head>
<body>
<?php if (!$logged): ?>
<main class="login">
  <form id="login-form" class="login-card" autocomplete="on">
    <img src="../assets/images/icon-192.png" alt="" width="64" height="64">
    <h1>Админка сайта</h1>
    <p class="muted">Анонимные Алкоголики · Приморский край</p>
    <?php if ($noUsers): ?>
      <p class="warn">Пользователи ещё не созданы. Создайте их командой <code>php admin/setup.php</code> на сервере или откройте <code>setup.php</code> с ключом настройки.</p>
    <?php endif; ?>
    <label>Логин<input name="login" autocomplete="username" required autocapitalize="none" spellcheck="false"></label>
    <label>Пароль<input name="password" type="password" autocomplete="current-password" required></label>
    <p id="login-error" class="error" role="alert" hidden></p>
    <button type="submit" class="primary">Войти</button>
  </form>
</main>
<?php else: ?>
<div id="app" data-user="<?= htmlspecialchars($user, ENT_QUOTES) ?>" data-name="<?= htmlspecialchars(users()[$user]['name'] ?? $user, ENT_QUOTES) ?>"></div>
<?php endif; ?>
<script src="schema.js?v=<?= ADMIN_VERSION ?>"></script>
<script src="admin.js?v=<?= ADMIN_VERSION ?>"></script>
</body>
</html>
