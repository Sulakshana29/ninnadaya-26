import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";

const settingsSchema = z.object({
  registration_open: z.boolean().optional(),
  registration_deadline: z.string().nullable().optional(),
  results_published: z.boolean().optional(),
  points_first: z.number().int().min(0).max(100).optional(),
  points_second: z.number().int().min(0).max(100).optional(),
  points_third: z.number().int().min(0).max(100).optional(),
});

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  if (!(await verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("app_settings")
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", true)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, settings: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

