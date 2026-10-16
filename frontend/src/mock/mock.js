// Static storefront content: hero media, categories, collections and the lookbook.
// Products come from the API; catalog.json is the bundled copy used until it answers (see backend/scripts/export_catalog.py).

export const HERO_IMAGES = [
  "https://images.pexels.com/photos/23572667/pexels-photo-23572667.jpeg",
  "/products/nova-hoodie-2.jpg",
  "https://images.unsplash.com/photo-1580079906050-84bb132e4c4f?w=1600&q=80",
  "https://images.pexels.com/photos/15694146/pexels-photo-15694146.jpeg",
  "https://images.pexels.com/photos/16586906/pexels-photo-16586906.jpeg",
  "https://images.pexels.com/photos/28701960/pexels-photo-28701960.jpeg",
  "/products/glow-tee-1.jpg",
  "https://images.pexels.com/photos/7479825/pexels-photo-7479825.jpeg",
];

export const CATEGORIES = [
  { id: "t-shirts", name: "T-Shirts", slug: "t-shirts", image: "https://images.unsplash.com/photo-1571455786673-9d9d6c194f90?w=800&q=80" },
  { id: "oversized", name: "Oversized", slug: "oversized", image: "https://images.pexels.com/photos/36942018/pexels-photo-36942018.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: "hoodies", name: "Hoodies", slug: "hoodies", image: "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=800&q=80" },
  { id: "joggers", name: "Joggers", slug: "joggers", image: "https://images.unsplash.com/photo-1555412590-954a889ccb90?w=800&q=80" },
  { id: "shirts", name: "Shirts", slug: "shirts", image: "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800&q=80" },
  { id: "accessories", name: "Accessories", slug: "accessories", image: "/products/stealth-cap-1.jpg" },
];

export const CATEGORIES_WOMEN = [
  { id: "t-shirts", name: "T-Shirts", slug: "t-shirts", image: "/products/w-nova-tee-1.jpg" },
  { id: "hoodies", name: "Hoodies", slug: "hoodies", image: "https://images.unsplash.com/photo-1663573688938-2b3e7ea2ab33?w=800&q=80" },
  { id: "joggers", name: "Joggers", slug: "joggers", image: "https://images.unsplash.com/photo-1480179087180-d9f0ec044897?w=800&q=80" },
  { id: "dresses", name: "Dresses & Co-ords", slug: "dresses", image: "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=800&q=80" },
];

export const CATEGORIES_KIDS = [
  { id: "t-shirts", name: "T-Shirts", slug: "t-shirts", image: "https://images.unsplash.com/photo-1611428813653-aa606c998586?w=800&q=80" },
  { id: "hoodies", name: "Hoodies", slug: "hoodies", image: "https://images.pexels.com/photos/15395266/pexels-photo-15395266.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: "joggers", name: "Joggers", slug: "joggers", image: "https://images.unsplash.com/photo-1659779193831-97ccb9fecfeb?w=800&q=80" },
];

export const CATEGORIES_BY_GENDER = { men: CATEGORIES, women: CATEGORIES_WOMEN, kids: CATEGORIES_KIDS };

export const GENDER_LABELS = { men: "Men", women: "Women", kids: "Kids" };

export const COLLECTIONS = [
  {
    id: "cosmic-heroes",
    name: "Cosmic Heroes",
    slug: "cosmic-heroes",
    tagline: "Guardians of the galaxy grid",
    banner: "https://images.unsplash.com/photo-1677357623576-7c8aab08da22?w=1600&q=80",
    accent: "#7c5cff",
  },
  {
    id: "anime-legends",
    name: "Anime Legends",
    slug: "anime-legends",
    tagline: "Ink, neon & battle cries",
    banner: "https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1600&q=80",
    accent: "#ff2fb0",
  },
  {
    id: "shadow-vigilante",
    name: "Shadow Vigilante",
    slug: "shadow-vigilante",
    tagline: "Born from the dark",
    banner: "https://images.unsplash.com/photo-1687844599821-e0eceea6f6a1?w=1600&q=80",
    accent: "#3dd7ff",
  },
  {
    id: "wizard-world",
    name: "Wizard World",
    slug: "wizard-world",
    tagline: "Magic stitched in",
    banner: "https://images.unsplash.com/photo-1550100136-e092101726f4?w=1600&q=80",
    accent: "#c6ff3d",
  },
  {
    id: "squad-goals",
    name: "Squad Goals",
    slug: "squad-goals",
    tagline: "For the whole crew",
    banner: "https://images.pexels.com/photos/28122495/pexels-photo-28122495.jpeg?auto=compress&cs=tinysrgb&h=900&w=1600",
    accent: "#ffb02f",
  },
  {
    id: "neon-dreams",
    name: "Neon Dreams",
    slug: "neon-dreams",
    tagline: "Glow after dark",
    banner: "https://images.unsplash.com/photo-1679855928057-b7c9b0776c83?w=1600&q=80",
    accent: "#ff5c5c",
  },
];

// Cinematic royalty-free films (Pexels CDN, hotlink-verified). Used as ambient
// brand lookbook footage with heavy overlays + Dapper Den branding.
export const HERO_VIDEO = "https://videos.pexels.com/video-files/2098988/2098988-hd_1920_1080_30fps.mp4";

export const LOOKBOOK = [
  {
    id: "paris",
    city: "PARIS",
    country: "France",
    landmark: "Eiffel Tower",
    line: "Draped by the tower.",
    video: "https://videos.pexels.com/video-files/8798097/8798097-sd_506_960_25fps.mp4",
    poster: "https://images.pexels.com/videos/8798097/pexels-photo-8798097.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    id: "london",
    city: "LONDON",
    country: "United Kingdom",
    landmark: "Tower Bridge",
    line: "Streets of the Thames.",
    video: "https://videos.pexels.com/video-files/8397017/8397017-sd_960_506_25fps.mp4",
    poster: "https://images.pexels.com/videos/8397017/pexels-photo-8397017.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    id: "tokyo",
    city: "TOKYO",
    country: "Japan",
    landmark: "Shibuya Crossing",
    line: "Neon meets knit.",
    video: "https://videos.pexels.com/video-files/8477535/8477535-sd_360_640_24fps.mp4",
    poster: "https://images.pexels.com/videos/8477535/pexels-photo-8477535.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    id: "newyork",
    city: "NEW YORK",
    country: "USA",
    landmark: "Brooklyn Bridge",
    line: "The city never sleeps in Dapper Den.",
    video: "https://videos.pexels.com/video-files/8992283/8992283-hd_1080_1920_25fps.mp4",
    poster: "/lookbook/newyork.jpg",
  },
  {
    id: "milan",
    city: "MILAN",
    country: "Italy",
    landmark: "Duomo",
    line: "Fashion capital, streetwear soul.",
    video: "https://videos.pexels.com/video-files/8798401/8798401-sd_506_960_25fps.mp4",
    poster: "https://images.pexels.com/videos/8798401/pexels-photo-8798401.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    id: "berlin",
    city: "BERLIN",
    country: "Germany",
    landmark: "Brandenburg Gate",
    line: "Underground energy.",
    video: "https://videos.pexels.com/video-files/8994733/8994733-hd_1080_1920_25fps.mp4",
    poster: "/lookbook/paris.jpg",
  },
];

export const formatINR = (n) =>
  "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
