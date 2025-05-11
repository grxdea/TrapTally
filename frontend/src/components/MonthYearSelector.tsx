// src/components/MonthYearSelector.tsx
import React from 'react';

// Define the structure for an active selection
interface ActiveSelection {
  year: number;
  month: number;
}

interface MonthYearSelectorProps {
  years: number[]; // Available years
  getMonths: (year: number) => number[]; // Function to get months for a year
  activeSelection: ActiveSelection | null; // The currently selected month/year
  onSelectionChange: (year: number, month: number) => void; // Changed callback signature
}

const MonthYearSelector: React.FC<MonthYearSelectorProps> = ({
  years,
  getMonths,
  activeSelection,
  onSelectionChange,
}) => {
  // Helper to format month number to name
  const formatMonth = (month: number): string => {
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                       "July", "August", "September", "October", "November", "December"];
    return monthNames[month - 1] || '';
  };

  return (
    <div className="mb-8">
      {/* Year selection */}
      <div className="year-selector mb-4">
        {years.map(year => (
          <button
            key={year}
            className={`year-button ${activeSelection?.year === year ? 'active' : ''}`}
            onClick={() => {
              const months = getMonths(year);
              if (months.length > 0) {
                onSelectionChange(year, months[0]);
              }
            }}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Month selection - only show if a year is selected */}
      {activeSelection && (
        <div className="year-selector">
          {getMonths(activeSelection.year).map(month => (
            <button
              key={month}
              className={`year-button ${activeSelection.month === month ? 'active' : ''}`}
              onClick={() => onSelectionChange(activeSelection.year, month)}
            >
              {formatMonth(month)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonthYearSelector;
