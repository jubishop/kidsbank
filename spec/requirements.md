# Requirements Document

## Introduction

The Kids Finance Tracker is a system designed to help children learn financial responsibility by tracking their deposits, withdrawals, and earning interest on their balance. The system automatically applies interest every Monday, teaching kids about how savings grow over time.

## Glossary

- **Finance Tracker**: The system that manages children's financial accounts
- **Account**: A financial record for a single child containing balance and transaction history
- **Transaction**: A deposit or withdrawal that changes an account balance
- **Interest**: A percentage-based amount added to the account balance weekly
- **Interest Rate**: The percentage used to calculate weekly interest payments

## Requirements

### Requirement 1

**User Story:** As a parent, I want to create accounts for my children, so that each child can track their own finances independently

#### Acceptance Criteria

1. THE Finance Tracker SHALL allow creation of new child accounts with a unique name
2. THE Finance Tracker SHALL store each account with an initial balance of zero
3. THE Finance Tracker SHALL maintain separate transaction histories for each account
4. THE Finance Tracker SHALL display a list of all child accounts

### Requirement 2

**User Story:** As a child, I want to record deposits to my account, so that I can track money I receive

#### Acceptance Criteria

1. WHEN a deposit transaction is submitted, THE Finance Tracker SHALL increase the account balance by the deposit amount
2. WHEN a deposit transaction is submitted, THE Finance Tracker SHALL record the transaction with the amount, date, and transaction type
3. THE Finance Tracker SHALL require deposit amounts to be positive numbers greater than zero
4. WHEN a deposit is recorded, THE Finance Tracker SHALL display a confirmation with the new balance

### Requirement 3

**User Story:** As a child, I want to record withdrawals from my account, so that I can track money I spend

#### Acceptance Criteria

1. WHEN a withdrawal transaction is submitted, THE Finance Tracker SHALL decrease the account balance by the withdrawal amount
2. WHEN a withdrawal transaction is submitted, THE Finance Tracker SHALL record the transaction with the amount, date, and transaction type
3. THE Finance Tracker SHALL require withdrawal amounts to be positive numbers greater than zero
4. IF a withdrawal amount exceeds the current account balance, THEN THE Finance Tracker SHALL reject the transaction and display an error message
5. WHEN a withdrawal is recorded, THE Finance Tracker SHALL display a confirmation with the new balance

### Requirement 4

**User Story:** As a parent, I want to set an interest rate for each account, so that my children can earn interest on their savings

#### Acceptance Criteria

1. THE Finance Tracker SHALL allow configuration of an interest rate for each account as a percentage
2. THE Finance Tracker SHALL store the interest rate with each account
3. THE Finance Tracker SHALL default new accounts to a zero percent interest rate
4. THE Finance Tracker SHALL allow the interest rate to be modified at any time

### Requirement 5

**User Story:** As a child, I want to automatically receive interest every Monday, so that my savings grow over time

#### Acceptance Criteria

1. WHEN the system date is Monday, THE Finance Tracker SHALL calculate interest for each account
2. WHEN calculating interest, THE Finance Tracker SHALL multiply the current balance by the interest rate
3. WHEN interest is calculated, THE Finance Tracker SHALL add the interest amount to the account balance
4. WHEN interest is applied, THE Finance Tracker SHALL record an interest transaction with the amount and date
5. THE Finance Tracker SHALL apply interest only once per Monday regardless of system access frequency

### Requirement 6

**User Story:** As a child, I want to view my transaction history, so that I can see all my deposits, withdrawals, and interest payments

#### Acceptance Criteria

1. THE Finance Tracker SHALL display all transactions for an account in chronological order
2. THE Finance Tracker SHALL show the transaction type, amount, date, and resulting balance for each transaction
3. THE Finance Tracker SHALL distinguish between deposit, withdrawal, and interest transaction types
4. THE Finance Tracker SHALL display the current account balance prominently

### Requirement 7

**User Story:** As a child, I want to see my current balance, so that I know how much money I have

#### Acceptance Criteria

1. THE Finance Tracker SHALL display the current balance for each account
2. THE Finance Tracker SHALL update the displayed balance immediately after any transaction
3. THE Finance Tracker SHALL format currency amounts with two decimal places
4. THE Finance Tracker SHALL prevent negative balances through withdrawal validation
