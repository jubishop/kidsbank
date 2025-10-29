const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/repository');

/**
 * Parse currency string to number
 * Handles formats like "$7,00" or "$253,89"
 * Bankaroo uses comma as decimal separator (European format)
 */
function parseCurrency(str) {
  if (!str || typeof str !== 'string' || str.trim() === '') return null;

  // Remove $ and quotes, then replace comma with period for decimal
  let cleaned = str.replace(/["\$]/g, '').trim();

  // Replace comma with period (Bankaroo uses European decimal format)
  cleaned = cleaned.replace(',', '.');

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Parse CSV file using proper CSV parser
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Find the header row (starts with "Date,Description")
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('Date,Description')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error('Could not find CSV header row');
  }

  // Get the CSV data starting from header
  const csvData = lines.slice(headerIndex).join('\n');

  // Parse using csv-parse library
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    trim: true
  });

  const transactions = [];

  for (const record of records) {
    const date = record.Date;
    const description = record.Description || '';
    const deposit = record.Deposits || '';
    const withdrawal = record.Withdrawal || '';

    if (!date) continue;

    const depositAmount = parseCurrency(deposit);
    const withdrawalAmount = parseCurrency(withdrawal);

    if (depositAmount !== null || withdrawalAmount !== null) {
      transactions.push({
        date,
        description,
        depositAmount,
        withdrawalAmount
      });
    }
  }

  return transactions;
}

/**
 * Get account by name
 */
async function getAccountByName(name) {
  const accounts = await db.getAllAccounts();
  return accounts.find(acc => acc.name.toLowerCase() === name.toLowerCase());
}

/**
 * Clear existing transactions for an account
 */
async function clearAccountTransactions(accountId) {
  return new Promise((resolve, reject) => {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, '../../kidsbank.db');
    const dbConnection = new sqlite3.Database(dbPath);

    dbConnection.run('DELETE FROM transactions WHERE account_id = ?', [accountId], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
      dbConnection.close();
    });
  });
}

/**
 * Import transactions for an account
 */
async function importTransactions(accountId, transactions) {
  let balance = 0;
  let importedCount = 0;

  // Sort transactions by date
  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  for (const tx of transactions) {
    try {
      // Determine transaction type and amount
      let type;
      let amount;

      if (tx.depositAmount !== null) {
        amount = tx.depositAmount;
        if (tx.description.toLowerCase().includes('interest')) {
          type = 'interest';
        } else {
          type = 'deposit';
        }
        balance += amount;
      } else if (tx.withdrawalAmount !== null) {
        amount = tx.withdrawalAmount;
        type = 'withdrawal';
        balance -= amount;
      } else {
        continue;
      }

      balance = Math.round(balance * 100) / 100; // Round to 2 decimals

      // Create transaction with description
      const transaction = {
        id: uuidv4(),
        accountId: accountId,
        type: type,
        amount: Math.round(amount * 100) / 100,
        balanceAfter: balance,
        timestamp: new Date(tx.date).toISOString(),
        description: tx.description || null
      };

      await db.createTransaction(transaction);
      importedCount++;

    } catch (error) {
      console.error(`Error importing transaction: ${error.message}`, tx);
    }
  }

  // Update account balance
  const account = await db.getAccountById(accountId);
  account.balance = balance;
  await db.updateAccount(account);

  return { importedCount, finalBalance: balance };
}

/**
 * Main import function
 */
async function importFromCSV(childName) {
  try {
    const csvPath = path.join(__dirname, '../../imports', `${childName.toLowerCase()}.csv`);

    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found: ${csvPath}`);
      return;
    }

    console.log(`Importing data for ${childName}...`);

    // Get account
    const account = await getAccountByName(childName);
    if (!account) {
      console.error(`Account not found for ${childName}`);
      return;
    }

    // Clear existing transactions
    console.log(`Clearing existing transactions for ${childName}...`);
    await clearAccountTransactions(account.id);

    // Parse CSV
    console.log(`Parsing CSV file: ${csvPath}`);
    const transactions = parseCSV(csvPath);
    console.log(`Found ${transactions.length} transactions`);

    // Import transactions
    const result = await importTransactions(account.id, transactions);

    console.log(`✅ Import complete for ${childName}:`);
    console.log(`   - Imported ${result.importedCount} transactions`);
    console.log(`   - Final balance: $${result.finalBalance.toFixed(2)}`);

  } catch (error) {
    console.error(`Error importing ${childName}:`, error);
  }
}

/**
 * Import all CSV files in imports directory
 */
async function importAll() {
  await db.initializeDatabase();

  const importsDir = path.join(__dirname, '../../imports');
  const files = fs.readdirSync(importsDir).filter(f => f.endsWith('.csv'));

  console.log(`Found ${files.length} CSV files to import\n`);

  for (const file of files) {
    const childName = path.basename(file, '.csv');
    await importFromCSV(childName);
    console.log('');
  }

  console.log('All imports complete!');
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  importAll();
}

module.exports = { importFromCSV, importAll };
