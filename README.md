# ⚡ Plan ₿ Bitcoin Educational Quiz

A Bitcoin education web application developed for the **Plan ₿ Developer Track**.

The application lets users test their Bitcoin knowledge through questions sourced from the official Plan ₿ Network BTC101 course material. Users who achieve a perfect score of **5/5** can automatically receive a **1,500 satoshi reward** through the Lightning Network.

> Educational project designed for testing and learning purposes. Use a controlled LNbits wallet and test funds only.

---

## Overview

This project combines Bitcoin education, a web-based quiz experience, local user tracking, and Lightning Network micropayments.

Each registered user receives five randomly selected questions. The application randomizes both the questions and the order of the answers. A user can attempt the quiz once per day. If the user answers all questions correctly, the application sends a Lightning reward automatically.

---

## Features

- Bitcoin quiz based on Plan ₿ Network BTC101 educational material
- Dynamic question retrieval from the official Plan ₿ Network GitHub repository
- YAML parsing for quiz content
- Five randomly selected questions per attempt
- Randomized answer order
- User registration through a Lightning Address
- Automatic LNbits wallet creation for new users
- Automatic Lightning Network reward of 1,500 satoshis for a perfect score
- One attempt per user per day to reduce abuse
- SQLite database for users, attempts, scores, and payments
- Payment and winner-history dashboard at `/logs.html`
- Environment-variable configuration for LNbits credentials

---

## Tech Stack

| Area | Technology |
|---|---|
| Backend | Node.js, Express |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Database | SQLite3 |
| Lightning integration | LNbits API |
| Configuration | dotenv |
| Question parsing | js-yaml |
| Content source | Plan ₿ Network BTC101 repository |

---

## Project Structure

```text
quiz-planB/
├── public/
│   ├── index.html       # Main quiz interface
│   ├── logs.html        # Payment and winner-history dashboard
│   ├── style.css        # Application styling
│   └── script.js        # Frontend quiz logic
├── server.js            # Express server, SQLite logic, and LNbits integration
├── package.json         # Project dependencies and scripts
├── .env.example         # Safe environment-variable template
├── .gitignore           # Files excluded from Git
└── README.md
```

---

## Prerequisites

Before starting, make sure you have:

- [Node.js](https://nodejs.org/) version 14 or newer
- An LNbits account or LNbits instance
- A dedicated LNbits wallet used as the reward treasury
- LNbits API keys for that wallet
- Internet access to retrieve the Plan ₿ BTC101 question source

For development and testing, use an LNbits Signet or test environment and a wallet with limited funds.

---

## Installation

Clone the repository:

```bash
git clone [https://github.com/DanieleSK-tech/quiz-planB.git](https://github.com/DanieleSK-tech/quiz-planB.git)
cd quiz-planB
```

Install the dependencies:

```bash
npm install
```

Create the local environment configuration file.

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

### macOS / Linux

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder values with your own LNbits test-wallet credentials:

```env
LNBITS_URL=[https://lnbits-signet.planb.academy](https://lnbits-signet.planb.academy)
ADMIN_KEY=your_lnbits_admin_key
BIGPOT_WALLET_ID=your_reward_wallet_id
BIGPOT_INVOICE_KEY=your_reward_wallet_invoice_key
```

Start the application:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

---

## Security Notes

- Never commit `.env` files to GitHub.
- Never publish LNbits API keys, wallet IDs, invoices, private credentials, or real user data.
- Use only a dedicated LNbits test wallet with a limited balance.
- Ensure `.env`, `node_modules/`, SQLite database files, and logs are included in `.gitignore`.
- This is an educational prototype. Do not use it in production without a security review, proper rate limiting, input validation, authentication, and stronger anti-abuse controls.

Recommended `.gitignore` entries:

```gitignore
node_modules/
.env
.env.local
.env.*.local
*.db
*.sqlite
*.sqlite3
*.log
npm-debug.log*
.DS_Store
Thumbs.db
```

---

## Educational Context

This project was developed as a milestone for the **Plan ₿ Developer Track** at the Plan ₿ Bitcoin Business School in Lugano.

It explores how Bitcoin education can be combined with Lightning Network micropayments to create an engaging learning experience. Quiz questions are sourced from Plan ₿ Network educational material.

---

## Future Improvements

- Add automated tests for quiz logic and payment flows
- Add stronger authentication and anti-abuse controls
- Add configurable rewards and quiz categories
- Add Docker support for easier local deployment
- Add an automated database initialization script
- Add deployment instructions for a test environment

---

## License

This project is released under the MIT License.

---

## Author

**Daniele Vailati**

- GitHub: [@DanieleSK-tech](https://github.com/DanieleSK-tech)
- LinkedIn: [Daniele Vailati](https://www.linkedin.com/in/daniele-vailati-1002a6398/)

---

## Acknowledgements

- [Plan ₿ Network](https://planb.network/) for Bitcoin education material
- [LNbits](https://lnbits.com/) for Lightning wallet and API infrastructure
