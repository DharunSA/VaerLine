// ============================================================
// Supabase Edge Function: Automated WhatsApp Milestone Reminders
// Triggered daily via Supabase pg_cron (e.g. at 08:00 AM IST)
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// WhatsApp Cloud API / Twilio Credentials (configured in Supabase Vault / Secrets)
const WHATSAPP_API_TOKEN = Deno.env.get("WHATSAPP_API_TOKEN") ?? "";
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ?? "";
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER") ?? "whatsapp:+14155238886";

interface MilestoneReminder {
  type: "birthday" | "anniversary";
  name: string;
  phone?: string;
  milestoneText: string;
  message: string;
}

serve(async (req: Request) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate(); // 1-31

    console.log(`[WhatsApp Reminders] Checking milestones for ${today.toISOString().split("T")[0]}`);

    // 1. Fetch people with birthdays today
    const { data: people, error: pErr } = await supabase
      .from("people")
      .select("id, name, dob, dod, phone, location")
      .is("dod", null);

    if (pErr) throw pErr;

    const reminders: MilestoneReminder[] = [];

    // Check birthdays
    for (const p of (people ?? [])) {
      if (!p.dob) continue;
      const [year, month, day] = p.dob.split("-").map(Number);
      if (month === currentMonth && day === currentDay) {
        const turningAge = today.getFullYear() - year;
        const message = `🎉 *Vaerline Birthday Alert!* 🎂\n\nWishing *${p.name}* a very Happy ${turningAge}th Birthday today!\nMay this year bring health, success, and joyful family moments! ✨`;

        reminders.push({
          type: "birthday",
          name: p.name,
          phone: p.phone,
          milestoneText: `Turning ${turningAge}`,
          message,
        });
      }
    }

    // 2. Fetch married relationships with anniversaries today
    const { data: rels, error: rErr } = await supabase
      .from("relationships")
      .select("id, from_person_id, to_person_id, marriage_date")
      .eq("type", "SPOUSE_OF")
      .not("marriage_date", "is", null);

    if (rErr) throw rErr;

    const peopleMap = new Map((people ?? []).map((p: { id: string; name: string }) => [p.id, p]));
    const processedCouples = new Set<string>();

    for (const r of (rels ?? [])) {
      if (!r.marriage_date) continue;
      const [mYear, mMonth, mDay] = r.marriage_date.split("-").map(Number);
      if (mMonth === currentMonth && mDay === currentDay) {
        const p1 = peopleMap.get(r.from_person_id);
        const p2 = peopleMap.get(r.to_person_id);
        if (!p1 || !p2) continue;

        const coupleKey = [p1.id, p2.id].sort().join(":");
        if (processedCouples.has(coupleKey)) continue;
        processedCouples.add(coupleKey);

        const years = today.getFullYear() - mYear;
        let milestoneTitle = `${years}th Wedding Anniversary`;
        if (years === 50) milestoneTitle = "50th Golden Wedding Anniversary";
        else if (years === 25) milestoneTitle = "25th Silver Wedding Anniversary";

        const message = `💐 *Vaerline Milestone Celebration!* 💍\n\nHeartiest congratulations to *${p1.name} & ${p2.name}* on their *${milestoneTitle}* today! May your bond of love and heritage continue to shine! 🥂✨`;

        reminders.push({
          type: "anniversary",
          name: `${p1.name} & ${p2.name}`,
          phone: p1.phone || p2.phone,
          milestoneText: milestoneTitle,
          message,
        });
      }
    }

    console.log(`[WhatsApp Reminders] Found ${reminders.length} milestones for today.`);

    // 3. Dispatch via WhatsApp if configured (or return summary)
    const dispatchResults = [];
    for (const rem of reminders) {
      if (rem.phone && WHATSAPP_API_TOKEN && WHATSAPP_PHONE_NUMBER_ID) {
        // Meta WhatsApp Cloud API Dispatch
        const cleanPhone = rem.phone.replace(/[^0-9]/g, "");
        const res = await fetch(
          `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${WHATSAPP_API_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: cleanPhone,
              type: "text",
              text: { body: rem.message },
            }),
          }
        );
        const json = await res.json();
        dispatchResults.push({ name: rem.name, status: "sent", result: json });
      } else {
        dispatchResults.push({ name: rem.name, status: "generated", message: rem.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        date: today.toISOString().split("T")[0],
        totalMilestones: reminders.length,
        milestones: reminders,
        dispatchResults,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[WhatsApp Reminders] Error:", errorMsg);
    return new Response(JSON.stringify({ error: errorMsg }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
