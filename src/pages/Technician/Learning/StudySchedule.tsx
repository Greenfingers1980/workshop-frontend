import React from "react";

const StudySchedule: React.FC = () => {
  // Later: fetch personalised 3–5 hour weekly plan
  const exampleSchedule = [
    "Lesson: Train Theory Basics",
    "Quiz: Train Ratios",
    "Revision: Escapement Principles"
  ];

  return (
    <div>
      <h2>Study Schedule</h2>
      <p>Your weekly 3–5 hour learning plan.</p>

      <ul>
        {exampleSchedule.map((task, i) => (
          <li key={i}>{task}</li>
        ))}
      </ul>
    </div>
  );
};

export default StudySchedule;
