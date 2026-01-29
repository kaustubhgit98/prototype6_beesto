import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const supabase = await createClient();
  
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    // Return a basic profile if not found in DB yet
    return NextResponse.json({ 
      user: {
        id: userId,
        email: user?.emailAddresses[0]?.emailAddress,
      },
      profile: {
        id: userId,
        username: user?.username || user?.firstName || "user",
        full_name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
      }
    });
  }

  return NextResponse.json({ 
    user: {
      id: userId,
      email: user?.emailAddresses[0]?.emailAddress,
    },
    profile 
  });
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const body = await request.json();
  const { username, full_name, avatar_url, gemini_api_key, groq_api_key } = body;

  const updateData: Record<string, string | null> = {
    updated_at: new Date().toISOString(),
  };

  if (username !== undefined) updateData.username = username;
  if (full_name !== undefined) updateData.full_name = full_name;
  if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
  if (gemini_api_key !== undefined) updateData.gemini_api_key = gemini_api_key;
  if (groq_api_key !== undefined) updateData.groq_api_key = groq_api_key;

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile });
}
