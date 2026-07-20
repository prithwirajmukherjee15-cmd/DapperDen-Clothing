"""Dapper Den catalog — 10 products/category, strict type-accurate imagery,
each product carries multiple colourway images (variant selector)."""


def PX(i):
    return f"https://images.pexels.com/photos/{i}/pexels-photo-{i}.jpeg?auto=compress&cs=tinysrgb&w=800"


def UN(slug):
    return f"https://images.unsplash.com/photo-{slug}?w=800&q=80"


# ---------- strictly category-accurate image pools (globally unique) ----------
TSHIRT_IMGS = [
    UN("1571455786673-9d9d6c194f90"), UN("1583743814966-8936f5b7be1a"), UN("1726140872004-850c80900ae3"),
    UN("1622519407650-3df9883f76a5"), PX(28261878), PX(36942017), UN("1593726891090-b4c6bc09c819"),
    PX(29323278), UN("1651761179569-4ba2aa054997"), UN("1525393839361-867d646aea41"),
    UN("1627225793904-a2f900a6e4cf"), UN("1644263755671-49b07f7624a6"), UN("1564859228273-274232fdb516"),
    UN("1618677603544-51162346e165"), PX(36908588), UN("1622445275463-afa2ab738c34"),
    UN("1521572163474-6864f9cf17ab"), UN("1581655353564-df123a1eb820"), PX(8532616), UN("1562157873-818bc0726f68"),
]
OVERSIZED_IMGS = [
    PX(36942018), UN("1627225925683-1da7021732ea"), PX(26797742), UN("1618453292610-4119319e5ac7"),
    PX(10250614), UN("1627225924765-552d49cf47ad"), UN("1661181475147-bbd20ef65781"),
    UN("1635650804060-bb009bcb2ea5"), UN("1635650804263-1a1941e14df5"), UN("1622023828943-b4e6afb60516"),
    UN("1503341733017-1901578f9f1e"), UN("1635650805023-f2529440b5aa"), UN("1589902860314-e910697dea18"),
    PX(27428309), UN("1775817104298-522393e1d72b"), UN("1775979654476-89575df179bd"),
]
HOODIE_IMGS = [
    UN("1564557287817-3785e38ec1f5"), UN("1615397587950-3cbb55f95b77"), UN("1596075780750-81249df16d19"),
    UN("1578768079052-aa76e52ff62e"), PX(8346261), UN("1688111421205-a0a85415b224"),
    UN("1609873814058-a8928924184a"), PX(9522954), UN("1614214191247-5b2d3a734f1b"),
    UN("1639379789831-bbd53e09408d"), UN("1609885654455-f81e5a682c87"), PX(34582210),
    UN("1601063476271-a159c71ab0b3"), PX(28701960), PX(8217308), PX(29996214),
    UN("1580079906050-84bb132e4c4f"), UN("1620780327051-f7ad06f5b1e0"), UN("1561151593-7059b6b4ff57"), PX(6310980),
]
JOGGER_IMGS = [
    UN("1555412590-954a889ccb90"), PX(5696896), UN("1608585617748-d55938680e85"), PX(36415115),
    UN("1766575694179-e159f786d2e3"), UN("1548883354-7622d03aca27"), UN("1649850874075-49e014357b9d"),
    UN("1584302052177-2e90841dad6a"), PX(11716436), PX(35043249), UN("1711175017307-bbacf7c2ca13"),
    PX(13958659), UN("1660486044177-45cd45bb5e99"), UN("1602078019624-f4355d0687fd"),
    UN("1623596305214-19f21cbf48ee"), UN("1770979820426-0a4b9728f67b"), UN("1782592273075-3272c6548344"),
    UN("1714132947974-11497abc0177"), UN("1764698403474-de152b479d59"), PX(7322492),
]
SHIRT_IMGS = [
    UN("1621072156002-e2fccdc0b176"), UN("1627686011747-74adda3d2343"), PX(11576957), PX(17251247),
    UN("1782569869819-31c8c660c615"), UN("1698857494817-d244cb4231a8"), PX(18864127), PX(31696312),
    UN("1781797236084-109e94fe1b4b"), PX(14033219), PX(37691596), UN("1601935033900-059813f9abfc"),
    UN("1613752978317-afcfd1bba65a"), UN("1527016021513-b09758b777bd"), PX(26859209),
    UN("1605794432120-f4bb5dc9067d"), UN("1618786177957-29d9b6b26d8a"), PX(6103704), PX(1635596), PX(19852754),
]

CATEGORIES = [
    {"id": "t-shirts", "name": "T-Shirts", "slug": "t-shirts", "image": TSHIRT_IMGS[0]},
    {"id": "oversized", "name": "Oversized", "slug": "oversized", "image": OVERSIZED_IMGS[0]},
    {"id": "hoodies", "name": "Hoodies", "slug": "hoodies", "image": HOODIE_IMGS[0]},
    {"id": "joggers", "name": "Joggers", "slug": "joggers", "image": JOGGER_IMGS[0]},
    {"id": "shirts", "name": "Shirts", "slug": "shirts", "image": SHIRT_IMGS[0]},
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

_SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
_OS = ["One Size"]
_SHOE = ["UK6", "UK7", "UK8", "UK9", "UK10", "UK11"]
_DESC = ("Premium heavyweight build with a relaxed streetwear fit. Durable prints "
         "that don't crack, reinforced seams, and a boxy silhouette engineered for "
         "everyday flex. Available in multiple colourways.")


def _mk(pid, name, category, collection, price, mrp, imgs, badge, rating, reviews, sizes, gender="men"):
    return {
        "id": pid, "slug": pid, "name": name, "category": category, "gender": gender,
        "collection": collection, "price": price, "mrp": mrp,
        "discount": round((mrp - price) / mrp * 100),
        "images": imgs, "sizes": sizes,
        "rating": rating, "reviews": reviews, "badge": badge, "description": _DESC,
    }


def _build(cat, specs, pool, sizes=None, gender="men"):
    """Assign consecutive, non-overlapping image slices so each product gets 1-2
    unique colourway images (no repetition anywhere)."""
    sizes = sizes or _SIZES
    n = len(specs)
    base, extra = divmod(len(pool), n)
    out, idx = [], 0
    for i, (slug, name, coll, price, mrp, badge, rating, rev) in enumerate(specs):
        k = max(1, base + (1 if i < extra else 0))
        imgs = pool[idx:idx + k]
        idx += k
        out.append(_mk(slug, name, cat, coll, price, mrp, imgs, badge, rating, rev, sizes, gender))
    return out


_TSHIRTS = [
    ("starforge-tee", "Starforge Graphic Tee", "cosmic-heroes", 999, 1499, "New", 4.5, 341),
    ("senpai-tee", "Senpai Neon Tee", "anime-legends", 1099, 1599, "New", 4.6, 402),
    ("nightfall-tee", "Nightfall Vigilante Tee", "shadow-vigilante", 1199, 1799, "Trending", 4.8, 1099),
    ("crew-tee", "Crew Anthem Tee", "squad-goals", 899, 1399, "Value", 4.3, 512),
    ("retro-tee", "Retro Static Tee", "neon-dreams", 1049, 1549, None, 4.3, 298),
    ("pixel-tee", "Pixel Punk Tee", "neon-dreams", 999, 1499, None, 4.4, 210),
    ("comet-tee", "Comet Trail Tee", "cosmic-heroes", 1049, 1599, None, 4.5, 266),
    ("dragon-tee", "Dragon Ink Tee", "anime-legends", 1149, 1699, "Trending", 4.7, 540),
    ("raven-tee", "Raven Crest Tee", "shadow-vigilante", 1099, 1599, None, 4.4, 188),
    ("squad-classic-tee", "Squad Classic Tee", "squad-goals", 849, 1299, "Value", 4.2, 377),
]
_OVERSIZED = [
    ("nebula-drift-tee", "Nebula Drift Oversized Tee", "cosmic-heroes", 1299, 1999, "Bestseller", 4.7, 812),
    ("ronin-oversized", "Ronin Ink Oversized Tee", "anime-legends", 1399, 1999, "Trending", 4.9, 1533),
    ("spellbound-tee", "Spellbound Oversized Tee", "wizard-world", 1349, 1899, "Bestseller", 4.7, 688),
    ("hangout-oversized", "Hangout Oversized Tee", "squad-goals", 1199, 1799, None, 4.5, 398),
    ("glow-tee", "Glow Grid Oversized Tee", "neon-dreams", 1449, 1999, "Trending", 4.7, 721),
    ("midnight-oversized", "Midnight Riot Oversized Tee", "shadow-vigilante", 1399, 1999, "Trending", 4.9, 1320),
    ("titan-oversized", "Titan Fall Oversized Tee", "cosmic-heroes", 1349, 1949, None, 4.6, 430),
    ("samurai-oversized", "Samurai Storm Oversized Tee", "anime-legends", 1449, 2099, "Bestseller", 4.8, 905),
    ("hex-oversized", "Hex Rune Oversized Tee", "wizard-world", 1299, 1899, None, 4.5, 271),
    ("crew-oversized", "Crew Oversized Tee", "squad-goals", 1149, 1699, None, 4.4, 349),
]
_HOODIES = [
    ("orbit-hoodie", "Orbit Zip Hoodie", "cosmic-heroes", 2299, 3299, "Bestseller", 4.8, 1204),
    ("kaiju-hoodie", "Kaiju Storm Hoodie", "anime-legends", 2499, 3499, "Bestseller", 4.7, 967),
    ("gotham-hoodie", "Umbra Pullover Hoodie", "shadow-vigilante", 2199, 3199, "Bestseller", 4.6, 743),
    ("potion-hoodie", "Potion Master Hoodie", "wizard-world", 2399, 3399, "Trending", 4.8, 812),
    ("laser-hoodie", "Laser Line Hoodie", "neon-dreams", 2599, 3599, "New", 4.8, 456),
    ("nova-hoodie", "Nova Core Hoodie", "cosmic-heroes", 2349, 3299, None, 4.6, 388),
    ("shogun-hoodie", "Shogun Zip Hoodie", "anime-legends", 2449, 3499, "Trending", 4.7, 612),
    ("eclipse-hoodie", "Eclipse Hooded Sweatshirt", "shadow-vigilante", 1999, 2899, None, 4.5, 502),
    ("mystic-hoodie", "Mystic Fleece Hoodie", "wizard-world", 2299, 3199, None, 4.6, 274),
    ("circuit-hoodie", "Circuit Glow Hoodie", "neon-dreams", 2549, 3599, "Bestseller", 4.7, 431),
]
_JOGGERS = [
    ("void-jogger", "Void Cargo Joggers", "cosmic-heroes", 1799, 2599, None, 4.4, 289),
    ("shadow-jogger", "Blackout Tapered Joggers", "shadow-vigilante", 1899, 2699, None, 4.5, 356),
    ("weekend-jogger", "Weekend Comfort Joggers", "squad-goals", 1599, 2299, "Bestseller", 4.6, 634),
    ("volt-jogger", "Volt Reflective Joggers", "neon-dreams", 1999, 2799, "Bestseller", 4.6, 543),
    ("astro-jogger", "Astro Utility Joggers", "cosmic-heroes", 1849, 2699, None, 4.5, 301),
    ("ninja-jogger", "Ninja Tapered Joggers", "anime-legends", 1749, 2499, "Trending", 4.6, 498),
    ("rune-jogger", "Rune Fleece Joggers", "wizard-world", 1699, 2399, None, 4.4, 233),
    ("grid-jogger", "Grid Track Pants", "neon-dreams", 1899, 2699, None, 4.5, 318),
    ("stealth-jogger", "Stealth Cargo Joggers", "shadow-vigilante", 1949, 2799, "New", 4.6, 275),
    ("squad-jogger", "Squad Everyday Joggers", "squad-goals", 1549, 2199, "Value", 4.3, 410),
]
_SHIRTS = [
    ("dojo-shirt", "Dojo Resort Shirt", "anime-legends", 1699, 2299, None, 4.3, 178),
    ("mage-shirt", "Arcane Flannel Shirt", "wizard-world", 1799, 2499, None, 4.5, 244),
    ("pulse-shirt", "Pulse Camp Collar Shirt", "neon-dreams", 1749, 2399, None, 4.4, 167),
    ("nomad-shirt", "Nomad Overshirt", "squad-goals", 1899, 2599, "New", 4.5, 201),
    ("cosmo-shirt", "Cosmo Camp Shirt", "cosmic-heroes", 1799, 2499, None, 4.4, 156),
    ("shadow-shirt", "Shadow Flannel Shirt", "shadow-vigilante", 1849, 2599, "Trending", 4.6, 289),
    ("sensei-shirt", "Sensei Denim Shirt", "anime-legends", 1999, 2799, "Bestseller", 4.7, 344),
    ("spell-shirt", "Spellweave Striped Shirt", "wizard-world", 1749, 2399, None, 4.4, 132),
    ("neon-shirt", "Neon Grid Shirt", "neon-dreams", 1699, 2299, None, 4.3, 178),
    ("crew-shirt", "Crew Utility Shirt", "squad-goals", 1649, 2299, "Value", 4.2, 265),
]

PRODUCTS = (
    _build("t-shirts", _TSHIRTS, TSHIRT_IMGS)
    + _build("oversized", _OVERSIZED, OVERSIZED_IMGS)
    + _build("hoodies", _HOODIES, HOODIE_IMGS)
    + _build("joggers", _JOGGERS, JOGGER_IMGS)
    + _build("shirts", _SHIRTS, SHIRT_IMGS)
    + [
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
)

_KID_SIZES = ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y", "12-13Y"]

# ---------- WOMEN pools (globally unique, type-accurate) ----------
W_TEE = [UN("1661110546797-d86cc72a2765"), UN("1616006897093-5e4635c0de35"), UN("1622445275992-e7efb32d2257"), PX(37011552), UN("1583744999783-efe9dc5eac91"), UN("1551799517-eb8f03cb5e6a"), UN("1620799139507-2a76f79a2f4d"), PX(7319146)]
W_HOOD = [UN("1663573688938-2b3e7ea2ab33"), UN("1633292750937-120a94f5c2bb"), UN("1633292587737-f898a032e562"), PX(18556218), UN("1618333845076-890b5baf8ffe"), UN("1677466923317-fe39ab5de57b"), UN("1521567097888-2c5fc40a8660"), UN("1614270532514-904c3aa5628e")]
W_JOG = [UN("1480179087180-d9f0ec044897"), UN("1569032915512-922c2e506c51"), UN("1588117260148-b47818741c74"), UN("1588117305388-c2631a279f82"), UN("1515886657613-9f3515b0c78f"), UN("1590330297626-d7aff25a0431"), PX(6630811), PX(9901666)]
W_DRESS = [UN("1617922001439-4a2e6562f328"), UN("1496217590455-aa63a8350eea"), UN("1762154057377-cc9d3dd6900c"), PX(6675408), PX(29017408), UN("1780541249007-dc673c8980a5"), UN("1779400203195-8906eec4b645"), UN("1765560219977-33ee2f1dfcc9"), PX(1007011), PX(15142059), PX(34967316), PX(34891485), UN("1765615913141-5f0c1eadfd81"), UN("1763971922545-c0ffa1c09cc0"), UN("1763971922538-5802acdd48b8"), PX(31566599)]

# ---------- KIDS pools ----------
K_TEE = [UN("1611428813653-aa606c998586"), UN("1627859774205-83c1279a6382"), UN("1620905385976-9f191e837efd"), PX(32071161), UN("1657779532102-faa144145bb5"), UN("1627639679638-8485316a4b21"), PX(26837734), PX(8632212)]
K_HOOD = [PX(15395266), PX(14980503), UN("1664255566089-95bd5c6af061"), UN("1678354787621-c16724e8bc5d"), UN("1586038693164-cb7ee3fb8e2c"), PX(38394262), PX(29214428), PX(37451174)]
K_JOG = [UN("1659779193831-97ccb9fecfeb"), UN("1607454317506-a7c47bb424bc"), PX(5896761), PX(14571357), UN("1616692994673-2feb09ac5770"), PX(31637467), PX(36073200)]

_W_TEES = [
    ("w-nova-tee", "Nova Femme Tee", "cosmic-heroes", 899, 1399, "New", 4.6, 210),
    ("w-sakura-tee", "Sakura Ink Tee", "anime-legends", 949, 1499, "Trending", 4.7, 340),
    ("w-noir-tee", "Noir Crest Tee", "shadow-vigilante", 899, 1399, None, 4.5, 180),
    ("w-crew-tee", "Crew Anthem Tee", "squad-goals", 799, 1299, "Value", 4.4, 260),
    ("w-glow-tee", "Glow Grid Tee", "neon-dreams", 949, 1499, "New", 4.6, 190),
    ("w-hex-tee", "Hex Rune Tee", "wizard-world", 899, 1399, None, 4.5, 150),
    ("w-comet-tee", "Comet Trail Tee", "cosmic-heroes", 899, 1399, "Bestseller", 4.7, 300),
    ("w-ronin-tee", "Ronin Femme Tee", "anime-legends", 949, 1499, None, 4.5, 170),
]
_W_HOODS = [
    ("w-orbit-hoodie", "Orbit Zip Hoodie", "cosmic-heroes", 2099, 2999, "Bestseller", 4.8, 420),
    ("w-kaiju-hoodie", "Kaiju Storm Hoodie", "anime-legends", 2199, 3099, "Trending", 4.7, 380),
    ("w-umbra-hoodie", "Umbra Pullover Hoodie", "shadow-vigilante", 1999, 2899, None, 4.5, 210),
    ("w-potion-hoodie", "Potion Master Hoodie", "wizard-world", 2099, 2999, None, 4.6, 190),
    ("w-laser-hoodie", "Laser Line Hoodie", "neon-dreams", 2299, 3199, "New", 4.7, 240),
    ("w-nova-hoodie", "Nova Core Hoodie", "cosmic-heroes", 2099, 2999, None, 4.5, 160),
    ("w-squad-hoodie", "Squad Comfort Hoodie", "squad-goals", 1899, 2699, "Value", 4.4, 300),
    ("w-shogun-hoodie", "Shogun Zip Hoodie", "anime-legends", 2199, 3099, "Bestseller", 4.7, 280),
]
_W_JOGS = [
    ("w-void-jogger", "Void Cargo Joggers", "cosmic-heroes", 1599, 2299, None, 4.5, 180),
    ("w-blackout-jogger", "Blackout Tapered Joggers", "shadow-vigilante", 1699, 2399, None, 4.5, 200),
    ("w-weekend-jogger", "Weekend Comfort Joggers", "squad-goals", 1399, 1999, "Bestseller", 4.6, 320),
    ("w-volt-jogger", "Volt Reflective Joggers", "neon-dreams", 1799, 2499, "Trending", 4.6, 260),
    ("w-astro-legging", "Astro Flex Leggings", "cosmic-heroes", 1499, 2199, None, 4.5, 210),
    ("w-rune-jogger", "Rune Fleece Joggers", "wizard-world", 1499, 2099, None, 4.4, 150),
    ("w-grid-legging", "Grid Glow Leggings", "neon-dreams", 1699, 2399, "New", 4.5, 190),
    ("w-squad-jogger", "Squad Everyday Joggers", "squad-goals", 1399, 1999, "Value", 4.3, 240),
]
_W_DRESSES = [
    ("w-nebula-dress", "Nebula Slip Dress", "cosmic-heroes", 1799, 2599, "Bestseller", 4.7, 340),
    ("w-sakura-dress", "Sakura Bloom Dress", "anime-legends", 1899, 2699, "Trending", 4.8, 410),
    ("w-noir-slip", "Noir Midi Dress", "shadow-vigilante", 1699, 2499, None, 4.5, 180),
    ("w-aura-coord", "Aura Co-ord Set", "squad-goals", 2199, 2999, "New", 4.6, 220),
    ("w-glow-coord", "Glow Two-Piece Set", "neon-dreams", 2299, 3199, "Trending", 4.7, 260),
    ("w-mystic-dress", "Mystic Wrap Dress", "wizard-world", 1799, 2599, None, 4.5, 160),
    ("w-comet-dress", "Comet Bodycon Dress", "cosmic-heroes", 1699, 2399, None, 4.5, 190),
    ("w-ronin-coord", "Ronin Co-ord Set", "anime-legends", 2099, 2899, "Bestseller", 4.7, 300),
]
_K_TEES = [
    ("k-hero-tee", "Little Hero Tee", "cosmic-heroes", 599, 899, "New", 4.6, 120),
    ("k-ninja-tee", "Mini Ninja Tee", "anime-legends", 649, 949, "Trending", 4.7, 160),
    ("k-shadow-tee", "Shadow Squad Tee", "shadow-vigilante", 599, 899, None, 4.5, 90),
    ("k-buddy-tee", "Buddy Club Tee", "squad-goals", 549, 799, "Value", 4.4, 140),
    ("k-glow-tee", "Glow Bolt Tee", "neon-dreams", 649, 949, "New", 4.5, 100),
    ("k-wizard-tee", "Junior Wizard Tee", "wizard-world", 599, 899, None, 4.5, 80),
    ("k-comet-tee", "Comet Kid Tee", "cosmic-heroes", 599, 899, "Bestseller", 4.7, 130),
    ("k-dragon-tee", "Dragon Cub Tee", "anime-legends", 649, 949, None, 4.5, 95),
]
_K_HOODS = [
    ("k-orbit-hoodie", "Orbit Kid Hoodie", "cosmic-heroes", 1299, 1899, "Bestseller", 4.8, 210),
    ("k-kaiju-hoodie", "Kaiju Cub Hoodie", "anime-legends", 1349, 1999, "Trending", 4.7, 180),
    ("k-umbra-hoodie", "Umbra Kid Hoodie", "shadow-vigilante", 1199, 1799, None, 4.5, 110),
    ("k-potion-hoodie", "Potion Kid Hoodie", "wizard-world", 1299, 1899, None, 4.6, 95),
    ("k-laser-hoodie", "Laser Kid Hoodie", "neon-dreams", 1399, 1999, "New", 4.7, 130),
    ("k-nova-hoodie", "Nova Kid Hoodie", "cosmic-heroes", 1299, 1899, None, 4.5, 85),
    ("k-squad-hoodie", "Squad Kid Hoodie", "squad-goals", 1149, 1699, "Value", 4.4, 150),
    ("k-shogun-hoodie", "Shogun Kid Hoodie", "anime-legends", 1349, 1999, "Bestseller", 4.7, 140),
]
_K_JOGS = [
    ("k-void-jogger", "Void Kid Joggers", "cosmic-heroes", 899, 1399, None, 4.5, 90),
    ("k-blackout-jogger", "Blackout Kid Joggers", "shadow-vigilante", 949, 1449, None, 4.5, 100),
    ("k-weekend-jogger", "Weekend Kid Joggers", "squad-goals", 849, 1299, "Bestseller", 4.6, 160),
    ("k-volt-jogger", "Volt Kid Joggers", "neon-dreams", 999, 1499, "Trending", 4.6, 120),
    ("k-astro-jogger", "Astro Kid Joggers", "cosmic-heroes", 899, 1399, None, 4.5, 95),
    ("k-rune-jogger", "Rune Kid Joggers", "wizard-world", 849, 1299, None, 4.4, 70),
    ("k-grid-jogger", "Grid Kid Joggers", "neon-dreams", 949, 1449, "New", 4.5, 85),
]

PRODUCTS = PRODUCTS + (
    _build("t-shirts", _W_TEES, W_TEE, gender="women")
    + _build("hoodies", _W_HOODS, W_HOOD, gender="women")
    + _build("joggers", _W_JOGS, W_JOG, gender="women")
    + _build("dresses", _W_DRESSES, W_DRESS, gender="women")
    + _build("t-shirts", _K_TEES, K_TEE, _KID_SIZES, gender="kids")
    + _build("hoodies", _K_HOODS, K_HOOD, _KID_SIZES, gender="kids")
    + _build("joggers", _K_JOGS, K_JOG, _KID_SIZES, gender="kids")
)

CATEGORIES_WOMEN = [
    {"id": "t-shirts", "name": "T-Shirts", "slug": "t-shirts", "image": W_TEE[0]},
    {"id": "hoodies", "name": "Hoodies", "slug": "hoodies", "image": W_HOOD[0]},
    {"id": "joggers", "name": "Joggers", "slug": "joggers", "image": W_JOG[0]},
    {"id": "dresses", "name": "Dresses & Co-ords", "slug": "dresses", "image": W_DRESS[0]},
]
CATEGORIES_KIDS = [
    {"id": "t-shirts", "name": "T-Shirts", "slug": "t-shirts", "image": K_TEE[0]},
    {"id": "hoodies", "name": "Hoodies", "slug": "hoodies", "image": K_HOOD[0]},
    {"id": "joggers", "name": "Joggers", "slug": "joggers", "image": K_JOG[0]},
]
CATEGORIES_BY_GENDER = {"men": CATEGORIES, "women": CATEGORIES_WOMEN, "kids": CATEGORIES_KIDS}

COUPONS = {
    "DAPPER10": {"type": "percent", "value": 10, "label": "10% off"},
    "FLAT300": {"type": "flat", "value": 300, "label": "₹300 off orders above ₹1499", "min": 1499},
    "STREET20": {"type": "percent", "value": 20, "label": "20% off"},
}
