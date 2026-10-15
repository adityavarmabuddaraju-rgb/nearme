import React from 'react';

const RadiusSelector = ({ radius = 5000, onChange }) => {
  const currentKm = Math.min(Math.max(Math.round(radius / 1000) || 5, 1), 10);

  const handleSelectChange = (e) => {
    const km = parseInt(e.target.value, 10);
    if (onChange && !isNaN(km)) {
      onChange(km * 1000);
    }
  };

  return (
    <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
      <span className="text-xs font-bold text-slate-500">Distance:</span>
      <select
        value={currentKm}
        onChange={handleSelectChange}
        className="text-xs font-bold text-slate-800 bg-transparent cursor-pointer focus:outline-none"
        aria-label="Distance in km"
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((km) => (
          <option key={km} value={km}>
            {km} km
          </option>
        ))}
      </select>
    </div>
  );
};

export default RadiusSelector;
