"use server";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        await supabase.auth.exchangeCodeForSession(code);
    }

    // Redirect to the home page after successful authentication
    return NextResponse.redirect(new URL("/", request.url));
}
