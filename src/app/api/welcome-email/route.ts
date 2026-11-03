import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { escapeHtml } from "@/lib/utils";

const bodySchema = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

// Sends the one-time welcome email for a school that registered in the last 30 minutes.
// The school row itself is created by a DB trigger at signup (see supabase/migrations/001).
// This endpoint can't be used to spam arbitrary addresses: it only emails an address that
// belongs to a freshly-registered school, and only once (atomic claim on welcome_email_sent_at).
export async function POST(request: Request) {
  const limit = rateLimit(`welcome:${getClientIp(request)}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return NextResponse.json({ success: true, skipped: true });
  }

  try {
    const supabase = createAdminClient();
    const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    // Atomically claim the "welcome email" slot so it is sent at most once
    const { data: claimed, error } = await supabase
      .from("schools")
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .ilike("coordinator_email", parsed.data.email)
      .is("welcome_email_sent_at", null)
      .gte("created_at", since)
      .select("school_name, coordinator_name, coordinator_email")
      .limit(1);

    if (error) throw error;
    const school = claimed?.[0];
    // Same response whether or not a school matched — don't leak which emails are registered
    if (!school) return NextResponse.json({ success: true });

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
    const coordinatorName = escapeHtml(school.coordinator_name);
    const schoolName = escapeHtml(school.school_name);

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; padding: 40px; background-color: #ffffff;">
        <h1 style="color: #059669; font-size: 24px; margin-bottom: 20px;">Welcome to Ninnadaya '26!</h1>
        <p style="color: #333333; font-size: 16px; line-height: 1.6;">
          Dear ${coordinatorName},
        </p>
        <p style="color: #333333; font-size: 16px; line-height: 1.6;">
          Thank you for registering <strong>${schoolName}</strong> for Ninnadaya '26. We are thrilled to have your school participate in this year's competition.
        </p>
        <p style="color: #333333; font-size: 16px; line-height: 1.6;">
          Your coordinator account has been successfully created. You can now log into your dashboard to start adding your contestants.
        </p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${siteUrl}/login" style="background-color: #eab308; color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Access Dashboard</a>
        </div>
        <p style="color: #666666; font-size: 14px; line-height: 1.5; border-top: 1px solid #eaeaea; padding-top: 20px;">
          If you have any questions, please contact our support team.<br>
          <strong>Teacher-in-Charge:</strong> 0777287130<br>
          <strong>President:</strong> 0718159221
        </p>
      </div>
    `;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: sendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL, // must be on a domain verified in Resend
      to: school.coordinator_email,
      subject: "Welcome to Ninnadaya '26 - Registration Confirmed",
      html: emailHtml,
    });
    if (sendError) console.error("Failed to send welcome email:", sendError);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Welcome email error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

