import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Initialize Supabase admin client (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabaseAdmin.from("schools").insert(data);

    if (error) {
      console.error("School insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send Welcome Email
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; padding: 40px; background-color: #ffffff;">
          <h1 style="color: #059669; font-size: 24px; margin-bottom: 20px;">Welcome to Ninnadaya '26!</h1>
          <p style="color: #333333; font-size: 16px; line-height: 1.6;">
            Dear ${data.coordinator_name},
          </p>
          <p style="color: #333333; font-size: 16px; line-height: 1.6;">
            Thank you for registering <strong>${data.school_name}</strong> for Ninnadaya '26. We are thrilled to have your school participate in this year's competition.
          </p>
          <p style="color: #333333; font-size: 16px; line-height: 1.6;">
            Your coordinator account has been successfully created. You can now log into your dashboard to start adding your contestants.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="https://ninnadaya-26.vercel.app/login" style="background-color: #eab308; color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Access Dashboard</a>
          </div>
          <p style="color: #666666; font-size: 14px; line-height: 1.5; border-top: 1px solid #eaeaea; padding-top: 20px;">
            If you have any questions, please contact our support team.<br>
            <strong>Teacher-in-Charge:</strong> 0777287130<br>
            <strong>President:</strong> 0718159221
          </p>
        </div>
      `;

      try {
        await resend.emails.send({
          from: "Ninnadaya '26 <ninnadaya26@gmail.com>", // Update this to a verified domain in Resend later if needed
          to: data.coordinator_email,
          subject: "Welcome to Ninnadaya '26 - Registration Confirmed",
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // We don't fail the registration if the email fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
