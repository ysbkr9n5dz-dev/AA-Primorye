#!/usr/bin/env python3
"""Собирает v2/content/*.json в один файл v2/content/content.js.

Источник правды — JSON-файлы в v2/content/. Их правит админка (позже) или человек.
content.js — производный файл: сайт загружает его до остальных скриптов.
Запуск: python3 tools/build_content.py  (из корня репозитория)
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent / 'v2' / 'content'
PARTS = ['schedule', 'online', 'news', 'speakers', 'contacts', 'selftest', 'readings']


def main():
    data = {}
    for name in PARTS:
        path = ROOT / f'{name}.json'
        try:
            data[name] = json.loads(path.read_text(encoding='utf-8'))
        except Exception as error:  # не собираем сайт из битых данных
            sys.exit(f'Ошибка в {path.name}: {error}. content.js не изменён.')
    payload = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
    out = ROOT / 'content.js'
    tmp = out.with_suffix('.tmp')
    tmp.write_text('/* Собрано из v2/content/*.json. Не править вручную. */\nwindow.AA_CONTENT=' + payload + ';\n', encoding='utf-8')
    tmp.replace(out)
    print(f'content.js: {out.stat().st_size // 1024} КБ, разделы: {", ".join(PARTS)}')


if __name__ == '__main__':
    main()
