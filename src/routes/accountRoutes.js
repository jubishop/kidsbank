const express = require('express');
const router = express.Router();
const accountService = require('../services/accountService');
const transactionService = require('../services/transactionService');

/**
 * GET / - Home page showing all child accounts
 */
router.get('/', async (req, res) => {
  try {
    const accounts = await accountService.getAllAccounts();
    res.render('index', {
      accounts,
      error: req.query.error,
      success: req.query.success
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).render('error', { message: 'Failed to load accounts' });
  }
});

/**
 * GET /accounts/new - Form to create new child account
 */
router.get('/accounts/new', (req, res) => {
  res.render('account-new', {
    error: req.query.error
  });
});

/**
 * POST /accounts - Handle child account creation
 */
router.post('/accounts', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.redirect('/accounts/new?error=' + encodeURIComponent('Please enter a child name'));
    }

    await accountService.createAccount(name);
    res.redirect('/?success=' + encodeURIComponent(`Account created for ${name}`));
  } catch (error) {
    console.error('Error creating account:', error);
    res.redirect('/accounts/new?error=' + encodeURIComponent(error.message));
  }
});

/**
 * GET /accounts/:id - Child account detail page with transaction history
 */
router.get('/accounts/:id', async (req, res) => {
  try {
    const accountId = req.params.id;
    const account = await accountService.getAccount(accountId);

    if (!account) {
      return res.status(404).render('error', { message: 'Account not found' });
    }

    const transactions = await transactionService.getTransactionHistory(accountId);

    res.render('account-detail', {
      account,
      transactions,
      error: req.query.error,
      success: req.query.success
    });
  } catch (error) {
    console.error('Error fetching account details:', error);
    res.status(500).render('error', { message: 'Failed to load account details' });
  }
});

/**
 * POST /accounts/:id/deposit - Handle deposit form submission
 */
router.post('/accounts/:id/deposit', async (req, res) => {
  try {
    const accountId = req.params.id;
    const amount = parseFloat(req.body.amount);

    if (isNaN(amount) || amount <= 0) {
      return res.redirect(`/accounts/${accountId}?error=` + encodeURIComponent('Please enter a valid positive amount'));
    }

    const transaction = await transactionService.deposit(accountId, amount);
    res.redirect(`/accounts/${accountId}?success=` + encodeURIComponent(`Deposited $${transaction.amount.toFixed(2)}. New balance: $${transaction.balanceAfter.toFixed(2)}`));
  } catch (error) {
    console.error('Error processing deposit:', error);
    res.redirect(`/accounts/${req.params.id}?error=` + encodeURIComponent(error.message));
  }
});

/**
 * POST /accounts/:id/withdraw - Handle withdrawal form submission
 */
router.post('/accounts/:id/withdraw', async (req, res) => {
  try {
    const accountId = req.params.id;
    const amount = parseFloat(req.body.amount);

    if (isNaN(amount) || amount <= 0) {
      return res.redirect(`/accounts/${accountId}?error=` + encodeURIComponent('Please enter a valid positive amount'));
    }

    const transaction = await transactionService.withdraw(accountId, amount);
    res.redirect(`/accounts/${accountId}?success=` + encodeURIComponent(`Withdrew $${transaction.amount.toFixed(2)}. New balance: $${transaction.balanceAfter.toFixed(2)}`));
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.redirect(`/accounts/${req.params.id}?error=` + encodeURIComponent(error.message));
  }
});

/**
 * GET /accounts/:id/settings - Child account settings page
 */
router.get('/accounts/:id/settings', async (req, res) => {
  try {
    const accountId = req.params.id;
    const account = await accountService.getAccount(accountId);

    if (!account) {
      return res.status(404).render('error', { message: 'Account not found' });
    }

    res.render('account-settings', {
      account,
      error: req.query.error,
      success: req.query.success
    });
  } catch (error) {
    console.error('Error fetching account settings:', error);
    res.status(500).render('error', { message: 'Failed to load account settings' });
  }
});

/**
 * POST /accounts/:id/interest-rate - Update interest rate for child account
 */
router.post('/accounts/:id/interest-rate', async (req, res) => {
  try {
    const accountId = req.params.id;
    const ratePercent = parseFloat(req.body.rate);

    if (isNaN(ratePercent) || ratePercent < 0) {
      return res.redirect(`/accounts/${accountId}/settings?error=` + encodeURIComponent('Please enter a valid non-negative percentage'));
    }

    // Convert percentage to decimal (e.g., 5% -> 0.05)
    const rateDecimal = ratePercent / 100;

    await accountService.updateInterestRate(accountId, rateDecimal);
    res.redirect(`/accounts/${accountId}/settings?success=` + encodeURIComponent(`Interest rate updated to ${ratePercent.toFixed(2)}%`));
  } catch (error) {
    console.error('Error updating interest rate:', error);
    res.redirect(`/accounts/${req.params.id}/settings?error=` + encodeURIComponent(error.message));
  }
});

module.exports = router;
