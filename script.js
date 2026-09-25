 /* ============================================================
   AURORA BACHELOR — V3 CLEAN SCRIPT
   Single data store • Single renderer • Single boot
 ============================================================ */


/* ============================================================
   AURORA — SUPABASE CLIENT
   Safe single initialization
============================================================ */

const AURORA_SUPABASE_URL =
  "https://jykzxgrfgdpefsocpsur.supabase.co";

const AURORA_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_aGr0tI4CKz1xuuD7uMmmCA_G1tkn8lC";

let supabaseClient = null;

function createAuroraSupabaseClient() {
  if (supabaseClient?.auth) return supabaseClient;

  const sdk =
    window.supabase ||
    (typeof supabase !== "undefined" ? supabase : null);

  if (!sdk || typeof sdk.createClient !== "function") {
    console.error(
      "❌ Aurora: Supabase JS SDK is not available. Load @supabase/supabase-js before script.js."
    );
    return null;
  }

  supabaseClient = sdk.createClient(
    AURORA_SUPABASE_URL,
    AURORA_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce"
      }
    }
  );

  console.log("🌐 Aurora Supabase Client Ready");
  return supabaseClient;
}

function getAuroraSupabaseClient() {
  return supabaseClient || createAuroraSupabaseClient();
}

async function initializeAuroraOwner() {

  try {

    const {
      data: {
        user
      },
      error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

      console.warn(
        "Aurora Owner Init: No authenticated user."
      );

      return null;
    }


    // Check whether this user already owns a household

    const {
      data: existingHouse,
      error: existingError
    } = await supabaseClient

      .from("households")

      .select("id")

      .eq("owner_id", user.id)

      .limit(1)

      .maybeSingle();


    if (existingError) {

      console.error(
        "Owner check failed:",
        existingError
      );

      return null;
    }


    // Already initialized

    if (existingHouse) {

      console.log(
        "👑 Aurora Owner already initialized:",
        existingHouse.id
      );

      return existingHouse.id;
    }


    // Create first Aurora household

    const {
      data: householdId,
      error: ownerError
    } = await supabaseClient

      .rpc(
        "create_aurora_owner",
        {
          p_user_id: user.id,

          p_house_name:
            "Aurora Bachelor"
        }
      );


    if (ownerError) {

      console.error(
        "Owner initialization failed:",
        ownerError
      );

      return null;
    }


    console.log(
      "👑 Aurora Owner initialized:",
      householdId
    );


    return householdId;


  } catch (error) {

    console.error(
      "Aurora Owner Init Error:",
      error
    );

    return null;
  }

}






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

  let suppressCloudSave =
    false;


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

          ...member,

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
            member.status === "inactive"
              ? "inactive"
              : "active",

          createdAt:
            member.createdAt ||
            new Date().toISOString()

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
      return false;
    }


    const cloudStatus =
      window.AuroraCloudSync
        ?.status?.();


    const isReadOnlyMember =
      cloudStatus?.ready === true &&
      cloudStatus?.canWrite === false;


    /* =========================================
       MEMBER WRITE BLOCK
    ========================================= */

    if (
      !suppressCloudSave &&
      isReadOnlyMember
    ) {

      console.warn(
        "🔒 Aurora: MEMBER write blocked."
      );


      toast(
        "MEMBER // VIEW ONLY"
      );


      return false;

    }


    /* =========================================
       LOCAL CACHE
    ========================================= */

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(db)
    );


    /* =========================================
       CLOUD SAVE
    ========================================= */

    if (
      !suppressCloudSave &&
      window.AuroraCloudSync &&
      typeof window.AuroraCloudSync
        .queueSave === "function"
    ) {

      window.AuroraCloudSync
        .queueSave(
          db
        );

    }


    return true;

  }

  /* ==========================================================
                  REPLACE DATABASE FROM CLOUD
  ========================================================== */

  function replaceFromCloud(
    incoming
    ) {

    if (
      !incoming ||
      typeof incoming !== "object"
    ) {

      throw new Error(
        "Invalid Aurora cloud database."
      );

    }


    if (
      !Array.isArray(
        incoming.members
      ) ||
      !incoming.months
    ) {

      throw new Error(
        "Aurora cloud database structure is invalid."
      );

    }


    try {

      suppressCloudSave =
        true;


      db =
        structuredClone(
          incoming
        );


      /*
        Write cloud version into local cache.
      */

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(db)
      );


      /*
        Re-run Aurora normalizer.
  
        save() runs inside init(),
        but suppressCloudSave prevents
        cloud-save feedback loop.
      */

      init();


      return db;

    } finally {

      suppressCloudSave =
        false;

    }

  }


  /* ==========================================================
     DATABASE SNAPSHOT
  ========================================================== */

  function snapshot() {

    if (!db) {
      return null;
    }


    return structuredClone(
      db
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

  /* ============================================================
   AURORA // EXCEL BACKUP EXPORT
============================================================ */

  function exportBackup() {

    const database =
      AuroraDataStore.get();


    if (!database) {

      toast(
        "No Aurora data found."
      );

      return;

    }


    if (
      typeof XLSX ===
      "undefined"
    ) {

      console.error(
        "Aurora: SheetJS library not loaded."
      );

      toast(
        "Excel engine is not available."
      );

      return;

    }


    /* ==========================================================
       HELPERS
    ========================================================== */

    const clean =
      value => {

        if (
          value === null ||
          value === undefined
        ) {

          return "";

        }


        if (
          typeof value ===
          "string" &&
          /^[=+\-@]/.test(
            value
          )
        ) {

          /*
            Prevent Excel from treating
            user text as a formula.
          */

          return `'${value}`;

        }


        return value;

      };


    const members =
      Array.isArray(
        database.members
      )
        ? database.members
        : [];


    const memberMap =
      Object.fromEntries(

        members.map(
          member => [

            member.id,

            member.name ||
            member.fullName ||
            member.displayName ||
            member.email ||
            member.id

          ]
        )

      );


    function memberName(
      memberId
    ) {

      return (
        memberMap[
        memberId
        ] ||
        memberId ||
        ""
      );

    }


    function addSheet(
      workbook,
      name,
      rows,
      widths = []
    ) {

      const worksheet =
        XLSX.utils
          .json_to_sheet(
            rows
          );


      if (
        widths.length
      ) {

        worksheet["!cols"] =
          widths.map(
            width => ({
              wch: width
            })
          );

      }


      if (
        rows.length
      ) {

        const range =
          XLSX.utils.decode_range(
            worksheet["!ref"]
          );


        worksheet[
          "!autofilter"
        ] = {

          ref:
            XLSX.utils.encode_range({
              s: {
                r: 0,
                c: 0
              },

              e: {
                r: range.e.r,
                c: range.e.c
              }
            })

        };

      }


      XLSX.utils
        .book_append_sheet(
          workbook,
          worksheet,
          name
        );

    }


    const workbook =
      XLSX.utils
        .book_new();


    /* ==========================================================
       OVERVIEW
    ========================================================== */

    const houseName =
      database.house?.name ||
      database.house?.houseName ||
      "Aurora Bachelor";


    const monthKeys =
      Object.keys(
        database.months || {}
      )
        .sort();


    const overview =
      XLSX.utils
        .aoa_to_sheet([

          [
            "AURORA BACHELOR",
            "EXCEL BACKUP"
          ],

          [],

          [
            "House",
            clean(
              houseName
            )
          ],

          [
            "Exported At",
            new Date()
              .toLocaleString()
          ],

          [
            "Current Month",
            database.settings
              ?.currentMonth ||
            ""
          ],

          [
            "Database Version",
            database.version ||
            ""
          ],

          [
            "Total Members",
            members.length
          ],

          [
            "Total Months",
            monthKeys.length
          ]

        ]);


    overview["!cols"] = [
      {
        wch: 24
      },
      {
        wch: 38
      }
    ];


    XLSX.utils
      .book_append_sheet(
        workbook,
        overview,
        "Overview"
      );


    /* ==========================================================
       MEMBERS
    ========================================================== */

    const memberRows =
      members.map(
        member => ({

          "Member ID":
            clean(
              member.id
            ),

          "Name":
            clean(
              member.name ||
              member.fullName ||
              member.displayName ||
              ""
            ),

          "Email":
            clean(
              member.email ||
              ""
            ),

          "Phone":
            clean(
              member.phone ||
              ""
            ),

          "Role":
            clean(
              member.role ||
              ""
            ),

          "Status":
            clean(
              member.status ||
              ""
            )

        })
      );


    addSheet(
      workbook,
      "Members",
      memberRows,
      [
        38,
        25,
        32,
        18,
        15,
        15
      ]
    );


    /* ==========================================================
       DATA COLLECTIONS
    ========================================================== */

    const mealRows = [];

    const mealExpenseRows = [];

    const mealPaymentRows = [];

    const rentRows = [];

    const billRows = [];

    const housePaymentRows = [];

    const monthRows = [];


    monthKeys.forEach(
      monthKey => {

        const month =
          database
            .months[
          monthKey
          ] || {};


        const mealAccount =
          month.mealAccount ||
          {};


        const houseAccount =
          month.houseAccount ||
          {};


        /* ------------------------------------------------------
           MONTH STATUS
        ------------------------------------------------------ */

        monthRows.push({

          Month:
            monthKey,

          Status:
            month.closed
              ? "LOCKED"
              : "OPEN",

          "Meal Days":
            Array.isArray(
              mealAccount.meals
            )
              ? mealAccount.meals.length
              : 0,

          "Meal Expenses":
            Array.isArray(
              mealAccount.expenses
            )
              ? mealAccount.expenses.length
              : 0,

          "Meal Payments":
            Array.isArray(
              mealAccount.payments
            )
              ? mealAccount.payments.length
              : 0,

          "Rent Entries":
            Array.isArray(
              houseAccount.rent
            )
              ? houseAccount.rent.length
              : 0,

          "Bill Entries":
            Array.isArray(
              houseAccount.bills
            )
              ? houseAccount.bills.length
              : 0,

          "House Payments":
            Array.isArray(
              houseAccount.payments
            )
              ? houseAccount.payments.length
              : 0

        });


        /* ------------------------------------------------------
           DAILY MEALS
        ------------------------------------------------------ */

        (
          mealAccount.meals ||
          []
        )
          .forEach(
            day => {

              const values =
                day.values ||
                {};


              Object
                .entries(
                  values
                )
                .forEach(
                  ([
                    memberId,
                    mealCount
                  ]) => {

                    mealRows.push({

                      Month:
                        monthKey,

                      Date:
                        clean(
                          day.date ||
                          ""
                        ),

                      "Member ID":
                        clean(
                          memberId
                        ),

                      Member:
                        clean(
                          memberName(
                            memberId
                          )
                        ),

                      Meals:
                        Number(
                          mealCount
                        ) || 0

                    });

                  }
                );

            }
          );


        /* ------------------------------------------------------
           MEAL EXPENSES
        ------------------------------------------------------ */

        (
          mealAccount.expenses ||
          []
        )
          .forEach(
            item => {

              mealExpenseRows.push({

                Month:
                  monthKey,

                Date:
                  clean(
                    item.date ||
                    ""
                  ),

                Category:
                  clean(
                    item.category ||
                    ""
                  ),

                Description:
                  clean(
                    item.description ||
                    ""
                  ),

                Amount:
                  Number(
                    item.amount
                  ) || 0,

                "Paid By":
                  clean(
                    memberName(
                      item.paidBy
                    )
                  ),

                "Entry ID":
                  clean(
                    item.id ||
                    ""
                  )

              });

            }
          );


        /* ------------------------------------------------------
           MEAL PAYMENTS
        ------------------------------------------------------ */

        (
          mealAccount.payments ||
          []
        )
          .forEach(
            item => {

              mealPaymentRows.push({

                Month:
                  monthKey,

                Date:
                  clean(
                    item.date ||
                    ""
                  ),

                Member:
                  clean(
                    memberName(
                      item.memberId
                    )
                  ),

                Amount:
                  Number(
                    item.amount
                  ) || 0,

                Method:
                  clean(
                    item.method ||
                    ""
                  ),

                Reference:
                  clean(
                    item.reference ||
                    ""
                  ),

                Note:
                  clean(
                    item.note ||
                    ""
                  ),

                "Entry ID":
                  clean(
                    item.id ||
                    ""
                  )

              });

            }
          );


        /* ------------------------------------------------------
           RENT
        ------------------------------------------------------ */

        (
          houseAccount.rent ||
          []
        )
          .forEach(
            item => {

              rentRows.push({

                Month:
                  monthKey,

                Date:
                  clean(
                    item.date ||
                    ""
                  ),

                Description:
                  clean(
                    item.description ||
                    ""
                  ),

                Amount:
                  Number(
                    item.amount
                  ) || 0,

                "Paid By":
                  clean(
                    memberName(
                      item.paidBy
                    )
                  ),

                "Entry ID":
                  clean(
                    item.id ||
                    ""
                  )

              });

            }
          );


        /* ------------------------------------------------------
           HOUSE BILLS
        ------------------------------------------------------ */

        (
          houseAccount.bills ||
          []
        )
          .forEach(
            item => {

              billRows.push({

                Month:
                  monthKey,

                Date:
                  clean(
                    item.date ||
                    ""
                  ),

                Category:
                  clean(
                    item.category ||
                    ""
                  ),

                Description:
                  clean(
                    item.description ||
                    ""
                  ),

                Amount:
                  Number(
                    item.amount
                  ) || 0,

                "Paid By":
                  clean(
                    memberName(
                      item.paidBy
                    )
                  ),

                "Entry ID":
                  clean(
                    item.id ||
                    ""
                  )

              });

            }
          );


        /* ------------------------------------------------------
           HOUSE PAYMENTS
        ------------------------------------------------------ */

        (
          houseAccount.payments ||
          []
        )
          .forEach(
            item => {

              housePaymentRows.push({

                Month:
                  monthKey,

                Date:
                  clean(
                    item.date ||
                    ""
                  ),

                Member:
                  clean(
                    memberName(
                      item.memberId
                    )
                  ),

                Amount:
                  Number(
                    item.amount
                  ) || 0,

                Method:
                  clean(
                    item.method ||
                    ""
                  ),

                Reference:
                  clean(
                    item.reference ||
                    ""
                  ),

                Note:
                  clean(
                    item.note ||
                    ""
                  ),

                "Entry ID":
                  clean(
                    item.id ||
                    ""
                  )

              });

            }
          );

      }
    );


    /* ==========================================================
       CREATE EXCEL SHEETS
    ========================================================== */

    addSheet(
      workbook,
      "Months",
      monthRows,
      [
        14,
        12,
        14,
        16,
        16,
        14,
        14,
        16
      ]
    );


    addSheet(
      workbook,
      "Daily Meals",
      mealRows,
      [
        14,
        14,
        38,
        25,
        12
      ]
    );


    addSheet(
      workbook,
      "Meal Expenses",
      mealExpenseRows,
      [
        14,
        14,
        20,
        35,
        15,
        25,
        38
      ]
    );


    addSheet(
      workbook,
      "Meal Payments",
      mealPaymentRows,
      [
        14,
        14,
        25,
        15,
        18,
        24,
        35,
        38
      ]
    );


    addSheet(
      workbook,
      "Rent",
      rentRows,
      [
        14,
        14,
        35,
        15,
        25,
        38
      ]
    );


    addSheet(
      workbook,
      "House Bills",
      billRows,
      [
        14,
        14,
        20,
        35,
        15,
        25,
        38
      ]
    );


    addSheet(
      workbook,
      "House Payments",
      housePaymentRows,
      [
        14,
        14,
        25,
        15,
        18,
        24,
        35,
        38
      ]
    );


    /* ==========================================================
       RAW DATABASE BACKUP
  
       Excel cells have a size limit,
       so JSON is divided into chunks.
    ========================================================== */

    const rawJSON =
      JSON.stringify(
        database
      );


    const CHUNK_SIZE =
      30000;


    const rawRows = [];


    for (
      let index = 0;
      index < rawJSON.length;
      index += CHUNK_SIZE
    ) {

      rawRows.push({

        Part:
          rawRows.length + 1,

        Data:
          rawJSON.slice(
            index,
            index +
            CHUNK_SIZE
          )

      });

    }


    addSheet(
      workbook,
      "RAW BACKUP",
      rawRows,
      [
        10,
        120
      ]
    );


    /* ==========================================================
       DOWNLOAD
    ========================================================== */

    const now =
      new Date();


    const date =
      [
        now.getFullYear(),

        String(
          now.getMonth() + 1
        ).padStart(
          2,
          "0"
        ),

        String(
          now.getDate()
        ).padStart(
          2,
          "0"
        )

      ].join("-");


    const fileName =
      `Aurora-Bachelor-Backup-${date}.xlsx`;


    XLSX.writeFile(
      workbook,
      fileName
    );


    toast(
      "Excel backup downloaded."
    );

  }


  /* ============================================================
     AURORA // BACKUP RESTORE PREVIEW
  ============================================================ */

  function auroraBackupRestorePreview({
    file,
    database
  }) {

    return new Promise(
      resolve => {

        const old =
          document.getElementById(
            "auroraBackupRestorePortal"
          );


        if (old) {
          old.remove();
        }


        const members =
          Array.isArray(
            database?.members
          )
            ? database.members.length
            : 0;


        const months =
          Object.keys(
            database?.months || {}
          );


        const lockedMonths =
          months.filter(
            key =>
              database
                ?.months
                ?.[key]
                ?.closed === true
          ).length;


        const currentMonth =
          database
            ?.settings
            ?.currentMonth ||
          "Unknown";


        const houseName =
          database
            ?.house
            ?.name ||
          "Aurora Bachelor";


        const databaseVersion =
          database
            ?.version ??
          "Unknown";


        const fileType =
          file.name
            .toLowerCase()
            .endsWith(
              ".xlsx"
            )
            ? "EXCEL"
            : "JSON";


        let monthText =
          currentMonth;


        try {

          monthText =
            monthLabel(
              currentMonth
            );

        }

        catch (_) { }


        const portal =
          document.createElement(
            "div"
          );


        portal.id =
          "auroraBackupRestorePortal";


        portal.className =
          "aurora-restore-portal";


        portal.innerHTML = `

        <div
          class="aurora-restore-backdrop"
        ></div>


        <div
          class="aurora-restore-modal"
          role="dialog"
          aria-modal="true"
        >

          <div
            class="aurora-restore-line"
          ></div>


          <span
            class="aurora-restore-code"
          >
            AURORA // DATABASE RESTORE PROTOCOL
          </span>


          <h2>
            Backup
            <span>
              Detected
            </span>
          </h2>


          <p class="aurora-restore-file">
            ${esc(file.name)}
          </p>


          <div
            class="aurora-restore-grid"
          >

            <div>
              <span>HOUSE</span>
              <strong>
                ${esc(houseName)}
              </strong>
            </div>


            <div>
              <span>FORMAT</span>
              <strong>
                ${fileType}
              </strong>
            </div>


            <div>
              <span>MEMBERS</span>
              <strong>
                ${members}
              </strong>
            </div>


            <div>
              <span>MONTHS</span>
              <strong>
                ${months.length}
              </strong>
            </div>


            <div>
              <span>LOCKED MONTHS</span>
              <strong>
                ${lockedMonths}
              </strong>
            </div>


            <div>
              <span>DATABASE VERSION</span>
              <strong>
                ${esc(
          String(
            databaseVersion
          )
        )}
              </strong>
            </div>

          </div>


          <div
            class="aurora-restore-current"
          >

            <span>
              BACKUP CURRENT MONTH
            </span>

            <strong>
              ${esc(monthText)}
            </strong>

          </div>


          <div
            class="aurora-restore-warning"
          >

            <span>
              ⚠
            </span>

            <p>
              Restoring this backup will replace
              the current Aurora application data
              and synchronize the restored version
              with Aurora Cloud.
            </p>

          </div>


          <div
            class="aurora-restore-actions"
          >

            <button
              type="button"
              class="aurora-restore-confirm"
              id="auroraRestoreConfirm"
            >
              ↻ RESTORE NOW
            </button>


            <button
              type="button"
              class="aurora-restore-cancel"
              id="auroraRestoreCancel"
            >
              CANCEL
            </button>

          </div>


          <small>
            Only restore backups you trust.
          </small>

        </div>

      `;


        document.body
          .appendChild(
            portal
          );


        requestAnimationFrame(
          () => {

            portal.classList
              .add(
                "active"
              );

          }
        );


        function finish(
          result
        ) {

          portal.classList
            .remove(
              "active"
            );


          setTimeout(
            () => {

              portal.remove();

            },
            220
          );


          resolve(
            result
          );

        }


        document
          .getElementById(
            "auroraRestoreConfirm"
          )
          ?.addEventListener(
            "click",
            () =>
              finish(
                true
              )
          );


        document
          .getElementById(
            "auroraRestoreCancel"
          )
          ?.addEventListener(
            "click",
            () =>
              finish(
                false
              )
          );


        portal
          .querySelector(
            ".aurora-restore-backdrop"
          )
          ?.addEventListener(
            "click",
            () =>
              finish(
                false
              )
          );

      }
    );

  }
  /* ==========================================================
                IMPORT BACKUP // JSON + XLSX
  ========================================================== */

  async function importBackup() {

    /* --------------------------------------------------------
       PERMISSION CHECK
    -------------------------------------------------------- */

    const cloudStatus =
      window.AuroraCloudSync
        ?.status?.();


    if (
      cloudStatus?.ready === true &&
      cloudStatus?.canWrite === false
    ) {

      toast(
        "MEMBER // VIEW ONLY"
      );

      return;

    }


    /* --------------------------------------------------------
       EXCEL ENGINE CHECK
    -------------------------------------------------------- */

    if (
      typeof XLSX ===
      "undefined"
    ) {

      console.error(
        "Aurora Excel Engine not loaded."
      );

      toast(
        "Excel engine unavailable."
      );

      return;

    }


    /* --------------------------------------------------------
       FILE PICKER
    -------------------------------------------------------- */

    const input =
      document.createElement(
        "input"
      );


    input.type =
      "file";


    input.accept =
      [
        ".json",
        ".xlsx",
        "application/json",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ].join(",");


    input.onchange =
      async () => {

        const file =
          input.files?.[0];


        if (!file) {
          return;
        }


        try {

          let incoming =
            null;


          const fileName =
            String(
              file.name || ""
            )
              .toLowerCase();


          /* ====================================================
             JSON BACKUP
          ==================================================== */

          if (
            fileName.endsWith(
              ".json"
            )
          ) {

            const text =
              await file.text();


            incoming =
              JSON.parse(
                text
              );

          }


          /* ====================================================
             EXCEL BACKUP
          ==================================================== */

          else if (
            fileName.endsWith(
              ".xlsx"
            )
          ) {

            const buffer =
              await file
                .arrayBuffer();


            const workbook =
              XLSX.read(
                buffer,
                {
                  type:
                    "array"
                }
              );


            const rawSheet =
              workbook
                .Sheets[
              "RAW BACKUP"
              ];


            if (
              !rawSheet
            ) {

              throw new Error(
                "RAW BACKUP sheet not found."
              );

            }


            const rows =
              XLSX.utils
                .sheet_to_json(
                  rawSheet,
                  {
                    defval:
                      ""
                  }
                );


            if (
              !Array.isArray(
                rows
              ) ||
              !rows.length
            ) {

              throw new Error(
                "RAW BACKUP sheet is empty."
              );

            }


            /* --------------------------------------------------
               Restore chunks in correct order
            -------------------------------------------------- */

            rows.sort(
              (a, b) =>

                Number(
                  a.Part
                ) -

                Number(
                  b.Part
                )
            );


            const rawJSON =
              rows
                .map(
                  row =>
                    String(
                      row.Data ??
                      ""
                    )
                )
                .join("");


            if (
              !rawJSON
            ) {

              throw new Error(
                "Backup data missing."
              );

            }


            incoming =
              JSON.parse(
                rawJSON
              );

          }


          else {

            throw new Error(
              "Unsupported backup format."
            );

          }


          /* ====================================================
             DATABASE VALIDATION
          ==================================================== */

          if (
            !incoming ||
            typeof incoming !==
            "object" ||
            !Array.isArray(
              incoming.members
            ) ||
            !incoming.months ||
            typeof incoming.months !==
            "object" ||
            Array.isArray(
              incoming.months
            )
          ) {

            throw new Error(
              "Invalid Aurora database."
            );

          }

          /* ====================================================
                            RESTORE PREVIEW
          ==================================================== */

          const restoreApproved =
            await auroraBackupRestorePreview({

              file,

              database:
                incoming

            });


          if (
            !restoreApproved
          ) {

            toast(
              "Backup restore cancelled."
            );

            return;

          }
          /* ====================================================
             KEEP CURRENT DATABASE FOR SAFETY
          ==================================================== */

          const previousDatabase =
            structuredClone(
              db
            );


          try {

            /* ==================================================
               APPLY DATABASE
            ================================================== */

            db =
              incoming;


            /* --------------------------------------------------
               SETTINGS
            -------------------------------------------------- */

            if (
              !db.settings
            ) {

              db.settings =
                {};

            }


            if (
              !db.settings
                .currentMonth
            ) {

              db.settings
                .currentMonth =
                monthKey(
                  new Date()
                );

            }


            /* --------------------------------------------------
               HOUSE
            -------------------------------------------------- */

            if (
              !db.house
            ) {

              db.house = {

                name:
                  "Aurora Bachelor",

                currency:
                  "৳"

              };

            }


            if (
              !db.house
                .currency
            ) {

              db.house.currency =
                "৳";

            }


            /* --------------------------------------------------
               MONTHS
            -------------------------------------------------- */

            if (
              !db.months
            ) {

              db.months =
                {};

            }


            Object
              .keys(
                db.months
              )
              .forEach(
                key => {

                  db.months[
                    key
                  ] =
                    normalizeMonth(
                      db.months[
                      key
                      ]
                    );

                }
              );


            /* --------------------------------------------------
               CURRENT MONTH
            -------------------------------------------------- */

            currentMonth =
              db.settings
                .currentMonth;


            ensureMonth(
              currentMonth
            );


            /* ==================================================
               SAVE + CLOUD SYNC
            ================================================== */

            const saved =
              save();


            if (
              saved === false
            ) {

              db =
                previousDatabase;


              throw new Error(
                "Backup restore blocked."
              );

            }


            toast(
              fileName.endsWith(
                ".xlsx"
              )
                ? "Excel backup restored."
                : "JSON backup restored."
            );


            render();

          }

          catch (error) {

            db =
              previousDatabase;


            throw error;

          }

        }

        catch (error) {

          console.error(
            "Aurora Backup Import:",
            error
          );


          toast(
            "Invalid or unsupported backup file."
          );

        }

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

    importBackup,

    replaceFromCloud,

    snapshot

  };

})();


/* ============================================================
   AURORA // SUPABASE CLOUD SYNC ENGINE
============================================================ */

const AuroraCloudSync = (() => {

  const BACKUP_PREFIX =
    "aurora_cloud_backup_";


  let ready =
    false;


  let householdId =
    null;


  let currentRole =
    "member";


  let currentRevision =
    0;


  let realtimeChannel =
    null;


  let saveTimer =
    null;


  let pendingSnapshot =
    null;


  let saving =
    false;


  let remoteRefreshQueued =
    false;


  let initializedUserId =
    null;


  let applyingCloud =
    false;

  let initializingPromise =
    null;

  let pollTimer =
    null;


  /* ==========================================================
     HELPERS
  ========================================================== */

  function canWrite() {

    return (
      currentRole === "owner" ||
      currentRole === "admin"
    );

  }


  function cloneData(
    data
  ) {

    return structuredClone(
      data
    );

  }


  function databasesMatch(
    a,
    b
  ) {

    try {

      return (
        JSON.stringify(a) ===
        JSON.stringify(b)
      );

    } catch (_) {

      return false;

    }

  }


  /* ==========================================================
     LOCAL SAFETY BACKUP
  ========================================================== */

  function createLocalBackup(
    reason = "cloud-sync"
  ) {

    try {

      const snapshot =
        AuroraDataStore.snapshot();


      if (!snapshot) {
        return null;
      }


      const stamp =
        new Date()
          .toISOString()
          .replace(
            /[:.]/g,
            "-"
          );


      const key =
        `${BACKUP_PREFIX}${reason}_${stamp}`;


      localStorage.setItem(
        key,
        JSON.stringify(snapshot)
      );


      console.log(
        "🛡️ Aurora local backup created:",
        key
      );


      return key;

    } catch (error) {

      console.error(
        "❌ Aurora Backup Error:",
        error
      );


      return null;

    }

  }


  /* ==========================================================
     GET CURRENT MEMBERSHIP
  ========================================================== */

  async function getMembership(
    client,
    userId
  ) {

    const {
      data,
      error
    } =
      await client
        .from("house_members")
        .select(
          "household_id, role"
        )
        .eq(
          "user_id",
          userId
        )
        .maybeSingle();


    if (error) {
      throw error;
    }


    return data ||
      null;

  }


  /* ==========================================================
     LOAD CLOUD ROW
  ========================================================== */

  async function fetchCloudData() {

    const client =
      getAuroraSupabaseClient();


    if (
      !client ||
      !householdId
    ) {

      return null;

    }


    const {
      data,
      error
    } =
      await client.rpc(
        "aurora_get_house_data",
        {
          p_household_id:
            householdId
        }
      );


    if (error) {
      throw error;
    }


    const row =
      Array.isArray(data)
        ? data[0]
        : data;


    return row ||
      null;

  }


  /* ==========================================================
     APPLY CLOUD DATABASE
  ========================================================== */

  function applyCloudDatabase(
    cloudDatabase,
    options = {}
  ) {

    const {
      renderAfter = true
    } =
      options;


    applyingCloud =
      true;


    try {

      AuroraDataStore
        .replaceFromCloud(
          cloudDatabase
        );


      currentMonth =
        AuroraDataStore
          .get()
          ?.settings
          ?.currentMonth ||
        currentMonth;


      console.log(
        "☁️ Aurora cloud database applied."
      );


    } finally {

      applyingCloud =
        false;

    }


    if (
      renderAfter &&
      typeof render ===
      "function"
    ) {

      render();

    }

  }

  /* ==========================================================
     SINGLE CLOUD INITIALIZATION GUARD
  ========================================================== */

  async function initialize(
    session = null
  ) {

    if (initializingPromise) {

      console.log(
        "☁️ Aurora Cloud initialization already running..."
      );

      return initializingPromise;

    }


    initializingPromise =
      initializeInternal(
        session
      );


    try {

      return await initializingPromise;

    } finally {

      initializingPromise =
        null;

    }

  }
  /* ==========================================================
     FIRST CLOUD INITIALIZATION
  ========================================================== */

  async function initializeInternal(
    session = null
  ) {

    const client =
      getAuroraSupabaseClient();


    if (!client?.auth) {
      return;
    }


    try {

      let activeSession =
        session;


      if (!activeSession) {

        const {
          data,
          error
        } =
          await client.auth
            .getSession();


        if (error) {
          throw error;
        }


        activeSession =
          data?.session ||
          null;

      }


      const user =
        activeSession?.user;


      if (!user) {

        stop();

        return;

      }


      /* =========================================
         MEMBERSHIP
      ========================================= */

      const membership =
        await getMembership(
          client,
          user.id
        );


      if (
        !membership
          ?.household_id
      ) {

        console.log(
          "☁️ Aurora Cloud: User has no household."
        );

        stop();

        return;

      }


      const newHouseholdId =
        membership.household_id;


      const newRole =
        String(
          membership.role ||
          "member"
        )
          .toLowerCase()
          .trim();


      /*
        Avoid duplicate initialization from
        SIGNED_IN + INITIAL_SESSION.
      */

      if (
        ready &&
        initializedUserId === user.id &&
        householdId ===
        newHouseholdId
      ) {

        currentRole =
          newRole;

        return;

      }


      stopRealtime();


      ready =
        false;


      initializedUserId =
        user.id;


      householdId =
        newHouseholdId;


      currentRole =
        newRole;


      currentRevision =
        0;


      console.log(
        "☁️ Aurora Cloud Initializing:",
        {
          householdId,
          currentRole
        }
      );


      /* =========================================
         CLOUD DATA
      ========================================= */

      const cloudRow =
        await fetchCloudData();


      const localDatabase =
        AuroraDataStore.snapshot();


      /* =========================================
         CLOUD DOES NOT EXIST YET
      ========================================= */

      if (!cloudRow?.data) {

        if (canWrite()) {

          console.log(
            "☁️ No cloud database found. Uploading current local database..."
          );


          createLocalBackup(
            "before-first-cloud-upload"
          );


          currentRevision =
            0;


          ready =
            true;


          await saveNow(
            localDatabase
          );


          toast(
            "Aurora Cloud initialized ✓"
          );

        } else {

          /*
            Member cannot create cloud DB.
            Wait for Owner/Admin.
          */

          ready =
            true;


          console.log(
            "☁️ Cloud database is empty. Waiting for Owner/Admin initialization."
          );

        }


        subscribeRealtime();

        return;

      }


      /* =========================================
         CLOUD ALREADY EXISTS
      ========================================= */

      currentRevision =
        Number(
          cloudRow.revision ||
          0
        );


      const cloudDatabase =
        cloudRow.data;


      if (
        !databasesMatch(
          localDatabase,
          cloudDatabase
        )
      ) {

        /*
          Never silently destroy local data.
        */

        const backupKey =
          createLocalBackup(
            "before-cloud-download"
          );


        console.log(
          "🛡️ Existing local data backed up before cloud load:",
          backupKey
        );


        toast(
          "Cloud data loaded. Local backup preserved."
        );

      }


      applyCloudDatabase(
        cloudDatabase
      );


      ready =
        true;


      subscribeRealtime();


      console.log(
        "✅ Aurora Cloud Ready:",
        {
          revision:
            currentRevision,

          role:
            currentRole,

          household:
            householdId
        }
      );


    } catch (error) {

      ready =
        false;


      console.error(
        "❌ Aurora Cloud Initialization Error:",
        error
      );


      toast(
        "Cloud sync unavailable. Local mode active."
      );

    }

  }


  /* ==========================================================
     QUEUE SAVE

     Called automatically by:
     AuroraDataStore.save()
  ========================================================== */

  function queueSave(
    database
  ) {

    if (
      applyingCloud ||
      !ready ||
      !householdId ||
      !canWrite()
    ) {

      return;

    }


    try {

      pendingSnapshot =
        cloneData(
          database
        );

    } catch (error) {

      console.error(
        "❌ Aurora Cloud Snapshot Error:",
        error
      );

      return;

    }


    if (saveTimer) {

      clearTimeout(
        saveTimer
      );

    }


    /*
      Combine rapid edits into one cloud write.
    */

    saveTimer =
      setTimeout(
        () => {

          saveTimer =
            null;

          flushSave();

        },
        700
      );

  }


  /* ==========================================================
     FLUSH QUEUED SAVE
  ========================================================== */

  async function flushSave() {

    if (
      !pendingSnapshot ||
      !ready ||
      !canWrite()
    ) {

      return;

    }


    if (saving) {
      return;
    }


    const snapshot =
      pendingSnapshot;


    pendingSnapshot =
      null;


    await saveNow(
      snapshot
    );


    /*
      More changes may have happened while
      previous request was in flight.
    */

    if (pendingSnapshot) {

      queueSave(
        pendingSnapshot
      );

    }

  }


  /* ==========================================================
     CLOUD SAVE
  ========================================================== */

  async function saveNow(
    database
  ) {

    if (
      !database ||
      !householdId ||
      !canWrite()
    ) {

      return null;

    }


    if (saving) {

      pendingSnapshot =
        cloneData(
          database
        );

      return null;

    }


    const client =
      getAuroraSupabaseClient();


    if (!client) {
      return null;
    }


    saving =
      true;


    try {

      const {
        data,
        error
      } =
        await client.rpc(
          "aurora_save_house_data",
          {

            p_household_id:
              householdId,

            p_data:
              database,

            p_expected_revision:
              currentRevision

          }
        );


      if (error) {

        /*
          Conflict means another device/admin
          saved before this device.
        */

        if (
          String(
            error.message ||
            ""
          )
            .toLowerCase()
            .includes(
              "revision"
            ) ||
          String(
            error.message ||
            ""
          )
            .toLowerCase()
            .includes(
              "another device"
            )
        ) {

          createLocalBackup(
            "cloud-conflict"
          );


          console.warn(
            "⚠️ Aurora cloud conflict detected."
          );


          await reloadFromCloud(
            true
          );


          toast(
            "Cloud changed on another device. Latest version loaded."
          );


          return null;

        }


        throw error;

      }


      const result =
        Array.isArray(data)
          ? data[0]
          : data;


      if (
        result?.revision != null
      ) {

        currentRevision =
          Number(
            result.revision
          );

      }


      console.log(
        "☁️ Aurora Cloud Saved:",
        {
          revision:
            currentRevision
        }
      );


      return result;


    } catch (error) {

      console.error(
        "❌ Aurora Cloud Save Error:",
        error
      );


      toast(
        "Cloud save failed. Local copy preserved."
      );


      return null;


    } finally {

      saving =
        false;


      if (
        remoteRefreshQueued
      ) {

        remoteRefreshQueued =
          false;


        reloadFromCloud(
          false
        );

      }

    }

  }


  /* ==========================================================
     RELOAD FROM CLOUD
  ========================================================== */

  async function reloadFromCloud(
    force = false
  ) {

    if (
      !householdId ||
      !ready
    ) {

      return;

    }


    try {

      const cloudRow =
        await fetchCloudData();


      if (!cloudRow?.data) {
        return;
      }


      const remoteRevision =
        Number(
          cloudRow.revision ||
          0
        );


      if (
        !force &&
        remoteRevision <=
        currentRevision
      ) {

        return;

      }


      if (saving) {

        remoteRefreshQueued =
          true;

        return;

      }


      currentRevision =
        remoteRevision;


      applyCloudDatabase(
        cloudRow.data
      );


      console.log(
        "🔄 Aurora realtime cloud update:",
        currentRevision
      );


    } catch (error) {

      console.error(
        "❌ Aurora Cloud Reload Error:",
        error
      );

    }

  }


  /* ==========================================================
     REALTIME
  ========================================================== */

  function subscribeRealtime() {

    const client =
      getAuroraSupabaseClient();


    if (
      !client ||
      !householdId
    ) {

      return;

    }


    stopRealtime();


    realtimeChannel =
      client
        .channel(
          `aurora-cloud-${householdId}`
        )
        .on(
          "postgres_changes",
          {

            event:
              "*",

            schema:
              "public",

            table:
              "aurora_data",

            filter:
              `household_id=eq.${householdId}`

          },

          payload => {

            const remoteRevision =
              Number(
                payload?.new
                  ?.revision ||
                0
              );


            /*
              Ignore known revision / own echo.
            */

            if (
              remoteRevision &&
              remoteRevision <=
              currentRevision
            ) {

              return;

            }


            if (saving) {

              remoteRefreshQueued =
                true;

              return;

            }


            reloadFromCloud(
              false
            );

          }
        )
        .subscribe(
          status => {

            console.log(
              "📡 Aurora Realtime:",
              status
            );


            if (
              status ===
              "SUBSCRIBED"
            ) {

              /*
                Realtime is primary.
                Polling is safety fallback.
              */

              startFallbackPolling();


              /*
                Immediately check whether
                another device changed data
                while channel was connecting.
              */

              reloadFromCloud(
                false
              );

            }

          }
        );

  }


  /* ==========================================================
   FALLBACK LIVE SYNC

   Realtime miss করলেও refresh লাগবে না.
  ========================================================== */

  function startFallbackPolling() {

    stopFallbackPolling();


    pollTimer =
      setInterval(
        async () => {

          if (
            !ready ||
            !householdId ||
            saving ||
            document.visibilityState !==
            "visible"
          ) {

            return;

          }


          await reloadFromCloud(
            false
          );

        },
        5000
      );


    console.log(
      "🔄 Aurora Auto Sync Fallback: ACTIVE"
    );

  }


  function stopFallbackPolling() {

    if (!pollTimer) {
      return;
    }


    clearInterval(
      pollTimer
    );


    pollTimer =
      null;

  }

  function stopRealtime() {

    stopFallbackPolling();
    
    if (!realtimeChannel) {
      return;
    }


    const client =
      getAuroraSupabaseClient();


    try {

      client
        ?.removeChannel(
          realtimeChannel
        );

    } catch (_) { }


    realtimeChannel =
      null;

  }


  /* ==========================================================
     STOP CLOUD SESSION
  ========================================================== */

  function stop() {

    ready =
      false;


    householdId =
      null;


    currentRole =
      "member";


    currentRevision =
      0;


    initializedUserId =
      null;


    pendingSnapshot =
      null;


    saving =
      false;


    remoteRefreshQueued =
      false;


    if (saveTimer) {

      clearTimeout(
        saveTimer
      );

      saveTimer =
        null;

    }


    stopRealtime();

  }


  /* ==========================================================
     DEBUG STATUS
  ========================================================== */

  function status() {

    return {

      ready,

      householdId,

      role:
        currentRole,

      canWrite:
        canWrite(),

      revision:
        currentRevision,

      saving

    };

  }


  return {

    initialize,

    stop,

    queueSave,

    reloadFromCloud,

    status

  };

})();


window.AuroraCloudSync =
  AuroraCloudSync;


/* ============================================================
   AURORA // GLOBAL PERMISSION ENGINE
============================================================ */

const AuroraPermissions = (() => {

  function status() {

    return (
      window.AuroraCloudSync
        ?.status?.() ||
      {}
    );

  }


  function role() {

    return String(
      status().role ||
      "member"
    )
      .toLowerCase()
      .trim();

  }


  function isOwner() {

    return (
      role() === "owner"
    );

  }


  function isAdmin() {

    return (
      role() === "admin"
    );

  }


  function isMember() {

    return (
      role() === "member"
    );

  }


  function canManage() {

    return (
      isOwner() ||
      isAdmin()
    );

  }


  function canAccessControl() {

    return canManage();

  }


  function canRemoveGoogleMember() {

    return isOwner();

  }


  function canTransferOwnership() {

    return isOwner();

  }


  function requireManage(
    message =
      "MEMBER // VIEW ONLY"
  ) {

    if (canManage()) {
      return true;
    }


    toast(
      message
    );


    console.warn(
      "🔒 Aurora permission denied:",
      role()
    );


    return false;

  }


  return {

    status,

    role,

    isOwner,

    isAdmin,

    isMember,

    canManage,

    canAccessControl,

    canRemoveGoogleMember,

    canTransferOwnership,

    requireManage

  };

})();


window.AuroraPermissions =
  AuroraPermissions;


/* ============================================================
   AURORA // AUTOMATIC MEMBER VIEW-ONLY GUARD
   No manual button tagging required
============================================================ */

const AuroraMemberGuard = (() => {

  let noticeLocked = false;


  /* ==========================================================
     MEMBER CHECK
  ========================================================== */

  function isMember() {

    const status =
      window.AuroraCloudSync
        ?.status?.();


    return (
      status?.ready === true &&
      String(
        status?.role || ""
      ).toLowerCase() === "member"
    );

  }


  /* ==========================================================
     NOTICE
  ========================================================== */

  function showNotice() {

    if (noticeLocked) {
      return;
    }


    noticeLocked = true;


    toast(
      "MEMBER // VIEW ONLY — Only Owner/Admin can modify data."
    );


    setTimeout(
      () => {

        noticeLocked = false;

      },
      900
    );

  }


  /* ==========================================================
     ELEMENT INFORMATION
  ========================================================== */

  function getElementInfo(
    element
  ) {

    const target =
      element?.closest?.(
        "button, a, input, select, textarea, [role='button']"
      );


    if (!target) {

      return {
        target: null,
        text: "",
        id: "",
        classes: "",
        onclick: ""
      };

    }


    return {

      target,

      text:
        String(
          target.textContent ||
          target.value ||
          target.title ||
          target.getAttribute(
            "aria-label"
          ) ||
          ""
        )
          .toLowerCase()
          .trim(),

      id:
        String(
          target.id ||
          ""
        ).toLowerCase(),

      classes:
        String(
          target.className ||
          ""
        ).toLowerCase(),

      onclick:
        String(
          target.getAttribute(
            "onclick"
          ) ||
          ""
        ).toLowerCase()

    };

  }


  /* ==========================================================
     SAFE / VIEW-ONLY CONTROLS

     Member may use these.
  ========================================================== */

  function isAllowedControl(
    element
  ) {

    const info =
      getElementInfo(
        element
      );


    const target =
      info.target;


    if (!target) {
      return true;
    }


    /* -----------------------------------------
       CLOSE / CANCEL
    ----------------------------------------- */

    if (
      info.classes.includes(
        "modal-close"
      ) ||

      info.id.includes(
        "close"
      ) ||

      info.text === "×" ||

      info.text === "close" ||

      info.text === "cancel"
    ) {

      return true;

    }


    /* -----------------------------------------
       NAVIGATION
    ----------------------------------------- */

    if (
      target.closest(
        "nav, .sidebar, .nav, .bottom-nav"
      ) ||

      target.hasAttribute(
        "data-page"
      )
    ) {

      return true;

    }


    /* -----------------------------------------
       PROFILE / SIGN OUT
    ----------------------------------------- */

    if (
      info.id.includes(
        "profile"
      ) ||

      info.id.includes(
        "signout"
      ) ||

      info.text.includes(
        "sign out"
      )
    ) {

      return true;

    }


    /* -----------------------------------------
       MONTH VIEW / FILTER / SEARCH

       These change only what member is viewing,
       not accounting data.
    ----------------------------------------- */

    if (
      info.id.includes(
        "month"
      ) ||

      info.id.includes(
        "search"
      ) ||

      info.id.includes(
        "filter"
      ) ||

      info.classes.includes(
        "search"
      ) ||

      info.classes.includes(
        "filter"
      )
    ) {

      return true;

    }


    /* -----------------------------------------
       EXPORT / DOWNLOAD REPORT
    ----------------------------------------- */

    if (
      info.text.includes(
        "export"
      ) ||

      info.text.includes(
        "download"
      ) ||

      info.onclick.includes(
        "export"
      )
    ) {

      return true;

    }


    return false;

  }


  /* ==========================================================
     DETECT WRITE ACTION AUTOMATICALLY
  ========================================================== */

  function isWriteAction(
    element
  ) {

    if (
      isAllowedControl(
        element
      )
    ) {

      return false;

    }


    const info =
      getElementInfo(
        element
      );


    if (!info.target) {
      return false;
    }


    const combined =
      [
        info.text,
        info.id,
        info.classes,
        info.onclick
      ]
        .join(" ")
        .toLowerCase();


    /*
      Aurora write/action keywords.
    */

    const WRITE_WORDS = [

      "add",
      "save",
      "edit",
      "delete",
      "remove",
      "create",
      "update",

      "submit",
      "record",
      "log",

      "invite",
      "revoke",

      "admin",
      "ownership",
      "transfer",

      "reset",
      "restore",
      "import",

      "activate",
      "deactivate",

      "approve",
      "reject",

      "payment",
      "expense",
      "bill",

      "makeadmin",
      "make-admin",
      "removeadmin",
      "remove-admin"

    ];


    if (
      WRITE_WORDS.some(
        word =>
          combined.includes(
            word
          )
      )
    ) {

      return true;

    }


    /* -----------------------------------------
       MEAL MATRIX INPUT
    ----------------------------------------- */

    if (
      info.target.matches(
        ".meal-input"
      )
    ) {

      return true;

    }


    /* -----------------------------------------
       FORM SUBMIT BUTTON
    ----------------------------------------- */

    if (
      info.target.matches(
        "button[type='submit'], input[type='submit']"
      )
    ) {

      return true;

    }


    return false;

  }


  /* ==========================================================
     CLICK BLOCKER
     Capture phase = runs before existing Aurora listeners.
  ========================================================== */

  document.addEventListener(
    "click",
    event => {

      if (!isMember()) {
        return;
      }


      if (
        !isWriteAction(
          event.target
        )
      ) {

        return;

      }


      event.preventDefault();

      event.stopPropagation();

      event.stopImmediatePropagation();


      showNotice();

    },
    true
  );


  /* ==========================================================
     FORM SUBMIT BLOCKER
  ========================================================== */

  document.addEventListener(
    "submit",
    event => {

      if (!isMember()) {
        return;
      }


      event.preventDefault();

      event.stopPropagation();

      event.stopImmediatePropagation();


      showNotice();

    },
    true
  );


  /* ==========================================================
     INPUT EDIT BLOCKER

     Mainly protects Meal Matrix and any accounting input
     already visible on screen.
  ========================================================== */

  document.addEventListener(
    "beforeinput",
    event => {

      if (!isMember()) {
        return;
      }


      const target =
        event.target;


      if (
        !(target instanceof HTMLElement)
      ) {

        return;

      }


      if (
        isAllowedControl(
          target
        )
      ) {

        return;

      }


      if (
        target.matches(
          "input, textarea, .meal-input"
        )
      ) {

        event.preventDefault();

        showNotice();

      }

    },
    true
  );


  /* ==========================================================
     SELECT / CHECKBOX / RADIO BLOCKER
  ========================================================== */

  document.addEventListener(
    "change",
    event => {

      if (!isMember()) {
        return;
      }


      const target =
        event.target;


      if (
        !(target instanceof HTMLElement)
      ) {

        return;

      }


      if (
        isAllowedControl(
          target
        )
      ) {

        return;

      }


      if (
        target.matches(
          "select, input[type='checkbox'], input[type='radio'], .meal-input"
        )
      ) {

        event.preventDefault();

        event.stopPropagation();

        event.stopImmediatePropagation();


        showNotice();


        /*
          Restore authoritative cloud state.
        */

        setTimeout(
          () => {

            window.AuroraCloudSync
              ?.reloadFromCloud?.(
                true
              );

          },
          0
        );

      }

    },
    true
  );


  /* ==========================================================
     KEYBOARD PROTECTION
  ========================================================== */

  document.addEventListener(
    "keydown",
    event => {

      if (!isMember()) {
        return;
      }


      const target =
        event.target;


      if (
        !(target instanceof HTMLElement)
      ) {

        return;

      }


      if (
        isAllowedControl(
          target
        )
      ) {

        return;

      }


      if (
        target.matches(
          "input, textarea, select, .meal-input"
        )
      ) {

        const allowedKeys = [
          "Tab",
          "Escape",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown"
        ];


        if (
          allowedKeys.includes(
            event.key
          )
        ) {

          return;

        }


        event.preventDefault();

        event.stopPropagation();


        showNotice();

      }

    },
    true
  );


  /* ==========================================================
     PUBLIC API
  ========================================================== */

  return {

    isMember,

    showNotice,

    isWriteAction

  };

})();


window.AuroraMemberGuard =
  AuroraMemberGuard;




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
    activity: "Activity Log",
    versions: "Version History",
    settings: "Settings",
    profile: "Profile"
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
  dashboard: "Command Center",
  meals: "Daily Meals",
  members: "Members",
  expenses: "Meal Expenses",
  payments: "Payments",
  bills: "House Bills",
  reports: "Monthly Report",
  settlement: "Settlement",
  activity: "Activity Log",
  versions: "Version History",
  settings: "Settings",
  profile: "Profile"
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
   AURORA // MONTH LOCK CONTROLLER
============================================================ */

const AuroraMonthLock = (() => {

  const ACCOUNTING_PAGES =
    new Set([
      "dashboard",
      "meals",
      "expenses",
      "payments",
      "bills",
      "reports",
      "settlement"
    ]);


  function cloud() {

    return (
      window.AuroraCloudSync
        ?.status?.() || {}
    );

  }


  function monthKey() {

    const value =
      String(
        AuroraApp.getCurrentMonth() || ""
      ).trim();


    if (
      /^\d{4}-(0[1-9]|1[0-2])$/
        .test(value)
    ) {

      return value;

    }


    console.error(
      "❌ Aurora Month Lock: invalid current month",
      value
    );


    return "";

  }


  function monthData() {

    const database =
      AuroraDataStore.get();

    const month =
      monthKey();


    if (
      !database ||
      !month
    ) {

      return null;

    }


    return (
      database.months?.[
      month
      ] || null
    );

  }


  function isLocked() {

    return (
      monthData()?.closed === true
    );

  }


  function canManage() {

    const role =
      String(
        cloud().role || ""
      ).toLowerCase();

    return (
      role === "owner" ||
      role === "admin"
    );

  }


  function monthName() {

    const key =
      monthKey();


    if (!key) {

      return "CURRENT MONTH";

    }


    return monthLabel(
      key
    ).toUpperCase();

  }


  /* ==========================================================
     LOCK / UNLOCK
  ========================================================== */

  async function setLock(
    locked
  ) {

    const status =
      cloud();

    const month =
      monthKey();


    if (
      !/^\d{4}-(0[1-9]|1[0-2])$/
        .test(month)
    ) {

      console.error(
        "❌ Aurora Month Lock: invalid month",
        {
          month,
          currentMonth:
            window.AuroraApp
              ?.getCurrentMonth?.()
        }
      );

      toast(
        "Invalid month cycle. Please select the month again."
      );

      return;

    }

    if (
      !status.ready ||
      !status.householdId
    ) {

      toast(
        "Cloud session is not ready."
      );

      return;

    }


    if (
      !canManage()
    ) {

      toast(
        "MEMBER // VIEW ONLY"
      );

      return;

    }


    const action =
      locked
        ? "LOCK"
        : "UNLOCK";


    const confirmed =
      await auroraConfirm({

        eyebrow:
          "AURORA // MONTH CONTROL",

        title:
          `${action} ${monthName()}?`,

        message:
          locked

            ? `MONTH // ${month}\n\n` +
            `Meals, expenses, payments, bills and rent will become read-only.\n` +
            `Owner or Admin can unlock this month later.`

            : `MONTH // ${month}\n\n` +
            `Accounting modifications will be enabled again for this month.`,

        confirmText:
          locked
            ? "🔒 LOCK MONTH"
            : "🔓 UNLOCK MONTH",

        cancelText:
          "CANCEL",

        danger:
          false

      });


    if (!confirmed) {
      return;
    }


    const client =
      window
        .getAuroraSupabaseClient
        ?.();


    if (!client) {
      return;
    }


    try {

      toast(
        locked
          ? "Locking month..."
          : "Unlocking month..."
      );


      const {
        data,
        error
      } =
        await client.rpc(
          "aurora_set_month_lock",
          {

            p_household_id:
              status.householdId,

            p_month:
              month,

            p_locked:
              Boolean(
                locked
              ),

            p_expected_revision:
              Number(
                status.revision
              )

          }
        );


      if (error) {
        throw error;
      }


      console.log(
        "🔐 Aurora Month Lock:",
        data
      );


      await window
        .AuroraCloudSync
        ?.reloadFromCloud?.(
          true
        );


      toast(
        locked
          ? `${monthName()} LOCKED`
          : `${monthName()} UNLOCKED`
      );


      render();


      if (
        typeof AuroraActivity !==
        "undefined"
      ) {

        AuroraActivity
          .load?.(
            false
          );

      }

    }

    catch (error) {

      console.error(
        "Aurora Month Lock Error:",
        error
      );


      const message =
        String(
          error?.message || ""
        );


      if (
        message.includes(
          "VERSION_CONFLICT"
        )
      ) {

        toast(
          "Cloud data changed. Refreshing..."
        );


        await window
          .AuroraCloudSync
          ?.reloadFromCloud?.(
            true
          );


        render();

        return;

      }


      if (
        message.includes(
          "MONTH_NOT_FOUND"
        )
      ) {

        toast(
          "This month has no accounting data yet."
        );

        return;

      }


      toast(
        error?.message ||
        "Month lock operation failed."
      );

    }

  }


  /* ==========================================================
     MONTH LOCK UI
  ========================================================== */

  function renderControl() {

    const monthSelector =
      document.getElementById(
        "monthSelect"
      );


    if (!monthSelector) {
      return;
    }


    let control =
      document.getElementById(
        "auroraMonthLockControl"
      );


    if (!control) {

      control =
        document.createElement(
          "div"
        );

      control.id =
        "auroraMonthLockControl";

      control.className =
        "aurora-month-lock-control";


      monthSelector.insertAdjacentElement(
        "afterend",
        control
      );

    }


    const locked =
      isLocked();


    const manager =
      canManage();


    control.classList.toggle(
      "is-locked",
      locked
    );


    control.innerHTML = `

    <div
      class="aurora-month-lock-stack"
    >

      ${manager

        ? `
            <button
              type="button"
              class="aurora-month-lock-action"
              id="auroraMonthLockButton"
            >
              ${locked
          ? "🔓 UNLOCK MONTH"
          : "🔒 LOCK MONTH"
        }
            </button>
          `

        : `
            <span
              class="aurora-month-lock-view"
            >
              VIEW ONLY
            </span>
          `
      }


      <span
        class="
          aurora-month-lock-state
          ${locked
        ? "locked"
        : "open"
      }
        "
      >
        ${locked
        ? "● LOCKED"
        : "● OPEN"
      }
      </span>

    </div>

  `;


    const button =
      document.getElementById(
        "auroraMonthLockButton"
      );


    if (button) {

      button.addEventListener(
        "click",
        () => {

          setLock(
            !locked
          );

        }
      );

    }

  }


  /* ==========================================================
     BLOCK MESSAGE
  ========================================================== */

  let noticeLock =
    false;


  function showLockedNotice() {

    if (noticeLock) {
      return;
    }


    noticeLock =
      true;


    toast(
      `🔒 ${monthName()} // MONTH LOCKED`
    );


    setTimeout(
      () => {

        noticeLock =
          false;

      },
      900
    );

  }



  /* ==========================================================
   VISUAL LOCK STATE
========================================================== */

  function applyVisualState() {

    /*
      First clear previous visual state.
      Important when switching from locked
      month to open month.
    */

    document
      .querySelectorAll(
        ".aurora-lock-disabled"
      )
      .forEach(
        element => {

          element.classList.remove(
            "aurora-lock-disabled"
          );

          element.removeAttribute(
            "data-aurora-lock-label"
          );

        }
      );


    if (!isLocked()) {
      return;
    }


    const activePage =
      document.querySelector(
        ".page.active"
      );


    if (!activePage) {
      return;
    }


    /*
      Find possible write controls
    */

    const controls =
      activePage.querySelectorAll(

        `
        button,
        input,
        textarea,
        select,
        [role="button"]
      `

      );


    controls.forEach(
      element => {

        /*
          Do not dim controls that are
          still safe to use.
        */

        if (
          isAllowed(
            element
          )
        ) {

          return;

        }


        if (
          isWriteAction(
            element
          ) ||
          element.classList.contains(
            "meal-input"
          )
        ) {

          element.classList.add(
            "aurora-lock-disabled"
          );


          element.setAttribute(
            "data-aurora-lock-label",
            "MONTH LOCKED"
          );

        }

      }
    );

  }


  /* ==========================================================
     CHECK WHETHER CURRENT PAGE IS ACCOUNTING
  ========================================================== */

  function accountingPage() {

    const active =
      document
        .querySelector(
          ".page.active"
        )
        ?.id
        ?.replace(
          "page-",
          ""
        );


    return ACCOUNTING_PAGES
      .has(
        active
      );

  }


  /* ==========================================================
     ALLOWED CONTROLS
  ========================================================== */

  function isAllowed(
    element
  ) {

    if (!element) {
      return true;
    }


    if (
      element.id ===
      "monthSelect" ||

      element.id ===
      "auroraMonthLockBtn"
    ) {

      return true;

    }


    if (
      element.closest(
        "#nav"
      ) ||

      element.closest(
        ".nav-item"
      ) ||

      element.matches?.(
        "[data-page]"
      )
    ) {

      return true;

    }


    /*
      Reports / preview / filtering remain usable.
    */

    const text =
      String(
        (
          element.textContent ||
          element.value ||
          element.id ||
          ""
        )
      ).toLowerCase();


    if (
      text.includes(
        "preview"
      ) ||

      text.includes(
        "refresh"
      ) ||

      text.includes(
        "print"
      ) ||

      text.includes(
        "export"
      ) ||

      text.includes(
        "download"
      ) ||

      text.includes(
        "close"
      ) ||

      text.includes(
        "cancel"
      )
    ) {

      return true;

    }


    return false;

  }


  /* ==========================================================
     WRITE ACTION DETECTOR
  ========================================================== */

  function isWriteAction(
    element
  ) {

    if (!element) {
      return false;
    }


    const info = [

      element.id,
      element.name,
      element.className,
      element.textContent,
      element.value,
      element.getAttribute?.(
        "onclick"
      )

    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();


    const keywords = [

      "add day",
      "add first day",
      "save meal",
      "edit meal",
      "delete meal",

      "add expense",
      "save expense",
      "delete expense",

      "record payment",
      "save payment",
      "delete payment",

      "add bill",
      "save bill",
      "delete bill",

      "add rent",
      "save rent",
      "delete rent",

      "reset month",

      "meal-input"

    ];


    return keywords.some(
      keyword =>
        info.includes(
          keyword
        )
    );

  }


  /* ==========================================================
     GLOBAL CLICK GUARD
  ========================================================== */

  document.addEventListener(
    "click",
    event => {

      if (
        !isLocked() ||
        !accountingPage()
      ) {

        return;

      }


      const element =
        event.target.closest(
          "button, a, [role='button'], input, select, textarea"
        );


      if (
        !element ||
        isAllowed(
          element
        )
      ) {

        return;

      }


      if (
        !isWriteAction(
          element
        )
      ) {

        return;

      }


      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();


      showLockedNotice();

    },
    true
  );


  /* ==========================================================
     FORM SUBMIT GUARD
  ========================================================== */

  document.addEventListener(
    "submit",
    event => {

      if (
        !isLocked() ||
        !accountingPage()
      ) {

        return;

      }


      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();


      showLockedNotice();

    },
    true
  );


  /* ==========================================================
     MEAL INPUT GUARD
  ========================================================== */

  document.addEventListener(
    "beforeinput",
    event => {

      if (
        !isLocked()
      ) {

        return;

      }


      const input =
        event.target.closest?.(
          ".meal-input"
        );


      if (!input) {
        return;
      }


      event.preventDefault();


      showLockedNotice();

    },
    true
  );


  document.addEventListener(
    "change",
    event => {

      if (
        !isLocked()
      ) {

        return;

      }


      const input =
        event.target.closest?.(
          ".meal-input"
        );


      if (!input) {
        return;
      }


      event.preventDefault();
      event.stopImmediatePropagation();


      showLockedNotice();


      window
        .AuroraCloudSync
        ?.reloadFromCloud?.(
          true
        );

    },
    true
  );


  return {

    render:
      renderControl,

    applyVisualState,

    setLock,

    isLocked,

    canManage,

    monthKey

  };

})();


window.AuroraMonthLock =
  AuroraMonthLock;


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
       Monthly Lock Status UI
    -------------------------------------------------------- */

    if (
      typeof AuroraMonthLock !==
      "undefined"
    ) {

      AuroraMonthLock.render();

    }


    /* --------------------------------------------------------
       Current page renderer
    -------------------------------------------------------- */

    switch (currentPage) {

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


      case "activity":

        if (
          typeof renderActivity ===
          "function"
        ) {
          renderActivity();
        }

        break;


      case "versions":

        if (
          typeof renderVersions ===
          "function"
        ) {
          renderVersions();
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


      case "profile":

        if (
          typeof renderProfile ===
          "function"
        ) {
          renderProfile();
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


    /* --------------------------------------------------------
       Apply locked visual state AFTER page rendering
    -------------------------------------------------------- */

    if (
      typeof AuroraMonthLock !==
      "undefined"
    ) {

      AuroraMonthLock
        .applyVisualState();

    }

  }

  catch (error) {

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
   AURORA // PROFILE
============================================================ */

async function renderProfile() {

  const page =
    document.getElementById(
      "page-profile"
    );


  if (!page) {

    console.error(
      "Aurora Profile: #page-profile not found."
    );

    return;
  }


  /* ----------------------------------------------------------
     LOADING UI
  ---------------------------------------------------------- */

  page.innerHTML = `

    <div class="profile-page">

      <div class="profile-core">

        <div class="profile-header">

          <div>

            <span class="profile-header-label">
              AURORA // IDENTITY CORE
            </span>

            <h1>
              Profile
            </h1>

            <div class="profile-header-description">
              Account identity and access control
            </div>

          </div>


          <button
            class="profile-back-btn"
            type="button"
            onclick="go('dashboard')"
            title="Back"
          >
            ×
          </button>

        </div>


        <div
          id="profileContent"
          class="profile-loading"
        >
          INITIALIZING IDENTITY CORE...
        </div>

      </div>

    </div>

  `;


  try {

    /* --------------------------------------------------------
       GET CURRENT SUPABASE USER
    -------------------------------------------------------- */

    const {
      data: {
        user
      },
      error
    } =
      await supabaseClient
        .auth
        .getUser();


    if (error) {
      throw error;
    }


    if (!user) {

      document.getElementById(
        "profileContent"
      ).innerHTML = `

        <div class="empty">

          <div class="emoji">
            🔐
          </div>

          <h3>
            Authentication Required
          </h3>

          <p class="muted">
            Please sign in with Google.
          </p>

        </div>

      `;

      return;
    }


    /* --------------------------------------------------------
       GOOGLE USER DATA
    -------------------------------------------------------- */

    const metadata =
      user.user_metadata || {};


    const name =
      metadata.full_name ||
      metadata.name ||
      "Aurora User";


    const email =
      user.email ||
      "No email";


    const avatar =
      metadata.avatar_url ||
      metadata.picture ||
      "";


    /* --------------------------------------------------------
       PROFILE DATABASE
    -------------------------------------------------------- */

    let profile = null;


    const {
      data: profileData,
      error: profileError
    } =
      await supabaseClient

        .from("profiles")

        .select("*")

        .eq(
          "id",
          user.id
        )

        .maybeSingle();


    if (!profileError) {

      profile = profileData;

    }


    /* --------------------------------------------------------
   AURORA // SECURE DYNAMIC ROLE + HOUSE LOOKUP
-------------------------------------------------------- */

    let role = "member";
    let roleLabel = "MEMBER";

    let houseName = "Aurora Bachelor";
    let householdId = null;

    try {

      /* ======================================================
         MEMBERSHIP IS THE SOURCE OF TRUTH
      ====================================================== */

      const {
        data: membership,
        error: membershipError
      } = await supabaseClient
        .from("house_members")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();


      if (membershipError) {

        console.error(
          "❌ Aurora Membership Lookup Error:",
          membershipError
        );

      }


      /* ======================================================
         USER HAS HOUSE MEMBERSHIP
      ====================================================== */

      if (membership) {

        const membershipRole =
          String(
            membership.role || "member"
          )
            .toLowerCase()
            .trim();


        /* ROLE */

        if (membershipRole === "owner") {

          role = "owner";
          roleLabel = "OWNER";

        } else if (
          membershipRole === "admin"
        ) {

          role = "admin";
          roleLabel = "ADMIN";

        } else {

          role = "member";
          roleLabel = "MEMBER";
        }


        /* HOUSEHOLD */

        householdId =
          membership.household_id || null;


        /* Older schema fallback */

        if (membership.house_name) {

          houseName =
            membership.house_name;
        }


        /* HOUSEHOLD TABLE LOOKUP */

        if (householdId) {

          const {
            data: household,
            error: householdError
          } = await supabaseClient
            .from("households")
            .select("id, name, owner_id")
            .eq("id", householdId)
            .maybeSingle();


          if (
            !householdError &&
            household
          ) {

            houseName =
              household.name ||
              houseName;


            /*
             * SECURITY CHECK:
             * OWNER role must also match households.owner_id
             */

            if (role === "owner") {

              if (
                household.owner_id !== user.id
              ) {

                console.warn(
                  "⚠️ Invalid owner membership detected."
                );

                role = "member";
                roleLabel = "MEMBER";
              }
            }
          }
        }

      } else {

        /* ====================================================
           NO MEMBERSHIP
           New Google users are NOT owners automatically
        ==================================================== */

        role = "member";
        roleLabel = "MEMBER";

        houseName = "Not assigned";
        householdId = null;

        console.log(
          "👤 Aurora User has no house membership."
        );
      }


      console.log(
        "🛡 Aurora Role:",
        roleLabel
      );

      console.log(
        "🏠 Aurora House:",
        houseName
      );

      console.log(
        "🏠 Aurora Household ID:",
        householdId
      );


    } catch (error) {

      console.error(
        "❌ Aurora Role / House Lookup Error:",
        error
      );

      role = "member";
      roleLabel = "MEMBER";

      houseName = "Not assigned";
      householdId = null;
    }

    /* --------------------------------------------------------
       AVATAR
    -------------------------------------------------------- */

    let avatarHTML = `

      <div
        class="profile-avatar"
        style="
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:32px;
        "
      >
        👤
      </div>

    `;


    if (avatar) {

      avatarHTML = `

        <img
          src="${esc(avatar)}"
          class="profile-avatar"
          alt="Aurora Profile"
        >

      `;

    }


    /* --------------------------------------------------------
       PROFILE UI
    -------------------------------------------------------- */

    const content =
      document.getElementById(
        "profileContent"
      );


    content.className = "";


    content.innerHTML = `

      <!-- IDENTITY -->

      <div class="profile-identity">

        <div class="profile-avatar-wrap">

          ${avatarHTML}

          <span
            class="profile-online"
          ></span>

        </div>


        <div>

          <div class="profile-authenticated">
            ● AUTHENTICATED
          </div>


          <h2 class="profile-name">
            ${esc(name)}
          </h2>


          <p class="profile-email">
            ${esc(email)}
          </p>

        </div>

      </div>


      <!-- INFORMATION -->

      <div class="profile-info-grid">


        <div class="profile-info-card">

          <span class="profile-info-label">
            ACCESS LEVEL
          </span>

          <strong
            class="profile-info-value profile-role"
          >
            ${esc(roleLabel)}
          </strong>

        </div>


        <div class="profile-info-card">

          <span class="profile-info-label">
            HOUSE
          </span>

          <strong class="profile-info-value">
            ${esc(houseName)}
          </strong>

        </div>


        <div class="profile-info-card">

          <span class="profile-info-label">
            ACCOUNT STATUS
          </span>

          <strong class="profile-info-value profile-role">
            ACTIVE
          </strong>

        </div>


        <div class="profile-info-card">

          <span class="profile-info-label">
            AUTH PROVIDER
          </span>

          <strong class="profile-info-value">
            GOOGLE
          </strong>

        </div>


      </div>


      <!-- USER ID -->

      <div class="profile-id">

        <span class="profile-id-label">
          AURORA USER ID
        </span>

        <code>
          ${esc(user.id)}
        </code>

      </div>


      <!-- ACTIONS -->

      <div class="profile-actions">


        <button
          class="profile-action"
          type="button"
          onclick="go('settings')"
        >
          ⚙ SETTINGS
        </button>


        <button
          class="profile-action signout"
          type="button"
          id="profileSignOutBtn"
        >
          ⇥ SIGN OUT
        </button>


      </div>

    `;


    /* --------------------------------------------------------
       SIGN OUT
    -------------------------------------------------------- */

    const signOutBtn =
      document.getElementById(
        "profileSignOutBtn"
      );


    if (signOutBtn) {

      signOutBtn.addEventListener(
        "click",
        async () => {

          signOutBtn.disabled =
            true;

          signOutBtn.textContent =
            "SIGNING OUT...";


          const {
            error: signOutError
          } =
            await supabaseClient
              .auth
              .signOut();


          if (signOutError) {

            console.error(
              "Aurora Sign Out Error:",
              signOutError
            );


            signOutBtn.disabled =
              false;

            signOutBtn.textContent =
              "⇥ SIGN OUT";

            return;
          }


          window.location.reload();

        }
      );

    }


  }

  catch (error) {

    console.error(
      "Aurora Profile Error:",
      error
    );


    const content =
      document.getElementById(
        "profileContent"
      );


    if (content) {

      content.innerHTML = `

        <div class="empty">

          <div class="emoji">
            ⚠️
          </div>

          <h3>
            Profile Error
          </h3>

          <p class="muted">
            ${esc(
        error?.message ||
        "Unable to load profile."
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

function modal( title, body) {

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
   AURORA // FUTURISTIC CONFIRMATION
============================================================ */

function auroraConfirm({
  eyebrow = "AURORA // SECURITY PROTOCOL",
  title = "Confirm Action",
  message = "",
  confirmText = "CONFIRM",
  cancelText = "CANCEL",
  danger = false
} = {}) {

  return new Promise(resolve => {

    const root =
      document.getElementById(
        "modalRoot"
      );

    if (!root) {
      resolve(false);
      return;
    }


    root.innerHTML = `

      <div
        class="modal-backdrop aurora-confirm-backdrop"
        id="auroraConfirmBackdrop"
      >

        <div
          class="aurora-confirm-modal"
          role="dialog"
          aria-modal="true"
        >

          <div
            class="aurora-confirm-scanline"
          ></div>


          <div
            class="aurora-confirm-header"
          >

            <div>

              <span
                class="aurora-confirm-eyebrow"
              >
                ${esc(eyebrow)}
              </span>

              <h2>
                ${esc(title)}
              </h2>

            </div>


            <button
              type="button"
              class="aurora-confirm-close"
              id="auroraConfirmClose"
            >
              ×
            </button>

          </div>


          <div
            class="aurora-confirm-icon
            ${danger ? "danger" : ""}"
          >

            ${danger
        ? "!"
        : "◇"
      }

          </div>


          <div
            class="aurora-confirm-message"
          >
            ${String(message)
        .split("\n")
        .map(
          line =>
            `<p>${esc(line)}</p>`
        )
        .join("")
      }
          </div>


          <div
            class="aurora-confirm-warning"
          >

            <span>
              SYSTEM CHECK
            </span>

            <strong>
              ${danger
        ? "HIGH IMPACT ACTION"
        : "VERIFICATION REQUIRED"
      }
            </strong>

          </div>


          <div
            class="aurora-confirm-actions"
          >

            <button
              type="button"
              class="btn aurora-confirm-cancel"
              id="auroraConfirmCancel"
            >
              ${esc(cancelText)}
            </button>


            <button
              type="button"
              class="
                btn
                aurora-confirm-accept
                ${danger
        ? "danger"
        : ""
      }
              "
              id="auroraConfirmAccept"
            >
              ${esc(confirmText)}
            </button>

          </div>

        </div>

      </div>

    `;


    let finished = false;


    function finish(value) {

      if (finished) {
        return;
      }

      finished = true;

      root.innerHTML = "";

      resolve(value);

    }


    document
      .getElementById(
        "auroraConfirmAccept"
      )
      ?.addEventListener(
        "click",
        () => finish(true)
      );


    document
      .getElementById(
        "auroraConfirmCancel"
      )
      ?.addEventListener(
        "click",
        () => finish(false)
      );


    document
      .getElementById(
        "auroraConfirmClose"
      )
      ?.addEventListener(
        "click",
        () => finish(false)
      );


    document
      .getElementById(
        "auroraConfirmBackdrop"
      )
      ?.addEventListener(
        "click",
        event => {

          if (
            event.target.id ===
            "auroraConfirmBackdrop"
          ) {

            finish(false);

          }

        }
      );


    function escapeHandler(event) {

      if (
        event.key === "Escape"
      ) {

        document.removeEventListener(
          "keydown",
          escapeHandler
        );

        finish(false);

      }

    }


    document.addEventListener(
      "keydown",
      escapeHandler
    );

  });

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
   AURORA BACHELOR — DASHBOARD V4
   Separate Meal Account + House Account
============================================================ */

/* ============================================================
   AURORA // SMART COMMAND DASHBOARD
============================================================ */

function renderDashboard() {

  const page =
    document.getElementById(
      "page-dashboard"
    );


  if (!page) {
    return;
  }


  /* ==========================================================
     CORE DATA
  ========================================================== */

  const activeMonth =
    AuroraApp.getCurrentMonth();


  const database =
    AuroraDataStore.get();


  const month =
    AuroraDataStore.getMonth(
      activeMonth
    );


  const members =
    AuroraDataStore.getMembers();


  /* ==========================================================
     MEAL INTELLIGENCE
  ========================================================== */

  const totalMeals =
    AuroraMealAccount
      .totalMeals();


  const mealExpense =
    AuroraMealAccount
      .totalExpense();


  const mealRate =
    AuroraMealAccount
      .mealRate();


  const mealDays =
    (
      month
        ?.mealAccount
        ?.meals ||
      []
    )
      .filter(
        day => {

          const values =
            Object.values(
              day?.values || {}
            );


          return values.some(
            value =>
              Number(
                value || 0
              ) > 0
          );

        }
      )
      .length;


  /* ==========================================================
     TOP MEAL MEMBER
  ========================================================== */

  const mealRanking =
    members
      .map(
        member => ({

          ...member,

          meals:
            AuroraMealAccount
              .memberMeals(
                member.id
              )

        })
      )
      .sort(
        (a, b) =>
          b.meals -
          a.meals
      );


  const topMealMember =
    mealRanking[0];


  const topMealText =
    topMealMember &&
      topMealMember.meals > 0

      ? topMealMember.name

      : "No data";


  const topMealSub =
    topMealMember &&
      topMealMember.meals > 0

      ? `${topMealMember.meals} meals`

      : "No meals recorded";


  /* ==========================================================
     FINANCIAL INTELLIGENCE
  ========================================================== */

  const houseCost =
    AuroraHouseAccount
      .totalCost();


  const totalPaid =
    AuroraPaymentAccount
      .total();


  /*
    Keep this aligned with Aurora's current
    meal + house accounting formula.
  */

  const totalExpense =
    mealExpense +
    houseCost;


  const outstanding =
    Math.max(
      0,
      totalExpense -
      totalPaid
    );


  const paymentCoverage =
    totalExpense > 0

      ? Math.min(
        100,
        (
          totalPaid /
          totalExpense
        ) * 100
      )

      : 0;


  /* ==========================================================
     SETTLEMENT INTELLIGENCE
  ========================================================== */

  const memberBalances =
    members
      .map(
        member => {

          const mealBalance =
            AuroraMealAccount
              .memberBalance(
                member.id
              );


          const houseBalance =
            AuroraHouseAccount
              .memberBalance(
                member.id
              );


          return {

            id:
              member.id,

            name:
              member.name,

            amount:
              mealBalance +
              houseBalance

          };

        }
      );


  const attentionMembers =
    memberBalances
      .filter(
        item =>
          Math.abs(
            item.amount
          ) > 0.01
      )
      .sort(
        (a, b) =>
          Math.abs(
            b.amount
          ) -
          Math.abs(
            a.amount
          )
      )
      .slice(
        0,
        5
      );


  /* ==========================================================
     MONTH STATUS
  ========================================================== */

  const monthLocked =
    month?.closed ===
    true;


  let cloudStatus = {};


  try {

    cloudStatus =
      window
        .AuroraCloudSync
        ?.status?.() ||
      {};

  }

  catch (error) {

    cloudStatus = {};

  }


  const revision =
    Number(
      cloudStatus
        ?.revision ||
      0
    );


  const cloudReady =
    cloudStatus
      ?.ready ===
    true;


  const role =
    String(
      cloudStatus
        ?.role ||
      "member"
    )
      .toUpperCase();


  /* ==========================================================
     RENDER
  ========================================================== */

  page.innerHTML = `

    <!-- =====================================================
         COMMAND HERO
    ====================================================== -->

    <section
      class="aurora-intel-hero"
    >

      <div>

        <span
          class="aurora-intel-eyebrow"
        >
          AURORA //
          ${esc(
    monthLabel(
      activeMonth
    ).toUpperCase()
  )}
        </span>


        <h2>
          House Command Center
        </h2>


        <p>
          Live household intelligence,
          accounting health and settlement
          signals in one orbit.
        </p>

      </div>


      <div
        class="aurora-intel-rate"
      >

        <span>
          LIVE MEAL RATE
        </span>

        <strong>
          ${money(
    mealRate
  )}
        </strong>

        <small>
          PER MEAL
        </small>

      </div>

    </section>



    <!-- =====================================================
         FINANCIAL SNAPSHOT
    ====================================================== -->

    <div
      class="aurora-intel-section-head"
    >

      <div>

        <span>
          FINANCIAL CORE
        </span>

        <h3>
          Monthly Snapshot
        </h3>

      </div>

      <button
        type="button"
        onclick="go('payments')"
      >
        OPEN LEDGER →
      </button>

    </div>


    <div
      class="aurora-intel-grid"
    >

      <article
        class="
          aurora-intel-card
          cyan
        "
      >

        <span>
          TOTAL EXPENSE
        </span>

        <strong>
          ${money(
    totalExpense
  )}
        </strong>

        <small>
          Meal + house account
        </small>

      </article>


      <article
        class="
          aurora-intel-card
          green
        "
      >

        <span>
          TOTAL PAID
        </span>

        <strong>
          ${money(
    totalPaid
  )}
        </strong>

        <small>
          Recorded contributions
        </small>

      </article>


      <article
        class="
          aurora-intel-card
          amber
        "
      >

        <span>
          OUTSTANDING
        </span>

        <strong>
          ${money(
    outstanding
  )}
        </strong>

        <small>
          Remaining account gap
        </small>

      </article>


      <article
        class="
          aurora-intel-card
          purple
        "
      >

        <span>
          PAYMENT COVERAGE
        </span>

        <strong>
          ${paymentCoverage
      .toFixed(
        1
      )}%
        </strong>

        <div
          class="aurora-intel-progress"
        >

          <i
            style="
              width:
              ${paymentCoverage}%;
            "
          ></i>

        </div>

      </article>

    </div>



    <!-- =====================================================
         MEAL INTELLIGENCE
    ====================================================== -->

    <div
      class="aurora-intel-section-head"
    >

      <div>

        <span>
          CONSUMPTION NETWORK
        </span>

        <h3>
          Meal Intelligence
        </h3>

      </div>

      <button
        type="button"
        onclick="go('meals')"
      >
        VIEW MATRIX →
      </button>

    </div>


    <div
      class="aurora-intel-grid"
    >

      <article
        class="aurora-intel-card blue"
      >

        <span>
          TOTAL MEALS
        </span>

        <strong>
          ${totalMeals}
        </strong>

        <small>
          Current cycle
        </small>

      </article>


      <article
        class="aurora-intel-card cyan"
      >

        <span>
          MEAL RATE
        </span>

        <strong>
          ${money(
        mealRate
      )}
        </strong>

        <small>
          Per meal
        </small>

      </article>


      <article
        class="aurora-intel-card green"
      >

        <span>
          ACTIVE MEAL DAYS
        </span>

        <strong>
          ${mealDays}
        </strong>

        <small>
          Days with recorded meals
        </small>

      </article>


      <article
        class="aurora-intel-card purple"
      >

        <span>
          HIGHEST CONSUMPTION
        </span>

        <strong
          class="aurora-intel-name"
        >
          ${esc(
        topMealText
      )}
        </strong>

        <small>
          ${esc(
        topMealSub
      )}
        </small>

      </article>

    </div>



    <!-- =====================================================
         LOWER INTELLIGENCE GRID
    ====================================================== -->

    <div
      class="aurora-intel-lower"
    >

      <!-- ===================================================
           SETTLEMENT ALERT
      ==================================================== -->

      <section
        class="aurora-intel-panel"
      >

        <div
          class="aurora-intel-panel-head"
        >

          <div>

            <span>
              SETTLEMENT SIGNALS
            </span>

            <h3>
              Attention Required
            </h3>

          </div>


          <button
            type="button"
            onclick="go('settlement')"
          >
            OPEN →
          </button>

        </div>


        ${attentionMembers.length

      ? `

              <div
                class="aurora-intel-balance-list"
              >

                ${attentionMembers
        .map(
          member => {

            const receive =
              member.amount >
              0;


            return `

                        <div
                          class="
                            aurora-intel-balance-row
                            ${receive
                ? "receive"
                : "pay"
              }
                          "
                        >

                          <div>

                            <strong>
                              ${esc(
                member.name
              )}
                            </strong>

                            <span>
                              ${receive
                ? "RECEIVE"
                : "PAY"
              }
                            </span>

                          </div>


                          <strong>
                            ${money(
                Math.abs(
                  member.amount
                )
              )}
                          </strong>

                        </div>

                      `;

          }
        )
        .join("")}

              </div>

            `

      : `

              <div
                class="
                  aurora-intel-clear
                "
              >

                <span>
                  ✓
                </span>

                <div>

                  <strong>
                    Accounts Balanced
                  </strong>

                  <p>
                    No settlement action
                    is currently required.
                  </p>

                </div>

              </div>

            `
    }

      </section>



      <!-- ===================================================
           SYSTEM HEALTH
      ==================================================== -->

      <section
        class="aurora-intel-panel"
      >

        <div
          class="aurora-intel-panel-head"
        >

          <div>

            <span>
              SYSTEM CORE
            </span>

            <h3>
              Month Status
            </h3>

          </div>

        </div>


        <div
          class="aurora-intel-system"
        >

          <div
            class="aurora-intel-system-row"
          >

            <span>
              ACCOUNTING CYCLE
            </span>

            <strong
              class="
                ${monthLocked
      ? "locked"
      : "open"
    }
              "
            >
              ${monthLocked
      ? "● LOCKED"
      : "● OPEN"
    }
            </strong>

          </div>


          <div
            class="aurora-intel-system-row"
          >

            <span>
              CLOUD CORE
            </span>

            <strong
              class="
                ${cloudReady
      ? "online"
      : "waiting"
    }
              "
            >
              ${cloudReady
      ? "● SYNCED"
      : "◇ CONNECTING"
    }
            </strong>

          </div>


          <div
            class="aurora-intel-system-row"
          >

            <span>
              CLOUD REVISION
            </span>

            <strong>
              ${revision > 0
      ? `REV ${revision}`
      : "REV —"
    }
            </strong>

          </div>


          <div
            class="aurora-intel-system-row"
          >

            <span>
              ACCESS LEVEL
            </span>

            <strong>
              ${esc(
      role
    )}
            </strong>

          </div>


          <div
            class="aurora-intel-system-row"
          >

            <span>
              ACTIVE MEMBERS
            </span>

            <strong>
              ${members.length}
            </strong>

          </div>

        </div>

      </section>

    </div>

  `;
  AuroraDashboardSignals.mount();

}


/* ============================================================
   AURORA // DASHBOARD SIGNAL INTELLIGENCE
============================================================ */

const AuroraDashboardSignals = (() => {

  let requestToken = 0;


  /* ==========================================================
     HOUSEHOLD ID
  ========================================================== */

  async function getHouseholdId() {

    try {

      const cloud =
        window.AuroraCloudSync
          ?.status?.() || {};


      const cloudHouseId =
        cloud.householdId ||
        cloud.household_id ||
        cloud.houseId ||
        null;


      if (cloudHouseId) {

        return cloudHouseId;

      }


      const supabase =
        getAuroraSupabaseClient();


      if (!supabase) {

        return null;

      }


      const {
        data: {
          user
        }
      } =
        await supabase.auth
          .getUser();


      if (!user) {

        return null;

      }


      /* ------------------------------------------------------
         MEMBER LOOKUP
      ------------------------------------------------------ */

      const {
        data:
        membership
      } =
        await supabase

          .from(
            "house_members"
          )

          .select(
            "household_id"
          )

          .eq(
            "user_id",
            user.id
          )

          .limit(
            1
          )

          .maybeSingle();


      if (
        membership
          ?.household_id
      ) {

        return (
          membership
            .household_id
        );

      }


      /* ------------------------------------------------------
         OWNER FALLBACK
      ------------------------------------------------------ */

      const {
        data:
        household
      } =
        await supabase

          .from(
            "households"
          )

          .select(
            "id"
          )

          .eq(
            "owner_id",
            user.id
          )

          .limit(
            1
          )

          .maybeSingle();


      return (
        household?.id ||
        null
      );

    }

    catch (error) {

      console.warn(
        "Aurora dashboard household lookup:",
        error
      );


      return null;

    }

  }


  /* ==========================================================
     TIME AGO
  ========================================================== */

  function timeAgo(
    value
  ) {

    if (!value) {

      return "—";

    }


    const timestamp =
      new Date(
        value
      ).getTime();


    if (
      Number.isNaN(
        timestamp
      )
    ) {

      return "—";

    }


    const seconds =
      Math.max(
        0,
        Math.floor(
          (
            Date.now() -
            timestamp
          ) / 1000
        )
      );


    if (
      seconds < 10
    ) {

      return "JUST NOW";

    }


    if (
      seconds < 60
    ) {

      return (
        `${seconds}S AGO`
      );

    }


    const minutes =
      Math.floor(
        seconds / 60
      );


    if (
      minutes < 60
    ) {

      return (
        `${minutes}M AGO`
      );

    }


    const hours =
      Math.floor(
        minutes / 60
      );


    if (
      hours < 24
    ) {

      return (
        `${hours}H AGO`
      );

    }


    const days =
      Math.floor(
        hours / 24
      );


    return (
      `${days}D AGO`
    );

  }


  /* ==========================================================
     ACTIVITY ICON
  ========================================================== */

  function activityIcon(
    type
  ) {

    const value =
      String(
        type || ""
      ).toUpperCase();


    if (
      value.includes(
        "PAYMENT"
      )
    ) {

      return "৳";

    }


    if (
      value.includes(
        "EXPENSE"
      )
    ) {

      return "＋";

    }


    if (
      value.includes(
        "MEAL"
      )
    ) {

      return "◉";

    }


    if (
      value.includes(
        "BILL"
      )
    ) {

      return "▣";

    }


    if (
      value.includes(
        "RENT"
      )
    ) {

      return "⌂";

    }


    if (
      value.includes(
        "LOCKED"
      )
    ) {

      return "🔒";

    }


    if (
      value.includes(
        "UNLOCKED"
      )
    ) {

      return "🔓";

    }


    if (
      value.includes(
        "VERSION"
      )
    ) {

      return "↶";

    }


    if (
      value.includes(
        "ROLE"
      ) ||
      value.includes(
        "OWNER"
      )
    ) {

      return "♢";

    }


    if (
      value.includes(
        "INVITATION"
      )
    ) {

      return "✉";

    }


    if (
      value.includes(
        "MEMBER"
      )
    ) {

      return "◇";

    }


    return "·";

  }


  /* ==========================================================
     ACTIVITY CLASS
  ========================================================== */

  function activityClass(
    type
  ) {

    const value =
      String(
        type || ""
      ).toUpperCase();


    if (
      value.includes(
        "DELETED"
      ) ||
      value.includes(
        "REMOVED"
      ) ||
      value.includes(
        "REVOKED"
      )
    ) {

      return "danger";

    }


    if (
      value.includes(
        "PAYMENT"
      ) ||
      value.includes(
        "CONNECTED"
      ) ||
      value.includes(
        "ACCEPTED"
      )
    ) {

      return "green";

    }


    if (
      value.includes(
        "LOCK"
      ) ||
      value.includes(
        "ROLE"
      ) ||
      value.includes(
        "VERSION"
      ) ||
      value.includes(
        "OWNER"
      )
    ) {

      return "purple";

    }


    if (
      value.includes(
        "BILL"
      ) ||
      value.includes(
        "RENT"
      )
    ) {

      return "amber";

    }


    return "cyan";

  }


  /* ==========================================================
     SMART ALERTS
  ========================================================== */

  function alerts() {

    const month =
      AuroraDataStore
        .getMonth(
          AuroraApp
            .getCurrentMonth()
        );


    const members =
      AuroraDataStore
        .getMembers();


    const mealExpense =
      AuroraMealAccount
        .totalExpense();


    const houseCost =
      AuroraHouseAccount
        .totalCost();


    const totalExpense =
      mealExpense +
      houseCost;


    const totalPaid =
      AuroraPaymentAccount
        .total();


    const totalMeals =
      AuroraMealAccount
        .totalMeals();


    const outstanding =
      Math.max(
        0,
        totalExpense -
        totalPaid
      );


    const result = [];


    /* --------------------------------------------------------
       MONTH LOCK
    -------------------------------------------------------- */

    if (
      month?.closed ===
      true
    ) {

      result.push({

        type:
          "locked",

        icon:
          "🔒",

        title:
          "Accounting cycle locked",

        text:
          `${monthLabel(
            AuroraApp
              .getCurrentMonth()
          )} is currently read only.`

      });

    }


    /* --------------------------------------------------------
       OUTSTANDING
    -------------------------------------------------------- */

    if (
      outstanding >
      0.01
    ) {

      result.push({

        type:
          "warning",

        icon:
          "!",

        title:
          "Outstanding balance",

        text:
          `${money(
            outstanding
          )} remains uncovered this cycle.`

      });

    }


    /* --------------------------------------------------------
       NO MEALS
    -------------------------------------------------------- */

    if (
      totalMeals <= 0
    ) {

      result.push({

        type:
          "info",

        icon:
          "◉",

        title:
          "No meal activity",

        text:
          "No meals have been recorded for this cycle."

      });

    }


    /* --------------------------------------------------------
       MEMBER SETTLEMENT
    -------------------------------------------------------- */

    const unsettled =
      members.filter(
        member => {

          const balance =
            AuroraMealAccount
              .memberBalance(
                member.id
              ) +

            AuroraHouseAccount
              .memberBalance(
                member.id
              );


          return (
            Math.abs(
              balance
            ) >
            0.01
          );

        }
      );


    if (
      unsettled.length >
      0
    ) {

      result.push({

        type:
          "signal",

        icon:
          "◇",

        title:
          "Settlement pending",

        text:
          `${unsettled.length} member${unsettled.length === 1
            ? ""
            : "s"
          } currently have unsettled balances.`

      });

    }


    /* --------------------------------------------------------
       ALL CLEAR
    -------------------------------------------------------- */

    if (
      result.length ===
      0
    ) {

      result.push({

        type:
          "clear",

        icon:
          "✓",

        title:
          "System clear",

        text:
          "No immediate accounting alerts detected."

      });

    }


    return result
      .slice(
        0,
        4
      );

  }


  /* ==========================================================
     ALERT HTML
  ========================================================== */

  function renderAlerts() {

    const list =
      document.getElementById(
        "auroraDashboardAlerts"
      );


    if (!list) {

      return;

    }


    list.innerHTML =
      alerts()
        .map(
          alert => `

            <div
              class="
                aurora-dash-alert
                ${alert.type}
              "
            >

              <span
                class="
                  aurora-dash-alert-icon
                "
              >
                ${alert.icon}
              </span>


              <div>

                <strong>
                  ${esc(
            alert.title
          )}
                </strong>

                <p>
                  ${esc(
            alert.text
          )}
                </p>

              </div>

            </div>

          `
        )
        .join("");

  }


  /* ==========================================================
     RECENT ACTIVITY
  ========================================================== */

  async function loadActivity(
    token
  ) {

    const container =
      document.getElementById(
        "auroraDashboardActivity"
      );


    if (!container) {

      return;

    }


    try {

      const householdId =
        await getHouseholdId();


      if (
        token !==
        requestToken
      ) {

        return;

      }


      if (!householdId) {

        container.innerHTML = `

          <div
            class="aurora-dash-empty"
          >
            CLOUD SIGNAL UNAVAILABLE
          </div>

        `;

        return;

      }


      const supabase =
        getAuroraSupabaseClient();


      if (!supabase) {

        return;

      }


      const {
        data,
        error
      } =
        await supabase.rpc(
          "aurora_get_activity",
          {

            p_household_id:
              householdId,

            p_limit:
              5

          }
        );


      if (error) {

        throw error;

      }


      if (
        token !==
        requestToken
      ) {

        return;

      }


      const rows =
        Array.isArray(
          data
        )
          ? data
          : [];


      if (
        rows.length ===
        0
      ) {

        container.innerHTML = `

          <div
            class="aurora-dash-empty"
          >

            <span>◇</span>

            <strong>
              No activity yet
            </strong>

            <p>
              New Aurora events will
              appear here.
            </p>

          </div>

        `;

        return;

      }


      container.innerHTML =
        rows
          .map(
            item => {

              const type =
                item.event_type ||
                "";


              const actor =
                item.actor_name ||
                item.actor_email ||
                "AURORA SYSTEM";


              return `

                <div
                  class="
                    aurora-dash-activity-row
                    ${activityClass(
                type
              )}
                  "
                >

                  <span
                    class="
                      aurora-dash-activity-icon
                    "
                  >
                    ${activityIcon(
                type
              )}
                  </span>


                  <div
                    class="
                      aurora-dash-activity-copy
                    "
                  >

                    <strong>
                      ${esc(
                item.title ||
                "Aurora Activity"
              )}
                    </strong>


                    <div>

                      <span>
                        ${esc(
                actor
              )}
                      </span>


                      ${item.actor_role

                  ? `
                            <span>
                              ${esc(
                    String(
                      item.actor_role
                    )
                      .toUpperCase()
                  )}
                            </span>
                          `

                  : ""
                }


                      <span>
                        ${timeAgo(
                  item.created_at
                )}
                      </span>


                      ${item.revision

                  ? `
                            <span>
                              REV ${Number(
                    item.revision
                  )}
                            </span>
                          `

                  : ""
                }

                    </div>

                  </div>

                </div>

              `;

            }
          )
          .join("");

    }

    catch (error) {

      console.warn(
        "Aurora Dashboard Activity:",
        error
      );


      container.innerHTML = `

        <div
          class="aurora-dash-empty error"
        >
          EVENT NETWORK TEMPORARILY UNAVAILABLE
        </div>

      `;

    }

  }


  /* ==========================================================
     MOUNT
  ========================================================== */

  function mount() {

    const page =
      document.getElementById(
        "page-dashboard"
      );


    if (!page) {

      return;

    }


    requestToken += 1;


    const token =
      requestToken;


    page.insertAdjacentHTML(
      "beforeend",
      `

        <div
          class="
            aurora-dash-signals-grid
          "
        >

          <!-- ================================================
               SMART ALERTS
          ================================================= -->

          <section
            class="
              aurora-intel-panel
              aurora-dash-signal-panel
            "
          >

            <div
              class="
                aurora-intel-panel-head
              "
            >

              <div>

                <span>
                  AURORA INTELLIGENCE
                </span>

                <h3>
                  Smart Alerts
                </h3>

              </div>


              <span
                class="
                  aurora-dash-live-tag
                "
              >
                LIVE
              </span>

            </div>


            <div
              id="auroraDashboardAlerts"
              class="aurora-dash-alert-list"
            ></div>

          </section>



          <!-- ================================================
               RECENT ACTIVITY
          ================================================= -->

          <section
            class="
              aurora-intel-panel
              aurora-dash-signal-panel
            "
          >

            <div
              class="
                aurora-intel-panel-head
              "
            >

              <div>

                <span>
                  EVENT NETWORK
                </span>

                <h3>
                  Recent Signals
                </h3>

              </div>


              <button
                type="button"
                onclick="go('activity')"
              >
                VIEW ALL →
              </button>

            </div>


            <div
              id="auroraDashboardActivity"
              class="
                aurora-dash-activity-list
              "
            >

              <div
                class="aurora-dash-loading"
              >
                SCANNING EVENT NETWORK...
              </div>

            </div>

          </section>

        </div>

      `
    );


    renderAlerts();


    loadActivity(
      token
    );

  }


  return {

    mount,

    refresh:
      mount

  };

})();




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
            placeholder="e.g. Billah"
          >

        </div>


        <div class="field" style="margin-top:12px">

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

        <div
            class="field"
            style="margin-top:12px"
          >

            <label>
              GOOGLE EMAIL
            </label>

            <input
              id="memberGoogleEmail"
              type="email"
              required
              placeholder="example@gmail.com"
              autocomplete="email"
            >

            <div
              class="muted"
              style="margin-top:6px;font-size:11px"
            >
              An invitation will be sent to this Google account.
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
            Send Invitation
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

async function addMember(event) {

  event.preventDefault();


  const submitButton =
    event.submitter;


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


  const googleEmail =
    document
      .getElementById(
        "memberGoogleEmail"
      )
      ?.value
      .trim()
      .toLowerCase();


  /* =========================================
     VALIDATION
  ========================================= */

  if (!name) {

    toast(
      "Please enter member name."
    );

    return;
  }


  if (!googleEmail) {

    toast(
      "Google email is required."
    );

    return;
  }


  const database =
    AuroraDataStore.get();


  const duplicate =
    database.members.find(
      member =>
        String(
          member.googleEmail ||
          ""
        )
          .toLowerCase() ===
        googleEmail
    );


  if (duplicate) {

    toast(
      "This Google account is already registered."
    );

    return;
  }


  const client =
    getAuroraSupabaseClient();


  if (!client?.auth) {

    toast(
      "Supabase is not available."
    );

    return;
  }


  try {

    /* =========================================
       BUTTON LOADING STATE
    ========================================= */

    if (submitButton) {

      submitButton.disabled =
        true;

      submitButton.textContent =
        "Sending Invitation...";

    }


    /* =========================================
       CURRENT USER
    ========================================= */

    const {
      data: {
        user
      },
      error: userError
    } =
      await client.auth.getUser();


    if (
      userError ||
      !user
    ) {

      throw new Error(
        "Please sign in with Google first."
      );

    }


    /* =========================================
       OWNER HOUSEHOLD
    ========================================= */

    const {
      data: membership,
      error: membershipError
    } =
      await client
        .from(
          "house_members"
        )
        .select(
          "household_id, role"
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle();


    if (
      membershipError ||
      !membership?.household_id
    ) {

      throw new Error(
        "Household membership could not be found."
      );

    }


    const currentRole =
      String(
        membership.role ||
        "member"
      ).toLowerCase();


    if (
      currentRole !== "owner" &&
      currentRole !== "admin"
    ) {

      throw new Error(
        "Only the owner or an admin can invite members."
      );

    }


    /* =========================================
       SEND EMAIL INVITATION
    ========================================= */

    const {
      data: inviteResult,
      error: inviteError
    } =
      await client
        .functions
        .invoke(
          "send-house-invite",
          {

            body: {

              householdId:
                membership.household_id,

              email:
                googleEmail,

              fullName:
                name,

              phone:
                phone,

              room:
                room

            }

          }
        );


    if (inviteError) {

      console.error(
        "Aurora Invitation Error:",
        inviteError
      );


      let serverMessage =
        null;


      if (
        inviteError.context
      ) {

        try {

          const response =
            await inviteError
              .context
              .json();

          serverMessage =
            response?.error ||
            response?.message;

        } catch (_) { }

      }


      throw new Error(
        serverMessage ||
        inviteError.message ||
        "Unable to send invitation."
      );

    }


    if (
      !inviteResult?.success
    ) {

      throw new Error(
        inviteResult?.error ||
        "Invitation was not sent."
      );

    }


    /* =========================================
       ADD ACCOUNTING MEMBER LOCALLY
       ONLY AFTER INVITATION SUCCESS
    ========================================= */

    database.members.push({

      id:
        uid("m"),

      name,

      phone,

      room,

      googleEmail,

      joined:
        todayISO(),

      status:
        "active",

      inviteStatus:
        "pending",

      invitationId:
        inviteResult
          .invitationId ||
        null,

      createdAt:
        new Date()
          .toISOString()

    });


    AuroraDataStore.save();


    closeModal();


    toast(
      `Invitation sent to ${googleEmail}`
    );


    render();


    console.log(
      "✅ Aurora Member Invitation:",
      inviteResult
    );


  } catch (error) {

    console.error(
      "❌ Add Member Error:",
      error
    );


    alert(
      error?.message ||
      "Unable to add member."
    );


    if (submitButton) {

      submitButton.disabled =
        false;

      submitButton.textContent =
        "Send Invitation";

    }

  }

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

    <!-- AURORA ACCESS CONTROL -->
    <div
      id="auroraAccessControl"
      style="margin-top:20px"
    ></div>
  `;

  loadAuroraAccessControl();
}


/* ============================================================
   AURORA // ACCESS CONTROL
============================================================ */

async function loadAuroraAccessControl() {

  const root =
    document.getElementById(
      "auroraAccessControl"
    );


  if (!root) return;


  const client =
    getAuroraSupabaseClient();


  if (!client?.auth) {
    root.innerHTML = "";
    return;
  }


  try {

    const {
      data: { user },
      error: userError
    } =
      await client.auth
        .getUser();


    if (
      userError ||
      !user
    ) {

      root.innerHTML = "";
      return;
    }


    /* =========================================
       CURRENT MEMBERSHIP
    ========================================= */

    const {
      data: membership,
      error: membershipError
    } =
      await client
        .from("house_members")
        .select(
          "household_id, role"
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle();


    if (
      membershipError ||
      !membership
    ) {

      root.innerHTML = "";
      return;
    }


    /* =========================================
              REAL HOUSE OWNER CHECK
    ========================================= */

    const currentRole =
      String(
        membership.role ||
        "member"
      )
        .toLowerCase()
        .trim();


    const householdId =
      membership.household_id;


    /* GET REGISTERED HOUSE OWNER */

    const {
      data: household,
      error: householdError
    } =
      await client
        .from("households")
        .select(
          "id, owner_id, name"
        )
        .eq(
          "id",
          householdId
        )
        .maybeSingle();


    if (
      householdError ||
      !household
    ) {

      throw new Error(
        "Unable to verify household ownership."
      );

    }


    /* SOURCE OF TRUTH */

    const isOwner =
      household.owner_id ===
      user.id;


    const isAdmin =
      !isOwner &&
      currentRole ===
      "admin";


    const isManager =
      isOwner ||
      isAdmin;


    /* MEMBER CANNOT SEE ACCESS CONTROL */

    if (!isManager) {

      root.innerHTML = "";
      return;

    }


    root.innerHTML = `

      <div class="aac-shell">

        <div class="muted">
          Loading access control...
        </div>

      </div>

    `;


    /* =========================================
       CONNECTED ACCOUNTS
    ========================================= */

    const {
      data: members,
      error: membersError
    } =
      await client.rpc(
        "aurora_get_access_members",
        {
          p_household_id:
            householdId
        }
      );


    if (membersError) {
      throw membersError;
    }


    /* =========================================
       PENDING INVITATIONS
    ========================================= */

    const {
      data: pendingInvites,
      error: inviteError
    } =
      await client.rpc(
        "aurora_get_pending_invitations",
        {
          p_household_id:
            householdId
        }
      );


    if (inviteError) {
      throw inviteError;
    }


    const accessMembers =
      members || [];


    const pending =
      pendingInvites || [];


    const adminCount =
      accessMembers
        .filter(
          member =>
            member.role ===
            "admin"
        )
        .length;


    /* =========================================
       CONNECTED MEMBER ROWS
    ========================================= */

    const memberRows =
      accessMembers
        .map(
          member => {

            const name =
              esc(
                member.display_name ||
                "Aurora User"
              );


            const email =
              esc(
                member.email ||
                ""
              );


            const role =
              String(
                member.role ||
                "member"
              )
                .toLowerCase();


            const userId =
              member.user_id;


            const initial =
              name
                .charAt(0)
                .toUpperCase() ||
              "?";


            let actions = "";


            /* OWNER ACCOUNT */

            if (
              role ===
              "owner"
            ) {

              actions = `

                <button
                  class="aac-btn lock"
                  type="button"
                  disabled
                >
                  🔒 OWNER
                </button>

              `;

            }

            else {

              /* OWNER + ADMIN CAN CHANGE ADMIN ROLE */

              if (
                role ===
                "admin"
              ) {

                actions += `

                  <button
                    class="
                      aac-btn
                      remove-admin
                    "
                    type="button"
                    onclick="
                      changeAuroraMemberRole(
                        '${userId}',
                        '${householdId}',
                        'member'
                      )
                    "
                  >
                    Remove Admin
                  </button>

                `;

              }

              else {

                actions += `

                  <button
                    class="
                      aac-btn
                      make-admin
                    "
                    type="button"
                    onclick="
                      changeAuroraMemberRole(
                        '${userId}',
                        '${householdId}',
                        'admin'
                      )
                    "
                  >
                    Make Admin
                  </button>

                `;

              }


              /* OWNER ONLY */

              if (isOwner) {

                actions += `

                  <button
                    class="
                      aac-btn
                      transfer-owner
                    "
                    type="button"
                    onclick="
                      transferAuroraOwnership(
                        '${userId}',
                        '${householdId}',
                        '${encodeURIComponent(
                  member.display_name ||
                  member.email ||
                  "Member"
                )}'
                      )
                    "
                  >
                    Transfer Ownership
                  </button>


                  <button
                    class="
                      aac-btn
                      remove-member
                    "
                    type="button"
                    onclick="
                      removeAuroraConnectedMember(
                        '${userId}',
                        '${householdId}',
                        '${encodeURIComponent(
                  member.email ||
                  ""
                )}'
                      )
                    "
                  >
                    Remove Member
                  </button>

                `;

              }

            }


            return `

              <div class="aac-row">

                <div class="aac-account">

                  <div class="aac-avatar">
                    ${initial}
                  </div>


                  <div class="aac-user-meta">

                    <strong>
                      ${name}
                    </strong>

                    <span>
                      ${email}
                    </span>

                  </div>

                </div>


                <div class="aac-role">

                  <span
                    class="
                      aac-role-badge
                      ${role}
                    "
                  >
                    ${role.toUpperCase()}
                  </span>

                </div>


                <div class="aac-access">

                  <div
                    class="
                      aurora-access-actions
                    "
                  >
                    ${actions}
                  </div>

                </div>

              </div>

            `;

          }
        )
        .join("");


    /* =========================================
       PENDING INVITATION ROWS
    ========================================= */

    const invitationRows =
      pending.length

        ? pending
          .map(
            invite => {

              const name =
                esc(
                  invite.full_name ||
                  "Pending Member"
                );


              const email =
                esc(
                  invite.email ||
                  ""
                );


              return `

                <div
                  class="
                    aac-row
                    aurora-pending-row
                  "
                >

                  <div class="aac-account">

                    <div
                      class="
                        aac-avatar
                        pending-avatar
                      "
                    >
                      ⏳
                    </div>


                    <div class="aac-user-meta">

                      <strong>
                        ${name}
                      </strong>

                      <span>
                        ${email}
                      </span>

                    </div>

                  </div>


                  <div class="aac-role">

                    <span
                      class="
                        aac-role-badge
                        pending
                      "
                    >
                      PENDING
                    </span>

                  </div>


                  <div class="aac-access">

                    <button
                      class="
                        aac-btn
                        resend-invite
                      "
                      type="button"
                      aria-label="Resend invitation to ${email}"
                      onclick="
                        resendAuroraInvitation(
                          '${invite.invitation_id}',
                          '${householdId}',
                          this
                        )
                        "
                      >
                      <span aria-hidden="true">↻</span>
                      RESEND INVITE
                    </button>

                    <button
                      class="
                        aac-btn
                        remove-invite
                      "
                      type="button"
                      aria-label="Remove invitation for ${email}"
                      onclick="
                        removeAuroraInvitation(
                          '${invite.invitation_id}',
                          '${householdId}',
                          '${encodeURIComponent(
                            invite.email || ""
                          )}'
                        )
                      "
                    >
                      <span aria-hidden="true">✕</span>
                      REMOVE
                    </button>

                  </div>

                </div>

              `;

            }
          )
          .join("")

        : `

          <div
            class="
              aurora-no-pending
              muted
            "
          >
            No pending invitations.
          </div>

        `;


    /* =========================================
       FINAL UI
    ========================================= */

    root.innerHTML = `

      <div class="aurora-access-control">

        <div class="aac-shell">


          <div class="aac-header">

            <div>

              <span class="aac-kicker">
                AURORA // ACCESS CONTROL
              </span>

              <h3 class="aac-title">
                Account Permissions
              </h3>

              <p class="aac-subtitle">

                ${isOwner
        ? "Owner security console"
        : "Administrator security console"}

              </p>

            </div>


            <div class="aac-admin-count">

              <span class="aac-count-label">
                ADMINS
              </span>

              <strong>
                ${adminCount}/2
              </strong>

            </div>

          </div>


          <div class="aac-table-head">

            <div>
              ACCOUNT
            </div>

            <div>
              ROLE
            </div>

            <div>
              ACCESS
            </div>

          </div>


          ${memberRows}


          <div
            class="
              aurora-access-divider
            "
          ></div>


          <div
            class="
              aurora-pending-header
            "
          >

            <div>

              <span class="aac-kicker">
                INVITATION QUEUE
              </span>

              <h4>
                Pending Invitations
              </h4>

            </div>


            <span
              class="
                aurora-pending-count
              "
            >
              ${pending.length}
            </span>

          </div>


          ${invitationRows}


        </div>

      </div>

    `;


  } catch (error) {

    console.error(
      "❌ Aurora Access Control:",
      error
    );


    root.innerHTML = `

      <div class="aac-shell">

        <div class="negative">
          ${esc(
      error?.message ||
      "Unable to load Access Control."
    )}
        </div>

      </div>

    `;

  }

}

async function changeAuroraMemberRole(
  userId,
  householdId,
  newRole
) {

  const client =
    getAuroraSupabaseClient();

  if (!client) return;


  const label =
    newRole === "admin"
      ? "promote this member to ADMIN"
      : "change this admin back to MEMBER";


  if (
    !confirm(
      `Are you sure you want to ${label}?`
    )
  ) {
    return;
  }


  try {

    const {
      error
    } =
      await client.rpc(
        "aurora_set_member_role",
        {
          p_household_id:
            householdId,

          p_user_id:
            userId,

          p_role:
            newRole
        }
      );


    if (error) {
      throw error;
    }


    toast(
      newRole === "admin"
        ? "Member promoted to admin."
        : "Admin changed to member."
    );


    await loadAuroraAccessControl();


  } catch (error) {

    console.error(
      "❌ Aurora Role Change:",
      error
    );


    alert(
      error.message ||
      "Unable to change member role."
    );
  }
}


/* ============================================================
   OWNER ONLY // REMOVE CONNECTED MEMBER
============================================================ */

async function removeAuroraConnectedMember(
  userId,
  householdId,
  encodedEmail
) {

  const email =
    decodeURIComponent(
      encodedEmail ||
      ""
    );


  const confirmed =
    confirm(
      `Remove ${email} from Aurora Bachelor?\n\n` +
      `Their Google account will NOT be deleted.\n` +
      `Only household access will be removed.`
    );


  if (!confirmed) return;


  const client =
    getAuroraSupabaseClient();


  try {

    const {
      error
    } =
      await client.rpc(
        "aurora_remove_member",
        {

          p_household_id:
            householdId,

          p_user_id:
            userId

        }
      );


    if (error) {
      throw error;
    }


    toast(
      "Member Google access removed."
    );


    await loadAuroraAccessControl();


  } catch (error) {

    console.error(
      "❌ Remove Member:",
      error
    );


    alert(
      error?.message ||
      "Unable to remove member."
    );

  }

}



/* ============================================================
   OWNER ONLY // TRANSFER OWNERSHIP
============================================================ */

async function transferAuroraOwnership(
  userId,
  householdId,
  encodedName
) {

  const name =
    decodeURIComponent(
      encodedName ||
      "this member"
    );


  const confirmed =
    confirm(

      `TRANSFER OWNERSHIP?\n\n` +

      `${name} will become the new OWNER.\n\n` +

      `You will no longer be the household owner.\n` +

      `This action changes the highest access level.`

    );


  if (!confirmed) return;


  const secondConfirm =
    confirm(

      `FINAL CONFIRMATION\n\n` +

      `Transfer Aurora Bachelor ownership to ${name}?`

    );


  if (!secondConfirm) return;


  const client =
    getAuroraSupabaseClient();


  try {

    const {
      data,
      error
    } =
      await client.rpc(
        "aurora_transfer_ownership",
        {

          p_household_id:
            householdId,

          p_new_owner_user_id:
            userId

        }
      );


    if (error) {
      throw error;
    }


    console.log(
      "✅ Ownership transferred:",
      data
    );


    alert(
      `${name} is now the Aurora Bachelor owner.`
    );


    window.location.reload();


  } catch (error) {

    console.error(
      "❌ Ownership Transfer:",
      error
    );


    alert(
      error?.message ||
      "Unable to transfer ownership."
    );

  }

}



/* ============================================================
   OWNER + ADMIN // RESEND PENDING INVITATION
============================================================ */

async function resendAuroraInvitation(invitationId, householdId, button) {
  const email = button?.closest(".aurora-pending-row")
    ?.querySelector(".aac-user-meta span")?.textContent?.trim() || "this member";

  // The Aurora dialog handles this once its confirmation system is ready.
  if (
    !window.resendAuroraInvitation?.__auroraConfirmWrapped &&
    !confirm(`Resend invitation to ${email}?\n\nThe previous link will stop working.`)
  ) return;

  const client = getAuroraSupabaseClient();
  if (!client?.auth) {
    toast("Sign in to resend invitations.");
    return;
  }

  const originalLabel = button?.innerHTML;

  try {
    if (button) {
      button.disabled = true;
      button.textContent = "SENDING...";
    }

    // Read the current row so the email and member details cannot go stale.
    const { data: invitations, error: lookupError } = await client.rpc(
      "aurora_get_pending_invitations",
      { p_household_id: householdId }
    );
    if (lookupError) throw lookupError;

    const invitation = (invitations || [])
      .find(item => item.invitation_id === invitationId);
    if (!invitation) throw new Error("Pending invitation no longer exists.");

    const { data, error } = await client.functions.invoke(
      "send-house-invite",
      {
        body: {
          householdId,
          email: invitation.email,
          fullName: invitation.full_name || "",
          phone: invitation.phone || "",
          room: invitation.room || ""
        }
      }
    );

    if (error) {
      let detail = error.message;
      try {
        const response = await error.context?.json();
        detail = response?.error || response?.message || detail;
      } catch (_) { /* Keep the original error. */ }
      throw new Error(detail || "Unable to resend invitation.");
    }
    if (!data?.success) {
      throw new Error(data?.error || "Invitation email was not sent.");
    }

    toast(`Fresh invitation sent to ${invitation.email}.`);
    await loadAuroraAccessControl();
  } catch (error) {
    console.error("Aurora resend invitation:", error);
    alert(error?.message || "Unable to resend invitation. Please try again.");
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = originalLabel;
    }
  }
}



/* ============================================================
   OWNER + ADMIN // REMOVE PENDING INVITATION
============================================================ */

async function removeAuroraInvitation(invitationId, householdId, encodedEmail) {
  const email = decodeURIComponent(encodedEmail || "");

  // AuroraConfirmSystem handles confirmation after it is installed.
  if (
    !window.removeAuroraInvitation?.__auroraConfirmWrapped &&
    !confirm(
      `Permanently remove the pending invitation for ${email}?\n\n` +
      "Its link will stop working and the invitation record will be deleted."
    )
  ) return;

  const client = getAuroraSupabaseClient();
  if (!client?.auth) {
    toast("Sign in to remove invitations.");
    return;
  }

  try {
    const { error } = await client.rpc("aurora_remove_invitation", {
      p_household_id: householdId,
      p_invitation_id: invitationId
    });

    if (error) throw error;

    toast("Invitation removed permanently.");
    await loadAuroraAccessControl();
  } catch (error) {
    console.error("Aurora remove invitation:", error);
    alert(error?.message || "Unable to remove invitation.");
  }
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
        class="btn primary"
        type="button"
        onclick="downloadMonthlyReportPDF()"
      >
        ⇩ DOWNLOAD PDF
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
   AURORA // PDF IMAGE LOADER
============================================================ */

async function auroraLoadPDFImage(
  src
) {

  try {

    const response =
      await fetch(
        src,
        {
          cache:
            "no-store"
        }
      );


    if (
      !response.ok
    ) {

      throw new Error(
        `Image load failed: ${response.status}`
      );

    }


    const blob =
      await response.blob();


    return await new Promise(
      (
        resolve,
        reject
      ) => {

        const reader =
          new FileReader();


        reader.onload =
          () =>
            resolve(
              reader.result
            );


        reader.onerror =
          reject;


        reader.readAsDataURL(
          blob
        );

      }
    );

  }

  catch (error) {

    console.warn(
      "Aurora PDF Logo:",
      error
    );


    return null;

  }

}


/* ============================================================
   AURORA // MONTHLY PDF REPORT ENGINE
============================================================ */

async function downloadMonthlyReportPDF() {

  try {

    /* ========================================================
       PDF ENGINE CHECK
    ======================================================== */

    if (
      !window.jspdf ||
      !window.jspdf.jsPDF
    ) {

      toast(
        "PDF engine is not available."
      );

      console.error(
        "Aurora PDF: jsPDF not loaded."
      );

      return;

    }


    const {
      jsPDF
    } =
      window.jspdf;


    /* ========================================================
       ACTIVE MONTH
    ======================================================== */

    const activeMonth =
      AuroraApp
        .getCurrentMonth();


    if (!activeMonth) {

      toast(
        "No active month selected."
      );

      return;

    }


    const month =
      AuroraDataStore
        .getMonth(
          activeMonth
        );


    if (!month) {

      toast(
        "Month data not found."
      );

      return;

    }


    const members =
      AuroraDataStore
        .getMembers() || [];


    /* ========================================================
       ACCOUNT DATA
    ======================================================== */

    const mealAccount =
      month.mealAccount || {
        meals: [],
        expenses: [],
        payments: []
      };


    const houseAccount =
      month.houseAccount || {
        rent: [],
        bills: [],
        payments: []
      };


    const meals =
      mealAccount.meals || [];


    const mealExpenses =
      mealAccount.expenses || [];


    const mealPayments =
      mealAccount.payments || [];


    const rents =
      houseAccount.rent || [];


    const bills =
      houseAccount.bills || [];


    const housePayments =
      houseAccount.payments || [];


    /* ========================================================
       HELPERS
    ======================================================== */

    const number =
      value =>
        Number(
          value || 0
        );


    const pdfMoney =
      value =>
        `BDT ${number(value)
          .toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }
          )}`;


    const pdfDate =
      value => {

        if (!value) {
          return "-";
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

          return String(
            value
          );

        }


        return date
          .toLocaleDateString(
            "en-GB",
            {
              day:
                "2-digit",

              month:
                "short",

              year:
                "numeric"
            }
          );

      };


    const memberName =
      id => {

        if (!id) {
          return "-";
        }


        return (
          members.find(
            member =>
              String(
                member.id
              ) ===
              String(
                id
              )
          )
            ?.name ||
          "Unknown"
        );

      };


    /* ========================================================
       CORE CALCULATIONS
    ======================================================== */

    const totalMeals =
      AuroraMealAccount
        .totalMeals();


    const mealExpenseTotal =
      AuroraMealAccount
        .totalExpense();


    const mealRate =
      AuroraMealAccount
        .mealRate();


    const rentTotal =
      rents.reduce(
        (sum, item) =>
          sum +
          number(
            item.amount
          ),
        0
      );


    const billTotal =
      bills.reduce(
        (sum, item) =>
          sum +
          number(
            item.amount
          ),
        0
      );


    const houseCost =
      rentTotal +
      billTotal;


    const mealPaymentTotal =
      mealPayments.reduce(
        (sum, item) =>
          sum +
          number(
            item.amount
          ),
        0
      );


    const housePaymentTotal =
      housePayments.reduce(
        (sum, item) =>
          sum +
          number(
            item.amount
          ),
        0
      );


    const totalPaid =
      mealPaymentTotal +
      housePaymentTotal;


    const totalExpense =
      mealExpenseTotal +
      houseCost;


    const outstanding =
      Math.max(
        0,
        totalExpense -
        totalPaid
      );


    const houseShare =
      members.length
        ? houseCost /
        members.length
        : 0;


    /* ========================================================
       PDF DOCUMENT
    ======================================================== */

    const doc =
      new jsPDF({
        orientation:
          "landscape",

        unit:
          "mm",

        format:
          "a4"
      });


    const pageWidth =
      doc.internal
        .pageSize
        .getWidth();


    const pageHeight =
      doc.internal
        .pageSize
        .getHeight();


    const margin =
      14;


    let y =
      16;


    /* ========================================================
       COLOR SYSTEM
    ======================================================== */

    const COLORS = {

      cyan:
        [43, 205, 235],

      purple:
        [126, 95, 220],

      dark:
        [12, 21, 34],

      text:
        [38, 53, 68],

      muted:
        [105, 119, 132],

      green:
        [45, 160, 115],

      amber:
        [205, 139, 48],

      red:
        [195, 75, 91]

    };


    /* ========================================================
       PAGE NUMBER / FOOTER
    ======================================================== */

    function addFooter() {

      const pages =
        doc.internal
          .getNumberOfPages();


      for (
        let i = 2;
        i <= pages;
        i++
      ) {

        doc.setPage(
          i
        );


        doc.setDrawColor(
          220,
          226,
          232
        );


        doc.line(
          margin,
          pageHeight - 10,
          pageWidth - margin,
          pageHeight - 10
        );


        doc.setFontSize(
          7
        );


        doc.setTextColor(
          ...COLORS.muted
        );


        doc.text(
          "AURORA BACHELOR // MONTHLY ACCOUNT REPORT",
          margin,
          pageHeight - 5
        );


        doc.text(
          `PAGE ${i - 1} / ${pages - 1}`,
          pageWidth - margin,
          pageHeight - 5,
          {
            align:
              "right"
          }
        );

      }

    }


    /* ========================================================
       SECTION TITLE
    ======================================================== */

    function sectionTitle(
      code,
      title,
      description = ""
    ) {

      y += 5;


      if (
        y >
        pageHeight - 35
      ) {

        doc.addPage();

        y =
          16;

      }


      doc.setFontSize(
        7
      );


      doc.setTextColor(
        ...COLORS.cyan
      );


      doc.setFont(
        "helvetica",
        "bold"
      );


      doc.text(
        code,
        margin,
        y
      );


      y +=
        6;


      doc.setFontSize(
        14
      );


      doc.setTextColor(
        ...COLORS.dark
      );


      doc.text(
        title,
        margin,
        y
      );


      if (
        description
      ) {

        y +=
          5;


        doc.setFontSize(
          7.5
        );


        doc.setFont(
          "helvetica",
          "normal"
        );


        doc.setTextColor(
          ...COLORS.muted
        );


        doc.text(
          description,
          margin,
          y
        );

      }


      y +=
        5;

    }


    /* ========================================================
                      PREMIUM COVER PAGE
    ======================================================== */

    let logoData =
      null;


    try {

      logoData =
        await auroraLoadPDFImage(
          "./Assets/AURORA BACHELOR LOGO.png"
        );

    }

    catch (error) {

      logoData =
        null;

    }


    /* --------------------------------------------------------
       BACKGROUND
    -------------------------------------------------------- */
    doc.setFillColor(
      8,
      8,
      8
    );

    doc.rect(
      0,
      0,
      pageWidth,
      pageHeight,
      "F"
    );


    /* --------------------------------------------------------
       FUTURISTIC GLOW PANELS
    -------------------------------------------------------- */

    doc.setFillColor(
      28,
      28,
      28
    );

    doc.circle(
      pageWidth - 25,
      25,
      46,
      "F"
    );

    doc.setFillColor(
      18,
      18,
      18
    );

    doc.circle(
      18,
      pageHeight - 5,
      42,
      "F"
    );


    /* --------------------------------------------------------
       TOP ACCENT LINE
    -------------------------------------------------------- */

    doc.setDrawColor(
      ...COLORS.cyan
    );


    doc.setLineWidth(
      .6
    );


    doc.line(
      margin,
      14,
      pageWidth - margin,
      14
    );


    /* --------------------------------------------------------
       LOGO
    -------------------------------------------------------- */

    if (
      logoData
    ) {

      const format =
        String(
          logoData
        )
          .startsWith(
            "data:image/png"
          )

          ? "PNG"

          : "JPEG";


      try {

        doc.addImage(
          logoData,
          format,
          margin,
          23,
          30,
          30,
          undefined,
          "FAST"
        );

      }

      catch (error) {

        console.warn(
          "Aurora PDF Logo Render:",
          error
        );

      }

    }


    /* --------------------------------------------------------
       BRAND
    -------------------------------------------------------- */

    doc.setFont(
      "helvetica",
      "bold"
    );


    doc.setTextColor(
      ...COLORS.cyan
    );


    doc.setFontSize(
      8
    );


    doc.text(
      "AURORA // HOUSE MANAGEMENT OS",
      logoData
        ? margin + 38
        : margin,
      29
    );


    doc.setTextColor(
      255,
      255,
      255
    );


    doc.setFontSize(
      25
    );


    doc.text(
      "AURORA",
      logoData
        ? margin + 38
        : margin,
      40
    );


    doc.setFontSize(
      10
    );


    doc.setTextColor(
      170,
      195,
      215
    );


    doc.text(
      "BACHELOR HOUSE MANAGEMENT",
      logoData
        ? margin + 38
        : margin,
      47
    );


    /* --------------------------------------------------------
       REPORT IDENTITY
    -------------------------------------------------------- */

    doc.setFontSize(
      7
    );


    doc.setTextColor(
      130,
      160,
      182
    );


    doc.text(
      "FINANCIAL INTELLIGENCE // MONTHLY ARCHIVE",
      margin,
      76
    );


    doc.setTextColor(
      255,
      255,
      255
    );


    doc.setFontSize(
      29
    );


    doc.text(
      "MONTHLY",
      margin,
      92
    );


    doc.text(
      "ACCOUNT REPORT",
      margin,
      105
    );


    /* --------------------------------------------------------
       ACTIVE MONTH
    -------------------------------------------------------- */

    doc.setFontSize(
      13
    );


    doc.setTextColor(
      ...COLORS.cyan
    );


    doc.text(
      monthLabel(
        activeMonth
      ).toUpperCase(),
      margin,
      119
    );


    /* --------------------------------------------------------
       STATUS AREA
    -------------------------------------------------------- */

    const statusText =
      month?.closed
        ? "LOCKED"
        : "OPEN";


    const statusColor =
      month?.closed
        ? COLORS.amber
        : COLORS.green;


    doc.setDrawColor(
      ...statusColor
    );


    doc.setFillColor(
      9,
      20,
      32
    );


    doc.roundedRect(
      margin,
      130,
      41,
      11,
      2,
      2,
      "FD"
    );


    doc.setTextColor(
      ...statusColor
    );


    doc.setFontSize(
      7
    );


    doc.text(
      `● ${statusText}`,
      margin + 5,
      137
    );


    /* --------------------------------------------------------
       SUMMARY CARDS
    -------------------------------------------------------- */

    const coverCards = [

      {
        label:
          "TOTAL MEALS",

        value:
          String(
            totalMeals
          )
      },

      {
        label:
          "MEAL RATE",

        value:
          pdfMoney(
            mealRate
          )
      },

      {
        label:
          "TOTAL COST",

        value:
          pdfMoney(
            totalExpense
          )
      },

      {
        label:
          "TOTAL PAID",

        value:
          pdfMoney(
            totalPaid
          )
      },

      {
        label:
          "OUTSTANDING",

        value:
          pdfMoney(
            outstanding
          )
      }

    ];


    const coverGap =
      5;


    const coverWidth =
      (
        pageWidth -
        (
          margin * 2
        ) -
        (
          coverGap *
          (
            coverCards.length -
            1
          )
        )
      ) /
      coverCards.length;


    coverCards.forEach(
      (
        card,
        index
      ) => {

        const x =
          margin +
          index *
          (
            coverWidth +
            coverGap
          );


        doc.setFillColor(
          8,
          18,
          31
        );


        doc.setDrawColor(
          32,
          67,
          88
        );


        doc.roundedRect(
          x,
          153,
          coverWidth,
          24,
          2,
          2,
          "FD"
        );


        doc.setFontSize(
          6
        );


        doc.setTextColor(
          105,
          145,
          169
        );


        doc.text(
          card.label,
          x + 4,
          161
        );


        doc.setFontSize(
          10
        );


        doc.setTextColor(
          235,
          248,
          255
        );


        doc.text(
          card.value,
          x + 4,
          170
        );

      }
    );


    /* --------------------------------------------------------
       COVER FOOTER INFO
    -------------------------------------------------------- */

    doc.setFontSize(
      7
    );


    doc.setTextColor(
      98,
      126,
      146
    );


    doc.text(
      `ACTIVE MEMBERS // ${members.length}`,
      margin,
      pageHeight - 22
    );


    doc.text(
      `GENERATED // ${new Date()
        .toLocaleString(
          "en-GB"
        )
      }`,
      margin,
      pageHeight - 15
    );


    doc.setTextColor(
      ...COLORS.cyan
    );


    doc.text(
      "AURORA BACHELOR",
      pageWidth - margin,
      pageHeight - 15,
      {
        align:
          "right"
      }
    );


    /* --------------------------------------------------------
       REPORT CONTENT STARTS ON PAGE 2
    -------------------------------------------------------- */

    doc.addPage();


    y =
      18;


    /* ========================================================
       01 // MONTHLY SUMMARY
    ======================================================== */

    sectionTitle(
      "01 // FINANCIAL CORE",
      "Monthly Summary",
      "Combined Meal Account and House Account overview."
    );


    doc.autoTable({

      startY:
        y,

      theme:
        "grid",

      head: [[
        "TOTAL MEALS",
        "MEAL EXPENSE",
        "MEAL RATE",
        "HOUSE COST",
        "TOTAL COST",
        "TOTAL PAID",
        "OUTSTANDING"
      ]],

      body: [[
        String(
          totalMeals
        ),

        pdfMoney(
          mealExpenseTotal
        ),

        pdfMoney(
          mealRate
        ),

        pdfMoney(
          houseCost
        ),

        pdfMoney(
          totalExpense
        ),

        pdfMoney(
          totalPaid
        ),

        pdfMoney(
          outstanding
        )
      ]],

      styles: {
        font:
          "helvetica",

        fontSize:
          8,

        cellPadding:
          3,

        halign:
          "center"
      },

      headStyles: {
        fillColor:
          COLORS.dark,

        textColor:
          [255, 255, 255],

        fontStyle:
          "bold"
      },

      alternateRowStyles: {
        fillColor:
          [247, 250, 252]
      }

    });


    y =
      doc.lastAutoTable
        .finalY +
      5;


    /* ========================================================
       02 // MEMBER SUMMARY
    ======================================================== */

    sectionTitle(
      "02 // MEMBER NETWORK",
      "Member Account Summary",
      "Meal dues, house share, payments and final balances."
    );


    const memberRows =
      members.map(
        member => {

          const mealCount =
            AuroraMealAccount
              .memberMeals(
                member.id
              );


          const mealDue =
            mealCount *
            mealRate;


          const mealPaid =
            mealPayments

              .filter(
                payment =>
                  String(
                    payment.memberId
                  ) ===
                  String(
                    member.id
                  )
              )

              .reduce(
                (sum, payment) =>
                  sum +
                  number(
                    payment.amount
                  ),
                0
              );


          const mealBalance =
            mealPaid -
            mealDue;


          const housePaid =
            housePayments

              .filter(
                payment =>
                  String(
                    payment.memberId
                  ) ===
                  String(
                    member.id
                  )
              )

              .reduce(
                (sum, payment) =>
                  sum +
                  number(
                    payment.amount
                  ),
                0
              );


          const houseBalance =
            housePaid -
            houseShare;


          const finalBalance =
            mealBalance +
            houseBalance;


          return [

            member.name ||
            "Unknown",

            String(
              mealCount
            ),

            pdfMoney(
              mealDue
            ),

            pdfMoney(
              mealPaid
            ),

            pdfMoney(
              mealBalance
            ),

            pdfMoney(
              houseShare
            ),

            pdfMoney(
              housePaid
            ),

            pdfMoney(
              houseBalance
            ),

            pdfMoney(
              finalBalance
            )

          ];

        }
      );


    doc.autoTable({

      startY:
        y,

      theme:
        "striped",

      head: [[
        "MEMBER",
        "MEALS",
        "MEAL DUE",
        "MEAL PAID",
        "MEAL BAL.",
        "HOUSE SHARE",
        "HOUSE PAID",
        "HOUSE BAL.",
        "FINAL BAL."
      ]],

      body:
        memberRows.length
          ? memberRows
          : [[
            "No members",
            "-",
            "-",
            "-",
            "-",
            "-",
            "-",
            "-",
            "-"
          ]],

      styles: {
        fontSize:
          7.2,

        cellPadding:
          2.2
      },

      headStyles: {
        fillColor:
          COLORS.purple,

        textColor:
          [255, 255, 255]
      }

    });


    y =
      doc.lastAutoTable
        .finalY +
      5;


    /* ========================================================
       03 // DAILY MEAL MATRIX
    ======================================================== */

    sectionTitle(
      "03 // MEAL ACCOUNT",
      "Daily Meal Matrix",
      "Complete day-by-day meal consumption for the active month."
    );


    const mealHead = [
      "DATE",
      ...members.map(
        member =>
          String(
            member.name ||
            "Member"
          )
      ),
      "DAY TOTAL"
    ];


    const sortedMeals =
      [...meals]
        .sort(
          (a, b) =>
            String(
              a.date || ""
            )
              .localeCompare(
                String(
                  b.date || ""
                )
              )
        );


    const mealRows =
      sortedMeals.map(
        day => {

          let dayTotal =
            0;


          const values =
            members.map(
              member => {

                const value =
                  number(
                    day
                      ?.values
                    ?.[member.id]
                  );


                dayTotal +=
                  value;


                return String(
                  value
                );

              }
            );


          return [
            pdfDate(
              day.date
            ),
            ...values,
            String(
              dayTotal
            )
          ];

        }
      );


    doc.autoTable({

      startY:
        y,

      theme:
        "grid",

      head: [
        mealHead
      ],

      body:
        mealRows.length
          ? mealRows
          : [[
            "No meal records",
            ...members.map(
              () => "-"
            ),
            "-"
          ]],

      styles: {
        fontSize:
          7,

        cellPadding:
          2,

        halign:
          "center"
      },

      headStyles: {
        fillColor:
          COLORS.cyan,

        textColor:
          COLORS.dark
      }

    });


    y =
      doc.lastAutoTable
        .finalY +
      5;


    /* ========================================================
       04 // MEAL EXPENSES
    ======================================================== */

    sectionTitle(
      "04 // MEAL ACCOUNT",
      "Meal Expense Ledger",
      "All recorded meal-account expenses."
    );


    const mealExpenseRows =
      [...mealExpenses]

        .sort(
          (a, b) =>
            String(
              a.date || ""
            )
              .localeCompare(
                String(
                  b.date || ""
                )
              )
        )

        .map(
          expense => [

            pdfDate(
              expense.date
            ),

            expense.category ||
            "Other",

            expense.description ||
            "-",

            memberName(
              expense.paidBy
            ),

            pdfMoney(
              expense.amount
            )

          ]
        );


    doc.autoTable({

      startY:
        y,

      theme:
        "striped",

      head: [[
        "DATE",
        "CATEGORY",
        "DESCRIPTION",
        "PAID BY",
        "AMOUNT"
      ]],

      body:
        mealExpenseRows.length
          ? mealExpenseRows
          : [[
            "-",
            "-",
            "No meal expenses recorded",
            "-",
            pdfMoney(0)
          ]],

      styles: {
        fontSize:
          7.5,

        cellPadding:
          2.3
      },

      headStyles: {
        fillColor:
          COLORS.cyan,

        textColor:
          COLORS.dark
      },

      columnStyles: {
        4: {
          halign:
            "right"
        }
      }

    });


    y =
      doc.lastAutoTable
        .finalY +
      5;


    /* ========================================================
       05 // MEAL PAYMENTS
    ======================================================== */

    sectionTitle(
      "05 // MEAL ACCOUNT",
      "Meal Payment Ledger",
      "Member contributions recorded under the meal account."
    );


    const mealPaymentRows =
      [...mealPayments]

        .sort(
          (a, b) =>
            String(
              a.date || ""
            )
              .localeCompare(
                String(
                  b.date || ""
                )
              )
        )

        .map(
          payment => [

            pdfDate(
              payment.date
            ),

            memberName(
              payment.memberId
            ),

            payment.method ||
            "Cash",

            payment.reference ||
            payment.note ||
            "-",

            pdfMoney(
              payment.amount
            )

          ]
        );


    doc.autoTable({

      startY:
        y,

      theme:
        "striped",

      head: [[
        "DATE",
        "MEMBER",
        "METHOD",
        "REFERENCE / NOTE",
        "AMOUNT"
      ]],

      body:
        mealPaymentRows.length
          ? mealPaymentRows
          : [[
            "-",
            "-",
            "-",
            "No meal payments recorded",
            pdfMoney(0)
          ]],

      styles: {
        fontSize:
          7.5
      },

      headStyles: {
        fillColor:
          COLORS.green,

        textColor:
          [255, 255, 255]
      },

      columnStyles: {
        4: {
          halign:
            "right"
        }
      }

    });


    y =
      doc.lastAutoTable
        .finalY +
      5;


    /* ========================================================
       06 // HOUSE RENT
    ======================================================== */

    sectionTitle(
      "06 // HOUSE ACCOUNT",
      "House Rent Ledger",
      "Rent entries recorded for the active month."
    );


    const rentRows =
      [...rents]

        .sort(
          (a, b) =>
            String(
              a.date || ""
            )
              .localeCompare(
                String(
                  b.date || ""
                )
              )
        )

        .map(
          rent => [

            pdfDate(
              rent.date
            ),

            rent.description ||
            "House Rent",

            pdfMoney(
              rent.amount
            )

          ]
        );


    doc.autoTable({

      startY:
        y,

      theme:
        "striped",

      head: [[
        "DATE",
        "DESCRIPTION",
        "AMOUNT"
      ]],

      body:
        rentRows.length
          ? rentRows
          : [[
            "-",
            "No rent recorded",
            pdfMoney(0)
          ]],

      styles: {
        fontSize:
          7.5
      },

      headStyles: {
        fillColor:
          COLORS.amber,

        textColor:
          [255, 255, 255]
      },

      columnStyles: {
        2: {
          halign:
            "right"
        }
      }

    });


    y =
      doc.lastAutoTable
        .finalY +
      5;


    /* ========================================================
       07 // HOUSE BILLS
    ======================================================== */

    sectionTitle(
      "07 // HOUSE ACCOUNT",
      "House Bill Ledger",
      "Electricity, gas, water and all other house bills."
    );


    const billRows =
      [...bills]

        .sort(
          (a, b) =>
            String(
              a.date || ""
            )
              .localeCompare(
                String(
                  b.date || ""
                )
              )
        )

        .map(
          bill => [

            pdfDate(
              bill.date
            ),

            bill.category ||
            "Other",

            bill.description ||
            "-",

            pdfMoney(
              bill.amount
            )

          ]
        );


    doc.autoTable({

      startY:
        y,

      theme:
        "striped",

      head: [[
        "DATE",
        "CATEGORY",
        "DESCRIPTION",
        "AMOUNT"
      ]],

      body:
        billRows.length
          ? billRows
          : [[
            "-",
            "-",
            "No house bills recorded",
            pdfMoney(0)
          ]],

      styles: {
        fontSize:
          7.5
      },

      headStyles: {
        fillColor:
          COLORS.amber,

        textColor:
          [255, 255, 255]
      },

      columnStyles: {
        3: {
          halign:
            "right"
        }
      }

    });


    y =
      doc.lastAutoTable
        .finalY +
      5;


    /* ========================================================
       08 // HOUSE PAYMENTS
    ======================================================== */

    sectionTitle(
      "08 // HOUSE ACCOUNT",
      "House Payment Ledger",
      "Member payments contributed toward the house account."
    );


    const housePaymentRows =
      [...housePayments]

        .sort(
          (a, b) =>
            String(
              a.date || ""
            )
              .localeCompare(
                String(
                  b.date || ""
                )
              )
        )

        .map(
          payment => [

            pdfDate(
              payment.date
            ),

            memberName(
              payment.memberId
            ),

            payment.method ||
            "Cash",

            payment.reference ||
            payment.note ||
            "-",

            pdfMoney(
              payment.amount
            )

          ]
        );


    doc.autoTable({

      startY:
        y,

      theme:
        "striped",

      head: [[
        "DATE",
        "MEMBER",
        "METHOD",
        "REFERENCE / NOTE",
        "AMOUNT"
      ]],

      body:
        housePaymentRows.length
          ? housePaymentRows
          : [[
            "-",
            "-",
            "-",
            "No house payments recorded",
            pdfMoney(0)
          ]],

      styles: {
        fontSize:
          7.5
      },

      headStyles: {
        fillColor:
          COLORS.green,

        textColor:
          [255, 255, 255]
      },

      columnStyles: {
        4: {
          halign:
            "right"
        }
      }

    });


    y =
      doc.lastAutoTable
        .finalY +
      5;


    /* ========================================================
       09 // FINAL ACCOUNT STATUS
    ======================================================== */

    sectionTitle(
      "09 // SETTLEMENT CORE",
      "Final Account Position",
      "Closing financial position for the selected accounting cycle."
    );


    doc.autoTable({

      startY:
        y,

      theme:
        "grid",

      head: [[
        "ACCOUNT",
        "COST",
        "PAID",
        "BALANCE"
      ]],

      body: [

        [
          "MEAL ACCOUNT",

          pdfMoney(
            mealExpenseTotal
          ),

          pdfMoney(
            mealPaymentTotal
          ),

          pdfMoney(
            mealPaymentTotal -
            mealExpenseTotal
          )
        ],

        [
          "HOUSE ACCOUNT",

          pdfMoney(
            houseCost
          ),

          pdfMoney(
            housePaymentTotal
          ),

          pdfMoney(
            housePaymentTotal -
            houseCost
          )
        ],

        [
          "COMBINED TOTAL",

          pdfMoney(
            totalExpense
          ),

          pdfMoney(
            totalPaid
          ),

          pdfMoney(
            totalPaid -
            totalExpense
          )
        ]

      ],

      styles: {
        fontSize:
          8,

        cellPadding:
          3
      },

      headStyles: {
        fillColor:
          COLORS.dark,

        textColor:
          [255, 255, 255]
      },

      columnStyles: {

        1: {
          halign:
            "right"
        },

        2: {
          halign:
            "right"
        },

        3: {
          halign:
            "right"
        }

      }

    });


    /* ========================================================
       FOOTER
    ======================================================== */

    addFooter();


    /* ========================================================
       DOWNLOAD
    ======================================================== */

    const safeMonth =
      String(
        activeMonth
      )
        .replace(
          /[^0-9-]/g,
          ""
        );


    const fileName =
      `Aurora-Bachelor-Monthly-Report-${safeMonth}.pdf`;


    doc.save(
      fileName
    );


    toast(
      `${monthLabel(activeMonth)} PDF downloaded.`
    );


    console.log(
      "📄 Aurora Monthly PDF:",
      fileName
    );

  }

  catch (error) {

    console.error(
      "Aurora PDF Error:",
      error
    );


    toast(
      "PDF generation failed."
    );

  }

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
   AURORA BACHELOR // ACTIVITY NETWORK
============================================================ */

const AuroraActivity = (() => {

  let loading =
    false;

  let logs =
    [];

  let filter =
    "ALL";

  let autoRefreshTimer =
    null;


  /* ==========================================================
     CLOUD STATUS
  ========================================================== */

  function getStatus() {

    return (
      window.AuroraCloudSync
        ?.status?.() ||
      {}
    );

  }


  /* ==========================================================
     ESCAPE
  ========================================================== */

  function escapeValue(
    value
  ) {

    return String(
      value ?? ""
    )

      .replaceAll(
        "&",
        "&amp;"
      )

      .replaceAll(
        "<",
        "&lt;"
      )

      .replaceAll(
        ">",
        "&gt;"
      )

      .replaceAll(
        '"',
        "&quot;"
      )

      .replaceAll(
        "'",
        "&#039;"
      );

  }


  /* ==========================================================
     DATE / TIME
  ========================================================== */

  function formatTime(
    value
  ) {

    if (!value) {
      return "—";
    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "—";

    }


    return new Intl.DateTimeFormat(
      "en-BD",
      {

        day:
          "2-digit",

        month:
          "short",

        year:
          "numeric",

        hour:
          "2-digit",

        minute:
          "2-digit",

        second:
          "2-digit"

      }
    ).format(
      date
    );

  }


  /* ==========================================================
     EVENT ICON
  ========================================================== */

  function eventIcon(type) {

    const map = {

      DATA_CREATED: "◉",
      DATA_UPDATED: "↻",

      EXPENSE_ADDED: "＋",
      EXPENSE_UPDATED: "✎",
      EXPENSE_DELETED: "−",

      PAYMENT_ADDED: "৳",
      PAYMENT_UPDATED: "↻",
      PAYMENT_DELETED: "×",

      MEAL_ADDED: "🍚",
      MEAL_UPDATED: "✎",
      MEAL_DELETED: "×",

      BILL_ADDED: "▣",
      BILL_UPDATED: "✎",
      BILL_DELETED: "×",

      RENT_ADDED: "⌂",
      RENT_UPDATED: "✎",
      RENT_DELETED: "×",

      ACCOUNTING_MEMBER_ADDED: "＋",
      ACCOUNTING_MEMBER_UPDATED: "◉",
      ACCOUNTING_MEMBER_DELETED: "−",

      MEMBER_CONNECTED: "＋",
      MEMBER_REMOVED: "−",

      ROLE_CHANGED: "♢",
      OWNERSHIP_TRANSFERRED: "♛",

      INVITATION_CREATED: "✉",
      INVITATION_RESENT: "↗",
      INVITATION_ACCEPTED: "✓",
      INVITATION_REVOKED: "×",
      INVITATION_EXPIRED: "⌛",

      SETTINGS_UPDATED: "⚙",
      HOUSE_UPDATED: "⌂",

      MONTH_LOCKED: "🔒",
      MONTH_UNLOCKED: "🔓"

    };


    return (
      map[type] ||
      "◇"
    );

  }


  /* ==========================================================
     EVENT CLASS
  ========================================================== */

  function eventClass(type) {

    type =
      String(type || "")
        .toUpperCase();


    /* DELETE / REVOKE */

    if (
      type.includes("DELETED") ||
      type.includes("REMOVED") ||
      type.includes("REVOKED")
    ) {

      return "danger";

    }


    /* SECURITY */

    if (
      type.includes("ROLE") ||
      type.includes("OWNERSHIP") ||
      type.includes("SETTINGS")
    ) {

      return "purple";

    }


    /* PAYMENTS / SUCCESS */

    if (
      type.includes("PAYMENT") ||
      type.includes("ACCEPTED") ||
      type.includes("CONNECTED")
    ) {

      return "success";

    }


    /* HOUSE BILL / RENT */

    if (
      type.includes("BILL") ||
      type.includes("RENT")
    ) {

      return "amber";

    }


    /* MEALS */

    if (
      type.includes("MEAL")
    ) {

      return "blue";

    }


    /* MONTH */

    if (
      type.includes("MONTH")
    ) {

      return "purple";

    }


    return "cyan";

  }


  /* ==========================================================
     DETAILS
  ========================================================== */

  function renderDetails(
    item
  ) {

    const details =
      item.details &&
        typeof item.details === "object"
        ? item.details
        : {};


    const entries =
      Object.entries(
        details
      );


    if (!entries.length) {

      return "";

    }


    return `
      <div
        class="aurora-activity-details"
      >

        ${entries
        .map(
          ([key, value]) => {

            return `
                  <span>

                    <b>
                      ${escapeValue(
              key
                .replaceAll(
                  "_",
                  " "
                )
                .toUpperCase()
            )}
                    </b>

                    ${escapeValue(
              typeof value ===
                "object"
                ? JSON.stringify(
                  value
                )
                : value
            )}

                  </span>
                `;

          }
        )
        .join("")
      }

      </div>
    `;

  }


  /* ==========================================================
     FILTERED LOGS
  ========================================================== */

  function filteredLogs() {

    if (
      filter === "ALL"
    ) {

      return logs;

    }


    return logs.filter(
      item => {

        const type =
          String(
            item.event_type || ""
          ).toUpperCase();


        switch (filter) {


          case "ACCOUNTING":

            return (
              type.includes("DATA") ||
              type.includes("EXPENSE") ||
              type.includes("PAYMENT") ||
              type.includes("MEAL") ||
              type.includes("BILL") ||
              type.includes("RENT") ||
              type.includes("MONTH")
            );


          case "MEMBERS":

            return (
              type.includes("MEMBER") ||
              type === "ROLE_CHANGED"
            );


          case "INVITATIONS":

            return (
              type.includes(
                "INVITATION"
              )
            );


          case "SECURITY":

            return (
              type === "ROLE_CHANGED" ||
              type ===
              "OWNERSHIP_TRANSFERRED" ||
              type ===
              "SETTINGS_UPDATED" ||
              type ===
              "HOUSE_UPDATED" ||
              type ===
              "MONTH_LOCKED" ||
              type ===
              "MONTH_UNLOCKED"
            );


          default:

            return true;

        }

      }
    );

  }


  /* ==========================================================
     TIMELINE
  ========================================================== */

  function renderTimeline() {

    const root =
      document.getElementById(
        "auroraActivityRoot"
      );


    if (!root) {
      return;
    }


    const items =
      filteredLogs();


    root.innerHTML = `

      <div
        class="aurora-activity-toolbar"
      >

        <div>

          <strong>
            ◇ AUDIT STREAM
          </strong>

          <span>
            ${logs.length
      } EVENTS
          </span>

        </div>


        <div
          class="aurora-activity-actions"
        >

          <select
            id="activityFilter"
          >

            <option
              value="ALL"
              ${filter === "ALL"
              ? "selected"
              : ""
            }>
              ALL EVENTS
            </option>

            <option
              value="ACCOUNTING"
              ${filter ===
        "ACCOUNTING"
        ? "selected"
        : ""
      }
            >
              ACCOUNTING
            </option>

            <option
              value="MEMBERS"
              ${filter ===
        "MEMBERS"
        ? "selected"
        : ""
      }
            >
              MEMBERS
            </option>

            <option
              value="INVITATIONS"
              ${filter ===
        "INVITATIONS"
        ? "selected"
        : ""
      }
            >
              INVITATIONS
            </option>

            <option
              value="SECURITY"
              ${filter ===
        "SECURITY"
        ? "selected"
        : ""
      }
            >
              SECURITY
            </option>

          </select>


          <button
            class="btn"
            id="activityRefreshBtn"
            type="button"
          >
            ↻ REFRESH
          </button>

        </div>

      </div>


      ${items.length

        ?

        `
            <div
              class="aurora-activity-timeline"
            >

              ${items
          .map(
            item => {

              const role =
                String(
                  item.actor_role ||
                  "SYSTEM"
                ).toUpperCase();


              const actor =
                item.actor_name ||
                item.actor_email ||
                "Aurora System";


              return `

                        <article
                          class="
                            aurora-activity-event
                            ${eventClass(
                item.event_type
              )}
                          "
                        >

                          <div
                            class="aurora-activity-icon"
                          >
                            ${eventIcon(
                item.event_type
              )}
                          </div>


                          <div
                            class="aurora-activity-content"
                          >

                            <div
                              class="aurora-activity-top"
                            >

                              <div>

                                <strong>
                                  ${escapeValue(
                item.title
              )}
                                </strong>

                                <small>
                                  ${escapeValue(
                item.event_type
              )}
                                </small>

                              </div>


                              <time>

                                ${escapeValue(
                formatTime(
                  item.created_at
                )
              )}

                              </time>

                            </div>


                            <div
                              class="aurora-activity-actor"
                            >

                              <span>
                                ${escapeValue(
                actor
              )}
                              </span>

                              <b>
                                ${escapeValue(
                role
              )}
                              </b>

                              ${item.revision
                  ? `
                                      <em>
                                        REV ${Number(
                    item.revision
                  )
                  }
                                      </em>
                                    `
                  : ""
                }

                            </div>


                            ${renderDetails(
                  item
                )
                }

                          </div>

                        </article>

                      `;

            }
          )
          .join("")
        }

            </div>
          `

        :

        `
            <div
              class="card empty"
            >

              <div
                class="emoji"
              >
                ◇
              </div>

              No activity records found.

            </div>
          `
      }
    `;


    document
      .getElementById(
        "activityFilter"
      )
      ?.addEventListener(
        "change",
        event => {

          filter =
            event.target.value;

          renderTimeline();

        }
      );


    document
      .getElementById(
        "activityRefreshBtn"
      )
      ?.addEventListener(
        "click",
        () => {

          load(
            true
          );

        }
      );

  }


  /* ==========================================================
     LOADING
  ========================================================== */

  function renderLoading() {

    const root =
      document.getElementById(
        "auroraActivityRoot"
      );


    if (!root) {
      return;
    }


    root.innerHTML = `

      <div class="card">

        <div class="muted">

          ◌ Connecting to
          Aurora Audit Network...

        </div>

      </div>

    `;

  }


  /* ==========================================================
     LOAD
  ========================================================== */

  async function load(
    showLoading = false
  ) {

    if (loading) {
      return;
    }


    const status =
      getStatus();


    if (
      !status.ready ||
      !status.householdId
    ) {

      const root =
        document.getElementById(
          "auroraActivityRoot"
        );


      if (root) {

        root.innerHTML = `

          <div class="card">

            <div class="muted">

              Cloud session is not ready yet.

            </div>

          </div>

        `;

      }


      return;

    }


    const client =
      window
        .getAuroraSupabaseClient
        ?.();


    if (!client) {

      console.error(
        "Aurora Activity: Supabase client unavailable."
      );

      return;

    }


    loading =
      true;


    if (showLoading) {

      renderLoading();

    }


    try {

      const {
        data,
        error
      } =
        await client.rpc(
          "aurora_get_activity",
          {

            p_household_id:
              status.householdId,

            p_limit:
              150

          }
        );


      if (error) {

        throw error;

      }


      logs =
        Array.isArray(
          data
        )
          ? data
          : [];


      renderTimeline();

    }

    catch (
    error
    ) {

      console.error(
        "Aurora Activity Error:",
        error
      );


      const root =
        document.getElementById(
          "auroraActivityRoot"
        );


      if (root) {

        root.innerHTML = `

          <div class="card">

            <h3>
              ⚠ Activity Network Error
            </h3>

            <div class="muted">
              ${escapeValue(
          error.message ||
          "Unable to load activity."
        )}
            </div>

          </div>

        `;

      }

    }

    finally {

      loading =
        false;

    }

  }


  /* ==========================================================
     PAGE RENDER
  ========================================================== */

  function render() {

    renderLoading();

    load(
      false
    );

  }


  /* ==========================================================
     AUTO REFRESH
  ========================================================== */

  function startAutoRefresh() {

    stopAutoRefresh();


    autoRefreshTimer =
      setInterval(
        () => {

          const page =
            document.getElementById(
              "page-activity"
            );


          if (
            !page ||
            !page.classList.contains(
              "active"
            ) ||
            document.visibilityState !==
            "visible"
          ) {

            return;

          }


          load(
            false
          );

        },
        10000
      );

  }


  function stopAutoRefresh() {

    if (
      !autoRefreshTimer
    ) {

      return;

    }


    clearInterval(
      autoRefreshTimer
    );


    autoRefreshTimer =
      null;

  }


  document.addEventListener(
    "DOMContentLoaded",
    startAutoRefresh
  );


  return {

    render,

    load,

    refresh:
      () =>
        load(
          true
        )

  };

})();



function renderActivity() {

  AuroraActivity.render();

}



/* ============================================================
   AURORA // VERSION HISTORY
============================================================ */

const AuroraVersionHistory = (() => {

  let versions = [];
  let loading = false;


  function status() {

    return (
      window.AuroraCloudSync
        ?.status?.() || {}
    );

  }


  function client() {

    return window
      .getAuroraSupabaseClient
      ?.();

  }


  function canRestore() {

    return (
      status().canWrite === true
    );

  }


  function formatDate(value) {

    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      "en-BD",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(date);

  }


  function reasonLabel(reason) {

    const map = {

      INITIAL_SNAPSHOT:
        "Initial Snapshot",

      SYSTEM_BACKFILL:
        "Initial Cloud Backup",

      AUTO_SNAPSHOT:
        "Automatic Snapshot"

    };

    return (
      map[reason] ||
      reason ||
      "Snapshot"
    );

  }


  function renderLoading() {

    const root =
      document.getElementById(
        "auroraVersionRoot"
      );

    if (!root) {
      return;
    }

    root.innerHTML = `
      <div class="card">
        <div class="muted">
          ◌ Loading temporal archive...
        </div>
      </div>
    `;

  }


  function renderList() {

    const root =
      document.getElementById(
        "auroraVersionRoot"
      );

    if (!root) {
      return;
    }


    const cloud =
      status();

    const currentRevision =
      Number(
        cloud.revision || 0
      );


    root.innerHTML = `

      <div class="version-toolbar">

        <div>

          <strong>
            ⟳ TEMPORAL ARCHIVE
          </strong>

          <span>
            ${versions.length}
            SNAPSHOTS
          </span>

        </div>


        <div class="version-toolbar-actions">

          <span class="version-current-badge">
            CURRENT REV ${currentRevision}
          </span>

          <button
            class="btn"
            id="versionRefreshBtn"
            type="button"
          >
            ↻ REFRESH
          </button>

        </div>

      </div>


      ${versions.length

        ? `

            <div class="version-list">

              ${versions.map(item => {

          const revision =
            Number(
              item.revision
            );

          const isCurrent =
            revision ===
            currentRevision;

          return `

                  <article
                    class="
                      version-card
                      ${isCurrent
              ? "current"
              : ""
            }
                    "
                  >

                    <div
                      class="version-revision"
                    >

                      <span>
                        REVISION
                      </span>

                      <strong>
                        ${revision}
                      </strong>

                    </div>


                    <div
                      class="version-main"
                    >

                      <div
                        class="version-title-row"
                      >

                        <strong>
                          ${reasonLabel(
              item.reason
            )
            }
                        </strong>

                        ${isCurrent
              ? `
                              <span
                                class="version-status current"
                              >
                                CURRENT
                              </span>
                            `
              : `
                              <span
                                class="version-status archived"
                              >
                                ARCHIVED
                              </span>
                            `
            }

                      </div>


                      <div
                        class="version-meta"
                      >

                        <span>
                          ◷
                          ${formatDate(
              item.saved_at
            )
            }
                        </span>

                        <span>
                          ◉
                          ${esc(
              item.saved_by_name ||
              item.saved_by_email ||
              "Aurora System"
            )
            }
                        </span>

                      </div>

                    </div>


                    <div
                      class="version-actions"
                    >

                      <button
                        class="btn small"
                        type="button"
                        onclick="
                          previewAuroraVersion(
                            ${revision}
                          )
                        "
                      >
                        ◉ PREVIEW
                      </button>


                      <button
                        class="
                          btn
                          small
                          ${isCurrent
              ? ""
              : "primary"
            }
                        "
                        type="button"

                        ${isCurrent
              ? "disabled"
              : ""
            }

                        onclick="
                          restoreAuroraVersion(
                            ${revision}
                          )
                        "
                      >
                        ${isCurrent
              ? "CURRENT"
              : "↶ RESTORE"
            }
                      </button>

                    </div>

                  </article>

                `;

        }).join("")}

            </div>

          `

        : `

            <div class="card empty">

              <div class="emoji">
                ⟳
              </div>

              <h3>
                No version history yet
              </h3>

              <p class="muted">
                New snapshots will appear
                after accounting changes.
              </p>

            </div>

          `
      }

    `;


    document
      .getElementById(
        "versionRefreshBtn"
      )
      ?.addEventListener(
        "click",
        () => load(true)
      );

  }


  async function load(
    showLoading = false
  ) {

    if (loading) {
      return;
    }


    const cloud =
      status();


    if (
      !cloud.ready ||
      !cloud.householdId
    ) {

      const root =
        document.getElementById(
          "auroraVersionRoot"
        );

      if (root) {

        root.innerHTML = `
          <div class="card">
            <div class="muted">
              Cloud session is not ready.
            </div>
          </div>
        `;

      }

      return;

    }


    const supabase =
      client();

    if (!supabase) {
      return;
    }


    loading = true;


    if (showLoading) {
      renderLoading();
    }


    try {

      const {
        data,
        error
      } =
        await supabase.rpc(
          "aurora_get_versions",
          {
            p_household_id:
              cloud.householdId,

            p_limit:
              100
          }
        );


      if (error) {
        throw error;
      }


      versions =
        Array.isArray(data)
          ? data
          : [];


      renderList();

    }

    catch (error) {

      console.error(
        "Aurora Version History Error:",
        error
      );


      const root =
        document.getElementById(
          "auroraVersionRoot"
        );


      if (root) {

        root.innerHTML = `

          <div class="card">

            <h3>
              ⚠ Temporal Archive Error
            </h3>

            <p class="muted">
              ${esc(
          error.message ||
          "Unable to load versions."
        )
          }
            </p>

          </div>

        `;

      }

    }

    finally {

      loading = false;

    }

  }


  async function preview(
    revision
  ) {

    const cloud =
      status();

    const supabase =
      client();


    if (
      !supabase ||
      !cloud.householdId
    ) {
      return;
    }


    try {

      toast(
        `Loading revision ${revision}...`
      );


      const {
        data,
        error
      } =
        await supabase.rpc(
          "aurora_get_version_data",
          {

            p_household_id:
              cloud.householdId,

            p_revision:
              Number(revision)

          }
        );


      if (error) {
        throw error;
      }


      const snapshot =
        data || {};


      const members =
        Array.isArray(
          snapshot.members
        )
          ? snapshot.members
          : [];


      const months =
        snapshot.months &&
          typeof snapshot.months ===
          "object"

          ? Object.keys(
            snapshot.months
          )

          : [];


      let mealRecords = 0;
      let expenses = 0;
      let payments = 0;
      let bills = 0;
      let rents = 0;


      months.forEach(
        monthKey => {

          const month =
            snapshot.months[
            monthKey
            ] || {};

          mealRecords +=
            month
              ?.mealAccount
              ?.meals
              ?.length || 0;

          expenses +=
            month
              ?.mealAccount
              ?.expenses
              ?.length || 0;

          payments +=
            (
              month
                ?.mealAccount
                ?.payments
                ?.length || 0
            ) +
            (
              month
                ?.houseAccount
                ?.payments
                ?.length || 0
            );

          bills +=
            month
              ?.houseAccount
              ?.bills
              ?.length || 0;

          rents +=
            month
              ?.houseAccount
              ?.rent
              ?.length || 0;

        }
      );


      modal(
        `Revision ${revision}`,
        `

          <div class="version-preview">

            <div
              class="version-preview-hero"
            >

              <span>
                TEMPORAL SNAPSHOT
              </span>

              <strong>
                REV ${revision}
              </strong>

            </div>


            <div
              class="version-preview-grid"
            >

              <div>
                <small>
                  MEMBERS
                </small>

                <strong>
                  ${members.length}
                </strong>
              </div>


              <div>
                <small>
                  MONTHS
                </small>

                <strong>
                  ${months.length}
                </strong>
              </div>


              <div>
                <small>
                  MEAL DAYS
                </small>

                <strong>
                  ${mealRecords}
                </strong>
              </div>


              <div>
                <small>
                  EXPENSES
                </small>

                <strong>
                  ${expenses}
                </strong>
              </div>


              <div>
                <small>
                  PAYMENTS
                </small>

                <strong>
                  ${payments}
                </strong>
              </div>


              <div>
                <small>
                  HOUSE BILLS
                </small>

                <strong>
                  ${bills}
                </strong>
              </div>


              <div>
                <small>
                  RENT RECORDS
                </small>

                <strong>
                  ${rents}
                </strong>
              </div>

            </div>


            <div
              class="version-preview-months"
            >

              <small>
                AVAILABLE MONTHS
              </small>

              <div>

                ${months.length

          ? months
            .sort()
            .reverse()
            .map(
              month => `
                            <span>
                              ${esc(month)}
                            </span>
                          `
            )
            .join("")

          : `
                      <span>
                        No month data
                      </span>
                    `
        }

              </div>

            </div>


            <div class="actions">

              <button
                type="button"
                class="btn"
                onclick="closeModal()"
              >
                CLOSE
              </button>


              ${Number(revision) !==
          Number(
            cloud.revision
          )

          ? `

                    <button
                      type="button"
                      class="btn primary"
                      onclick="
                        closeModal();
                        restoreAuroraVersion(
                          ${Number(revision)}
                        );
                      "
                    >
                      ↶ RESTORE THIS REVISION
                    </button>

                  `

          : ""
        }

            </div>

          </div>

        `
      );

    }

    catch (error) {

      console.error(
        "Aurora Version Preview Error:",
        error
      );

      toast(
        error.message ||
        "Unable to preview revision."
      );

    }

  }


  async function restore(
    revision
  ) {

    const cloud =
      status();


    if (!canRestore()) {

      toast(
        "MEMBER // VIEW ONLY"
      );

      return;

    }


    if (
      Number(revision) ===
      Number(cloud.revision)
    ) {

      toast(
        "This revision is already current."
      );

      return;

    }


    const confirmed =
      await auroraConfirm({

        eyebrow:
          "AURORA // TEMPORAL RESTORE",

        title:
          `Restore Revision ${revision}?`,

        message:
          `CURRENT REVISION // ${cloud.revision}\n` +
          `TARGET SNAPSHOT // REV ${revision}\n\n` +
          `Aurora will create a NEW revision using this snapshot.\n` +
          `Existing version history will remain protected.`,

        confirmText:
          `↶ RESTORE REV ${revision}`,

        cancelText:
          "CANCEL",

        danger:
          true

      });


    if (!confirmed) {
      return;
    }


    const supabase =
      client();

    if (!supabase) {
      return;
    }


    try {

      toast(
        `Restoring revision ${revision}...`
      );


      const {
        data,
        error
      } =
        await supabase.rpc(
          "aurora_restore_house_data",
          {

            p_household_id:
              cloud.householdId,

            p_source_revision:
              Number(revision),

            p_expected_revision:
              Number(
                cloud.revision
              )

          }
        );


      if (error) {
        throw error;
      }


      console.log(
        "⟳ Aurora Restore Complete:",
        data
      );


      toast(
        `Revision ${revision} restored successfully.`
      );


      await window
        .AuroraCloudSync
        ?.reloadFromCloud?.(
          true
        );


      await load(false);


      if (
        typeof AuroraActivity !==
        "undefined"
      ) {

        AuroraActivity
          .load?.(
            false
          );

      }

    }

    catch (error) {

      console.error(
        "Aurora Restore Error:",
        error
      );


      const message =
        String(
          error.message || ""
        );


      if (
        message.includes(
          "VERSION_CONFLICT"
        )
      ) {

        toast(
          "Cloud changed. Refresh Version History and try again."
        );

        await load(false);

        return;

      }


      if (
        message.includes(
          "VERSION_ALREADY_CURRENT"
        )
      ) {

        toast(
          "That snapshot is already current."
        );

        return;

      }


      toast(
        error.message ||
        "Restore failed."
      );

    }

  }


  function render() {

    renderLoading();

    load(false);

  }


  return {

    render,
    load,
    preview,
    restore

  };

})();



function renderVersions() {

  AuroraVersionHistory
    .render();

}


function previewAuroraVersion(
  revision
) {

  AuroraVersionHistory
    .preview(
      revision
    );

}


function restoreAuroraVersion(
  revision
) {

  AuroraVersionHistory
    .restore(
      revision
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
              cloud database | local cache architecture
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
              Aurora Cloud Storage • Cloud synchronized
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

























/* ============================================================
   AURORA // PROFILE + GOOGLE AUTH SYSTEM
   CLEAN FINAL VERSION
============================================================ */

(function initAuroraProfileSystem() {

  console.log("🌌 Aurora Profile System Initializing...");


  /* ============================================================
     ELEMENTS
  ============================================================ */

  function getElements() {
    return {
      overlay: document.getElementById("profileOverlay"),
      profileBtn: document.getElementById("profileBtn"),
      closeBtn: document.getElementById("profileClose"),

      loginView: document.getElementById("auroraLoginView"),
      profileView: document.getElementById("auroraProfileView"),
      googleLoginBtn: document.getElementById("googleLoginBtn"),

      avatar: document.getElementById("profileAvatar"),
      name: document.getElementById("profileName"),
      email: document.getElementById("profileEmail"),
      role: document.getElementById("profileRole"),
      house: document.getElementById("profileHouse"),
      provider: document.getElementById("profileProvider"),
      userId: document.getElementById("profileUserId"),

      settingsBtn: document.getElementById("profileSettingsBtn"),
      signOutBtn: document.getElementById("profileSignOut")
    };
  }


  /* ============================================================
     SUPABASE SESSION
  ============================================================ */

  async function getAuroraSession() {

    const client = getAuroraSupabaseClient();

    if (!client?.auth) {
      console.error(
        "❌ Aurora: Supabase Auth is not available."
      );
      return null;
    }

    try {

      const {
        data,
        error
      } = await client.auth.getSession();

      if (error) {
        console.error(
          "❌ Aurora Session Error:",
          error
        );
        return null;
      }

      const session = data?.session || null;

      if (session?.user) {

        console.log(
          "✅ Aurora Session Found:",
          session.user.email
        );

        return session;
      }

      console.log(
        "🔐 Aurora: No active Supabase session."
      );

      return null;

    } catch (error) {

      console.error(
        "❌ Aurora Session Exception:",
        error
      );

      return null;
    }
  }


  /* ============================================================
     GOOGLE LOGIN
  ============================================================ */

  async function startGoogleLogin() {

    const client = getAuroraSupabaseClient();

    if (!client?.auth) {
      console.error(
        "❌ Aurora: Supabase client unavailable."
      );
      return;
    }

    try {

      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      const redirectTo = isLocal
        ? window.location.origin + window.location.pathname
        : "https://gitwithmasum.github.io/Aurora-Bachelor/";

      console.log(
        "🔐 Aurora Google OAuth Redirect:",
        redirectTo
      );

      const {
        data,
        error
      } = await client.auth.signInWithOAuth({

        provider: "google",

        options: {

          redirectTo,

          queryParams: {
            prompt: "select_account"
          }

        }

      });

      if (error) {
        throw error;
      }

      console.log(
        "🚀 Aurora Google OAuth Started",
        data
      );

    } catch (error) {

      console.error(
        "❌ Aurora Google Login Error:",
        error
      );

      alert(
        "Google login failed.\n\n" +
        (error?.message || "Unknown authentication error.")
      );
    }
  }


  /* ============================================================
     LOAD USER PROFILE
  ============================================================ */

  async function loadAuroraProfile(session = null) {

    const el = getElements();

    if (!el.overlay) {
      console.error(
        "❌ Aurora: profileOverlay not found."
      );
      return;
    }

    if (!session?.user) {
      session = await getAuroraSession();
    }

    const user = session?.user || null;


    /* ============================================================
       NOT LOGGED IN
    ============================================================ */

    if (!user) {

      console.log(
        "🔐 Aurora: Authentication required."
      );

      if (el.loginView) {
        el.loginView.hidden = false;
      }

      if (el.profileView) {
        el.profileView.hidden = true;
      }

      return;
    }


    /* ============================================================
       AUTHENTICATED USER
    ============================================================ */

    console.log(
      "✅ Aurora Authenticated User:",
      user.email
    );

    console.log(
      "🆔 Aurora User ID:",
      user.id
    );

    if (el.loginView) {
      el.loginView.hidden = true;
    }

    if (el.profileView) {
      el.profileView.hidden = false;
    }


    /* ============================================================
       GOOGLE USER METADATA
    ============================================================ */

    const metadata =
      user.user_metadata || {};

    const fullName =
      metadata.full_name ||
      metadata.name ||
      user.email?.split("@")[0] ||
      "Aurora User";

    const avatarUrl =
      metadata.avatar_url ||
      metadata.picture ||
      "";


    /* ============================================================
       UPDATE PROFILE UI
    ============================================================ */

    if (el.name) {
      el.name.textContent = fullName;
    }

    if (el.email) {
      el.email.textContent =
        user.email || "No email";
    }

    if (el.userId) {
      el.userId.textContent =
        user.id || "—";
    }

    if (el.avatar) {

      if (avatarUrl) {

        el.avatar.src = avatarUrl;
        el.avatar.alt = fullName;
        el.avatar.style.display = "block";

      } else {

        el.avatar.removeAttribute("src");
        el.avatar.style.display = "none";
      }
    }


    /* ============================================================
       TEMP PROFILE DATA
    ============================================================ */

    /* Safe default — actual role/house comes from database */

    if (el.role) {
      el.role.textContent = "MEMBER";
    }

    if (el.house) {
      el.house.textContent = "Not assigned";
    }

    if (el.provider) {
      el.provider.textContent =
        "GOOGLE";
    }

    console.log(
      "🌌 Aurora Profile Loaded Successfully"
    );
  }


  /* ============================================================
     OPEN PROFILE
  ============================================================ */

  async function openAuroraProfile() {

    const el = getElements();

    if (!el.overlay) {
      console.error(
        "❌ Aurora: profileOverlay NOT FOUND."
      );
      return;
    }

    el.overlay.classList.add(
      "active"
    );

    el.overlay.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "profile-open"
    );

    await loadAuroraProfile();
  }


  /* ============================================================
     CLOSE PROFILE
  ============================================================ */

  function closeAuroraProfile() {

    const el = getElements();

    if (!el.overlay) {
      return;
    }

    el.overlay.classList.remove(
      "active"
    );

    el.overlay.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "profile-open"
    );
  }


  /* ============================================================
     SIGN OUT
  ============================================================ */

  async function signOutAurora() {

    const client = getAuroraSupabaseClient();

    if (!client?.auth) {
      return;
    }

    const confirmed =
      confirm(
        "Sign out from Aurora Bachelor?"
      );

    if (!confirmed) {
      return;
    }

    try {

      const {
        error
      } = await client.auth.signOut();

      if (error) {
        throw error;
      }

      console.log(
        "🚪 Aurora: Signed out successfully."
      );

      closeAuroraProfile();

      window.location.reload();

    } catch (error) {

      console.error(
        "❌ Aurora Sign Out Error:",
        error
      );

      alert(
        "Sign out failed.\n\n" +
        (error?.message || "Unknown error.")
      );
    }
  }


  /* ============================================================
     PROFILE SETTINGS
  ============================================================ */

  function openProfileSettings() {

    closeAuroraProfile();

    if (
      typeof go === "function"
    ) {

      go("settings");
      return;
    }

    if (
      typeof AuroraApp !== "undefined" &&
      typeof AuroraApp.navigate === "function"
    ) {

      AuroraApp.navigate(
        "settings"
      );
    }
  }


  /* ============================================================
     EVENT DELEGATION
  ============================================================ */

  /* ============================================================
   PROFILE EVENT DELEGATION
============================================================ */

  document.addEventListener(
    "click",
    function (event) {

      /* =========================================================
         PROFILE BUTTON
      ========================================================= */

      const profileButton =
        event.target.closest("#profileBtn");

      if (profileButton) {

        event.preventDefault();

        console.log(
          "👤 Aurora Profile Button Clicked"
        );

        const client =
          getAuroraSupabaseClient();

        if (!client?.auth) {

          console.error(
            "❌ Aurora: Supabase Auth unavailable."
          );

          return;
        }

        client.auth
          .getSession()

          .then(({ data, error }) => {

            if (error) {

              console.error(
                "❌ Aurora Profile Session Error:",
                error
              );

              openAuroraProfile();

              return;
            }

            const session =
              data?.session || null;


            /* ==========================================
               LOGGED IN → FULL PROFILE PAGE
            ========================================== */

            if (session?.user) {

              console.log(
                "✅ Aurora Session Active → Opening Full Profile"
              );

              closeAuroraProfile();

              if (typeof go === "function") {

                go("profile");

              } else if (
                typeof AuroraApp !== "undefined" &&
                typeof AuroraApp.navigate === "function"
              ) {

                AuroraApp.navigate(
                  "profile"
                );
              }

              return;
            }


            /* ==========================================
               NOT LOGGED IN → LOGIN OVERLAY
            ========================================== */

            console.log(
              "🔐 Aurora Login Required"
            );

            openAuroraProfile();

          })

          .catch((error) => {

            console.error(
              "❌ Aurora Profile Session Exception:",
              error
            );

            openAuroraProfile();

          });

        return;
      }


      /* =========================================================
         CLOSE PROFILE
      ========================================================= */

      const closeButton =
        event.target.closest(
          "#profileClose"
        );

      if (closeButton) {

        event.preventDefault();

        closeAuroraProfile();

        return;
      }


      /* =========================================================
         GOOGLE LOGIN
      ========================================================= */

      const googleButton =
        event.target.closest(
          "#googleLoginBtn"
        );

      if (googleButton) {

        event.preventDefault();

        startGoogleLogin();

        return;
      }


      /* =========================================================
         PROFILE SETTINGS
      ========================================================= */

      const settingsButton =
        event.target.closest(
          "#profileSettingsBtn"
        );

      if (settingsButton) {

        event.preventDefault();

        openProfileSettings();

        return;
      }


      /* =========================================================
         SIGN OUT
      ========================================================= */

      const signOutButton =
        event.target.closest(
          "#profileSignOut"
        );

      if (signOutButton) {

        event.preventDefault();

        signOutAurora();

        return;
      }


      /* =========================================================
         CLICK OUTSIDE PROFILE PANEL
      ========================================================= */

      if (
        event.target.id ===
        "profileOverlay"
      ) {

        closeAuroraProfile();
      }

    }
  );

  /* ============================================================
     ESC KEY
  ============================================================ */

  document.addEventListener(
    "keydown",
    function (event) {

      if (event.key !== "Escape") {
        return;
      }

      const overlay =
        document.getElementById(
          "profileOverlay"
        );

      if (
        overlay?.classList.contains(
          "active"
        )
      ) {

        closeAuroraProfile();
      }
    }
  );


  /* ============================================================
     AUTH STATE LISTENER
  ============================================================ */

  function initAuthListener() {

    const client =
      getAuroraSupabaseClient();

    if (!client?.auth) {

      console.error(
        "❌ Aurora: Supabase client unavailable."
      );

      return;
    }

    if (
      window.__auroraProfileAuthListenerBound
    ) {
      return;
    }

    window.__auroraProfileAuthListenerBound =
      true;

    client.auth.onAuthStateChange(
      async function (event, session) {

        console.log(
          "🔐 AURORA AUTH EVENT:",
          event,
          session?.user?.email || null
        );


        if (
          event === "SIGNED_IN" &&
          session?.user
        ) {

          console.log(
            "🎉 Aurora Google Login Successful:",
            session.user.email
          );

          await loadAuroraProfile(session);

          /*
           * OAuth সফল হওয়ার পরেই URL clean করবে।
           * Login-এর আগে ?code= মুছবে না।
           */

          if (
            window.location.search
              .includes("code=")
          ) {

            window.history.replaceState(
              {},
              document.title,
              window.location.pathname +
              window.location.hash
            );
          }

          return;
        }


        if (
          event ===
          "INITIAL_SESSION"
        ) {

          await loadAuroraProfile(
            session
          );


          if (session?.user) {

            await AuroraCloudSync
              .initialize(
                session
              );

          }


          return;

        }


        if (
          (
            event === "TOKEN_REFRESHED" ||
            event === "USER_UPDATED"
          ) &&
          session?.user
        ) {

          await loadAuroraProfile(
            session
          );

          await AuroraCloudSync
            .initialize(
              session
            );

          return;
        }


        if (
          event ===
          "SIGNED_OUT"
        ) {

          console.log(
            "🚪 Aurora Session Destroyed"
          );


          AuroraCloudSync.stop();


          return;

        }
      }
    );
  }


  /* ============================================================
     INITIAL SESSION CHECK
  ============================================================ */

  async function initializeAuroraAuth() {

    const client =
      getAuroraSupabaseClient();

    console.log(
      "🔍 Aurora: Checking existing session..."
    );

    if (!client?.auth) {

      console.warn(
        "⚠️ Aurora: Supabase is not ready yet."
      );

      return;
    }

    /*
     * IMPORTANT:
     * এখানে OAuth code manually exchange/remove করা হবে না।
     * Supabase detectSessionInUrl:true নিজে handle করবে।
     */

    const session =
      await getAuroraSession();

    if (session?.user) {

      console.log(
        "✅ Existing Google Session Found:",
        session.user.email
      );


      await AuroraCloudSync
        .initialize(
          session
        );

    }
  }


  /* ============================================================
     INITIALIZE
  ============================================================ */

  async function initialize() {

    initAuthListener();

    await initializeAuroraAuth();

    console.log(
      "🚀 Aurora Profile + Auth System Ready"
    );
  }


  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      {
        once: true
      }
    );

  } else {

    initialize();
  }


  /* ============================================================
     PUBLIC API
  ============================================================ */

  window.openAuroraProfile =
    openAuroraProfile;

  window.closeAuroraProfile =
    closeAuroraProfile;

  window.startGoogleLogin =
    startGoogleLogin;

})();






/* ============================================================
   AURORA // INVITATION ACCEPT FLOW
============================================================ */

const AURORA_INVITE_STORAGE_KEY =
  "aurora_pending_invite_token";


let auroraInviteProcessing =
  false;


/* ============================================================
   GET INVITATION TOKEN
============================================================ */

function getAuroraInvitationToken() {

  const url =
    new URL(
      window.location.href
    );


  const urlToken =
    url.searchParams
      .get("invite")
      ?.trim();


  if (urlToken) {

    sessionStorage.setItem(
      AURORA_INVITE_STORAGE_KEY,
      urlToken
    );


    return urlToken;

  }


  return sessionStorage
    .getItem(
      AURORA_INVITE_STORAGE_KEY
    )
    ?.trim() ||
    null;

}


/* ============================================================
   CLEAN INVITATION TOKEN
============================================================ */

function clearAuroraInvitationToken() {

  sessionStorage.removeItem(
    AURORA_INVITE_STORAGE_KEY
  );


  const url =
    new URL(
      window.location.href
    );


  url.searchParams.delete(
    "invite"
  );


  window.history.replaceState(
    {},
    "",
    url.pathname +
    url.search +
    url.hash
  );

}


/* ============================================================
   INVITATION OVERLAY
============================================================ */

function getAuroraInviteOverlay() {

  let overlay =
    document.getElementById(
      "auroraInviteOverlay"
    );


  if (overlay) {
    return overlay;
  }


  overlay =
    document.createElement(
      "div"
    );


  overlay.id =
    "auroraInviteOverlay";


  overlay.className =
    "aurora-invite-overlay";


  overlay.innerHTML = `

    <div class="aurora-invite-card">

      <div
        class="aurora-invite-content"
        id="auroraInviteContent"
      >

        <div class="aurora-invite-kicker">
          AURORA // SECURE INVITATION
        </div>

        <h2 class="aurora-invite-title">
          Verifying invitation...
        </h2>

        <p class="aurora-invite-subtitle">
          Establishing secure household connection.
        </p>

      </div>

    </div>

  `;


  document.body.appendChild(
    overlay
  );


  return overlay;

}


/* ============================================================
   INVITATION MESSAGE
============================================================ */

function setAuroraInviteMessage(
  html
) {

  getAuroraInviteOverlay();


  const content =
    document.getElementById(
      "auroraInviteContent"
    );


  if (content) {
    content.innerHTML =
      html;
  }

}


/* ============================================================
   PREVIEW INVITATION
============================================================ */

async function previewAuroraInvitation(
  token
) {

  const client =
    getAuroraSupabaseClient();


  if (!client) {
    throw new Error(
      "Supabase connection unavailable."
    );
  }


  const {
    data,
    error
  } =
    await client.rpc(
      "aurora_preview_invitation",
      {
        p_token:
          token
      }
    );


  if (error) {
    throw error;
  }


  const invitation =
    Array.isArray(data)
      ? data[0]
      : data;


  if (!invitation) {

    throw new Error(
      "Invalid invitation link."
    );

  }


  return invitation;

}


/* ============================================================
   GOOGLE LOGIN FROM INVITATION
============================================================ */

async function loginForAuroraInvitation() {

  const token =
    getAuroraInvitationToken();


  if (!token) {

    alert(
      "Invitation token is missing."
    );

    return;

  }


  const client =
    getAuroraSupabaseClient();


  if (!client) {
    return;
  }


  sessionStorage.setItem(
    AURORA_INVITE_STORAGE_KEY,
    token
  );


  const button =
    document.getElementById(
      "auroraInviteGoogleBtn"
    );


  if (button) {

    button.disabled =
      true;

    button.textContent =
      "Opening Google...";

  }


  /*
    Redirect back to current Aurora
    production page.

    Invite token is also preserved
    inside sessionStorage.
  */

  const redirectUrl =
    window.location.origin +
    window.location.pathname;


  const {
    error
  } =
    await client.auth
      .signInWithOAuth(
        {

          provider:
            "google",

          options: {

            redirectTo:
              redirectUrl,

            queryParams: {

              prompt:
                "select_account"

            }

          }

        }
      );


  if (error) {

    console.error(
      "❌ Aurora Invite Google Login:",
      error
    );


    if (button) {

      button.disabled =
        false;

      button.textContent =
        "Continue with Google";

    }


    alert(
      error.message ||
      "Google login failed."
    );

  }

}


/* ============================================================
   ACCEPT INVITATION
============================================================ */

async function acceptAuroraInvitation(
  token
) {

  if (
    auroraInviteProcessing
  ) {
    return;
  }


  auroraInviteProcessing =
    true;


  const client =
    getAuroraSupabaseClient();


  if (!client) {

    auroraInviteProcessing =
      false;

    return;

  }


  setAuroraInviteMessage(`

    <div class="aurora-invite-kicker">
      AURORA // AUTHENTICATED
    </div>

    <h2 class="aurora-invite-title">
      Connecting your account
    </h2>

    <p class="aurora-invite-subtitle">
      Verifying Google identity and
      household permissions...
    </p>

    <div class="aurora-invite-status">
      SECURE LINKING IN PROGRESS
    </div>

  `);


  try {

    const {
      data,
      error
    } =
      await client.rpc(
        "aurora_accept_invitation",
        {
          p_token:
            token
        }
      );


    if (error) {
      throw error;
    }


    const result =
      Array.isArray(data)
        ? data[0]
        : data;


    if (!result) {

      throw new Error(
        "Invitation acceptance failed."
      );

    }

    window.AuroraInviteInstallGate
      ?.complete?.();

    toast(
      "Invitation accepted."
    );




    clearAuroraInvitationToken();


    setAuroraInviteMessage(`

      <div class="aurora-invite-kicker">
        AURORA // CONNECTION ESTABLISHED
      </div>

      <h2 class="aurora-invite-title">
        Welcome to
        ${esc(
      result.house_name ||
      "Aurora Bachelor"
    )}
      </h2>

      <p class="aurora-invite-subtitle">
        Your Google account has been
        securely connected to this household.
      </p>


      <div class="aurora-invite-grid">

        <div class="aurora-invite-info">

          <span>
            ACCESS LEVEL
          </span>

          <strong>
            ${esc(
      String(
        result.member_role ||
        "member"
      )
        .toUpperCase()
    )}
          </strong>

        </div>


        <div class="aurora-invite-info">

          <span>
            STATUS
          </span>

          <strong>
            CONNECTED ✓
          </strong>

        </div>

      </div>


      <div
        class="
          aurora-invite-status
          aurora-invite-success
        "
      >
        GOOGLE ACCOUNT VERIFIED
      </div>


      <div class="aurora-invite-actions">

        <button
          class="aurora-invite-google"
          type="button"
          onclick="
            finishAuroraInvitation()
          "
        >
          Enter Aurora Bachelor
        </button>

      </div>

    `);


    console.log(
      "✅ Aurora Invitation Accepted:",
      result
    );


  } catch (error) {

    console.error(
      "❌ Aurora Invitation Accept:",
      error
    );


    auroraInviteProcessing =
      false;


    setAuroraInviteMessage(`

      <div class="aurora-invite-kicker">
        AURORA // ACCESS DENIED
      </div>

      <h2 class="aurora-invite-title">
        Invitation could not be accepted
      </h2>

      <p class="aurora-invite-subtitle">
        The Google account you selected
        may not match the invited email.
      </p>


      <div class="aurora-invite-error">

        ${esc(
      error?.message ||
      "Unable to accept invitation."
    )}

      </div>


      <div class="aurora-invite-actions">

        <button
          class="aurora-invite-google"
          type="button"
          onclick="
            switchAuroraInvitationAccount()
          "
        >
          Try Another Google Account
        </button>

      </div>

    `);

  }

}


/* ============================================================
   SWITCH GOOGLE ACCOUNT
============================================================ */

async function switchAuroraInvitationAccount() {

  const client =
    getAuroraSupabaseClient();


  if (!client) return;


  await client.auth.signOut();


  auroraInviteProcessing =
    false;


  await loginForAuroraInvitation();

}


/* ============================================================
   FINISH INVITATION
============================================================ */

function finishAuroraInvitation() {

  localStorage.removeItem(
    "aurora_invite_onboarding_active"
  );

  const overlay =
    document.getElementById(
      "auroraInviteOverlay"
    );


  if (overlay) {
    overlay.remove();
  }


  auroraInviteProcessing =
    false;


  /*
    Reload so profile, role,
    Access Control and household
    data refresh.
  */

  window.location.reload();

}


/* ============================================================
   INITIALIZE INVITATION FLOW
============================================================ */

async function initializeAuroraInvitationFlow() {

  const token =
    getAuroraInvitationToken();


  if (!token) {
    return;
  }


  try {

    /* =========================================
       PREVIEW
    ========================================= */

    const invitation =
      await previewAuroraInvitation(
        token
      );


    if (
      invitation
        .invitation_status !==
      "pending"
    ) {

      throw new Error(
        "This invitation is no longer active."
      );

    }


    if (
      invitation.expires_at &&
      new Date(
        invitation.expires_at
      ) < new Date()
    ) {

      throw new Error(
        "This invitation has expired."
      );

    }


    /* =========================================
       CHECK CURRENT SESSION
    ========================================= */

    const client =
      getAuroraSupabaseClient();


    const {
      data: {
        session
      }
    } =
      await client.auth
        .getSession();


    /*
      Already signed in:
      automatically attempt acceptance.
    */

    if (
      session?.user
    ) {

      await acceptAuroraInvitation(
        token
      );

      return;

    }


    /* =========================================
       NOT LOGGED IN
    ========================================= */

    setAuroraInviteMessage(`

      <div class="aurora-invite-kicker">
        AURORA // HOUSE INVITATION
      </div>


      <h2 class="aurora-invite-title">
        Join
        ${esc(
      invitation.house_name ||
      "Aurora Bachelor"
    )}
      </h2>


      <p class="aurora-invite-subtitle">
        You have received secure member
        access to this household.
      </p>


      <div class="aurora-invite-grid">

        <div class="aurora-invite-info">

          <span>
            INVITED MEMBER
          </span>

          <strong>
            ${esc(
      invitation.full_name ||
      "House Member"
    )}
          </strong>

        </div>


        <div class="aurora-invite-info">

          <span>
            GOOGLE ACCOUNT
          </span>

          <strong>
            ${esc(
      invitation.email_hint ||
      "Verified account"
    )}
          </strong>

        </div>


        <div class="aurora-invite-info">

          <span>
            ACCESS LEVEL
          </span>

          <strong>
            MEMBER
          </strong>

        </div>


        <div class="aurora-invite-info">

          <span>
            STATUS
          </span>

          <strong>
            PENDING
          </strong>

        </div>

      </div>


      <div class="aurora-invite-status">
        Sign in with the Google account
        that received this invitation.
      </div>


      <div class="aurora-invite-actions">

        <button
          id="auroraInviteGoogleBtn"
          class="aurora-invite-google"
          type="button"
          onclick="
            loginForAuroraInvitation()
          "
        >
          Continue with Google
        </button>

      </div>

    `);


  } catch (error) {

    console.error(
      "❌ Aurora Invitation:",
      error
    );


    setAuroraInviteMessage(`

      <div class="aurora-invite-kicker">
        AURORA // INVALID LINK
      </div>


      <h2 class="aurora-invite-title">
        Invitation unavailable
      </h2>


      <p class="aurora-invite-subtitle">
        This link may be invalid,
        expired or already used.
      </p>


      <div class="aurora-invite-error">

        ${esc(
      error?.message ||
      "Invalid invitation."
    )}

      </div>

    `);

  }

}


/* ============================================================
   START AFTER PAGE LOAD
============================================================ */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeAuroraInvitationFlow
  );

} else {

  initializeAuroraInvitationFlow();

}








/* ============================================================
   AURORA // GLOBAL FUTURISTIC CONFIRMATION BRIDGE
   Converts old native confirm() actions automatically.
============================================================ */

const AuroraConfirmSystem = (() => {

  const wrappedFunctions =
    new Set();


  /* ==========================================================
     RUN OLD FUNCTION WITHOUT ITS NATIVE CONFIRM
  ========================================================== */

  function executeApprovedAction(
    originalFunction,
    thisArg,
    args
  ) {

    const nativeConfirm =
      window.confirm;


    /*
      Existing functions already contain:

      confirm(...)

      After Aurora confirmation succeeds,
      temporarily return TRUE for that old
      confirm call.

      Then restore browser confirm immediately.
    */

    window.confirm =
      () => true;


    try {

      return originalFunction
        .apply(
          thisArg,
          args
        );

    }

    finally {

      window.confirm =
        nativeConfirm;

    }

  }


  /* ==========================================================
     MEMBER WRITE CHECK
  ========================================================== */

  function managerAllowed() {

    const permissions =
      window.AuroraPermissions;


    if (
      permissions &&
      typeof permissions.canManage ===
      "function" &&
      !permissions.canManage()
    ) {

      toast(
        "MEMBER // VIEW ONLY"
      );

      return false;

    }


    return true;

  }


  /* ==========================================================
     OWNER CHECK
  ========================================================== */

  function ownerAllowed() {

    const permissions =
      window.AuroraPermissions;


    if (
      permissions &&
      typeof permissions.isOwner ===
      "function" &&
      !permissions.isOwner()
    ) {

      toast(
        "OWNER ACCESS REQUIRED"
      );

      return false;

    }


    return true;

  }


  /* ==========================================================
     WRAP GLOBAL FUNCTION
  ========================================================== */

  function wrapGlobal(
    functionName,
    configBuilder,
    options = {}
  ) {

    const original =
      window[
      functionName
      ];


    if (
      typeof original !==
      "function"
    ) {

      return false;

    }


    if (
      original
        .__auroraConfirmWrapped
    ) {

      return true;

    }


    const wrapped =
      async function (
        ...args
      ) {

        /*
          Permission check
        */

        if (
          options.ownerOnly &&
          !ownerAllowed()
        ) {

          return;

        }


        if (
          options.managerOnly &&
          !managerAllowed()
        ) {

          return;

        }


        let config;


        try {

          config =
            typeof configBuilder ===
              "function"

              ? configBuilder(
                ...args
              )

              : configBuilder;

        }

        catch (error) {

          console.warn(
            `Aurora confirmation config error: ${functionName}`,
            error
          );


          config = {
            title:
              "Confirm Action",

            message:
              "Continue with this action?"
          };

        }


        /*
          config === false means:
          run normally, no Aurora popup.
        */

        if (
          config === false
        ) {

          return original.apply(
            this,
            args
          );

        }


        const confirmed =
          await auroraConfirm({

            eyebrow:
              config?.eyebrow ||
              "AURORA // SECURITY PROTOCOL",

            title:
              config?.title ||
              "Confirm Action",

            message:
              config?.message ||
              "Continue with this action?",

            confirmText:
              config?.confirmText ||
              "CONFIRM",

            cancelText:
              config?.cancelText ||
              "CANCEL",

            danger:
              config?.danger !==
              false

          });


        if (
          !confirmed
        ) {

          return;

        }


        return executeApprovedAction(

          original,

          this,

          args

        );

      };


    wrapped
      .__auroraConfirmWrapped =
      true;


    wrapped
      .__auroraOriginal =
      original;


    window[
      functionName
    ] =
      wrapped;


    wrappedFunctions.add(
      functionName
    );


    console.log(
      `◇ Aurora Confirm: ${functionName} protected`
    );


    return true;

  }


  /* ==========================================================
     WRAP OBJECT METHOD
  ========================================================== */

  function wrapMethod(
    object,
    methodName,
    configBuilder,
    options = {}
  ) {

    if (
      !object ||
      typeof object[
      methodName
      ] !==
      "function"
    ) {

      return false;

    }


    const original =
      object[
      methodName
      ];


    if (
      original
        .__auroraConfirmWrapped
    ) {

      return true;

    }


    const wrapped =
      async function (
        ...args
      ) {

        if (
          options.ownerOnly &&
          !ownerAllowed()
        ) {

          return;

        }


        if (
          options.managerOnly &&
          !managerAllowed()
        ) {

          return;

        }


        const config =
          typeof configBuilder ===
            "function"

            ? configBuilder(
              ...args
            )

            : configBuilder;


        const confirmed =
          await auroraConfirm({

            eyebrow:
              config?.eyebrow ||
              "AURORA // SECURITY PROTOCOL",

            title:
              config?.title ||
              "Confirm Action",

            message:
              config?.message ||
              "Continue with this action?",

            confirmText:
              config?.confirmText ||
              "CONFIRM",

            cancelText:
              config?.cancelText ||
              "CANCEL",

            danger:
              config?.danger !==
              false

          });


        if (
          !confirmed
        ) {

          return;

        }


        return executeApprovedAction(

          original,

          this,

          args

        );

      };


    wrapped
      .__auroraConfirmWrapped =
      true;


    wrapped
      .__auroraOriginal =
      original;


    object[
      methodName
    ] =
      wrapped;


    console.log(
      `◇ Aurora Confirm: ${methodName} protected`
    );


    return true;

  }


  /* ==========================================================
     DELETE EXPENSE
  ========================================================== */

  function protectExpense() {

    wrapGlobal(

      "deleteExpense",

      id => {

        const expense =
          window
            .AuroraExpenseAccount
            ?.get?.(
              id
            );


        return {

          eyebrow:
            "AURORA // EXPENSE CONTROL",

          title:
            "Delete Expense?",

          message:
            `${expense?.description || "Selected expense"}\n` +
            `${money(
              expense?.amount || 0
            )}\n\n` +
            `This accounting record will be removed.`,

          confirmText:
            "× DELETE EXPENSE",

          danger:
            true

        };

      },

      {
        managerOnly:
          true
      }

    );

  }


  /* ==========================================================
     DELETE PAYMENT
  ========================================================== */

  function protectPayment() {

    wrapGlobal(

      "deletePayment",

      id => {

        const payment =
          window
            .AuroraPaymentAccount
            ?.get?.(
              id
            );


        return {

          eyebrow:
            "AURORA // PAYMENT LEDGER",

          title:
            "Delete Payment?",

          message:
            `TRANSACTION // ${money(
              payment?.amount || 0
            )}\n` +

            `ACCOUNT // ${String(
              payment?.account ||
              "unknown"
            ).toUpperCase()
            }\n\n` +

            `This payment will be removed from the ledger.`,

          confirmText:
            "× DELETE PAYMENT",

          danger:
            true

        };

      },

      {
        managerOnly:
          true
      }

    );

  }


  /* ==========================================================
     DELETE MEAL
  ========================================================== */

  function protectMeal() {

    wrapGlobal(

      "deleteMealDay",

      id => {

        const meals =
          window
            .AuroraMealAccount
            ?.data?.()
            ?.meals || [];


        const meal =
          meals.find(
            item =>
              item.id === id
          );


        return {

          eyebrow:
            "AURORA // MEAL MATRIX",

          title:
            "Delete Meal Record?",

          message:
            `DATE // ${meal?.date ||
            "Unknown"
            }\n\n` +
            `Meal values for this day will be removed.`,

          confirmText:
            "× DELETE MEAL",

          danger:
            true

        };

      },

      {
        managerOnly:
          true
      }

    );

  }


  /* ==========================================================
     DELETE BILL
  ========================================================== */

  function protectBill() {

    wrapGlobal(

      "deleteBill",

      id => {

        const bill =
          window
            .AuroraBillAccount
            ?.get?.(
              id
            );


        return {

          eyebrow:
            "AURORA // HOUSE FINANCE",

          title:
            "Delete House Bill?",

          message:
            `${bill?.description || "Selected bill"}\n` +

            `CATEGORY // ${bill?.category ||
            "Other"
            }\n` +

            `AMOUNT // ${money(
              bill?.amount || 0
            )}`,

          confirmText:
            "× DELETE BILL",

          danger:
            true

        };

      },

      {
        managerOnly:
          true
      }

    );

  }


  /* ==========================================================
     DELETE RENT
  ========================================================== */

  function protectRent() {

    wrapGlobal(

      "deleteRent",

      id => {

        const rents =
          window
            .AuroraHouseAccount
            ?.data?.()
            ?.rent || [];


        const rent =
          rents.find(
            item =>
              item.id === id
          );


        return {

          eyebrow:
            "AURORA // HOUSE FINANCE",

          title:
            "Delete Rent Record?",

          message:
            `${rent?.description ||
            "House Rent"
            }\n` +

            `AMOUNT // ${money(
              rent?.amount || 0
            )}`,

          confirmText:
            "× DELETE RENT",

          danger:
            true

        };

      },

      {
        managerOnly:
          true
      }

    );

  }


  /* ==========================================================
     DELETE ACCOUNTING MEMBER
  ========================================================== */

  function protectMember() {

    wrapGlobal(

      "deleteMember",

      id => {

        const member =
          window
            .AuroraDataStore
            ?.get?.()
            ?.members
            ?.find(
              item =>
                item.id === id
            );


        return {

          eyebrow:
            "AURORA // MEMBER DIRECTORY",

          title:
            `Remove ${member?.name ||
            "Member"
            }?`,

          message:
            `The member will be removed from the accounting directory.\n\n` +
            `Historical meal and payment records will remain protected.`,

          confirmText:
            "× REMOVE MEMBER",

          danger:
            true

        };

      },

      {
        managerOnly:
          true
      }

    );

  }


  /* ==========================================================
     RESTORE SETTINGS DEFAULTS
  ========================================================== */

  function protectSettingsRestore() {

    wrapGlobal(

      "restoreSettingsDefaults",

      () => ({

        eyebrow:
          "AURORA // CONFIGURATION",

        title:
          "Restore Default Settings?",

        message:
          `Aurora system settings will return to their default values.\n\n` +
          `Members, meals, expenses and payments will remain intact.`,

        confirmText:
          "↻ RESTORE DEFAULTS",

        danger:
          true

      }),

      {
        managerOnly:
          true
      }

    );

  }


  /* ==========================================================
     SIGN OUT
  ========================================================== */

  function protectSignOut() {

    wrapGlobal(

      "signOutAurora",

      () => ({

        eyebrow:
          "AURORA // SESSION CONTROL",

        title:
          "End Aurora Session?",

        message:
          `You are about to sign out of Aurora Bachelor.\n` +
          `Cloud data will remain safely stored.`,

        confirmText:
          "↗ SIGN OUT",

        danger:
          false

      })

    );

  }


  /* ==========================================================
     DATASTORE RESET
  ========================================================== */

  function protectDatabaseReset() {

    wrapMethod(

      window.AuroraDataStore,

      "reset",

      () => ({

        eyebrow:
          "AURORA // CRITICAL RESET",

        title:
          "Reset Aurora Database?",

        message:
          `WARNING // HIGH IMPACT ACTION\n\n` +
          `Local Aurora accounting data will be reset.`,

        confirmText:
          "⚠ RESET DATABASE",

        danger:
          true

      }),

      {
        managerOnly:
          true
      }

    );

  }


  /* ==========================================================
     CURRENT MONTH RESET
  ========================================================== */

  function protectMonthReset() {

    wrapMethod(

      window.AuroraAccounting,

      "resetCurrentMonth",

      () => {

        const month =
          window
            .AuroraApp
            ?.getCurrentMonth?.() ||
          "Current Month";


        return {

          eyebrow:
            "AURORA // MONTH RESET",

          title:
            "Reset Current Month?",

          message:
            `TARGET // ${month}\n\n` +
            `Meals, expenses, bills, rent and payments ` +
            `for this month will be removed.`,

          confirmText:
            "⚠ RESET MONTH",

          danger:
            true

        };

      },

      {
        managerOnly:
          true
      }

    );

  }


  /* ==========================================================
     CONNECTED GOOGLE MEMBER REMOVAL
     OWNER ONLY
  ========================================================== */

  function protectConnectedMember() {

    wrapGlobal(

      "removeAuroraConnectedMember",

      () => ({

        eyebrow:
          "AURORA // ACCESS CONTROL",

        title:
          "Remove Connected Member?",

        message:
          `This user's Google account will lose access to the household.\n\n` +
          `Their historical accounting records will remain.`,

        confirmText:
          "× REMOVE ACCESS",

        danger:
          true

      }),

      {
        ownerOnly:
          true
      }

    );

  }


  /* ==========================================================
     OWNERSHIP TRANSFER
     OWNER ONLY
  ========================================================== */

  function protectOwnershipTransfer() {

    wrapGlobal(

      "transferAuroraOwnership",

      () => ({

        eyebrow:
          "AURORA // OWNERSHIP PROTOCOL",

        title:
          "Transfer Ownership?",

        message:
          `This action changes the primary owner of Aurora Bachelor.\n\n` +
          `Your account will no longer remain the household owner.`,

        confirmText:
          "♛ TRANSFER OWNERSHIP",

        danger:
          true

      }),

      {
        ownerOnly:
          true
      }

    );

  }


  /* ==========================================================
     INVITATION RESEND
  ========================================================== */

  function protectInvitationResend() {

    wrapGlobal(

      "resendAuroraInvitation",

      (_id, _householdId, button) => ({

        eyebrow:
          "AURORA // INVITATION CONTROL",

        title:
          "Resend Invitation?",

        message:
          `Send a fresh invitation to ${button?.closest(".aurora-pending-row")?.querySelector(".aac-user-meta span")?.textContent?.trim() || "this member"}?\n\nThe previous link will stop working. The new link expires in 7 days.`,

        confirmText:
          "↻ RESEND INVITE",

        danger:
          false

      }),

      {
        managerOnly:
          true
      }

    );

  }


  function protectInvitationRemove() {
    wrapGlobal(
      "removeAuroraInvitation",
      (_id, _householdId, encodedEmail) => ({
        eyebrow: "AURORA // INVITATION CONTROL",
        title: "Remove Invitation Permanently?",
        message:
          `TARGET // ${decodeURIComponent(encodedEmail || "")}\n\n` +
          "The invitation link will stop working and its record will be deleted.",
        confirmText: "✕ REMOVE INVITATION",
        danger: true
      }),
      { managerOnly: true }
    );
  }


  /* ==========================================================
     INSTALL
  ========================================================== */

  function install() {

    protectExpense();

    protectPayment();

    protectMeal();

    protectBill();

    protectRent();

    protectMember();

    protectSettingsRestore();

    protectSignOut();

    protectDatabaseReset();

    protectMonthReset();

    protectConnectedMember();

    protectOwnershipTransfer();

    protectInvitationResend();

    protectInvitationRemove();


    console.log(
      "🛡 Aurora Futuristic Confirmation System: ACTIVE"
    );

  }


  return {

    install,

    wrapGlobal,

    wrapMethod

  };

})();



/* ============================================================
   INSTALL AFTER AURORA IS READY
============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setTimeout(
      () => {

        AuroraConfirmSystem
          .install();

      },
      300
    );

  }
);


window.AuroraConfirmSystem =
  AuroraConfirmSystem;





/* ============================================================
   AURORA // CLOUD SYNC HUD
============================================================ */

const AuroraSyncHUD = (() => {

  let state =
    "connecting";

  let lastRevision =
    null;

  let lastSyncedAt =
    null;

  let syncingSince =
    null;

  let lastError =
    "";

  let queueWrapped =
    false;

  let reloadWrapped =
    false;

  let intervalId =
    null;


  /* ==========================================================
     CLOUD STATUS
  ========================================================== */

  function cloudStatus() {

    try {

      return (
        window
          .AuroraCloudSync
          ?.status?.() || {}
      );

    }

    catch (error) {

      console.warn(
        "Aurora Sync HUD status error:",
        error
      );

      return {};

    }

  }


  /* ==========================================================
     ELEMENTS
  ========================================================== */

  function elements() {

    return {

      root:
        document.getElementById(
          "auroraSyncHud"
        ),

      orb:
        document.getElementById(
          "auroraSyncOrb"
        ),

      state:
        document.getElementById(
          "auroraSyncState"
        ),

      revision:
        document.getElementById(
          "auroraSyncRevision"
        ),

      meta:
        document.getElementById(
          "auroraSyncMeta"
        )

    };

  }


  /* ==========================================================
     TIME LABEL
  ========================================================== */

  function timeAgo(
    value
  ) {

    if (!value) {
      return "Waiting for cloud";
    }


    const seconds =
      Math.max(
        0,
        Math.floor(
          (
            Date.now() -
            value
          ) / 1000
        )
      );


    if (seconds < 5) {

      return "Synced just now";

    }


    if (seconds < 60) {

      return `Synced ${seconds}s ago`;

    }


    const minutes =
      Math.floor(
        seconds / 60
      );


    if (minutes < 60) {

      return (
        `Synced ${minutes}m ago`
      );

    }


    const hours =
      Math.floor(
        minutes / 60
      );


    return (
      `Synced ${hours}h ago`
    );

  }


  /* ==========================================================
     ROLE
  ========================================================== */

  function roleLabel(
    status
  ) {

    const role =
      String(
        status?.role || ""
      ).toUpperCase();


    if (
      role === "OWNER" ||
      role === "ADMIN" ||
      role === "MEMBER"
    ) {

      return role;

    }


    return "";

  }


  /* ==========================================================
     SET STATE
  ========================================================== */

  function setState(
    nextState,
    errorMessage = ""
  ) {

    state =
      nextState;


    if (errorMessage) {

      lastError =
        errorMessage;

    }


    render();

  }


  function markSyncing() {

    syncingSince =
      Date.now();


    setState(
      "syncing"
    );

  }


  function markSynced() {

    syncingSince =
      null;

    lastError =
      "";

    lastSyncedAt =
      Date.now();


    setState(
      "synced"
    );

  }


  function markConflict(
    message = "Revision conflict"
  ) {

    syncingSince =
      null;


    setState(
      "conflict",
      message
    );

  }


  function markError(
    message = "Cloud sync error"
  ) {

    syncingSince =
      null;


    setState(
      "error",
      message
    );

  }


  /* ==========================================================
     DETERMINE CURRENT STATE
  ========================================================== */

  function refreshState() {

    const status =
      cloudStatus();


    /* --------------------------------------------------------
       OFFLINE
    -------------------------------------------------------- */

    if (
      navigator.onLine ===
      false
    ) {

      state =
        "offline";

      render();

      return;

    }


    /* --------------------------------------------------------
       CLOUD NOT READY
    -------------------------------------------------------- */

    if (
      !status.ready
    ) {

      if (
        state !== "error" &&
        state !== "conflict"
      ) {

        state =
          "connecting";

      }


      render();

      return;

    }


    const revision =
      Number(
        status.revision || 0
      );


    /* --------------------------------------------------------
       FIRST READY STATE
    -------------------------------------------------------- */

    if (
      lastRevision === null
    ) {

      lastRevision =
        revision;

      lastSyncedAt =
        Date.now();


      if (
        state !== "syncing"
      ) {

        state =
          "synced";

      }

    }


    /* --------------------------------------------------------
       REVISION INCREASED
       means cloud accepted newer state
    -------------------------------------------------------- */

    else if (
      revision >
      lastRevision
    ) {

      lastRevision =
        revision;

      lastSyncedAt =
        Date.now();

      syncingSince =
        null;

      lastError =
        "";

      state =
        "synced";

    }


    /* --------------------------------------------------------
       RECOVER FROM OFFLINE
    -------------------------------------------------------- */

    if (
      state === "offline"
    ) {

      state =
        "synced";

      lastSyncedAt =
        Date.now();

    }


    render();

  }


  /* ==========================================================
     RENDER
  ========================================================== */

  function render() {

    const el =
      elements();


    if (
      !el.root
    ) {

      return;

    }


    const status =
      cloudStatus();


    const revision =
      Number(
        status.revision || 0
      );


    const role =
      roleLabel(
        status
      );


    el.root.classList.remove(
      "sync-synced",
      "sync-syncing",
      "sync-offline",
      "sync-connecting",
      "sync-conflict",
      "sync-error"
    );


    let title =
      "CONNECTING";

    let meta =
      "Initializing cloud link...";


    switch (state) {

      /* ------------------------------------------------------
         SYNCED
      ------------------------------------------------------ */

      case "synced":

        title =
          status.canWrite === false

            ? "CLOUD SYNCED"

            : "CLOUD SYNCED";


        meta =
          [
            role,

            timeAgo(
              lastSyncedAt
            )
          ]
            .filter(Boolean)
            .join(" // ");


        el.root.classList.add(
          "sync-synced"
        );

        break;


      /* ------------------------------------------------------
         SYNCING
      ------------------------------------------------------ */

      case "syncing":

        title =
          "SYNCING";

        meta =
          role

            ? `${role} // Uploading changes...`

            : "Uploading changes...";


        el.root.classList.add(
          "sync-syncing"
        );

        break;


      /* ------------------------------------------------------
         OFFLINE
      ------------------------------------------------------ */

      case "offline":

        title =
          "OFFLINE";

        meta =
          "Local cache active";


        el.root.classList.add(
          "sync-offline"
        );

        break;


      /* ------------------------------------------------------
         CONFLICT
      ------------------------------------------------------ */

      case "conflict":

        title =
          "SYNC CONFLICT";

        meta =
          lastError ||
          "Cloud revision changed";


        el.root.classList.add(
          "sync-conflict"
        );

        break;


      /* ------------------------------------------------------
         ERROR
      ------------------------------------------------------ */

      case "error":

        title =
          "SYNC ERROR";

        meta =
          lastError ||
          "Cloud connection failed";


        el.root.classList.add(
          "sync-error"
        );

        break;


      /* ------------------------------------------------------
         CONNECTING
      ------------------------------------------------------ */

      default:

        title =
          "CONNECTING";

        meta =
          "Establishing secure cloud link...";


        el.root.classList.add(
          "sync-connecting"
        );

    }


    if (el.state) {

      el.state.textContent =
        title;

    }


    if (el.revision) {

      el.revision.textContent =
        revision > 0
          ? `REV ${revision}`
          : "REV —";

    }


    if (el.meta) {

      el.meta.textContent =
        meta;

    }


    el.root.title =
      [
        title,

        revision > 0
          ? `Revision ${revision}`
          : "",

        role
      ]
        .filter(Boolean)
        .join(" · ");

  }


  /* ==========================================================
     WRAP CLOUD QUEUE SAVE
     Shows SYNCING when Aurora queues a write.
  ========================================================== */

  function wrapQueueSave() {

    if (
      queueWrapped
    ) {

      return;

    }


    const cloud =
      window.AuroraCloudSync;


    if (
      !cloud ||
      typeof cloud.queueSave !==
      "function"
    ) {

      return;

    }


    const original =
      cloud.queueSave
        .bind(
          cloud
        );


    cloud.queueSave =
      function (
        ...args
      ) {

        markSyncing();


        try {

          const result =
            original(
              ...args
            );


          if (
            result &&
            typeof result.then ===
            "function"
          ) {

            result.catch(
              error => {

                const message =
                  String(
                    error?.message ||
                    error ||
                    ""
                  );


                if (
                  message.includes(
                    "VERSION_CONFLICT"
                  )
                ) {

                  markConflict(
                    "Cloud revision conflict"
                  );

                }

                else {

                  markError(
                    message ||
                    "Cloud save failed"
                  );

                }

              }
            );

          }


          return result;

        }

        catch (error) {

          const message =
            String(
              error?.message ||
              error ||
              ""
            );


          if (
            message.includes(
              "VERSION_CONFLICT"
            )
          ) {

            markConflict(
              "Cloud revision conflict"
            );

          }

          else {

            markError(
              message ||
              "Cloud save failed"
            );

          }


          throw error;

        }

      };


    queueWrapped =
      true;


    console.log(
      "☁ Aurora Sync HUD: queueSave connected"
    );

  }


  /* ==========================================================
     WRAP CLOUD RELOAD
  ========================================================== */

  function wrapReload() {

    if (
      reloadWrapped
    ) {

      return;

    }


    const cloud =
      window.AuroraCloudSync;


    if (
      !cloud ||
      typeof cloud.reloadFromCloud !==
      "function"
    ) {

      return;

    }


    const original =
      cloud.reloadFromCloud
        .bind(
          cloud
        );


    cloud.reloadFromCloud =
      async function (
        ...args
      ) {

        if (
          navigator.onLine
        ) {

          setState(
            "syncing"
          );

        }


        try {

          const result =
            await original(
              ...args
            );


          markSynced();


          return result;

        }

        catch (error) {

          const message =
            String(
              error?.message ||
              error ||
              ""
            );


          if (
            message.includes(
              "VERSION_CONFLICT"
            )
          ) {

            markConflict(
              "Revision conflict detected"
            );

          }

          else {

            markError(
              message ||
              "Cloud reload failed"
            );

          }


          throw error;

        }

      };


    reloadWrapped =
      true;


    console.log(
      "☁ Aurora Sync HUD: reload connected"
    );

  }


  /* ==========================================================
     MANUAL REFRESH
  ========================================================== */

  async function refreshCloud() {

    if (
      navigator.onLine ===
      false
    ) {

      toast(
        "Aurora is offline."
      );

      return;

    }


    const cloud =
      window.AuroraCloudSync;


    if (
      typeof cloud
        ?.reloadFromCloud !==
      "function"
    ) {

      toast(
        "Cloud sync is not ready."
      );

      return;

    }


    try {

      setState(
        "syncing"
      );


      await cloud
        .reloadFromCloud(
          true
        );


      markSynced();


      toast(
        "Cloud sync refreshed."
      );

    }

    catch (error) {

      console.error(
        "Aurora manual sync error:",
        error
      );

    }

  }


  /* ==========================================================
     EVENTS
  ========================================================== */

  function installEvents() {

    window.addEventListener(
      "offline",
      () => {

        state =
          "offline";

        render();

      }
    );


    window.addEventListener(
      "online",
      () => {

        state =
          "connecting";

        render();


        setTimeout(
          refreshState,
          500
        );

      }
    );


    window.addEventListener(
      "aurora:dataUpdated",
      () => {

        const status =
          cloudStatus();


        const revision =
          Number(
            status.revision || 0
          );


        if (
          revision > 0
        ) {

          lastRevision =
            revision;

        }


        markSynced();

      }
    );


    /*
      Optional custom event.
      Can be dispatched by CloudSync later.
    */

    window.addEventListener(
      "aurora:syncConflict",
      event => {

        markConflict(
          event?.detail?.message ||
          "Revision conflict detected"
        );

      }
    );


    /*
      Detect uncaught version conflicts.
    */

    window.addEventListener(
      "unhandledrejection",
      event => {

        const message =
          String(
            event?.reason?.message ||
            event?.reason ||
            ""
          );


        if (
          message.includes(
            "VERSION_CONFLICT"
          )
        ) {

          markConflict(
            "Revision conflict detected"
          );

        }

      }
    );


    document
      .getElementById(
        "auroraSyncHud"
      )
      ?.addEventListener(
        "click",
        refreshCloud
      );

  }


  /* ==========================================================
     INIT
  ========================================================== */

  function init() {

    render();


    installEvents();


    /*
      CloudSync may initialize slightly later.
      Polling also keeps revision display current.
    */

    intervalId =
      setInterval(
        () => {

          wrapQueueSave();

          wrapReload();

          refreshState();

        },
        1000
      );


    setTimeout(
      () => {

        wrapQueueSave();

        wrapReload();

        refreshState();

      },
      300
    );

  }


  return {

    init,

    render,

    refresh:
      refreshCloud,

    syncing:
      markSyncing,

    synced:
      markSynced,

    conflict:
      markConflict,

    error:
      markError

  };

})();


window.AuroraSyncHUD =
  AuroraSyncHUD;



document.addEventListener(
  "DOMContentLoaded",
  () => {

    AuroraSyncHUD
      .init();

  }
);







/* ============================================================
   AURORA // NOTIFICATION CENTER
============================================================ */

const AuroraNotifications = (() => {

  let notifications = [];

  let unreadCount = 0;

  let loading = false;

  let opened = false;

  let pollingId = null;


  /* ==========================================================
     CLOUD
  ========================================================== */

  function cloud() {

    return (
      window.AuroraCloudSync
        ?.status?.() || {}
    );

  }


  function client() {

    return (
      getAuroraSupabaseClient?.() ||
      null
    );

  }


  /* ==========================================================
     ELEMENTS
  ========================================================== */

  function elements() {

    return {

      root:
        document.getElementById(
          "auroraNotification"
        ),

      button:
        document.getElementById(
          "auroraNotificationBtn"
        ),

      badge:
        document.getElementById(
          "auroraNotificationBadge"
        ),

      panel:
        document.getElementById(
          "auroraNotificationPanel"
        ),

      list:
        document.getElementById(
          "auroraNotificationList"
        ),

      status:
        document.getElementById(
          "auroraNotificationStatus"
        )

    };

  }


  /* ==========================================================
     ICON
  ========================================================== */

  function icon(
    type
  ) {

    const map = {

      EXPENSE_ADDED:
        "＋",

      EXPENSE_UPDATED:
        "✎",

      EXPENSE_DELETED:
        "−",

      PAYMENT_ADDED:
        "৳",

      PAYMENT_UPDATED:
        "↻",

      PAYMENT_DELETED:
        "×",

      MEAL_ADDED:
        "🍚",

      MEAL_UPDATED:
        "✎",

      MEAL_DELETED:
        "×",

      BILL_ADDED:
        "▣",

      BILL_UPDATED:
        "✎",

      BILL_DELETED:
        "×",

      RENT_ADDED:
        "⌂",

      RENT_UPDATED:
        "✎",

      RENT_DELETED:
        "×",

      MEMBER_CONNECTED:
        "＋",

      MEMBER_REMOVED:
        "−",

      ROLE_CHANGED:
        "♢",

      OWNERSHIP_TRANSFERRED:
        "♛",

      INVITATION_CREATED:
        "✉",

      INVITATION_RESENT:
        "↗",

      INVITATION_ACCEPTED:
        "✓",

      INVITATION_REVOKED:
        "×",

      INVITATION_EXPIRED:
        "⌛",

      SETTINGS_UPDATED:
        "⚙",

      HOUSE_UPDATED:
        "⌂",

      MONTH_LOCKED:
        "🔒",

      MONTH_UNLOCKED:
        "🔓",

      VERSION_RESTORED:
        "↶",

      DATA_CREATED:
        "◉",

      DATA_UPDATED:
        "↻"

    };


    return (
      map[
      String(
        type || ""
      ).toUpperCase()
      ] ||
      "◇"
    );

  }


  /* ==========================================================
     CLASS
  ========================================================== */

  function eventClass(
    type
  ) {

    type =
      String(
        type || ""
      ).toUpperCase();


    if (
      type.includes(
        "DELETED"
      ) ||
      type.includes(
        "REMOVED"
      ) ||
      type.includes(
        "REVOKED"
      )
    ) {

      return "danger";

    }


    if (
      type.includes(
        "PAYMENT"
      ) ||
      type.includes(
        "ACCEPTED"
      ) ||
      type.includes(
        "CONNECTED"
      )
    ) {

      return "success";

    }


    if (
      type.includes(
        "BILL"
      ) ||
      type.includes(
        "RENT"
      )
    ) {

      return "amber";

    }


    if (
      type.includes(
        "MEAL"
      )
    ) {

      return "blue";

    }


    if (
      type.includes(
        "ROLE"
      ) ||
      type.includes(
        "OWNERSHIP"
      ) ||
      type.includes(
        "SETTINGS"
      ) ||
      type.includes(
        "VERSION"
      ) ||
      type.includes(
        "MONTH"
      )
    ) {

      return "purple";

    }


    return "cyan";

  }


  /* ==========================================================
     DATE
  ========================================================== */

  function timeAgo(
    value
  ) {

    if (!value) {
      return "—";
    }


    const timestamp =
      new Date(
        value
      ).getTime();


    if (
      Number.isNaN(
        timestamp
      )
    ) {

      return "—";

    }


    const seconds =
      Math.max(
        0,
        Math.floor(
          (
            Date.now() -
            timestamp
          ) / 1000
        )
      );


    if (
      seconds < 10
    ) {

      return "just now";

    }


    if (
      seconds < 60
    ) {

      return `${seconds}s ago`;

    }


    const minutes =
      Math.floor(
        seconds / 60
      );


    if (
      minutes < 60
    ) {

      return `${minutes}m ago`;

    }


    const hours =
      Math.floor(
        minutes / 60
      );


    if (
      hours < 24
    ) {

      return `${hours}h ago`;

    }


    const days =
      Math.floor(
        hours / 24
      );


    return `${days}d ago`;

  }


  /* ==========================================================
     ACTOR
  ========================================================== */

  function actorLabel(
    item
  ) {

    if (
      item.is_mine
    ) {

      return "YOU";

    }


    return (
      item.actor_name ||
      item.actor_email ||
      "AURORA SYSTEM"
    );

  }


  /* ==========================================================
     DETAIL SUMMARY
  ========================================================== */

  function detailSummary(
    item
  ) {

    const details =
      item.details || {};


    const output = [];


    if (
      details.month
    ) {

      output.push(
        details.month
      );

    }


    if (
      details.category
    ) {

      output.push(
        details.category
      );

    }


    if (
      details.amount !==
      undefined
    ) {

      output.push(
        money(
          details.amount
        )
      );

    }


    if (
      details.method
    ) {

      output.push(
        details.method
      );

    }


    return output
      .filter(Boolean)
      .slice(0, 3)
      .join(" · ");

  }


  /* ==========================================================
     BADGE
  ========================================================== */

  function renderBadge() {

    const {
      badge
    } =
      elements();


    if (!badge) {
      return;
    }


    if (
      unreadCount <= 0
    ) {

      badge.hidden =
        true;

      badge.textContent =
        "0";

      return;

    }


    badge.hidden =
      false;


    badge.textContent =
      unreadCount > 99
        ? "99+"
        : String(
          unreadCount
        );

  }


  /* ==========================================================
     RENDER LIST
  ========================================================== */

  function renderList() {

    const {
      list,
      status
    } =
      elements();


    if (
      !list ||
      !status
    ) {

      return;

    }


    if (
      notifications.length ===
      0
    ) {

      status.textContent =
        "SIGNAL NETWORK CLEAR";


      list.innerHTML = `

        <div
          class="aurora-notification-empty"
        >

          <span>
            ◇
          </span>

          <strong>
            No notifications
          </strong>

          <p>
            New Aurora activity will appear here.
          </p>

        </div>

      `;

      return;

    }


    const unread =
      notifications.filter(
        item =>
          item.is_unread
      ).length;


    status.textContent =
      unread > 0
        ? `${unread} NEW SIGNAL${unread === 1 ? "" : "S"}`
        : "ALL SIGNALS REVIEWED";


    list.innerHTML =
      notifications
        .map(
          item => {

            const className =
              eventClass(
                item.event_type
              );


            const detail =
              detailSummary(
                item
              );


            return `

              <article
                class="
                  aurora-notification-item
                  ${className}
                  ${item.is_unread
                ? "unread"
                : ""
              }
                "
              >

                <div
                  class="aurora-notification-event-icon"
                >
                  ${icon(
                item.event_type
              )
              }
                </div>


                <div
                  class="aurora-notification-body"
                >

                  <div
                    class="aurora-notification-title"
                  >

                    <strong>
                      ${esc(
                item.title ||
                "Aurora Activity"
              )}
                    </strong>

                    ${item.is_unread

                ? `
                          <span
                            class="aurora-notification-new"
                          >
                            NEW
                          </span>
                        `

                : ""
              }

                  </div>


                  ${detail

                ? `
                        <div
                          class="aurora-notification-detail"
                        >
                          ${esc(detail)}
                        </div>
                      `

                : ""
              }


                  <div
                    class="aurora-notification-meta"
                  >

                    <span>
                      ${esc(
                actorLabel(
                  item
                )
              )
              }
                    </span>

                    ${item.actor_role

                ? `
                          <span>
                            ${esc(
                  String(
                    item.actor_role
                  )
                    .toUpperCase()
                )
                }
                          </span>
                        `

                : ""
              }

                    <span>
                      ${timeAgo(
                item.created_at
              )
              }
                    </span>

                    ${item.revision

                ? `
                          <span>
                            REV ${Number(
                  item.revision
                )}
                          </span>
                        `

                : ""
              }

                  </div>

                </div>

              </article>

            `;

          }
        )
        .join("");

  }


  /* ==========================================================
     LOAD COUNT
  ========================================================== */

  async function loadCount() {

    const status =
      cloud();


    if (
      !status.ready ||
      !status.householdId
    ) {

      unreadCount =
        0;

      renderBadge();

      return;

    }


    const supabase =
      client();


    if (!supabase) {
      return;
    }


    try {

      const {
        data,
        error
      } =
        await supabase.rpc(
          "aurora_get_unread_notification_count",
          {

            p_household_id:
              status.householdId

          }
        );


      if (error) {
        throw error;
      }


      unreadCount =
        Number(
          data || 0
        );


      renderBadge();

    }

    catch (error) {

      console.warn(
        "Aurora notification count error:",
        error
      );

    }

  }


  /* ==========================================================
     LOAD NOTIFICATIONS
  ========================================================== */

  async function load(
    showLoading = true
  ) {

    if (loading) {
      return;
    }


    const status =
      cloud();


    if (
      !status.ready ||
      !status.householdId
    ) {

      const {
        status: statusElement
      } =
        elements();


      if (
        statusElement
      ) {

        statusElement
          .textContent =
          "CLOUD SESSION NOT READY";

      }

      return;

    }


    const supabase =
      client();


    if (!supabase) {
      return;
    }


    const {
      status:
      statusElement
    } =
      elements();


    if (
      showLoading &&
      statusElement
    ) {

      statusElement
        .textContent =
        "SCANNING EVENT NETWORK...";

    }


    loading =
      true;


    try {

      const {
        data,
        error
      } =
        await supabase.rpc(
          "aurora_get_notifications",
          {

            p_household_id:
              status.householdId,

            p_limit:
              40

          }
        );


      if (error) {
        throw error;
      }


      notifications =
        Array.isArray(
          data
        )
          ? data
          : [];


      renderList();


      await loadCount();

    }

    catch (error) {

      console.error(
        "Aurora Notification Error:",
        error
      );


      if (
        statusElement
      ) {

        statusElement
          .textContent =
          "NOTIFICATION NETWORK ERROR";

      }

    }

    finally {

      loading =
        false;

    }

  }


  /* ==========================================================
     MARK READ
  ========================================================== */

  async function markAllRead() {

    const status =
      cloud();


    if (
      !status.ready ||
      !status.householdId
    ) {

      return;

    }


    const supabase =
      client();


    if (!supabase) {
      return;
    }


    try {

      const {
        error
      } =
        await supabase.rpc(
          "aurora_mark_notifications_read",
          {

            p_household_id:
              status.householdId,

            p_through_activity_id:
              null

          }
        );


      if (error) {
        throw error;
      }


      unreadCount =
        0;


      renderBadge();

    }

    catch (error) {

      console.warn(
        "Aurora mark notifications read error:",
        error
      );

    }

  }


  /* ==========================================================
     OPEN
  ========================================================== */

  async function open() {

    const {
      root
    } =
      elements();


    if (!root) {
      return;
    }


    opened =
      true;


    root.classList.add(
      "open"
    );


    await load(
      true
    );


    /*
      Loaded notifications keep their NEW
      indicator for this open session.

      Cloud read position is then updated.
    */

    await markAllRead();

  }


  /* ==========================================================
     CLOSE
  ========================================================== */

  function close() {

    const {
      root
    } =
      elements();


    opened =
      false;


    root?.classList.remove(
      "open"
    );

  }


  /* ==========================================================
     TOGGLE
  ========================================================== */

  function toggle() {

    if (opened) {

      close();

    }

    else {

      open();

    }

  }


  /* ==========================================================
     EVENTS
  ========================================================== */

  function installEvents() {

    document
      .getElementById(
        "auroraNotificationBtn"
      )
      ?.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          toggle();

        }
      );


    document
      .getElementById(
        "auroraNotificationRefresh"
      )
      ?.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          load(
            true
          );

        }
      );


    document
      .getElementById(
        "auroraNotificationPanel"
      )
      ?.addEventListener(
        "click",
        event => {

          event.stopPropagation();

        }
      );


    document
      .getElementById(
        "auroraNotificationActivityBtn"
      )
      ?.addEventListener(
        "click",
        () => {

          close();


          if (
            typeof go ===
            "function"
          ) {

            go(
              "activity"
            );

          }

          else {

            AuroraApp
              .navigate?.(
                "activity"
              );

          }

        }
      );


    document.addEventListener(
      "click",
      () => {

        close();

      }
    );


    window.addEventListener(
      "focus",
      () => {

        loadCount();

      }
    );


    window.addEventListener(
      "online",
      () => {

        loadCount();

      }
    );


    window.addEventListener(
      "aurora:dataUpdated",
      () => {

        setTimeout(
          () => {

            loadCount();


            if (opened) {

              load(
                false
              );

            }

          },
          500
        );

      }
    );

  }


  /* ==========================================================
     INIT
  ========================================================== */

  function init() {

    installEvents();


    setTimeout(
      () => {

        loadCount();

      },
      1000
    );


    /*
      Other devices may create activity
      without a local DOM event.

      Lightweight polling keeps badge current.
    */

    pollingId =
      setInterval(
        () => {

          if (
            navigator.onLine
          ) {

            loadCount();

          }

        },
        15000
      );

  }


  return {

    init,

    open,

    close,

    load,

    loadCount

  };

})();


window.AuroraNotifications =
  AuroraNotifications;



document.addEventListener(
  "DOMContentLoaded",
  () => {

    AuroraNotifications
      .init();

  }
);






/* ============================================================
   AURORA // PWA INSTALL ENGINE
============================================================ */

/* ============================================================
   AURORA // FUTURISTIC PWA INSTALL PORTAL
============================================================ */

const AuroraInstall = (() => {

  let deferredPrompt = null;


  /* ==========================================================
     HELPERS
  ========================================================== */

  function installButton() {
    return document.getElementById(
      "auroraInstallBtn"
    );
  }


  function isInstalled() {

    return (
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches ||

      window.navigator
        .standalone === true
    );

  }


  function updateButton() {

    const btn =
      installButton();


    if (!btn) {
      return;
    }


    if (isInstalled()) {

      btn.hidden = true;
      return;

    }


    btn.hidden =
      !deferredPrompt;

  }


  /* ==========================================================
     CREATE FUTURISTIC MODAL
  ========================================================== */

  function ensureModal() {

    let modal =
      document.getElementById(
        "auroraInstallPortal"
      );


    if (modal) {
      return modal;
    }


    modal =
      document.createElement(
        "div"
      );


    modal.id =
      "auroraInstallPortal";


    modal.className =
      "aurora-install-portal";


    modal.innerHTML = `

      <div
        class="aurora-install-backdrop"
        data-install-close
      ></div>


      <div
        class="aurora-install-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auroraInstallTitle"
      >

        <div
          class="aurora-install-scanline"
        ></div>


        <div
          class="aurora-install-corner top-left"
        ></div>

        <div
          class="aurora-install-corner top-right"
        ></div>

        <div
          class="aurora-install-corner bottom-left"
        ></div>

        <div
          class="aurora-install-corner bottom-right"
        ></div>


        <!-- ================================================
             HEADER
        ================================================= -->

        <div
          class="aurora-install-header"
        >

          <div>

            <span
              class="aurora-install-code"
            >
              AURORA // APPLICATION DEPLOYMENT
            </span>


            <h2
              id="auroraInstallTitle"
            >
              Install
              <span>
                Aurora Bachelor
              </span>
            </h2>


            <p>
              Deploy Aurora to this device
              for faster access and a dedicated
              application experience.
            </p>

          </div>


          <button
            type="button"
            class="aurora-install-close"
            data-install-close
            aria-label="Close"
          >
            ×
          </button>

        </div>



        <!-- ================================================
             SYSTEM CORE
        ================================================= -->

        <div
          class="aurora-install-core"
        >

          <div
            class="aurora-install-orb"
          >

            <div
              class="aurora-install-orb-inner"
            >
              A
            </div>

          </div>


          <div
            class="aurora-install-core-copy"
          >

            <span>
              AURORA BACHELOR
            </span>

            <strong>
              HOUSE MANAGEMENT OS
            </strong>

            <small>
              PWA // SECURE CLOUD CLIENT
            </small>

          </div>


          <div
            class="aurora-install-status"
          >

            <i></i>

            READY TO DEPLOY

          </div>

        </div>



        <!-- ================================================
             FEATURES
        ================================================= -->

        <div
          class="aurora-install-features"
        >

          <div
            class="aurora-install-feature"
          >

            <span
              class="aurora-install-feature-icon"
            >
              ◫
            </span>

            <div>

              <strong>
                Dedicated App Window
              </strong>

              <p>
                Aurora opens like a standalone
                desktop or mobile application.
              </p>

            </div>

          </div>


          <div
            class="aurora-install-feature"
          >

            <span
              class="aurora-install-feature-icon purple"
            >
              ⚡
            </span>

            <div>

              <strong>
                Instant Access
              </strong>

              <p>
                Launch from your desktop,
                Start menu or taskbar.
              </p>

            </div>

          </div>


          <div
            class="aurora-install-feature"
          >

            <span
              class="aurora-install-feature-icon green"
            >
              ⟳
            </span>

            <div>

              <strong>
                Multi-Device Cloud Sync
              </strong>

              <p>
                Household data stays connected
                through Aurora Cloud.
              </p>

            </div>

          </div>


          <div
            class="aurora-install-feature"
          >

            <span
              class="aurora-install-feature-icon amber"
            >
              ◈
            </span>

            <div>

              <strong>
                Secure Household Access
              </strong>

              <p>
                Owner, Admin and Member permissions
                remain connected to your account.
              </p>

            </div>

          </div>

        </div>



        <!-- ================================================
             STATUS
        ================================================= -->

        <div
          class="aurora-install-terminal"
          id="auroraInstallTerminal"
        >

          <span>
            SYSTEM
          </span>

          <strong>
            INSTALL PACKAGE READY
          </strong>

        </div>



        <!-- ================================================
             ACTIONS
        ================================================= -->

        <div
          class="aurora-install-actions"
        >

          <button
            type="button"
            class="aurora-install-primary"
            id="auroraInstallConfirm"
          >

            <span>
              ⇩
            </span>

            INSTALL NOW

            <i>
              ››
            </i>

          </button>


          <button
            type="button"
            class="aurora-install-secondary"
            data-install-close
          >
            NOT NOW
          </button>

        </div>


        <div
          class="aurora-install-footer"
        >

          <span>
            ◉ CLOUD LINK READY
          </span>

          <span>
            AURORA BACHELOR // PWA
          </span>

        </div>

      </div>

    `;


    document.body
      .appendChild(
        modal
      );


    /* ------------------------------------------------------
       CLOSE EVENTS
    ------------------------------------------------------ */

    modal
      .querySelectorAll(
        "[data-install-close]"
      )
      .forEach(
        element => {

          element
            .addEventListener(
              "click",
              close
            );

        }
      );


    /* ------------------------------------------------------
       INSTALL
    ------------------------------------------------------ */

    modal
      .querySelector(
        "#auroraInstallConfirm"
      )
      ?.addEventListener(
        "click",
        install
      );


    return modal;

  }


  /* ==========================================================
     OPEN
  ========================================================== */

  function open() {

    if (
      isInstalled()
    ) {

      if (
        typeof toast ===
        "function"
      ) {

        toast(
          "Aurora is already installed."
        );

      }

      return;

    }


    const modal =
      ensureModal();


    requestAnimationFrame(
      () => {

        modal.classList
          .add(
            "active"
          );

      }
    );


    document.body
      .classList
      .add(
        "aurora-install-open"
      );

  }


  /* ==========================================================
     CLOSE
  ========================================================== */

  function close() {

    const modal =
      document.getElementById(
        "auroraInstallPortal"
      );


    modal
      ?.classList
      .remove(
        "active"
      );


    document.body
      .classList
      .remove(
        "aurora-install-open"
      );

  }


  /* ==========================================================
     INSTALL
  ========================================================== */

  async function install() {

    const confirmBtn =
      document.getElementById(
        "auroraInstallConfirm"
      );

    const terminal =
      document.getElementById(
        "auroraInstallTerminal"
      );


    /* =========================================
       ALREADY INSTALLED
    ========================================= */

    if (isInstalled()) {

      return {
        status: "installed"
      };

    }


    /* =========================================
       INSTALL PROMPT NOT AVAILABLE
    ========================================= */

    if (!deferredPrompt) {

      if (terminal) {

        terminal.innerHTML = `
        <span>
          SYSTEM
        </span>

        <strong>
          INSTALL SIGNAL UNAVAILABLE
        </strong>
      `;

      }


      console.warn(
        "Aurora PWA: browser install prompt unavailable."
      );


      return {
        status: "unavailable"
      };

    }


    /*
      beforeinstallprompt can only
      be used once.
    */

    const promptEvent =
      deferredPrompt;


    deferredPrompt =
      null;


    try {

      if (confirmBtn) {

        confirmBtn.disabled =
          true;

      }


      if (terminal) {

        terminal.innerHTML = `
        <span>
          DEPLOYMENT
        </span>

        <strong>
          OPENING SYSTEM INSTALLER...
        </strong>
      `;

      }


      /* =========================================
         REAL BROWSER PWA INSTALL PROMPT
      ========================================= */

      await promptEvent.prompt();


      const {
        outcome
      } =
        await promptEvent.userChoice;


      console.log(
        "Aurora installation:",
        outcome
      );


      updateButton();


      if (
        outcome ===
        "accepted"
      ) {

        return {
          status: "accepted"
        };

      }


      return {
        status: "dismissed"
      };

    }

    catch (error) {

      console.error(
        "Aurora Install Error:",
        error
      );


      return {
        status: "error",
        error
      };

    }

    finally {

      if (confirmBtn) {

        confirmBtn.disabled =
          false;

      }

    }

  }

  /* ==========================================================
     BROWSER INSTALL EVENT
  ========================================================== */

  window.addEventListener(
    "beforeinstallprompt",
    event => {

      event.preventDefault();


      deferredPrompt =
        event;


      updateButton();


      console.log(
        "📦 Aurora deployment package ready."
      );

    }
  );


  /* ==========================================================
     TOPBAR BUTTON
  ========================================================== */

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "#auroraInstallBtn"
        );


      if (!button) {
        return;
      }


      event.preventDefault();


      open();

    }
  );


  /* ==========================================================
     ESC KEY
  ========================================================== */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Escape"
      ) {

        close();

      }

    }
  );


  /* ==========================================================
     INSTALLED
  ========================================================== */

  window.addEventListener(
    "appinstalled",
    () => {

      localStorage.setItem(
        "aurora_pwa_installed_v1",
        "1"
      );

      deferredPrompt =
        null;


      close();


      updateButton();


      if (
        typeof toast ===
        "function"
      ) {

        toast(
          "Aurora installed successfully."
        );

      }


      console.log(
        "🌌 Aurora deployment complete."
      );

    }
  );


  window.addEventListener(
    "load",
    updateButton
  );


  return {

    open,
    close,
    install,
    isInstalled,
    updateButton

  };

})();

  window.AuroraInstall =
    AuroraInstall;


/* ============================================================
   AURORA // INVITATION INSTALL ONBOARDING
============================================================ */

window.AuroraInviteInstallGate =
  (() => {

    const PENDING_KEY =
      "aurora_pending_invite_token";


    const INSTALLED_KEY =
      "aurora_pwa_installed_v1";


    const state =
      window
        .__AURORA_INVITE_INSTALL_GATE__ ||
      null;


    /* ==========================================================
       INSTALLED CHECK
    ========================================================== */

    function isStandalone() {

      return (

        window.matchMedia(
          "(display-mode: standalone)"
        ).matches ||

        window.navigator
          .standalone === true

      );

    }


    function installedKnown() {

      return (

        isStandalone() ||

        localStorage.getItem(
          INSTALLED_KEY
        ) === "1"

      );

    }


    /* ==========================================================
       DEVICE
    ========================================================== */

    function isIOS() {

      return (
        /iphone|ipad|ipod/i
          .test(
            navigator.userAgent
          )
      );

    }


    /* ==========================================================
       CREATE PORTAL
    ========================================================== */

    function ensurePortal() {

      let portal =
        document.getElementById(
          "auroraInviteInstallGate"
        );


      if (portal) {
        return portal;
      }


      portal =
        document.createElement(
          "div"
        );


      portal.id =
        "auroraInviteInstallGate";


      portal.className =
        "aurora-invite-install-gate";


      portal.innerHTML = `

      <div
        class="aurora-invite-gate-bg"
      ></div>


      <div
        class="aurora-invite-gate-card"
      >

        <div
          class="aurora-invite-gate-line"
        ></div>


        <!-- ================================================
             HEADER
        ================================================= -->

        <div
          class="aurora-invite-gate-header"
        >

          <span>
            AURORA // MEMBER ONBOARDING
          </span>


          <h1>
            Welcome to
            <strong>
              Aurora Bachelor
            </strong>
          </h1>


          <p>
            You have received a secure
            household invitation.
            Install Aurora on this device
            before continuing.
          </p>

        </div>



        <!-- ================================================
             PROGRESS
        ================================================= -->

        <div
          class="aurora-invite-progress"
        >

          <div
            class="aurora-invite-progress-item active"
            id="auroraInviteStep1"
          >

            <i>
              01
            </i>

            <div>

              <span>
                DEVICE SETUP
              </span>

              <strong>
                Install Aurora
              </strong>

            </div>

          </div>


          <div
            class="aurora-invite-progress-line"
          ></div>


          <div
            class="aurora-invite-progress-item"
            id="auroraInviteStep2"
          >

            <i>
              02
            </i>

            <div>

              <span>
                HOUSE ACCESS
              </span>

              <strong>
                Accept Invitation
              </strong>

            </div>

          </div>

        </div>



        <!-- ================================================
             INSTALL STATUS
        ================================================= -->

        <div
          class="aurora-invite-device"
        >

          <div
            class="aurora-invite-device-orb"
          >
            ◈
          </div>


          <div>

            <span>
              APPLICATION STATUS
            </span>

            <strong
              id="auroraInviteInstallStatus"
            >
              INSTALLATION REQUIRED
            </strong>

            <small
              id="auroraInviteInstallHint"
            >
              Install Aurora to unlock
              your household invitation.
            </small>

          </div>


          <div
            class="aurora-invite-device-state"
            id="auroraInviteDeviceState"
          >
            WAITING
          </div>

        </div>



        <!-- ================================================
             ACTIONS
        ================================================= -->

        <div
          class="aurora-invite-gate-actions"
        >

          <button
            type="button"
            class="aurora-invite-install-btn"
            id="auroraInviteInstallBtn"
          >
            <span>
              ⇩
            </span>

            INSTALL AURORA
          </button>


          <button
            type="button"
            class="aurora-invite-continue-btn"
            id="auroraInviteContinueBtn"
            disabled
          >
            CONTINUE INVITATION
            <span>
              ››
            </span>
          </button>

        </div>



        <!-- ================================================
             iOS HELP
        ================================================= -->

        <div
          class="aurora-invite-ios-help"
          id="auroraInviteIOSHelp"
          hidden
        >

          <span>
            iPHONE / iPAD INSTALLATION
          </span>

          <p>
            Safari → Share →
            <strong>
              Add to Home Screen
            </strong>
          </p>


          <button
            type="button"
            id="auroraInviteIOSInstalled"
          >
            ✓ I'VE ADDED AURORA
          </button>

        </div>

        <div
          class="aurora-invite-manual-help"
          id="auroraInviteManualHelp"
          hidden
        >
          <span>INSTALL FROM YOUR BROWSER</span>

          <p>
            On Android Chrome, tap <strong>⋮</strong> →
            <strong>Install app</strong> or
            <strong>Add to Home screen</strong> →
            <strong>Install</strong>. Some Chrome versions show
            <strong>Install and create shortcut</strong> instead.
            If this opened inside Gmail or another app, reopen the
            <strong>original invitation link</strong> in Chrome first.
          </p>

          <p>Only confirm after Aurora appears on your Home screen.</p>

          <button type="button" id="auroraInviteManualInstalled">
            ✓ I'VE INSTALLED AURORA
          </button>
        </div>



        <!-- ================================================
             SECURITY
        ================================================= -->

        <div
          class="aurora-invite-security"
        >

          <span>
            🔐
          </span>

          <p>
            Installing Aurora does not
            automatically grant access.
            Your Google account and secure
            invitation token will still be
            verified before joining the house.
          </p>

        </div>


        <div
          class="aurora-invite-gate-footer"
        >
          AURORA BACHELOR //
          SECURE HOUSE MANAGEMENT
        </div>

      </div>

    `;


      document.body
        .appendChild(
          portal
        );


      document
        .getElementById(
          "auroraInviteInstallBtn"
        )
        ?.addEventListener(
          "click",
          requestInstall
        );


      document
        .getElementById(
          "auroraInviteContinueBtn"
        )
        ?.addEventListener(
          "click",
          continueInvitation
        );


      document
        .getElementById(
          "auroraInviteIOSInstalled"
        )
        ?.addEventListener(
          "click",
          confirmManualInstall
        );

      document
        .getElementById(
          "auroraInviteManualInstalled"
        )
        ?.addEventListener(
          "click",
          confirmManualInstall
        );


      return portal;

    }


    /* ==========================================================
       SHOW
    ========================================================== */

    function show() {

      if (
        !state?.required
      ) {
        return;
      }


      const portal =
        ensurePortal();


      document.body
        .classList
        .add(
          "aurora-invite-gate-open"
        );


      requestAnimationFrame(
        () => {

          portal.classList
            .add(
              "active"
            );

        }
      );


      refresh();

    }


    /* ==========================================================
       INSTALL
    ========================================================== */

  async function requestInstall() {

    /* =========================================
       iPHONE / iPAD
    ========================================= */

    if (isIOS()) {

      const help =
        document.getElementById(
          "auroraInviteIOSHelp"
        );


      if (help) {

        help.hidden =
          false;

      }


      return;

    }


    /* =========================================
       AURORA INSTALL ENGINE
    ========================================= */

    const installer =
      window.AuroraInstall;


    if (
      !installer ||
      typeof installer.install !==
      "function"
    ) {

      const manualHelp = document.getElementById(
        "auroraInviteManualHelp"
      );

      if (manualHelp) manualHelp.hidden = false;

      const status = document.getElementById(
        "auroraInviteInstallStatus"
      );

      if (status) status.textContent = "INSTALL FROM CHROME MENU";

      if (
        typeof toast ===
        "function"
      ) {

        toast(
          "Use Chrome's install option in the browser menu."
        );

      }

      return;

    }


    const button =
      document.getElementById(
        "auroraInviteInstallBtn"
      );


    const status =
      document.getElementById(
        "auroraInviteInstallStatus"
      );


    const hint =
      document.getElementById(
        "auroraInviteInstallHint"
      );


    const deviceState =
      document.getElementById(
        "auroraInviteDeviceState"
      );

    const manualHelp =
      document.getElementById(
        "auroraInviteManualHelp"
      );


    try {

      /* =======================================
         BUTTON LOADING STATE
      ======================================= */

      if (button) {

        button.disabled =
          true;

        button.innerHTML = `
        <span>
          ◌
        </span>

        PREPARING INSTALLER...
      `;

      }


      if (status) {

        status.textContent =
          "PREPARING INSTALLATION";

      }


      if (deviceState) {

        deviceState.textContent =
          "WORKING";

      }


      /* =======================================
         DIRECT NATIVE INSTALL PROMPT
      ======================================= */

      const result =
        await installer.install();


      /* =======================================
         ALREADY INSTALLED
      ======================================= */

      if (
        result?.status ===
        "installed"
      ) {

        localStorage.setItem(
          INSTALLED_KEY,
          "1"
        );


        refresh();

        return;

      }


      /* =======================================
         BROWSER DOES NOT SUPPORT PROMPT
      ======================================= */

      if (
        result?.status ===
        "unavailable"
      ) {

        if (manualHelp) manualHelp.hidden = false;

        if (status) {

          status.textContent =
            "INSTALL FROM CHROME MENU";

        }


        if (hint) {

          hint.textContent =
            "The browser did not offer an automatic prompt. Use its install menu below.";

        }


        if (deviceState) {

          deviceState.textContent =
            "MANUAL INSTALL";

        }


        if (
          typeof toast ===
          "function"
        ) {

          toast(
            "Use the install option in Chrome's menu."
          );

        }


        return;

      }


      /* =======================================
         USER CANCELLED
      ======================================= */

      if (
        result?.status ===
        "dismissed"
      ) {

        if (status) {

          status.textContent =
            "INSTALLATION CANCELLED";

        }


        if (hint) {

          hint.textContent =
            "Press INSTALL AURORA when you are ready.";

        }


        if (deviceState) {

          deviceState.textContent =
            "WAITING";

        }


        return;

      }


      /* =======================================
         USER ACCEPTED INSTALL
      ======================================= */

      if (
        result?.status ===
        "accepted"
      ) {

        if (manualHelp) manualHelp.hidden = false;

        if (status) {

          status.textContent =
            "INSTALLING AURORA...";

        }


        if (hint) {

          hint.textContent =
            "Waiting for device installation confirmation.";

        }


        if (deviceState) {

          deviceState.textContent =
            "INSTALLING";

        }


        /*
          appinstalled event below
          will call refresh()
          and unlock CONTINUE INVITATION.
        */

        return;

      }


      /* =======================================
         ERROR
      ======================================= */

      if (
        result?.status ===
        "error"
      ) {

        if (manualHelp) manualHelp.hidden = false;

        if (status) {

          status.textContent =
            "INSTALLATION FAILED";

        }


        if (hint) {

          hint.textContent =
            "Try again or install from Chrome's menu below.";

        }


        if (deviceState) {

          deviceState.textContent =
            "ERROR";

        }

      }

    }

    catch (error) {

      if (manualHelp) manualHelp.hidden = false;

      console.error(
        "Invitation Install Error:",
        error
      );


      if (
        typeof toast ===
        "function"
      ) {

        toast(
          "Unable to start Aurora installation."
        );

      }

    }

    finally {

      /*
        appinstalled → refresh()
        will hide this button
        when installation succeeds.
      */

      if (
        button &&
        !installedKnown()
      ) {

        button.disabled =
          false;

        button.innerHTML = `
        <span>
          ⇩
        </span>

        INSTALL AURORA
      `;

      }

    }

  }
    /* Browser install events are not reliable after manual installation. */
    function confirmManualInstall() {

      localStorage.setItem(
        INSTALLED_KEY,
        "1"
      );


      refresh();

    }


    /* ==========================================================
       INSTALLED
    ========================================================== */

    function refresh() {

      const installed =
        installedKnown();


      const installButton =
        document.getElementById(
          "auroraInviteInstallBtn"
        );


      const continueButton =
        document.getElementById(
          "auroraInviteContinueBtn"
        );


      const status =
        document.getElementById(
          "auroraInviteInstallStatus"
        );


      const hint =
        document.getElementById(
          "auroraInviteInstallHint"
        );


      const deviceState =
        document.getElementById(
          "auroraInviteDeviceState"
        );


      const step1 =
        document.getElementById(
          "auroraInviteStep1"
        );


      const step2 =
        document.getElementById(
          "auroraInviteStep2"
        );


      if (
        installed
      ) {

        const manualHelp =
          document.getElementById(
            "auroraInviteManualHelp"
          );

        if (manualHelp) manualHelp.hidden = true;

        if (status) {

          status.textContent =
            "AURORA INSTALLED";

        }


        if (hint) {

          hint.textContent =
            "Device ready. Continue to secure invitation verification.";

        }


        if (deviceState) {

          deviceState.textContent =
            "READY";


          deviceState.classList
            .add(
              "ready"
            );

        }


        if (
          installButton
        ) {

          installButton.hidden =
            true;

        }


        if (
          continueButton
        ) {

          continueButton.disabled =
            false;

        }


        step1
          ?.classList
          .add(
            "complete"
          );


        step2
          ?.classList
          .add(
            "active"
          );


        return;

      }


      if (
        continueButton
      ) {

        continueButton.disabled =
          true;

      }

    }


    /* ==========================================================
       CONTINUE INVITATION
    ========================================================== */

    function continueInvitation() {

      if (
        !installedKnown()
      ) {

        if (
          typeof toast ===
          "function"
        ) {

          toast(
            "Install Aurora first."
          );

        }

        return;

      }


      const token =
        localStorage.getItem(
          PENDING_KEY
        ) ||

        state?.token;


      if (!token) {

        if (
          typeof toast ===
          "function"
        ) {

          toast(
            "Invitation token is missing."
          );

        }

        return;

      }


      /*
        Restore ?invite=TOKEN.
  
        On reload, pre-boot sees that Aurora
        is installed and DOES NOT block it.
  
        Your existing invitation system then
        handles Google login / email check /
        acceptance exactly as before.
      */

      const url =
        new URL(
          window.location.href
        );


      url.searchParams.set(
        "invite",
        token
      );


      window.location.replace(
        url.href
      );

    }


    /* ==========================================================
       INVITATION COMPLETE
  
       Call after successful invitation RPC.
    ========================================================== */

    function complete() {

      localStorage.removeItem(
        PENDING_KEY
      );


      const url =
        new URL(
          window.location.href
        );


      url.searchParams.delete(
        "invite"
      );


      history.replaceState(
        {},
        "",
        url.pathname +
        url.search +
        url.hash
      );

    }


    /* ==========================================================
       PWA INSTALL COMPLETE
    ========================================================== */

    window.addEventListener(
      "appinstalled",
      () => {

        localStorage.setItem(
          INSTALLED_KEY,
          "1"
        );


        refresh();


        if (
          typeof toast ===
          "function"
        ) {

          toast(
            "Aurora installed. Continue your invitation."
          );

        }

      }
    );


    /* ==========================================================
       INIT
    ========================================================== */

    function init() {

      /*
        Standalone launch means installation
        is confirmed.
      */

      if (
        isStandalone()
      ) {

        localStorage.setItem(
          INSTALLED_KEY,
          "1"
        );

      }


      if (
        state?.required
      ) {

        show();

      }

    }


    if (
      document.readyState ===
      "loading"
    ) {

      document.addEventListener(
        "DOMContentLoaded",
        init,
        {
          once: true
        }
      );

    }

    else {

      init();

    }


    return {

      show,
      refresh,
      continueInvitation,
      complete,
      installedKnown

    };

  })();




/* ============================================================
   AURORA // SMART UPDATE DETECTION SYSTEM
============================================================ */

const AuroraUpdateSystem = (() => {

  const STORAGE_KEY =
    "aurora_build_fingerprint_v1";


  const CHECK_INTERVAL =
    120000;


  let latestFingerprint =
    null;


  let updateDetected =
    false;


  let reloading =
    false;


  let registration =
    null;


  /* ==========================================================
     SAME-ORIGIN CORE FILES
  ========================================================== */

  function getCoreFiles() {

    const urls =
      new Set();


    /* CURRENT PAGE */

    urls.add(
      new URL(
        "./index.html",
        location.href
      ).href
    );


    /* LOCAL JAVASCRIPT */

    document
      .querySelectorAll(
        "script[src]"
      )
      .forEach(
        script => {

          try {

            const url =
              new URL(
                script.src,
                location.href
              );


            if (
              url.origin ===
              location.origin
            ) {

              urls.add(
                url.href
              );

            }

          }

          catch (_) { }

        }
      );


    /* LOCAL STYLES */

    document
      .querySelectorAll(
        'link[rel="stylesheet"][href]'
      )
      .forEach(
        link => {

          try {

            const url =
              new URL(
                link.href,
                location.href
              );


            if (
              url.origin ===
              location.origin
            ) {

              urls.add(
                url.href
              );

            }

          }

          catch (_) { }

        }
      );


    /* MANIFEST */

    const manifest =
      document.querySelector(
        'link[rel="manifest"]'
      );


    if (
      manifest?.href
    ) {

      urls.add(
        manifest.href
      );

    }


    /* SERVICE WORKER */

    urls.add(
      new URL(
        "./sw.js",
        location.href
      ).href
    );


    return [
      ...urls
    ];

  }


  /* ==========================================================
     NETWORK FILE SIGNATURE
  ========================================================== */

  async function getFileSignature(
    sourceUrl
  ) {

    try {

      const url =
        new URL(
          sourceUrl
        );


      url.searchParams.set(
        "__aurora_update_check",
        Date.now()
      );


      let response =
        await fetch(
          url.href,
          {

            method:
              "HEAD",

            cache:
              "no-store"

          }
        );


      /*
        Fallback for servers that
        do not support HEAD.
      */

      if (
        !response.ok
      ) {

        response =
          await fetch(
            url.href,
            {
              cache:
                "no-store"
            }
          );

      }


      if (
        !response.ok
      ) {

        return (
          `${url.pathname}:unavailable`
        );

      }


      const etag =
        response.headers
          .get(
            "etag"
          );


      const modified =
        response.headers
          .get(
            "last-modified"
          );


      const length =
        response.headers
          .get(
            "content-length"
          );


      return [

        url.pathname,

        etag ||
        modified ||
        length ||
        response.status

      ].join(
        ":"
      );

    }

    catch (error) {

      console.warn(
        "Aurora Update Probe:",
        sourceUrl,
        error
      );


      return (
        `${sourceUrl}:error`
      );

    }

  }


  /* ==========================================================
     CREATE BUILD FINGERPRINT
  ========================================================== */

  async function createFingerprint() {

    const files =
      getCoreFiles();


    const signatures =
      await Promise.all(

        files.map(
          getFileSignature
        )

      );


    const raw =
      signatures
        .sort()
        .join(
          "||"
        );


    /*
      SHA-256 if supported.
    */

    if (
      window.crypto?.subtle
    ) {

      const data =
        new TextEncoder()
          .encode(
            raw
          );


      const digest =
        await crypto.subtle
          .digest(
            "SHA-256",
            data
          );


      return Array
        .from(
          new Uint8Array(
            digest
          )
        )
        .map(
          byte =>
            byte
              .toString(16)
              .padStart(
                2,
                "0"
              )
        )
        .join("")
        .slice(
          0,
          20
        );

    }


    return raw;

  }


  /* ==========================================================
     UPDATE MODAL
  ========================================================== */

  function ensureModal() {

    let portal =
      document.getElementById(
        "auroraUpdatePortal"
      );


    if (portal) {

      return portal;

    }


    portal =
      document.createElement(
        "div"
      );


    portal.id =
      "auroraUpdatePortal";


    portal.className =
      "aurora-update-portal";


    portal.innerHTML = `

      <div
        class="aurora-update-backdrop"
      ></div>


      <div
        class="aurora-update-modal"
      >

        <div
          class="aurora-update-line"
        ></div>


        <div
          class="aurora-update-orbit"
        >

          <span>
            ↻
          </span>

        </div>


        <span
          class="aurora-update-code"
        >
          AURORA // SYSTEM UPGRADE
        </span>


        <h2>
          Aurora Update
          <span>
            Detected
          </span>
        </h2>


        <p>
          A newer Aurora Bachelor system
          build is available from the
          deployment network.
        </p>


        <div
          class="aurora-update-status"
          id="auroraUpdateStatus"
        >

          <span>
            ●
          </span>

          NEW BUILD READY

        </div>


        <div
          class="aurora-update-info"
        >

          <div>

            <span>
              CLOUD DATA
            </span>

            <strong>
              SAFE
            </strong>

          </div>


          <div>

            <span>
              INSTALLATION
            </span>

            <strong>
              READY
            </strong>

          </div>


          <div>

            <span>
              ACTION
            </span>

            <strong>
              RELOAD
            </strong>

          </div>

        </div>


        <div
          class="aurora-update-actions"
        >

          <button
            type="button"
            id="auroraUpdateNow"
            class="aurora-update-primary"
          >
            ↻ UPDATE NOW
          </button>


          <button
            type="button"
            id="auroraUpdateLater"
            class="aurora-update-secondary"
          >
            LATER
          </button>

        </div>


        <small
          class="aurora-update-foot"
        >
          Your household data is stored
          separately in Aurora Cloud.
        </small>

      </div>

    `;


    document.body
      .appendChild(
        portal
      );


    document
      .getElementById(
        "auroraUpdateNow"
      )
      ?.addEventListener(
        "click",
        applyUpdate
      );


    document
      .getElementById(
        "auroraUpdateLater"
      )
      ?.addEventListener(
        "click",
        closeModal
      );


    return portal;

  }


  function showModal() {

    /* Finish invitation onboarding before displaying an app update. */
    const mobileBrowser =
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) &&
      !window.matchMedia("(display-mode: standalone)").matches &&
      window.navigator.standalone !== true;

    const invitationOpen =
      localStorage.getItem("aurora_invite_onboarding_active") === "1" ||
      document.getElementById("auroraInviteOverlay") ||
      document.getElementById("auroraInviteInstallGate")
        ?.classList.contains("active");

    if (mobileBrowser || invitationOpen) {
      return;
    }

    const portal = ensureModal();

    /* Keep the action above any onboarding layer on mobile. */
    portal.style.zIndex = "1000040";

    portal.classList.add("active");


    document.body
      .classList
      .add(
        "aurora-update-open"
      );

  }


  function closeModal() {

    document
      .getElementById(
        "auroraUpdatePortal"
      )
      ?.classList
      .remove(
        "active"
      );


    document.body
      .classList
      .remove(
        "aurora-update-open"
      );

  }


  /* ==========================================================
     UPDATE DETECTION
  ========================================================== */

  async function checkForUpdate(
    silent = true
  ) {

    if (
      !navigator.onLine
    ) {

      return false;

    }


    try {

      const fingerprint =
        await createFingerprint();


      if (
        !fingerprint
      ) {

        return false;

      }


      latestFingerprint =
        fingerprint;


      const stored =
        localStorage
          .getItem(
            STORAGE_KEY
          );


      /*
        First run establishes baseline.
      */

      if (
        !stored
      ) {

        localStorage
          .setItem(
            STORAGE_KEY,
            fingerprint
          );


        return false;

      }


      if (
        stored ===
        fingerprint
      ) {

        if (
          !silent &&
          typeof toast ===
          "function"
        ) {

          toast(
            "Aurora is up to date."
          );

        }


        return false;

      }


      updateDetected =
        true;


      showModal();


      console.log(
        "🚀 Aurora new build detected:",
        fingerprint
      );


      return true;

    }

    catch (error) {

      console.warn(
        "Aurora update check failed:",
        error
      );


      return false;

    }

  }


  /* ==========================================================
     CLEAR AURORA CACHES
  ========================================================== */

  async function clearCaches() {

    try {

      if (
        "caches" in window
      ) {

        const keys =
          await caches.keys();


        await Promise.all(

          keys
            .filter(
              key =>
                key.startsWith(
                  "aurora-bachelor"
                )
            )
            .map(
              key =>
                caches.delete(
                  key
                )
            )

        );

      }

    }

    catch (error) {

      console.warn(
        "Aurora cache cleanup:",
        error
      );

    }

  }


  /* ==========================================================
     APPLY UPDATE
  ========================================================== */

  async function applyUpdate() {

    if (
      reloading
    ) {

      return;

    }


    const button =
      document.getElementById(
        "auroraUpdateNow"
      );


    const status =
      document.getElementById(
        "auroraUpdateStatus"
      );


    try {

      if (button) {

        button.disabled =
          true;


        button.textContent =
          "UPDATING...";

      }


      if (status) {

        status.innerHTML = `
          <span>◉</span>
          DEPLOYING NEW SYSTEM BUILD...
        `;

      }


      /* ------------------------------------------------------
         SERVICE WORKER UPDATE
      ------------------------------------------------------ */

      if (
        registration
      ) {

        if (!registration.waiting) {
          await registration.update();
        }

        if (registration.installing) {

          await new Promise((resolve, reject) => {

            const worker = registration.installing;

            const timeout = setTimeout(() => {
              worker.removeEventListener("statechange", onStateChange);
              reject(new Error("Aurora update download timed out."));
            }, 20000);

            function onStateChange() {
              if (worker.state === "redundant") {
                clearTimeout(timeout);
                worker.removeEventListener("statechange", onStateChange);
                reject(new Error("Aurora update installation failed."));
              } else if (worker.state === "installed" || worker.state === "activated") {
                clearTimeout(timeout);
                worker.removeEventListener("statechange", onStateChange);
                resolve();
              }
            }

            worker.addEventListener("statechange", onStateChange);
            onStateChange();

          });

        }

        if (registration.waiting) {

          const controllerChanged = new Promise((resolve, reject) => {

            const timeout = setTimeout(() => {
              navigator.serviceWorker.removeEventListener("controllerchange", onChange);
              reject(new Error("Aurora update activation timed out."));
            }, 20000);

            function onChange() {
              clearTimeout(timeout);
              navigator.serviceWorker.removeEventListener("controllerchange", onChange);
              resolve();
            }

            navigator.serviceWorker.addEventListener("controllerchange", onChange);

          });

          registration.waiting.postMessage({ type: "AURORA_SKIP_WAITING" });

          await controllerChanged;

        } else {

          /* Static files may change without a service worker change. */
          await clearCaches();

        }

      }

      const appliedFingerprint =
        latestFingerprint || await createFingerprint();

      if (appliedFingerprint) {
        localStorage.setItem(STORAGE_KEY, appliedFingerprint);
      }


      if (status) {

        status.innerHTML = `
          <span>✓</span>
          UPDATE READY // RESTARTING AURORA...
        `;

      }


      reloading =
        true;


      setTimeout(
        () => {

          window.location
            .reload();

        },
        700
      );

    }

    catch (error) {

      console.error(
        "Aurora Update Error:",
        error
      );


      reloading =
        false;


      if (button) {

        button.disabled =
          false;


        button.textContent =
          "↻ RETRY UPDATE";

      }


      if (status) {

        status.innerHTML = `
          <span>!</span>
          UPDATE FAILED // RETRY AVAILABLE
        `;

      }

    }

  }


  /* ==========================================================
     SERVICE WORKER REGISTRATION WATCH
  ========================================================== */

  async function initializeServiceWorker() {

    if (
      !(
        "serviceWorker" in
        navigator
      )
    ) {

      return;

    }


    try {

      registration =
        await navigator
          .serviceWorker
          .register("./sw.js", { updateViaCache: "none" });


      if (
        !registration
      ) {

        return;

      }


      /*
        A waiting worker means a real
        service-worker update already exists.
      */

      if (
        registration.waiting
      ) {

        updateDetected =
          true;


        showModal();

      }


      registration
        .addEventListener(
          "updatefound",
          () => {

            const worker =
              registration
                .installing;


            if (!worker) {

              return;

            }


            worker
              .addEventListener(
                "statechange",
                () => {

                  if (
                    worker.state ===
                    "installed" &&
                    navigator
                      .serviceWorker
                      .controller
                  ) {

                    updateDetected =
                      true;


                    showModal();

                  }

                }
              );

          }
        );


    }

    catch (error) {

      console.warn(
        "Aurora SW watcher:",
        error
      );

    }

  }


  /* ==========================================================
     INITIALIZE
  ========================================================== */

  async function init() {

    await initializeServiceWorker();


    /*
      Let the current app fully boot first.
    */

    setTimeout(
      () => {

        checkForUpdate(
          true
        );

      },
      5000
    );


    /*
      Background checks.
    */

    setInterval(
      () => {

        if (
          !updateDetected
        ) {

          checkForUpdate(
            true
          );

        }

      },
      CHECK_INTERVAL
    );

  }


  /* ==========================================================
     CHECK WHEN USER RETURNS TO APP
  ========================================================== */

  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document
          .visibilityState ===
        "visible" &&
        !updateDetected
      ) {

        checkForUpdate(
          true
        );

      }

    }
  );


  window.addEventListener(
    "online",
    () => {

      if (
        !updateDetected
      ) {

        checkForUpdate(
          true
        );

      }

    }
  );


  window.addEventListener(
    "focus",
    () => {

      if (
        !updateDetected
      ) {

        checkForUpdate(
          true
        );

      }

    }
  );


  window.addEventListener(
    "load",
    init
  );


  return {

    check:
      () =>
        checkForUpdate(
          false
        ),

    apply:
      applyUpdate,

    close:
      closeModal

  };

})();



/* ============================================================
   AURORA // RESILIENCE & UX STATE ENGINE
============================================================ */

const AuroraUXState = (() => {

  let currentState =
    "connecting";


  let lastPendingData =
    null;


  let hooked =
    false;


  let skeletonHidden =
    false;


  let lastErrorMessage =
    "";


  let previousNormalizedState =
    "";


  /* ==========================================================
     SAFE CLONE
  ========================================================== */

  function cloneData(
    data
  ) {

    try {

      return structuredClone(
        data
      );

    }

    catch (_) {

      try {

        return JSON.parse(
          JSON.stringify(
            data
          )
        );

      }

      catch (_) {

        return data;

      }

    }

  }


  /* ==========================================================
     CLOUD STATUS
  ========================================================== */

  function cloudStatus() {

    try {

      return (
        window.AuroraCloudSync
          ?.status?.() ||
        {}
      );

    }

    catch (_) {

      return {};

    }

  }


  /* ==========================================================
     NORMALIZE CLOUD STATE
  ========================================================== */

  function normalizeCloudState() {

    const status =
      cloudStatus();


    /* --------------------------------------------------------
       BROWSER OFFLINE IS AUTHORITATIVE
    -------------------------------------------------------- */

    if (
      navigator.onLine ===
      false
    ) {

      return {
        state:
          "offline",

        status
      };

    }


    /* --------------------------------------------------------
       CONFLICT
    -------------------------------------------------------- */

    if (
      status.conflict === true ||
      status.hasConflict === true
    ) {

      return {
        state:
          "conflict",

        status
      };

    }


    /* --------------------------------------------------------
       ERROR OBJECT / MESSAGE
    -------------------------------------------------------- */

    const error =
      status.error ||
      status.lastError ||
      status.syncError ||
      null;


    if (error) {

      return {
        state:
          "error",

        error,

        status
      };

    }


    /* --------------------------------------------------------
       STRING STATUS
    -------------------------------------------------------- */

    const rawState =
      String(

        status.state ||
        status.syncState ||
        status.status ||
        status.connectionState ||
        ""

      )
        .trim()
        .toLowerCase();


    if (
      rawState.includes(
        "error"
      ) ||
      rawState.includes(
        "fail"
      )
    ) {

      return {
        state:
          "error",

        status
      };

    }


    if (
      rawState.includes(
        "conflict"
      )
    ) {

      return {
        state:
          "conflict",

        status
      };

    }


    if (
      rawState.includes(
        "offline"
      )
    ) {

      return {
        state:
          "offline",

        status
      };

    }


    if (
      rawState.includes(
        "syncing"
      ) ||
      rawState.includes(
        "saving"
      )
    ) {

      return {
        state:
          "syncing",

        status
      };

    }


    if (
      rawState.includes(
        "connect"
      ) ||
      rawState.includes(
        "loading"
      )
    ) {

      return {
        state:
          "connecting",

        status
      };

    }


    /* --------------------------------------------------------
       BOOLEAN SIGNALS
    -------------------------------------------------------- */

    if (
      status.syncing === true ||
      status.saving === true ||
      status.pending === true
    ) {

      return {
        state:
          "syncing",

        status
      };

    }


    if (
      status.ready === true
    ) {

      return {
        state:
          "synced",

        status
      };

    }


    return {
      state:
        "connecting",

      status
    };

  }


  /* ==========================================================
     UI
  ========================================================== */

  function ensureUI() {

    /* --------------------------------------------------------
       STATUS BANNER
    -------------------------------------------------------- */

    if (
      !document.getElementById(
        "auroraUxStatus"
      )
    ) {

      const status =
        document.createElement(
          "div"
        );


      status.id =
        "auroraUxStatus";


      status.className =
        "aurora-ux-status";


      status.innerHTML = `

        <span
          class="aurora-ux-status-dot"
        ></span>

        <div>

          <strong
            id="auroraUxStatusTitle"
          >
            CONNECTING
          </strong>

          <small
            id="auroraUxStatusText"
          >
            Establishing Aurora Cloud link...
          </small>

        </div>

      `;


      document.body
        .appendChild(
          status
        );

    }


    /* --------------------------------------------------------
       RETRY PANEL
    -------------------------------------------------------- */

    if (
      !document.getElementById(
        "auroraSyncRetry"
      )
    ) {

      const retry =
        document.createElement(
          "div"
        );


      retry.id =
        "auroraSyncRetry";


      retry.className =
        "aurora-sync-retry";


      retry.innerHTML = `

        <div
          class="aurora-sync-retry-icon"
        >
          !
        </div>


        <div
          class="aurora-sync-retry-copy"
        >

          <span>
            AURORA // CLOUD ERROR
          </span>

          <strong>
            SAVE FAILED
          </strong>

          <small
            id="auroraSyncRetryMessage"
          >
            Data could not be synchronized.
          </small>

        </div>


        <button
          type="button"
          id="auroraSyncRetryBtn"
        >
          ↻ RETRY SYNC
        </button>


        <button
          type="button"
          id="auroraSyncRetryClose"
          aria-label="Dismiss"
        >
          ×
        </button>

      `;


      document.body
        .appendChild(
          retry
        );


      document
        .getElementById(
          "auroraSyncRetryBtn"
        )
        ?.addEventListener(
          "click",
          retrySync
        );


      document
        .getElementById(
          "auroraSyncRetryClose"
        )
        ?.addEventListener(
          "click",
          hideRetry
        );

    }


    /* --------------------------------------------------------
       INITIAL SKELETON
    -------------------------------------------------------- */

    createSkeleton();

  }


  /* ==========================================================
     SKELETON
  ========================================================== */

  function createSkeleton() {

    if (
      skeletonHidden
    ) {
      return;
    }


    if (
      document.getElementById(
        "auroraCloudSkeleton"
      )
    ) {
      return;
    }


    const main =
      document.querySelector(
        ".main"
      );


    if (!main) {
      return;
    }


    const skeleton =
      document.createElement(
        "div"
      );


    skeleton.id =
      "auroraCloudSkeleton";


    skeleton.className =
      "aurora-cloud-skeleton";


    skeleton.innerHTML = `

      <div
        class="aurora-skeleton-head"
      >

        <div>

          <span
            class="aurora-skeleton-code"
          >
            AURORA // CLOUD INITIALIZATION
          </span>

          <strong>
            SYNCHRONIZING SYSTEM
          </strong>

        </div>


        <div
          class="aurora-skeleton-orbit"
        >
          <i></i>
        </div>

      </div>


      <div
        class="aurora-skeleton-grid"
      >

        <div
          class="aurora-skeleton-card"
        >
          <i></i>
          <b></b>
          <span></span>
        </div>


        <div
          class="aurora-skeleton-card"
        >
          <i></i>
          <b></b>
          <span></span>
        </div>


        <div
          class="aurora-skeleton-card"
        >
          <i></i>
          <b></b>
          <span></span>
        </div>


        <div
          class="aurora-skeleton-card"
        >
          <i></i>
          <b></b>
          <span></span>
        </div>

      </div>


      <div
        class="aurora-skeleton-large"
      >

        <i></i>

        <span></span>

        <span></span>

        <span></span>

        <span></span>

      </div>

    `;


    main.prepend(
      skeleton
    );

  }


  function hideSkeleton() {

    if (
      skeletonHidden
    ) {
      return;
    }


    skeletonHidden =
      true;


    const skeleton =
      document.getElementById(
        "auroraCloudSkeleton"
      );


    if (!skeleton) {
      return;
    }


    skeleton.classList
      .add(
        "leaving"
      );


    setTimeout(
      () => {

        skeleton.remove();

      },
      280
    );

  }


  /* ==========================================================
     STATUS BANNER
  ========================================================== */

  function setStatus(
    state,
    title,
    message
  ) {

    ensureUI();


    currentState =
      state;


    const box =
      document.getElementById(
        "auroraUxStatus"
      );


    const heading =
      document.getElementById(
        "auroraUxStatusTitle"
      );


    const text =
      document.getElementById(
        "auroraUxStatusText"
      );


    if (
      !box ||
      !heading ||
      !text
    ) {
      return;
    }


    box.className =
      `aurora-ux-status ${state}`;


    heading.textContent =
      title;


    text.textContent =
      message;


    /* --------------------------------------------------------
       SYNCED = TRANSIENT ONLY
    -------------------------------------------------------- */

    if (
      state ===
      "synced"
    ) {

      box.classList
        .add(
          "visible"
        );


      setTimeout(
        () => {

          if (
            currentState ===
            "synced"
          ) {

            box.classList
              .remove(
                "visible"
              );

          }

        },
        1600
      );


      return;

    }


    box.classList
      .add(
        "visible"
      );

  }


  /* ==========================================================
     RETRY UI
  ========================================================== */

  function showRetry(
    message =
      "Data could not be synchronized with Aurora Cloud."
  ) {

    ensureUI();


    const panel =
      document.getElementById(
        "auroraSyncRetry"
      );


    const text =
      document.getElementById(
        "auroraSyncRetryMessage"
      );


    if (text) {

      text.textContent =
        message;

    }


    panel
      ?.classList
      .add(
        "visible"
      );

  }


  function hideRetry() {

    document
      .getElementById(
        "auroraSyncRetry"
      )
      ?.classList
      .remove(
        "visible"
      );

  }


  /* ==========================================================
     CLOUD QUEUE HOOK

     Captures the last data that Aurora
     attempted to send to Supabase.
  ========================================================== */

  function hookCloudQueue() {

    if (
      hooked
    ) {
      return true;
    }


    const cloud =
      window.AuroraCloudSync;


    if (
      !cloud ||
      typeof cloud.queueSave !==
      "function"
    ) {

      return false;

    }


    if (
      cloud.queueSave
        .__auroraUxWrapped
    ) {

      hooked =
        true;

      return true;

    }


    const original =
      cloud.queueSave
        .bind(
          cloud
        );


    function wrappedQueueSave(
      data,
      ...args
    ) {

      lastPendingData =
        cloneData(
          data
        );


      setStatus(
        "syncing",
        "SYNCING",
        "Saving changes to Aurora Cloud..."
      );


      try {

        const result =
          original(
            data,
            ...args
          );


        /* Promise-based cloud implementation */

        if (
          result &&
          typeof result.then ===
          "function"
        ) {

          result
            .then(
              () => {

                /*
                  Do not clear immediately.
                  The status monitor confirms
                  the cloud reached READY.
                */

              }
            )
            .catch(
              error => {

                lastErrorMessage =
                  error?.message ||
                  "Cloud save failed.";


                setStatus(
                  "error",
                  "SYNC FAILED",
                  lastErrorMessage
                );


                showRetry(
                  lastErrorMessage
                );

              }
            );

        }


        return result;

      }

      catch (error) {

        lastErrorMessage =
          error?.message ||
          "Cloud save failed.";


        setStatus(
          "error",
          "SYNC FAILED",
          lastErrorMessage
        );


        showRetry(
          lastErrorMessage
        );


        throw error;

      }

    }


    wrappedQueueSave
      .__auroraUxWrapped =
      true;


    wrappedQueueSave
      .__auroraOriginal =
      original;


    cloud.queueSave =
      wrappedQueueSave;


    hooked =
      true;


    console.log(
      "🛡 Aurora resilience layer connected."
    );


    return true;

  }


  /* ==========================================================
     RETRY SYNC
  ========================================================== */

  async function retrySync() {

    if (
      navigator.onLine ===
      false
    ) {

      setStatus(
        "offline",
        "OFFLINE MODE",
        "Internet connection is unavailable."
      );


      return;

    }


    const cloud =
      window.AuroraCloudSync;


    if (
      !cloud ||
      typeof cloud.queueSave !==
      "function"
    ) {

      setStatus(
        "error",
        "CLOUD UNAVAILABLE",
        "Aurora Cloud engine is not ready."
      );


      return;

    }


    const status =
      cloudStatus();


    if (
      status.ready === true &&
      status.canWrite === false
    ) {

      hideRetry();


      toast(
        "MEMBER // VIEW ONLY"
      );


      return;

    }


    const retryButton =
      document.getElementById(
        "auroraSyncRetryBtn"
      );


    if (
      retryButton
    ) {

      retryButton.disabled =
        true;


      retryButton.textContent =
        "RETRYING...";

    }


    setStatus(
      "syncing",
      "RETRYING SYNC",
      "Reconnecting to Aurora Cloud..."
    );


    try {

      const payload =
        lastPendingData ||
        cloneData(
          AuroraDataStore.get()
        );


      const result =
        cloud.queueSave(
          payload
        );


      if (
        result &&
        typeof result.then ===
        "function"
      ) {

        await result;

      }


      /*
        Status monitor will confirm whether
        the cloud save actually succeeded.
      */

    }

    catch (error) {

      lastErrorMessage =
        error?.message ||
        "Retry failed.";


      showRetry(
        lastErrorMessage
      );

    }

    finally {

      setTimeout(
        () => {

          if (
            retryButton
          ) {

            retryButton.disabled =
              false;


            retryButton.textContent =
              "↻ RETRY SYNC";

          }

        },
        900
      );

    }

  }


  /* ==========================================================
     STATE MONITOR
  ========================================================== */

  function monitor() {

    hookCloudQueue();


    const normalized =
      normalizeCloudState();


    const state =
      normalized.state;


    /*
      Avoid repeatedly repainting
      identical state.
    */

    if (
      state ===
      previousNormalizedState
    ) {

      return;

    }


    previousNormalizedState =
      state;


    /* --------------------------------------------------------
       CONNECTING
    -------------------------------------------------------- */

    if (
      state ===
      "connecting"
    ) {

      setStatus(
        "connecting",
        "CONNECTING",
        "Establishing Aurora Cloud link..."
      );


      return;

    }


    /* --------------------------------------------------------
       SYNCING
    -------------------------------------------------------- */

    if (
      state ===
      "syncing"
    ) {

      hideSkeleton();


      setStatus(
        "syncing",
        "SYNCING",
        "Synchronizing household data..."
      );


      return;

    }


    /* --------------------------------------------------------
       SYNCED
    -------------------------------------------------------- */

    if (
      state ===
      "synced"
    ) {

      hideSkeleton();


      hideRetry();


      lastPendingData =
        null;


      lastErrorMessage =
        "";


      setStatus(
        "synced",
        "CLOUD SYNCED",
        "Aurora data is up to date."
      );


      return;

    }


    /* --------------------------------------------------------
       OFFLINE
    -------------------------------------------------------- */

    if (
      state ===
      "offline"
    ) {

      hideSkeleton();


      setStatus(
        "offline",
        "OFFLINE MODE",
        "Local cache active • Cloud sync paused"
      );


      return;

    }


    /* --------------------------------------------------------
       CONFLICT
    -------------------------------------------------------- */

    if (
      state ===
      "conflict"
    ) {

      hideSkeleton();


      setStatus(
        "conflict",
        "SYNC CONFLICT",
        "Cloud data changed on another device."
      );


      showRetry(
        "Aurora detected a cloud revision conflict. Retry after reviewing the latest cloud state."
      );


      return;

    }


    /* --------------------------------------------------------
       ERROR
    -------------------------------------------------------- */

    if (
      state ===
      "error"
    ) {

      hideSkeleton();


      const message =
        normalized.error
          ?.message ||
        String(
          normalized.error ||
          lastErrorMessage ||
          "Aurora Cloud synchronization failed."
        );


      setStatus(
        "error",
        "SYNC FAILED",
        message
      );


      showRetry(
        message
      );

    }

  }


  /* ==========================================================
     ONLINE / OFFLINE
  ========================================================== */

  window.addEventListener(
    "offline",
    () => {

      previousNormalizedState =
        "";


      setStatus(
        "offline",
        "OFFLINE MODE",
        "Local cache active • Cloud sync paused"
      );

    }
  );


  window.addEventListener(
    "online",
    () => {

      previousNormalizedState =
        "";


      setStatus(
        "connecting",
        "RECONNECTING",
        "Internet restored • Contacting Aurora Cloud..."
      );


      /*
        If Aurora had unsynced changes,
        automatically retry once.
      */

      setTimeout(
        () => {

          if (
            lastPendingData
          ) {

            retrySync();

          }

        },
        900
      );

    }
  );


  /* ==========================================================
     INIT
  ========================================================== */

  function init() {

    ensureUI();


    /*
      Skeleton should never permanently
      block the application.
    */

    setTimeout(
      hideSkeleton,
      7000
    );


    monitor();


    setInterval(
      monitor,
      2000
    );

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once:
          true
      }
    );

  }

  else {

    init();

  }


  return {

    retry:
      retrySync,

    status:
      () => ({
        state:
          currentState,

        hasPendingData:
          Boolean(
            lastPendingData
          ),

        lastError:
          lastErrorMessage
      })

  };

})();
