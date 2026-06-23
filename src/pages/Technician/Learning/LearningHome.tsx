import React from "react";
import { Link } from "react-router-dom";

const LearningHome: React.FC = () => {
  return (
    <div>
      <h2>Learning Centre</h2>
      <p>Welcome to your horology learning area.</p>

      <ul>
        <li><Link to="/technician/learning/courses">View Courses</Link></li>
        <li><Link to="/technician/learning/schedule">Study Schedule</Link></li>
        <li><Link to="/technician/learning/progress">My Progress</Link></li>
      </ul>
    </div>
  );
};

export default LearningHome;
