import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  Copy,
  Check,
  ExternalLink,
  Wifi,
  Radio,
  BatteryCharging,
  Layers,
  Sparkles,
  Info,
  Navigation,
  Globe,
  Loader2
} from 'lucide-react';
import { LocationData, PresetLocation } from '../types/location';
import { PRESET_LOCATIONS, formatDMS, calculateDistanceKm } from '../data/presets';
import { MapView } from './MapView';
import { PermissionModal } from './PermissionModal';

interface AndroidPhoneProps {
  currentLocation: LocationData;
  isLoading: boolean;
  onGetLocation: () => void;
  onSelectPreset: (preset: PresetLocation) => void;
  permissionStatus: 'granted' | 'denied' | 'prompt';
  onRequestPermission: () => void;
  onGrantPermission: (isPrecise: boolean) => void;
  onDenyPermission: () => void;
  onRefreshRealGps: () => void;
}

export const AndroidPhone: React.FC<AndroidPhoneProps> = ({
  currentLocation,
  isLoading,
  onGetLocation,
  onSelectPreset,
  permissionStatus,
  onRequestPermission,
  onGrantPermission,
  onDenyPermission,
  onRefreshRealGps
}) => {
  const [copied, setCopied] = useState(false);
  const [useDMS, setUseDMS] = useState(false);
  const [activeTab, setActiveTab] = useState<'ui' | 'map'>('ui');

  const vsbLocation = PRESET_LOCATIONS.find((p) => p.id === 'vsb-karur');
  const distanceFromVsb = vsbLocation
    ? calculateDistanceKm(
        currentLocation.latitude,
        currentLocation.longitude,
        vsbLocation.latitude,
        vsbLocation.longitude
      )
    : 0;

  const handleCopy = () => {
    const text = `${currentLocation.cityName}: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)} (${currentLocation.fullAddress})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${currentLocation.latitude},${currentLocation.longitude}`;

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="relative mx-auto w-[360px] sm:w-[390px] h-[760px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-800 flex flex-col justify-between select-none">
      {/* Phone Outer Details */}
      <div className="absolute -left-[7px] top-28 w-[4px] h-12 bg-slate-600 rounded-l-md" />
      <div className="absolute -left-[7px] top-44 w-[4px] h-12 bg-slate-600 rounded-l-md" />
      <div className="absolute -right-[7px] top-32 w-[4px] h-16 bg-slate-600 rounded-r-md" />

      {/* Screen Container */}
      <div className="relative w-full h-full bg-[#0b1329] rounded-[40px] overflow-hidden flex flex-col border border-slate-800">
        {/* Permission Dialog Modal Simulation */}
        <PermissionModal
          isOpen={permissionStatus === 'prompt'}
          onGrant={onGrantPermission}
          onDeny={onDenyPermission}
        />

        {/* Android Status Bar */}
        <div className="h-9 px-6 flex items-center justify-between text-[11px] font-semibold text-slate-300 bg-slate-950/80 z-20 backdrop-blur-xs">
          <span>{currentTime}</span>

          {/* Camera Punch Hole */}
          <div className="w-4 h-4 rounded-full bg-black border border-slate-800 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Radio className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px]">5G</span>
            <Wifi className="w-3 h-3" />
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Android TopAppBar */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-10 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-tight">GPS Location App</h2>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {currentLocation.provider.toUpperCase()} PROVIDER
              </p>
            </div>
          </div>

          {/* Tab switcher: UI vs Map */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[10px]">
            <button
              onClick={() => setActiveTab('ui')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'ui' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Info
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'map' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Map
            </button>
          </div>
        </div>

        {/* Screen Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-700">
          {activeTab === 'map' ? (
            <div className="h-[430px] flex flex-col gap-2">
              <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800">
                <MapView
                  latitude={currentLocation.latitude}
                  longitude={currentLocation.longitude}
                  accuracy={currentLocation.accuracy}
                  title={currentLocation.fullAddress}
                  cityName={currentLocation.cityName}
                  subLocality={currentLocation.subLocality}
                />
              </div>
              <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold text-slate-100">{currentLocation.cityName}</span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    ±{currentLocation.accuracy}m
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{currentLocation.fullAddress}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Main Card: City Name, Latitude, Longitude */}
              <div className="relative bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                      ANDROID GEOCODER RESULT
                    </span>
                  </div>
                  {currentLocation.isRealDeviceGps && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-semibold">
                      REAL GPS
                    </span>
                  )}
                </div>

                {/* City Name Header (Primary user request) */}
                <div className="mt-1">
                  <div className="text-[11px] text-slate-400 font-medium">City Name</div>
                  <div className="text-2xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
                    <span>{currentLocation.cityName}</span>
                    {currentLocation.subLocality && (
                      <span className="text-xs font-semibold text-cyan-400">
                        ({currentLocation.subLocality})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {currentLocation.district}, {currentLocation.state} {currentLocation.postalCode ? `- ${currentLocation.postalCode}` : ''}
                  </div>
                </div>

                <div className="my-3 h-[1px] bg-slate-800" />

                {/* Latitude & Longitude (Primary user request) */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-semibold text-slate-400 mb-0.5">LATITUDE</div>
                    <div className="text-sm font-mono font-bold text-emerald-400 truncate">
                      {useDMS
                        ? formatDMS(currentLocation.latitude, true)
                        : `${currentLocation.latitude.toFixed(6)}°`}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-semibold text-slate-400 mb-0.5">LONGITUDE</div>
                    <div className="text-sm font-mono font-bold text-emerald-400 truncate">
                      {useDMS
                        ? formatDMS(currentLocation.longitude, false)
                        : `${currentLocation.longitude.toFixed(6)}°`}
                    </div>
                  </div>
                </div>

                {/* Full Geocoded Address */}
                <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 mb-3 text-[11px]">
                  <div className="text-[10px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                    <span>REVERSE GEOCODED ADDRESS</span>
                    <button
                      onClick={() => setUseDMS(!useDMS)}
                      className="text-[9px] text-cyan-400 hover:underline"
                    >
                      {useDMS ? 'Format: Decimal' : 'Format: DMS'}
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-normal">
                    {currentLocation.fullAddress}
                  </p>
                </div>

                {/* Telemetry metadata tags */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                  <span>Accuracy: <strong className="text-slate-200">±{currentLocation.accuracy}m</strong></span>
                  <span>Altitude: <strong className="text-slate-200">{currentLocation.altitude ? `${currentLocation.altitude}m` : '138m'}</strong></span>
                  <span>Country: <strong className="text-slate-200">{currentLocation.country}</strong></span>
                </div>
              </div>

              {/* VSB Karur Distance Indicator */}
              {distanceFromVsb > 0.05 ? (
                <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-slate-300 text-[11px]">Distance to <strong className="text-emerald-300">VSB Karur</strong>:</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-xs">
                    {distanceFromVsb} km away
                  </span>
                </div>
              ) : (
                <div className="bg-emerald-950/50 border border-emerald-600/50 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-300">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-medium">You are currently at <strong>VSB Karur (Karudayampalayam)</strong> campus!</span>
                </div>
              )}

              {/* Mini Map Preview */}
              <div className="h-32 rounded-xl overflow-hidden border border-slate-800">
                <MapView
                  latitude={currentLocation.latitude}
                  longitude={currentLocation.longitude}
                  accuracy={currentLocation.accuracy}
                  title={currentLocation.fullAddress}
                  cityName={currentLocation.cityName}
                  subLocality={currentLocation.subLocality}
                />
              </div>

              {/* Action Buttons: Copy & Google Maps */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Details</span>
                    </>
                  )}
                </button>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Google Maps</span>
                </a>
              </div>
            </>
          )}

          {/* Main "Get Location" Button (Requested by user) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={onGetLocation}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Fetching GPS &amp; Geocoding...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>Get Location</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Selector for Karur, Erode, Namakkal, Dindigul, and VSB Karur */}
          <div className="space-y-2 pt-1 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Target Presets (Tamil Nadu)
              </span>
              <button
                type="button"
                onClick={onRefreshRealGps}
                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Radio className="w-3 h-3" />
                Live GPS
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {PRESET_LOCATIONS.map((preset) => {
                const isSelected =
                  Math.abs(currentLocation.latitude - preset.latitude) < 0.0001 &&
                  Math.abs(currentLocation.longitude - preset.longitude) < 0.0001;

                const isVsb = preset.id === 'vsb-karur';

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectPreset(preset)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? isVsb
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50'
                          : 'bg-cyan-500/20 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/50'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-100 truncate">
                          {preset.title}
                        </span>
                        {isVsb && (
                          <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded font-semibold shrink-0">
                            YOU ARE HERE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {preset.subtitle} • {preset.latitude.toFixed(4)}°, {preset.longitude.toFixed(4)}°
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-[10px] font-mono text-slate-400">
                        {preset.cityName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Android Navigation Bar Pill */}
        <div className="h-5 bg-slate-950 flex items-center justify-center">
          <div className="w-28 h-1 rounded-full bg-slate-600" />
        </div>
      </div>
    </div>
  );
};
