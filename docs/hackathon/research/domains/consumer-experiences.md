# Domain 4 Deep Research — Consumer Experiences (`consumer-experiences.md`)

## 1. The Pain Map
- **Who suffers & scale**:
  - **140M+ senior citizens in India and 58M+ in the US**, plus hundreds of millions of online shoppers losing **$12.5B+ annually to FTC-reported e-commerce scams, fake tech-support popups, and counterfeit flash-sale ads** ([FTC Consumer Sentinel](https://www.ftc.gov/)).
  - **The Elder & Vulnerable Shopper Trap**: When an elderly parent is pressured on a phone/WhatsApp scam or clicks a deceptive social media ad selling a "$299 Miracle Medical Device" (worth $18 on genuine sites), standard bank cards and UPI transfers execute irreversibly. Families face an impossible binary choice: either take away their parent's financial independence completely, or watch them get scammed.
  - **The Dark-Pattern Subscription Trap**: Consumers lose an average of $133/month to forgotten or deceptive "free-trial-to-annual" recurring subscriptions (targeted by India's CCPA Dark Patterns Guidelines 2023 and the FTC Click-to-Cancel rule).

## 2. Urgency Score: **8.5 / 10** (Note: Competition Density is **High ~34%**, so only non-chatbot defensive consumer tools win here!)
- **Triggers**:
  - Surge in AI deepfake voice scams and cloned merchant storefronts in 2025–2026.
  - Availability of **Channel3 (`trychannel3.com`)** 100M+ product graph to verify whether a merchant's price and product listing are legitimate in under 400ms.
  - PayPal's native `Orders v2 AUTHORIZE` hold (`honor_period` up to 29 days), `Subscriptions API`, and `Disputes API`.

## 3. Prior Art Table
| Name | Type | Traction | What It Does | Specific Gap We Exploit | Link |
|---|---|---|---|---|---|
| **Carefull** / **EverSafe** | Elder FinTech | $15M+ raised | Read-only bank monitoring that alerts adult children *after* a suspicious transaction has already cleared. | Post-mortem alerting only! Does not intercept the checkout in real time via a **PayPal `Orders v2 AUTHORIZE` hold + Family Guardian Co-Sign (`SilverGuard Pay`)**. | [getcarefull.com](https://www.getcarefull.com/) |
| **Rocket Money (Truebill)** | Subscription App | Acquired for $1.27B | Tracks recurring bills; charges 30–60% of first year's savings to negotiate cancellations. | High fees; does not natively orchestrate **PayPal Subscriptions API (`update_subscription`, `cancel_subscription`)** via an open MCP agent in **AG Grid**. | [rocketmoney.com](https://www.rocketmoney.com/) |
| **PayPal Honey** / **CamelCamelCamel** | Browser Extensions | 30M+ users | Applies coupon codes or emails price-drop alerts. | Alerts the user when they are asleep; does not hold a pre-authorized **PayPal `AUTHORIZE` limit order** that executes automatically when **Channel3** detects the target price drop (`DropHoundPay`). | [joinhoney.com](https://www.joinhoney.com/) |

## 4. Gap Analysis (3 Buckets)
- **Doesn't Exist**:
  - **SilverGuard Pay (`8.48/10`)**: Senior scam-interception & delegated family co-sign checkout. Seniors shop independently with PayPal, but if an AI risk check + **Channel3** price-oracle scan flags an item as a scam, 300% markup, or unusual category, the checkout is placed into a **PayPal `Orders v2 AUTHORIZE` hold** (not declined—preserving dignity!) and sends a 1-tap **Co-Sign (`CAPTURE`) or Block (`VOID`)** card to the adult child's **AG Grid** Guardian Console.
  - **ClaimMate Consumer (`7.65/10`)**: Multimodal unboxing & defective-delivery verifier that compares a buyer's unboxing video/photo against the original **Channel3** SKU spec and auto-drafts a structured **PayPal Disputes** claim.
- **Exists But Weak**:
  - **SubSniper AI (`8.18/10`)**: Autonomous subscription-trap detector & retention downgrader using **PayPal Subscriptions API** (`list/get/update/cancel_subscription`), **Bryntum Calendar** renewal timeline, and **AG Grid**.
  - **DropHoundPay (`7.95/10`)**: Autonomous price-drop limit-order checkout sniper combining **Channel3** live price polling with **PayPal Orders v2** and **Pay Later**.
- **Exists Abroad, Not in India**:
  - **AllowanceOS Family (`7.78/10`)**: Chore/study-verified student wallet & micro-milestone allowance engine using **Bryntum TaskBoard** and **PayPal Sandbox** transfers.
