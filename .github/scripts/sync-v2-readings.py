"""Пополняет архив «Ежедневных размышлений» (v2/content/readings.json) с aa25.ru
и пересобирает v2/content/content.js. Пока на aa25.ru публикуются новые дни —
бот их забирает; когда год будет собран целиком, этот шаг можно отключить."""
from pathlib import Path
import html
import json
import re
import subprocess
import urllib.request

path = Path('v2/content/readings.json')
archive = json.loads(path.read_text(encoding='utf-8'))
months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
url = 'https://aa25.ru/wp-json/wp/v2/posts?per_page=100&_fields=title,content,link,date&orderby=date&order=desc'
with urllib.request.urlopen(url, timeout=45) as response:
    posts = json.load(response)
seen = set()
for post in posts:
    title = html.unescape(re.sub('<[^>]+>', '', post.get('title', {}).get('rendered', ''))).strip().lower()
    date = re.fullmatch(r'(\d{1,2})\s+(' + '|'.join(months) + ')', title)
    if not date:
        continue
    key = f'{months.index(date.group(2))+1:02d}-{int(date.group(1)):02d}'
    if key not in seen:
        archive[key] = post
        seen.add(key)
if not seen:
    raise RuntimeError('AA25 did not return daily reflections; existing archive preserved.')
path.write_text(json.dumps(dict(sorted(archive.items())), ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
subprocess.run(['python3', 'tools/build_content.py'], check=True)
print(f'Refreshed {len(seen)} source entries; {len(archive)} dates available.')
