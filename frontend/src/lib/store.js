// Store promises shared by the product page, bag and checkout. Must match backend/server.py.
export const FREE_SHIPPING_MIN = 1499;
export const SHIPPING_FEE = 99;

// Latest arrival date, 5 business days from today (orders dispatch within 24 hours).
function arrivesBy(from = new Date()) {
  const d = new Date(from);
  let left = 5;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) left -= 1;
  }
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

export const DELIVERY_TEXT = `Delivered in 3–5 business days: arrives by ${arrivesBy()}`;

// Older bags stored "Colour 1"-style labels for gallery photos; they aren't real colour names.
export const colourLabel = (c) => (c && !/^Colour \d+$/i.test(c) ? c : "");
