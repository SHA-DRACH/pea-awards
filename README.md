# Paynesville Entertainment Awards (PEA) — Voting Website Prototype

A mobile-friendly voting website prototype for the **Paynesville Entertainment Awards 2026/2027**, built with plain **HTML5, CSS and JavaScript** (no build step).

## Pages

| Page | File | What it does |
|---|---|---|
| Home | `index.html` | PEA branding, welcome message, event banner with countdown, voting announcement, **Vote Now** |
| Award Categories | `categories.html` | All 34 official categories, with search across categories and nominees |
| Nominees | `nominees.html?cat=…` | Nominees in a category, with the official category poster |
| Nominee profile | `nominee.html?id=…` | Photo, name, biography, category, **Vote** and share buttons |
| Buy Votes + Payment | `vote.html?id=…` | Choose the number of votes ($0.25 each), then pay with Orange Money or Lonestar Cell MTN MoMo (simulated) |
| Vote Confirmation | `confirmation.html?ref=…` | Receipt with reference, votes purchased, nominee and amount |
| Voter History | `history.html` | Look up past purchases and votes by Mobile Money number |
| Admin Dashboard | `admin.html` | Private organizer area: live totals, results per category, transactions, CSV export, manage nominees and categories, open or close voting, change the price |

Prototype admin password: `pea2026`

## Prototype limitations

- Data (votes, transactions, nominees) is saved in the **browser's localStorage**, so each device sees its own data.
- Payments are **simulated**. No money is charged.
- The admin login is a client-side demo gate.

**For production**, you will need a backend server and database, real Orange Money and MTN MoMo payment APIs with payment callbacks, server-side vote counting, and secure organizer accounts.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```
