import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils.ts";
import { analyzeWithGemini } from "./gemini.ts";
import { AnalyzePricingRequest } from "./types.ts";

console.log("Analyze Pricing Edge Function loaded.");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured in environment variables.");
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing API Key" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: AnalyzePricingRequest = await req.json();

    // Basic validation
    if (!payload.input || !payload.results) {
      return new Response(
        JSON.stringify({ error: "Invalid request payload: Missing input or results" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing pricing for: ${payload.input.productName}`);

    const analysis = await analyzeWithGemini(payload, GEMINI_API_KEY);

    return new Response(
      JSON.stringify(analysis),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Function error:", error);
    
    const status = error.message.includes("status 429") ? 429 : 500;
    const message = status === 429 
      ? "Too many requests. Please try again later." 
      : (error instanceof Error ? error.message : "An unexpected error occurred during analysis");

    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});