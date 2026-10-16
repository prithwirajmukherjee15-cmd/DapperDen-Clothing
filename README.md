<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/brand/dapperden-logo-on-dark.png">
  <img src="docs/brand/dapperden-logo.png" width="340" alt="Dapper Den">
</picture>

**Heavyweight streetwear for fans who wear it loud.**

I audited a real Indian streetwear store's journey from first visit to placed order, to find where shoppers were dropping off.<br>
Dapper Den is that store rebuilt: a working shop that answers each buyer doubt before it can cost the sale.

<a href="https://dapper-denn.netlify.app"><img src="https://img.shields.io/badge/Shop_the_live_store-no_sign--up-c6ff3d?style=for-the-badge&labelColor=0a0a0b" alt="Shop the live store, no sign-up" height="36"></a>

<sub>Browse, add to bag and check out for real. The payment screen is a sandbox, so no money moves. If the store has been idle, the first load takes about a minute.</sub>

[See every screen](#every-screen) · [The marketing decisions](#the-marketing-work) · [How I'd measure it](#how-id-measure-it) · [For engineers](TECHNICAL.md)

<a href="https://dapper-denn.netlify.app"><img src="docs/media/walkthrough-preview.gif" width="760" alt="A full purchase on Dapper Den in 30 seconds: the homepage, themed collections, search suggestions, a product page with the size guide, the bag with a coupon, the address step, UPI payment and the order confirmation"></a>

<sub>A full purchase in 30 seconds: homepage, collections, search, size guide, coupon, UPI checkout and confirmation.</sub>

</div>

## The problem I saw

Shoppers were dropping off somewhere between landing on the site and placing an order. I mapped that journey step by step and looked for the moments where a shopper had to stop and wonder.

The friction fell into four groups:

- **Doubts answered too late.** An Indian shopper buying clothes online from a brand they don't know has the same questions every time. Is shipping free? Can I pay cash on delivery? Can I return it? Is the fabric any good? If the answers only appear at checkout, or never, the shopper leaves before getting there.
- **A catalogue that didn't match how fans shop.** Fans don't look for "a T-shirt"; they look for their fandom. The catalogue wasn't organised that way.
- **Browsing and sizing friction.** Finding the right product took too many steps, and with no clear sizing, the shopper either abandoned the cart or risked a return.
- **A checkout not built for how India pays.** Most shoppers here expect to pay by UPI or cash on delivery. If those aren't front and centre, the shopper has to hunt for the way they actually pay, at the very last step.

None of these is a big failure on its own. Together, they make every shopper do a little more work, and a few drop off at each step.

## The one idea

> **Answer the shopper's next doubt where they have it, before they have to go looking.**

Why this, and not the usual fixes:

- **"Run more discounts."** A discount doesn't tell anyone whether the hoodie will fit or whether they can pay on delivery. It costs margin and leaves the doubt where it was.
- **"Add a FAQ page."** The answers exist, but the shopper has to leave the product to find them, and most won't.
- **Answering in place** is the cheapest fix. The free-shipping threshold, COD, 15-day returns and fabric weight appear on every page, on the product itself and again at checkout, exactly where the question comes up.

## How the journey works now

1. **Land.** A full-screen video hero and a scrolling announcement bar answer the four doubts in the first second: free shipping over ₹1,499, COD available, easy 15-day returns and 240 GSM heavyweight cotton.
2. **Browse by fandom.** The catalogue (115 products across Men, Women and Kids) is grouped into six themed collections, from Cosmic Heroes to Anime Legends, as well as by garment type.
3. **Find it fast.** Search suggests matching products as you type. Category pages filter by size and price, sort by price, rating or discount, and badge Bestsellers, New drops and Trending pieces.
4. **Decide.** Each product page shows the price against the MRP with the saving in %, the rating and review count, a size guide one tap away, and shipping, returns and secure-payment reassurance next to *Add to Bag*.
5. **Bag.** The coupon shows exactly what it saves, the summary separates the product discount from the coupon, and *Complete the look* suggests more pieces before checkout.
6. **Checkout in three steps.** Address, payment, confirmation. Payment opens on UPI (Google Pay, PhonePe, Paytm, BHIM), with cards, no-cost EMI from ₹3,000, netbanking, wallets and COD a tap away. No account needed.
7. **After the order.** A branded receipt email arrives within seconds. The customer can print or save the receipt, and track the order with just the order ID and phone number. When the order ships, they get an update email.

## Every screen

| | |
|---|---|
| <img src="docs/media/home.jpg" alt="Homepage with a full-screen video hero"><br><sub>**The homepage.** The trust bar on top answers shipping, COD, returns and fabric before the shopper scrolls.</sub> | <img src="docs/media/collections.jpg" alt="Shop by category and themed collections"><br><sub>**Shop by fandom.** Six themed collections sit alongside the usual shop-by-category row.</sub> |
| <img src="docs/media/search.jpg" alt="Search suggestions dropdown"><br><sub>**Search that suggests.** Matching products, with price and photo, appear as you type.</sub> | <img src="docs/media/plp.jpg" alt="Category page with size and price filters"><br><sub>**Filters that matter for clothes.** Size and price filters, sorting, rating and Bestseller badges.</sub> |
| <img src="docs/media/pdp.jpg" alt="Product page"><br><sub>**The product page.** MRP and % off, rating, and the shipping, returns and payment promises next to the buy buttons.</sub> | <img src="docs/media/size-guide.jpg" alt="Size guide modal"><br><sub>**The size guide.** Measurements by size, plus a fit tip, one tap from the size picker.</sub> |
| <img src="docs/media/cart.jpg" alt="Bag with coupon applied"><br><sub>**The bag.** Coupon savings shown line by line, free shipping called out, and *Complete the look* cross-sell.</sub> | <img src="docs/media/checkout-payment.jpg" alt="UPI-first payment screen"><br><sub>**UPI-first payment.** The method most Indian shoppers use is open by default; COD, EMI and the rest are one tap away.</sub> |
| <img src="docs/media/confirmation.jpg" alt="Order confirmation with itemised summary"><br><sub>**Confirmation.** An itemised summary, a downloadable receipt and tracking, with no account needed.</sub> | <img src="docs/media/track.jpg" alt="Order tracking page"><br><sub>**Tracking.** Order ID and phone number are all it takes. Links in the emails open it already filled in.</sub> |
| <img src="docs/media/receipt-email.jpg" alt="Branded receipt email"><br><sub>**The receipt email.** On-brand, itemised, with a track button, the delivery timeline and the returns promise.</sub> | <img src="docs/media/mobile-home.jpg" width="48%" alt="Homepage on a phone"> <img src="docs/media/mobile-pdp.jpg" width="48%" alt="Product page on a phone"><br><sub>**On a phone.** Every screen is built phone-first, where this audience shops.</sub> |

## Who it's for

- **The fan shopper.** A college student or young professional in India who wants their fandom on a tee that feels premium, at ₹549 to ₹3,199. They usually shop on their phone and pay by UPI or cash on delivery. Often they've never bought from this brand before, so trust has to be earned on the page. Their job to be done: *"Find a piece I love, be sure it fits, and know I can send it back if it doesn't."*
- **The gift buyer and the family.** The Women and Kids ranges, the wishlist and the size guide serve shoppers buying for someone else, who can't try anything on.

## How I'd measure it

The store is the prototype. Measuring it needs real traffic and analytics events (GA4 or similar), which is the next step. These are the numbers I'd watch, and what each one tests:

- **Primary: visit-to-order conversion**, split by step: product view, add to bag, checkout start, order placed. This shows exactly where shoppers still drop off.
- **Cart abandonment rate.** It tests whether the up-front trust messages and the UPI-first checkout keep shoppers going.
- **Size-related return rate.** It tests whether the size guide reduces returns.
- **Average order value** around the ₹1,499 free-shipping threshold, and coupon redemption. They test whether the threshold and coupons lift basket size or only give margin away.
- **Payment-method mix** (UPI, COD, cards). COD orders cost more to fulfil and get refused more often, so the share of prepaid orders matters as much as the order count.

## What I know, and what I'm still assuming

I keep first-hand findings separate from guesses.

| Confirmed | Still to validate |
|---|---|
| The friction points above came from auditing a real store's visit-to-order journey. | How much each friction point actually costs in lost orders. That needs the original store's analytics. |
| The rebuilt journey works end to end on the live site: orders are saved, priced on the server, emailed and trackable. | Whether conversion actually improves. That needs an A/B test with real traffic. |
| Every promise (free shipping over ₹1,499, COD, 15-day returns) appears at the moment the shopper needs it. | Whether the size guide measurably reduces size-related returns. |
| | The right free-shipping threshold and coupon levels for margin. |
| | Whether shoppers browse more by fandom collection or by garment type. |

## My role

I audited the original store's journey, found the friction, and decided what to fix and in what order. I wrote the messaging and set the merchandising and promotions: the themed collections, badges, coupon ladder and free-shipping threshold. I designed the checkout and post-purchase experience, and directed the brand: the dark-and-lime look, the Anton type and the voice (*"Wear it like you mean it"*, *"Your drip is locked in"*).

I built the working store with AI coding tools, directing them from the audit rather than writing the code by hand. That is how one marketer can take a conversion problem to a shipped, working fix without an engineering team. The full engineering trail is in this repo for anyone who wants to check it.

## The marketing work

| Skill | Where it shows up in the store |
|---|---|
| **UX and conversion audit** | Mapped the visit-to-order journey of a real store and traced drop-offs to four kinds of friction |
| **Messaging and objection handling** | Trust bar, homepage promise strip and product-page reassurance answer shipping, COD, returns and fabric before checkout |
| **Merchandising** | Six fan-themed collections, Bestseller, New and Trending badges, MRP strike-through with % off, related products from the same collection |
| **Cross-sell and basket building** | *Complete the look* in the bag, plus the free-shipping threshold at ₹1,499 as an order-value nudge |
| **Pricing and promotions** | A coupon ladder: DAPPER10 (10% off), STREET20 (20% off) and FLAT300 (₹300 off over ₹1,499), validated on the server; no-cost EMI from ₹3,000 |
| **Checkout optimisation for India** | 3-step guest checkout, UPI first, then cards, EMI, netbanking, wallets and COD; Indian cities and states, prices in ₹ inclusive of taxes |
| **Lifecycle and CRM email** | A branded order receipt, shipping-update emails at each stage, and a new-order alert for the store owner |
| **Post-purchase trust and retention** | Order tracking without an account, a printable receipt, and a wishlist that remembers favourites |
| **Brand identity** | Logo, dark-and-lime palette, Anton headlines and a confident streetwear voice, carried from the site into every email |
| **Measurement planning** | A funnel metric for each change, so every fix can be tested, not assumed |

<sub>Brand files: [`docs/brand`](docs/brand).</sub>

---

### For engineers

React 19, Tailwind and Framer Motion on Netlify; a FastAPI API with MongoDB Atlas on Render; Resend for email.

- **Orders are priced on the server.** The browser only sends what was picked, so a tampered cart can't change the price.
- **Checkout never fakes a success.** A failed order shows an error and keeps the bag; *Order confirmed* only appears once the order is saved.
- **Emails go out after the order is saved**, so a slow mail provider never delays checkout. All customer input is escaped.
- 15 offline API tests cover pricing, coupons, tracking, receipts, emails and the admin endpoints.

Architecture, API, setup, tests and deployment are in **[TECHNICAL.md](TECHNICAL.md)**.
