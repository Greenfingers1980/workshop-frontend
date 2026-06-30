import React from "react";

export function TechnicianWallpaper() {
  return (
    <div className="fixed inset-0 -z-10 bg-slate-950 overflow-hidden pointer-events-none">
      {/* Blueprint Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ 
             backgroundImage: 'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
             backgroundSize: '40px 40px' 
           }} 
      />
      
      {/* Decorative Radial Gradient Glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-sky-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-violet-900/20 rounded-full blur-[100px]" />
      
      {/* Minimalist Tech Branding */}
      <div className="absolute bottom-8 right-8 text-slate-800 font-mono text-[10px] tracking-widest uppercase">
        Clockmaker Ledger // Technician Module v1.0.0
      </div>
    </div>
  );
}