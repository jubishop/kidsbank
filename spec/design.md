# Kids Finance Tracker - Design Document

## Overview

The Kids Finance Tracker is a simple application that helps children learn financial responsibility by managing their own accounts. The application is designed for use by a single family, where the parent runs the application and creates individual accounts for each child. 

**User Model:**
- The parent creates and manages accounts for each child (e.g., "Emma", "Jake", "Alex")
- Each child uses the application to record their own deposits and withdrawals
- The parent configures interest rates for each child's account through the settings
- The system automatically applies interest every Monday to teach kids about savings growth

The design focuses on simplicity and ease of use for children while providing parents control over interest rates. No authentication is required as the application is intended for single-family household use.

## Architecture

The application follows a traditional MVC architecture built with Node.js and Express:

- **View Layer**: Server-side rendered HTML pages using a templating engine (EJS or Handlebars)
- **Controller Layer**: Express route handlers that process requests and render views
- **Business Logic Layer**: Transaction processing, interest calculation, and validation
- **Data Layer**: SQLite database for account and transaction persistence

The system will be implemented as a server-side rendered web application where Express handles routing, renders HTML pages, and manages all business logic with SQLite for data storage.

## Components and Interfaces

### Express Routes and Views

**Page Routes:**
- `GET /` - Home page showing all child accounts
- `GET /accounts/new` - Form to create new child account (parent action)
- `POST /accounts` - Handle child account creation (parent action)
- `GET /accounts/:id` - Child account detail page with transaction history
- `POST /accounts/:id/deposit` - Handle deposit form submission for child account
- `POST /accounts/:id/withdraw` - Handle withdrawal form submission for child account
- `GET /accounts/:id/settings` - Child account settings page (parent action)
- `POST /accounts/:id/interest-rate` - Update interest rate for child account (parent action)

**Views (Templates):**
- `index.ejs` - Home page with list of all child accounts
- `account-new.ejs` - Create child account form
- `account-detail.ejs` - Child account detail with transactions and action forms
- `account-settings.ejs` - Interest rate configuration for child account

### Account Service

Responsible for creating and managing child accounts.

**Interface:**
```typescript
interface AccountService {
  createAccount(childName: string): Promise<Account>  // Create account for a child
  getAccount(accountId: string): Promise<Account | null>  // Get specific child account
  getAllAccounts(): Promise<Account[]>  // Get all child accounts
  updateInterestRate(accountId: string, rate: number): Promise<void>  // Update interest rate for child account
  updateBalance(accountId: string, newBalance: number): Promise<void>  // Update child account balance
}
```

### Transaction Service

Handles deposits, withdrawals, and interest calculations.

**Interface:**
```typescript
interface TransactionService {
  deposit(accountId: string, amount: number): Promise<Transaction>
  withdraw(accountId: string, amount: number): Promise<Transaction>
  applyInterest(accountId: string): Promise<Transaction>
  getTransactionHistory(accountId: string): Promise<Transaction[]>
}
```

### Interest Scheduler

Manages automatic interest application every Monday.

**Interface:**
```typescript
interface InterestScheduler {
  checkAndApplyInterest(): Promise<void>
  getLastInterestDate(accountId: string): Promise<Date | null>
  shouldApplyInterest(accountId: string): Promise<boolean>
  startScheduler(): void
}
```

### Database Repository

Handles all SQLite database operations.

**Interface:**
```typescript
interface DatabaseRepository {
  initializeDatabase(): Promise<void>
  // Account operations
  createAccount(account: Account): Promise<Account>
  getAccountById(id: string): Promise<Account | null>
  getAllAccounts(): Promise<Account[]>
  updateAccount(account: Account): Promise<void>
  // Transaction operations
  createTransaction(transaction: Transaction): Promise<Transaction>
  getTransactionsByAccountId(accountId: string): Promise<Transaction[]>
  getLastInterestTransaction(accountId: string): Promise<Transaction | null>
}
```

## Data Models

### Account

```typescript
interface Account {
  id: string
  name: string
  balance: number
  interestRate: number  // stored as decimal (e.g., 0.05 for 5%)
  createdAt: Date
  lastInterestDate: Date | null
}
```

### Transaction

```typescript
interface Transaction {
  id: string
  accountId: string
  type: 'deposit' | 'withdrawal' | 'interest'
  amount: number
  balanceAfter: number
  timestamp: Date
  description?: string
}
```

## Key Design Decisions

### Interest Calculation

Interest is calculated using simple interest on the current balance:
```
interestAmount = currentBalance * interestRate
```

The system tracks the last interest application date per account to ensure interest is only applied once per Monday, even if the application is accessed multiple times.

### Data Persistence

The application will use SQLite database for reliable data storage:

**Database Schema:**

```sql
-- Accounts table
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  balance REAL NOT NULL DEFAULT 0,
  interest_rate REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  last_interest_date TEXT
);

-- Transactions table
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

-- Index for faster transaction queries
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
```

SQLite provides ACID compliance, ensuring data integrity while remaining lightweight and requiring no separate database server.

### Transaction Validation

All transactions go through validation:
- Amounts must be positive numbers
- Withdrawals cannot exceed current balance
- All monetary values are rounded to 2 decimal places

### Interest Application Logic

The system checks for Monday interest application:
1. On application startup or when viewing accounts
2. Compare current date with last interest date for each account
3. If current day is Monday AND last interest date is not the current Monday, apply interest
4. Update last interest date to prevent duplicate applications

## Error Handling

### Validation Errors

- Invalid amounts (negative, zero, non-numeric): Return error message without modifying data
- Insufficient funds for withdrawal: Return error message with current balance
- Invalid account ID: Return error message indicating account not found

### Data Persistence Errors

- Database connection failures: Return 500 error with appropriate message
- Constraint violations: Return 400 error with validation details
- Transaction rollback on errors: SQLite transactions ensure atomicity

### Recovery Strategy

- All operations use SQLite transactions: either fully complete or fully roll back
- Transaction history provides audit trail for debugging
- SQLite database file can be easily backed up
- Database initialization creates schema if not exists on startup

## Testing Strategy

### Unit Tests

- Account creation and management
- Transaction validation logic
- Interest calculation accuracy
- Date comparison for Monday detection

### Integration Tests

- Complete deposit/withdrawal flows
- Interest application across multiple accounts
- Data persistence and retrieval
- Error handling scenarios

### User Acceptance Testing

- Parent creates accounts for multiple children
- Children perform deposits and withdrawals
- Verify interest applies correctly on Mondays
- Verify transaction history accuracy
- Test edge cases (zero balance, exact withdrawal of full balance)

## User Interface Considerations

### Main Views

1. **Home Page (Account List)**: Shows all child accounts with current balances and links to create new accounts
2. **Account Detail Page**: Shows single account with current balance, transaction history, and forms for deposits/withdrawals
3. **Account Settings Page**: Configure interest rate for the account
4. **Create Account Page**: Simple form to add a new child account

### User Experience

- Server-side form validation with clear error messages
- Success messages after transactions using flash messages or query parameters
- Simple, clean HTML/CSS design suitable for children
- Large, easy-to-click buttons
- Color coding for transaction types (green for deposits/interest, red for withdrawals)
- Responsive design for mobile and desktop use
- Form submissions use POST-Redirect-GET pattern to prevent duplicate submissions

## Future Enhancements

Potential features for future versions:
- Multiple interest rate tiers based on balance
- Goal setting and progress tracking
- Parent approval workflow for large withdrawals
- Charts and visualizations of balance over time
- Export transaction history to CSV
- Multi-currency support
