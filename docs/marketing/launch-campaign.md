# The Friday Drop: Anime Legends launch campaign

A launch campaign for Dapper Den's first collection drop, and the retention flows that turn first orders into repeat ones. The landing page, sign-up, offers and lifecycle emails are built and working in the store. Every number below that isn't a store setting is an **assumption to replace with real data**, and is marked as one.

**[See the drop page →](https://dapper-denn.netlify.app/drop)**

| | |
|---|---|
| **Goal** | Build an owned audience of 2,000 fans before the drop, then convert them on drop night |
| **Idea** | A weekly ritual: *Drops Friday. 8 PM.* Limited pieces, announced to the list first |
| **Collection** | Anime Legends: 20 pieces, ₹649 to ₹2,499 (median ₹1,424) |
| **Timeline** | 14 days before the drop to 14 days after |
| **Budget** | ₹1,00,000 (illustrative) |

<p>
<img src="creatives/feed-drop-announce.jpg" width="31%" alt="Feed post: Anime Legends drops Friday, get the drop alert">
<img src="creatives/story-countdown.jpg" width="21%" alt="Story: countdown to the Friday drop">
<img src="creatives/feed-referral.jpg" width="31%" alt="Feed post: give ₹200, get ₹200">
</p>
<sub>Launch creatives: the announcement post, the countdown story, and the referral post for after the first orders.</sub>

---

## 1. Why a drop, and why a list

The rebuild fixed what happens after a shopper arrives. This campaign solves the step before: getting the right shoppers to arrive at all, and giving them a reason to come back.

- **Fans buy on a calendar.** A fixed weekly moment ("Friday, 8 PM") gives people something to anticipate and a reason to act now rather than "later". The store's trust bar already promises *New drop every Friday*; the campaign makes that promise real.
- **A list is an asset; a click is a cost.** Paid social rents attention once. An email and WhatsApp list can be reached again for every future drop at almost no cost. So the primary KPI is sign-ups, not first-day sales.
- **The doubts are already answered.** Free shipping over ₹1,499, cash on delivery, 15-day returns and the fit score all live on the page, so paid traffic lands somewhere built to convert it.

## 2. Audience

**Primary: the anime fan who dresses like it.** 18 to 26, a student or early in their career, in a metro or tier-2 Indian city. They live on Instagram and YouTube and follow artists, cosplayers and streetwear accounts. They shop on their phone and pay by UPI.

- **What they want:** a piece that shows their fandom and still looks like streetwear, not convention merch.
- **What stops them:** never having heard of the brand, not knowing if it will fit, and not wanting to pay up front for a brand they don't know yet.
- **Insight (hypothesis to test):** *"I want people who know, to know. Everyone else should just think it's a sick tee."*

**Secondary: the gift buyer.** A friend or sibling buying for a fan, who can't try anything on. The size guide, fit score and 15-day returns do the work here.

## 3. Message

**Campaign line:** *Drops Friday. Wear it loud.*

| Pillar | What we say | Proof in the store |
|---|---|---|
| **Original design** | Hand-illustrated art inspired by the anime you love, not a printed screenshot | Collection pages, product photography |
| **Quality** | 240 GSM heavyweight cotton, prints that don't crack | Product page details, fabric line in the trust bar |
| **Zero-risk first order** | Free shipping over ₹1,499, cash on delivery, 15-day returns, a fit score from real buyers | Trust bar, product page, checkout |
| **Scarcity, honestly** | Limited pieces each Friday; the list hears first | Countdown on the drop page |

**Intellectual property.** Fandom merch at real brands is usually licensed. Dapper Den's art must be original and *inspired by* anime aesthetics: no characters, logos or names from an existing series without a licence. Collection names stay generic ("Anime Legends", not a show's name).

## 4. Offers

Each offer has one job, and only one coupon applies per order.

| Offer | Who gets it | Job | Guardrail |
|---|---|---|---|
| **EARLYDROP:** 15% off | Drop-list members | Reward joining the list | Orders above ₹1,499 (also clears free shipping) |
| **₹50 off for paying online** | Everyone who pays by UPI, card, wallet or netbanking | Move orders away from cash on delivery, which costs more and gets refused more often | Applied on the server, stacks with a coupon |
| **Give ₹200, get ₹200** | Every customer gets a code after ordering | Turn buyers into the acquisition channel | First orders above ₹999 only; not your own code; each reward code works once |
| **Free shipping over ₹1,499** | Everyone | Lift basket size | Already in the store |

## 5. Channels

| Channel | Role | What runs |
|---|---|---|
| **Instagram (organic)** | Hype and proof | Teaser reel of the art process, the announcement post, countdown stories, drop-night story, reposts of buyers' fit checks |
| **Creator seeding** | Credibility with the exact audience | 12 micro-creators (10k to 100k followers) in anime, cosplay and streetwear get two pieces and a personal link (`utm_source=creator-<handle>`). Try-on reels, not scripted ads |
| **Meta ads (Reels and Stories)** | Scale the sign-ups | Prospecting on anime and streetwear interests, then retargeting drop-page visitors who didn't sign up |
| **WhatsApp** | The drop-night message | One reminder the day before, one "it's live" message at 8 PM, both to opted-in numbers only. Sending needs a WhatsApp Business API provider; the store already collects the opt-ins |
| **Email** | The same two moments, plus every lifecycle email | Drop-list confirmation (live), reminder, drop-live, receipt, referral, fit question |
| **YouTube Shorts** | Cheap extra reach | The same reels, re-cut |

### Tracking links

Every link carries UTM tags. The drop page **records the `utm_source` of each sign-up**, so sign-ups per channel can be read straight from the admin list.

| Channel | `utm_source` | `utm_medium` | Example |
|---|---|---|---|
| Instagram bio and stories | `instagram` | `social` | `/drop?utm_source=instagram&utm_medium=social&utm_campaign=anime-legends-drop` |
| Meta ads | `meta` | `paid-social` | `…&utm_content=feed-drop-announce` (one value per creative) |
| Creators | `creator-<handle>` | `influencer` | `/drop?utm_source=creator-inkbyananya&utm_medium=influencer` |
| WhatsApp shares | `whatsapp-share` | `referral` | Built into the "Tell your squad" button |
| Email | `email` | `email` | Links in the drop emails |

## 6. Calendar

*D* is drop day: Friday, 8 PM IST.

| When | Channel | Asset | Call to action |
|---|---|---|---|
| D-14 | Reels, Shorts | Teaser: the artist sketching a print, no product shown | "Something's dropping. Friday." |
| D-12 | Creators | Seeding boxes ship with a handwritten note and personal link | — |
| D-10 | Feed, Meta ads | **Announcement post** (`feed-drop-announce`); drop page goes live; prospecting ads start | Get the drop alert |
| D-7 | Creators | Try-on and unboxing reels go out over 3 days | Link in bio: get the alert |
| D-5 | Stories | **Countdown story** (`story-countdown`) and a behind-the-print carousel | Tap the link |
| D-3 | Meta ads | Retargeting drop-page visitors who didn't sign up | "15% off for the list ends Friday" |
| D-1 | WhatsApp, email | "Tomorrow, 8 PM" reminder to the list | Set a reminder |
| D, 7:30 PM | Stories | "30 minutes" | — |
| **D, 8 PM** | **WhatsApp, email, stories** | **"It's live"** with a direct link to the collection | Shop the drop |
| D+1 | Feed | **Referral post** (`feed-referral`) and the first fit-check reposts | Share your code |
| D+1 to D+3 | Email | Bag reminders run hourly for unfinished checkouts | Complete your order |
| D+7 onward | Email | Orders marked Delivered get "How did it fit?" | Two taps per item |
| D+14 | — | Results against the KPIs below; plan Drop 02 | — |

## 7. Budget and funnel (illustrative)

**Spend: ₹1,00,000**

| Line | ₹ | Notes |
|---|---|---|
| Meta ads | 45,000 | About 70% prospecting, 30% retargeting |
| Creator seeding | 30,000 | 12 creators × (two tees at cost, ~₹750 each, plus a ₹1,000 fee) |
| Content production | 15,000 | One shoot day, reel edits |
| WhatsApp and email tools | 5,000 | WhatsApp Business API messages |
| Contingency | 5,000 | |

**Sign-ups.** *Every rate here is an assumption to replace with real data.*

| Source | Working | Sign-ups |
|---|---|---|
| Meta ads | ₹45,000 at ₹120 CPM = 3.75 lakh impressions × 1.0% CTR = 3,750 visits × 25% sign-up rate | ~940 |
| Creators | 12 × 25,000 followers × 25% view rate = 75,000 views × 1% click = 750 visits × 30% | ~225 |
| Organic and shares | ~3,000 visits × 25% | ~750 |
| **Total** | | **~1,900** (target 2,000) |

**Drop night.**

| | Working | Result |
|---|---|---|
| Orders | 1,900 list members × 6% conversion | ~115 |
| Average order | 1.3 items × ₹1,424 = ~₹1,850, less 15% EARLYDROP and ₹50 prepaid | ~₹1,520 net |
| Revenue | 115 × ₹1,520 | ~₹1.75 lakh |
| Contribution per order | ₹1,520 − ₹925 product cost (50% margin on list price) − ₹120 shipping − ₹30 payment fees | ~₹445 |
| Contribution | 115 × ₹445 | ~₹51,000 |

**What that means.** On these assumptions the campaign earns back about half its cost on drop night. That's expected: it is a list-building investment, not a one-night sale. Each later drop reaches the same ~1,900 people at almost no cost. At a more cautious 3% conversion, one drop brings ~57 orders and ~₹25,000 of contribution. **The campaign pays back after about two more drops.** Referrals and repeat buyers bring that forward. The number to watch is **cost per sign-up**. At ₹100 a sign-up, the list halves to ~1,000 and payback stretches to five or six drops. If it climbs that high, shift the mix from ads to creators and referrals.

## 8. Measurement

| KPI | Target | Where it comes from |
|---|---|---|
| **Drop-list sign-ups** (primary) | 2,000 | `/api/admin/drop-alerts` (count, with source per sign-up) |
| Cost per sign-up | ≤ ₹50 | Spend ÷ sign-ups, per `utm_source` |
| Drop-page sign-up rate | ≥ 25% | Analytics visits ÷ sign-ups |
| Drop-night conversion of the list | ≥ 6% | Orders using EARLYDROP ÷ list size |
| Prepaid share of drop orders | ≥ 65% | `prepaid_discount` on orders |
| Referral share of orders, first 30 days | ≥ 10% | Orders with a referral code |
| Size-related returns on drop orders | Below the store baseline | Returns, plus fit answers ("too small" or "too big") |

**Tests to run.** These are cheap, one variable at a time, on the drop page or in the ads:

1. Headline: *"Drops Friday."* vs *"Only for the list."*
2. List offer: 15% off vs a free sticker pack. Is the discount needed at all?
3. Countdown on the drop page vs no countdown.
4. Creator try-on reel vs studio creative, as Meta ad assets.

## 9. Retention flows (built in the store)

These run on their own once the store is live. Each one closes a gap in the journey after the first order.

| Flow | Trigger | Message | Job | Status |
|---|---|---|---|---|
| **Prepaid nudge** | The payment step | "You're saving ₹50 by paying online"; on cash on delivery: "Pay online instead and save ₹50" | More prepaid orders, fewer refused deliveries | Live |
| **Bag reminder** | Address entered, no order after 1 hour | "Your bag is waiting", with a link that refills the bag on any device | Recover abandoned checkouts | Live. Sent once, up to 48 hours. Needs an hourly scheduler (see DEPLOYMENT.md) |
| **Receipt with referral code** | Order placed | The receipt, plus "Give ₹200, get ₹200" with a WhatsApp share button | Every buyer becomes a referrer | Live |
| **Referral reward** | A friend's first order uses the code | "Your code worked": a one-time ₹200 code | Close the loop, so people share again | Live |
| **Fit question** | Order marked Delivered | "How did it fit?": too small, just right or too big, plus a star rating | Size data and reviews | Live |
| **Fit score** | Three or more answers for a product | "82% say true to size" under the size picker | Fewer size-related returns, more confidence | Live |
| **Drop-list confirmation** | Sign-up | "You're on the list" with the EARLYDROP code | List growth | Live for email. WhatsApp sending needs a provider |

## 10. Risks

| Risk | Mitigation |
|---|---|
| Using someone else's IP | Original art only; legal check before any licensed collaboration |
| Fake scarcity | Say how many pieces exist, and only post "last sizes" when it's true |
| Cash-on-delivery refusals eat the margin | Prepaid nudge; watch the prepaid share and consider a COD fee if it stays low |
| A creator says something off-brand | Brief on tone and boundaries; review before boosting a post with ads |
| Discount habit | One coupon per order; EARLYDROP only for the list; measure whether the list converts without it (test 2) |

---

<sub>Portfolio project by Prithwiraj Mukherjee. Dapper Den is a demo store: the campaign is a plan, and the numbers are assumptions until it runs.</sub>
