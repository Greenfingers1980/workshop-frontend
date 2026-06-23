// ImportButton.tsx (React + TypeScript)
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ImportButton() {
  const navigate = useNavigate();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        body: form
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Import failed", res.status, text);
        // show user-friendly error UI here
        return;
      }

      const json = await res.json();
      // Use react-router navigation so Vercel serves index.html for client routes
      navigate(`/technician/job/${json.jobId}`);
    } catch (err) {
      console.error("Import error", err);
    }
  }

  return (
    <label className="btn">
      Import file
      <input
        type="file"
        accept=".csv,.json" // restrict to expected types
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </label>
  );
}
