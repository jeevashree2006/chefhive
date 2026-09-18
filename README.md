# ChefHive website

Book cooks who specialise in traditional, regional Indian food for poojas, festivals and family functions.
Plain HTML, CSS and JavaScript with no build step and no dependencies. It can be hosted on any static host.

## Pages

| Page | What it does |
| --- | --- |
| `index.html` | Home: hero with quick booking, occasions, food traditions, occasion menus, how it works, pricing, FAQ |
| `book.html` | 6-step booking: occasion → tradition & food rules → menu → date/place/guests → cook level & extras → review & contact. The price updates live. |
| `partner.html` | "Join as a cook" application form |

## Run it locally

Open the folder in VS Code and use the Live Server extension. Or run a local server:

```bash
python -m http.server 5500
```

Then open http://localhost:5500. Opening `index.html` directly also works.

## Where to change things

| To change | Edit |
| --- | --- |
| Phone, WhatsApp, email, cities, notice period, advance % | `assets/js/config.js` |
| Occasions, cook levels & prices, add-ons, occasion menus (packages) | `assets/js/data.js` |
| Food traditions and their dishes (veg / non-veg / onion-garlic / root-vegetable flags) | `assets/js/menus.js` |
| Colours, fonts, spacing | `:root` tokens at the top of `assets/css/base.css` |
| Home page text, FAQ | `index.html` (the FAQ is also in the JSON-LD block in `<head>`, so keep both in sync) |

Pricing formula (in `CH.estimate`, `assets/js/common.js`):
cook fee = level base + extra guests × per-guest rate + extra dishes × per-dish rate, plus any add-ons.
The advance is `advancePercent` of the total, rounded up to the nearest ₹10.

## Receiving bookings (Google Sheets, about 5 minutes)

Until `bookingEndpoint` / `partnerEndpoint` are set, the site runs in **demo mode**: submissions are saved only in the visitor's browser.

1. Create a Google Sheet, then open **Extensions → Apps Script** and paste:

   ```js
   function doPost(e) {
     const data = JSON.parse(e.postData.contents);
     const name = data.kind === 'partner' ? 'Cooks' : 'Bookings';
     const ss = SpreadsheetApp.getActiveSpreadsheet();
     const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
     const row = {};
     Object.keys(data).forEach((k) => { row[k] = typeof data[k] === 'object' ? JSON.stringify(data[k]) : data[k]; });
     if (sheet.getLastRow() === 0) sheet.appendRow(Object.keys(row));
     const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
     sheet.appendRow(headers.map((h) => (h in row ? row[h] : '')));
     return ContentService.createTextOutput('ok');
   }
   ```

2. **Deploy → New deployment → Web app**. Set "Execute as: Me" and "Who has access: Anyone".
3. Paste the web app URL into both `bookingEndpoint` and `partnerEndpoint` in `assets/js/config.js`.

Each booking arrives as one row with a reference (`CH-XXXXXX`), the full menu, the date, the guest count, the price breakdown and the contact details.
Because the endpoint is public, add a spam check (for example a honeypot field or Cloudflare Turnstile) before promoting the site widely.

## Before launch

- [ ] Set real `phoneDisplay`, `phoneLink`, `whatsappNumber` and `email` in `config.js` (the call and WhatsApp buttons stay hidden until set).
- [ ] Connect the endpoints above, then set `demoMode: false`.
- [ ] Replace the Unsplash photos (IDs in `data.js` and the image URLs in `index.html` / `partner.html`) with your own food and cook photos.
- [ ] Confirm prices in `data.js`.
- [ ] Check that every promise is true on day one: "background-checked cooks", "taste-tested", "we call you within 2 working days" and the cities list.
- [ ] Add Privacy Policy, Terms and Cancellation Policy pages. You collect phone numbers and addresses, so India's DPDP Act applies.
- [ ] Point `chefhive.in` at your host. Netlify, Vercel, Cloudflare Pages and GitHub Pages all work: upload the folder as-is.
