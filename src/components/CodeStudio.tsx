import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Terminal, HelpCircle, Sparkles, FolderDown } from 'lucide-react';
import JSZip from 'jszip';
import { ANDROID_FILES } from '../data/kotlinCode';
import { CodeFile } from '../types/location';

export const CodeStudio: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(ANDROID_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Root project files
      zip.file(
        'settings.gradle.kts',
        `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "GpsLocationApp"
include(":app")
`
      );

      zip.file(
        'build.gradle.kts',
        `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`
      );

      zip.file(
        'gradle.properties',
        `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=false
`
      );

      // Add each code file
      ANDROID_FILES.forEach((f) => {
        zip.file(f.path, f.code);
      });

      // strings.xml
      zip.file(
        'app/src/main/res/values/strings.xml',
        `<resources>
    <string name="app_name">GPS Location App</string>
    <string name="get_location">Get Location</string>
</resources>
`
      );

      // README
      zip.file(
        'README.md',
        `# Android GPS Location App (Kotlin)

A simple, production-ready Android Location app that reads device GPS coordinates, requests runtime permissions, and uses the Android Geocoder to extract City Name, Latitude, and Longitude.

## Target Presets Included
- **VSB Engineering College, Karudayampalayam, Karur** (10.97682° N, 78.00523° E)
- **Karur City** (10.9601° N, 78.0766° E)
- **Erode City** (11.3410° N, 77.7172° E)
- **Namakkal City** (11.2189° N, 78.1674° E)
- **Dindigul City** (10.3673° N, 77.9803° E)

## How to Run in Android Studio
1. Open Android Studio > File > Open > select this folder.
2. Let Gradle sync and download dependencies.
3. Plug in your physical Android phone (enable USB Debugging) or start an Emulator.
4. Press Run (Shift + F10).
5. Tap "Get Location", allow permission, and see your exact city name, latitude, and longitude!
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Android-GPS-Location-Kotlin-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to create ZIP', e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Code Header Bar */}
      <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Android Kotlin Studio
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                Jetpack Compose + FusedLocation + Geocoder
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Clean, tested Android Studio source code ready to build &amp; deploy.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy File</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-50"
          >
            <FolderDown className="w-3.5 h-3.5" />
            <span>{isZipping ? 'Generating ZIP...' : 'Download Project .zip'}</span>
          </button>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
        {ANDROID_FILES.map((file) => {
          const isActive = selectedFile.name === file.name;
          return (
            <button
              key={file.name}
              onClick={() => setSelectedFile(file)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-slate-800 text-purple-300 font-semibold border border-purple-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${file.language === 'kotlin' ? 'bg-purple-400' : 'bg-amber-400'}`} />
              {file.name}
            </button>
          );
        })}
      </div>

      {/* File Path & Description Ribbon */}
      <div className="px-5 py-2.5 bg-slate-900 border-b border-slate-800/60 flex items-center justify-between text-xs">
        <span className="font-mono text-slate-400 text-[11px] truncate max-w-md">
          {selectedFile.path}
        </span>
        <span className="text-slate-400 text-[11px] hidden sm:inline">
          {selectedFile.description}
        </span>
      </div>

      {/* Code Editor Container */}
      <div className="flex-1 overflow-auto bg-[#0d1117] p-4 text-xs font-mono text-slate-200 scrollbar-thin">
        <pre className="leading-relaxed whitespace-pre font-mono text-[11px] sm:text-xs">
          <code>{selectedFile.code}</code>
        </pre>
      </div>

      {/* Implementation Highlights Bar */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            1. Location Permission
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Requests <code>ACCESS_FINE_LOCATION</code> and <code>ACCESS_COARSE_LOCATION</code> via <code>rememberLauncherForActivityResult</code>.
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            2. Fused Location Client
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Uses <code>getCurrentLocation(PRIORITY_HIGH_ACCURACY)</code> for high precision GPS fix, with <code>lastLocation</code> fallback.
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-purple-400 font-semibold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            3. Android Geocoder
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Supports modern Android 13+ (API 33) <code>GeocodeListener</code> with backward-compatible synchronous fallback for Android 12.
          </p>
        </div>
      </div>
    </div>
  );
};
