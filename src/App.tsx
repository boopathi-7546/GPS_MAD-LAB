import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Smartphone,
  Code,
  MapPin,
  CheckCircle,
  Radio,
  Download,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Cpu
} from 'lucide-react';
import { LocationData, PresetLocation } from './types/location';
import { PRESET_LOCATIONS } from './data/presets';
import { AndroidPhone } from './components/AndroidPhone';
import { CodeStudio } from './components/CodeStudio';
import { RegionalMatrix } from './components/RegionalMatrix';

export default function App() {
  // Default anchor location set to VSB Engineering College, Karudayampalayam, Karur
  const vsbPreset = PRESET_LOCATIONS.find((p) => p.id === 'vsb-karur') || PRESET_LOCATIONS[0];

  const [currentLocation, setCurrentLocation] = useState<LocationData>({
    latitude: vsbPreset.latitude,
    longitude: vsbPreset.longitude,
    cityName: vsbPreset.cityName,
    subLocality: vsbPreset.subLocality,
    fullAddress: vsbPreset.fullAddress,
    district: vsbPreset.district,
    state: vsbPreset.state,
    country: vsbPreset.country,
    postalCode: vsbPreset.postalCode,
    accuracy: 3.5,
    altitude: 138,
    speed: 0,
    provider: 'gps',
    timestamp: Date.now(),
    isRealDeviceGps: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [hasPromptedPermission, setHasPromptedPermission] = useState(false);
  const [viewMode, setViewMode] = useState<'dual' | 'phone' | 'code'>('dual');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Perform reverse geocoding using Nominatim with fallback
  const reverseGeocode = async (lat: number, lon: number): Promise<{
    cityName: string;
    subLocality: string;
    fullAddress: string;
    district: string;
    state: string;
    country: string;
    postalCode: string;
  }> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};

        const cityName =
          address.city ||
          address.town ||
          address.village ||
          address.county ||
          address.state_district ||
          'Karur';

        const subLocality =
          address.suburb ||
          address.neighbourhood ||
          address.quarter ||
          address.residential ||
          address.road ||
          'Karudayampalayam';

        const district = address.state_district || address.county || 'Karur';
        const state = address.state || 'Tamil Nadu';
        const country = address.country || 'India';
        const postalCode = address.postcode || '639111';

        const fullAddress =
          data.display_name ||
          `${subLocality}, ${cityName}, ${district}, ${state} ${postalCode}`;

        return {
          cityName,
          subLocality,
          fullAddress,
          district,
          state,
          country,
          postalCode
        };
      }
    } catch {
      // Ignore network errors and fallback to smart regional lookup
    }

    // Algorithmic fallback based on proximity
    for (const preset of PRESET_LOCATIONS) {
      const diff = Math.hypot(preset.latitude - lat, preset.longitude - lon);
      if (diff < 0.1) {
        return {
          cityName: preset.cityName,
          subLocality: preset.subLocality,
          fullAddress: `${preset.fullAddress} (Near GPS fix)`,
          district: preset.district,
          state: preset.state,
          country: preset.country,
          postalCode: preset.postalCode
        };
      }
    }

    return {
      cityName: 'Karur Region',
      subLocality: 'Karudayampalayam',
      fullAddress: `Lat: ${lat.toFixed(5)}°, Lon: ${lon.toFixed(5)}°, Tamil Nadu, India`,
      district: 'Karur',
      state: 'Tamil Nadu',
      country: 'India',
      postalCode: '639111'
    };
  };

  // Real device GPS fetch
  const fetchRealGpsLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy, altitude, speed } = pos.coords;
        const geocode = await reverseGeocode(latitude, longitude);

        setCurrentLocation({
          latitude,
          longitude,
          cityName: geocode.cityName,
          subLocality: geocode.subLocality,
          fullAddress: geocode.fullAddress,
          district: geocode.district,
          state: geocode.state,
          country: geocode.country,
          postalCode: geocode.postalCode,
          accuracy: accuracy || 10,
          altitude: altitude ? Math.round(altitude) : 138,
          speed: speed ? Math.round(speed) : 0,
          provider: 'gps',
          timestamp: pos.timestamp,
          isRealDeviceGps: true
        });

        setIsLoading(false);
        setPermissionStatus('granted');
        showToast(`Real GPS locked: ${geocode.cityName} (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`);
      },
      (err) => {
        setIsLoading(false);
        console.warn('Geolocation error:', err);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionStatus('denied');
          showToast('GPS permission denied. Using VSB Karur location.');
        } else {
          showToast(`GPS reading timeout or unavailable (${err.message}). Using VSB Karur location.`);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Triggered when user clicks "Get Location" in Android app
  const handleGetLocationClick = () => {
    if (permissionStatus === 'denied') {
      // Re-prompt permission
      setPermissionStatus('prompt');
      return;
    }

    if (!hasPromptedPermission && permissionStatus !== 'granted') {
      setPermissionStatus('prompt');
      return;
    }

    // Try fetching real browser GPS
    fetchRealGpsLocation();
  };

  // Handling Android permission grant
  const handleGrantPermission = (isPrecise: boolean) => {
    setPermissionStatus('granted');
    setHasPromptedPermission(true);
    showToast(`Location Permission Granted (${isPrecise ? 'Precise' : 'Approximate'})`);
    fetchRealGpsLocation();
  };

  const handleDenyPermission = () => {
    setPermissionStatus('denied');
    setHasPromptedPermission(true);
    showToast('Permission denied. Tap "Get Location" to try again.');
  };

  // Switching preset locations
  const handleSelectPreset = (preset: PresetLocation) => {
    setCurrentLocation({
      latitude: preset.latitude,
      longitude: preset.longitude,
      cityName: preset.cityName,
      subLocality: preset.subLocality,
      fullAddress: preset.fullAddress,
      district: preset.district,
      state: preset.state,
      country: preset.country,
      postalCode: preset.postalCode,
      accuracy: 3.2,
      altitude: 138,
      speed: 0,
      provider: 'gps',
      timestamp: Date.now(),
      isRealDeviceGps: false
    });
    showToast(`GPS set to ${preset.title} (${preset.cityName})`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
              <Navigation className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                  Android GPS Location App
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                  Kotlin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Get Location • City Name, Lat, Lon • Android Geocoder • VSB Karur, Erode, Namakkal, Dindigul
              </p>
            </div>
          </div>

          {/* View Mode Toggle Controls */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setViewMode('dual')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === 'dual'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dual Studio</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('phone')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === 'phone'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('code')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === 'code'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Kotlin Code</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* Regional District Presets & VSB Anchor Banner */}
        <RegionalMatrix
          currentLocation={currentLocation}
          onSelectPreset={handleSelectPreset}
        />

        {/* Dual Layout: Phone Mockup on Left, Kotlin Code Studio on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Android Phone Simulator Column */}
          {(viewMode === 'dual' || viewMode === 'phone') && (
            <div className={`${viewMode === 'dual' ? 'lg:col-span-5' : 'lg:col-span-12 max-w-md mx-auto'}`}>
              <div className="sticky top-20">
                <AndroidPhone
                  currentLocation={currentLocation}
                  isLoading={isLoading}
                  onGetLocation={handleGetLocationClick}
                  onSelectPreset={handleSelectPreset}
                  permissionStatus={permissionStatus}
                  onRequestPermission={() => setPermissionStatus('prompt')}
                  onGrantPermission={handleGrantPermission}
                  onDenyPermission={handleDenyPermission}
                  onRefreshRealGps={fetchRealGpsLocation}
                />
              </div>
            </div>
          )}

          {/* Android Kotlin Source Code Studio Column */}
          {(viewMode === 'dual' || viewMode === 'code') && (
            <div className={`${viewMode === 'dual' ? 'lg:col-span-7' : 'lg:col-span-12'} h-[760px]`}>
              <CodeStudio />
            </div>
          )}
        </div>

        {/* Android Studio Step-by-Step Implementation Guide */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Android Studio 4-Step Quickstart Guide</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h5 className="font-bold text-white text-sm">Create New Project</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Open Android Studio, select <strong>Empty Activity</strong> (Jetpack Compose) or <strong>Empty Views Activity</strong>, with Kotlin as language.
              </p>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h5 className="font-bold text-white text-sm">Add Play Services</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                In <code>app/build.gradle.kts</code>, add <code>implementation(&quot;com.google.android.gms:play-services-location:21.3.0&quot;)</code> and click <strong>Sync Now</strong>.
              </p>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h5 className="font-bold text-white text-sm">Declare Permissions</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add <code>ACCESS_FINE_LOCATION</code>, <code>ACCESS_COARSE_LOCATION</code>, and <code>INTERNET</code> (for Geocoder) to <code>AndroidManifest.xml</code>.
              </p>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                4
              </div>
              <h5 className="font-bold text-white text-sm">Run on Phone or Emulator</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click <strong>Run (Shift+F10)</strong>. On your physical device, tap <strong>Get Location</strong> and allow permission. It displays your City Name, Latitude, and Longitude!
              </p>
            </div>
          </div>

          <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              <strong className="text-slate-200">Testing at VSB Karur Karudayampalayam in Android Emulator?</strong>
              <p className="text-[11px] text-slate-400 mt-0.5">
                In Android Emulator, open Extended Controls (three dots) &gt; Location &gt; set Latitude <code>10.97682</code> and Longitude <code>78.00523</code>.
              </p>
            </div>
            <span className="text-emerald-400 font-mono font-semibold shrink-0">
              10.97682, 78.00523
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500">
        <span>Android GPS Location &amp; Geocoder Studio • Karur, Erode, Namakkal, Dindigul &amp; VSB Karudayampalayam</span>
      </footer>
    </div>
  );
}
