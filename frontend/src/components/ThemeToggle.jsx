import React, { useEffect, useState } from 'react';

export default function ThemeToggle(){
  const [dark, setDark] = useState(false);

  useEffect(()=>{
    const stored = localStorage.getItem('theme');
    const isDark = stored ? stored === 'dark' : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(isDark);
  }, []);

  useEffect(()=>{
    const root = document.documentElement;
    if (dark) { root.classList.add('dark'); localStorage.setItem('theme','dark'); }
    else { root.classList.remove('dark'); localStorage.setItem('theme','light'); }
  }, [dark]);

  return (
    <button aria-label="Basculer thème" onClick={()=>setDark(d=>!d)} className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98]">
      {dark ? '☾' : '☀︎'}
    </button>
  );
}


