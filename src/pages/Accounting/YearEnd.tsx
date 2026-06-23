import { useAccounting } from "./AccountingContext";

export default function YearEnd() {
  const { closeYear, openYear } = useAccounting();

  const currentYear = new Date().getFullYear();

  const handleClose = () => {
    closeYear(currentYear);
    alert(`Year ${currentYear} closed`);
  };

  const handleOpen = () => {
    openYear(currentYear + 1);
    alert(`Year ${currentYear + 1} opened`);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Year End Routine</h1>

      <button className="ledger-button" onClick={handleClose}>
        Close Current Year ({currentYear})
      </button>

      <button className="ledger-button" onClick={handleOpen} style={{ marginLeft: "1rem" }}>
        Open New Year ({currentYear + 1})
      </button>
    </div>
  );
}
