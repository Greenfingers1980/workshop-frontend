import React from "react";
import { useParams } from "react-router-dom";

const TestView: React.FC = () => {
  const { testId } = useParams();

  return (
    <div>
      <h2>Section Test #{testId}</h2>
      <p>This is where the auto‑generated section test or mock exam will appear.</p>
    </div>
  );
};

export default TestView;
