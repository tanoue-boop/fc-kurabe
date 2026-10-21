"""FC本部データを1つのbrands.jsonに統合・正規化する。

入力：bm_brands.json（または公式裏取り済みの bm_verified_*.json）、pilates.json、
      cleaning_benriya.json、asp_extra.json（A8案件・自社）
出力：site/data/brands.json
数値は原文から一意に読める場合だけ円に変換し、読めなければ null（原文テキストは必ず残す）。
"""
import json, re, glob, os, sys, unicodedata

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, '..', 'data', 'brands.json')

# ---------- 業種の体系（大分類 > 中分類） ----------
MAJORS = {
    'food': '飲食',
    'education': '教育・スクール',
    'fitness-beauty': 'フィットネス・美容・健康',
    'life-service': '生活サービス',
    'retail': '買取・小売',
    'care': '介護・福祉',
    'repair': 'リペア・リフォーム・住宅',
    'business': 'ビジネス・その他サービス',
}
# (BM大分類, BM小分類) -> (major_slug, minor_slug, minor_name)
MINOR_MAP = {
    ('サービス', 'ハウスクリーニング'): ('life-service', 'house-cleaning', 'ハウスクリーニング'),
    ('サービス', '運送・配送'): ('life-service', 'delivery', '運送・配送'),
    ('サービス', 'フィットネス・ジム'): ('fitness-beauty', 'gym', 'ジム・フィットネス'),
    ('サービス', '理容・美容'): ('fitness-beauty', 'beauty', '理容・美容'),
    ('サービス', '整体院'): ('fitness-beauty', 'seitai', '整体・リラクゼーション'),
    ('サービス', '結婚相談所'): ('business', 'marriage', '結婚相談所'),
    ('サービス', '興信所・探偵'): ('business', 'detective', '探偵'),
    ('サービス', 'IT'): ('business', 'it', 'IT・ネットビジネス'),
    ('サービス', 'ネットビジネス'): ('business', 'it', 'IT・ネットビジネス'),
    ('サービス', 'ネットカフェ'): ('business', 'other', 'その他サービス'),
    ('サービス', '保険'): ('business', 'other', 'その他サービス'),
    ('サービス', '不動産'): ('repair', 'real-estate', '不動産・住宅'),
    ('サービス', '住宅販売'): ('repair', 'real-estate', '不動産・住宅'),
    ('サービス', '建築'): ('repair', 'reform', 'リフォーム・建築'),
    ('サービス', '買取'): ('retail', 'kaitori', '買取'),
    ('サービス', 'その他'): ('business', 'other', 'その他サービス'),
    ('教育', '個別指導'): ('education', 'juku', '学習塾・個別指導'),
    ('教育', '学習塾'): ('education', 'juku', '学習塾・個別指導'),
    ('教育', '幼児教育'): ('education', 'kids', '幼児教育・キッズスクール'),
    ('教育', 'スクール'): ('education', 'school', 'スクール・教室'),
    ('教育', '教室'): ('education', 'school', 'スクール・教室'),
    ('小売', '買取ビジネス'): ('retail', 'kaitori', '買取'),
    ('小売', 'リサイクルショップ'): ('retail', 'kaitori', '買取'),
    ('小売', 'コンビニエンスストア'): ('retail', 'shop', '小売店・コンビニ'),
    ('小売', 'ネットショップ'): ('retail', 'shop', '小売店・コンビニ'),
    ('小売', 'アパレル'): ('retail', 'shop', '小売店・コンビニ'),
    ('小売', '自動車'): ('repair', 'car', '自動車'),
    ('小売', '中古車'): ('repair', 'car', '自動車'),
    ('小売', 'その他'): ('retail', 'shop', '小売店・コンビニ'),
    ('リペア・リフォーム', '自動車'): ('repair', 'car', '自動車'),
    ('リペア・リフォーム', '家具・革製品'): ('repair', 'repair', 'リペア'),
    ('リペア・リフォーム', '住宅リフォーム'): ('repair', 'reform', 'リフォーム・建築'),
    ('介護・福祉', 'デイサービス'): ('care', 'care', '介護・福祉'),
    ('介護・福祉', '訪問介護'): ('care', 'care', '介護・福祉'),
    ('介護・福祉', '介護'): ('care', 'care', '介護・福祉'),
    ('飲食', 'ラーメン'): ('food', 'ramen', 'ラーメン'),
    ('飲食', 'スイーツ'): ('food', 'sweets', 'スイーツ・パン'),
    ('飲食', 'パン'): ('food', 'sweets', 'スイーツ・パン'),
    ('飲食', '喫茶店'): ('food', 'cafe', 'カフェ・喫茶'),
    ('飲食', 'カフェ'): ('food', 'cafe', 'カフェ・喫茶'),
    ('飲食', '宅配'): ('food', 'takeout', 'テイクアウト・宅配・移動販売'),
    ('飲食', 'デリバリー'): ('food', 'takeout', 'テイクアウト・宅配・移動販売'),
    ('飲食', 'テイクアウト'): ('food', 'takeout', 'テイクアウト・宅配・移動販売'),
    ('飲食', '弁当'): ('food', 'takeout', 'テイクアウト・宅配・移動販売'),
    ('飲食', '移動販売'): ('food', 'takeout', 'テイクアウト・宅配・移動販売'),
}
FOOD_DEFAULT = ('food', 'restaurant', '飲食店（その他）')

TAGS = {  # slug -> 表示名
    'fukugyo': '副業から始められる',
    'mikeiken': '未経験から始められる',
    'hitori': '1人で開業できる',
    'josei': '女性が活躍',
    'mutenpo': '無店舗・自宅で開業',
    'houjin': '法人の新規事業向け',
    'zaikonashi': '在庫なし',
    'senior': '40代・定年後から',
    'fuufu': '夫婦で開業',
    'teishikin': '低資金で開業',
    'menu-add': '既存店舗にメニュー追加',
}
TAG_FROM_TEXT = {
    '副業可': 'fukugyo', '未経験可': 'mikeiken', '1人で開業': 'hitori', '女性活躍': 'josei',
    '無店舗・自宅': 'mutenpo', '法人向け': 'houjin', '在庫なし': 'zaikonashi',
    '40代・定年後': 'senior', '夫婦で': 'fuufu',
    '未経験でも安心スタート': 'mikeiken', '法人向け（事業拡張）': 'houjin', 'ローコストで開業': 'teishikin',
}

FUNDS = [  # 開業資金帯
    ('under-100', '100万円以下', 0, 1_000_000),
    ('100-300', '101〜300万円', 1_000_001, 3_000_000),
    ('300-500', '301〜500万円', 3_000_001, 5_000_000),
    ('500-1000', '501〜1,000万円', 5_000_001, 10_000_000),
    ('over-1000', '1,000万円超', 10_000_001, 10**12),
]


def z2h(s):
    return unicodedata.normalize('NFKC', s) if isinstance(s, str) else s


def parse_yen(text):
    """原文から最初の金額を円で返す。読めなければ None。"""
    if not text or not isinstance(text, str):
        return None
    t = z2h(text).replace(',', '').replace(' ', '')
    if re.match(r'^(記載なし|金額の記載なし|金額は|総額記載なし|総額の明記なし|非公開|不明|-|—)', t):
        return None
    if re.search(r'(総額の記載なし|総額記載なし|2つの記載|資本金)', t) or t in ('0万円',):
        return None
    if re.search(r'^(0円|無料|なし|不要)', t):
        return 0
    # 「1店舗あたり300万円」のような前置きの数字は飛ばし、金額らしい最初の数字を取る
    ms = list(re.finditer(r'([0-9]+(?:\.[0-9]+)?)(億|千万|百万|万|千)?(円)?', t))
    for i, m in enumerate(ms):
        n = float(m.group(1))
        unit = m.group(2)
        if n == 0 and m.group(3):  # 「0円」
            return 0
        if not unit and not m.group(3) and t[m.end():m.end() + 1] in tuple('坪席名店人台%％年ヶか回期号'):
            continue  # 坪数・席数などは金額ではない
        # 「132～418万円」の132は後ろの単位を使う
        if unit is None and t[m.end():m.end() + 1] in ('～', '〜', '-', '~') and i + 1 < len(ms) and ms[i + 1].group(2):
            unit = ms[i + 1].group(2)
        if unit is None and '千円' in t:  # 「（千円、税抜）」のような表記
            unit = '千'
        mul = {'億': 1e8, '千万': 1e7, '百万': 1e6, '万': 1e4, '千': 1e3, None: 1}[unit]
        v = n * mul
        if unit is None and v < 1000:  # 単位なしの小さい数（「1店舗あたり」の1など）は金額とみなさない
            continue
        return int(round(v))
    return None


def parse_royalty(text):
    if not text or not isinstance(text, str):
        return {'type': None, 'rate': None, 'fixed_yen': None}
    t = z2h(text)
    if re.search(r'(ロイヤリティ.?無し|ロイヤリティー無し|^0円$|^0$|^なし|^無し|ありません|一切なし|(?<![0-9,])0円)', t) and '%' not in t:
        return {'type': 'none', 'rate': None, 'fixed_yen': 0}
    if re.search(r'(×|あたり|坪)', t):  # 席数・坪数などで変わるものは数字1つにまとめない
        return {'type': 'other', 'rate': None, 'fixed_yen': None}
    rate = re.search(r'([0-9]+(?:\.[0-9]+)?)\s*[%％]', t)
    fixed = parse_yen(t) if re.search(r'(円|万)', t) else None
    if rate and fixed:
        return {'type': 'mixed', 'rate': float(rate.group(1)), 'fixed_yen': fixed}
    if rate:
        return {'type': 'rate', 'rate': float(rate.group(1)), 'fixed_yen': None}
    if fixed:
        return {'type': 'fixed', 'rate': None, 'fixed_yen': fixed}
    return {'type': None, 'rate': None, 'fixed_yen': None}


def fund_band(yen):
    if yen is None:
        return None
    for slug, _, lo, hi in FUNDS:
        if lo <= yen <= hi:
            return slug
    return None


def pick(official, key, fallback):
    if official and official.get(key):
        return official[key]
    return fallback


def slug_from_bm(url):
    s = url.rstrip('/').split('/')[-1]
    return re.sub(r'fc$', '', s) or s


def load_bm():
    files = sorted(glob.glob(os.path.join(BASE, 'bm_verified_*.json')))
    rows = []
    if files:
        for f in files:
            rows += json.load(open(f, encoding='utf-8'))
    have = {r['bm_url'] for r in rows}
    for r in json.load(open(os.path.join(BASE, 'bm_brands.json'), encoding='utf-8')):
        if r['bm_url'] not in have:
            rows.append(r)
    out = []
    for r in rows:
        off = r.get('official') or {}
        cat = (r['bm_category']['major'], r['bm_category']['minor'])
        if cat in MINOR_MAP:
            major, minor, minor_name = MINOR_MAP[cat]
        elif cat[0] == '飲食':
            major, minor, minor_name = FOOD_DEFAULT
        else:
            major, minor, minor_name = ('business', 'other', 'その他サービス')
        tags = set()
        for t in (r.get('tags') or []) + (r.get('bm_styles') or []):
            if t in TAG_FROM_TEXT:
                tags.add(TAG_FROM_TEXT[t])
        status = r.get('verify_status')
        out.append({
            'slug': slug_from_bm(r['bm_url']),
            'brand': r['brand'],
            'company': r.get('company'),
            'major': major, 'minor': minor, 'minor_name': minor_name,
            'contract_type': pick(off, 'contract_type', None) or 'フランチャイズ',
            'tags': sorted(tags),
            'franchise_fee_text': pick(off, 'franchise_fee', r.get('franchise_fee')),
            'initial_investment_text': pick(off, 'initial_investment', r.get('initial_investment')),
            'royalty_text': pick(off, 'royalty', r.get('royalty')),
            'contract_term_text': pick(off, 'contract_term', r.get('contract_term')),
            'deposit_text': off.get('deposit'),
            'training_fee_text': off.get('training_fee'),
            'self_funds_text': pick(off, 'self_funds', r.get('self_funds')),
            'store_count_text': pick(off, 'store_count', r.get('store_count')),
            'recruit_area': pick(off, 'recruit_area', r.get('recruit_area')),
            'target': pick(off, 'target', r.get('target')),
            'official_fc_url': r.get('official_fc_url') or r.get('official_url'),
            'source_type': '公式' if status == '公式で確認' else ('公式・一部BM掲載値' if status == '一部確認' else 'BMフランチャイズ掲載値'),
            'checked_date': r.get('verified_date') or r.get('checked_date'),
            'notes': r.get('notes'),
            'exits': [{'type': 'bm', 'label': '資料請求（BMフランチャイズ）', 'url': r['bm_url']}],
        })
    return out


PILATES_SLUGS = {
    'ラピラティス（La pilates）': 'la-pilates', 'BEAT PILATES': 'beat-pilates', 'Pilates KASANE': 'pilates-kasane',
    'Habit Pilates studio': 'habit-pilates', 'COCOLANCE': 'cocolance', 'ELEMENT（マシンピラティス）': 'element-pilates',
    'Club Pilates（日本）': 'club-pilates', 'Pilates isM': 'pilates-ism', 'zen place': 'zen-place',
    'LULUTO（ルルトピラティス）': 'luluto', 'PILATES AXE': 'pilates-axe', 'STUDIO IVY': 'studio-ivy',
    'TSUTAYA Conditioning PILATES': 'tsutaya-conditioning-pilates', 'Pilates Studio DEP': 'pilates-dep',
    'Repilates': 'repilates', 'WECLE': 'wecle', '5pilates': '5pilates', 'fis.pilates': 'fis-pilates',
    'SAKURA（ピラティス）': 'sakura-pilates', 'YUZU（ピラティス）': 'yuzu-pilates', 'Two Three（ツースリー）ピラティス': 'twothree-pilates',
}
CLEAN_SLUGS = {
    'おそうじ本舗': 'osoujihonpo', 'おそうじ革命': 'osoujikakumei', 'ダスキン サービスマスター': 'duskin-servicemaster',
    'ダスキン メリーメイド': 'duskin-merrymaids', 'ダイキチカバーオール': 'coverall', 'TsuNaGu（ハウスクリーニング開業支援パッケージ）': 'tsunagu',
    'FireWorks（独立開業プラン）': 'fireworks', 'ママクリーン': 'mamaclean', '便利屋お助けマスター': 'otasuke-master',
    '便利屋!お助け本舗': 'otasukehonpo', '便利屋ファミリー（町の便利屋さんファミリー）': 'benriya-family', '便利屋七福神': 'benriya-shichifukujin',
    'おうちの御用聞き 家工房': 'iekobo', 'ベンリー': 'benry', 'くらしのパートナー': 'kurashi-partner', '片付け堂': 'katazukedou',
    '遺品整理のプロ リリーフ': 'relief', 'アイ遺品整理': 'ai-ihinseiri', 'エコ・ワールド': 'eco-world',
}
CLEAN_MINOR = {
    'ハウスクリーニング': ('life-service', 'house-cleaning', 'ハウスクリーニング'),
    '家事代行': ('life-service', 'house-cleaning', 'ハウスクリーニング'),
    '便利屋': ('life-service', 'benriya', '便利屋・不用品回収・遺品整理'),
    '不用品回収・遺品整理': ('life-service', 'benriya', '便利屋・不用品回収・遺品整理'),
}


def load_research():
    out = []
    for r in json.load(open(os.path.join(BASE, 'pilates.json'), encoding='utf-8')):
        mv = r.get('media_values') or {}
        out.append(dict(
            slug=PILATES_SLUGS.get(r['brand'], re.sub(r'\W+', '-', r['brand']).strip('-').lower()),
            brand=re.sub(r'（.*?）', '', r['brand']).strip() or r['brand'], company=r.get('company'),
            major='fitness-beauty', minor='pilates', minor_name='ピラティス', contract_type='フランチャイズ', tags=[],
            franchise_fee_text=r.get('franchise_fee'), initial_investment_text=r.get('initial_investment'),
            royalty_text=r.get('royalty'), contract_term_text=r.get('contract_term'), deposit_text=r.get('deposit'),
            training_fee_text=r.get('training_fee'), self_funds_text=None, store_count_text=r.get('store_count'),
            recruit_area=r.get('recruit_area'), target=None, official_fc_url=r.get('official_fc_url'),
            source_type=r.get('source_type'), checked_date=r.get('checked_date'), notes=r.get('notes'),
            media_values=mv or None, exits=[],
        ))
    for r in json.load(open(os.path.join(BASE, 'cleaning_benriya.json'), encoding='utf-8')):
        major, minor, minor_name = CLEAN_MINOR.get(r.get('category'), ('life-service', 'benriya', '便利屋・不用品回収・遺品整理'))
        out.append(dict(
            slug=CLEAN_SLUGS.get(r['brand'], re.sub(r'\W+', '-', r['brand']).strip('-').lower()),
            brand=re.sub(r'（.*?）', '', r['brand']).strip() or r['brand'], company=r.get('company'),
            major=major, minor=minor, minor_name=minor_name, contract_type=r.get('contract_type') or 'フランチャイズ', tags=[],
            franchise_fee_text=r.get('franchise_fee'), initial_investment_text=r.get('initial_investment'),
            royalty_text=r.get('royalty'), contract_term_text=r.get('contract_term'), deposit_text=r.get('deposit'),
            training_fee_text=r.get('training_fee'), self_funds_text=None, store_count_text=r.get('store_count'),
            recruit_area=None, target=None, official_fc_url=r.get('official_fc_url'),
            source_type=r.get('source_type'), checked_date=r.get('checked_date'), notes=r.get('notes'),
            media_values=r.get('media_values') or None, exits=[],
        ))
    return out


def merge(bm, research, extra):
    by_name = {}
    out = []
    for r in research:
        by_name[r['brand']] = r
        out.append(r)
    for r in bm:
        hit = None
        for name, rr in by_name.items():
            if name and (name in r['brand'] or r['brand'] in name):
                hit = rr
                break
        if hit:  # 調査済みデータを優先し、BMの出口だけ足す
            hit['exits'] += r['exits']
            if not hit.get('official_fc_url'):
                hit['official_fc_url'] = r.get('official_fc_url')
            continue
        out.append(r)
    for e in extra:  # A8案件・自社の上書き
        tgt = next((x for x in out if x['slug'] == e['slug']), None)
        if tgt is None:
            out.append(e)
        else:
            for k, v in e.items():
                if k == 'exits':
                    tgt['exits'] = v + [x for x in tgt['exits'] if x['type'] not in {y['type'] for y in v}]
                elif v not in (None, [], ''):
                    tgt[k] = v
    return out


KEYS = ['company', 'franchise_fee_text', 'initial_investment_text', 'royalty_text', 'contract_term_text', 'deposit_text',
        'training_fee_text', 'self_funds_text', 'store_count_text', 'recruit_area', 'target', 'official_fc_url',
        'source_type', 'checked_date', 'notes', 'media_values', 'asp_programs', 'is_own']


# A8経由のリンク。BMは本部ごとの個別ページへ直接飛ばす（A8の規約でbmfc.b-mall.ne.jp内は自由に指定できる）
A8_BM = '4BEL1N+2BM+37I2+BW0YB'
# 提携申請中で、まだリンクがないA8案件（承認されたらasp_extra.jsonにa8の出口を足す）
A8_PENDING = {'fireworks', 'short-douga-ya'}


def a8_deep(mat, url):
    from urllib.parse import quote
    return f'https://px.a8.net/svt/ejp?a8mat={mat}&a8ejpredirect={quote(url, safe="")}'


def finalize(rows):
    seen = set()
    for r in rows:
        for k in KEYS:
            r.setdefault(k, None)
        r.setdefault('tags', []); r.setdefault('exits', [])
        s = r['slug']
        i = 2
        while s in seen:
            s = f"{r['slug']}-{i}"; i += 1
        r['slug'] = s; seen.add(s)
        r['franchise_fee_yen'] = parse_yen(r.get('franchise_fee_text'))
        r['initial_investment_yen'] = parse_yen(r.get('initial_investment_text'))
        r['royalty'] = parse_royalty(r.get('royalty_text'))
        r['fund_band'] = fund_band(r['initial_investment_yen'])
        if r['fund_band'] in ('under-100',) and 'teishikin' not in r['tags']:
            r['tags'] = sorted(set(r['tags']) | {'teishikin'})
        if r.get('official_fc_url') and not any(x['type'] == 'official' for x in r['exits']):
            r['exits'].append({'type': 'official', 'label': '公式サイト', 'url': r['official_fc_url']})
        order = {'own': 0, 'a8': 1, 'bm': 2, 'official': 3}
        r['exits'].sort(key=lambda x: order.get(x['type'], 9))
        for x in r['exits']:
            if x['type'] == 'bm' and 'px.a8.net' not in x['url']:
                x['url'] = a8_deep(A8_BM, x['url'])
        r['monetized'] = any(x['type'] in ('own', 'a8', 'bm') for x in r['exits'])
    photo_map = json.load(open(os.path.join(BASE, 'photo_map.json'), encoding='utf-8'))
    img = os.path.join(BASE, '..', 'public', 'img')
    for r in rows:
        # 本部ごとに作った写真があればそれを、なければ業種写真の割り当て（photo_map.json）を使う。どちらも無ければ写真なし
        if os.path.exists(os.path.join(img, 'brand', f"{r['slug']}.jpg")):
            r['photo'] = f"/img/brand/{r['slug']}.jpg"
            continue
        key = photo_map.get(r['slug'])
        if not key:
            r['photo'] = None
            continue
        variants = [key] + [f'{key}-{i}' for i in range(2, 4) if os.path.exists(os.path.join(img, 'gyoshu', f'{key}-{i}.jpg'))]
        pick = variants[sum(map(ord, r['slug'])) % len(variants)]
        r['photo'] = f'/img/gyoshu/{pick}.jpg'
    # 収益の出口がない本部は載せない
    return [r for r in rows if r['monetized'] or r['slug'] in A8_PENDING]


def main():
    extra_path = os.path.join(BASE, 'asp_extra.json')
    extra = json.load(open(extra_path, encoding='utf-8')) if os.path.exists(extra_path) else []
    rows = finalize(merge(load_bm(), load_research(), extra))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    meta = {'majors': MAJORS, 'tags': TAGS, 'funds': [{'slug': s, 'name': n} for s, n, _, _ in FUNDS]}
    json.dump({'meta': meta, 'brands': rows}, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    from collections import Counter
    print('brands', len(rows), 'monetized', sum(r['monetized'] for r in rows))
    print('minor', Counter(r['minor'] for r in rows).most_common())
    print('fund', Counter(r['fund_band'] for r in rows))
    print('ini_null', sum(r['initial_investment_yen'] is None for r in rows))


if __name__ == '__main__':
    main()
