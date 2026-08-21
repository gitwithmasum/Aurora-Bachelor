# Aurora Bachelor

A local-first bachelor house management web app built with plain HTML, CSS and JavaScript.

## Run
Open `index.html` in a modern browser.

## Features
- Futuristic Aurora/Galaxy UI
- Dashboard
- Members
- Daily meal tracking
- Automatic meal-rate calculation
- Expenses
- Payments
- House bills
- Monthly reports
- Settlement calculation
- Local browser persistence
- JSON backup/restore
- CSV export
- Responsive mobile navigation

## Data Architecture

                    🌌 AURORA BACHELOR

                           DATA CORE
                              │
          ┌───────────────────┴──────────────────┐
          │                                      │
     🍚 MEAL ACCOUNT                         🏠 HOUSE ACCOUNT
          │                                      │
     Meal Matrix                              Rent
     Meal Expense                             Electricity
     Meal Rate                                Gas
     Meal Payment                             Water
                                              Internet
                                              House Payment
          │                                      │
          └───────────────────┬──────────────────┘
                              │
                              ▼
                     ⚡ SETTLEMENT ENGINE
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
          MEAL BALANCE                  HOUSE BALANCE
               │                             │
               └──────────────┬──────────────┘
                              ▼
                       FINAL BALANCE



## Important
This v1 uses localStorage. Data is stored in the current browser/device. Export a backup before clearing browser data.

## Next upgrades
- IndexedDB
- PWA/service worker
- Excel export
- Multi-house support
- Cloud sync/backend
- Authentication and roles
- Advanced rent/bill split rules
- Month closing
- AI assistant









script.js
│
├── 01. STORAGE & DEFAULT DATA
│   ├── STORAGE_KEY
│   ├── defaultData
│   ├── data
│   ├── currentMonth
│   └── currentPage
│
├── 02. CORE HELPERS
│   ├── uid()
│   ├── monthKey()
│   ├── monthLabel()
│   ├── esc()
│   ├── dateLabel()
│   └── money()
│
├── 03. MONTH / ACCOUNT
│   ├── load()
│   ├── save()
│   ├── ensureMonth()
│   └── m()
│
├── 04. MEAL ACCOUNT
│   └── AuroraMealAccount
│
├── 05. PAGE CONFIG
│   ├── pageTitles
│   └── card()
│
├── 06. RENDER ENGINE
│   ├── render()
│   └── renderMonthSelect()
│
├── 07. PAGE RENDERERS
│   ├── renderDashboard()
│   ├── renderMeals()
│   ├── renderMembers()
│   ├── renderExpenses()
│   ├── renderPayments()
│   ├── renderBills()
│   ├── renderReports()
│   ├── renderSettlement()
│   └── renderSettings()
│
├── 08. MODALS
│   ├── modal()
│   ├── closeModal()
│   ├── openMemberModal()
│   ├── openMealModal()
│   ├── openExpenseModal()
│   ├── openPaymentModal()
│   └── openBillModal()
│
├── 09. CRUD
│   ├── addMember()
│   ├── deleteMember()
│   ├── saveMeals()
│   ├── saveExpense()
│   ├── savePayment()
│   ├── saveBill()
│   └── removeRecord()
│
├── 10. MEMBER LEDGER
│   └── openMemberLedger()
│
├── 11. BACKUP / EXPORT
│   ├── exportBackup()
│   ├── importBackup()
│   └── exportCSV()
│
├── 12. SETTINGS
│   ├── saveSettings()
│   └── resetAll()
│
├── 13. UI
│   ├── go()
│   └── toast()
│
└── 14. EVENT LISTENERS
    ├── nav
    ├── monthSelect
    ├── backupBtn
    └── render()



    STORAGE
│
├── STORAGE_KEY
├── defaultData
├── data
├── currentMonth
└── currentPage
        ↓
UTILITY
│
├── uid()
├── monthKey()
├── monthLabel()
├── esc()
├── dateLabel()
└── money()
        ↓
PAGE CONFIG
│
├── pageTitles
└── card()
        ↓
RENDER ENGINE
│
├── render()
└── renderMonthSelect()
        ↓
MONTH / ACCOUNT ENGINE
│
├── ensureMonth()
├── m()
├── totalMeals()
├── mealExpenseTotal()
├── totalExpenses()
├── mealRate()
├── memberMeals()
├── memberPaid()
├── memberSharedBills()
├── memberResponsibility()
└── balance()
        ↓
DASHBOARD
│
├── renderDashboard()
├── renderMemberTable()
└── renderExpensePulse()
        ↓
MEMBERS
└── renderMembers()
        ↓
NEXT
├── renderMeals()
├── renderExpenses()
├── renderPayments()
├── renderBills()
├── renderReports()
├── renderSettlement()
└── renderSettings()