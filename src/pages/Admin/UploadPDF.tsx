// @ts-nocheck
import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const UploadPDF: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("SESSION:", data.session);
      setSession(data.session);
    };
    loadSession();
  }, []);

  const upload = async () => {
    if (!file) return;

    if (!session) {
      setStatus("You must be logged in to upload.");
      return;
    }

    setStatus("Uploading...");

    const { data, error } = await supabase.storage
      .from("course_pdfs")
      .upload(`uploads/${Date.now()}-${file.name}`, file);

    if (error) {
      console.error(error);
      setStatus("Upload failed");
      return;
    }

    console.log("Uploaded path:", data.path);
    setStatus("Uploaded. Generating lessons...");

    // ✅ Invoke the Edge Function
    const { data: fnData, error: fnError } = await supabase.functions.invoke(
      "generate-lessons",
      {
        body: { path: data.path },
      }
    );

    if (fnError) {
      console.error(fnError);
      setStatus("Generation failed");
      return;
    }

    const { course_id } = fnData;
    console.log("Generated course ID:", course_id);

    // ✅ Display and navigate
    setStatus(`Lessons generated successfully! Course ID: ${course_id}`);
    navigate(`/technician/learning/course/${course_id}`);
  };

  return (
    <div>
      <h2>Upload Course PDF</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button onClick={upload} disabled={!file}>
        Upload & Generate Lessons
      </button>

      <p>{status}</p>
    </div>
  );
};

export default UploadPDF;

