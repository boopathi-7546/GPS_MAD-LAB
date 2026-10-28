import React, { useState } from 'react';
import { ShieldCheck, Check } from 'lucide-react';

interface PermissionModalProps {
  isOpen: boolean;
  onGrant: (isPrecise: boolean) => void;
  onDeny: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onGrant,
  onDeny
}) => {
  const [precise, setPrecise] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-slate-100 animate-in slide-in-from-bottom-6 duration-250">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">Location Permission</h3>
            <p className="text-[11px] text-slate-400">android.permission.ACCESS_FINE_LOCATION</p>
          </div>
        </div>

        <p className="text-slate-200 text-sm mb-4 leading-relaxed font-medium">
          Allow <strong className="text-emerald-400">GPS Location App</strong> to access this device&apos;s location?
        </p>

        {/* Android 12+ Precise vs Approximate Toggle */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            type="button"
            onClick={() => setPrecise(true)}
            className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
              precise
                ? 'bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-semibold">Precise</span>
              {precise && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            <span className="text-[10px] text-slate-400 leading-tight">High accuracy GPS</span>
          </button>

          <button
            type="button"
            onClick={() => setPrecise(false)}
            className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
              !precise
                ? 'bg-cyan-500/15 border-cyan-500/60 ring-1 ring-cyan-500/40 text-cyan-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-semibold">Approximate</span>
              {!precise && <Check className="w-3.5 h-3.5 text-cyan-400" />}
            </div>
            <span className="text-[10px] text-slate-400 leading-tight">Network / Coarse</span>
          </button>
        </div>

        {/* Standard Android options */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onGrant(precise)}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide transition-colors shadow-md"
          >
            WHILE USING THE APP
          </button>
          <button
            type="button"
            onClick={() => onGrant(precise)}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs tracking-wide transition-colors border border-slate-700"
          >
            ONLY THIS TIME
          </button>
          <button
            type="button"
            onClick={onDeny}
            className="w-full py-2.5 px-4 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium text-xs tracking-wide transition-colors"
          >
            DON&apos;T ALLOW
          </button>
        </div>
      </div>
    </div>
  );
};
