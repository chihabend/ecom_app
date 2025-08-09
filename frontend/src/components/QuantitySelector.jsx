import React from 'react';

export default function QuantitySelector({ value, min = 1, max = 99, onChange, small = false }) {
  const dec = () => onChange(Math.max(min, (value || min) - 1));
  const inc = () => onChange(Math.min(max, (value || min) + 1));
  return (
    <div className={`inline-flex items-center rounded-md border dark:border-gray-700 ${small ? 'h-8' : 'h-10'}`}>
      <button type="button" onClick={dec} className="px-2 h-full text-gray-700 hover:bg-gray-50 active:scale-[0.98] dark:text-gray-200 dark:hover:bg-gray-800">−</button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e)=>onChange(Number(e.target.value))}
        className={`w-12 text-center outline-none bg-transparent ${small ? 'text-sm' : 'text-base'} text-gray-900 dark:text-gray-100`}
      />
      <button type="button" onClick={inc} className="px-2 h-full text-gray-700 hover:bg-gray-50 active:scale-[0.98] dark:text-gray-200 dark:hover:bg-gray-800">+</button>
    </div>
  );
}


