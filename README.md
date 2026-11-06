# Paynesville Entertainment Awards (PEA): Voting Website Prototype

This is a mobile-friendly voting website for the **Paynesville Entertainment Awards 2026/2027**. It is built with plain **HTML5, CSS and JavaScript** and needs no build step.

- **34 official categories and 187 nominees**, taken from the organizers' category posters. Nominee photos were cropped from those posters and are stored in `assets/nominees/`.
- **Free email voting.** Each email address gets **2 votes in every category**. Voters can give both votes to one nominee or split them between two.
- **Light and dark mode.** The default follows the device setting, and the ☀️/🌙 button in the header switches between them.
- **Responsive layout**, tested at 320, 375, 414, 768, 1024 and 1440 pixels wide.

## Pages

| Page | File | What it does |
|---|---|---|
| Home | `index.html` | PEA branding, welcome message, event banner with countdown, voting announcement and Vote Now button |
| Award Categories | `categories.html` | All categories, with search across categories and nominees |
| Nominees | `nominees.html?cat=…` | Nominee photos for a category, plus the official category poster |
| Nominee profile | `nominee.html?id=…` | Photo, name, biography, category, and Vote and Share buttons |
| Vote | `vote.html?id=…` | Voter enters an email and sees how many votes they have left in that category |
| Vote Confirmation | `confirmation.html?ref=…` | Vote reference, nominee and category, and votes left |
| My Votes | `history.html` | Voting history and the categories that still have votes left, looked up by email |
| Admin Dashboard | `admin.html` | Private organizer area: live totals, results per category, vote log with CSV export, manage nominees, categories and photos, open or close voting, set votes per email |

Prototype admin password: `pea2026`

## Prototype limitations

- Votes are saved in the **browser's localStorage**, so each device only sees its own votes.
- Email addresses are **not verified**.
- The admin login is a client-side demo gate.

**For production**, you will need a backend server and database, email verification (a one-time code or magic link), server-side vote limits, and secure organizer accounts.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```
