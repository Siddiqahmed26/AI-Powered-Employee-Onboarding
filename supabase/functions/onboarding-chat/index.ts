import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an AI onboarding assistant for new employees. Your role is to help new hires navigate their first days at the company.

You have access to the employee's context:
- Their role/job title
- Their department
- Their current onboarding day (Day 1-7)

Based on this context, provide personalized, helpful, and encouraging guidance. Be warm, supportive, and professional.

Key responsibilities:
1. Answer questions about onboarding tasks and priorities
2. Help employees understand company culture and expectations
3. Provide guidance on who to contact for specific issues
4. Offer encouragement and reassurance during the transition
5. Give day-specific advice based on their onboarding progress

Keep responses concise but helpful. Use emojis sparingly to add warmth. If you don't know something specific about the company, provide general best practices and suggest they check with their manager or HR.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- Authentication ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Input Validation ---
    const body = await req.json();
    const { messages, context } = body;

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Invalid messages: must be a non-empty array with at most 50 items" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg || typeof msg.content !== "string") {
        return new Response(
          JSON.stringify({ error: "Invalid message format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      msg.content = msg.content.trim();
      if (msg.content.length === 0 || msg.content.length > 4000) {
        return new Response(
          JSON.stringify({ error: "Invalid message: content must be a string between 1 and 4000 characters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (msg.role !== "user" && msg.role !== "assistant") {
        return new Response(
          JSON.stringify({ error: "Invalid message role: must be 'user' or 'assistant'" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const safeContext = {
      role: typeof context?.role === "string" ? context.role.slice(0, 100) : "New Employee",
      department: typeof context?.department === "string" ? context.department.slice(0, 100) : "Not specified",
      currentDay: typeof context?.currentDay === "number" && context.currentDay >= 1 && context.currentDay <= 7
        ? context.currentDay : 1,
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const contextualPrompt = `${SYSTEM_PROMPT}

Current Employee Context:
- Role: ${safeContext.role}
- Department: ${safeContext.department}
- Onboarding Day: Day ${safeContext.currentDay} of 7

Tailor your responses to be relevant to their role, department, and where they are in their onboarding journey.`;

    console.log("Starting onboarding chat for authenticated user");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: contextualPrompt },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI gateway error:", response.status);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Onboarding chat error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
