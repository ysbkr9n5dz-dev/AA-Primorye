"""Refresh AA25 daily reflections inside the independent v2 site."""
from pathlib import Path
import html
import json
import re
import urllib.request

page = Path('v2/index.html')
source = page.read_text()
pattern = r'(<script id="reading-archive" type="application/json">)(.*?)(</script>)'
match = re.search(pattern, source, re.S)
if not match:
    raise RuntimeError('The v2 readings archive was not found; no files changed.')
archive = json.loads(match.group(2))
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
payload = json.dumps(archive, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
updated = source[:match.start(2)] + payload + source[match.end(2):]
page.write_text(updated)
print(f'Refreshed {len(seen)} source entries; {len(archive)} dates available.')
