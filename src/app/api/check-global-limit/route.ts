import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const EVENT_LIMITS: Record<string, number> = {
  "Announcing": 50,
  "Announcing (Tamil)": 50,
  "Sports Commentary": 50,
  "Dubbing": 50,
  "Cartoon Drawing": 50,
  "Photography": 50,
  "Graphic Designing": 40,
  "Technical": 50,
  "Short Film": 40,
  "Special Event": 40,
  "Editing": 35,
};

export async function POST(request: Request) {
  try {
    const { category, language, age_group } = await request.json();

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    const limit = EVENT_LIMITS[category];
    if (!limit) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Initialize Supabase admin client (bypasses RLS to count all schools' contestants)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Build the query to count existing global contestants for this specific sub-category combination
    let query = supabaseAdmin
      .from("contestants")
      .select("*", { count: 'exact', head: true })
      .eq("category", category);

    if (language) {
      query = query.eq("language", language);
    } else {
      query = query.is("language", null);
    }

    if (age_group && age_group !== "Open") {
      query = query.eq("age_group", age_group);
    } else {
      query = query.eq("age_group", "Open");
    }

    const { count, error } = await query;

    if (error) {
      console.error("Global limit check error:", error);
      return NextResponse.json({ error: "Failed to check limits" }, { status: 500 });
    }

    // If the count meets or exceeds the global limit, reject it
    if (count !== null && count >= limit) {
      const details = [language, age_group !== "Open" ? age_group : ""].filter(Boolean).join(" ");
      return NextResponse.json({ 
        error: `Global Capacity Reached: The ${category} ${details ? `(${details})` : ""} event is fully booked and cannot accept any more contestants.` 
      }, { status: 400 });
    }

    // Everything is good, they are allowed to register!
    return NextResponse.json({ allowed: true, currentCount: count });

  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
