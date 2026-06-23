import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Jobs.css";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("jobs") || "[]");
    setJobs(stored);
  }, []);

  return (
    <div className="jobs-page">

      <div className="panel jobs-header">
        <div>
          <h1>Jobs</h1>
          <p className="muted">All active, pending, and completed workshop jobs.</p>
        </div>

        <Link className="btn" to="/jobs/new">
          + New Job
        </Link>
      </div>

      <div className="jobs-grid">
        {jobs.length === 0 && (
          <p className="muted">No jobs found. Create your first job to get started.</p>
        )}

        {jobs.map((job: any) => (
          <Link to={`/jobs/${job.id}`} key={job.id} className="job-card panel">
            <div className="job-card-header">
              <h3>Job #{job.id}</h3>
              <span
                className={`status-pill ${
                  job.status === "Completed"
                    ? "status-paid"
                    : job.status === "Awaiting Parts"
                    ? "status-part"
                    : "status-unpaid"
                }`}
              >
                {job.status}
              </span>
            </div>

            <p className="job-title">
              {job.clockMake} {job.clockModel}
            </p>

            <p className="muted">
              <strong>Customer:</strong> {job.customerName}
            </p>

            {job.conditionPhotos?.[0] && (
              <img
                src={job.conditionPhotos[0]}
                alt="Preview"
                className="job-thumb"
              />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
