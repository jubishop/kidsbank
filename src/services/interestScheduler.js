const accountService = require('./accountService');
const transactionService = require('./transactionService');

/**
 * Get the Monday of the current week (at 10am)
 * @returns {Date} The Monday date at 10am
 */
function getCurrentMonday() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = day === 0 ? -6 : 1 - day; // Calculate days to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(10, 0, 0, 0); // 10am on Monday
  return monday;
}

/**
 * Get all Mondays between a start date and now (inclusive of current week if it's Monday or later)
 * @param {Date|null} startDate - The start date (last interest date)
 * @returns {Date[]} Array of Monday dates at 10am
 */
function getMissedMondays(startDate) {
  const mondays = [];
  const currentMonday = getCurrentMonday();

  // If no start date, return current Monday if we haven't passed it yet
  if (!startDate) {
    // Only return current Monday if today is Monday or later in the week
    const now = new Date();
    if (now >= currentMonday) {
      mondays.push(currentMonday);
    }
    return mondays;
  }

  // Start from the Monday after the last interest date
  const startMonday = new Date(startDate);
  const dayOfWeek = startMonday.getDay();
  const daysUntilNextMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
  startMonday.setDate(startMonday.getDate() + daysUntilNextMonday);
  startMonday.setHours(10, 0, 0, 0);

  // Generate all Mondays from start to current
  let currentDate = new Date(startMonday);
  while (currentDate <= currentMonday) {
    mondays.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 7); // Next Monday
  }

  return mondays;
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
 * Check and apply interest for all accounts (retroactively if needed)
 * This will apply interest for ALL missed Mondays since the last interest date
 */
async function checkAndApplyInterest() {
  try {
    const accounts = await accountService.getAllAccounts();

    for (const account of accounts) {
      // Skip if no interest rate or zero balance
      if (account.interestRate === 0 || account.balance === 0) {
        continue;
      }

      // Get all Mondays where interest is owed
      const lastInterestDate = account.lastInterestDate ? new Date(account.lastInterestDate) : null;
      const missedMondays = getMissedMondays(lastInterestDate);

      if (missedMondays.length === 0) {
        continue;
      }

      console.log(`Processing ${missedMondays.length} missed interest payment(s) for account: ${account.name}`);

      // Apply interest for each missed Monday
      for (const monday of missedMondays) {
        try {
          const result = await transactionService.applyInterest(account.id, monday);
          if (result) {
            console.log(`  - Interest applied for ${monday.toISOString().split('T')[0]}: $${result.amount.toFixed(2)}`);
          }
        } catch (error) {
          console.error(`  - Failed to apply interest for ${monday.toISOString().split('T')[0]}:`, error.message);
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
  getMissedMondays,
  isMonday,
  getCurrentMonday,
  startScheduler
};
