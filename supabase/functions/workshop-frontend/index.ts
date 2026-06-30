// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { path } = await req.json();
    if (!path) {
      return new Response("Missing path", { status: 400, headers: corsHeaders });
    }

    // Clean path (remove accidental bucket prefix)
    const cleanPath = path.replace(/^course_pdfs\//, "");
    console.log("Received path:", cleanPath);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ✅ Build the full public URL manually (works reliably for public buckets)
    const fileUrl = `https://mbqxwmrzsfjlcksmsuoz.supabase.co/storage/v1/object/public/course_pdfs/${cleanPath}`;
    console.log("Public URL created:", fileUrl);

    // ✅ Send the public URL directly to OpenAI
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("Missing OPENAI_API_KEY");

    console.log("Sending URL to OpenAI for extraction...");
    const extractRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Extract all text from this PDF." },
              { type: "input_file", input_file: { url: fileUrl } },
            ],
          },
        ],
      }),
    });

    const extractJson = await extractRes.json();
    console.log("OpenAI extract response:", extractJson);

    const extractedText = extractJson.choices?.[0]?.message?.content || "";
    if (!extractedText) {
      console.error("No text extracted. Response:", extractJson);
      throw new Error("Failed to extract text");
    }

    console.log("Generating lessons...");
    const lessonRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an expert course designer. Convert raw text into structured lessons.",
          },
          {
            role: "user",
            content: `
Turn the following extracted PDF text into a structured set of lessons.

Each lesson must include:
- title
- summary
- learning_objectives (array)
- content (full lesson text)

Return ONLY valid JSON.

Extracted text:
${extractedText}
            `,
          },
        ],
      }),
    });

    const lessonJson = await lessonRes.json();
    console.log("Lesson generation response:", lessonJson);

    const lessons = JSON.parse(lessonJson.choices[0].message.content);

    console.log("Creating course...");
    const { data: courseRow, error: courseError } = await supabase
      .from("courses")
      .insert({
        title: cleanPath,
        description: "Course generated automatically from uploaded PDF.",
      })
      .select()
      .single();
    if (courseError) throw courseError;

    const courseId = courseRow.id;
    console.log("Saving lessons...");
    for (const lesson of lessons.lessons) {
      const { error: lessonError } = await supabase.from("lessons").insert({
        course_id: courseId,
        title: lesson.title,
        summary: lesson.summary,
        learning_objectives: lesson.learning_objectives,
        content: lesson.content,
      });
      if (lessonError) throw lessonError;
    }

    console.log("All lessons saved successfully");
    return new Response(JSON.stringify({ success: true, course_id: courseId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
