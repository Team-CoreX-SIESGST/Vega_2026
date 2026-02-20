import { Filter, Database } from "lucide-react";

const RangeSelector = ({
  dataRange,
  setDataRange,
  rangeOptions,
  totalRecords,
  getCurrentRangeDisplay,
  activeSection = "overview",
}) => {
  if (!rangeOptions || !dataRange || activeSection === "ask_ai") return null;

  const rangeDisplay = getCurrentRangeDisplay ? getCurrentRangeDisplay() : null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border">
        <Database className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-foreground font-medium">Data Range:</span>
      </div>

      <select
        value={`${dataRange.start} - ${dataRange.end}`}
        onChange={(e) => {
          const selected = rangeOptions.find(
            (opt) => opt.label === e.target.value
          );
          if (selected) setDataRange(selected.value.start, selected.value.end);
        }}
        className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-w-[180px]"
      >
        {rangeOptions.map((option) => (
          <option key={option.label} value={option.label}>
            {option.label} {option.label === "0 - 500" ? "(Default)" : ""}
          </option>
        ))}
      </select>

      {rangeDisplay && (
        <div className="text-xs text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg">
          <Filter className="w-3 h-3 inline mr-1" />
          Showing {rangeDisplay.current} of {rangeDisplay.total}{" "}
          {rangeDisplay.label}
        </div>
      )}
    </div>
  );
};

export default RangeSelector;
