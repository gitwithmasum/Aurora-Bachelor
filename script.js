/* ============================================================
   AURORA BACHELOR — V3 CLEAN SCRIPT
   Single data store • Single renderer • Single boot
============================================================ */


/* ============================================================
   CORE APP STATE
============================================================ */

let currentMonth = null;
let currentPage = "dashboard";


/* ============================================================
   UTILS
============================================================ */

function uid(prefix = "id") {

  return (
    prefix +
    Math.random()
      .toString(36)
      .slice(2, 9) +
    Date.now()
      .toString(36)
      .slice(-4)
  );

}


function esc(value) {

  return String(value ?? "")
    .replace(
      /[&<>"']/g,
      ch => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[ch])
    );

}


function monthKey(date) {

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;

}


function monthLabel(key) {

  if (
    !key ||
    typeof key !== "string" ||
    !/^\d{4}-\d{2}$/.test(key)
  ) {
    return "Unknown Month";
  }

  const [year, month] =
    key.split("-").map(Number);


  return new Date(
    year,
    month - 1,
    1
  ).toLocaleString(
    "en-US",
    {
      month: "long",
      year: "numeric"
    }
  );

}


function dateLabel(value) {

  if (!value) {
    return "—";
  }


  const date =
    new Date(
      `${value}T00:00:00`
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }


  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


function todayISO() {

  return new Date()
    .toISOString()
    .slice(0, 10);

}


function money(amount) {

  const database =
    AuroraDataStore?.get?.();


  const currency =
    database?.house?.currency ||
    "৳";


  return `${currency}${Number(
    amount || 0
  ).toLocaleString(
    "en-BD",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  )}`;

}


function setText(id, value) {

  const element =
    document.getElementById(id);


  if (element) {

    element.textContent =
      value;

  }

}


function card(
  label,
  value,
  sub = ""
) {

  return `
    <div class="card stat">

      <div class="stat-label">
        ${esc(label)}
      </div>

      <div class="stat-value">
        ${value}
      </div>

      <div class="stat-sub">
        ${esc(sub)}
      </div>

    </div>
  `;

}


/* ============================================================
   CENTRAL DATA STORE V3
============================================================ */

const AuroraDataStore = (() => {

  const STORAGE_KEY =
    "aurora_bachelor_database_v3";


  const DEFAULT_DATA = {

    version: 3,


    house: {

      name:
        "Aurora Bachelor",

      currency:
        "৳"

    },


    settings: {

      currentMonth:
        monthKey(
          new Date()
        )

    },


    members: [

      {
        id: "m1",
        name: "Masum",
        phone: "",
        room: "",
        status: "active",
        joined: "",
        createdAt:
          new Date()
            .toISOString()
      },


      {
        id: "m2",
        name: "Rahim",
        phone: "",
        room: "",
        status: "active",
        joined: "",
        createdAt:
          new Date()
            .toISOString()
      },


      {
        id: "m3",
        name: "Karim",
        phone: "",
        room: "",
        status: "active",
        joined: "",
        createdAt:
          new Date()
            .toISOString()
      },


      {
        id: "m4",
        name: "Sakib",
        phone: "",
        room: "",
        status: "active",
        joined: "",
        createdAt:
          new Date()
            .toISOString()
      },


      {
        id: "m5",
        name: "Hasan",
        phone: "",
        room: "",
        status: "active",
        joined: "",
        createdAt:
          new Date()
            .toISOString()
      }

    ],


    months: {}

  };


  let db = null;


  /* ==========================================================
     CREATE MONTH
  ========================================================== */

  function createMonth() {

    return {

      closed: false,


      mealAccount: {

        meals: [],

        expenses: [],

        payments: []

      },


      houseAccount: {

        rent: [],

        bills: [],

        payments: []

      }

    };

  }


  /* ==========================================================
     NORMALIZE MONTH
  ========================================================== */

  function normalizeMonth(
    month
  ) {

    if (
      !month ||
      typeof month !== "object"
    ) {

      month =
        createMonth();

    }


    month.closed =
      Boolean(
        month.closed
      );


    if (
      !month.mealAccount ||
      typeof month.mealAccount !== "object"
    ) {

      month.mealAccount = {};

    }


    if (
      !Array.isArray(
        month.mealAccount.meals
      )
    ) {

      month.mealAccount.meals =
        [];

    }


    if (
      !Array.isArray(
        month.mealAccount.expenses
      )
    ) {

      month.mealAccount.expenses =
        [];

    }


    if (
      !Array.isArray(
        month.mealAccount.payments
      )
    ) {

      month.mealAccount.payments =
        [];

    }


    if (
      !month.houseAccount ||
      typeof month.houseAccount !== "object"
    ) {

      month.houseAccount = {};

    }


    if (
      !Array.isArray(
        month.houseAccount.rent
      )
    ) {

      month.houseAccount.rent =
        [];

    }


    if (
      !Array.isArray(
        month.houseAccount.bills
      )
    ) {

      month.houseAccount.bills =
        [];

    }


    if (
      !Array.isArray(
        month.houseAccount.payments
      )
    ) {

      month.houseAccount.payments =
        [];

    }


    return month;

  }


  /* ==========================================================
     INITIALIZE DATABASE
  ========================================================== */

  function init() {

    try {

      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );


      db =
        saved
          ? JSON.parse(saved)
          : structuredClone(
            DEFAULT_DATA
          );

    } catch (error) {

      console.error(
        "Aurora database error:",
        error
      );


      db =
        structuredClone(
          DEFAULT_DATA
        );

    }


    if (
      !db ||
      typeof db !== "object"
    ) {

      db =
        structuredClone(
          DEFAULT_DATA
        );

    }


    db.version = 3;


    if (
      !db.house ||
      typeof db.house !== "object"
    ) {

      db.house =
        structuredClone(
          DEFAULT_DATA.house
        );

    }


    if (!db.house.currency) {

      db.house.currency =
        "৳";

    }


    if (!db.house.name) {

      db.house.name =
        "Aurora Bachelor";

    }


    if (
      !db.settings ||
      typeof db.settings !== "object"
    ) {

      db.settings = {};

    }


    if (
      !db.settings.currentMonth
    ) {

      db.settings.currentMonth =
        monthKey(
          new Date()
        );

    }


    if (!Array.isArray(db.members)) {

      db.members = [];

    }


    if (
      !db.months ||
      typeof db.months !== "object"
    ) {

      db.months = {};

    }


    db.members =
      db.members.map(
        member => ({

          id:
            member.id ||
            uid("m"),

          name:
            String(
              member.name ||
              "Unnamed"
            ),

          phone:
            String(
              member.phone ||
              ""
            ),

          room:
            String(
              member.room ||
              ""
            ),

          joined:
            String(
              member.joined ||
              ""
            ),

          status:
            member.status ===
              "inactive"
              ? "inactive"
              : "active",

          createdAt:
            member.createdAt ||
            new Date()
              .toISOString()

        })
      );


    Object.keys(
      db.months
    ).forEach(
      key => {

        db.months[key] =
          normalizeMonth(
            db.months[key]
          );

      }
    );


    ensureMonth(
      db.settings.currentMonth
    );


    currentMonth =
      db.settings.currentMonth;


    save();

  }


  /* ==========================================================
     ENSURE MONTH
  ========================================================== */

  function ensureMonth(
    month
  ) {

    if (!db) {

      return null;

    }


    if (
      !db.months[month]
    ) {

      db.months[month] =
        createMonth();

    }


    return normalizeMonth(
      db.months[month]
    );

  }


  /* ==========================================================
     GET DATABASE
  ========================================================== */

  function get() {

    return db;

  }


  /* ==========================================================
     SAVE DATABASE
  ========================================================== */

  function save() {

    if (!db) {
      return;
    }


    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(db)
    );

  }


  /* ==========================================================
     GET MONTH
  ========================================================== */

  function getMonth(
    month
  ) {

    return ensureMonth(
      month
    );

  }


  /* ==========================================================
     GET MEMBERS
  ========================================================== */

  function getMembers(
    includeInactive = false
  ) {

    if (
      !db?.members
    ) {

      return [];

    }


    return includeInactive

      ? [...db.members]

      : db.members.filter(
        member =>
          member.status !==
          "inactive"
      );

  }


  /* ==========================================================
     RESET
  ========================================================== */

  function reset() {

    if (
      !confirm(
        "Reset Aurora Bachelor?\n\n" +
        "All local data will be deleted."
      )
    ) {

      return;

    }


    db =
      structuredClone(
        DEFAULT_DATA
      );


    currentMonth =
      db.settings.currentMonth;


    ensureMonth(
      currentMonth
    );


    save();


    location.reload();

  }


  /* ==========================================================
     EXPORT BACKUP
  ========================================================== */

  function exportBackup() {

    const blob =
      new Blob(
        [
          JSON.stringify(
            db,
            null,
            2
          )
        ],
        {
          type:
            "application/json"
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href = url;


    link.download =
      `aurora-bachelor-${todayISO()}.json`;


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
      url
    );


    toast(
      "Backup exported."
    );

  }


  /* ==========================================================
     IMPORT BACKUP
  ========================================================== */

  function importBackup() {

    const input =
      document.createElement(
        "input"
      );


    input.type =
      "file";


    input.accept =
      ".json,application/json";


    input.onchange = () => {

      const file =
        input.files?.[0];


      if (!file) {
        return;
      }


      const reader =
        new FileReader();


      reader.onload = () => {

        try {

          const incoming =
            JSON.parse(
              reader.result
            );


          if (
            !incoming ||
            !Array.isArray(
              incoming.members
            ) ||
            !incoming.months
          ) {

            throw new Error(
              "Invalid Aurora database"
            );

          }


          db = incoming;


          if (
            !db.settings
          ) {

            db.settings = {};

          }


          if (
            !db.settings.currentMonth
          ) {

            db.settings.currentMonth =
              monthKey(
                new Date()
              );

          }


          if (!db.house) {

            db.house = {

              name:
                "Aurora Bachelor",

              currency:
                "৳"

            };

          }


          if (
            !db.house.currency
          ) {

            db.house.currency =
              "৳";

          }


          if (!db.months) {

            db.months = {};

          }


          Object.keys(
            db.months
          ).forEach(
            key => {

              db.months[key] =
                normalizeMonth(
                  db.months[key]
                );

            }
          );


          currentMonth =
            db.settings.currentMonth;


          ensureMonth(
            currentMonth
          );


          save();


          toast(
            "Backup restored."
          );


          render();

        } catch (error) {

          console.error(
            error
          );


          toast(
            "Invalid backup file."
          );

        }

      };


      reader.readAsText(
        file
      );

    };


    input.click();

  }


  return {

    init,

    get,

    getMembers,

    save,

    getMonth,

    ensureMonth,

    reset,

    exportBackup,

    importBackup

  };

})();


/* ============================================================
   AURORA BACHELOR — APPLICATION CONTROLLER V3
============================================================ */

const AuroraApp = (() => {

  const pages = {

    dashboard: "Command Center",
    meals: "Daily Meals",
    members: "Members",
    expenses: "Meal Expenses",
    payments: "Payments",
    bills: "House Bills",
    reports: "Monthly Report",
    settlement: "Settlement",
    settings: "Settings"

  };


  /* ==========================================================
     CURRENT MONTH
  ========================================================== */

  function getCurrentMonth() {

    const database =
      AuroraDataStore.get();

    return (
      database?.settings?.currentMonth ||
      currentMonth ||
      monthKey(new Date())
    );

  }


  /* ==========================================================
     SET MONTH
  ========================================================== */

  function setMonth(month) {

    if (!month) {
      return;
    }


    const database =
      AuroraDataStore.get();

    if (!database) {
      return;
    }


    AuroraDataStore.ensureMonth(
      month
    );


    database.settings.currentMonth =
      month;


    currentMonth =
      month;


    AuroraDataStore.save();


    render();

  }


  /* ==========================================================
     NAVIGATE
  ========================================================== */

  function navigate(page) {

    if (!pages[page]) {
      return;
    }


    currentPage =
      page;


    render();

  }


  /* ==========================================================
     REFRESH
  ========================================================== */

  function refresh() {

    render();

  }


  /* ==========================================================
     PAGE TITLE
  ========================================================== */

  function getPageTitle() {

    return (
      pages[currentPage] ||
      "Command Center"
    );

  }


  return {

    navigate,
    setMonth,
    refresh,
    getCurrentMonth,
    getPageTitle

  };

})();


/* ============================================================
   PAGE TITLE CONFIG
============================================================ */

const pageTitles = {

  dashboard:
    "Command Center",

  meals:
    "Daily Meals",

  members:
    "Members",

  expenses:
    "Meal Expenses",

  payments:
    "Payments",

  bills:
    "House Bills",

  reports:
    "Monthly Report",

  settlement:
    "Settlement",

  settings:
    "Settings"

};



/* ============================================================
   MONTH SELECTOR V3 — FULL YEAR
============================================================ */

/* ============================================================
   AURORA — CUSTOM MONTH HUD
============================================================ */
/* ============================================================
   AURORA — MONTH SELECTOR
============================================================ */

/* ============================================================
   AURORA — FUTURISTIC MONTH SELECTOR
============================================================ */

function renderMonthSelect() {

  const container =
    document.getElementById("monthSelect");

  if (!container) return;


  const database =
    AuroraDataStore.get();

  const current =
    AuroraApp.getCurrentMonth();


  const [year] =
    current.split("-").map(Number);


  const months =
    new Set();


  /* ----------------------------------------------------------
     CURRENT YEAR — JANUARY TO DECEMBER
  ---------------------------------------------------------- */

  for (
    let month = 1;
    month <= 12;
    month++
  ) {

    months.add(
      `${year}-${String(month).padStart(2, "0")}`
    );

  }


  /* ----------------------------------------------------------
     KEEP STORED MONTHS
  ---------------------------------------------------------- */

  Object.keys(
    database.months || {}
  ).forEach(month => {

    months.add(month);

  });


  const monthList =
    [...months]
      .sort()
      .reverse();


  /* ----------------------------------------------------------
     BUILD HUD
  ---------------------------------------------------------- */

  container.innerHTML = `

    <span class="month-label">
      <i></i>
      ACTIVE CYCLE
    </span>


    <button
      type="button"
      class="month-trigger"
      id="monthTrigger"
    >

      <span class="month-current">
        ${monthLabel(current)}
      </span>

      <span class="select-arrow">
        ⌄
      </span>

    </button>


    <div
      class="month-dropdown"
      id="monthDropdown"
    >

      <div class="month-dropdown-head">

        <span>
          SELECT CYCLE
        </span>

        <span>
          ${year}
        </span>

      </div>


      <div class="month-options">

        ${monthList
      .map(month => {

        const active =
          month === current;


        return `

                <button
                  type="button"
                  class="
                    month-option
                    ${active ? "active" : ""}
                  "
                  data-month="${month}"
                >

                  <span
                    class="month-option-marker"
                  >
                    ${active ? "●" : "◇"}
                  </span>


                  <span
                    class="month-option-name"
                  >
                    ${monthLabel(month)}
                  </span>


                  ${active
            ? `
                        <span
                          class="month-option-active"
                        >
                          ACTIVE
                        </span>
                      `
            : ""
          }

                </button>

              `;

      })
      .join("")
    }

      </div>

    </div>

  `;


  const trigger =
    document.getElementById(
      "monthTrigger"
    );

  const dropdown =
    document.getElementById(
      "monthDropdown"
    );


  if (!trigger || !dropdown) {
    return;
  }


  /* ----------------------------------------------------------
     OPEN / CLOSE
  ---------------------------------------------------------- */

  trigger.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      container.classList.toggle(
        "open"
      );

    }
  );


  /* ----------------------------------------------------------
     SELECT MONTH
  ---------------------------------------------------------- */

  dropdown
    .querySelectorAll(
      ".month-option"
    )
    .forEach(option => {

      option.addEventListener(
        "click",
        event => {

          event.stopPropagation();


          const month =
            option.dataset.month;


          if (!month) {
            return;
          }


          container.classList.remove(
            "open"
          );


          AuroraApp.setMonth(
            month
          );

        }
      );

    });

}



/* ============================================================
   CLOSE MONTH DROPDOWN
============================================================ */

document.addEventListener(
  "click",
  event => {

    const monthSelector =
      document.getElementById(
        "monthSelect"
      );

    if (!monthSelector) {
      return;
    }


    if (
      !monthSelector.contains(
        event.target
      )
    ) {

      monthSelector.classList.remove(
        "open"
      );

    }

  }
);

/* ============================================================
   APPLICATION SHELL
============================================================ */

function renderShell() {

  const activeMonth =
    AuroraApp.getCurrentMonth();


  /* ----------------------------------------------------------
     PAGE TITLE
  ---------------------------------------------------------- */

  const pageTitle =
    document.getElementById(
      "pageTitle"
    );


  if (pageTitle) {

    pageTitle.textContent =
      pageTitles[currentPage] ||
      AuroraApp.getPageTitle();

  }


  /* ----------------------------------------------------------
     PAGE VISIBILITY
  ---------------------------------------------------------- */

  document
    .querySelectorAll(".page")
    .forEach(
      page => {

        page.classList.toggle(
          "active",
          page.id ===
          `page-${currentPage}`
        );

      }
    );


  /* ----------------------------------------------------------
     NAVIGATION STATE
  ---------------------------------------------------------- */

  document
    .querySelectorAll(".nav-item")
    .forEach(
      item => {

        item.classList.toggle(
          "active",
          item.dataset.page ===
          currentPage
        );

      }
    );




  /* ----------------------------------------------------------
    MONTH SELECT
 ---------------------------------------------------------- */

  renderMonthSelect();


}


/* ============================================================
   MAIN RENDER ENGINE
============================================================ */

function render() {

  try {

    /* --------------------------------------------------------
       Month selector
    -------------------------------------------------------- */

    renderMonthSelect();


    /* --------------------------------------------------------
       Shell
    -------------------------------------------------------- */

    renderShell();


    /* --------------------------------------------------------
       Current page renderer
    -------------------------------------------------------- */

    switch (
    currentPage
    ) {

      case "dashboard":

        if (
          typeof renderDashboard ===
          "function"
        ) {

          renderDashboard();

        }

        break;


      case "meals":

        if (
          typeof renderMeals ===
          "function"
        ) {

          renderMeals();

        }

        break;


      case "members":

        if (
          typeof renderMembers ===
          "function"
        ) {

          renderMembers();

        }

        break;


      case "expenses":

        if (
          typeof renderExpenses ===
          "function"
        ) {

          renderExpenses();

        }

        break;


      case "payments":

        if (
          typeof renderPayments ===
          "function"
        ) {

          renderPayments();

        }

        break;


      case "bills":

        if (
          typeof renderBills ===
          "function"
        ) {

          renderBills();

        }

        break;


      case "reports":

        if (
          typeof renderReports ===
          "function"
        ) {

          renderReports();

        }

        break;


      case "settlement":

        if (
          typeof renderSettlement ===
          "function"
        ) {

          renderSettlement();

        }

        break;


      case "settings":

        if (
          typeof renderSettings ===
          "function"
        ) {

          renderSettings();

        }

        break;


      default:

        currentPage =
          "dashboard";


        if (
          typeof renderDashboard ===
          "function"
        ) {

          renderDashboard();

        }

    }

  } catch (error) {

    console.error(
      "AURORA RENDER ERROR:",
      error
    );


    const page =
      document.getElementById(
        `page-${currentPage}`
      );


    if (page) {

      page.innerHTML = `

        <div class="card">

          <h2>
            ⚠️ Module Error
          </h2>


          <p class="muted">
            ${esc(
        error?.message ||
        "Unknown rendering error."
      )}
          </p>

        </div>

      `;

    }

  }

}


/* ============================================================
   NAVIGATION HELPER
============================================================ */

function go(page) {

  AuroraApp.navigate(
    page
  );

}


/* ============================================================
   MODAL SYSTEM
============================================================ */

function modal(
  title,
  body
) {

  const root =
    document.getElementById(
      "modalRoot"
    );


  if (!root) {
    return;
  }


  root.innerHTML = `

    <div
      class="modal-backdrop"
      onclick="
        if(event.target === this)
          closeModal()
      "
    >

      <div class="modal">

        <div class="section-head">

          <h2>
            ${esc(title)}
          </h2>


          <button
            type="button"
            class="icon-btn"
            onclick="closeModal()"
          >
            ×
          </button>

        </div>


        ${body}

      </div>

    </div>

  `;

}


/* ============================================================
   CLOSE MODAL
============================================================ */

function closeModal() {

  const root =
    document.getElementById(
      "modalRoot"
    );


  if (!root) {
    return;
  }


  root.innerHTML =
    "";

}


/* ============================================================
   TOAST
============================================================ */

function toast(
  message
) {

  const element =
    document.getElementById(
      "toast"
    );


  if (!element) {
    return;
  }


  element.textContent =
    message;


  element.classList.add(
    "show"
  );


  clearTimeout(
    element._auroraTimer
  );


  element._auroraTimer =
    setTimeout(
      () => {

        element.classList.remove(
          "show"
        );

      },
      2200
    );

}


/* ============================================================
   BASIC EVENT BINDING
============================================================ */

function bindNavigationEvents() {

  const nav =
    document.getElementById(
      "nav"
    );


  if (
    nav &&
    !nav.dataset.auroraBound
  ) {

    nav.dataset.auroraBound =
      "true";


    nav.addEventListener(
      "click",
      event => {

        const button =
          event.target.closest(
            "[data-page]"
          );


        if (!button) {
          return;
        }


        event.preventDefault();


        AuroraApp.navigate(
          button.dataset.page
        );

      }
    );

  }


  const monthSelect =
    document.getElementById(
      "monthSelect"
    );


  if (
    monthSelect &&
    !monthSelect.dataset.auroraBound
  ) {

    monthSelect.dataset.auroraBound =
      "true";


    monthSelect.addEventListener(
      "change",
      event => {

        AuroraApp.setMonth(
          event.target.value
        );

      }
    );

  }


  const backupButton =
    document.getElementById(
      "backupBtn"
    );


  if (
    backupButton &&
    !backupButton.dataset.auroraBound
  ) {

    backupButton.dataset.auroraBound =
      "true";


    backupButton.addEventListener(
      "click",
      () => {

        AuroraDataStore
          .exportBackup();

      }
    );

  }

}


/* ============================================================
   AURORA BACHELOR — EXPENSE ACCOUNT V3
============================================================ */

const AuroraExpenseAccount = (() => {

  function month() {

    return AuroraDataStore.getMonth(
      AuroraApp.getCurrentMonth()
    );

  }


  function data() {

    return (
      month()?.mealAccount?.expenses ||
      []
    );

  }


  function total() {

    return data().reduce(
      (sum, expense) =>
        sum +
        Number(
          expense.amount || 0
        ),
      0
    );

  }


  function mealCategories() {

    return [
      "Food",
      "Grocery",
      "Gas"
    ];

  }


  function mealTotal() {

    const categories =
      mealCategories();


    return data()
      .filter(
        expense =>
          categories.includes(
            expense.category
          )
      )
      .reduce(
        (sum, expense) =>
          sum +
          Number(
            expense.amount || 0
          ),
        0
      );

  }


  function totalByCategory(
    category
  ) {

    return data()
      .filter(
        expense =>
          expense.category ===
          category
      )
      .reduce(
        (sum, expense) =>
          sum +
          Number(
            expense.amount || 0
          ),
        0
      );

  }


  function categories() {

    const result = {};


    data().forEach(
      expense => {

        const category =
          expense.category ||
          "Other";


        result[category] =
          (
            result[category] ||
            0
          ) +
          Number(
            expense.amount || 0
          );

      }
    );


    return result;

  }


  function memberPaid(
    memberId
  ) {

    return data()
      .filter(
        expense =>
          expense.paidBy ===
          memberId
      )
      .reduce(
        (sum, expense) =>
          sum +
          Number(
            expense.amount || 0
          ),
        0
      );

  }


  function add(expense) {

    const currentMonth =
      month();


    currentMonth
      .mealAccount
      .expenses
      .push({

        id:
          expense.id ||
          uid("exp"),

        date:
          expense.date,

        category:
          expense.category,

        description:
          expense.description,

        amount:
          Number(
            expense.amount || 0
          ),

        paidBy:
          expense.paidBy

      });


    AuroraDataStore.save();

  }


  function get(id) {

    return (
      data().find(
        expense =>
          expense.id === id
      ) ||
      null
    );

  }


  function remove(id) {

    const currentMonth =
      month();


    currentMonth
      .mealAccount
      .expenses =
      currentMonth
        .mealAccount
        .expenses
        .filter(
          expense =>
            expense.id !== id
        );


    AuroraDataStore.save();

  }


  return {

    data,

    total,

    mealTotal,

    mealCategories,

    totalByCategory,

    categories,

    memberPaid,

    add,

    get,

    remove

  };

})();


/* ============================================================
   AURORA BACHELOR — MEAL ACCOUNT V3
============================================================ */

const AuroraMealAccount = (() => {

  function month() {

    return AuroraDataStore.getMonth(
      AuroraApp.getCurrentMonth()
    );

  }


  function data() {

    return (
      month()?.mealAccount || {
        meals: [],
        expenses: [],
        payments: []
      }
    );

  }


  function totalMeals() {

    return data()
      .meals
      .reduce(
        (total, meal) => {

          const values =
            meal?.values || {};


          const dayTotal =
            Object.values(
              values
            )
              .reduce(
                (sum, value) =>
                  sum +
                  Number(
                    value || 0
                  ),
                0
              );


          return (
            total +
            dayTotal
          );

        },
        0
      );

  }


  function totalExpense() {

    return AuroraExpenseAccount
      .mealTotal();

  }


  function mealRate() {

    const meals =
      totalMeals();


    const expense =
      totalExpense();


    if (meals <= 0) {
      return 0;
    }


    return (
      expense /
      meals
    );

  }


  function memberMeals(
    memberId
  ) {

    return data()
      .meals
      .reduce(
        (sum, meal) =>
          sum +
          Number(
            meal?.values?.[
            memberId
            ] || 0
          ),
        0
      );

  }


  function memberDue(
    memberId
  ) {

    return (
      memberMeals(
        memberId
      ) *
      mealRate()
    );

  }


  function memberPaid(
    memberId
  ) {

    return data()
      .payments
      .filter(
        payment =>
          payment.memberId ===
          memberId
      )
      .reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.amount || 0
          ),
        0
      );

  }


  function memberBalance(
    memberId
  ) {

    return (
      memberPaid(
        memberId
      ) -
      memberDue(
        memberId
      )
    );

  }


  function calculate() {

    const members =
      AuroraDataStore
        .getMembers()
        .map(
          member => ({

            id:
              member.id,

            name:
              member.name,

            meals:
              memberMeals(
                member.id
              ),

            due:
              memberDue(
                member.id
              ),

            paid:
              memberPaid(
                member.id
              ),

            balance:
              memberBalance(
                member.id
              )

          })
        );


    return {

      totalMeals:
        totalMeals(),

      totalExpense:
        totalExpense(),

      mealRate:
        mealRate(),

      members

    };

  }


  return {

    data,

    totalMeals,

    totalExpense,

    mealRate,

    memberMeals,

    memberDue,

    memberPaid,

    memberBalance,

    calculate

  };

})();


/* ============================================================
   AURORA BACHELOR — PAYMENT ACCOUNT V3
============================================================ */

const AuroraPaymentAccount = (() => {

  function month() {

    return AuroraDataStore.getMonth(
      AuroraApp.getCurrentMonth()
    );

  }


  /* ==========================================================
     ALL PAYMENTS
  ========================================================== */

  function data() {

    const currentMonth =
      month();


    const mealPayments =
      currentMonth
        ?.mealAccount
        ?.payments || [];


    const housePayments =
      currentMonth
        ?.houseAccount
        ?.payments || [];


    return [

      ...mealPayments.map(
        payment => ({

          ...payment,

          account:
            "meal"

        })
      ),

      ...housePayments.map(
        payment => ({

          ...payment,

          account:
            "house"

        })
      )

    ];

  }


  /* ==========================================================
     TOTAL
  ========================================================== */

  function total() {

    return data()
      .reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.amount || 0
          ),
        0
      );

  }


  /* ==========================================================
     TOTAL BY ACCOUNT
  ========================================================== */

  function totalByAccount(
    account
  ) {

    return data()
      .filter(
        payment =>
          payment.account ===
          account
      )
      .reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.amount || 0
          ),
        0
      );

  }


  /* ==========================================================
     MEMBER PAID
  ========================================================== */

  function memberPaid(
    memberId
  ) {

    return data()
      .filter(
        payment =>
          payment.memberId ===
          memberId
      )
      .reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.amount || 0
          ),
        0
      );

  }


  /* ==========================================================
     MEMBER PAYMENT HISTORY
  ========================================================== */

  function memberPayments(
    memberId
  ) {

    return data()
      .filter(
        payment =>
          payment.memberId ===
          memberId
      );

  }


  /* ==========================================================
     ADD PAYMENT
  ========================================================== */

  function add(
    payment,
    accountType = "meal"
  ) {

    const currentMonth =
      month();


    const targetAccount =
      accountType === "house"

        ? currentMonth.houseAccount

        : currentMonth.mealAccount;


    if (
      !Array.isArray(
        targetAccount.payments
      )
    ) {

      targetAccount.payments =
        [];

    }


    targetAccount
      .payments
      .push({

        id:
          payment.id ||
          uid("pay"),

        date:
          payment.date,

        memberId:
          payment.memberId,

        amount:
          Number(
            payment.amount || 0
          ),

        method:
          payment.method ||
          "Cash",

        note:
          payment.note ||
          "",

        reference:
          payment.reference ||
          ""

      });


    AuroraDataStore.save();

  }


  /* ==========================================================
     GET
  ========================================================== */

  function get(id) {

    return (
      data().find(
        payment =>
          payment.id === id
      ) ||
      null
    );

  }


  /* ==========================================================
     REMOVE
  ========================================================== */

  function remove(id) {

    const currentMonth =
      month();

    if (!currentMonth) {
      return false;
    }

    const payment =
      data().find(item => item.id === id);

    if (!payment) {
      return false;
    }

    if (payment.account === "house") {

      currentMonth.houseAccount.payments =
        (currentMonth.houseAccount.payments || [])
          .filter(item => item.id !== id);

    } else {

      currentMonth.mealAccount.payments =
        (currentMonth.mealAccount.payments || [])
          .filter(item => item.id !== id);

    }

    AuroraDataStore.save();

    return true;

  }


  return {

    data,

    total,

    totalByAccount,

    memberPaid,

    memberPayments,

    add,

    get,

    remove

  };

})();


/* ============================================================
   AURORA BACHELOR — BILL ACCOUNT V3
============================================================ */

const AuroraBillAccount = (() => {

  function month() {

    return AuroraDataStore.getMonth(
      AuroraApp.getCurrentMonth()
    );

  }


  function data() {

    return (
      month()
        ?.houseAccount
        ?.bills || []
    );

  }


  /* ==========================================================
     TOTAL
  ========================================================== */

  function total() {

    return data()
      .reduce(
        (sum, bill) =>
          sum +
          Number(
            bill.amount || 0
          ),
        0
      );

  }


  /* ==========================================================
     TOTAL BY CATEGORY
  ========================================================== */

  function totalByCategory(
    category
  ) {

    return data()
      .filter(
        bill =>
          bill.category ===
          category
      )
      .reduce(
        (sum, bill) =>
          sum +
          Number(
            bill.amount || 0
          ),
        0
      );

  }


  /* ==========================================================
     CATEGORY SUMMARY
  ========================================================== */

  function categories() {

    const result = {};


    data().forEach(
      bill => {

        const category =
          bill.category ||
          "Other";


        result[category] =
          (
            result[category] ||
            0
          ) +
          Number(
            bill.amount || 0
          );

      }
    );


    return result;

  }


  /* ==========================================================
     MEMBER SHARE
  ========================================================== */

  function memberShare(
    memberCount
  ) {

    const count =
      Number(
        memberCount || 0
      );


    if (count <= 0) {
      return 0;
    }


    return (
      total() /
      count
    );

  }


  /* ==========================================================
     ADD BILL
  ========================================================== */

  function add(
    bill
  ) {

    const currentMonth =
      month();


    if (
      !Array.isArray(
        currentMonth
          .houseAccount
          .bills
      )
    ) {

      currentMonth
        .houseAccount
        .bills = [];

    }


    currentMonth
      .houseAccount
      .bills
      .push({

        id:
          bill.id ||
          uid("bill"),

        date:
          bill.date,

        category:
          bill.category,

        description:
          bill.description,

        amount:
          Number(
            bill.amount || 0
          )

      });


    AuroraDataStore.save();

  }


  /* ==========================================================
     GET
  ========================================================== */

  function get(id) {

    return (
      data().find(
        bill =>
          bill.id === id
      ) ||
      null
    );

  }


  /* ==========================================================
     REMOVE
  ========================================================== */

  function remove(id) {

    const currentMonth =
      month();


    currentMonth
      .houseAccount
      .bills =
      (
        currentMonth
          .houseAccount
          .bills || []
      )
        .filter(
          bill =>
            bill.id !== id
        );


    AuroraDataStore.save();

  }


  return {

    data,

    total,

    totalByCategory,

    categories,

    memberShare,

    add,

    get,

    remove

  };

})();


/* ============================================================
   AURORA BACHELOR — HOUSE ACCOUNT V3
============================================================ */

const AuroraHouseAccount = (() => {

  function month() {

    return AuroraDataStore.getMonth(
      AuroraApp.getCurrentMonth()
    );

  }


  function data() {

    return (
      month()
        ?.houseAccount || {

        rent: [],
        bills: [],
        payments: []

      }
    );

  }


  /* ==========================================================
     RENT
  ========================================================== */

  function totalRent() {

    return data()
      .rent
      .reduce(
        (sum, item) =>
          sum +
          Number(
            item.amount || 0
          ),
        0
      );

  }


  /* ==========================================================
     BILLS
  ========================================================== */

  function totalBills() {

    return AuroraBillAccount
      .total();

  }


  /* ==========================================================
     TOTAL HOUSE COST
  ========================================================== */

  function totalCost() {

    return (
      totalRent() +
      totalBills()
    );

  }


  /* ==========================================================
     ACTIVE MEMBER SHARE
  ========================================================== */

  function memberShare() {

    const members =
      AuroraDataStore
        .getMembers();


    if (
      !members.length
    ) {

      return 0;

    }


    return (
      totalCost() /
      members.length
    );

  }


  /* ==========================================================
     MEMBER PAID
  ========================================================== */

  function memberPaid(
    memberId
  ) {

    return data()
      .payments
      .filter(
        payment =>
          payment.memberId ===
          memberId
      )
      .reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.amount || 0
          ),
        0
      );

  }


  /* ==========================================================
     MEMBER BALANCE
  ========================================================== */

  function memberBalance(
    memberId
  ) {

    return (
      memberPaid(
        memberId
      ) -
      memberShare()
    );

  }


  /* ==========================================================
     TOTAL HOUSE PAYMENTS
  ========================================================== */

  function totalPaid() {

    return data()
      .payments
      .reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.amount || 0
          ),
        0
      );

  }


  /* ==========================================================
     OUTSTANDING
  ========================================================== */

  function outstanding() {

    return Math.max(
      0,
      totalCost() -
      totalPaid()
    );

  }


  /* ==========================================================
     ADD RENT
  ========================================================== */

  function addRent(
    rent
  ) {

    const currentMonth =
      month();


    if (
      !Array.isArray(
        currentMonth
          .houseAccount
          .rent
      )
    ) {

      currentMonth
        .houseAccount
        .rent = [];

    }


    currentMonth
      .houseAccount
      .rent
      .push({

        id:
          rent.id ||
          uid("rent"),

        date:
          rent.date,

        description:
          rent.description ||
          "House Rent",

        amount:
          Number(
            rent.amount || 0
          )

      });


    AuroraDataStore.save();

  }


  /* ==========================================================
     REMOVE RENT
  ========================================================== */

  function removeRent(
    id
  ) {

    const currentMonth =
      month();


    currentMonth
      .houseAccount
      .rent =
      (
        currentMonth
          .houseAccount
          .rent || []
      )
        .filter(
          item =>
            item.id !== id
        );


    AuroraDataStore.save();

  }


  return {

    data,

    totalRent,

    totalBills,

    totalCost,

    memberShare,

    memberPaid,

    memberBalance,

    totalPaid,

    outstanding,

    addRent,

    removeRent

  };

})();



/* ============================================================
   AURORA BACHELOR — DASHBOARD V3
============================================================ */

/* ============================================================
   AURORA BACHELOR — DASHBOARD V4
   Separate Meal Account + House Account
============================================================ */

function renderDashboard() {

  const page =
    document.getElementById("page-dashboard");

  if (!page) {
    return;
  }

  const month =
    AuroraDataStore.getMonth(
      AuroraApp.getCurrentMonth()
    );

  const members =
    AuroraDataStore.getMembers();

  /* ==========================================================
     MEAL ACCOUNT — COMPLETELY SEPARATE
  ========================================================== */

  const totalMeals =
    AuroraMealAccount.totalMeals();

  const mealExpense =
    AuroraMealAccount.totalExpense();

  const mealRate =
    AuroraMealAccount.mealRate();

  const mealPaid =
    AuroraPaymentAccount.totalByAccount("meal");

  const mealOutstanding =
    Math.max(
      0,
      mealExpense - mealPaid
    );

  /* ==========================================================
     HOUSE ACCOUNT — COMPLETELY SEPARATE
  ========================================================== */

  const houseCost =
    AuroraHouseAccount.totalCost();

  const rent =
    AuroraHouseAccount.totalRent();

  const bills =
    AuroraHouseAccount.totalBills();

  const housePaid =
    AuroraPaymentAccount.totalByAccount("house");

  const houseOutstanding =
    Math.max(
      0,
      houseCost - housePaid
    );

  /* ==========================================================
     OVERVIEW — COMBINED ONLY FOR SUMMARY
  ========================================================== */

  const combinedExpense =
    mealExpense + houseCost;

  const combinedPaid =
    mealPaid + housePaid;

  const combinedOutstanding =
    mealOutstanding + houseOutstanding;

  page.innerHTML = `

    <div class="card hero">

      <div class="eyebrow">
        AURORA //
        ${monthLabel(
    AuroraApp.getCurrentMonth()
  ).toUpperCase()}
      </div>

      <div class="kpi-row">

        <div>
          <h2>House Command Center</h2>

          <div class="muted">
            Meal and house accounts are tracked independently.
          </div>
        </div>

        <div class="big">
          ${money(mealRate)}
        </div>

      </div>

      <div class="muted">
        Current meal rate · meal expenses divided by recorded meals.
      </div>

    </div>


    <!-- ======================================================
         MEAL ACCOUNT
    ======================================================= -->

    <div class="grid stats" style="margin-top:14px">

      ${card(
    "Meal Count",
    totalMeals,
    "Current month"
  )}

      ${card(
    "Meal Rate",
    money(mealRate),
    "Per meal"
  )}

      ${card(
    "Meal Expense",
    money(mealExpense),
    "Food account"
  )}

      ${card(
    "Meal Outstanding",
    money(mealOutstanding),
    `Paid ${money(mealPaid)}`
  )}

    </div>


    <!-- ======================================================
         HOUSE ACCOUNT
    ======================================================= -->

    <div class="grid stats" style="margin-top:14px">

      ${card(
    "House Cost",
    money(houseCost),
    "Rent + bills"
  )}

      ${card(
    "House Rent",
    money(rent),
    "Rent account"
  )}

      ${card(
    "House Bills",
    money(bills),
    "Utilities"
  )}

      ${card(
    "House Outstanding",
    money(houseOutstanding),
    `Paid ${money(housePaid)}`
  )}

    </div>


    <!-- ======================================================
         ACCOUNT OVERVIEW
    ======================================================= -->

    <div class="grid stats" style="margin-top:14px">

      ${card(
    "Active Members",
    members.length,
    "Current house members"
  )}

      ${card(
    "Combined Expense",
    money(combinedExpense),
    "Meal + house overview"
  )}

      ${card(
    "Combined Paid",
    money(combinedPaid),
    "Meal + house payments"
  )}

      ${card(
    "Combined Outstanding",
    money(combinedOutstanding),
    "Summary only"
  )}

    </div>


    <!-- ======================================================
         MEMBER MATRIX
    ======================================================= -->

    <div class="grid two-col">

      <div class="card">

        <div class="section-head">

          <div>
            <h2>Member Balance Matrix</h2>

            <div class="muted">
              Meal account balance by active member.
            </div>
          </div>

          <button
            class="btn small"
            onclick="go('members')"
          >
            Manage
          </button>

        </div>

        ${members.length ? `

          <div class="table-wrap">

            <table>

              <thead>
                <tr>
                  <th>Member</th>
                  <th>Meals</th>
                  <th>Meal Due</th>
                  <th>Meal Paid</th>
                  <th>Balance</th>
                </tr>
              </thead>

              <tbody>

                ${members.map(member => {

    const meals =
      AuroraMealAccount.memberMeals(
        member.id
      );

    const due =
      AuroraMealAccount.memberDue(
        member.id
      );

    const paid =
      AuroraPaymentAccount
        .data()
        .filter(
          payment =>
            payment.account === "meal" &&
            payment.memberId === member.id
        )
        .reduce(
          (sum, payment) =>
            sum + Number(payment.amount || 0),
          0
        );

    const balance =
      paid - due;

    return `
                    <tr>
                      <td>
                        <strong>${esc(member.name)}</strong>
                      </td>

                      <td>${meals}</td>
                      <td>${money(due)}</td>
                      <td>${money(paid)}</td>

                      <td class="${balance >= 0 ? "positive" : "negative"
      }">
                        ${balance >= 0 ? "+" : ""}${money(balance)}
                      </td>
                    </tr>
                  `;

  }).join("")}

              </tbody>

            </table>

          </div>

        ` : `

          <div class="empty">
            <div class="emoji">👥</div>
            <h3>No active members</h3>
            <p class="muted">
              Add members to start house accounting.
            </p>
          </div>

        `}

      </div>


      <!-- ====================================================
           HOUSE FINANCE
      ===================================================== -->

      <div class="card">

        <div class="section-head">

          <div>
            <h2>House Finance Core</h2>

            <div class="muted">
              House account only — rent, bills and house payments.
            </div>
          </div>

          <button
            class="btn small"
            onclick="go('bills')"
          >
            Open
          </button>

        </div>

        <div class="bar-list">

          <div class="bar-row">
            <span>Rent</span>
            <span class="progress">
              <i style="width:${houseCost > 0
      ? (rent / houseCost) * 100
      : 0
    }%"></i>
            </span>
            <strong>${money(rent)}</strong>
          </div>

          <div class="bar-row">
            <span>Bills</span>
            <span class="progress">
              <i style="width:${houseCost > 0
      ? (bills / houseCost) * 100
      : 0
    }%"></i>
            </span>
            <strong>${money(bills)}</strong>
          </div>

        </div>

        <div class="muted" style="margin-top:18px">
          🏠 Rent: ${money(rent)}
          <br>
          📄 Bills: ${money(bills)}
          <br>
          💳 House Paid: ${money(housePaid)}
          <br>
          ⚠ Outstanding: ${money(houseOutstanding)}
        </div>

      </div>

    </div>


    <!-- ======================================================
         QUICK ACTIONS
    ======================================================= -->

    <div class="grid quick-grid">

      <button class="card quick" onclick="go('meals')">
        <b>🍚 Daily Meals</b>
        <span class="muted">Record daily meal usage.</span>
      </button>

      <button class="card quick" onclick="go('expenses')">
        <b>◈ Meal Expenses</b>
        <span class="muted">Track food and grocery spending.</span>
      </button>

      <button class="card quick" onclick="go('payments')">
        <b>৳ Payments</b>
        <span class="muted">Track meal and house contributions.</span>
      </button>

    </div>

  `;

}




/* ============================================================
   MEMBER MANAGEMENT V3
============================================================ */


/* ==========================================================
   ADD MEMBER MODAL
========================================================== */

function openMemberModal() {

  modal(
    "Add House Member",
    `

      <form
        id="addMemberForm"
      >

        <div class="field">

          <label>
            NAME
          </label>

          <input
            id="memberName"
            type="text"
            required
            placeholder="e.g. Nabil"
          >

        </div>


        <div
          class="field"
          style="margin-top:12px"
        >

          <label>
            PHONE
          </label>

          <input
            id="memberPhone"
            type="text"
            placeholder="01XXXXXXXXX"
          >

        </div>


        <div
          class="field"
          style="margin-top:12px"
        >

          <label>
            ROOM / SEAT
          </label>

          <input
            id="memberRoom"
            type="text"
            placeholder="e.g. Room 3"
          >

        </div>


        <div class="actions">

          <button
            type="button"
            class="btn"
            onclick="closeModal()"
          >
            Cancel
          </button>


          <button
            type="submit"
            class="btn primary"
          >
            Add Member
          </button>

        </div>

      </form>

    `
  );


  document
    .getElementById(
      "addMemberForm"
    )
    ?.addEventListener(
      "submit",
      addMember
    );

}


/* ==========================================================
   ADD MEMBER
========================================================== */

function addMember(
  event
) {

  event.preventDefault();


  const name =
    document
      .getElementById(
        "memberName"
      )
      ?.value
      .trim();


  const phone =
    document
      .getElementById(
        "memberPhone"
      )
      ?.value
      .trim() ||
    "";


  const room =
    document
      .getElementById(
        "memberRoom"
      )
      ?.value
      .trim() ||
    "";


  if (!name) {

    toast(
      "Please enter member name."
    );

    return;

  }


  const database =
    AuroraDataStore.get();


  const duplicate =
    database.members.find(
      member =>
        member.name
          .trim()
          .toLowerCase() ===
        name
          .trim()
          .toLowerCase()
    );


  if (duplicate) {

    toast(
      "A member with this name already exists."
    );

    return;

  }


  database.members.push({

    id:
      uid("m"),

    name,

    phone,

    room,

    joined:
      todayISO(),

    status:
      "active",

    createdAt:
      new Date()
        .toISOString()

  });


  AuroraDataStore.save();


  closeModal();


  toast(
    `${name} added successfully.`
  );


  render();

}


/* ==========================================================
   EDIT MEMBER
========================================================== */

function editMember(
  id
) {

  const database =
    AuroraDataStore.get();


  const member =
    database.members.find(
      item =>
        item.id === id
    );


  if (!member) {
    return;
  }


  modal(
    "Edit House Member",
    `

      <form
        id="editMemberForm"
      >

        <div class="field">

          <label>
            NAME
          </label>

          <input
            id="editMemberName"
            type="text"
            value="${esc(
      member.name
    )}"
            required
          >

        </div>


        <div
          class="field"
          style="margin-top:12px"
        >

          <label>
            PHONE
          </label>

          <input
            id="editMemberPhone"
            type="text"
            value="${esc(
      member.phone
    )}"
          >

        </div>


        <div
          class="field"
          style="margin-top:12px"
        >

          <label>
            ROOM / SEAT
          </label>

          <input
            id="editMemberRoom"
            type="text"
            value="${esc(
      member.room
    )}"
          >

        </div>


        <div
          class="field"
          style="margin-top:12px"
        >

          <label>
            JOINING DATE
          </label>

          <input
            id="editMemberJoined"
            type="date"
            value="${esc(
      member.joined ||
      ""
    )}"
          >

        </div>


        <div class="actions">

          <button
            type="button"
            class="btn"
            onclick="closeModal()"
          >
            Cancel
          </button>


          <button
            type="submit"
            class="btn primary"
          >
            Save Changes
          </button>

        </div>

      </form>

    `
  );


  document
    .getElementById(
      "editMemberForm"
    )
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        const name =
          document
            .getElementById(
              "editMemberName"
            )
            ?.value
            .trim();


        if (!name) {

          toast(
            "Member name is required."
          );

          return;

        }


        member.name =
          name;


        member.phone =
          document
            .getElementById(
              "editMemberPhone"
            )
            ?.value
            .trim() ||
          "";


        member.room =
          document
            .getElementById(
              "editMemberRoom"
            )
            ?.value
            .trim() ||
          "";


        member.joined =
          document
            .getElementById(
              "editMemberJoined"
            )
            ?.value ||
          "";


        AuroraDataStore.save();


        closeModal();


        toast(
          "Member updated."
        );


        render();

      }
    );

}


/* ==========================================================
   TOGGLE MEMBER STATUS
========================================================== */

function toggleMemberStatus(
  id
) {

  const database =
    AuroraDataStore.get();


  const member =
    database.members.find(
      item =>
        item.id === id
    );


  if (!member) {
    return;
  }


  member.status =
    member.status === "active"
      ? "inactive"
      : "active";


  AuroraDataStore.save();


  toast(
    member.status === "active"
      ? "Member activated."
      : "Member deactivated."
  );


  render();

}


/* ==========================================================
   DELETE MEMBER
========================================================== */

function deleteMember(
  id
) {

  const database =
    AuroraDataStore.get();


  const member =
    database.members.find(
      item =>
        item.id === id
    );


  if (!member) {
    return;
  }


  const confirmed =
    confirm(
      `Delete ${member.name}?\n\n` +
      `Historical meal and payment records ` +
      `will remain in the database.`
    );


  if (!confirmed) {
    return;
  }


  /*
     We physically remove the member
     from the directory.

     Historical records are untouched.
  */

  database.members =
    database.members.filter(
      item =>
        item.id !== id
    );


  AuroraDataStore.save();


  toast(
    "Member deleted."
  );


  render();

}


/* ==========================================================
   MEMBER TABLE
========================================================== */

function renderMemberTable() {

  const members =
    AuroraDataStore.getMembers();


  if (!members.length) {

    return `

      <div class="empty">

        <div class="emoji">
          👥
        </div>

        <h3>
          No active members
        </h3>

      </div>

    `;

  }


  return `

    <div class="table-wrap">

      <table>

        <thead>

          <tr>

            <th>
              Member
            </th>

            <th>
              Meals
            </th>

            <th>
              Meal Due
            </th>

            <th>
              Paid
            </th>

            <th>
              Balance
            </th>

          </tr>

        </thead>


        <tbody>

          ${members
      .map(
        member => {

          const meals =
            AuroraMealAccount
              .memberMeals(
                member.id
              );


          const due =
            AuroraMealAccount
              .memberDue(
                member.id
              );


          const paid =
            AuroraMealAccount
              .memberPaid(
                member.id
              );


          const balance =
            AuroraMealAccount
              .memberBalance(
                member.id
              );


          return `

                    <tr>

                      <td>

                        <strong>
                          ${esc(
            member.name
          )}
                        </strong>

                      </td>


                      <td>
                        ${meals}
                      </td>


                      <td>
                        ${money(
            due
          )}
                      </td>


                      <td>
                        ${money(
            paid
          )}
                      </td>


                      <td
                        class="${balance >= 0
              ? "positive"
              : "negative"
            }"
                      >

                        ${balance >= 0
              ? "+"
              : ""
            }

                        ${money(
              balance
            )}

                      </td>

                    </tr>

                  `;

        }
      )
      .join("")
    }

        </tbody>

      </table>

    </div>

  `;

}


/* ==========================================================
   MEMBERS PAGE
========================================================== */

function renderMembers() {

  const page =
    document.getElementById(
      "page-members"
    );


  if (!page) {
    return;
  }


  const members =
    AuroraDataStore
      .getMembers(
        true
      );


  page.innerHTML = `

    <div class="section-head">

      <div>

        <h2>
          House Members
        </h2>

        <div class="muted">
          Manage house members and
          accounting identities.
        </div>

      </div>


      <button
        class="btn primary"
        onclick="openMemberModal()"
      >
        ＋ Add Member
      </button>

    </div>


    <div class="grid stats">

      ${card(
    "Total Members",
    members.length,
    "All registered members"
  )}


      ${card(
    "Active",
    members.filter(
      member =>
        member.status ===
        "active"
    ).length,
    "Currently active"
  )}


      ${card(
    "Inactive",
    members.filter(
      member =>
        member.status ===
        "inactive"
    ).length,
    "Not currently active"
  )}

    </div>


    <div class="card">

      ${members.length

      ?

      `

          <div class="table-wrap">

            <table>

              <thead>

                <tr>

                  <th>
                    Member
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Room
                  </th>

                  <th>
                    Joined
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                ${members
        .map(
          (member, index) => `

                        <tr>

                          <td>

                            <div
                              class="member-identity"
                            >

                              <div
                                class="avatar"
                              >

                                ${esc(
            member
              .name
              ?.charAt(
                0
              )
              .toUpperCase() ||
            "?"
          )}

                              </div>


                              <div>

                                <strong>
                                  ${esc(
            member.name
          )}
                                </strong>

                                <div
                                  class="muted"
                                >
                                  NODE-${String(
            index + 1
          ).padStart(
            3,
            "0"
          )}
                                </div>

                              </div>

                            </div>

                          </td>


                          <td>

                            ${esc(
            member.phone ||
            "—"
          )}

                          </td>


                          <td>

                            ${esc(
            member.room ||
            "—"
          )}

                          </td>


                          <td>

                            ${dateLabel(
            member.joined
          )}

                          </td>


                          <td>

                            <span
                              class="
                                member-status
                                ${member.status}
                              "
                            >

                              ●
                              ${member.status ===
              "active"
              ? "ACTIVE"
              : "INACTIVE"
            }

                            </span>

                          </td>


                          <td>

                            <div
                              class="member-actions"
                            >

                              <button
                                class="btn small"
                                onclick="
                                  editMember(
                                    '${member.id}'
                                  )
                                "
                              >
                                Edit
                              </button>


                              <button
                                class="btn small"
                                onclick="
                                  toggleMemberStatus(
                                    '${member.id}'
                                  )
                                "
                              >

                                ${member.status ===
              "active"
              ? "Disable"
              : "Activate"
            }

                              </button>


                              <button
                                class="
                                  btn
                                  small
                                  danger
                                "
                                onclick="
                                  deleteMember(
                                    '${member.id}'
                                  )
                                "
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>

                      `
        )
        .join("")
      }

              </tbody>

            </table>

          </div>

        `

      :

      `

          <div class="empty">

            <div class="emoji">
              👥
            </div>

            <h3>
              No members registered
            </h3>

            <p class="muted">
              Add your first house member.
            </p>


            <button
              class="btn primary"
              onclick="openMemberModal()"
            >
              ＋ Add Member
            </button>

          </div>

        `
    }

    </div>

  `;

}


/* ============================================================
   AURORA BACHELOR — MEAL SYSTEM V3
============================================================ */


/* ============================================================
   ADD / UPDATE MEAL DAY
============================================================ */

function openMealDayModal() {

  const members =
    AuroraDataStore.getMembers();


  if (!members.length) {

    toast(
      "Add at least one active member first."
    );

    return;

  }


  const today =
    todayISO();


  modal(
    "Add Meal Day",
    `

      <form
        id="mealDayForm"
      >

        <div class="field">

          <label>
            DATE
          </label>

          <input
            id="mealDayDate"
            type="date"
            value="${today}"
            required
          >

        </div>


        <div
          class="form-grid"
          style="margin-top:14px"
        >

          ${members
      .map(
        member => `

                  <div class="field">

                    <label>
                      ${esc(
          member.name
            .toUpperCase()
        )}
                    </label>

                    <input
                      id="mealValue-${member.id}"
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value="0"
                    >

                    <small class="muted">
                      0 = none ·
                      0.5 = half ·
                      1 = full
                    </small>

                  </div>

                `
      )
      .join("")
    }

        </div>


        <div class="actions">

          <button
            type="button"
            class="btn"
            onclick="closeModal()"
          >
            Cancel
          </button>


          <button
            type="submit"
            class="btn primary"
          >
            Save Meal Day
          </button>

        </div>

      </form>

    `
  );


  document
    .getElementById(
      "mealDayForm"
    )
    ?.addEventListener(
      "submit",
      addMealDay
    );

}


/* ============================================================
   SAVE MEAL DAY
============================================================ */

function addMealDay(
  event
) {

  event.preventDefault();


  const date =
    document.getElementById(
      "mealDayDate"
    )?.value;


  if (!date) {

    toast(
      "Please select a date."
    );

    return;

  }


  const currentMonth =
    AuroraApp.getCurrentMonth();


  /* Only allow selected month's date */

  if (
    !date.startsWith(
      `${currentMonth}-`
    )
  ) {

    toast(
      "Date must belong to the selected month."
    );

    return;

  }


  const account =
    AuroraMealAccount.data();


  const members =
    AuroraDataStore.getMembers();


  const values = {};


  members.forEach(
    member => {

      const input =
        document.getElementById(
          `mealValue-${member.id}`
        );


      let value =
        Number(
          input?.value || 0
        );


      if (
        !Number.isFinite(value)
      ) {

        value = 0;

      }


      if (
        value < 0
      ) {

        value = 0;

      }


      if (value < 0) {
        value = 0;
      }

      if (value > 10) {
        value = 10;
      }

      if (
        value < 0 ||
        value > 10
      ) {
        value = 0;
      }


      values[
        member.id
      ] = value;

    }
  );


  const existingIndex =
    account.meals.findIndex(
      meal =>
        meal.date === date
    );


  const record = {

    id:
      existingIndex >= 0
        ? account
          .meals[
          existingIndex
        ]
          .id
        : uid("meal"),

    date,

    values

  };


  if (
    existingIndex >= 0
  ) {

    account.meals[
      existingIndex
    ] = record;


    toast(
      "Meal day updated."
    );

  } else {

    account.meals.push(
      record
    );


    toast(
      "Meal day added."
    );

  }


  account.meals.sort(
    (a, b) =>
      b.date.localeCompare(
        a.date
      )
  );


  AuroraDataStore.save();


  closeModal();


  render();

}


/* ============================================================
   DELETE MEAL DAY
============================================================ */

function deleteMealDay(
  id
) {

  const account =
    AuroraMealAccount.data();


  const meal =
    account.meals.find(
      item =>
        item.id === id
    );


  if (!meal) {
    return;
  }


  const confirmed =
    confirm(
      `Delete meal record for ${dateLabel(
        meal.date
      )}?`
    );


  if (!confirmed) {
    return;
  }


  account.meals =
    account.meals.filter(
      item =>
        item.id !== id
    );


  AuroraDataStore.save();


  toast(
    "Meal day deleted."
  );


  render();

}


/* ============================================================
   EDIT MEAL DAY
============================================================ */

function editMealDay(
  id
) {

  const account =
    AuroraMealAccount.data();


  const meal =
    account.meals.find(
      item =>
        item.id === id
    );


  if (!meal) {
    return;
  }


  const members =
    AuroraDataStore.getMembers();


  modal(
    "Edit Meal Day",
    `

      <form
        id="editMealDayForm"
      >

        <div class="field">

          <label>
            DATE
          </label>

          <input
            id="editMealDayDate"
            type="date"
            value="${esc(
      meal.date
    )}"
            required
          >

        </div>


        <div
          class="form-grid"
          style="margin-top:14px"
        >

          ${members
      .map(
        member => `

                  <div class="field">

                    <label>
                      ${esc(
          member.name
            .toUpperCase()
        )}
                    </label>

                    <input
                      id="editMealValue-${member.id}"
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value="${Number(
          meal.values?.[
          member.id
          ] || 0
        )}"
                    >

                  </div>

                `
      )
      .join("")
    }

        </div>


        <div class="actions">

          <button
            type="button"
            class="btn"
            onclick="closeModal()"
          >
            Cancel
          </button>


          <button
            type="submit"
            class="btn primary"
          >
            Update Meal Day
          </button>

        </div>

      </form>

    `
  );


  document
    .getElementById(
      "editMealDayForm"
    )
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        const newDate =
          document.getElementById(
            "editMealDayDate"
          )?.value;


        if (!newDate) {

          toast(
            "Please select a date."
          );

          return;

        }


        if (
          !newDate.startsWith(
            `${AuroraApp.getCurrentMonth()}-`
          )
        ) {

          toast(
            "Date must belong to the selected month."
          );

          return;

        }


        const values = {};


        members.forEach(
          member => {

            let value =
              Number(
                document.getElementById(
                  `editMealValue-${member.id}`
                )?.value || 0
              );


            if (
              !Number.isFinite(value) ||
              value < 0 ||
              value > 10 ||
              (
                value !== 0 &&
                value !== 0.5 &&
                value !== 1 &&
                value !== 1.5 &&
                value !== 2 &&
                value !== 2.5 &&
                value !== 3 &&
                value !== 3.5 &&
                value !== 4 &&
                value !== 4.5 &&
                value !== 5 &&
                value !== 5.5 &&
                value !== 6 &&
                value !== 6.5 &&
                value !== 7 &&
                value !== 7.5 &&
                value !== 8 &&
                value !== 8.5 &&
                value !== 9 &&
                value !== 9.5 &&
                value !== 10
              )
            ) {

              value = 0;

            }


            values[
              member.id
            ] = value;

          }
        );


        const duplicate =
          account.meals.find(
            item =>
              item.date === newDate &&
              item.id !== id
          );


        if (duplicate) {

          toast(
            "A meal record already exists for this date."
          );

          return;

        }


        meal.date =
          newDate;


        meal.values =
          values;


        account.meals.sort(
          (a, b) =>
            b.date.localeCompare(
              a.date
            )
        );


        AuroraDataStore.save();


        closeModal();


        toast(
          "Meal day updated."
        );


        render();

      }
    );

}


/* ============================================================
   MEAL MATRIX SAVE
============================================================ */

function saveMealMatrix() {

  const inputs =
    document.querySelectorAll(
      ".meal-input"
    );


  if (!inputs.length) {

    toast(
      "No meal records to save."
    );

    return;

  }


  const account =
    AuroraMealAccount.data();


  inputs.forEach(
    input => {

      const index =
        Number(
          input.dataset.mealIndex
        );


      const memberId =
        input.dataset.memberId;


      const meal =
        account.meals[index];


      if (!meal) {
        return;
      }


      let value =
        Number(
          input.value || 0
        );


      if (
        !Number.isFinite(value)
      ) {

        value = 0;

      }


      if (value < 0) {
        value = 0;
      }

      if (value > 10) {
        value = 10;
      }

      if (
        value < 0 ||
        value > 10
      ) {
        value = 0;
      }


      if (!meal.values) {

        meal.values = {};

      }


      meal.values[
        memberId
      ] = value;

    }
  );


  AuroraDataStore.save();


  toast(
    "Meal matrix saved."
  );


  render();

}


/* ============================================================
   MEALS PAGE
============================================================ */

function renderMeals() {

  const page =
    document.getElementById(
      "page-meals"
    );


  if (!page) {
    return;
  }


  const account =
    AuroraMealAccount.data();


  const meals =
    [...account.meals]
      .sort(
        (a, b) =>
          b.date.localeCompare(
            a.date
          )
      );


  const members =
    AuroraDataStore.getMembers();


  const totalMeals =
    AuroraMealAccount.totalMeals();


  const totalExpense =
    AuroraMealAccount.totalExpense();


  const rate =
    AuroraMealAccount.mealRate();


  page.innerHTML = `

    <div class="section-head">

      <div>

        <h2>
          Meal Matrix
        </h2>


        <div class="muted">
          Record daily meals for every
          active house member.
        </div>

      </div>


      <button
        class="btn primary"
        onclick="openMealDayModal()"
      >
        ＋ ADD DAY
      </button>

    </div>


    <!-- =====================================================
         STATS
    ====================================================== -->

    <div class="grid stats">

      ${card(
    "Total Meals",
    totalMeals,
    "Current month"
  )}


      ${card(
    "Meal Expense",
    money(totalExpense),
    "Meal-related spending"
  )}


      ${card(
    "Meal Rate",
    money(rate),
    "Per meal"
  )}


      ${card(
    "Active Members",
    members.length,
    "House members"
  )}

    </div>


    <!-- =====================================================
         DAILY MEAL TABLE
    ====================================================== -->

    <div class="card">

      <div class="section-head">

        <div>

          <h2>
            Daily Meals
          </h2>


          <div class="muted">
            ${monthLabel(
    AuroraApp.getCurrentMonth()
  )}
          </div>

        </div>


        <button
          class="btn small"
          onclick="saveMealMatrix()"
        >
          ✓ SAVE
        </button>

      </div>


      ${meals.length

      ?

      `

          <div class="table-wrap">

            <table>

              <thead>

                <tr>

                  <th>
                    DATE
                  </th>


                  ${members
        .map(
          member => `

                          <th>
                            ${esc(
            member.name
          )}
                          </th>

                        `
        )
        .join("")
      }


                  <th>
                    TOTAL
                  </th>


                  <th>
                    ACTION
                  </th>

                </tr>

              </thead>


              <tbody>

                ${meals
        .map(
          (meal, index) => {

            const dayTotal =
              Object.values(
                meal.values ||
                {}
              )
                .reduce(
                  (
                    sum,
                    value
                  ) =>
                    sum +
                    Number(
                      value || 0
                    ),
                  0
                );


            return `

                          <tr>

                            <td>

                              <strong>
                                ${dateLabel(
              meal.date
            )}
                              </strong>

                            </td>


                            ${members
                .map(
                  member => `

                                    <td>

                                      <input
                                        class="meal-input"
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.5"
                                        value="${Number(
                    meal
                      .values?.[
                    member.id
                    ] || 0
                  )}"
                                        data-meal-index="${index}"
                                        data-member-id="${member.id}"
                                      >

                                    </td>

                                  `
                )
                .join("")
              }


                            <td>

                              <span
                                class="pill"
                              >
                                ${dayTotal}
                              </span>

                            </td>


                            <td>

                              <button
                                class="btn small"
                                onclick="
                                  editMealDay(
                                    '${meal.id}'
                                  )
                                "
                              >
                                Edit
                              </button>


                              <button
                                class="
                                  btn
                                  small
                                  danger
                                "
                                onclick="
                                  deleteMealDay(
                                    '${meal.id}'
                                  )
                                "
                              >
                                ×
                              </button>

                            </td>

                          </tr>

                        `;

          }
        )
        .join("")
      }

              </tbody>


              <tfoot>

                <tr>

                  <th>
                    TOTAL
                  </th>


                  ${members
        .map(
          member => {

            const total =
              AuroraMealAccount
                .memberMeals(
                  member.id
                );


            return `

                            <th>
                              ${total}
                            </th>

                          `;

          }
        )
        .join("")
      }


                  <th>
                    ${totalMeals}
                  </th>


                  <th></th>

                </tr>

              </tfoot>

            </table>

          </div>

        `

      :

      `

          <div class="empty">

            <div class="emoji">
              🍚
            </div>


            <h3>
              No meal records yet
            </h3>


            <p class="muted">
              Add your first meal day to
              calculate the monthly meal rate.
            </p>


            <button
              class="btn primary"
              onclick="openMealDayModal()"
            >
              ＋ Add First Day
            </button>

          </div>

        `
    }

    </div>

  `;

}


/* ============================================================
   AURORA BACHELOR — EXPENSE MANAGEMENT V3
============================================================ */


/* ============================================================
   EXPENSE MODAL
============================================================ */

function openExpenseModal() {

  const members =
    AuroraDataStore.getMembers();


  if (!members.length) {

    toast(
      "Add at least one active member first."
    );

    return;

  }


  modal(
    "Add Meal Expense",
    `

      <form
        id="expenseForm"
      >

        <div class="form-grid">

          <div class="field">

            <label>
              DATE
            </label>

            <input
              id="expenseDate"
              type="date"
              value="${todayISO()}"
              required
            >

          </div>


          <div class="field">

            <label>
              CATEGORY
            </label>

            <select
              id="expenseCategory"
              required
            >

              <option value="Food">
                Food
              </option>

              <option value="Grocery">
                Grocery
              </option>

              <option value="Gas">
                Gas
              </option>

              <option value="Cleaning">
                Cleaning
              </option>

              <option value="Maintenance">
                Maintenance
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          <div
            class="field"
            style="grid-column:1/-1"
          >

            <label>
              DESCRIPTION
            </label>

            <input
              id="expenseDescription"
              type="text"
              placeholder="e.g. Monthly grocery"
              required
            >

          </div>


          <div class="field">

            <label>
              AMOUNT
            </label>

            <input
              id="expenseAmount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            >

          </div>


          <div class="field">

            <label>
              PAID BY
            </label>

            <select
              id="expensePaidBy"
              required
            >

              ${members
      .map(
        member => `

                      <option
                        value="${member.id}"
                      >
                        ${esc(
          member.name
        )}
                      </option>

                    `
      )
      .join("")
    }

            </select>

          </div>

        </div>


        <div class="actions">

          <button
            type="button"
            class="btn"
            onclick="closeModal()"
          >
            Cancel
          </button>


          <button
            type="submit"
            class="btn primary"
          >
            Save Expense
          </button>

        </div>

      </form>

    `
  );


  document
    .getElementById(
      "expenseForm"
    )
    ?.addEventListener(
      "submit",
      saveExpense
    );

}


/* ============================================================
   SAVE EXPENSE
============================================================ */

function saveExpense(
  event
) {

  event.preventDefault();


  const date =
    document.getElementById(
      "expenseDate"
    )?.value;


  const category =
    document.getElementById(
      "expenseCategory"
    )?.value;


  const description =
    document
      .getElementById(
        "expenseDescription"
      )
      ?.value
      .trim();


  const amount =
    Number(
      document.getElementById(
        "expenseAmount"
      )?.value || 0
    );


  const paidBy =
    document.getElementById(
      "expensePaidBy"
    )?.value;


  if (!date) {

    toast(
      "Please select a date."
    );

    return;

  }


  if (
    !date.startsWith(
      `${AuroraApp.getCurrentMonth()}-`
    )
  ) {

    toast(
      "Date must belong to the selected month."
    );

    return;

  }


  if (!category) {

    toast(
      "Please select a category."
    );

    return;

  }


  if (!description) {

    toast(
      "Please enter a description."
    );

    return;

  }


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    toast(
      "Please enter a valid amount."
    );

    return;

  }


  if (!paidBy) {

    toast(
      "Please select who paid."
    );

    return;

  }


  AuroraExpenseAccount.add({

    date,

    category,

    description,

    amount,

    paidBy

  });


  closeModal();


  toast(
    "Expense recorded."
  );


  render();

}


/* ============================================================
   DELETE EXPENSE
============================================================ */

function deleteExpense(
  id
) {

  const expense =
    AuroraExpenseAccount.get(
      id
    );


  if (!expense) {

    return;

  }


  const confirmed =
    confirm(
      `Delete "${expense.description}"?`
    );


  if (!confirmed) {

    return;

  }


  AuroraExpenseAccount.remove(
    id
  );


  toast(
    "Expense deleted."
  );


  render();

}


/* ============================================================
   EXPENSE SUMMARY BAR
============================================================ */

function renderExpenseSummary() {

  const total =
    AuroraExpenseAccount.total();


  const mealTotal =
    AuroraExpenseAccount.mealTotal();


  const categories =
    AuroraExpenseAccount.categories();


  const categoryCount =
    Object.keys(
      categories
    ).length;


  return `

    <div class="grid stats">

      ${card(
    "Total Expenses",
    money(total),
    "Current month"
  )}


      ${card(
    "Meal Expenses",
    money(mealTotal),
    "Food + grocery + gas"
  )}


      ${card(
    "Transactions",
    AuroraExpenseAccount
      .data().length,
    "Expense records"
  )}


      ${card(
    "Categories",
    categoryCount,
    "Used categories"
  )}

    </div>

  `;

}


/* ============================================================
   EXPENSE PAGE
============================================================ */

function renderExpenses() {

  const page =
    document.getElementById(
      "page-expenses"
    );


  if (!page) {

    return;

  }


  const rows =
    [...AuroraExpenseAccount.data()]
      .sort(
        (a, b) =>
          String(b.date)
            .localeCompare(
              String(a.date)
            )
      );


  const members =
    AuroraDataStore.getMembers(
      true
    );


  page.innerHTML = `

    <div class="section-head">

      <div>

        <h2>
          Expense Ledger
        </h2>


        <div class="muted">
          Track monthly food and
          meal-account expenses.
        </div>

      </div>


      <button
        class="btn primary"
        onclick="openExpenseModal()"
      >
        ＋ ADD EXPENSE
      </button>

    </div>


    ${renderExpenseSummary()}


    <div class="card">

      <div class="section-head">

        <div>

          <h2>
            Expense Records
          </h2>


          <div class="muted">
            ${monthLabel(
    AuroraApp.getCurrentMonth()
  )}
          </div>

        </div>

      </div>


      ${rows.length

      ?

      `

          <div class="table-wrap">

            <table>

              <thead>

                <tr>

                  <th>
                    DATE
                  </th>

                  <th>
                    CATEGORY
                  </th>

                  <th>
                    DESCRIPTION
                  </th>

                  <th>
                    PAID BY
                  </th>

                  <th>
                    AMOUNT
                  </th>

                  <th>
                    ACTION
                  </th>

                </tr>

              </thead>


              <tbody>

                ${rows
        .map(
          expense => {

            const member =
              members.find(
                item =>
                  item.id ===
                  expense.paidBy
              );


            return `

                          <tr>

                            <td>
                              ${dateLabel(
              expense.date
            )}
                            </td>


                            <td>

                              <span
                                class="pill"
                              >
                                ${esc(
              expense.category
            )}
                              </span>

                            </td>


                            <td>
                              ${esc(
              expense.description
            )}
                            </td>


                            <td>
                              ${esc(
              member?.name ||
              "Unknown"
            )}
                            </td>


                            <td
                              class="expense-amount"
                            >
                              ${money(
              expense.amount
            )}
                            </td>


                            <td>

                              <button
                                class="
                                  btn
                                  small
                                  danger
                                "
                                onclick="
                                  deleteExpense(
                                    '${expense.id}'
                                  )
                                "
                              >
                                Delete
                              </button>

                            </td>

                          </tr>

                        `;

          }
        )
        .join("")
      }

              </tbody>


              <tfoot>

                <tr>

                  <th
                    colspan="4"
                  >
                    TOTAL
                  </th>


                  <th>
                    ${money(
        AuroraExpenseAccount.total()
      )}
                  </th>


                  <th></th>

                </tr>

              </tfoot>

            </table>

          </div>

        `

      :

      `

          <div class="empty">

            <div class="emoji">
              💸
            </div>


            <h3>
              No expenses recorded
            </h3>


            <p class="muted">
              Add your first meal expense
              to start calculating the meal rate.
            </p>


            <button
              class="btn primary"
              onclick="openExpenseModal()"
            >
              ＋ ADD FIRST EXPENSE
            </button>

          </div>

        `
    }

    </div>

  `;

}


/* ============================================================
   AURORA BACHELOR — PAYMENT MANAGEMENT V3
============================================================ */


/* ============================================================
   PAYMENT MODAL
============================================================ */

function openPaymentModal() {

  const members =
    AuroraDataStore.getMembers();


  if (!members.length) {

    toast(
      "Add at least one active member first."
    );

    return;

  }


  modal(
    "Record Payment",
    `

      <form
        id="paymentForm"
      >

        <div class="form-grid">

          <div class="field">

            <label>
              DATE
            </label>

            <input
              id="paymentDate"
              type="date"
              value="${todayISO()}"
              required
            >

          </div>


          <div class="field">

            <label>
              MEMBER
            </label>

            <select
              id="paymentMember"
              required
            >

              ${members
      .map(
        member => `

                      <option
                        value="${member.id}"
                      >
                        ${esc(
          member.name
        )}
                      </option>

                    `
      )
      .join("")
    }

            </select>

          </div>


          <div class="field">

            <label>
              ACCOUNT
            </label>

            <select
              id="paymentAccount"
              required
            >

              <option value="meal">
                🍚 Meal Account
              </option>

              <option value="house">
                🏠 House Account
              </option>

            </select>

          </div>


          <div class="field">

            <label>
              AMOUNT
            </label>

            <input
              id="paymentAmount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            >

          </div>


          <div class="field">

            <label>
              METHOD
            </label>

            <select
              id="paymentMethod"
              required
            >

              <option value="Cash">
                Cash
              </option>

              <option value="bKash">
                bKash
              </option>

              <option value="Nagad">
                Nagad
              </option>

              <option value="Bank">
                Bank
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          <div class="field">

            <label>
              REFERENCE
            </label>

            <input
              id="paymentReference"
              type="text"
              placeholder="Optional transaction ID"
            >

          </div>


          <div
            class="field"
            style="grid-column:1/-1"
          >

            <label>
              NOTE
            </label>

            <input
              id="paymentNote"
              type="text"
              placeholder="Optional note"
            >

          </div>

        </div>


        <div class="actions">

          <button
            type="button"
            class="btn"
            onclick="closeModal()"
          >
            Cancel
          </button>


          <button
            type="submit"
            class="btn primary"
          >
            Record Payment
          </button>

        </div>

      </form>

    `
  );


  document
    .getElementById(
      "paymentForm"
    )
    ?.addEventListener(
      "submit",
      savePayment
    );

}


/* ============================================================
   SAVE PAYMENT
============================================================ */

function savePayment(
  event
) {

  event.preventDefault();


  const date =
    document.getElementById(
      "paymentDate"
    )?.value;


  const memberId =
    document.getElementById(
      "paymentMember"
    )?.value;


  const account =
    document.getElementById(
      "paymentAccount"
    )?.value;


  const amount =
    Number(
      document.getElementById(
        "paymentAmount"
      )?.value || 0
    );


  const method =
    document.getElementById(
      "paymentMethod"
    )?.value ||
    "Cash";


  const reference =
    document
      .getElementById(
        "paymentReference"
      )
      ?.value
      .trim() ||
    "";


  const note =
    document
      .getElementById(
        "paymentNote"
      )
      ?.value
      .trim() ||
    "";


  if (!date) {

    toast(
      "Please select a date."
    );

    return;

  }


  if (
    !date.startsWith(
      `${AuroraApp.getCurrentMonth()}-`
    )
  ) {

    toast(
      "Date must belong to the selected month."
    );

    return;

  }


  if (!memberId) {

    toast(
      "Please select a member."
    );

    return;

  }


  if (
    account !== "meal" &&
    account !== "house"
  ) {

    toast(
      "Invalid payment account."
    );

    return;

  }


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    toast(
      "Please enter a valid amount."
    );

    return;

  }


  AuroraPaymentAccount.add(

    {

      date,

      memberId,

      amount,

      method,

      reference,

      note

    },

    account

  );


  closeModal();


  toast(
    "Payment recorded."
  );


  render();

}


/* ============================================================
   DELETE PAYMENT
============================================================ */

function deletePayment(
  id
) {

  const payment =
    AuroraPaymentAccount.get(
      id
    );


  if (!payment) {

    return;

  }


  const confirmed =
    confirm(
      `Delete this payment?\n\n` +
      `${money(
        payment.amount
      )}`
    );


  if (!confirmed) {

    return;

  }


  AuroraPaymentAccount.remove(
    id
  );


  toast(
    "Payment deleted."
  );


  render();

}


/* ============================================================
   PAYMENT SUMMARY
============================================================ */

function renderPaymentSummary() {

  const all =
    AuroraPaymentAccount.total();


  const meal =
    AuroraPaymentAccount
      .totalByAccount(
        "meal"
      );


  const house =
    AuroraPaymentAccount
      .totalByAccount(
        "house"
      );


  const count =
    AuroraPaymentAccount
      .data()
      .length;


  return `

    <div class="grid stats">

      ${card(
    "Total Paid",
    money(all),
    "All accounts"
  )}


      ${card(
    "Meal Payments",
    money(meal),
    "Meal account"
  )}


      ${card(
    "House Payments",
    money(house),
    "House account"
  )}


      ${card(
    "Transactions",
    count,
    "Current month"
  )}

    </div>

  `;

}


/* ============================================================
   PAYMENT PAGE
============================================================ */

function renderPayments() {

  const page =
    document.getElementById(
      "page-payments"
    );


  if (!page) {

    return;

  }


  const payments =
    [...AuroraPaymentAccount.data()]
      .sort(
        (a, b) =>
          String(b.date)
            .localeCompare(
              String(a.date)
            )
      );


  const members =
    AuroraDataStore.getMembers(
      true
    );


  page.innerHTML = `

    <div class="section-head">

      <div>

        <h2>
          Payment Ledger
        </h2>


        <div class="muted">
          Track member contributions
          across meal and house accounts.
        </div>

      </div>


      <button
        class="btn primary"
        onclick="openPaymentModal()"
      >
        ＋ RECORD PAYMENT
      </button>

    </div>


    ${renderPaymentSummary()}


    <div class="card">

      <div class="section-head">

        <div>

          <h2>
            Payment Records
          </h2>


          <div class="muted">
            ${monthLabel(
    AuroraApp.getCurrentMonth()
  )}
          </div>

        </div>

      </div>


      ${payments.length

      ?

      `

          <div class="table-wrap">

            <table>

              <thead>

                <tr>

                  <th>
                    DATE
                  </th>

                  <th>
                    MEMBER
                  </th>

                  <th>
                    ACCOUNT
                  </th>

                  <th>
                    METHOD
                  </th>

                  <th>
                    REFERENCE
                  </th>

                  <th>
                    NOTE
                  </th>

                  <th>
                    AMOUNT
                  </th>

                  <th>
                    ACTION
                  </th>

                </tr>

              </thead>


              <tbody>

                ${payments
        .map(
          payment => {

            const member =
              members.find(
                item =>
                  item.id ===
                  payment.memberId
              );


            const accountLabel =
              payment.account ===
                "meal"

                ? "🍚 MEAL"

                : "🏠 HOUSE";


            return `

                          <tr>

                            <td>
                              ${dateLabel(
              payment.date
            )}
                            </td>


                            <td>

                              <strong>
                                ${esc(
              member?.name ||
              "Unknown"
            )}
                              </strong>

                            </td>


                            <td>

                              <span
                                class="
                                  payment-account
                                  ${payment.account}
                                "
                              >

                                ${accountLabel}

                              </span>

                            </td>


                            <td>
                              ${esc(
              payment.method ||
              "—"
            )}
                            </td>


                            <td>
                              ${esc(
              payment.reference ||
              "—"
            )}
                            </td>


                            <td>
                              ${esc(
              payment.note ||
              "—"
            )}
                            </td>


                            <td
                              class="positive"
                            >

                              +${money(
              payment.amount
            )}

                            </td>


                            <td>

                              <button
                                class="
                                  btn
                                  small
                                  danger
                                "
                                onclick="
                                  deletePayment(
                                    '${payment.id}'
                                  )
                                "
                              >
                                Delete
                              </button>

                            </td>

                          </tr>

                        `;

          }
        )
        .join("")
      }

              </tbody>


              <tfoot>

                <tr>

                  <th
                    colspan="6"
                  >
                    TOTAL
                  </th>


                  <th>
                    ${money(
        AuroraPaymentAccount
          .total()
      )}
                  </th>


                  <th></th>

                </tr>

              </tfoot>

            </table>

          </div>

        `

      :

      `

          <div class="empty">

            <div class="emoji">
              💳
            </div>


            <h3>
              No payments recorded
            </h3>


            <p class="muted">
              Record the first member
              contribution.
            </p>


            <button
              class="btn primary"
              onclick="openPaymentModal()"
            >
              ＋ RECORD FIRST PAYMENT
            </button>

          </div>

        `
    }

    </div>

  `;

}


/* ============================================================
   MEMBER PAYMENT LEDGER
============================================================ */

function getMemberPaymentSummary(
  memberId
) {

  const payments =
    AuroraPaymentAccount
      .memberPayments(
        memberId
      );


  const meal =
    payments
      .filter(
        payment =>
          payment.account ===
          "meal"
      )
      .reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.amount || 0
          ),
        0
      );


  const house =
    payments
      .filter(
        payment =>
          payment.account ===
          "house"
      )
      .reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.amount || 0
          ),
        0
      );


  return {

    meal,

    house,

    total:
      meal +
      house,

    transactions:
      payments.length

  };

}



/* ============================================================
   AURORA BACHELOR — HOUSE BILLS & RENT V3
============================================================ */


/* ============================================================
   BILL MODAL
============================================================ */

function openBillModal() {

  modal(
    "Add House Bill",
    `

      <form
        id="billForm"
      >

        <div class="form-grid">

          <div class="field">

            <label>
              DATE
            </label>

            <input
              id="billDate"
              type="date"
              value="${todayISO()}"
              required
            >

          </div>


          <div class="field">

            <label>
              CATEGORY
            </label>

            <select
              id="billCategory"
              required
            >

              <option value="Electricity">
                Electricity
              </option>

              <option value="Gas">
                Gas
              </option>

              <option value="Water">
                Water
              </option>

              <option value="Internet">
                Internet
              </option>

              <option value="Maintenance">
                Maintenance
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          <div
            class="field"
            style="grid-column:1/-1"
          >

            <label>
              DESCRIPTION
            </label>

            <input
              id="billDescription"
              type="text"
              placeholder="e.g. August electricity bill"
              required
            >

          </div>


          <div
            class="field"
            style="grid-column:1/-1"
          >

            <label>
              AMOUNT
            </label>

            <input
              id="billAmount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            >

          </div>

        </div>


        <div class="actions">

          <button
            type="button"
            class="btn"
            onclick="closeModal()"
          >
            Cancel
          </button>


          <button
            type="submit"
            class="btn primary"
          >
            Save Bill
          </button>

        </div>

      </form>

    `
  );


  document
    .getElementById(
      "billForm"
    )
    ?.addEventListener(
      "submit",
      saveBill
    );

}


/* ============================================================
   SAVE BILL
============================================================ */

function saveBill(
  event
) {

  event.preventDefault();


  const date =
    document.getElementById(
      "billDate"
    )?.value;


  const category =
    document.getElementById(
      "billCategory"
    )?.value;


  const description =
    document
      .getElementById(
        "billDescription"
      )
      ?.value
      .trim();


  const amount =
    Number(
      document.getElementById(
        "billAmount"
      )?.value || 0
    );


  if (!date) {

    toast(
      "Please select a date."
    );

    return;

  }


  if (
    !date.startsWith(
      `${AuroraApp.getCurrentMonth()}-`
    )
  ) {

    toast(
      "Date must belong to the selected month."
    );

    return;

  }


  if (!category) {

    toast(
      "Please select a category."
    );

    return;

  }


  if (!description) {

    toast(
      "Please enter a description."
    );

    return;

  }


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    toast(
      "Please enter a valid amount."
    );

    return;

  }


  AuroraBillAccount.add({

    date,

    category,

    description,

    amount

  });


  closeModal();


  toast(
    "House bill added."
  );


  render();

}


/* ============================================================
   DELETE BILL
============================================================ */

function deleteBill(
  id
) {

  const bill =
    AuroraBillAccount.get(
      id
    );


  if (!bill) {

    return;

  }


  const confirmed =
    confirm(
      `Delete "${bill.description}"?\n\n` +
      `${money(
        bill.amount
      )}`
    );


  if (!confirmed) {

    return;

  }


  AuroraBillAccount.remove(
    id
  );


  toast(
    "House bill deleted."
  );


  render();

}


/* ============================================================
   RENT MODAL
============================================================ */

function openRentModal() {

  modal(
    "Add House Rent",
    `

      <form
        id="rentForm"
      >

        <div class="form-grid">

          <div class="field">

            <label>
              DATE
            </label>

            <input
              id="rentDate"
              type="date"
              value="${todayISO()}"
              required
            >

          </div>


          <div class="field">

            <label>
              AMOUNT
            </label>

            <input
              id="rentAmount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            >

          </div>


          <div
            class="field"
            style="grid-column:1/-1"
          >

            <label>
              DESCRIPTION
            </label>

            <input
              id="rentDescription"
              type="text"
              value="House Rent"
              required
            >

          </div>

        </div>


        <div class="actions">

          <button
            type="button"
            class="btn"
            onclick="closeModal()"
          >
            Cancel
          </button>


          <button
            type="submit"
            class="btn primary"
          >
            Save Rent
          </button>

        </div>

      </form>

    `
  );


  document
    .getElementById(
      "rentForm"
    )
    ?.addEventListener(
      "submit",
      saveRent
    );

}


/* ============================================================
   SAVE RENT
============================================================ */

function saveRent(
  event
) {

  event.preventDefault();


  const date =
    document.getElementById(
      "rentDate"
    )?.value;


  const amount =
    Number(
      document.getElementById(
        "rentAmount"
      )?.value || 0
    );


  const description =
    document
      .getElementById(
        "rentDescription"
      )
      ?.value
      .trim();


  if (!date) {

    toast(
      "Please select a date."
    );

    return;

  }


  if (
    !date.startsWith(
      `${AuroraApp.getCurrentMonth()}-`
    )
  ) {

    toast(
      "Date must belong to the selected month."
    );

    return;

  }


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    toast(
      "Please enter a valid amount."
    );

    return;

  }


  AuroraHouseAccount.addRent({

    date,

    description:
      description ||
      "House Rent",

    amount

  });


  closeModal();


  toast(
    "House rent added."
  );


  render();

}


/* ============================================================
   DELETE RENT
============================================================ */

function deleteRent(
  id
) {

  const currentMonth =
    AuroraHouseAccount.data();


  const rent =
    currentMonth
      .rent
      .find(
        item =>
          item.id === id
      );


  if (!rent) {

    return;

  }


  const confirmed =
    confirm(
      `Delete rent record?\n\n` +
      `${money(
        rent.amount
      )}`
    );


  if (!confirmed) {

    return;

  }


  AuroraHouseAccount.removeRent(
    id
  );


  toast(
    "Rent record deleted."
  );


  render();

}


/* ============================================================
   HOUSE FINANCE SUMMARY
============================================================ */

function renderHouseSummary() {

  const rent =
    AuroraHouseAccount.totalRent();


  const bills =
    AuroraHouseAccount.totalBills();


  const total =
    AuroraHouseAccount.totalCost();


  const paid =
    AuroraHouseAccount.totalPaid();


  const outstanding =
    AuroraHouseAccount.outstanding();


  return `

    <div class="grid stats">

      ${card(
    "House Cost",
    money(total),
    "Rent + bills"
  )}


      ${card(
    "Rent",
    money(rent),
    "Current month"
  )}


      ${card(
    "Bills",
    money(bills),
    "Utilities + maintenance"
  )}


      ${card(
    "Outstanding",
    money(outstanding),
    "House balance"
  )}

    </div>

  `;

}


/* ============================================================
   HOUSE BILLS PAGE
============================================================ */

function renderBills() {

  const page =
    document.getElementById(
      "page-bills"
    );


  if (!page) {

    return;

  }


  const account =
    AuroraHouseAccount.data();


  const bills =
    [...account.bills]
      .sort(
        (a, b) =>
          String(b.date)
            .localeCompare(
              String(a.date)
            )
      );


  const rents =
    [...account.rent]
      .sort(
        (a, b) =>
          String(b.date)
            .localeCompare(
              String(a.date)
            )
      );


  page.innerHTML = `

    <div class="section-head">

      <div>

        <h2>
          House Finance
        </h2>


        <div class="muted">
          Manage rent, utilities and
          house-related costs separately
          from the meal account.
        </div>

      </div>


      <div
        style="
          display:flex;
          gap:8px;
          flex-wrap:wrap;
        "
      >

        <button
          class="btn primary"
          onclick="openRentModal()"
        >
          ＋ ADD RENT
        </button>


        <button
          class="btn"
          onclick="openBillModal()"
        >
          ＋ ADD BILL
        </button>

      </div>

    </div>


    ${renderHouseSummary()}


    <!-- =====================================================
         RENT
    ====================================================== -->

    <div class="card">

      <div class="section-head">

        <div>

          <h2>
            House Rent
          </h2>


          <div class="muted">
            ${monthLabel(
    AuroraApp.getCurrentMonth()
  )}
          </div>

        </div>

      </div>


      ${rents.length

      ?

      `

          <div class="table-wrap">

            <table>

              <thead>

                <tr>

                  <th>
                    DATE
                  </th>

                  <th>
                    DESCRIPTION
                  </th>

                  <th>
                    AMOUNT
                  </th>

                  <th>
                    ACTION
                  </th>

                </tr>

              </thead>


              <tbody>

                ${rents
        .map(
          rent => `

                        <tr>

                          <td>
                            ${dateLabel(
            rent.date
          )}
                          </td>


                          <td>
                            ${esc(
            rent.description ||
            "House Rent"
          )}
                          </td>


                          <td>
                            ${money(
            rent.amount
          )}
                          </td>


                          <td>

                            <button
                              class="
                                btn
                                small
                                danger
                              "
                              onclick="
                                deleteRent(
                                  '${rent.id}'
                                )
                              "
                            >
                              Delete
                            </button>

                          </td>

                        </tr>

                      `
        )
        .join("")
      }

              </tbody>


              <tfoot>

                <tr>

                  <th
                    colspan="2"
                  >
                    TOTAL RENT
                  </th>


                  <th>
                    ${money(
        AuroraHouseAccount
          .totalRent()
      )}
                  </th>


                  <th></th>

                </tr>

              </tfoot>

            </table>

          </div>

        `

      :

      `

          <div class="empty">

            <div class="emoji">
              🏠
            </div>


            <h3>
              No rent records
            </h3>


            <p class="muted">
              Add the monthly house rent.
            </p>


            <button
              class="btn primary"
              onclick="openRentModal()"
            >
              ＋ ADD RENT
            </button>

          </div>

        `
    }

    </div>


    <!-- =====================================================
         BILLS
    ====================================================== -->

    <div class="card">

      <div class="section-head">

        <div>

          <h2>
            House Bills
          </h2>


          <div class="muted">
            Electricity, gas, water,
            internet and maintenance.
          </div>

        </div>

      </div>


      ${bills.length

      ?

      `

          <div class="table-wrap">

            <table>

              <thead>

                <tr>

                  <th>
                    DATE
                  </th>

                  <th>
                    CATEGORY
                  </th>

                  <th>
                    DESCRIPTION
                  </th>

                  <th>
                    AMOUNT
                  </th>

                  <th>
                    ACTION
                  </th>

                </tr>

              </thead>


              <tbody>

                ${bills
        .map(
          bill => `

                        <tr>

                          <td>
                            ${dateLabel(
            bill.date
          )}
                          </td>


                          <td>

                            <span
                              class="pill"
                            >
                              ${esc(
            bill.category
          )}
                            </span>

                          </td>


                          <td>
                            ${esc(
            bill.description
          )}
                          </td>


                          <td>
                            ${money(
            bill.amount
          )}
                          </td>


                          <td>

                            <button
                              class="
                                btn
                                small
                                danger
                              "
                              onclick="
                                deleteBill(
                                  '${bill.id}'
                                )
                              "
                            >
                              Delete
                            </button>

                          </td>

                        </tr>

                      `
        )
        .join("")
      }

              </tbody>


              <tfoot>

                <tr>

                  <th
                    colspan="3"
                  >
                    TOTAL BILLS
                  </th>


                  <th>
                    ${money(
        AuroraHouseAccount
          .totalBills()
      )}
                  </th>


                  <th></th>

                </tr>

              </tfoot>

            </table>

          </div>

        `

      :

      `

          <div class="empty">

            <div class="emoji">
              📄
            </div>


            <h3>
              No house bills recorded
            </h3>


            <p class="muted">
              Add electricity, gas,
              water or other bills.
            </p>


            <button
              class="btn"
              onclick="openBillModal()"
            >
              ＋ ADD BILL
            </button>

          </div>

        `
    }

    </div>

  `;

}



/* ============================================================
   AURORA BACHELOR — REPORTS V3
============================================================ */


/* ============================================================
   REPORT CALCULATION
============================================================ */

/* ============================================================
   MONTHLY REPORT DATA — CENTRAL ENGINE
============================================================ */

function getMonthlyReportData() {

  const summary =
    AuroraAccounting.summary();


  return {

    members:
      summary.members,

    totalMeals:
      summary.totalMeals,

    mealExpense:
      summary.mealExpense,

    mealRate:
      summary.mealRate,

    rent:
      summary.rent,

    bills:
      summary.bills,

    houseCost:
      summary.houseCost,

    totalExpense:
      summary.totalCost,

    totalPaid:
      summary.totalPayments,

    outstanding:
      summary.outstanding

  };

}

/* ============================================================
   REPORT PAGE
============================================================ */

function renderReports() {

  const page =
    document.getElementById(
      "page-reports"
    );


  if (!page) {
    return;
  }


  const report =
    getMonthlyReportData();


  page.innerHTML = `

    <div class="section-head">

      <div>

        <h2>
          Monthly Report
        </h2>


        <div class="muted">
          Complete financial and meal
          summary for
          ${monthLabel(
    AuroraApp.getCurrentMonth()
  )}.
        </div>

      </div>


      <button
        class="btn"
        onclick="window.print()"
      >
        PRINT REPORT
      </button>

    </div>


    <!-- =====================================================
         SUMMARY
    ====================================================== -->

    <div class="grid stats">

      ${card(
    "Total Meals",
    report.totalMeals,
    "Current month"
  )}


      ${card(
    "Meal Expense",
    money(report.mealExpense),
    "Food account"
  )}


      ${card(
    "Meal Rate",
    money(report.mealRate),
    "Per meal"
  )}


      ${card(
    "House Cost",
    money(report.houseCost),
    "Rent + bills"
  )}

    </div>


    <div class="grid stats">

      ${card(
    "Total Expense",
    money(report.totalExpense),
    "Meal + house"
  )}


      ${card(
    "Total Paid",
    money(report.totalPaid),
    "All payments"
  )}


      ${card(
    "Outstanding",
    money(report.outstanding),
    "Remaining amount"
  )}


      ${card(
    "Members",
    report.members.length,
    "Active members"
  )}

    </div>


    <!-- =====================================================
         ACCOUNT BREAKDOWN
    ====================================================== -->

    <div class="grid two-col">

      <div class="card">

        <div class="section-head">

          <div>

            <h2>
              Meal Account
            </h2>

            <div class="muted">
              Monthly meal calculation.
            </div>

          </div>

        </div>


        <div class="bar-list">

          <div class="bar-row">

            <span>
              Meals
            </span>

            <strong>
              ${report.totalMeals}
            </strong>

          </div>


          <div class="bar-row">

            <span>
              Meal Expense
            </span>

            <strong>
              ${money(
    report.mealExpense
  )}
            </strong>

          </div>


          <div class="bar-row">

            <span>
              Meal Rate
            </span>

            <strong>
              ${money(
    report.mealRate
  )}
            </strong>

          </div>


          <div class="bar-row">

            <span>
              Meal Payments
            </span>

            <strong>
              ${money(
    AuroraPaymentAccount
      .totalByAccount(
        "meal"
      )
  )}
            </strong>

          </div>

        </div>

      </div>


      <div class="card">

        <div class="section-head">

          <div>

            <h2>
              House Account
            </h2>

            <div class="muted">
              Rent, bills and house payments.
            </div>

          </div>

        </div>


        <div class="bar-list">

          <div class="bar-row">

            <span>
              Rent
            </span>

            <strong>
              ${money(
    report.rent
  )}
            </strong>

          </div>


          <div class="bar-row">

            <span>
              Bills
            </span>

            <strong>
              ${money(
    report.bills
  )}
            </strong>

          </div>


          <div class="bar-row">

            <span>
              House Cost
            </span>

            <strong>
              ${money(
    report.houseCost
  )}
            </strong>

          </div>


          <div class="bar-row">

            <span>
              House Payments
            </span>

            <strong>
              ${money(
    AuroraPaymentAccount
      .totalByAccount(
        "house"
      )
  )}
            </strong>

          </div>

        </div>

      </div>

    </div>


    <!-- =====================================================
         MEMBER REPORT
    ====================================================== -->

    <div class="card">

      <div class="section-head">

        <div>

          <h2>
            Member Financial Report
          </h2>

          <div class="muted">
            Meal + house responsibility
            for each active member.
          </div>

        </div>

      </div>


      <div class="table-wrap">

        <table>

          <thead>

            <tr>

              <th>
                MEMBER
              </th>

              <th>
                MEALS
              </th>

              <th>
                MEAL DUE
              </th>

              <th>
                HOUSE SHARE
              </th>

              <th>
                TOTAL DUE
              </th>

              <th>
                TOTAL PAID
              </th>

              <th>
                BALANCE
              </th>

            </tr>

          </thead>


          <tbody>

            ${report.members
      .map(
        member => `

                    <tr>

                      <td>
                        <strong>
                          ${esc(
          member.name
        )}
                        </strong>
                      </td>


                      <td>
                        ${member.meals}
                      </td>


                      <td>
                        ${money(
          member.mealDue
        )}
                      </td>


                      <td>
                        ${money(
          member.houseShare
        )}
                      </td>


                      <td>
                        ${money(
          member.totalDue
        )}
                      </td>


                      <td>
                        ${money(
          member.totalPaid
        )}
                      </td>


                      <td
                        class="${member.balance >= 0
            ? "positive"
            : "negative"
          }"
                      >

                        ${member.balance >= 0
            ? "+"
            : ""
          }

                        ${money(
            member.balance
          )}

                      </td>

                    </tr>

                  `
      )
      .join("")
    }

          </tbody>

        </table>

      </div>

    </div>

  `;

}


/* ============================================================
   SETTLEMENT V3
============================================================ */


/* ============================================================
   SETTLEMENT DATA
============================================================ */
/* ============================================================
   SETTLEMENT DATA — CENTRAL ENGINE
============================================================ */

function getSettlementData() {

  return AuroraAccounting
    .members()
    .map(
      member => ({

        id:
          member.id,

        name:
          member.name,

        totalDue:
          member.totalDue,

        totalPaid:
          member.totalPaid,

        balance:
          member.balance

      })
    );

}


/* ============================================================
   SETTLEMENT PAGE
============================================================ */

function renderSettlement() {

  const page =
    document.getElementById(
      "page-settlement"
    );


  if (!page) {
    return;
  }


  const members =
    getSettlementData();


  const creditors =
    members
      .filter(
        member =>
          member.settlement >
          0.01
      )
      .map(
        member => ({

          name:
            member.name,

          amount:
            member.settlement

        })
      )
      .sort(
        (a, b) =>
          b.amount -
          a.amount
      );


  const debtors =
    members
      .filter(
        member =>
          member.settlement <
          -0.01
      )
      .map(
        member => ({

          name:
            member.name,

          amount:
            Math.abs(
              member.settlement
            )

        })
      )
      .sort(
        (a, b) =>
          b.amount -
          a.amount
      );


  const transfers = [];


  let creditorIndex = 0;

  let debtorIndex = 0;


  while (
    creditorIndex <
    creditors.length &&
    debtorIndex <
    debtors.length
  ) {

    const creditor =
      creditors[
      creditorIndex
      ];


    const debtor =
      debtors[
      debtorIndex
      ];


    const amount =
      Math.min(
        creditor.amount,
        debtor.amount
      );


    transfers.push({

      from:
        debtor.name,

      to:
        creditor.name,

      amount

    });


    creditor.amount -=
      amount;


    debtor.amount -=
      amount;


    if (
      creditor.amount <
      0.01
    ) {

      creditorIndex++;

    }


    if (
      debtor.amount <
      0.01
    ) {

      debtorIndex++;

    }

  }


  page.innerHTML = `

    <div class="section-head">

      <div>

        <h2>
          Settlement
        </h2>


        <div class="muted">
          Suggested transfers to settle
          the current month's balances.
        </div>

      </div>

    </div>


    <!-- =====================================================
         MEMBER BALANCES
    ====================================================== -->

    <div class="card">

      <div class="section-head">

        <h2>
          Balance Overview
        </h2>

      </div>


      ${members.length

      ?

      `

          <div class="table-wrap">

            <table>

              <thead>

                <tr>

                  <th>
                    MEMBER
                  </th>

                  <th>
                    TOTAL DUE
                  </th>

                  <th>
                    TOTAL PAID
                  </th>

                  <th>
                    BALANCE
                  </th>

                  <th>
                    STATUS
                  </th>

                </tr>

              </thead>


              <tbody>

                ${members
        .map(
          member => {

            const balance =
              member.balance;


            const status =
              balance >
                0.01

                ? "RECEIVE"

                : balance <
                  -0.01

                  ? "PAY"

                  : "CLEAR";


            return `

                          <tr>

                            <td>

                              <strong>
                                ${esc(
              member.name
            )}
                              </strong>

                            </td>


                            <td>
                              ${money(
              member.totalDue
            )}
                            </td>


                            <td>
                              ${money(
              member.totalPaid
            )}
                            </td>


                            <td
                              class="${balance >= 0
                ? "positive"
                : "negative"
              }"
                            >

                              ${balance >= 0
                ? "+"
                : ""
              }

                              ${money(
                balance
              )}

                            </td>


                            <td>

                              <span
                                class="pill"
                              >
                                ${status}
                              </span>

                            </td>

                          </tr>

                        `;

          }
        )
        .join("")
      }

              </tbody>

            </table>

          </div>

        `

      :

      `

          <div class="empty">
            No members available.
          </div>

        `
    }

    </div>


    <!-- =====================================================
         TRANSFERS
    ====================================================== -->

    <div class="card">

      <div class="section-head">

        <div>

          <h2>
            Suggested Transfers
          </h2>


          <div class="muted">
            Minimum practical transfers
            based on current balances.
          </div>

        </div>

      </div>


      ${transfers.length

      ?

      `

          <div class="bar-list">

            ${transfers
        .map(
          transfer => `

                    <div
                      class="transfer-card"
                    >

                      <div>

                        <small>
                          PAYER
                        </small>

                        <strong>
                          ${esc(
            transfer.from
          )}
                        </strong>

                      </div>


                      <div
                        class="transfer-arrow"
                      >

                        →
                        <strong>
                          ${money(
            transfer.amount
          )}
                        </strong>

                      </div>


                      <div>

                        <small>
                          RECEIVER
                        </small>

                        <strong>
                          ${esc(
            transfer.to
          )}
                        </strong>

                      </div>

                    </div>

                  `
        )
        .join("")
      }

          </div>

        `

      :

      `

          <div
            class="
              empty
              settlement-clear
            "
          >

            <div class="emoji">
              ✓
            </div>


            <h3>
              All accounts are settled
            </h3>


            <p class="muted">
              No outstanding transfer is required.
            </p>

          </div>

        `
    }

    </div>

  `;

}


/* ============================================================
   MEMBER LEDGER
============================================================ */

function openMemberLedger(
  memberId
) {

  const database =
    AuroraDataStore.get();


  const member =
    database.members.find(
      item =>
        item.id ===
        memberId
    );


  if (!member) {
    return;
  }


  const meals =
    AuroraMealAccount
      .memberMeals(
        memberId
      );


  const mealRate =
    AuroraMealAccount
      .mealRate();


  const mealDue =
    AuroraMealAccount
      .memberDue(
        memberId
      );


  const mealPaid =
    AuroraMealAccount
      .memberPaid(
        memberId
      );


  const mealBalance =
    mealPaid -
    mealDue;


  const houseShare =
    AuroraHouseAccount
      .memberShare();


  const housePaid =
    AuroraHouseAccount
      .memberPaid(
        memberId
      );


  const houseBalance =
    housePaid -
    houseShare;


  const totalDue =
    mealDue +
    houseShare;


  const totalPaid =
    mealPaid +
    housePaid;


  const finalBalance =
    totalPaid -
    totalDue;


  const transactions =
    AuroraPaymentAccount
      .memberPayments(
        memberId
      )
      .sort(
        (a, b) =>
          String(b.date)
            .localeCompare(
              String(a.date)
            )
      );


  const timeline =
    transactions.length

      ?

      transactions
        .map(
          payment => `

          <div
            class="ledger-event"
          >

            <span>
              ${dateLabel(
            payment.date
          )}
            </span>


            <strong>

              ${payment.account ===
              "meal"

              ? "MEAL"

              : "HOUSE"

            }

            </strong>


            <span
              class="positive"
            >

              +${money(
              payment.amount
            )}

            </span>

          </div>

        `
        )
        .join("")

      :

      `

      <div class="empty">
        No payment transactions recorded.
      </div>

    `;


  const overlay =
    document.createElement(
      "div"
    );


  overlay.id =
    "memberLedgerOverlay";


  overlay.className =
    "ledger-overlay";


  overlay.innerHTML = `

    <div class="ledger-modal">


      <div class="ledger-header">

        <div>

          <div class="eyebrow">
            AURORA // MEMBER LEDGER
          </div>


          <h2>
            ${esc(
    member.name
  )}
          </h2>


          <span class="muted">
            ${monthLabel(
    AuroraApp.getCurrentMonth()
  )}
          </span>

        </div>


        <button
          class="ledger-close"
          onclick="closeMemberLedger()"
        >
          ×
        </button>

      </div>


      <!-- ===================================================
           MEAL ACCOUNT
      ==================================================== -->

      <div
        class="
          ledger-account
          meal-account
        "
      >

        <div
          class="ledger-account-header"
        >

          <div>

            <small>
              ACCOUNT 01
            </small>


            <h3>
              🍚 MEAL ACCOUNT
            </h3>

          </div>


          <span class="ledger-tag">
            MEAL ONLY
          </span>

        </div>


        <div class="ledger-grid">

          <div>

            <small>
              MEALS TAKEN
            </small>

            <strong>
              ${meals}
            </strong>

          </div>


          <div>

            <small>
              MEAL RATE
            </small>

            <strong>
              ${money(
    mealRate
  )}
            </strong>

          </div>


          <div>

            <small>
              MEAL DUE
            </small>

            <strong>
              ${money(
    mealDue
  )}
            </strong>

          </div>


          <div>

            <small>
              MEAL PAID
            </small>

            <strong>
              ${money(
    mealPaid
  )}
            </strong>

          </div>

        </div>


        <div
          class="ledger-balance"
        >

          <span>
            MEAL BALANCE
          </span>


          <strong
            class="${mealBalance >= 0
      ? "positive"
      : "negative"
    }"
          >

            ${mealBalance >= 0
      ? "+"
      : ""
    }

            ${money(
      mealBalance
    )}

          </strong>

        </div>

      </div>


      <!-- ===================================================
           HOUSE ACCOUNT
      ==================================================== -->

      <div
        class="
          ledger-account
          house-account
        "
      >

        <div
          class="ledger-account-header"
        >

          <div>

            <small>
              ACCOUNT 02
            </small>


            <h3>
              🏠 HOUSE ACCOUNT
            </h3>

          </div>


          <span class="ledger-tag">
            HOUSE ONLY
          </span>

        </div>


        <div class="ledger-grid">

          <div>

            <small>
              HOUSE SHARE
            </small>

            <strong>
              ${money(
      houseShare
    )}
            </strong>

          </div>


          <div>

            <small>
              HOUSE PAID
            </small>

            <strong>
              ${money(
      housePaid
    )}
            </strong>

          </div>


          <div>

            <small>
              TOTAL HOUSE COST
            </small>

            <strong>
              ${money(
      AuroraHouseAccount
        .totalCost()
    )}
            </strong>

          </div>


          <div>

            <small>
              STATUS
            </small>


            <strong>

              ${houseBalance > 0.01

      ? "RECEIVE"

      : houseBalance <
        -0.01

        ? "PAY"

        : "CLEAR"

    }

            </strong>

          </div>

        </div>


        <div
          class="ledger-balance"
        >

          <span>
            HOUSE BALANCE
          </span>


          <strong
            class="${houseBalance >= 0
      ? "positive"
      : "negative"
    }"
          >

            ${houseBalance >= 0
      ? "+"
      : ""
    }

            ${money(
      houseBalance
    )}

          </strong>

        </div>

      </div>


      <!-- ===================================================
           FINAL BALANCE
      ==================================================== -->

      <div class="ledger-final">

        <div>

          <small>
            TOTAL DUE
          </small>


          <strong>
            ${money(
      totalDue
    )}
          </strong>

        </div>


        <div>

          <small>
            TOTAL PAID
          </small>


          <strong>
            ${money(
      totalPaid
    )}
          </strong>

        </div>


        <div
          class="final-balance"
        >

          <small>
            FINAL BALANCE
          </small>


          <strong
            class="${finalBalance >= 0
      ? "positive"
      : "negative"
    }"
          >

            ${finalBalance >= 0
      ? "+"
      : ""
    }

            ${money(
      finalBalance
    )}

          </strong>

        </div>

      </div>


      <!-- ===================================================
           TIMELINE
      ==================================================== -->

      <div class="ledger-account">

        <div
          class="ledger-account-header"
        >

          <div>

            <small>
              TRANSACTION STREAM
            </small>


            <h3>
              PAYMENT TIMELINE
            </h3>

          </div>


          <span class="ledger-tag">
            LIVE
          </span>

        </div>


        <div
          class="ledger-timeline"
        >

          ${timeline}

        </div>

      </div>


    </div>

  `;


  document.body.appendChild(
    overlay
  );


  requestAnimationFrame(
    () => {

      overlay.classList.add(
        "active"
      );

    }
  );

}


/* ============================================================
   CLOSE MEMBER LEDGER
============================================================ */

function closeMemberLedger() {

  const overlay =
    document.getElementById(
      "memberLedgerOverlay"
    );


  if (!overlay) {
    return;
  }


  overlay.classList.remove(
    "active"
  );


  setTimeout(
    () => {

      overlay.remove();

    },
    250
  );

}




/* ============================================================
   AURORA BACHELOR — SETTINGS V4
   Isolated settings module
============================================================ */

function renderSettings() {

  const page =
    document.getElementById("page-settings");

  if (!page) {
    return;
  }


  const db =
    AuroraDataStore.get();


  /* ----------------------------------------------------------
     SAFE DEFAULTS
  ---------------------------------------------------------- */

  db.house ??= {
    name: "Aurora Bachelor",
    currency: "৳"
  };


  db.settings ??= {};


  db.settings.mealRules ??= {
    maxDailyMeals: 10,
    halfMealEnabled: true,
    defaultMealValue: 1
  };


  db.settings.accounting ??= {
    equalHouseShare: true,
    decimals: 2
  };


  db.settings.notifications ??= {
    balanceReminder: false,
    monthlyReminder: false
  };


  db.settings.security ??= {
    lockEnabled: false
  };


  db.settings.personalization ??= {
    theme: "aurora",
    accent: "cyan",
    glow: "medium",
    animation: "full",
    compactMode: false
  };


  AuroraDataStore.save();


  const mealRules =
    db.settings.mealRules;

  const accounting =
    db.settings.accounting;

  const notifications =
    db.settings.notifications;

  const security =
    db.settings.security;

  const personalization =
    db.settings.personalization;


  page.innerHTML = `

    <div class="settings-page">

      <div class="settings-hero">

        <div>

          <div class="settings-eyebrow">
            AURORA // CONTROL CENTER
          </div>

          <h2>
            Settings
          </h2>

          <p>
            Configure your house,
            accounting and Aurora experience.
          </p>

        </div>

      </div>


      <!-- ==================================================
           HOUSE PROFILE
      =================================================== -->

      <section class="settings-card">

        <div class="settings-card-head">

          <div>
            <span class="settings-icon">🏠</span>

            <div>
              <h3>
                House Profile
              </h3>

              <p>
                Basic house information.
              </p>
            </div>

          </div>

        </div>


        <div class="settings-grid">

          <label class="settings-field">

            <span>
              HOUSE NAME
            </span>

            <input
              id="settingsHouseName"
              type="text"
              value="${esc(
    db.house.name
  )}"
            >

          </label>


          <label class="settings-field">

            <span>
              CURRENCY
            </span>

            <select id="settingsCurrency">

              <option
                value="৳"
                ${db.house.currency === "৳" ? "selected" : ""}
              >
                ৳ — BDT
              </option>

              <option
                value="$"
                ${db.house.currency === "$" ? "selected" : ""}
              >
                $ — USD
              </option>

              <option
                value="€"
                ${db.house.currency === "€" ? "selected" : ""}
              >
                € — EUR
              </option>

              <option
                value="£"
                ${db.house.currency === "£" ? "selected" : ""}
              >
                £ — GBP
              </option>

              <option
                value="﷼"
                ${db.house.currency === "﷼" ? "selected" : ""}
              >
                ﷼ — SAR
              </option>

              <option
                value="د.إ"
                ${db.house.currency === "د.إ" ? "selected" : ""}
              >
                د.إ — AED
              </option>

              <option
                value="﷼"
                ${db.house.currency === "﷼" ? "selected" : ""}
              >
                ﷼ — QAR
              </option>

            </select>

          </label>

        </div>


        <button
          class="settings-save-btn"
          type="button"
          onclick="saveHouseSettings()"
        >
          SAVE HOUSE PROFILE
        </button>

      </section>


      <!-- ==================================================
           MEAL RULES
      =================================================== -->

      <section class="settings-card">

        <div class="settings-card-head">

          <div>

            <span class="settings-icon">🍽</span>

            <div>

              <h3>
                Meal Rules
              </h3>

              <p>
                Control daily meal behaviour.
              </p>

            </div>

          </div>

        </div>


        <div class="settings-grid">

          <label class="settings-field">

            <span>
              MAX DAILY MEALS
            </span>

            <input
              id="settingsMaxMeals"
              type="number"
              min="1"
              max="100"
              step="0.5"
              value="${mealRules.maxDailyMeals}"
            >

          </label>


          <label class="settings-field">

            <span>
              DEFAULT MEAL VALUE
            </span>

            <select
              id="settingsDefaultMeal"
            >

              <option
                value="1"
                ${mealRules.defaultMealValue === 1
      ? "selected"
      : ""}
              >
                1 Meal
              </option>

              <option
                value="0.5"
                ${mealRules.defaultMealValue === 0.5
      ? "selected"
      : ""}
              >
                0.5 Meal
              </option>

              <option
                value="0"
                ${mealRules.defaultMealValue === 0
      ? "selected"
      : ""}
              >
                0 Meal
              </option>

            </select>

          </label>

        </div>


        <label class="settings-toggle">

          <span>

            <strong>
              Allow Half Meals
            </strong>

            <small>
              Allow 0.5 meal values.
            </small>

          </span>


          <input
            id="settingsHalfMeal"
            type="checkbox"
            ${mealRules.halfMealEnabled
      ? "checked"
      : ""
    }
          >

          <i></i>

        </label>


        <button
          class="settings-save-btn"
          type="button"
          onclick="saveMealSettings()"
        >
          SAVE MEAL RULES
        </button>

      </section>


      <!-- ==================================================
           ACCOUNTING
      =================================================== -->

      <section class="settings-card">

        <div class="settings-card-head">

          <div>

            <span class="settings-icon">৳</span>

            <div>

              <h3>
                Accounting
              </h3>

              <p>
                Configure house calculation rules.
              </p>

            </div>

          </div>

        </div>


        <label class="settings-toggle">

          <span>

            <strong>
              Equal House Share
            </strong>

            <small>
              Split rent and bills equally
              among active members.
            </small>

          </span>


          <input
            id="settingsEqualShare"
            type="checkbox"
            ${accounting.equalHouseShare
      ? "checked"
      : ""
    }
          >

          <i></i>

        </label>


        <div class="settings-grid">

          <label class="settings-field">

            <span>
              DECIMAL PLACES
            </span>

            <select
              id="settingsDecimals"
            >

              <option
                value="0"
                ${accounting.decimals === 0
      ? "selected"
      : ""}
              >
                0
              </option>

              <option
                value="2"
                ${accounting.decimals === 2
      ? "selected"
      : ""}
              >
                2
              </option>

            </select>

          </label>

        </div>


        <button
          class="settings-save-btn"
          type="button"
          onclick="saveAccountingSettings()"
        >
          SAVE ACCOUNTING
        </button>

      </section>


      <!-- ==================================================
           NOTIFICATIONS
      =================================================== -->

      <section class="settings-card">

        <div class="settings-card-head">

          <div>

            <span class="settings-icon">🔔</span>

            <div>

              <h3>
                Notifications
              </h3>

              <p>
                Reminder preferences.
              </p>

            </div>

          </div>

        </div>


        <label class="settings-toggle">

          <span>

            <strong>
              Balance Reminder
            </strong>

            <small>
              Prepare reminder support
              for outstanding balances.
            </small>

          </span>


          <input
            id="settingsBalanceReminder"
            type="checkbox"
            ${notifications.balanceReminder
      ? "checked"
      : ""
    }
          >

          <i></i>

        </label>


        <label class="settings-toggle">

          <span>

            <strong>
              Monthly Reminder
            </strong>

            <small>
              Prepare monthly closing reminders.
            </small>

          </span>


          <input
            id="settingsMonthlyReminder"
            type="checkbox"
            ${notifications.monthlyReminder
      ? "checked"
      : ""
    }
          >

          <i></i>

        </label>


        <button
          class="settings-save-btn"
          type="button"
          onclick="saveNotificationSettings()"
        >
          SAVE NOTIFICATIONS
        </button>

      </section>


      <!-- ==================================================
           BACKUP
      =================================================== -->

      <section class="settings-card">

        <div class="settings-card-head">

          <div>

            <span class="settings-icon">💾</span>

            <div>

              <h3>
                Backup & Data
              </h3>

              <p>
                Protect your local Aurora data.
              </p>

            </div>

          </div>

        </div>


        <div class="settings-actions">

          <button
            class="settings-action"
            onclick="
              AuroraDataStore.exportBackup()
            "
          >
            EXPORT BACKUP
          </button>


          <button
            class="settings-action"
            onclick="
              AuroraDataStore.importBackup()
            "
          >
            IMPORT BACKUP
          </button>


          <button
            class="settings-action danger"
            onclick="
              AuroraDataStore.reset()
            "
          >
            RESET DATABASE
          </button>

        </div>

        <div class="backup-status">

          <span class="backup-status-dot"></span>

          <div>

            <strong>
              Local Database
            </strong>

            <small>
              Stored securely in your browser
            </small>

          </div>

        </div>

      </section>


      <!-- ==================================================
           SECURITY
      =================================================== -->

      <section class="settings-card">

        <div class="settings-card-head">

          <div>

            <span class="settings-icon">🔐</span>

            <div>

              <h3>
                Security
              </h3>

              <p>
                Local protection settings.
              </p>

            </div>

          </div>

        </div>


        <label class="settings-toggle">

          <span>

            <strong>
              Settings Lock
            </strong>

            <small>
              Keep this preference ready for
              future PIN protection.
            </small>

          </span>


          <input
            id="settingsLock"
            type="checkbox"
            ${security.lockEnabled
      ? "checked"
      : ""
    }
          >

          <i></i>

        </label>


        <button
          class="settings-save-btn"
          type="button"
          onclick="saveSecuritySettings()"
        >
          SAVE SECURITY
        </button>

      </section>


      <!-- ==================================================
           PERSONALIZATION
      =================================================== -->

      <section class="settings-card">

        <div class="settings-card-head">

          <div>

            <span class="settings-icon">✦</span>

            <div>

              <h3>
                Personalization
              </h3>

              <p>
                Shape your Aurora interface.
              </p>

            </div>

          </div>

        </div>


        <div class="settings-grid">

          <label class="settings-field">

            <span>
              THEME
            </span>

            <select
              id="settingsTheme"
            >

              <option
                value="aurora"
                ${personalization.theme ===
      "aurora"
      ? "selected"
      : ""
    }
              >
                Aurora
              </option>

              <option
                value="midnight"
                ${personalization.theme ===
      "midnight"
      ? "selected"
      : ""
    }
              >
                Midnight
              </option>

            </select>

          </label>


          <label class="settings-field">

            <span>
              ACCENT COLOR
            </span>

            <select
              id="settingsAccent"
            >

              <option
                value="cyan"
                ${personalization.accent ===
      "cyan"
      ? "selected"
      : ""
    }
              >
                Cyan
              </option>

              <option
                value="violet"
                ${personalization.accent ===
      "violet"
      ? "selected"
      : ""
    }
              >
                Violet
              </option>

              <option
                value="green"
                ${personalization.accent ===
      "green"
      ? "selected"
      : ""
    }
              >
                Green
              </option>

            </select>

          </label>


          <label class="settings-field">

            <span>
              GLOW INTENSITY
            </span>

            <select
              id="settingsGlow"
            >

              <option
                value="low"
                ${personalization.glow ===
      "low"
      ? "selected"
      : ""
    }
              >
                Low
              </option>

              <option
                value="medium"
                ${personalization.glow ===
      "medium"
      ? "selected"
      : ""
    }
              >
                Medium
              </option>

              <option
                value="high"
                ${personalization.glow ===
      "high"
      ? "selected"
      : ""
    }
              >
                High
              </option>

            </select>

          </label>


          <label class="settings-field">

            <span>
              ANIMATION
            </span>

            <select id="settingsAnimation">

              <option
                value="full"
                ${personalization.animation ===
      "full"
      ? "selected"
      : ""
    }>
                Full
              </option>

              <option
                value="reduced"
                ${personalization.animation ===
      "reduced"
      ? "selected"
      : ""
    }> Reduced
              </option>

            </select>


          </label>

          <label class="settings-field">

            <span>
              BACKGROUND EFFECT
            </span>

            <select id="settingsBackground">

              <option
                value="aurora"
                ${personalization.background === "aurora"
      ? "selected"
      : ""
    }
              >
                Aurora
              </option>

              <option
                value="grid"
                ${personalization.background === "grid"
      ? "selected"
      : ""
    }
              >
                Tech Grid
              </option>

              <option
                value="minimal"
                ${personalization.background === "minimal"
      ? "selected"
      : ""
    }
              >
                Minimal
              </option>

            </select>

          </label>


          <label class="settings-field">

            <span>
              UI DENSITY
            </span>

            <select id="settingsDensity">

              <option
                value="comfortable"
                ${personalization.density === "comfortable"
      ? "selected"
      : ""
    }
              >
                Comfortable
              </option>

              <option
                value="compact"
                ${personalization.density === "compact"
      ? "selected"
      : ""
    }
              >
                Compact
              </option>

              <option
                value="tight"
                ${personalization.density === "tight"
      ? "selected"
      : ""
    }
              >
                Tight
              </option>

            </select>

          </label>

        </div>


        <label class="settings-toggle">

          <span>

            <strong>
              Compact Mode
            </strong>

            <small>
              Reduce spacing in dense tables.
            </small>

          </span>


          <input
            id="settingsCompact"
            type="checkbox"
            ${personalization.compactMode
      ? "checked"
      : ""
    }
          >

          <i></i>

        </label>


        <button
          class="settings-save-btn"
          type="button"
          onclick="savePersonalizationSettings()"
        >
          SAVE PERSONALIZATION
        </button>

        <button class="settings-action" type="button" onclick="restoreSettingsDefaults()">
            RESTORE DEFAULT SETTINGS
        </button>

      </section>


      <!-- ==================================================
           SYSTEM
      ================================================== -->

      <section class="settings-card system-card">

        <div class="settings-system-grid">

          <div>
            <span>APPLICATION</span>
            <strong>
              Aurora Bachelor V3
            </strong>
          </div>

          <div>
            <span>STORAGE</span>
            <strong>
              LocalStorage
            </strong>
          </div>

          <div>
            <span>ACTIVE MEMBERS</span>
            <strong>
              ${AuroraDataStore
      .getMembers()
      .length
    }
            </strong>
          </div>

          <div>
            <span>CURRENT MONTH</span>
            <strong>
              ${monthLabel(
      AuroraApp.getCurrentMonth()
    )}
            </strong>
          </div>

        </div>

      </section>

    </div>
  `;

}


/* ============================================================
   SETTINGS — HOUSE PROFILE
============================================================ */

function saveHouseSettings() {

  const database =
    AuroraDataStore.get();


  const nameInput =
    document.getElementById(
      "settingsHouseName"
    );

  const currencyInput =
    document.getElementById(
      "settingsCurrency"
    );


  if (
    !nameInput ||
    !currencyInput
  ) {
    return;
  }


  const name =
    nameInput.value.trim();

  const currency =
    currencyInput.value.trim();


  /* ----------------------------------------------------------
     VALIDATION
  ---------------------------------------------------------- */

  if (!name) {

    toast(
      "House name cannot be empty."
    );

    nameInput.focus();

    return;

  }


  if (!currency) {

    toast(
      "Currency cannot be empty."
    );

    currencyInput.focus();

    return;

  }


  /* ----------------------------------------------------------
     SAVE
  ---------------------------------------------------------- */

  database.house.name =
    name;

  database.house.currency =
    currency;


  AuroraDataStore.save();


  /* ----------------------------------------------------------
     UPDATE BRANDING IF ELEMENT EXISTS
  ---------------------------------------------------------- */

  const brandName =
    document.querySelector(
      ".brand strong"
    );


  if (brandName) {

    brandName.textContent =
      name
        .split(/\s+/)
        .slice(0, 2)
        .join(" ")
        .toUpperCase();

  }


  /* ----------------------------------------------------------
     REFRESH CURRENT PAGE
  ---------------------------------------------------------- */

  toast(
    "House profile saved."
  );


  render();

}


/* ============================================================
   SAVE MEAL SETTINGS
============================================================ */

function saveMealSettings() {

  const database =
    AuroraDataStore.get();


  const maxMeals =
    Number(
      document.getElementById(
        "settingsMaxMeals"
      )?.value || 10
    );


  const defaultMeal =
    Number(
      document.getElementById(
        "settingsDefaultMeal"
      )?.value || 1
    );


  const halfMealEnabled =
    Boolean(
      document.getElementById(
        "settingsHalfMeal"
      )?.checked
    );


  /* ----------------------------------------------------------
     VALIDATION
  ---------------------------------------------------------- */

  if (
    !Number.isFinite(maxMeals) ||
    maxMeals < 1 ||
    maxMeals > 100
  ) {

    toast(
      "Daily meal limit must be between 1 and 100."
    );

    return;

  }


  if (
    !halfMealEnabled &&
    defaultMeal === 0.5
  ) {

    toast(
      "Enable Half Meals before using 0.5 as default."
    );

    return;

  }


  database.settings.mealRules = {

    maxDailyMeals:
      Math.floor(maxMeals),

    halfMealEnabled,

    defaultMealValue:
      defaultMeal

  };


  AuroraDataStore.save();


  toast(
    "Meal rules saved."
  );


  render();

}

/* ============================================================
   SAVE NOTIFICATIONS
============================================================ */
/* ============================================================
   SETTINGS — NOTIFICATIONS
============================================================ */

function saveNotificationSettings() {

  const database =
    AuroraDataStore.get();


  const balanceReminder =
    Boolean(
      document.getElementById(
        "settingsBalanceReminder"
      )?.checked
    );


  const monthlyReminder =
    Boolean(
      document.getElementById(
        "settingsMonthlyReminder"
      )?.checked
    );


  database.settings.notifications = {

    balanceReminder,

    monthlyReminder

  };


  AuroraDataStore.save();


  toast(
    "Notification settings saved."
  );


  render();

}


/* ============================================================
   SAVE SECURITY
============================================================ */

function saveSecuritySettings() {

  const db =
    AuroraDataStore.get();


  db.settings.security = {

    lockEnabled:
      Boolean(
        document
          .getElementById(
            "settingsLock"
          )
          ?.checked
      )

  };


  AuroraDataStore.save();


  toast(
    "Security settings saved."
  );


  render();

}


/* ============================================================
   SAVE PERSONALIZATION
============================================================ */
function savePersonalizationSettings() {

  const db =
    AuroraDataStore.get();


  db.settings.personalization = {

    theme:
      document
        .getElementById(
          "settingsTheme"
        )
        ?.value ||
      "aurora",


    accent:
      document
        .getElementById(
          "settingsAccent"
        )
        ?.value ||
      "cyan",


    glow:
      document
        .getElementById(
          "settingsGlow"
        )
        ?.value ||
      "medium",


    animation:
      document
        .getElementById(
          "settingsAnimation"
        )
        ?.value ||
      "full",


    compactMode:
      Boolean(
        document
          .getElementById(
            "settingsCompact"
          )
          ?.checked
      ),


    background:
      document
        .getElementById(
          "settingsBackground"
        )
        ?.value ||
      "aurora",


    density:
      document
        .getElementById(
          "settingsDensity"
        )
        ?.value ||
      "comfortable"

  };


  AuroraDataStore.save();


  applyAuroraPersonalization();


  toast(
    "Personalization saved."
  );

}


/* ============================================================
   FINAL APPLICATION BOOT
============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    try {

      /* ------------------------------------------------------
         1. DATABASE FIRST
      ------------------------------------------------------ */

      AuroraDataStore.init();
      applyAuroraPersonalization();

      /* ------------------------------------------------------
         2. APP STATE
      ------------------------------------------------------ */

      currentMonth =
        AuroraDataStore
          .get()
          .settings
          .currentMonth;


      currentPage =
        "dashboard";


      /* ------------------------------------------------------
         3. GLOBAL EVENTS
      ------------------------------------------------------ */

      bindNavigationEvents();


      /* ------------------------------------------------------
         4. INITIAL RENDER
      ------------------------------------------------------ */

      render();


      console.log(
        "🌌 AURORA BACHELOR V3 ONLINE"
      );

    } catch (error) {

      console.error(
        "AURORA BOOT ERROR:",
        error
      );


      const page =
        document.getElementById(
          "page-dashboard"
        );


      if (page) {

        page.classList.add(
          "active"
        );


        page.innerHTML = `

          <div class="card">

            <h2>
              ⚠️ Aurora Boot Error
            </h2>


            <p class="muted">

              ${esc(
          error?.message ||
          "Unknown application error."
        )}

            </p>

          </div>

        `;

      }

    }

  },
  {
    once: true
  }
);



/* ============================================================
   AURORA BACHELOR — CENTRAL ACCOUNTING ENGINE V3
============================================================ */

const AuroraAccounting = (() => {


  /* ==========================================================
     CURRENT MONTH
  ========================================================== */

  function month() {

    return AuroraDataStore.getMonth(
      AuroraApp.getCurrentMonth()
    );

  }


  /* ==========================================================
     TOTAL MEAL COST
  ========================================================== */

  function mealCost() {

    return AuroraMealAccount.totalExpense();

  }


  /* ==========================================================
     TOTAL HOUSE COST
  ========================================================== */

  function houseCost() {

    return AuroraHouseAccount.totalCost();

  }


  /* ==========================================================
     TOTAL COST
  ========================================================== */

  function totalCost() {

    return (
      mealCost() +
      houseCost()
    );

  }


  /* ==========================================================
     MEAL PAYMENTS
  ========================================================== */

  function mealPayments() {

    return AuroraPaymentAccount
      .totalByAccount("meal");

  }


  /* ==========================================================
     HOUSE PAYMENTS
  ========================================================== */

  function housePayments() {

    return AuroraPaymentAccount
      .totalByAccount("house");

  }


  /* ==========================================================
     TOTAL PAYMENTS
  ========================================================== */

  function totalPayments() {

    return (
      mealPayments() +
      housePayments()
    );

  }


  /* ==========================================================
     OUTSTANDING
  ========================================================== */

  function outstanding() {

    return Math.max(
      0,
      totalCost() -
      totalPayments()
    );

  }


  /* ==========================================================
     HOUSE SHARE PER ACTIVE MEMBER
  ========================================================== */

  function houseShare() {

    const members =
      AuroraDataStore.getMembers();


    if (!members.length) {
      return 0;
    }


    return (
      houseCost() /
      members.length
    );

  }


  /* ==========================================================
     MEMBER ACCOUNT
  ========================================================== */

  function member(
    memberId
  ) {

    const database =
      AuroraDataStore.get();


    const memberRecord =
      database.members.find(
        item =>
          item.id ===
          memberId
      );


    if (!memberRecord) {
      return null;
    }


    /* --------------------------------------------------------
       MEAL
    -------------------------------------------------------- */

    const meals =
      AuroraMealAccount
        .memberMeals(
          memberId
        );


    const mealDue =
      AuroraMealAccount
        .memberDue(
          memberId
        );


    const mealPaid =
      AuroraPaymentAccount
        .data()
        .filter(
          payment =>
            payment.account ===
            "meal" &&
            payment.memberId ===
            memberId
        )
        .reduce(
          (sum, payment) =>
            sum +
            Number(
              payment.amount || 0
            ),
          0
        );


    const mealBalance =
      mealPaid -
      mealDue;


    /* --------------------------------------------------------
       HOUSE
    -------------------------------------------------------- */

    const memberHouseShare =
      houseShare();


    const housePaid =
      AuroraPaymentAccount
        .data()
        .filter(
          payment =>
            payment.account ===
            "house" &&
            payment.memberId ===
            memberId
        )
        .reduce(
          (sum, payment) =>
            sum +
            Number(
              payment.amount || 0
            ),
          0
        );


    const houseBalance =
      housePaid -
      memberHouseShare;


    /* --------------------------------------------------------
       TOTAL
    -------------------------------------------------------- */

    const totalDue =
      mealDue +
      memberHouseShare;


    const totalPaid =
      mealPaid +
      housePaid;


    const balance =
      totalPaid -
      totalDue;


    return {

      id:
        memberRecord.id,

      name:
        memberRecord.name,

      meals,

      mealDue,

      mealPaid,

      mealBalance,

      houseShare:
        memberHouseShare,

      housePaid,

      houseBalance,

      totalDue,

      totalPaid,

      balance

    };

  }


  /* ==========================================================
     ALL MEMBER ACCOUNTS
  ========================================================== */

  function members() {

    return AuroraDataStore
      .getMembers()
      .map(
        memberRecord =>
          member(
            memberRecord.id
          )
      )
      .filter(Boolean);

  }


  /* ==========================================================
     MONTH SUMMARY
  ========================================================== */
  function summary() {

    const memberList =
      members();


    return {

      month:
        AuroraApp.getCurrentMonth(),

      totalMeals:
        AuroraMealAccount.totalMeals(),

      mealExpense:
        mealCost(),

      mealRate:
        AuroraMealAccount.mealRate(),

      rent:
        AuroraHouseAccount.totalRent(),

      bills:
        AuroraHouseAccount.totalBills(),

      houseCost:
        houseCost(),

      totalCost:
        totalCost(),

      mealPayments:
        mealPayments(),

      housePayments:
        housePayments(),

      totalPayments:
        totalPayments(),

      outstanding:
        outstanding(),

      activeMembers:
        memberList.length,

      members:
        memberList

    };

  }


  /* ==========================================================
     RESET CURRENT MONTH
  ========================================================== */

  function resetCurrentMonth() {

    const currentMonth =
      AuroraApp.getCurrentMonth();


    if (
      !confirm(
        `Reset ${monthLabel(
          currentMonth
        )}?\n\n` +
        `This will remove all meals, ` +
        `expenses, bills, rent and ` +
        `payments for this month.`
      )
    ) {

      return;

    }


    const database =
      AuroraDataStore.get();


    database.months[
      currentMonth
    ] = AuroraDataStore
      .ensureMonth(
        currentMonth
      );


    database.months[
      currentMonth
    ] = {

      closed: false,

      mealAccount: {

        meals: [],

        expenses: [],

        payments: []

      },

      houseAccount: {

        rent: [],

        bills: [],

        payments: []

      }

    };


    AuroraDataStore.save();


    toast(
      "Current month reset."
    );


    render();

  }


  return {

    month,

    mealCost,

    houseCost,

    totalCost,

    mealPayments,

    housePayments,

    totalPayments,

    outstanding,

    houseShare,

    member,

    members,

    summary,

    resetCurrentMonth

  };

})();


/* ============================================================
   AURORA — MEAL RULES CONTROLLER
============================================================ */

function getAuroraMealRules() {

  const database =
    AuroraDataStore.get();

  const rules =
    database.settings?.mealRules || {};

  return {

    maxDailyMeals:
      Number(
        rules.maxDailyMeals ?? 10
      ),

    halfMealEnabled:
      rules.halfMealEnabled !== false,

    defaultMealValue:
      Number(
        rules.defaultMealValue ?? 1
      )

  };

}


/* ============================================================
   APPLY MEAL RULES
============================================================ */

document.addEventListener(
  "change",
  event => {

    const input =
      event.target.closest(
        ".meal-input"
      );

    if (!input) {
      return;
    }


    const rules =
      getAuroraMealRules();


    const mealIndex =
      Number(
        input.dataset.mealIndex
      );


    const memberId =
      input.dataset.memberId;


    const account =
      AuroraMealAccount.data();


    const meal =
      account.meals?.[
      mealIndex
      ];


    if (!meal) {
      return;
    }


    let value =
      Number(
        input.value
      );


    /* INVALID */

    if (
      !Number.isFinite(value) ||
      value < 0
    ) {

      value = 0;

    }


    /* HALF MEAL */

    if (
      !rules.halfMealEnabled &&
      value === 0.5
    ) {

      value = 0;

      toast(
        "Half meal is disabled."
      );

    }


    /* MAX */

    if (
      value >
      rules.maxDailyMeals
    ) {

      value =
        rules.maxDailyMeals;

      toast(
        `Maximum ${rules.maxDailyMeals} meals allowed.`
      );

    }


    /* HALF STEP */

    value =
      Math.round(
        value * 2
      ) / 2;


    /* UPDATE DATABASE */

    meal.values ??= {};

    meal.values[
      memberId
    ] =
      value;


    /* UPDATE INPUT */

    input.value =
      value;


    AuroraDataStore.save();


    /* REFRESH */

    render();

  }
);

/* ============================================================
   SETTINGS — ACCOUNTING
============================================================ */

function saveAccountingSettings() {

  const database =
    AuroraDataStore.get();


  const equalHouseShare =
    Boolean(
      document.getElementById(
        "settingsEqualShare"
      )?.checked
    );


  const decimals =
    Number(
      document.getElementById(
        "settingsDecimals"
      )?.value ?? 2
    );


  if (
    decimals !== 0 &&
    decimals !== 2
  ) {

    toast(
      "Decimal places must be 0 or 2."
    );

    return;

  }


  database.settings.accounting = {

    equalHouseShare,

    decimals

  };


  AuroraDataStore.save();


  toast(
    "Accounting settings saved."
  );


  render();

}



/* ============================================================
   AURORA — PERSONALIZATION APPLY ENGINE
============================================================ */

function applyAuroraPersonalization() {

  const database =
    AuroraDataStore.get();

  const personalization =
    database.settings?.personalization || {};


  const root =
    document.documentElement;


  /* ----------------------------------------------------------
     THEME
  ---------------------------------------------------------- */

  root.dataset.theme =
    personalization.theme ||
    "aurora";


  /* ----------------------------------------------------------
     ACCENT
  ---------------------------------------------------------- */

  root.dataset.accent =
    personalization.accent ||
    "cyan";


  /* ----------------------------------------------------------
     GLOW
  ---------------------------------------------------------- */

  root.dataset.glow =
    personalization.glow ||
    "medium";


  /* ----------------------------------------------------------
     ANIMATION
  ---------------------------------------------------------- */

  root.dataset.animation =
    personalization.animation ||
    "full";


  /* ----------------------------------------------------------
     BACKGROUND
  ---------------------------------------------------------- */

  root.dataset.background =
    personalization.background ||
    "aurora";


  /* ----------------------------------------------------------
     UI DENSITY
  ---------------------------------------------------------- */

  root.dataset.density =
    personalization.density ||
    "comfortable";


  /* ----------------------------------------------------------
     COMPACT MODE
  ---------------------------------------------------------- */

  root.classList.toggle(
    "aurora-compact",
    Boolean(
      personalization.compactMode
    )
  );

}

/* ============================================================
   SETTINGS — RESTORE DEFAULTS
============================================================ */

function restoreSettingsDefaults() {

  const confirmed =
    confirm(
      "Restore all Aurora settings to their default values?\n\n" +
      "Your meals, members, expenses and payments will NOT be deleted."
    );


  if (!confirmed) {
    return;
  }


  const db =
    AuroraDataStore.get();


  /* ----------------------------------------------------------
     RESTORE ONLY SETTINGS
  ---------------------------------------------------------- */

  db.settings = {

    currentMonth:
      db.settings?.currentMonth ||
      new Date()
        .toISOString()
        .slice(0, 7),


    mealRules: {

      maxDailyMeals: 10,

      halfMealEnabled: true,

      defaultMealValue: 1

    },


    accounting: {

      equalHouseShare: true,

      decimals: 2

    },


    notifications: {

      balanceReminder: false,

      monthlyReminder: false

    },


    security: {

      lockEnabled: false

    },


    personalization: {

      theme: "aurora",

      accent: "cyan",

      glow: "medium",

      animation: "full",

      compactMode: false,

      background: "aurora",

      density: "comfortable"

    }

  };


  AuroraDataStore.save();


  applyAuroraPersonalization();


  toast(
    "Default settings restored."
  );


  render();

}


