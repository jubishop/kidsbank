const { v4: uuidv4 } = require('uuid');
const db = require('../database/repository');

/**
 * Create a new account for a child
 * @param {string} childName - Name of the child
 * @returns {Promise<Object>} The created account
 */
async function createAccount(childName) {
  if (!childName || typeof childName !== 'string' || childName.trim() === '') {
    throw new Error('Child name is required and must be a non-empty string');
  }

  const account = {
    id: uuidv4(),
    name: childName.trim(),
    balance: 0,
    interestRate: 0, // Default to 0% interest
    createdAt: new Date().toISOString(),
    lastInterestDate: null
  };

  return await db.createAccount(account);
}

/**
 * Get account by ID
 * @param {string} accountId - The account ID
 * @returns {Promise<Object|null>} The account or null if not found
 */
async function getAccount(accountId) {
  if (!accountId) {
    throw new Error('Account ID is required');
  }

  return await db.getAccountById(accountId);
}

/**
 * Get all accounts
 * @returns {Promise<Array>} Array of all accounts
 */
async function getAllAccounts() {
  return await db.getAllAccounts();
}

/**
 * Update interest rate for an account
 * @param {string} accountId - The account ID
 * @param {number} rate - The interest rate as a decimal (e.g., 0.05 for 5%)
 * @returns {Promise<void>}
 */
async function updateInterestRate(accountId, rate) {
  if (!accountId) {
    throw new Error('Account ID is required');
  }

  if (typeof rate !== 'number' || rate < 0) {
    throw new Error('Interest rate must be a non-negative number');
  }

  const account = await db.getAccountById(accountId);
  if (!account) {
    throw new Error('Account not found');
  }

  account.interestRate = rate;
  await db.updateAccount(account);
}

/**
 * Update account balance
 * @param {string} accountId - The account ID
 * @param {number} newBalance - The new balance
 * @returns {Promise<void>}
 */
async function updateBalance(accountId, newBalance) {
  if (!accountId) {
    throw new Error('Account ID is required');
  }

  if (typeof newBalance !== 'number' || newBalance < 0) {
    throw new Error('Balance must be a non-negative number');
  }

  const account = await db.getAccountById(accountId);
  if (!account) {
    throw new Error('Account not found');
  }

  account.balance = Math.round(newBalance * 100) / 100; // Round to 2 decimal places
  await db.updateAccount(account);
}

/**
 * Update last interest date for an account
 * @param {string} accountId - The account ID
 * @param {string} date - ISO date string
 * @returns {Promise<void>}
 */
async function updateLastInterestDate(accountId, date) {
  if (!accountId) {
    throw new Error('Account ID is required');
  }

  const account = await db.getAccountById(accountId);
  if (!account) {
    throw new Error('Account not found');
  }

  account.lastInterestDate = date;
  await db.updateAccount(account);
}

module.exports = {
  createAccount,
  getAccount,
  getAllAccounts,
  updateInterestRate,
  updateBalance,
  updateLastInterestDate
};
