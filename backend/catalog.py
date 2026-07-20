"""Dapper Den catalog — 10+ products per category, unique type-accurate imagery."""


def PX(i):
    return f"https://images.pexels.com/photos/{i}/pexels-photo-{i}.jpeg?auto=compress&cs=tinysrgb&w=800"


def UN(slug):
    return f"https://images.unsplash.com/photo-{slug}?w=800&q=80"


CATEGORIES = [
    {"id": "t-shirts", "name": "T-Shirts", "slug": "t-shirts", "image": PX(36942017)},
    {"id": "oversized", "name": "Oversized", "slug": "oversized", "image": PX(36942018)},
    {"id": "hoodies", "name": "Hoodies", "slug": "hoodies", "image": PX(8346261)},
    {"id": "joggers", "name": "Joggers", "slug": "joggers", "image": PX(5696896)},
    {"id": "shirts", "name": "Shirts", "slug": "shirts", "image": PX(28938765)},
    {"id": "accessories", "name": "Accessories", "slug": "accessories", "image": UN("1533603531139-2c4d04df8f16")},
]

COLLECTIONS = [
    {"id": "cosmic-heroes", "name": "Cosmic Heroes", "slug": "cosmic-heroes", "tagline": "Guardians of the galaxy grid", "banner": "https://images.unsplash.com/photo-1677357623576-7c8aab08da22?w=1600&q=80", "accent": "#7c5cff"},
    {"id": "anime-legends", "name": "Anime Legends", "slug": "anime-legends", "tagline": "Ink, neon & battle cries", "banner": "https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1600&q=80", "accent": "#ff2fb0"},
    {"id": "shadow-vigilante", "name": "Shadow Vigilante", "slug": "shadow-vigilante", "tagline": "Born from the dark", "banner": "https://images.unsplash.com/photo-1687844599821-e0eceea6f6a1?w=1600&q=80", "accent": "#3dd7ff"},
    {"id": "wizard-world", "name": "Wizard World", "slug": "wizard-world", "tagline": "Magic stitched in", "banner": "https://images.unsplash.com/photo-1550100136-e092101726f4?w=1600&q=80", "accent": "#c6ff3d"},
    {"id": "squad-goals", "name": "Squad Goals", "slug": "squad-goals", "tagline": "For the whole crew", "banner": "https://images.pexels.com/photos/28122495/pexels-photo-28122495.jpeg?auto=compress&cs=tinysrgb&h=900&w=1600", "accent": "#ffb02f"},
    {"id": "neon-dreams", "name": "Neon Dreams", "slug": "neon-dreams", "tagline": "Glow after dark", "banner": "https://images.unsplash.com/photo-1679855928057-b7c9b0776c83?w=1600&q=80", "accent": "#ff5c5c"},
]

_COLORS = [
    {"name": "Black", "hex": "#111114"},
    {"name": "Off White", "hex": "#ece9df"},
    {"name": "Lime", "hex": "#c6ff3d"},
    {"name": "Slate", "hex": "#3a3f4b"},
]
_SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
_OS = ["One Size"]
_SHOE = ["UK6", "UK7", "UK8", "UK9", "UK10", "UK11"]
_DESC = ("Premium heavyweight build with a relaxed streetwear fit. Durable prints "
         "that don't crack, reinforced seams, and a boxy silhouette engineered for "
         "everyday flex.")


def _mk(pid, name, category, collection, price, mrp, imgs, badge, rating, reviews, sizes=None):
    return {
        "id": pid, "slug": pid, "name": name, "category": category,
        "collection": collection, "price": price, "mrp": mrp,
        "discount": round((mrp - price) / mrp * 100),
        "images": imgs, "colors": _COLORS, "sizes": sizes or _SIZES,
        "rating": rating, "reviews": reviews, "badge": badge, "description": _DESC,
    }


PRODUCTS = [
    # ---------- T-SHIRTS (10) ----------
    _mk("starforge-tee", "Starforge Graphic Tee", "t-shirts", "cosmic-heroes", 999, 1499, [PX(36942017)], "New", 4.5, 341),
    _mk("senpai-tee", "Senpai Neon Tee", "t-shirts", "anime-legends", 1099, 1599, [PX(37186394)], "New", 4.6, 402),
    _mk("nightfall-tee", "Nightfall Vigilante Tee", "t-shirts", "shadow-vigilante", 1199, 1799, [PX(32490940)], "Trending", 4.8, 1099),
    _mk("crew-tee", "Crew Anthem Tee", "t-shirts", "squad-goals", 899, 1399, [PX(28261878)], "Value", 4.3, 512),
    _mk("retro-tee", "Retro Static Tee", "t-shirts", "neon-dreams", 1049, 1549, [PX(36986582)], None, 4.3, 298),
    _mk("pixel-tee", "Pixel Punk Tee", "t-shirts", "neon-dreams", 999, 1499, [PX(37232797)], None, 4.4, 210),
    _mk("comet-tee", "Comet Trail Tee", "t-shirts", "cosmic-heroes", 1049, 1599, [PX(37043496)], None, 4.5, 266),
    _mk("dragon-tee", "Dragon Ink Tee", "t-shirts", "anime-legends", 1149, 1699, [PX(36908588)], "Trending", 4.7, 540),
    _mk("raven-tee", "Raven Crest Tee", "t-shirts", "shadow-vigilante", 1099, 1599, [PX(37092621)], None, 4.4, 188),
    _mk("squad-classic-tee", "Squad Classic Tee", "t-shirts", "squad-goals", 849, 1299, [PX(37075908)], "Value", 4.2, 377),
    # ---------- OVERSIZED (10) ----------
    _mk("nebula-drift-tee", "Nebula Drift Oversized Tee", "oversized", "cosmic-heroes", 1299, 1999, [PX(36942018)], "Bestseller", 4.7, 812),
    _mk("ronin-oversized", "Ronin Ink Oversized Tee", "oversized", "anime-legends", 1399, 1999, [PX(37066864)], "Trending", 4.9, 1533),
    _mk("spellbound-tee", "Spellbound Oversized Tee", "oversized", "wizard-world", 1349, 1899, [PX(37025819)], "Bestseller", 4.7, 688),
    _mk("hangout-oversized", "Hangout Oversized Tee", "oversized", "squad-goals", 1199, 1799, [PX(37014370)], None, 4.5, 398),
    _mk("glow-tee", "Glow Grid Oversized Tee", "oversized", "neon-dreams", 1449, 1999, [PX(37247738)], "Trending", 4.7, 721),
    _mk("midnight-oversized", "Midnight Riot Oversized Tee", "oversized", "shadow-vigilante", 1399, 1999, [PX(12922525)], "Trending", 4.9, 1320),
    _mk("titan-oversized", "Titan Fall Oversized Tee", "oversized", "cosmic-heroes", 1349, 1949, [PX(2560894)], None, 4.6, 430),
    _mk("samurai-oversized", "Samurai Storm Oversized Tee", "oversized", "anime-legends", 1449, 2099, [PX(18682344)], "Bestseller", 4.8, 905),
    _mk("hex-oversized", "Hex Rune Oversized Tee", "oversized", "wizard-world", 1299, 1899, [PX(10582818)], None, 4.5, 271),
    _mk("crew-oversized", "Crew Oversized Tee", "oversized", "squad-goals", 1149, 1699, [PX(9775889)], None, 4.4, 349),
    # ---------- HOODIES (10) ----------
    _mk("orbit-hoodie", "Orbit Zip Hoodie", "hoodies", "cosmic-heroes", 2299, 3299, [PX(8346261), PX(5840463)], "Bestseller", 4.8, 1204),
    _mk("kaiju-hoodie", "Kaiju Storm Hoodie", "hoodies", "anime-legends", 2499, 3499, [PX(9920820), PX(14268757)], "Bestseller", 4.7, 967),
    _mk("gotham-hoodie", "Umbra Pullover Hoodie", "hoodies", "shadow-vigilante", 2199, 3199, [PX(16810984), PX(28701960)], "Bestseller", 4.6, 743),
    _mk("potion-hoodie", "Potion Master Hoodie", "hoodies", "wizard-world", 2399, 3399, [UN("1508216310976-c518daae0cdc"), UN("1517841905240-472988babdf9")], "Trending", 4.8, 812),
    _mk("laser-hoodie", "Laser Line Hoodie", "hoodies", "neon-dreams", 2599, 3599, [UN("1557600067-173369923ba5"), PX(34222783)], "New", 4.8, 456),
    _mk("nova-hoodie", "Nova Core Hoodie", "hoodies", "cosmic-heroes", 2349, 3299, [UN("1620799140408-edc6dcb6d633"), PX(15369434)], None, 4.6, 388),
    _mk("shogun-hoodie", "Shogun Zip Hoodie", "hoodies", "anime-legends", 2449, 3499, [PX(34582210)], "Trending", 4.7, 612),
    _mk("eclipse-hoodie", "Eclipse Crew Sweatshirt", "hoodies", "shadow-vigilante", 1999, 2899, [PX(9522954)], None, 4.5, 502),
    _mk("mystic-hoodie", "Mystic Fleece Hoodie", "hoodies", "wizard-world", 2299, 3199, [UN("1578768079052-aa76e52ff62e")], None, 4.6, 274),
    _mk("circuit-hoodie", "Circuit Glow Hoodie", "hoodies", "neon-dreams", 2549, 3599, [UN("1542406775-ade58c52d2e4")], "Bestseller", 4.7, 431),
    # ---------- JOGGERS (10) ----------
    _mk("void-jogger", "Void Cargo Joggers", "joggers", "cosmic-heroes", 1799, 2599, [PX(5696896), PX(11716436)], None, 4.4, 289),
    _mk("shadow-jogger", "Blackout Tapered Joggers", "joggers", "shadow-vigilante", 1899, 2699, [PX(35043249)], None, 4.5, 356),
    _mk("weekend-jogger", "Weekend Comfort Joggers", "joggers", "squad-goals", 1599, 2299, [PX(36415115)], "Bestseller", 4.6, 634),
    _mk("volt-jogger", "Volt Reflective Joggers", "joggers", "neon-dreams", 1999, 2799, [PX(38574763)], "Bestseller", 4.6, 543),
    _mk("astro-jogger", "Astro Utility Joggers", "joggers", "cosmic-heroes", 1849, 2699, [PX(12456331)], None, 4.5, 301),
    _mk("ninja-jogger", "Ninja Tapered Joggers", "joggers", "anime-legends", 1749, 2499, [PX(17459735)], "Trending", 4.6, 498),
    _mk("rune-jogger", "Rune Fleece Joggers", "joggers", "wizard-world", 1699, 2399, [PX(29971637)], None, 4.4, 233),
    _mk("grid-jogger", "Grid Track Pants", "joggers", "neon-dreams", 1899, 2699, [PX(30615442)], None, 4.5, 318),
    _mk("stealth-jogger", "Stealth Cargo Joggers", "joggers", "shadow-vigilante", 1949, 2799, [PX(29852526)], "New", 4.6, 275),
    _mk("squad-jogger", "Squad Everyday Joggers", "joggers", "squad-goals", 1549, 2199, [PX(27332524)], "Value", 4.3, 410),
    # ---------- SHIRTS (10) ----------
    _mk("dojo-shirt", "Dojo Resort Shirt", "shirts", "anime-legends", 1699, 2299, [PX(28938765), PX(19852754)], None, 4.3, 178),
    _mk("mage-shirt", "Arcane Flannel Shirt", "shirts", "wizard-world", 1799, 2499, [PX(26222881)], None, 4.5, 244),
    _mk("pulse-shirt", "Pulse Camp Collar Shirt", "shirts", "neon-dreams", 1749, 2399, [PX(25525597)], None, 4.4, 167),
    _mk("nomad-shirt", "Nomad Overshirt", "shirts", "squad-goals", 1899, 2599, [PX(15694146)], "New", 4.5, 201),
    _mk("cosmo-shirt", "Cosmo Camp Shirt", "shirts", "cosmic-heroes", 1799, 2499, [PX(2479830)], None, 4.4, 156),
    _mk("shadow-shirt", "Shadow Flannel Shirt", "shirts", "shadow-vigilante", 1849, 2599, [PX(17459740)], "Trending", 4.6, 289),
    _mk("sensei-shirt", "Sensei Kimono Shirt", "shirts", "anime-legends", 1999, 2799, [PX(20209737)], "Bestseller", 4.7, 344),
    _mk("spell-shirt", "Spellweave Linen Shirt", "shirts", "wizard-world", 1749, 2399, [PX(19405826)], None, 4.4, 132),
    _mk("neon-shirt", "Neon Grid Shirt", "shirts", "neon-dreams", 1699, 2299, [PX(37845698)], None, 4.3, 178),
    _mk("crew-shirt", "Crew Utility Shirt", "shirts", "squad-goals", 1649, 2299, [PX(32969128)], "Value", 4.2, 265),
    # ---------- ACCESSORIES (10) ----------
    _mk("stealth-cap", "Stealth Curved Cap", "accessories", "shadow-vigilante", 699, 999, [UN("1533603531139-2c4d04df8f16"), UN("1526127409788-75f6323664f5")], "New", 4.4, 221, _OS),
    _mk("rune-backpack", "Rune Tech Backpack", "accessories", "wizard-world", 1999, 2999, [PX(9629915)], "New", 4.6, 133, _OS),
    _mk("buddy-cap", "Buddy Dad Cap", "accessories", "squad-goals", 649, 899, [UN("1521369909029-2afed882baee")], None, 4.2, 189, _OS),
    _mk("orbit-beanie", "Orbit Knit Beanie", "accessories", "cosmic-heroes", 599, 899, [PX(17474801), PX(7026766)], None, 4.3, 204, _OS),
    _mk("shadow-crossbody", "Shadow Crossbody Bag", "accessories", "shadow-vigilante", 1299, 1899, [PX(27174548), PX(34897553)], "Trending", 4.5, 167, _OS),
    _mk("neon-shades", "Neon Blade Sunglasses", "accessories", "neon-dreams", 899, 1399, [PX(34978681), PX(5202048)], None, 4.4, 142, _OS),
    _mk("astro-sneakers", "Astro Trail Sneakers", "accessories", "cosmic-heroes", 2999, 3999, [UN("1595950653106-6c9ebd614d3a"), UN("1542291026-7eec264c27ff")], "Bestseller", 4.7, 388, _SHOE),
    _mk("ronin-chain", "Ronin Link Chain", "accessories", "anime-legends", 749, 1099, [PX(15254672)], None, 4.3, 96, _OS),
    _mk("volt-sneakers", "Volt Runner Sneakers", "accessories", "neon-dreams", 3199, 4299, [UN("1606107557195-0e29a4b5b4aa"), PX(1027130)], "Trending", 4.6, 254, _SHOE),
    _mk("squad-backpack", "Squad Daypack", "accessories", "squad-goals", 1499, 2199, [PX(701742)], None, 4.4, 120, _OS),
]

COUPONS = {
    "DAPPER10": {"type": "percent", "value": 10, "label": "10% off"},
    "FLAT300": {"type": "flat", "value": 300, "label": "₹300 off orders above ₹1499", "min": 1499},
    "STREET20": {"type": "percent", "value": 20, "label": "20% off"},
}
