"""Dapper Den catalog seed data (mirrors frontend slugs exactly)."""

_IMG = {
    "tee1": "https://images.pexels.com/photos/37186394/pexels-photo-37186394.jpeg",
    "tee2": "https://images.pexels.com/photos/36942017/pexels-photo-36942017.jpeg",
    "tee3": "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=800&q=80",
    "tee4": "https://images.unsplash.com/photo-1678872844677-d650b788709b?w=800&q=80",
    "tee5": "https://images.unsplash.com/photo-1600805625047-a65db4b4e8d0?w=800&q=80",
    "tee6": "https://images.unsplash.com/photo-1630643002954-51e676260697?w=800&q=80",
    "tee7": "https://images.pexels.com/photos/10250614/pexels-photo-10250614.jpeg",
    "tee8": "https://images.pexels.com/photos/27428309/pexels-photo-27428309.jpeg",
    "tee9": "https://images.pexels.com/photos/37305299/pexels-photo-37305299.jpeg",
    "tee10": "https://images.pexels.com/photos/9775889/pexels-photo-9775889.jpeg",
    "tee11": "https://images.pexels.com/photos/28261878/pexels-photo-28261878.jpeg",
    "tee12": "https://images.pexels.com/photos/9558567/pexels-photo-9558567.jpeg",
    "hoodie1": "https://images.pexels.com/photos/8346261/pexels-photo-8346261.jpeg?auto=compress&cs=tinysrgb&h=800&w=800",
    "hoodie2": "https://images.pexels.com/photos/5840463/pexels-photo-5840463.jpeg?auto=compress&cs=tinysrgb&h=800&w=800",
    "acc1": "https://images.unsplash.com/photo-1586622977567-bc45e4ae72fe?w=800&q=80",
    "acc2": "https://images.unsplash.com/photo-1775318277991-4f2626a952cb?w=800&q=80",
    "acc3": "https://images.unsplash.com/photo-1604712937118-0835edf8130a?w=800&q=80",
    "jog1": "https://images.unsplash.com/photo-1608585617748-d55938680e85?w=800&q=80",
    "jog2": "https://images.unsplash.com/photo-1650461970708-7bf32499516d?w=800&q=80",
    "jog3": "https://images.pexels.com/photos/31961168/pexels-photo-31961168.jpeg?auto=compress&cs=tinysrgb&h=800&w=800",
    "street1": "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800&q=80",
    "street2": "https://images.unsplash.com/photo-1635650804263-1a1941e14df5?w=800&q=80",
    "shirt1": "https://images.pexels.com/photos/37845698/pexels-photo-37845698.jpeg?auto=compress&cs=tinysrgb&h=800&w=800",
    "shirt2": "https://images.pexels.com/photos/32969128/pexels-photo-32969128.jpeg?auto=compress&cs=tinysrgb&h=800&w=800",
}

CATEGORIES = [
    {"id": "t-shirts", "name": "T-Shirts", "slug": "t-shirts", "image": _IMG["tee1"]},
    {"id": "oversized", "name": "Oversized", "slug": "oversized", "image": _IMG["tee7"]},
    {"id": "hoodies", "name": "Hoodies", "slug": "hoodies", "image": _IMG["hoodie1"]},
    {"id": "joggers", "name": "Joggers", "slug": "joggers", "image": _IMG["jog1"]},
    {"id": "shirts", "name": "Shirts", "slug": "shirts", "image": _IMG["shirt1"]},
    {"id": "accessories", "name": "Accessories", "slug": "accessories", "image": _IMG["acc1"]},
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
_DESC = ("Premium heavyweight 240 GSM cotton with a relaxed streetwear fit. "
         "Screen-printed graphics that don't crack, taped shoulder seams, and a "
         "boxy silhouette engineered for everyday flex.")


def _mk(pid, name, category, collection, price, mrp, imgs, badge, rating, reviews):
    return {
        "id": pid, "slug": pid, "name": name, "category": category,
        "collection": collection, "price": price, "mrp": mrp,
        "discount": round((mrp - price) / mrp * 100),
        "images": imgs, "colors": _COLORS, "sizes": _SIZES,
        "rating": rating, "reviews": reviews, "badge": badge, "description": _DESC,
    }


I = _IMG
PRODUCTS = [
    _mk("nebula-drift-tee", "Nebula Drift Oversized Tee", "oversized", "cosmic-heroes", 1299, 1999, [I["tee1"], I["tee2"], I["tee3"]], "Bestseller", 4.7, 812),
    _mk("starforge-tee", "Starforge Graphic Tee", "t-shirts", "cosmic-heroes", 999, 1499, [I["tee2"], I["tee4"], I["tee5"]], "New", 4.5, 341),
    _mk("orbit-hoodie", "Orbit Zip Hoodie", "hoodies", "cosmic-heroes", 2299, 3299, [I["hoodie1"], I["hoodie2"], I["street1"]], "Bestseller", 4.8, 1204),
    _mk("void-jogger", "Void Cargo Joggers", "joggers", "cosmic-heroes", 1799, 2599, [I["jog1"], I["jog2"], I["jog3"]], None, 4.4, 289),
    _mk("ronin-oversized", "Ronin Ink Oversized Tee", "oversized", "anime-legends", 1399, 1999, [I["tee6"], I["tee7"], I["tee8"]], "Trending", 4.9, 1533),
    _mk("senpai-tee", "Senpai Neon Tee", "t-shirts", "anime-legends", 1099, 1599, [I["tee8"], I["tee9"], I["tee10"]], "New", 4.6, 402),
    _mk("kaiju-hoodie", "Kaiju Storm Hoodie", "hoodies", "anime-legends", 2499, 3499, [I["hoodie2"], I["hoodie1"], I["street2"]], "Bestseller", 4.7, 967),
    _mk("dojo-shirt", "Dojo Resort Shirt", "shirts", "anime-legends", 1699, 2299, [I["shirt1"], I["shirt2"], I["tee11"]], None, 4.3, 178),
    _mk("nightfall-tee", "Nightfall Vigilante Tee", "t-shirts", "shadow-vigilante", 1199, 1799, [I["tee10"], I["tee11"], I["tee12"]], "Trending", 4.8, 1099),
    _mk("gotham-hoodie", "Umbra Pullover Hoodie", "hoodies", "shadow-vigilante", 2199, 3199, [I["hoodie1"], I["street1"], I["hoodie2"]], "Bestseller", 4.6, 743),
    _mk("shadow-jogger", "Blackout Tapered Joggers", "joggers", "shadow-vigilante", 1899, 2699, [I["jog2"], I["jog3"], I["jog1"]], None, 4.5, 356),
    _mk("stealth-cap", "Stealth Curved Cap", "accessories", "shadow-vigilante", 699, 999, [I["acc1"], I["acc2"], I["acc3"]], "New", 4.4, 221),
    _mk("spellbound-tee", "Spellbound Oversized Tee", "oversized", "wizard-world", 1349, 1899, [I["tee3"], I["tee5"], I["tee6"]], "Bestseller", 4.7, 688),
    _mk("mage-shirt", "Arcane Flannel Shirt", "shirts", "wizard-world", 1799, 2499, [I["shirt2"], I["shirt1"], I["tee12"]], None, 4.5, 244),
    _mk("potion-hoodie", "Potion Master Hoodie", "hoodies", "wizard-world", 2399, 3399, [I["hoodie2"], I["street2"], I["hoodie1"]], "Trending", 4.8, 812),
    _mk("rune-backpack", "Rune Tech Backpack", "accessories", "wizard-world", 1999, 2999, [I["acc2"], I["acc3"], I["acc1"]], "New", 4.6, 133),
    _mk("crew-tee", "Crew Anthem Tee", "t-shirts", "squad-goals", 899, 1399, [I["tee4"], I["tee1"], I["tee7"]], "Value", 4.3, 512),
    _mk("hangout-oversized", "Hangout Oversized Tee", "oversized", "squad-goals", 1199, 1799, [I["tee7"], I["tee8"], I["tee2"]], None, 4.5, 398),
    _mk("weekend-jogger", "Weekend Comfort Joggers", "joggers", "squad-goals", 1599, 2299, [I["jog3"], I["jog1"], I["jog2"]], "Bestseller", 4.6, 634),
    _mk("buddy-cap", "Buddy Dad Cap", "accessories", "squad-goals", 649, 899, [I["acc3"], I["acc1"], I["acc2"]], None, 4.2, 189),
    _mk("glow-tee", "Glow Grid Oversized Tee", "oversized", "neon-dreams", 1449, 1999, [I["tee9"], I["tee10"], I["tee3"]], "Trending", 4.7, 721),
    _mk("laser-hoodie", "Laser Line Hoodie", "hoodies", "neon-dreams", 2599, 3599, [I["street1"], I["hoodie1"], I["hoodie2"]], "New", 4.8, 456),
    _mk("pulse-shirt", "Pulse Camp Collar Shirt", "shirts", "neon-dreams", 1749, 2399, [I["shirt1"], I["tee11"], I["shirt2"]], None, 4.4, 167),
    _mk("volt-jogger", "Volt Reflective Joggers", "joggers", "neon-dreams", 1999, 2799, [I["jog1"], I["jog3"], I["jog2"]], "Bestseller", 4.6, 543),
    _mk("retro-tee", "Retro Static Tee", "t-shirts", "neon-dreams", 1049, 1549, [I["tee5"], I["tee6"], I["tee9"]], None, 4.3, 298),
    _mk("midnight-oversized", "Midnight Riot Oversized Tee", "oversized", "shadow-vigilante", 1399, 1999, [I["tee12"], I["tee2"], I["tee8"]], "Trending", 4.9, 1320),
]

COUPONS = {
    "DAPPER10": {"type": "percent", "value": 10, "label": "10% off"},
    "FLAT300": {"type": "flat", "value": 300, "label": "₹300 off orders above ₹1499", "min": 1499},
    "STREET20": {"type": "percent", "value": 20, "label": "20% off"},
}
