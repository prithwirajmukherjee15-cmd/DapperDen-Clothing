"""Branded Dapper Den emails: customer receipt, shipping updates, and the
new-order alert for the store owner. Everything a customer typed is escaped.

All HTML is table-based with inline styles so it renders in Gmail, Outlook and
Apple Mail. The same receipt markup is served as a printable web page."""
import html
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

IST = timezone(timedelta(hours=5, minutes=30))

# Brand tokens (match frontend/tailwind.config.js)
BG = "#0a0a0b"
CARD = "#131316"
LINE = "#2a2a30"
TEXT = "#ffffff"
SOFT = "#c9c9cf"
MUTED = "#8b8b93"
LIME = "#c6ff3d"
# Unquoted on purpose: these are dropped into single-quoted style attributes.
DISPLAY = "Anton, Impact, Arial Narrow Bold, Helvetica Neue, Arial, sans-serif"
BODY = "Helvetica Neue, Helvetica, Arial, sans-serif"

STAGES = ["Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"]

STATUS_COPY = {
    "Packed": ("PACKED &amp; READY", "your order is packed and waiting for pickup. We'll let you know when it ships."),
    "Shipped": ("IT'S ON THE WAY", "your order has left our warehouse and is on its way to you."),
    "Out for Delivery": ("ARRIVING TODAY", "your order is out for delivery. Keep your phone handy for the courier."),
    "Delivered": ("DELIVERED", "your order has been delivered. Wear it loud. Not the right fit? You have 15 days for easy returns."),
    "Cancelled": ("ORDER CANCELLED", "your order has been cancelled. If you paid online, the refund will reach you in 5–7 business days."),
}


def e(v) -> str:
    return html.escape(str(v if v is not None else ""), quote=True)


def inr(v) -> str:
    try:
        return "₹" + f"{int(round(float(v))):,}"
    except (TypeError, ValueError):
        return f"₹{v}"


def is_cod(order: dict) -> bool:
    return "cash" in str(order.get("payment_method", "")).lower()


def order_date(order: dict) -> str:
    dt = order.get("created_at")
    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt)
        except ValueError:
            return dt
    if not isinstance(dt, datetime):
        return ""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(IST).strftime("%d %b %Y, %I:%M %p IST")


def track_url(site_url: str, order: dict) -> str:
    q = urlencode({"order": order.get("order_id", ""), "phone": (order.get("address") or {}).get("phone", "")})
    return f"{site_url}/track?{q}"


def first_name(order: dict) -> str:
    return ((order.get("address") or {}).get("name") or "there").strip().split(" ")[0] or "there"


# ---------- building blocks ----------
def _wordmark(size=24) -> str:
    return (f"<span style=\"font-family:{DISPLAY};font-size:{size}px;letter-spacing:2px;color:{TEXT};\">"
            f"DAPPER<span style=\"color:{LIME};\">DEN</span></span>")


def _button(href: str, label: str) -> str:
    return (f"<table role='presentation' cellpadding='0' cellspacing='0' border='0'><tr>"
            f"<td bgcolor='{LIME}' style='border-radius:999px;'>"
            f"<a href='{e(href)}' target='_blank' style=\"display:inline-block;padding:14px 28px;font-family:{BODY};"
            f"font-size:14px;font-weight:bold;letter-spacing:1px;color:{BG};text-decoration:none;border-radius:999px;\">{label}</a>"
            f"</td></tr></table>")


def _progress(status: str) -> str:
    active = STAGES.index(status) if status in STAGES else 0
    cells = []
    for i, s in enumerate(STAGES):
        on = i <= active
        dot = LIME if on else LINE
        color = TEXT if on else MUTED
        cells.append(
            f"<td align='center' width='20%' style='font-family:{BODY};font-size:10px;color:{color};padding:0 2px;'>"
            f"<div style='width:12px;height:12px;border-radius:6px;background:{dot};margin:0 auto 6px;'></div>{e(s)}</td>")
    return f"<table role='presentation' width='100%' cellpadding='0' cellspacing='0'><tr>{''.join(cells)}</tr></table>"


def _items(order: dict) -> str:
    rows = []
    for i in order.get("items", []):
        qty = i.get("qty", 1)
        rows.append(f"""<tr>
          <td width='72' valign='top' style='padding:14px 0;border-bottom:1px solid {LINE};'>
            <img src='{e(i.get("image", ""))}' width='60' height='72' alt='' style='display:block;width:60px;height:72px;object-fit:cover;border-radius:10px;background:{LINE};' />
          </td>
          <td valign='top' style='padding:14px 12px;border-bottom:1px solid {LINE};font-family:{BODY};'>
            <div style='font-size:14px;font-weight:bold;color:{TEXT};'>{e(i.get("name", ""))}</div>
            <div style='font-size:12px;color:{MUTED};margin-top:4px;'>Size {e(i.get("size", ""))} &middot; {e(i.get("color", ""))}</div>
            <div style='font-size:12px;color:{MUTED};margin-top:2px;'>{e(qty)} &times; {inr(i.get("price", 0))}</div>
          </td>
          <td align='right' valign='top' style='padding:14px 0;border-bottom:1px solid {LINE};font-family:{BODY};font-size:14px;font-weight:bold;color:{TEXT};white-space:nowrap;'>{inr(i.get("price", 0) * qty)}</td>
        </tr>""")
    return f"<table role='presentation' width='100%' cellpadding='0' cellspacing='0'>{''.join(rows)}</table>"


def _row(label, value, strong=False, color=SOFT):
    weight = "bold" if strong else "normal"
    size = "16px" if strong else "14px"
    return (f"<tr><td style='padding:5px 0;font-family:{BODY};font-size:{size};color:{MUTED if not strong else TEXT};font-weight:{weight};'>{label}</td>"
            f"<td align='right' style='padding:5px 0;font-family:{BODY};font-size:{size};color:{color};font-weight:{weight};'>{value}</td></tr>")


def _totals(order: dict) -> str:
    rows = [_row("Subtotal", inr(order.get("subtotal", 0)))]
    if order.get("discount"):
        rows.append(_row(f"Coupon ({e(order.get('coupon') or '')})", "&minus;" + inr(order["discount"]), color=LIME))
    shipping = order.get("shipping", 0)
    rows.append(_row("Shipping", "FREE" if not shipping else inr(shipping), color=LIME if not shipping else SOFT))
    total_label = "Amount due on delivery" if is_cod(order) else "Total paid"
    rows.append(f"<tr><td colspan='2' style='border-top:1px solid {LINE};padding-top:8px;'></td></tr>")
    rows.append(_row(total_label, inr(order.get("total", 0)), strong=True, color=LIME))
    rows.append(f"<tr><td colspan='2' style='font-family:{BODY};font-size:11px;color:{MUTED};padding-top:2px;'>Inclusive of all taxes</td></tr>")
    return f"<table role='presentation' width='100%' cellpadding='0' cellspacing='0'>{''.join(rows)}</table>"


def _meta(order: dict) -> str:
    pay_status = "Pay on delivery" if is_cod(order) else "Paid"
    cells = [("Order number", f"#{e(order.get('order_id'))}"), ("Order date", e(order_date(order))),
             ("Payment", e(order.get("payment_method", ""))), ("Status", pay_status)]
    tds = "".join(
        f"<td width='50%' valign='top' style='padding:8px 0;font-family:{BODY};'>"
        f"<div style='font-size:11px;letter-spacing:1px;text-transform:uppercase;color:{MUTED};'>{k}</div>"
        f"<div style='font-size:14px;color:{TEXT};margin-top:3px;'>{v}</div></td>"
        + ("</tr><tr>" if idx == 1 else "")
        for idx, (k, v) in enumerate(cells))
    return f"<table role='presentation' width='100%' cellpadding='0' cellspacing='0'><tr>{tds}</tr></table>"


def _address(order: dict) -> str:
    a = order.get("address") or {}
    return (f"<div style='font-family:{BODY};font-size:13px;line-height:20px;color:{SOFT};'>"
            f"<div style='font-size:11px;letter-spacing:1px;text-transform:uppercase;color:{MUTED};margin-bottom:6px;'>Shipping to</div>"
            f"<b style='color:{TEXT};'>{e(a.get('name'))}</b><br/>{e(a.get('line'))}<br/>"
            f"{e(a.get('city'))}, {e(a.get('stateName'))} &ndash; {e(a.get('pincode'))}<br/>Phone: {e(a.get('phone'))}</div>")


def _shell(inner: str, preheader: str, site_url: str, support_email: str = "") -> str:
    support = (f" or write to <a href='mailto:{e(support_email)}' style='color:{LIME};text-decoration:none;'>{e(support_email)}</a>"
               if support_email else "")
    return f"""<!doctype html>
<html><head><meta charset='utf-8'/><meta name='viewport' content='width=device-width,initial-scale=1'/>
<meta name='color-scheme' content='dark'/><meta name='supported-color-schemes' content='dark'/>
<link href='https://fonts.googleapis.com/css2?family=Anton&display=swap' rel='stylesheet'/>
<title>Dapper Den</title></head>
<body style='margin:0;padding:0;background:{BG};'>
<div style='display:none;max-height:0;overflow:hidden;opacity:0;color:{BG};'>{e(preheader)}</div>
<table role='presentation' width='100%' cellpadding='0' cellspacing='0' bgcolor='{BG}' style='background:{BG};'>
<tr><td align='center' style='padding:28px 12px;'>
  <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='max-width:600px;'>
    <tr><td style='padding:0 8px 20px;'>
      <table role='presentation' width='100%' cellpadding='0' cellspacing='0'><tr>
        <td><a href='{e(site_url)}' style='text-decoration:none;'>{_wordmark()}</a></td>
        <td align='right' style='font-family:{BODY};font-size:11px;letter-spacing:2px;color:{MUTED};'>PREMIUM STREETWEAR</td>
      </tr></table>
    </td></tr>
    {inner}
    <tr><td style='padding:24px 8px 0;font-family:{BODY};font-size:12px;line-height:19px;color:{MUTED};text-align:center;'>
      Need help? Visit our <a href='{e(site_url)}/help' style='color:{LIME};text-decoration:none;'>Help Center</a>{support}.<br/>
      Free shipping above ₹1,499 &middot; 15-day easy returns &middot; Dispatched within 24 hours
    </td></tr>
    <tr><td align='center' style='padding:22px 8px 0;'>{_wordmark(18)}</td></tr>
    <tr><td style='padding:8px 8px 0;font-family:{BODY};font-size:11px;color:{MUTED};text-align:center;'>
      Engineered for the bold. You're receiving this because you placed an order at
      <a href='{e(site_url)}' style='color:{MUTED};'>{e(site_url.replace("https://", ""))}</a>.
    </td></tr>
  </table>
</td></tr></table>
</body></html>"""


def _card(content: str, pad="28px") -> str:
    return (f"<tr><td style='padding:0 0 14px;'><table role='presentation' width='100%' cellpadding='0' cellspacing='0' "
            f"bgcolor='{CARD}' style='background:{CARD};border:1px solid {LINE};border-radius:18px;'>"
            f"<tr><td style='padding:{pad};'>{content}</td></tr></table></td></tr>")


# ---------- public builders ----------
def receipt_html(order: dict, site_url: str, support_email: str = "") -> str:
    cod = is_cod(order)
    lead = ("Pay in cash or UPI when it arrives." if cod else "Your payment went through.")
    hero = (f"<div style='font-family:{BODY};font-size:12px;font-weight:bold;letter-spacing:2px;color:{LIME};'>ORDER CONFIRMED</div>"
            f"<div style=\"font-family:{DISPLAY};font-size:38px;line-height:44px;color:{TEXT};margin-top:10px;\">YOUR DRIP IS<br/>LOCKED IN.</div>"
            f"<div style='font-family:{BODY};font-size:15px;line-height:23px;color:{SOFT};margin-top:12px;'>"
            f"Hey {e(first_name(order))}, thanks for shopping with Dapper Den. {lead} We're packing order "
            f"<b style='color:{TEXT};'>#{e(order.get('order_id'))}</b> now &mdash; expect it in <b style='color:{TEXT};'>3&ndash;5 business days</b>.</div>"
            f"<div style='margin-top:22px;'>{_button(track_url(site_url, order), 'TRACK YOUR ORDER &rarr;')}</div>"
            f"<div style='margin-top:26px;'>{_progress(order.get('status', 'Confirmed'))}</div>")
    receipt = (f"<div style=\"font-family:{DISPLAY};font-size:22px;letter-spacing:1px;color:{TEXT};\">RECEIPT</div>"
               f"<div style='margin-top:10px;'>{_meta(order)}</div>"
               f"<div style='margin-top:8px;'>{_items(order)}</div>"
               f"<div style='margin-top:14px;'>{_totals(order)}</div>")
    ship = _address(order)
    preheader = (f"Order #{order.get('order_id')} confirmed — {inr(order.get('total', 0))}"
                 f"{' due on delivery' if cod else ' paid'}. Arriving in 3–5 business days.")
    return _shell(_card(hero) + _card(receipt) + _card(ship, pad="22px 28px"), preheader, site_url, support_email)


def receipt_text(order: dict, site_url: str) -> str:
    lines = [f"DAPPER DEN — Order #{order.get('order_id')} confirmed", "",
             f"Hey {first_name(order)}, thanks for your order. Expect it in 3–5 business days.",
             f"Track it: {track_url(site_url, order)}", "", f"Order date: {order_date(order)}",
             f"Payment: {order.get('payment_method', '')}", ""]
    for i in order.get("items", []):
        lines.append(f"- {i.get('name')} (Size {i.get('size')}, {i.get('color')}) x{i.get('qty')}  {inr(i.get('price', 0) * i.get('qty', 1))}")
    lines += ["", f"Subtotal: {inr(order.get('subtotal', 0))}"]
    if order.get("discount"):
        lines.append(f"Coupon ({order.get('coupon')}): -{inr(order['discount'])}")
    lines.append(f"Shipping: {'FREE' if not order.get('shipping') else inr(order['shipping'])}")
    lines.append(f"{'Amount due on delivery' if is_cod(order) else 'Total paid'}: {inr(order.get('total', 0))} (incl. all taxes)")
    a = order.get("address") or {}
    lines += ["", "Shipping to:", a.get("name", ""), a.get("line", ""),
              f"{a.get('city', '')}, {a.get('stateName', '')} - {a.get('pincode', '')}", f"Phone: {a.get('phone', '')}",
              "", f"Help: {site_url}/help — 15-day easy returns."]
    return "\n".join(lines)


def receipt_page(order: dict, site_url: str, support_email: str = "") -> str:
    """The receipt email as a standalone page with a print/save button."""
    page = receipt_html(order, site_url, support_email)
    bar = (f"<div class='no-print' style='text-align:center;padding:16px;background:{BG};'>"
           f"<button onclick='window.print()' style=\"font-family:{BODY};font-weight:bold;font-size:14px;padding:12px 26px;"
           f"border:0;border-radius:999px;background:{LIME};color:{BG};cursor:pointer;\">Print / Save as PDF</button></div>")
    style = ("<style>@media print{.no-print{display:none!important}"
             "body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style>")
    page = page.replace("<title>Dapper Den</title>", f"<title>Receipt #{e(order.get('order_id'))} — Dapper Den</title>{style}")
    body_tag = f"<body style='margin:0;padding:0;background:{BG};'>"
    return page.replace(body_tag, body_tag + bar, 1)


def status_html(order: dict, site_url: str, support_email: str = "") -> str:
    status = order.get("status", "")
    title, body = STATUS_COPY.get(status, (e(status).upper(), "there's an update on your order."))
    hero = (f"<div style='font-family:{BODY};font-size:12px;font-weight:bold;letter-spacing:2px;color:{LIME};'>ORDER #{e(order.get('order_id'))}</div>"
            f"<div style=\"font-family:{DISPLAY};font-size:36px;line-height:42px;color:{TEXT};margin-top:10px;\">{title}</div>"
            f"<div style='font-family:{BODY};font-size:15px;line-height:23px;color:{SOFT};margin-top:12px;'>Hey {e(first_name(order))}, {body}</div>"
            + (f"<div style='margin-top:26px;'>{_progress(status)}</div>" if status in STAGES else "")
            + f"<div style='margin-top:24px;'>{_button(track_url(site_url, order), 'VIEW ORDER &rarr;')}</div>")
    summary = (f"<div style=\"font-family:{DISPLAY};font-size:20px;color:{TEXT};\">IN THIS ORDER</div>"
               f"<div style='margin-top:6px;'>{_items(order)}</div>")
    return _shell(_card(hero) + _card(summary), f"Order #{order.get('order_id')}: {status}", site_url, support_email)


def owner_alert_html(order: dict, site_url: str) -> str:
    a = order.get("address") or {}
    contact = (f"<div style='font-family:{BODY};font-size:14px;line-height:22px;color:{SOFT};'>"
               f"<b style='color:{TEXT};'>{e(a.get('name'))}</b> &middot; {e(a.get('phone'))}"
               + (f" &middot; {e(a.get('email'))}" if a.get("email") else "") + "</div>")
    hero = (f"<div style='font-family:{BODY};font-size:12px;font-weight:bold;letter-spacing:2px;color:{LIME};'>NEW ORDER</div>"
            f"<div style=\"font-family:{DISPLAY};font-size:34px;color:{TEXT};margin-top:8px;\">#{e(order.get('order_id'))} &middot; {inr(order.get('total', 0))}</div>"
            f"<div style='margin-top:10px;'>{contact}</div>"
            f"<div style='margin-top:14px;'>{_meta(order)}</div>")
    body = f"{_items(order)}<div style='margin-top:14px;'>{_totals(order)}</div>"
    return _shell(_card(hero) + _card(body) + _card(_address(order), pad="22px 28px"),
                  f"New order #{order.get('order_id')} — {inr(order.get('total', 0))}", site_url)
