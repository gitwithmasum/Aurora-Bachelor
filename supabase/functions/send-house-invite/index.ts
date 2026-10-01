import { createSupabaseContext } from "npm:@supabase/server";


/* ============================================================
   AURORA BACHELOR
   SEND HOUSE INVITATION
   SUPABASE EDGE FUNCTION + BREVO
============================================================ */


const corsHeaders = {

  "Access-Control-Allow-Origin":
    "*",

  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",

  "Access-Control-Allow-Methods":
    "POST, OPTIONS",

};


/* ============================================================
   JSON RESPONSE
============================================================ */

function jsonResponse(
  body: unknown,
  status = 200
) {

  return new Response(

    JSON.stringify(body),

    {

      status,

      headers: {

        ...corsHeaders,

        "Content-Type":
          "application/json",

      },

    }

  );

}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHtml(
  value: unknown
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


/* ============================================================
   EDGE FUNCTION
============================================================ */


const BREVO_SENDER = "sciencefiction844@gmail.com";

async function brevoGet(path: string, key: string) {
  const response = await fetch("https://api.brevo.com/v3/" + path, {
    headers: { "api-key": key, accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error("Brevo: " + (data.message || "Status lookup failed."));
  return data;
}

async function blockedRecipient(email: string, key: string) {
  // Brevo does not provide an email filter on this endpoint.
  for (let offset = 0; offset < 2000; offset += 100) {
    const data = await brevoGet("smtp/blockedContacts?limit=100&offset=" + offset, key);
    const contacts = data.contacts || [];
    const match = contacts.find((item: any) =>
      String(item.email).toLowerCase() === email &&
      (!item.senderEmail || String(item.senderEmail).toLowerCase() === BREVO_SENDER));
    if (match) return match;
    if (contacts.length < 100 || offset + 100 >= data.count) return null;
  }
  throw new Error("Blocked-contact list is too large to verify. Check Brevo directly.");
}

async function invitationEmailStatus(invitation: any, key: string) {
  const email = String(invitation.email).toLowerCase();
  const blocked = await blockedRecipient(email, key);
  if (blocked) return {
    status: "blocked",
    message: "Brevo currently blocks email to this recipient: " +
      (blocked.reason?.message || blocked.reason?.code || "Blocked or unsubscribed") +
      ". Review this contact in Brevo; resubscribe only with recipient consent.",
  };
  const params = new URLSearchParams({email, limit: "500", sort: "desc", days: "30"});
  const data = await brevoGet("smtp/statistics/events?" + params, key);
  const events = (data.events || []).filter((item: any) =>
    String(item.email).toLowerCase() === email &&
    item.from === BREVO_SENDER &&
    (Array.isArray(item.tag) ? item.tag.includes("aurora-house-invitation") :
      String(item.tag || "").includes("aurora-house-invitation")) &&
    Date.parse(item.date) >= Date.parse(invitation.created_at || "1970-01-01"))
    .sort((a: any, b: any) => Date.parse(b.date) - Date.parse(a.date));
  // A late event from an older send must not override a newer request.
  const newest = events.find((item: any) => item.event === "request") || events[0];
  if (!newest) return {status: "unknown", message:
    "No recent Aurora email event found for this recipient. Delivery is not confirmed."};
  const messageEvents = events.filter((item: any) => item.messageId === newest.messageId);
  const failure = messageEvents.find((item: any) =>
    ["blocked", "error", "invalid", "hardBounce", "hard_bounce", "spam", "unsubscribed"].includes(item.event));
  const delivered = messageEvents.find((item: any) => item.event === "delivered");
  const event = failure || delivered || newest;
  return {
    status: event.event, date: event.date,
    message: event.event === "delivered" ?
      "Brevo reports the latest Aurora email was delivered to the recipient mail server. Check Spam and All Mail if it is missing from Inbox." :
      "Latest Aurora email: " + event.event +
        (event.reason ? ". Reason: " + event.reason : "") +
        ". Inbox delivery is not confirmed.",
  };
}

export default {

  fetch: async (
    req: Request
  ) => {


    /* ========================================================
       CORS
    ======================================================== */

    if (
      req.method ===
      "OPTIONS"
    ) {

      return new Response(
        "ok",
        {
          headers:
            corsHeaders,
        }
      );

    }


    /* ========================================================
       POST ONLY
    ======================================================== */

    if (
      req.method !==
      "POST"
    ) {

      return jsonResponse(

        {
          error:
            "Method not allowed.",
        },

        405

      );

    }


    try {


      /* ======================================================
         AUTHENTICATE CURRENT AURORA USER
      ====================================================== */

      const {

        data: ctx,

        error: authError,

      } =
        await createSupabaseContext(

          req,

          {
            auth:
              "user",
          }

        );


      if (
        authError ||
        !ctx
      ) {

        return jsonResponse(

          {

            error:
              authError?.message ||
              "Authentication required.",

          },

          401

        );

      }


      /* ======================================================
         REQUEST BODY
      ====================================================== */

      const body =
        await req.json();


      const householdId =
        String(
          body?.householdId ||
          ""
        ).trim();


      const email =
        String(
          body?.email ||
          ""
        )
          .trim()
          .toLowerCase();


      const fullName =
        String(
          body?.fullName ||
          ""
        ).trim();


      const phone =
        String(
          body?.phone ||
          ""
        ).trim();


      const room =
        String(
          body?.room ||
          ""
        ).trim();


      /* ======================================================
         VALIDATION
      ====================================================== */

      if (!householdId) {

        return jsonResponse(

          {
            error:
              "Household ID is required.",
          },

          400

        );

      }


      if (!email) {

        return jsonResponse(

          {
            error:
              "Google email is required.",
          },

          400

        );

      }



      if (body?.action && body.action !== "status") {
        return jsonResponse({error: "Unsupported invitation action."}, 400);
      }
      if (body?.action === "status") {
        const {data: pending, error: lookupError} = await ctx.supabase.rpc(
          "aurora_get_pending_invitations", {p_household_id: householdId});
        if (lookupError) return jsonResponse({error: lookupError.message}, 403);
        const target = (pending || []).find((item: any) =>
          item.invitation_id === body.invitationId && String(item.email).toLowerCase() === email);
        if (!target) return jsonResponse({error: "Pending invitation not found."}, 404);
        const key = Deno.env.get("BREVO_API_KEY");
        if (!key) return jsonResponse({error: "Brevo email service is not configured."}, 503);
        return jsonResponse({success: true, ...(await invitationEmailStatus(target, key))});
      }

      /* ======================================================
         CREATE SECURE INVITATION

         Database RPC checks:
         - authenticated user
         - real household owner
         - valid email
         - existing member
         - secure invitation token
         - 7 day expiration
      ====================================================== */

      const {

        data:
          invitationRows,

        error:
          invitationError,

      } =
        await ctx.supabase.rpc(

          "aurora_create_invitation",

          {

            p_household_id:
              householdId,

            p_email:
              email,

            p_full_name:
              fullName ||
              null,

            p_phone:
              phone ||
              null,

            p_room:
              room ||
              null,

          }

        );


      if (
        invitationError
      ) {

        console.error(
          "❌ Invitation RPC Error:",
          invitationError
        );


        return jsonResponse(

          {

            error:
              invitationError.message,

          },

          400

        );

      }


      const invitation =
        Array.isArray(
          invitationRows
        )

          ? invitationRows[0]

          : invitationRows;


      if (
        !invitation
          ?.invite_token
      ) {

        return jsonResponse(

          {

            error:
              "Invitation token was not created.",

          },

          500

        );

      }


      /* ======================================================
         INVITATION URL
      ====================================================== */

      const inviteUrl =

        "https://gitwithmasum.github.io/Aurora-Bachelor/" +

        "?invite=" +

        encodeURIComponent(
          invitation.invite_token
        );


      /* ======================================================
         BREVO API SECRET
      ====================================================== */

      const brevoApiKey =
        Deno.env.get(
          "BREVO_API_KEY"
        );


      if (
        !brevoApiKey
      ) {

        console.error(
          "❌ BREVO_API_KEY missing"
        );


        return jsonResponse(

          {

            error:
              "Brevo email service is not configured.",

          },

          500

        );

      }


      /* ======================================================
         INVITER DETAILS
      ====================================================== */

      const inviterEmail =
        String(

          ctx.userClaims
            ?.email ||

          "Aurora House Owner"

        );


      /* ======================================================
         SAFE EMAIL VALUES
      ====================================================== */

      const safeName =
        escapeHtml(

          fullName ||
          "House Member"

        );


      const safeEmail =
        escapeHtml(
          email
        );


      const safeInviter =
        escapeHtml(
          inviterEmail
        );


      const safeRoom =
        escapeHtml(

          room ||
          "Not specified"

        );


      /* ======================================================
         AURORA FUTURISTIC EMAIL TEMPLATE
      ====================================================== */

      const emailHtml = `

<!DOCTYPE html>

<html>

<head>

  <meta
    charset="UTF-8"
  >

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>
    Aurora Bachelor Invitation
  </title>

</head>


<body
  style="
    margin:0;
    padding:0;
    background:#020817;
    font-family:Arial,Helvetica,sans-serif;
    color:#eaf8ff;
  "
>


  <div
    style="
      width:100%;
      background:#020817;
      padding:40px 0;
    "
  >


    <div
      style="
        max-width:620px;
        margin:0 auto;
        padding:0 20px;
      "
    >


      <div
        style="
          border:1px solid #173b58;
          border-radius:24px;
          overflow:hidden;
          background:
            linear-gradient(
              145deg,
              #07172b,
              #030a18
            );
          box-shadow:
            0 0 32px
            rgba(0,220,255,.08);
        "
      >


        <!-- TOP GLOW -->

        <div
          style="
            height:3px;
            background:
              linear-gradient(
                90deg,
                #00eaff,
                #6574ff,
                #b84dff
              );
          "
        ></div>


        <div
          style="
            padding:36px;
          "
        >


          <!-- BRAND -->

          <div
            style="
              font-size:11px;
              letter-spacing:2.4px;
              color:#55e7ff;
              font-weight:700;
              margin-bottom:14px;
            "
          >
            AURORA // HOUSE ACCESS PROTOCOL
          </div>


          <!-- TITLE -->

          <h1
            style="
              margin:0;
              font-size:29px;
              line-height:1.25;
              color:#ffffff;
            "
          >
            You're invited to
            <span
              style="
                color:#5feeff;
              "
            >
              Aurora Bachelor
            </span>
          </h1>


          <p
            style="
              color:#91aabd;
              line-height:1.75;
              font-size:15px;
              margin:17px 0 0;
            "
          >

            Hello

            <strong
              style="
                color:#ffffff;
              "
            >
              ${safeName}
            </strong>,

            <br><br>

            You have received a secure invitation
            to join the Aurora Bachelor household.

          </p>


          <!-- INFO PANEL -->

          <div
            style="
              margin:28px 0;
              padding:20px;
              border-radius:16px;
              background:#061324;
              border:1px solid #123550;
            "
          >


            <div
              style="
                color:#6f8da5;
                font-size:10px;
                letter-spacing:1.5px;
                margin-bottom:7px;
              "
            >
              INVITED GOOGLE ACCOUNT
            </div>


            <div
              style="
                color:#ffffff;
                font-size:15px;
                word-break:break-word;
              "
            >
              ${safeEmail}
            </div>



            <div
              style="
                color:#6f8da5;
                font-size:10px;
                letter-spacing:1.5px;
                margin-top:20px;
                margin-bottom:7px;
              "
            >
              ACCESS LEVEL
            </div>


            <div
              style="
                color:#63efff;
                font-size:14px;
                font-weight:700;
              "
            >
              MEMBER
            </div>



            <div
              style="
                color:#6f8da5;
                font-size:10px;
                letter-spacing:1.5px;
                margin-top:20px;
                margin-bottom:7px;
              "
            >
              ROOM / SEAT
            </div>


            <div
              style="
                color:#ffffff;
                font-size:14px;
              "
            >
              ${safeRoom}
            </div>



            <div
              style="
                color:#6f8da5;
                font-size:10px;
                letter-spacing:1.5px;
                margin-top:20px;
                margin-bottom:7px;
              "
            >
              INVITED BY
            </div>


            <div
              style="
                color:#ffffff;
                font-size:14px;
              "
            >
              ${safeInviter}
            </div>


          </div>


          <!-- ACCEPT BUTTON -->

          <div
            style="
              margin-top:26px;
            "
          >

            <a

              href="${inviteUrl}"

              target="_blank"

              style="
                display:inline-block;
                padding:15px 25px;
                border-radius:12px;
                background:
                  linear-gradient(
                    135deg,
                    #39e8ff,
                    #6d9cff
                  );
                color:#021018;
                font-size:14px;
                font-weight:800;
                text-decoration:none;
                letter-spacing:.4px;
              "

            >
              ACCEPT INVITATION
            </a>

          </div>


          <!-- SECURITY INFO -->

          <div
            style="
              margin-top:28px;
              padding:14px 16px;
              border-radius:12px;
              background:
                rgba(0,229,255,.04);
              border:
                1px solid
                rgba(0,229,255,.12);
              color:#84aabd;
              font-size:12px;
              line-height:1.7;
            "
          >

            🔐 This invitation expires in
            <strong
              style="
                color:#ffffff;
              "
            >
              7 days
            </strong>.

            <br>

            You must sign in using:

            <strong
              style="
                color:#9defff;
              "
            >
              ${safeEmail}
            </strong>

          </div>


          <!-- FOOTER -->

          <div
            style="
              height:1px;
              background:#12334c;
              margin:30px 0 18px;
            "
          ></div>


          <div
            style="
              color:#49697f;
              font-size:10px;
              letter-spacing:1.6px;
              line-height:1.7;
            "
          >

            AURORA BACHELOR
            <br>
            SECURE HOUSE MANAGEMENT SYSTEM

          </div>


        </div>

      </div>


      <div
        style="
          text-align:center;
          color:#405a6d;
          font-size:10px;
          margin-top:18px;
        "
      >
        This is an automated household invitation.
      </div>


    </div>

  </div>


</body>

</html>

      `;


      /* ======================================================
         SEND EMAIL WITH BREVO
      ====================================================== */

      console.log(
        "📧 Aurora: sending invitation via Brevo to:",
        invitation.invitation_email
      );


      const brevoResponse =
        await fetch(

          "https://api.brevo.com/v3/smtp/email",

          {

            method:
              "POST",


            headers: {

              "accept":
                "application/json",

              "api-key":
                brevoApiKey,

              "content-type":
                "application/json",

            },


            body:
              JSON.stringify(
                {

                  /* =========================================
                     VERIFIED BREVO SENDER
                  ========================================= */

                  sender: {

                    name:
                      "Aurora Bachelor",

                    email:
                      "sciencefiction844@gmail.com",

                  },


                  /* =========================================
                     RECIPIENT
                  ========================================= */

                  to: [

                    {

                      email:
                        invitation
                          .invitation_email,

                      name:
                        fullName ||
                        "Aurora Member",

                    },

                  ],


                  /* =========================================
                     REPLY-TO
                  ========================================= */

                  replyTo: {

                    email:
                      "sciencefiction844@gmail.com",

                    name:
                      "Aurora Bachelor",

                  },


                  /* =========================================
                     EMAIL
                  ========================================= */

                  subject:
                    "You're invited to Aurora Bachelor",


                  htmlContent:
                    emailHtml,


                  /* =========================================
                     BREVO TAG
                  ========================================= */

                  tags: [
                    "aurora-house-invitation"
                  ],

                }
              ),

          }

        );


      /* ======================================================
         READ BREVO RESPONSE
      ====================================================== */

      let brevoResult:
        Record<string, unknown> =
          {};


      try {

        brevoResult =
          await brevoResponse.json();

      } catch (
        parseError
      ) {

        console.warn(
          "⚠️ Brevo response was not JSON:",
          parseError
        );

      }


      /* ======================================================
         BREVO ERROR
      ====================================================== */

      if (
        !brevoResponse.ok
      ) {

        console.error(
          "❌ Brevo Email Error:",
          brevoResult
        );


        return jsonResponse(

          {

            success:
              false,

            error:
              String(
                brevoResult?.message ||
                "Unable to send invitation email."
              ),

            brevo:
              brevoResult,

          },

          brevoResponse.status ||
          502

        );

      }


      /* ======================================================
         SUCCESS
      ====================================================== */

      console.log(
        "✅ Aurora invitation sent:",
        brevoResult
      );


      return jsonResponse(

        {

          success:
            true,

          message:
            "Invitation email accepted by Brevo; delivery is not yet confirmed.",

          invitationId:
            invitation
              .invitation_id,

          email:
            invitation
              .invitation_email,

          expiresAt:
            invitation
              .expires_at,

          deliveryStatus: "queued",

          brevoMessageId:
            brevoResult
              ?.messageId ||
            null,

        },

        200

      );


    } catch (
      error
    ) {


      /* ======================================================
         UNEXPECTED ERROR
      ====================================================== */

      console.error(
        "❌ Aurora Invite Function Error:",
        error
      );


      return jsonResponse(

        {

          success:
            false,

          error:
            error instanceof Error

              ? error.message

              : "Unexpected server error.",

        },

        500

      );

    }

  },

};
