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
        alert("Import failed — see console for details.");
        return;
      }

      const json = await res.json();
      navigate(`/technician/job/${json.jobId}`);
    } catch (err) {
      console.error("Import error:", err);
      alert("Import error — see console for details.");
    }
  }

  return (
    <label
      style={{
        padding: "0.7rem 1.2rem",
        background: "#5a4632",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        display: "inline-block",
        fontSize: "1rem"
      }}
    >
      Import file
      <input
        type="file"
        accept=".json,.csv"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </label>
  );
}

