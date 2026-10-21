"""incoming/ に置いた業種写真（ブラウザ画面の取り込み）を、サイト用のJPEGに整える。

取り込み画像は画面の左側に写真、右側に黒い余白がある。黒い余白を切り落として
3:2 に整え、public/img/gyoshu/<名前>.jpg（hero だけ public/img/hero.jpg）に保存する。
使い方: python3 scripts/import-photos.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'incoming'
OUT = ROOT / 'public' / 'img'


def photo_box(im: Image.Image):
    """右側の黒い余白を除いた写真の範囲を返す"""
    w, h = im.size
    px = im.convert('L').load()
    right = w
    for x in range(w - 1, 0, -1):
        col = [px[x, y] for y in range(0, h, max(1, h // 40))]
        if sum(v > 18 for v in col) > len(col) * 0.25:
            right = x + 1
            break
    return (0, 0, right, h)


def to_3_2(im: Image.Image):
    w, h = im.size
    target = w / h
    if abs(target - 1.5) < 0.01:
        return im
    if target > 1.5:
        nw = round(h * 1.5)
        left = (w - nw) // 2
        return im.crop((left, 0, left + nw, h))
    nh = round(w / 1.5)
    top = (h - nh) // 2
    return im.crop((0, top, w, top + nh))


def main():
    (OUT / 'gyoshu').mkdir(parents=True, exist_ok=True)
    done = []
    for p in sorted(SRC.glob('*.png')):
        im = Image.open(p).convert('RGB')
        im = to_3_2(im.crop(photo_box(im)))
        name = p.stem
        if name.startswith('b-'):  # 本部ごとの写真
            (OUT / 'brand').mkdir(parents=True, exist_ok=True)
            dest = OUT / 'brand' / f'{name[2:]}.jpg'
            im.resize((960, 640), Image.LANCZOS).save(dest, quality=82, optimize=True, progressive=True)
        elif name == 'hero':
            dest = OUT / 'hero.jpg'
            im.save(dest, quality=84, optimize=True, progressive=True)
        else:
            dest = OUT / 'gyoshu' / f'{name}.jpg'
            im.resize((960, 640), Image.LANCZOS).save(dest, quality=82, optimize=True, progressive=True)
        done.append(f'{name}: {im.size[0]}x{im.size[1]} -> {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024}KB)')
    print('\n'.join(done) or 'incoming/ に画像がありません')


if __name__ == '__main__':
    main()
