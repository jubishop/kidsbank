const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '../../kidsbank.db');
const db = new sqlite3.Database(dbPath);

/**
 * Initialize database schema
 */
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        balance REAL NOT NULL DEFAULT 0,
        interest_rate REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        last_interest_date TEXT
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('deposit', 'withdrawal', 'interest')),
        amount REAL NOT NULL,
        balance_after REAL NOT NULL,
        timestamp TEXT NOT NULL,
        description TEXT,
        FOREIGN KEY (account_id) REFERENCES accounts(id)
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_account_id
        ON transactions(account_id);

      CREATE INDEX IF NOT EXISTS idx_transactions_timestamp
        ON transactions(timestamp);
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// ===== ACCOUNT OPERATIONS =====

/**
 * Create a new account
 */
function createAccount(account) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO accounts (id, name, balance, interest_rate, created_at, last_interest_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      account.id,
      account.name,
      account.balance,
      account.interestRate,
      account.createdAt,
      account.lastInterestDate
    ];

    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(account);
      }
    });
  });
}

/**
 * Get account by ID
 */
function getAccountById(id) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM accounts WHERE id = ?';

    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        resolve(null);
      } else {
        resolve({
          id: row.id,
          name: row.name,
          balance: row.balance,
          interestRate: row.interest_rate,
          createdAt: row.created_at,
          lastInterestDate: row.last_interest_date
        });
      }
    });
  });
}

/**
 * Get all accounts
 */
function getAllAccounts() {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM accounts ORDER BY created_at DESC';

    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const accounts = rows.map(row => ({
          id: row.id,
          name: row.name,
          balance: row.balance,
          interestRate: row.interest_rate,
          createdAt: row.created_at,
          lastInterestDate: row.last_interest_date
        }));
        resolve(accounts);
      }
    });
  });
}

/**
 * Update account
 */
function updateAccount(account) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE accounts
      SET name = ?, balance = ?, interest_rate = ?, last_interest_date = ?
      WHERE id = ?
    `;
    const params = [
      account.name,
      account.balance,
      account.interestRate,
      account.lastInterestDate,
      account.id
    ];

    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// ===== TRANSACTION OPERATIONS =====

/**
 * Create a new transaction
 */
function createTransaction(transaction) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO transactions (id, account_id, type, amount, balance_after, timestamp, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      transaction.id,
      transaction.accountId,
      transaction.type,
      transaction.amount,
      transaction.balanceAfter,
      transaction.timestamp,
      transaction.description || null
    ];

    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(transaction);
      }
    });
  });
}

/**
 * Get transactions by account ID
 */
function getTransactionsByAccountId(accountId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM transactions
      WHERE account_id = ?
      ORDER BY timestamp DESC
    `;

    db.all(sql, [accountId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const transactions = rows.map(row => ({
          id: row.id,
          accountId: row.account_id,
          type: row.type,
          amount: row.amount,
          balanceAfter: row.balance_after,
          timestamp: row.timestamp,
          description: row.description
        }));
        resolve(transactions);
      }
    });
  });
}

/**
 * Get last interest transaction for an account
 */
function getLastInterestTransaction(accountId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM transactions
      WHERE account_id = ? AND type = 'interest'
      ORDER BY timestamp DESC
      LIMIT 1
    `;

    db.get(sql, [accountId], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        resolve(null);
      } else {
        resolve({
          id: row.id,
          accountId: row.account_id,
          type: row.type,
          amount: row.amount,
          balanceAfter: row.balance_after,
          timestamp: row.timestamp,
          description: row.description
        });
      }
    });
  });
}

module.exports = {
  initializeDatabase,
  createAccount,
  getAccountById,
  getAllAccounts,
  updateAccount,
  createTransaction,
  getTransactionsByAccountId,
  getLastInterestTransaction
};
