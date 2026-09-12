# ⚡ Plan ₿ Bitcoin Educational Quiz

A Bitcoin education web application developed for the **Plan ₿ Developer Track**.

The application lets users test their Bitcoin knowledge through questions sourced from the official Plan ₿ Network BTC101 course material. Users who achieve a perfect score of **5/5** can automatically receive a **1,500 satoshi reward** through the Lightning Network.

> Educational project. Designed for testing and learning purposes, using LNbits and a controlled reward wallet.

---

## Overview

The project combines Bitcoin education, a web-based quiz experience, local user tracking, and Lightning Network micropayments.

Each registered user receives five randomly selected questions. The application randomizes both the questions and the order of the answers. A user can attempt the quiz once per day. If the user answers all questions correctly, the application sends a Lightning reward automatically.

---

## Features

- Bitcoin quiz based on the Plan ₿ Network BTC101 educational content
- Dynamic question retrieval from the official Plan ₿ Network GitHub repository
- YAML parsing for quiz content
- Five randomly selected questions per attempt
- Randomized answer order
- User registration through Lightning Address
- Automatic LNbits wallet creation for new users
- Lightning Network reward of 1,500 satoshis for a perfect score
- One attempt per user per day to reduce abuse
- SQLite database for users, attempts, scores, and payments
- Payment and winner history dashboard at `/logs.html`
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

## Architecture

```text
quiz-planB/
├── public/
│   ├── index.html       # Main quiz interface
│   ├── logs.html        # Payment and winner history dashboard
│   ├── style.css        # Application styling
│   └── script.js        # Frontend quiz logic
├── server.js            # Express server, SQLite logic, LNbits integration
├── package.json         # Project dependencies and scripts
├── .env.example         # Environment-variable template
├── .gitignore           # Files excluded from Git
└── README.md
```

---

## Prerequisites

Before starting, make sure you have:

- [Node.js](https://nodejs.org/) version 14 or newer
- An LNbits account or instance
- A dedicated LNbits wallet used as the reward treasury ("Big Pot")
- LNbits API keys for that wallet
- Internet access to retrieve the Plan ₿ BTC101 question source

For testing, a Signet or test environment is recommended.

---

## Installation

Clone the repository:

```bash
git clone [https://github.com/DanieleSK-tech/quiz-planB.git](https://github.com/DanieleSK-tech/quiz-planB.git)
cd quiz-planB
```

Install dependencies:

```bash
npm install
```

Create the environment configuration file:

```bash
cp .env.example .env
```

Then add your LNbits configuration to `.env`:

```env
LNBITS_URL=[https://lnbits-signet.planb.academy](https://lnbits-signet.planb.academy)
ADMIN_KEY=your_lnbits_admin_key
BIGPOT_WALLET_ID=your_reward_wallet_id
BIGPOT_INVOICE_KEY=your_reward_wallet_invoice_key
```

Start the application:

```bash
npm server.js
```

Open the application in your browser:

```text
http://localhost:3000
```

---

## Security Notes

- Never commit `.env` files to GitHub.
- Never publish LNbits API keys, wallet IDs, invoices, or private credentials.
- Ensure `.env`, `node_modules/`, SQLite database files, and logs are included in `.gitignore`.
- Use a dedicated LNbits wallet with a limited balance for testing.
- This project is an educational prototype and should not be used in production without a security review, rate limiting, input validation, and stronger identity controls.

A recommended `.gitignore` configuration is:

```gitignore
node_modules/
.env
*.db
*.sqlite
*.sqlite3
npm-debug.log*
.DS_Store
```

---

## Educational Context

This project was developed as a milestone for the **Plan ₿ Developer Track** at the Plan ₿ Bitcoin Business School in Lugano.

It explores how Bitcoin education can be combined with Lightning Network micropayments to create an engaging learning experience. Quiz questions are sourced from the Plan ₿ Network educational material.

---

## Future Improvements

- Add automated tests for quiz logic and payment flows
- Add user authentication and stronger anti-abuse controls
- Add configurable rewards and quiz categories
- Add a Docker setup for easier local deployment
- Add a Lightning Address withdrawal flow
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
