import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";

const rubricItemSchema = z.object({
  id: z.string().min(1).max(40),
  label: z.string().trim().min(1).max(120),
  max: z.number().min(1).max(100),
});

const eventUpdateSchema = z.object({
  name: z.string().min(1),
  event_format: z.enum(["live", "timed", "submission"]),
  submission_mode: z.enum(["none", "file", "link", "both"]),
  task_brief: z.string().max(5000).nullable().optional(),
  resource_url: z.string().max(1000).nullable().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  rubric: z.array(rubricItemSchema).min(1).max(10),
});

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  if (!(await verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = eventUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid event configuration" },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
    const { name, ...updates } = parsed.data;

    const { data, error } = await supabase
      .from("event_categories")
      .update({
        ...updates,
        task_brief: updates.task_brief?.trim() || null,
        resource_url: updates.resource_url?.trim() || null,
        starts_at: updates.starts_at || null,
        ends_at: updates.ends_at || null,
      })
      .eq("name", name)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, event: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

