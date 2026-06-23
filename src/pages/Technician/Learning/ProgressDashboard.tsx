import React from "react";

const ProgressDashboard: React.FC = () => {
  // Later: fetch real progress data
  const progress = {
    lessonsCompleted: 12,
    quizzesPassed: 8,
    weakTopics: ["Escapements", "Lubrication"]
  };

  return (
    <div>
      <h2>My Progress</h2>

      <p><strong>Lessons Completed:</strong> {progress.lessonsCompleted}</p>
      <p><strong>Quizzes Passed:</strong> {progress.quizzesPassed}</p>

      <h3>Weak Topics</h3>
      <ul>
        {progress.weakTopics.map((topic, i) => (
          <li key={i}>{topic}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProgressDashboard;
