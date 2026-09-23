"""
Fontları kullanılan ağırlık aralığına ve Türkçe için gereken karakterlere indirger.
Her aile için iki dosya üretir:
  <aile>-latin.woff2 : Basic Latin + Latin-1 + tipografik işaretler
  <aile>-tr.woff2    : yalnızca ğ Ğ ı İ ş Ş ve ₺ (unicode-range ile ayrı yüklenir)
Çıktı: src/assets/fonts/ (depoya eklenir; Vercel derlemesinde çalışmaz).

Gerekli: pip install fonttools brotli
Kullanım: python scripts/subset-fonts.py
"""
import io
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "node_modules" / "@fontsource-variable"
OUT = ROOT / "src" / "assets" / "fonts"
OUT.mkdir(parents=True, exist_ok=True)

LATIN = "U+0020-007E,U+00A0-00FF,U+2013-2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2039-203A,U+20AC,U+2192,U+2212,U+2009,U+202F"
TURKISH = "U+011E-011F,U+0130-0131,U+015E-015F,U+20BA"

FONTS = [
    ("outfit", (500, 800)),
    ("inter", (400, 700)),
    ("jetbrains-mono", (400, 700)),
]


def make(src, unicodes, wght, out):
    font = TTFont(src)
    font = instancer.instantiateVariableFont(font, {"wght": wght})
    buf = io.BytesIO()
    font.flavor = None
    font.save(buf)
    buf.seek(0)
    font = TTFont(buf)
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    s = subset.Subsetter(opts)
    s.populate(unicodes=subset.parse_unicodes(unicodes))
    s.subset(font)
    font.flavor = "woff2"
    font.save(out)
    print(f"{out.name}: {out.stat().st_size / 1024:.1f} KB")


for pkg, wght in FONTS:
    files = SRC / pkg / "files"
    make(files / f"{pkg}-latin-wght-normal.woff2", LATIN, wght, OUT / f"{pkg}-latin.woff2")
    make(files / f"{pkg}-latin-ext-wght-normal.woff2", TURKISH, wght, OUT / f"{pkg}-tr.woff2")
