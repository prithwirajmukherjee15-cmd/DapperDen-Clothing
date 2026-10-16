# Usability walkthroughs on the live store

**What this is:** automated persona walkthroughs of the live store, not research with real shoppers. Six AI agents each played one shopper and drove a real browser through [dapper-denn.netlify.app](https://dapper-denn.netlify.app) and its production API on 16 October 2026. They found 28 issues, 26 of which are now fixed.

## Method

- **Real environment.** Each agent drove Chromium with Playwright against the deployed store and API, the same site any visitor gets. Nothing was mocked, except where noted below.
- **Six personas, six devices.** Each persona had a goal, a budget and habits typical of the store's audience (see the table below). Devices were emulated: iPhone and Android viewports with touch, a low-end phone on throttled 3G with a slowed CPU, and keyboard-only browsing at 200% zoom.
- **Evidence or it didn't count.** Every finding had to be backed by something the agent observed: a screenshot, a measured element size, a timing or a console error. The persona's opinion was recorded separately and not counted as evidence.
- **No real orders.** The agents stopped at the payment screen and didn't submit the drop-list or feedback forms.
- **Merged and traced.** A final pass merged duplicates, ranked the issues by severity and by how many personas hit them, and traced each one to the line of code that caused it.

## Who walked through it

| Persona | Device | Task | Reached the goal? |
|---|---|---|---|
| **Riya**, 21, student in Pune, ₹1,500 budget, pays by UPI | iPhone 13 | Find an anime oversized tee in M, apply a coupon, pay by UPI | Yes |
| **Arjun**, 27, engineer in Bengaluru, buying a gift | Desktop | Pick a hoodie size for his brother; find delivery time, returns and tracking | Partly |
| **Meera**, 36, parent in Kolkata | Pixel 7 | Buy kids' tees for ages 5 and 9, get free shipping, pay cash on delivery | Yes |
| **Kabir**, 19, first-time online shopper in Lucknow | Low-end Android on slow 3G | Search the way he talks ("black tshirt"); decide whether to trust COD | Partly |
| **Sana**, 29, low vision | Keyboard only, 200% zoom | Buy a women's hoodie without a mouse | Yes |
| **Dev**, 23, sneakerhead in Mumbai, from an Instagram link | iPhone 13 Pro Max | Understand the Friday drop, check the sneakers and the referral offer | Partly |

## What they found

28 issues: 1 blocker, 12 major, 10 minor and 5 polish.

### The ones that mattered most

| Issue | Personas | What was happening | Fix |
|---|---|---|---|
| **The phone menu didn't open** (blocker) | 5 of 6 | The header's background blur made the menu drawer size itself to the 64px header, so it showed only the logo and the close button | The drawer now renders outside the header. It also traps focus, closes on Escape and lists collections, the drop and order tracking |
| **No search on phones** | 4 | The search box was hidden below 768px and there was no search icon | Added a search button that opens a full-width search box, plus a search box inside the menu |
| **Everyday searches found nothing** | 3 | "black tshirt", "anime oversized" and "hoodie under 1500" all returned 0, because the whole phrase was matched as one string | Search now matches each word, knows tshirt/tee/kicks/trackpants, reads "under ₹N" as a price cap, and has a search box, gender filter and sort on the results page. Unit-tested |
| **The payment screen opened halfway down** | 3 | Changing checkout step didn't scroll back up, so phones landed on "Verify & Pay" with the amount off-screen | Each step now starts at the top, and the step names show on phones |
| **Cash on delivery was hidden** | 2 | COD was the last tab of a strip that scrolled sideways with no hint | Payment methods are now a two-column grid on phones, with every method visible |
| **"Free shipping" with a ₹99 charge** | 3 | The product page promised free shipping unconditionally; the bag charged ₹99 below ₹1,499 and never said how much more was needed | The product page states the condition, and the bag shows "Add ₹X more for free delivery" with a progress bar and suggestions that would close the gap |
| **No order summary at payment** | 3 | Shoppers couldn't check items, sizes, coupon or shipping before paying | Both checkout steps now show the items and the price breakdown |
| **A "colour" picker that was really the photo gallery** | 4 | Tapping the back-view photo set the colour to "Colour 2", and the bag showed the wrong photo | Removed the fake colour picker. Bags, emails and tracking no longer show "Colour 1"-style labels |
| **Sneakers sold with T-shirt copy** | 3 | Sneakers showed a T-shirt size chart, T-shirt description and T-shirt reviews | Size guides, descriptions, fit notes and sample reviews are now chosen by product type, including a UK/EU/US shoe chart |
| **Fit information too thin to choose a size** | 3 | The chart didn't say whether it was body or garment measurements, and the fit score only appears after three buyers answer | Charts say what they measure, and every product has a fit note |
| **Delivery time only in the FAQ** | 1 | No delivery estimate anywhere between product and payment | "Delivered in 3–5 business days: arrives by [date]" now appears on the product, the bag and checkout |
| **Keyboard and screen-reader gaps** | 1 | Unlabelled form fields and icon buttons, an invisible-but-focusable Quick Add, focus lost on every page change, low-contrast pay button | Labelled every field and icon control, added autocomplete, made Quick Add appear on focus, added a skip link, moved focus to the page on navigation, darkened the pay button |

### The rest

- **Fixed:** a coupon button that looked dead while the API woke up; a drop countdown that showed 00:00:00:00 until the API answered; a 15% drop offer that hid its ₹1,499 minimum; the referral offer explained nowhere before ordering; Help links that all opened the same answer; dead social-media links; footer links only for Men; collection filters without type or gender; no guidance when an order isn't found; city and state not filled in from the pincode; a size-error toast covering the buttons; Quick Add choosing an adult size for kids' and shoe products.
- **Partly fixed:** pages were heavy on slow data (product cards now load 400px images instead of 800px, but full responsive images are still to do), and the "Added to bag" toast can still cover the buttons at high zoom.

## What worked

- **Prices were right to the rupee.** ₹1,399 − ₹280 (STREET20) + ₹99 shipping − ₹50 prepaid = ₹1,168, exactly what the payment screen showed.
- **Coupons were easy to find and clear when they failed** ("Add items worth ₹1,499 or more to use FLAT300").
- **Browsing stayed fast on throttled 3G**, because the catalogue ships with the site (0.1–0.5 s between pages).
- **Kids' sizing by age** and its size guide settled the size question for the parent.
- **The whole flow could be done by keyboard**, with no keyboard traps.
- **The demo-store notice** was consistent across the top bar, checkout and footer.

## Limits

- **These were simulated shoppers.** The walkthroughs find bugs and friction reliably, but they say nothing about what real people prefer, trust or buy. The next step is a five-person test with real shoppers.
- **The API was warm** during the runs, so its cold start (up to about a minute on the free tier) was simulated by holding requests, not observed.
- **One run per persona,** so rarer paths (returns, failed payments) weren't covered.
