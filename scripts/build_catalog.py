#!/usr/bin/env python3
"""Build or validate the small homepage catalog; never bundle guide contents."""
import argparse
import datetime
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def build(root):
    items = []
    for folder in sorted((root / 'guides').iterdir()):
        if not folder.is_dir():
            continue
        metadata = folder / 'guide.json'
        if not metadata.exists():
            raise ValueError(f'{folder.name}: guide.json отсутствует')
        item = json.loads(metadata.read_text(encoding='utf-8'))
        slug = item.get('id', '')
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug) or slug != folder.name:
            raise ValueError(f'{folder.name}: id должен совпадать с именем папки')
        for key in ('title', 'description'):
            if not isinstance(item.get(key), str) or not item[key].strip():
                raise ValueError(f'{slug}: нужно поле {key}')
        if not isinstance(item.get('outcomes'), list) or not 1 <= len(item['outcomes']) <= 5 or not all(isinstance(t, str) and t.strip() for t in item['outcomes']):
            raise ValueError(f'{slug}: outcomes должен содержать 1–5 проверяемых действий')
        if not isinstance(item.get('tags'), list) or not all(isinstance(t, str) for t in item['tags']):
            raise ValueError(f'{slug}: tags должен быть списком строк')
        datetime.date.fromisoformat(item['added'])
        if not isinstance(item.get('order', 1000), int):
            raise ValueError(f'{slug}: order должен быть целым числом')
        if not isinstance(item.get('note', ''), str):
            raise ValueError(f'{slug}: note должен быть строкой')
        page = folder / 'index.html'
        if not page.is_file():
            raise ValueError(f'{slug}: index.html отсутствует')
        if 'href="../../"' not in page.read_text(encoding='utf-8'):
            raise ValueError(f'{slug}: нужна ссылка в каталог href="../../"')
        public = {key: item[key] for key in ('id', 'title', 'description', 'outcomes', 'tags', 'added')}
        public.update(path=f'guides/{slug}/', note=item.get('note', 'Полный разбор и практика'))
        items.append((item.get('order', 1000), public))
    items.sort(key=lambda pair: (pair[0], -datetime.date.fromisoformat(pair[1]['added']).toordinal(), pair[1]['id']))
    return json.dumps({'version': 2, 'items': [item for _, item in items]}, ensure_ascii=False, indent=2) + '\n'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Проверить каталог без изменения файлов')
    args = parser.parse_args()
    generated = build(ROOT)
    catalog = ROOT / 'catalog.json'
    if args.check:
        if not catalog.is_file() or catalog.read_text(encoding='utf-8') != generated:
            raise SystemExit('catalog.json устарел. Запусти python3 scripts/build_catalog.py')
        print('OK: каталог актуален, пути и обратные ссылки проверены')
    else:
        catalog.write_text(generated, encoding='utf-8')
        print(f'Каталог обновлён: {len(json.loads(generated)["items"])} материалов')


if __name__ == '__main__':
    main()
