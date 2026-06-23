import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useJobs } from "../../hooks/useJobs";
import "./Technician.css";

const TechnicianJobView: React.FC = () => {
  const { id } = useParams();
  const { jobs, updateJob } = useJobs();

  const job = useMemo(() => {
    return jobs.find((j) => j.id === Number(id));
  }, [jobs, id]);

  if (!job) {
    return (
      <div className="tech-layout">
        <header className="tech-header">
          <h2>Job Not Found</h2>
        </header>
        <div className="tech-main">
          <p>Job #{id} does not exist.</p>
          <Link to="/technician">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const updateNotes = (text: string) => {
    updateJob(job.id, { technicianNotes: text });
  };

  return (
    <div className="tech-layout">
      <header className="tech-header">
        <h2>Job #{job.id}</h2>
      </header>

      <div className="tech-main">
        <section className="tech-column tech-column--full">
          <div className="tech-panel">
            <h3>Customer</h3>
            <p><strong>{job.customerName}</strong></p>
            {job.description && <p>{job.description}</p>}
          </div>

          <div className="tech-panel">
            <h3>Technician Notes</h3>
            <textarea
              className="tech-notes"
              value={job.technicianNotes || ""}
              onChange={(e) => updateNotes(e.target.value)}
            />
          </div>

          <div className="tech-panel">
            <h3>Actions</h3>
            <Link to="/technician">Back to Dashboard</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TechnicianJobView;
