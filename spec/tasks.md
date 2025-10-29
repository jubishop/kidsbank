# Implementation Plan

- [ ] 1. Set up project structure and dependencies
  - Initialize Node.js project with package.json
  - Install Express, SQLite3, EJS, and other required dependencies
  - Create directory structure (routes, services, views, database)
  - Set up basic Express server with EJS templating
  - _Requirements: All requirements depend on proper project setup_

- [ ] 2. Implement database layer and schema
  - [ ] 2.1 Create database initialization module
    - Write database connection and initialization code
    - Implement schema creation for accounts and transactions tables
    - Add database indexes for performance
    - _Requirements: 1.2, 1.3, 6.1_
  
  - [ ] 2.2 Implement database repository for accounts
    - Write functions to create, read, and update child accounts
    - Implement getAllAccounts and getAccountById methods
    - _Requirements: 1.1, 1.2, 1.4, 4.2_
  
  - [ ] 2.3 Implement database repository for transactions
    - Write functions to create and retrieve transactions
    - Implement getTransactionsByAccountId method
    - Implement getLastInterestTransaction method
    - _Requirements: 2.2, 3.2, 5.4, 6.1_

- [ ] 3. Implement account service layer
  - [ ] 3.1 Create account service with business logic
    - Implement createAccount function for child accounts
    - Implement getAccount and getAllAccounts functions
    - Implement updateInterestRate function
    - Implement updateBalance function with validation
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3_
  
  - [ ] 3.2 Write unit tests for account service
    - Test account creation with valid child names
    - Test interest rate updates
    - Test balance updates
    - _Requirements: 1.1, 4.1, 4.2_

- [ ] 4. Implement transaction service layer
  - [ ] 4.1 Create transaction service with validation
    - Implement deposit function with amount validation
    - Implement withdraw function with balance checking
    - Implement transaction recording logic
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 4.2 Implement interest calculation logic
    - Write applyInterest function with interest calculation
    - Implement logic to record interest as a transaction
    - Add validation to prevent duplicate interest applications
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 4.3 Implement transaction history retrieval
    - Write getTransactionHistory function
    - Sort transactions chronologically
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ] 4.4 Write unit tests for transaction service
    - Test deposit and withdrawal validation
    - Test insufficient funds handling
    - Test interest calculation accuracy
    - _Requirements: 2.3, 3.3, 3.4, 5.2_

- [ ] 5. Implement interest scheduler
  - [ ] 5.1 Create interest scheduler module
    - Implement checkAndApplyInterest function
    - Write shouldApplyInterest logic to check for Monday
    - Implement logic to prevent duplicate interest on same Monday
    - Add scheduler to run on application startup
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 5.2 Write unit tests for interest scheduler
    - Test Monday detection logic
    - Test duplicate prevention
    - Test interest application across multiple accounts
    - _Requirements: 5.1, 5.5_

- [ ] 6. Implement Express routes and controllers
  - [ ] 6.1 Create home page route
    - Implement GET / route to display all child accounts
    - Fetch all accounts with current balances
    - Render index view with account data
    - _Requirements: 1.4, 7.1_
  
  - [ ] 6.2 Create account creation routes
    - Implement GET /accounts/new route for form display
    - Implement POST /accounts route to handle child account creation
    - Add form validation and error handling
    - Redirect to home page after successful creation
    - _Requirements: 1.1, 1.2_
  
  - [ ] 6.3 Create account detail route
    - Implement GET /accounts/:id route
    - Fetch account data and transaction history
    - Render account detail view with forms for deposit/withdrawal
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2_
  
  - [ ] 6.4 Create transaction routes
    - Implement POST /accounts/:id/deposit route
    - Implement POST /accounts/:id/withdraw route
    - Add validation and error handling for both routes
    - Use POST-Redirect-GET pattern to prevent duplicate submissions
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 7.2_
  
  - [ ] 6.5 Create account settings routes
    - Implement GET /accounts/:id/settings route for settings page
    - Implement POST /accounts/:id/interest-rate route to update rate
    - Add validation for interest rate values
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 7. Create view templates
  - [ ] 7.1 Create home page template
    - Design index.ejs to display list of child accounts
    - Show account names and current balances
    - Add link to create new child account
    - Add links to each account detail page
    - _Requirements: 1.4, 7.1, 7.3_
  
  - [ ] 7.2 Create account creation template
    - Design account-new.ejs with form for child name
    - Add form validation and error display
    - Style form with clear labels and buttons
    - _Requirements: 1.1_
  
  - [ ] 7.3 Create account detail template
    - Design account-detail.ejs to show account information
    - Display current balance prominently
    - Show transaction history with type, amount, date, and balance
    - Add forms for deposit and withdrawal
    - Color code transaction types (green for deposits/interest, red for withdrawals)
    - Add link to settings page
    - _Requirements: 2.4, 3.5, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3_
  
  - [ ] 7.4 Create account settings template
    - Design account-settings.ejs with interest rate form
    - Display current interest rate
    - Add form to update interest rate
    - _Requirements: 4.1, 4.2, 4.4_
  
  - [ ] 7.5 Add CSS styling
    - Create stylesheet for clean, child-friendly design
    - Style buttons to be large and easy to click
    - Implement responsive design for mobile and desktop
    - Add color coding for transaction types
    - _Requirements: 7.3_

- [ ] 8. Add error handling and validation
  - [ ] 8.1 Implement server-side form validation
    - Validate all form inputs (amounts, names, rates)
    - Return clear error messages for invalid inputs
    - _Requirements: 2.3, 3.3, 3.4_
  
  - [ ] 8.2 Add error handling middleware
    - Create Express error handling middleware
    - Handle database errors gracefully
    - Display user-friendly error pages
    - _Requirements: All requirements benefit from proper error handling_
  
  - [ ] 8.3 Implement success messaging
    - Add flash messages or query parameters for success feedback
    - Display confirmation messages after transactions
    - _Requirements: 2.4, 3.5_

- [ ] 9. Integrate and test complete application
  - [ ] 9.1 Wire up all components
    - Connect routes to services
    - Connect services to database repository
    - Initialize interest scheduler on server startup
    - Test complete flow from UI to database
    - _Requirements: All requirements_
  
  - [ ] 9.2 Perform integration testing
    - Test complete user flows (create account, add transactions, view history)
    - Test interest application on Monday
    - Test error scenarios (insufficient funds, invalid inputs)
    - Test edge cases (zero balance, exact withdrawal of full balance)
    - _Requirements: All requirements_
  
  - [ ] 9.3 Add application startup script
    - Create npm start script
    - Add database initialization on first run
    - Configure port and environment variables
    - _Requirements: All requirements depend on proper startup_

- [ ] 10. Create project documentation
  - [ ] 10.1 Create AGENTS.md file
    - Document the application architecture and components
    - Explain the database schema and data models
    - Describe the interest calculation logic
    - Provide setup and running instructions
    - Include information about the parent/child account model
    - _Requirements: All requirements benefit from documentation_
