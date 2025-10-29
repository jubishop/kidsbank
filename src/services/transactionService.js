const { v4: uuidv4 } = require('uuid');
const db = require('../database/repository');
const accountService = require('./accountService');

/**
 * Round to 2 decimal places
 */
function roundToTwoDecimals(num) {
  return Math.round(num * 100) / 100;
}

/**
 * Validate transaction amount
 */
function validateAmount(amount) {
  if (typeof amount !== 'number') {
    throw new Error('Amount must be a number');
  }
  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }
  if (!isFinite(amount)) {
    throw new Error('Amount must be a finite number');
  }
}

/**
 * Process a deposit transaction
 * @param {string} accountId - The account ID
 * @param {number} amount - The deposit amount
 * @returns {Promise<Object>} The created transaction
 */
async function deposit(accountId, amount) {
  validateAmount(amount);

  const account = await accountService.getAccount(accountId);
  if (!account) {
    throw new Error('Account not found');
  }

  // Calculate new balance
  const newBalance = roundToTwoDecimals(account.balance + amount);

  // Create transaction record
  const transaction = {
    id: uuidv4(),
    accountId: accountId,
    type: 'deposit',
    amount: roundToTwoDecimals(amount),
    balanceAfter: newBalance,
    timestamp: new Date().toISOString(),
    description: null
  };

  // Update account balance and create transaction
  await accountService.updateBalance(accountId, newBalance);
  await db.createTransaction(transaction);

  return transaction;
}

/**
 * Process a withdrawal transaction
 * @param {string} accountId - The account ID
 * @param {number} amount - The withdrawal amount
 * @returns {Promise<Object>} The created transaction
 */
async function withdraw(accountId, amount) {
  validateAmount(amount);

  const account = await accountService.getAccount(accountId);
  if (!account) {
    throw new Error('Account not found');
  }

  // Check for sufficient funds
  if (amount > account.balance) {
    throw new Error(`Insufficient funds. Current balance: $${account.balance.toFixed(2)}`);
  }

  // Calculate new balance
  const newBalance = roundToTwoDecimals(account.balance - amount);

  // Create transaction record
  const transaction = {
    id: uuidv4(),
    accountId: accountId,
    type: 'withdrawal',
    amount: roundToTwoDecimals(amount),
    balanceAfter: newBalance,
    timestamp: new Date().toISOString(),
    description: null
  };

  // Update account balance and create transaction
  await accountService.updateBalance(accountId, newBalance);
  await db.createTransaction(transaction);

  return transaction;
}

/**
 * Apply interest to an account
 * @param {string} accountId - The account ID
 * @returns {Promise<Object|null>} The created transaction or null if no interest to apply
 */
async function applyInterest(accountId) {
  const account = await accountService.getAccount(accountId);
  if (!account) {
    throw new Error('Account not found');
  }

  // Skip if interest rate is zero or balance is zero
  if (account.interestRate === 0 || account.balance === 0) {
    return null;
  }

  // Calculate interest amount
  const interestAmount = roundToTwoDecimals(account.balance * account.interestRate);

  // Skip if interest amount is zero (e.g., due to rounding)
  if (interestAmount === 0) {
    return null;
  }

  // Calculate new balance
  const newBalance = roundToTwoDecimals(account.balance + interestAmount);

  // Create transaction record
  const transaction = {
    id: uuidv4(),
    accountId: accountId,
    type: 'interest',
    amount: interestAmount,
    balanceAfter: newBalance,
    timestamp: new Date().toISOString(),
    description: `Weekly interest at ${(account.interestRate * 100).toFixed(2)}%`
  };

  // Update account balance and create transaction
  await accountService.updateBalance(accountId, newBalance);
  await db.createTransaction(transaction);

  // Update last interest date
  await accountService.updateLastInterestDate(accountId, new Date().toISOString());

  return transaction;
}

/**
 * Get transaction history for an account
 * @param {string} accountId - The account ID
 * @returns {Promise<Array>} Array of transactions sorted by timestamp (newest first)
 */
async function getTransactionHistory(accountId) {
  const account = await accountService.getAccount(accountId);
  if (!account) {
    throw new Error('Account not found');
  }

  return await db.getTransactionsByAccountId(accountId);
}

module.exports = {
  deposit,
  withdraw,
  applyInterest,
  getTransactionHistory
};
