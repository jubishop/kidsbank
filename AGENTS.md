# Kids Finance Tracker - Technical Documentation

## Overview

The Kids Finance Tracker is a web application designed to help children learn financial responsibility by managing their own accounts. Parents can create accounts for each child, and children can track deposits, withdrawals, and automatically earn weekly interest on their savings.

## Application Architecture

The application follows a traditional **MVC (Model-View-Controller)** architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│                  EJS Templates + CSS                     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Express Routes                         │
│              (Controller Layer)                          │
│  - Account creation and management                       │
│  - Transaction processing                                │
│  - Settings management                                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Service Layer                           │
│              (Business Logic)                            │
│  - AccountService: Account operations                    │
│  - TransactionService: Deposits/withdrawals/interest     │
│  - InterestScheduler: Automatic interest application     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Data Layer                              │
│           DatabaseRepository (SQLite)                    │
│  - Accounts table                                        │
│  - Transactions table                                    │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

- **Runtime**: Node.js
- **Web Framework**: Express.js
- **Templating Engine**: EJS (Embedded JavaScript)
- **Database**: SQLite 3
- **Styling**: Custom CSS with responsive design

## Directory Structure

```
kidsbank/
├── src/
│   ├── server.js                 # Main application entry point
│   ├── routes/
│   │   └── accountRoutes.js      # Express route handlers
│   ├── services/
│   │   ├── accountService.js     # Account business logic
│   │   ├── transactionService.js # Transaction processing
│   │   └── interestScheduler.js  # Interest automation
│   ├── database/
│   │   └── repository.js         # Database operations
│   └── views/
│       ├── index.ejs             # Home page
│       ├── account-new.ejs       # Create account form
│       ├── account-detail.ejs    # Account details & transactions
│       ├── account-settings.ejs  # Interest rate settings
│       └── error.ejs             # Error page
├── public/
│   └── css/
│       └── style.css             # Application styles
├── spec/                         # Requirements and design docs
├── package.json
└── kidsbank.db                   # SQLite database (created at runtime)
```

## Data Models

### Account

Represents a child's financial account.

```typescript
interface Account {
  id: string                    // UUID
  name: string                  // Child's name
  balance: number               // Current balance (2 decimal places)
  interestRate: number          // Weekly interest rate (decimal, e.g., 0.05 = 5%)
  createdAt: string            // ISO date string
  lastInterestDate: string | null  // ISO date string of last interest application
}
```

### Transaction

Represents a financial transaction (deposit, withdrawal, or interest).

```typescript
interface Transaction {
  id: string                    // UUID
  accountId: string             // Foreign key to accounts table
  type: 'deposit' | 'withdrawal' | 'interest'
  amount: number                // Transaction amount (2 decimal places)
  balanceAfter: number          // Account balance after transaction
  timestamp: string             // ISO date string
  description?: string          // Optional description (used for interest)
}
```

## Database Schema

### Accounts Table

```sql
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  balance REAL NOT NULL DEFAULT 0,
  interest_rate REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  last_interest_date TEXT
);
```

### Transactions Table

```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('deposit', 'withdrawal', 'interest')),
  amount REAL NOT NULL,
  balance_after REAL NOT NULL,
  timestamp TEXT NOT NULL,
  description TEXT,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Indexes for performance
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
```

## Key Components

### 1. AccountService (`src/services/accountService.js`)

Handles all account-related operations.

**Key Functions:**
- `createAccount(childName)` - Creates a new child account with zero balance and 0% interest
- `getAccount(accountId)` - Retrieves account by ID
- `getAllAccounts()` - Returns all accounts
- `updateInterestRate(accountId, rate)` - Updates the weekly interest rate
- `updateBalance(accountId, newBalance)` - Updates account balance (with validation)

### 2. TransactionService (`src/services/transactionService.js`)

Manages deposits, withdrawals, and interest calculations.

**Key Functions:**
- `deposit(accountId, amount)` - Processes a deposit and updates balance
- `withdraw(accountId, amount)` - Processes a withdrawal with insufficient funds check
- `applyInterest(accountId)` - Calculates and applies interest to account
- `getTransactionHistory(accountId)` - Returns all transactions for an account

**Validation Rules:**
- Amounts must be positive numbers
- Withdrawals cannot exceed current balance
- All monetary values rounded to 2 decimal places

### 3. InterestScheduler (`src/services/interestScheduler.js`)

Automatically applies interest every Monday.

**Key Functions:**
- `startScheduler()` - Starts the scheduler (checks every hour)
- `checkAndApplyInterest()` - Checks all accounts and applies interest if Monday
- `shouldApplyInterest(account)` - Determines if interest should be applied
- `isMonday()` - Checks if current day is Monday

**Interest Application Logic:**
1. Interest only applies on Mondays
2. Interest = Current Balance × Interest Rate
3. Tracks last application date to prevent duplicates
4. If interest rate or balance is zero, no interest is applied

### 4. DatabaseRepository (`src/database/repository.js`)

Handles all SQLite database operations with Promise-based API.

**Account Operations:**
- `initializeDatabase()` - Creates tables and indexes
- `createAccount(account)` - Inserts new account
- `getAccountById(id)` - Retrieves account by ID
- `getAllAccounts()` - Retrieves all accounts
- `updateAccount(account)` - Updates existing account

**Transaction Operations:**
- `createTransaction(transaction)` - Inserts new transaction
- `getTransactionsByAccountId(accountId)` - Gets all transactions for account
- `getLastInterestTransaction(accountId)` - Gets most recent interest transaction

## Application Routes

| Method | Route | Description | Access |
|--------|-------|-------------|--------|
| GET | `/` | Home page with all accounts | All users |
| GET | `/accounts/new` | Create account form | Parent |
| POST | `/accounts` | Handle account creation | Parent |
| GET | `/accounts/:id` | Account detail & transactions | Child/Parent |
| POST | `/accounts/:id/deposit` | Process deposit | Child |
| POST | `/accounts/:id/withdraw` | Process withdrawal | Child |
| GET | `/accounts/:id/settings` | Settings page | Parent |
| POST | `/accounts/:id/interest-rate` | Update interest rate | Parent |

## User Flows

### Parent: Creating a Child Account

1. Navigate to home page (`/`)
2. Click "Create New Account"
3. Enter child's name
4. Submit form
5. Account created with $0.00 balance and 0% interest
6. Redirected to home page

### Child: Making a Deposit

1. Navigate to their account page
2. Enter amount in deposit form
3. Submit deposit
4. Balance updated immediately
5. Transaction recorded in history

### Child: Making a Withdrawal

1. Navigate to their account page
2. Enter amount in withdrawal form
3. Submit withdrawal
4. If sufficient funds: balance updated, transaction recorded
5. If insufficient funds: error message displayed

### Parent: Setting Interest Rate

1. Navigate to child's account page
2. Click "Settings"
3. Enter weekly interest rate percentage (e.g., 5 for 5%)
4. Submit form
5. Interest rate saved (converted to decimal internally)

### System: Applying Interest (Automatic)

1. Scheduler checks every hour if it's Monday
2. For each account with balance > 0 and interest rate > 0:
   - Calculate interest: balance × rate
   - Add interest to balance
   - Create interest transaction
   - Update last interest date
3. Interest only applied once per Monday

## Error Handling

### Validation Errors

- **Invalid amounts**: "Amount must be greater than zero"
- **Insufficient funds**: "Insufficient funds. Current balance: $X.XX"
- **Empty name**: "Please enter a child name"
- **Invalid interest rate**: "Please enter a valid non-negative percentage"

### System Errors

- Database errors display generic error page
- All database operations wrapped in try-catch
- Failed transactions don't corrupt data (SQLite atomicity)

## Setup and Running

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

```bash
# Install dependencies
npm install
```

### Running the Application

```bash
# Start the server
npm start

# Development mode with auto-restart
npm run dev
```

The application will be available at `http://localhost:3000`

### Running with launchd (Always On)

A launchd plist is installed at `~/Library/LaunchAgents/com.kidsbank.server.plist` to keep the server running automatically in the background.

```bash
# Load and start the service
launchctl load ~/Library/LaunchAgents/com.kidsbank.server.plist

# Stop and unload the service
launchctl unload ~/Library/LaunchAgents/com.kidsbank.server.plist

# Check if running
launchctl list | grep kidsbank

# View logs
tail -f logs/kidsbank.log
tail -f logs/kidsbank-error.log
```

The service starts automatically on login and restarts if it crashes. Logs are written to the `logs/` directory in the project root.

### Database

- SQLite database file (`kidsbank.db`) is created automatically on first run
- Located in project root directory
- Contains accounts and transactions tables
- Can be backed up by copying the `.db` file

## Features Implemented

✅ Create child accounts with unique names
✅ Deposit money to accounts
✅ Withdraw money with balance validation
✅ Automatic weekly interest on Mondays
✅ Configurable interest rates per account
✅ Complete transaction history
✅ Real-time balance updates
✅ Responsive, child-friendly UI
✅ Error handling and validation
✅ Currency formatting (2 decimal places)

## Parent/Child Interaction Model

This application is designed for single-family use without authentication:

- **Parent Actions**: Create accounts, set interest rates, view all accounts
- **Child Actions**: Make deposits, make withdrawals, view their transaction history
- **System Actions**: Automatically apply interest every Monday

No login is required - trust is assumed within the family unit.

## Future Enhancements

Potential features for future versions:

- Multiple interest rate tiers based on balance
- Savings goals with progress tracking
- Parent approval workflow for large withdrawals
- Charts and visualizations of balance over time
- Export transaction history to CSV
- Multi-currency support
- Custom recurring allowances
- Notification system for low balances

## Testing

### Manual Testing Checklist

**Account Management:**
- [ ] Create new account with valid name
- [ ] Create account with empty name (should fail)
- [ ] View all accounts on home page
- [ ] View individual account details

**Transactions:**
- [ ] Make deposit with valid amount
- [ ] Make deposit with zero/negative amount (should fail)
- [ ] Make withdrawal with sufficient funds
- [ ] Make withdrawal exceeding balance (should fail)
- [ ] Verify balance updates correctly
- [ ] Verify transaction history shows all transactions

**Interest:**
- [ ] Set interest rate to 5%
- [ ] Verify interest rate saved correctly
- [ ] Test interest application on Monday (manual or by changing system date)
- [ ] Verify interest only applied once per Monday
- [ ] Verify interest calculation accuracy

**UI/UX:**
- [ ] Test responsive design on mobile
- [ ] Verify color coding (green for deposits/interest, red for withdrawals)
- [ ] Test error message display
- [ ] Test success message display

## Troubleshooting

### Server won't start
- Ensure port 3000 is available
- Check Node.js is installed: `node --version`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Database errors
- Delete `kidsbank.db` and restart (will create fresh database)
- Check file permissions on project directory

### Interest not applying
- Verify system date/time is correct
- Check server logs for scheduler status
- Ensure accounts have non-zero balance and interest rate

## Security Considerations

This application is designed for trusted, single-family household use:

- No authentication required
- No user roles or permissions
- All data stored locally in SQLite
- No external network access required
- Suitable for home use only, not production deployment

For production use, consider adding:
- User authentication and authorization
- HTTPS/TLS encryption
- Input sanitization (SQL injection protection)
- Rate limiting
- Session management
- Data encryption at rest

## Contributing

When extending this application, follow these guidelines:

1. **Data Integrity**: Always use transactions for multi-step operations
2. **Validation**: Validate all inputs at both service and route levels
3. **Rounding**: Use `Math.round(value * 100) / 100` for all currency values
4. **Error Handling**: Wrap database operations in try-catch blocks
5. **Consistency**: Follow existing naming conventions and code structure

## License

This project is provided as-is for educational purposes.
