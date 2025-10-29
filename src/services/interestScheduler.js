const accountService = require('./accountService');
const transactionService = require('./transactionService');

/**
 * Get the Monday of the current week (start of day)
 * @returns {Date} The Monday date
 */
function getCurrentMonday() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = day === 0 ? -6 : 1 - day; // Calculate days to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0); // Start of day
  return monday;
}

/**
 * Check if today is Monday
 * @returns {boolean}
 */
function isMonday() {
  const now = new Date();
  return now.getDay() === 1; // 1 = Monday
}

/**
 * Parse ISO date string and get date only (ignoring time)
 * @param {string} isoString - ISO date string
 * @returns {Date|null}
 */
function getDateOnly(isoString) {
  if (!isoString) return null;
  const date = new Date(isoString);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Check if interest should be applied for an account
 * @param {Object} account - The account object
 * @returns {boolean}
 */
function shouldApplyInterest(account) {
  // Must be Monday
  if (!isMonday()) {
    return false;
  }

  // Skip if no interest rate
  if (account.interestRate === 0) {
    return false;
  }

  // Skip if no balance
  if (account.balance === 0) {
    return false;
  }

  // Check if interest was already applied this Monday
  const currentMonday = getCurrentMonday();
  const lastInterestDate = getDateOnly(account.lastInterestDate);

  // Apply interest if:
  // 1. Never applied before (lastInterestDate is null)
  // 2. Last application was before this Monday
  if (!lastInterestDate || lastInterestDate < currentMonday) {
    return true;
  }

  return false;
}

/**
 * Check and apply interest for all accounts
 */
async function checkAndApplyInterest() {
  try {
    const accounts = await accountService.getAllAccounts();

    for (const account of accounts) {
      if (shouldApplyInterest(account)) {
        try {
          await transactionService.applyInterest(account.id);
          console.log(`Interest applied to account: ${account.name}`);
        } catch (error) {
          console.error(`Failed to apply interest to account ${account.name}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Failed to check and apply interest:', error);
  }
}

/**
 * Start the interest scheduler
 * Checks every hour if interest needs to be applied
 */
function startScheduler() {
  // Check immediately on startup
  checkAndApplyInterest();

  // Then check every hour
  setInterval(() => {
    checkAndApplyInterest();
  }, 60 * 60 * 1000); // 1 hour in milliseconds

  console.log('Interest scheduler initialized (checks every hour)');
}

module.exports = {
  checkAndApplyInterest,
  shouldApplyInterest,
  isMonday,
  getCurrentMonday,
  startScheduler
};
