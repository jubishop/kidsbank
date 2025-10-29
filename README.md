# 💰 Kids Finance Tracker

A web application designed to help children learn financial responsibility by managing their own accounts, tracking deposits and withdrawals, and earning weekly interest on their savings.

## Features

- 👶 **Child Accounts**: Parents can create separate accounts for each child
- 💵 **Deposits & Withdrawals**: Children can record money received and spent
- 📈 **Automatic Interest**: Earn weekly interest every Monday
- 📊 **Transaction History**: View complete history of all financial activities
- ⚙️ **Configurable Rates**: Parents can set custom interest rates per account
- 🎨 **Child-Friendly UI**: Simple, colorful, and easy to use interface

## Quick Start

### Installation

```bash
# Install dependencies
npm install
```

### Running the Application

```bash
# Start the server
npm start
```

Visit `http://localhost:3000` in your browser.

### Development Mode

```bash
# Auto-restart on file changes
npm run dev
```

## How It Works

### For Parents

1. **Create Accounts**: Set up an account for each child with their name
2. **Set Interest Rates**: Configure weekly interest rates (e.g., 5% per week)
3. **Monitor Progress**: View all accounts and their balances from the home page

### For Children

1. **Make Deposits**: Record money you receive (allowance, gifts, chores)
2. **Make Withdrawals**: Record money you spend
3. **Watch It Grow**: Earn interest automatically every Monday
4. **Track History**: See all your transactions and how your balance changes

## User Guide

### Creating an Account

1. Go to the home page
2. Click "Create New Account"
3. Enter the child's name
4. The account starts with $0.00 and 0% interest

### Making Transactions

**Deposits:**
- Go to the account page
- Enter the amount in the "Deposit Money" section
- Click "Deposit"
- Your new balance will be displayed

**Withdrawals:**
- Go to the account page
- Enter the amount in the "Withdraw Money" section
- Click "Withdraw"
- If you don't have enough money, you'll see an error message

### Setting Interest Rates

1. Go to the account page
2. Click "Settings"
3. Enter the weekly interest percentage (e.g., 5 for 5%)
4. Click "Update Interest Rate"

Interest is calculated as: **Balance × Interest Rate**

For example, with $100 and a 5% rate, you'll earn $5 every Monday!

## Technical Details

- **Framework**: Node.js with Express
- **Database**: SQLite (local file-based)
- **Templating**: EJS
- **Styling**: Custom CSS with responsive design

For detailed technical documentation, see [AGENTS.md](./AGENTS.md)

## Architecture

```
Express Routes → Service Layer → Database Repository
     ↓              ↓                    ↓
  Controllers   Business Logic      SQLite DB
```

## Project Structure

```
kidsbank/
├── src/
│   ├── server.js              # Application entry point
│   ├── routes/                # HTTP route handlers
│   ├── services/              # Business logic
│   ├── database/              # Database operations
│   └── views/                 # EJS templates
├── public/
│   └── css/                   # Stylesheets
├── spec/                      # Requirements & design docs
└── package.json
```

## Interest Scheduler

The system automatically checks every hour if it's Monday. When it is:
- Interest is calculated for each account with a balance > 0
- Interest is added to the balance
- An interest transaction is recorded
- Interest is only applied once per Monday (no duplicates)

## Data Storage

All data is stored in a local SQLite database file (`kidsbank.db`) created automatically on first run. The database contains:

- **Accounts table**: Child accounts with balances and interest rates
- **Transactions table**: Complete history of all financial activities

## Requirements Met

All requirements from the specification have been implemented:

✅ **Requirement 1**: Create and manage child accounts
✅ **Requirement 2**: Record deposits
✅ **Requirement 3**: Record withdrawals with balance validation
✅ **Requirement 4**: Configure interest rates per account
✅ **Requirement 5**: Automatic weekly interest on Mondays
✅ **Requirement 6**: View complete transaction history
✅ **Requirement 7**: Display current balance with proper formatting

## Browser Support

This application works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

**Port already in use?**
```bash
# Change the port in src/server.js or set environment variable
PORT=3001 npm start
```

**Database issues?**
```bash
# Delete and recreate the database
rm kidsbank.db
npm start
```

**Missing dependencies?**
```bash
# Reinstall all dependencies
rm -rf node_modules
npm install
```

## Educational Value

This application teaches children:
- **Money Management**: Tracking income and expenses
- **Delayed Gratification**: Saving money for larger purchases
- **Interest Concepts**: Understanding how savings grow over time
- **Financial Planning**: Making decisions about spending vs. saving
- **Responsibility**: Managing their own account

## Security Note

This application is designed for single-family household use and does not include authentication. It assumes a trusted environment where:
- Parents supervise account creation and settings
- Children use their own accounts honestly
- The application runs locally on a family computer

**Not suitable for production deployment or multi-family use without adding authentication and security features.**

## Future Enhancements

Potential features for future versions:
- Savings goals and progress tracking
- Recurring allowances
- Parent approval for large withdrawals
- Charts and visualizations
- Export to CSV
- Mobile app version

## License

This project is provided as-is for educational purposes.

## Support

For detailed technical documentation and troubleshooting, see [AGENTS.md](./AGENTS.md)
