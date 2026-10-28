import React from 'react';
import { MapPin, Navigation2, CheckCircle2, ArrowUpRight, Compass, ShieldCheck } from 'lucide-react';
import { PresetLocation, LocationData } from '../types/location';
import { PRESET_LOCATIONS, calculateDistanceKm } from '../data/presets';

interface RegionalMatrixProps {
  currentLocation: LocationData;
  onSelectPreset: (preset: PresetLocation) => void;
}

export const RegionalMatrix: React.FC<RegionalMatrixProps> = ({
  currentLocation,
  onSelectPreset
}) => {
  const vsb = PRESET_LOCATIONS.find((p) => p.id === 'vsb-karur')!;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
      {/* VSB Karur Highlight Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/40 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                User Anchor Location Verified
              </span>
            </div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              VSB Engineering College, Karudayampalayam
            </h4>
            <p className="text-xs text-slate-300">
              NH 67, Karur - Coimbatore Highway, Karudayampalayam, Karur, Tamil Nadu 639111
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono">
              <div className="text-xs text-slate-400">Exact Coordinates</div>
              <div className="text-sm font-bold text-emerald-300">10.97682° N, 78.00523° E</div>
            </div>
            <button
              onClick={() => onSelectPreset(vsb)}
              className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
            >
              <Navigation2 className="w-3.5 h-3.5" />
              <span>Apply to GPS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Regional Districts Grid (Karur, Erode, Namakkal, Dindigul) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            Regional Districts Distance Matrix
          </h4>
          <span className="text-[11px] text-slate-400">
            Current: <strong className="text-slate-200">{currentLocation.cityName}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_LOCATIONS.filter((p) => p.id !== 'vsb-karur').map((spot) => {
            const distance = calculateDistanceKm(
              currentLocation.latitude,
              currentLocation.longitude,
              spot.latitude,
              spot.longitude
            );

            const isCurrent =
              Math.abs(currentLocation.latitude - spot.latitude) < 0.005 &&
              Math.abs(currentLocation.longitude - spot.longitude) < 0.005;

            return (
              <div
                key={spot.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{spot.cityName}</span>
                    {isCurrent ? (
                      <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                        {distance} km
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{spot.subtitle}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">
                    {spot.latitude.toFixed(4)}°, {spot.longitude.toFixed(4)}°
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{spot.postalCode}</span>
                  <button
                    onClick={() => onSelectPreset(spot)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-0.5"
                  >
                    <span>Test GPS</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
