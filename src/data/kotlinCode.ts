import { CodeFile } from '../types/location';

export const ANDROID_FILES: CodeFile[] = [
  {
    name: 'MainActivity.kt',
    path: 'app/src/main/java/com/example/gpslocation/MainActivity.kt',
    language: 'kotlin',
    description: 'Modern Jetpack Compose implementation with FusedLocationProviderClient, Geocoder (API 33+ listener & legacy support), and runtime permission launcher.',
    code: `package com.example.gpslocation

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Address
import android.location.Geocoder
import android.location.Location
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import java.util.Locale

class MainActivity : ComponentActivity() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    primary = Color(0xFF10B981),
                    secondary = Color(0xFF06B6D4),
                    background = Color(0xFF0B1329),
                    surface = Color(0xFF1E293B)
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    GpsLocationScreen(fusedLocationClient = fusedLocationClient)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GpsLocationScreen(fusedLocationClient: FusedLocationProviderClient) {
    val context = LocalContext.current
    var cityName by remember { mutableStateOf("Not Fetched") }
    var latitude by remember { mutableStateOf<Double?>(null) }
    var longitude by remember { mutableStateOf<Double?>(null) }
    var fullAddress by remember { mutableStateOf("Tap 'Get Location' below to read GPS.") }
    var postalCode by remember { mutableStateOf("") }
    var stateName by remember { mutableStateOf("") }
    var accuracyMeters by remember { mutableStateOf<Float?>(null) }
    var isLoading by remember { mutableStateOf(false) }

    // Android Location Runtime Permission Launcher
    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val coarseGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false

        if (fineGranted || coarseGranted) {
            Toast.makeText(context, "Location permission granted!", Toast.LENGTH_SHORT).show()
            fetchCurrentGpsLocation(
                context = context,
                fusedLocationClient = fusedLocationClient,
                onLoading = { isLoading = it },
                onLocationResult = { lat, lon, city, addr, post, state, acc ->
                    latitude = lat
                    longitude = lon
                    cityName = city
                    fullAddress = addr
                    postalCode = post
                    stateName = state
                    accuracyMeters = acc
                }
            )
        } else {
            Toast.makeText(context, "Permission denied. GPS cannot be accessed.", Toast.LENGTH_LONG).show()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("GPS Location & Geocoder", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF0F172A),
                    titleContentColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Main Display Card (City Name, Latitude, Longitude)
            ElevatedCard(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.elevatedCardColors(containerColor = Color(0xFF1E293B))
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = Color(0xFF10B981),
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "CURRENT LOCATION",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF94A3B8)
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // City Name (Requested by user)
                    Text(
                        text = cityName,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )

                    if (stateName.isNotEmpty()) {
                        Text(
                            text = if (postalCode.isNotEmpty()) "$stateName - $postalCode" else stateName,
                            fontSize = 14.sp,
                            color = Color(0xFF38BDF8)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    HorizontalDivider(color = Color(0xFF334155))
                    Spacer(modifier = Modifier.height(16.dp))

                    // Latitude & Longitude Rows
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("LATITUDE", fontSize = 11.sp, color = Color(0xFF94A3B8))
                            Text(
                                text = latitude?.let { String.format(Locale.US, "%.6f°", it) } ?: "--",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF10B981)
                            )
                        }
                        Column {
                            Text("LONGITUDE", fontSize = 11.sp, color = Color(0xFF94A3B8))
                            Text(
                                text = longitude?.let { String.format(Locale.US, "%.6f°", it) } ?: "--",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF10B981)
                            )
                        }
                        if (accuracyMeters != null) {
                            Column {
                                Text("ACCURACY", fontSize = 11.sp, color = Color(0xFF94A3B8))
                                Text(
                                    text = "±\${accuracyMeters?.toInt()} m",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFFBBF24)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Full Address from Geocoder
                    Text("REVERSE GEOCODED ADDRESS", fontSize = 11.sp, color = Color(0xFF94A3B8))
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = fullAddress,
                        fontSize = 13.sp,
                        color = Color(0xFFCBD5E1),
                        lineHeight = 18.sp
                    )
                }
            }

            // "Get Location" Button (Requested by user)
            Button(
                onClick = {
                    val fineCheck = ContextCompat.checkSelfPermission(
                        context,
                        Manifest.permission.ACCESS_FINE_LOCATION
                    )
                    val coarseCheck = ContextCompat.checkSelfPermission(
                        context,
                        Manifest.permission.ACCESS_COARSE_LOCATION
                    )

                    if (fineCheck == PackageManager.PERMISSION_GRANTED ||
                        coarseCheck == PackageManager.PERMISSION_GRANTED
                    ) {
                        fetchCurrentGpsLocation(
                            context = context,
                            fusedLocationClient = fusedLocationClient,
                            onLoading = { isLoading = it },
                            onLocationResult = { lat, lon, city, addr, post, state, acc ->
                                latitude = lat
                                longitude = lon
                                cityName = city
                                fullAddress = addr
                                postalCode = post
                                stateName = state
                                accuracyMeters = acc
                            }
                        )
                    } else {
                        // Request Permission
                        locationPermissionLauncher.launch(
                            arrayOf(
                                Manifest.permission.ACCESS_FINE_LOCATION,
                                Manifest.permission.ACCESS_COARSE_LOCATION
                            )
                        )
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                enabled = !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Fetching GPS & Geocoding...", fontSize = 16.sp, color = Color.White)
                } else {
                    Icon(imageVector = Icons.Default.MyLocation, contentDescription = null, tint = Color.Black)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Get Location",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                }
            }

            // Quick Preset Locations (VSB Karur, Erode, Namakkal, Dindigul)
            Text(
                text = "Region Quick Test Presets",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF94A3B8),
                modifier = Modifier.align(Alignment.Start)
            )

            val presets = listOf(
                PresetSpot("VSB Karur (Karudayampalayam)", 10.97682, 78.00523, "Karur", "VSB Engineering College, NH 67, Karudayampalayam, Karur 639111"),
                PresetSpot("Karur City", 10.9601, 78.0766, "Karur", "Bus Stand / Collectorate, Karur 639001"),
                PresetSpot("Erode City", 11.3410, 77.7172, "Erode", "Brough Road / Junction, Erode 638001"),
                PresetSpot("Namakkal City", 11.2189, 78.1674, "Namakkal", "Anjaneyar Temple / Fort, Namakkal 637001"),
                PresetSpot("Dindigul City", 10.3673, 77.9803, "Dindigul", "Rock Fort / Clock Tower, Dindigul 624001")
            )

            presets.forEach { preset ->
                OutlinedButton(
                    onClick = {
                        latitude = preset.lat
                        longitude = preset.lon
                        cityName = preset.city
                        fullAddress = preset.address
                        stateName = "Tamil Nadu"
                        postalCode = preset.address.takeLast(6)
                        accuracyMeters = 3.0f
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = if (preset.name.contains("VSB")) Color(0xFF0F3627) else Color(0xFF0F172A)
                    )
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                        horizontalAlignment = Alignment.Start
                    ) {
                        Text(preset.name, fontWeight = FontWeight.Bold, color = Color.White)
                        Text(
                            "Lat: \${preset.lat}, Lon: \${preset.lon}",
                            fontSize = 12.sp,
                            color = Color(0xFF94A3B8)
                        )
                    }
                }
            }
        }
    }
}

data class PresetSpot(
    val name: String,
    val lat: Double,
    val lon: Double,
    val city: String,
    val address: String
)

/**
 * Fetches high-accuracy GPS coordinates using FusedLocationProviderClient
 * and resolves city name & address using Android Geocoder.
 */
@SuppressLint("MissingPermission")
fun fetchCurrentGpsLocation(
    context: Context,
    fusedLocationClient: FusedLocationProviderClient,
    onLoading: (Boolean) -> Unit,
    onLocationResult: (
        lat: Double,
        lon: Double,
        cityName: String,
        fullAddress: String,
        postalCode: String,
        stateName: String,
        accuracy: Float
    ) -> Unit
) {
    onLoading(true)

    val cancellationToken = CancellationTokenSource()

    // Request high-accuracy fresh location
    fusedLocationClient.getCurrentLocation(
        Priority.PRIORITY_HIGH_ACCURACY,
        cancellationToken.token
    ).addOnSuccessListener { location: Location? ->
        if (location != null) {
            val lat = location.latitude
            val lon = location.longitude
            val acc = location.accuracy

            // Use Android Geocoder
            decodeLocationWithGeocoder(
                context = context,
                latitude = lat,
                longitude = lon
            ) { city, addr, post, state ->
                onLoading(false)
                onLocationResult(lat, lon, city, addr, post, state, acc)
            }
        } else {
            // Fallback to getLastLocation if GPS signal is weak
            fusedLocationClient.lastLocation.addOnSuccessListener { lastLoc ->
                onLoading(false)
                if (lastLoc != null) {
                    decodeLocationWithGeocoder(context, lastLoc.latitude, lastLoc.longitude) { city, addr, post, state ->
                        onLocationResult(lastLoc.latitude, lastLoc.longitude, city, addr, post, state, lastLoc.accuracy)
                    }
                } else {
                    Toast.makeText(context, "Turn on GPS in device Settings", Toast.LENGTH_SHORT).show()
                }
            }.addOnFailureListener {
                onLoading(false)
                Toast.makeText(context, "Failed to read GPS location: \${it.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }.addOnFailureListener {
        onLoading(false)
        Toast.makeText(context, "Location error: \${it.message}", Toast.LENGTH_SHORT).show()
    }
}

/**
 * Android Geocoder implementation supporting Android 13+ (API 33) GeocodeListener
 * with backward-compatible fallback for Android 12 and below.
 */
@Suppress("DEPRECATION")
fun decodeLocationWithGeocoder(
    context: Context,
    latitude: Double,
    longitude: Double,
    onResult: (city: String, address: String, postalCode: String, state: String) -> Unit
) {
    if (!Geocoder.isPresent()) {
        onResult("Location Found", "Lat: $latitude, Lon: $longitude", "", "")
        return
    }

    val geocoder = Geocoder(context, Locale.getDefault())

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        // Modern Android 13+ asynchronous GeocodeListener API
        geocoder.getFromLocation(latitude, longitude, 1, object : Geocoder.GeocodeListener {
            override fun onGeocode(addresses: MutableList<Address>) {
                parseAddresses(addresses, latitude, longitude, onResult)
            }

            override fun onError(errorMessage: String?) {
                onResult("Unknown City", "Lat: $latitude, Lon: $longitude", "", "")
            }
        })
    } else {
        // Legacy synchronous Android Geocoder for Android 12 and older
        try {
            val addresses = geocoder.getFromLocation(latitude, longitude, 1)
            parseAddresses(addresses, latitude, longitude, onResult)
        } catch (e: Exception) {
            onResult("Unknown City", "Lat: $latitude, Lon: $longitude", "", "")
        }
    }
}

private fun parseAddresses(
    addresses: List<Address>?,
    lat: Double,
    lon: Double,
    onResult: (city: String, address: String, postalCode: String, state: String) -> Unit
) {
    if (!addresses.isNullOrEmpty()) {
        val address = addresses[0]
        val city = address.locality
            ?: address.subAdminArea
            ?: address.adminArea
            ?: "Unknown City"
        val fullAddr = address.getAddressLine(0)
            ?: "\${address.subLocality ?: ""}, $city, \${address.adminArea ?: ""}"
        val postal = address.postalCode ?: ""
        val state = address.adminArea ?: ""

        onResult(city, fullAddr, postal, state)
    } else {
        onResult("Unknown City", "Lat: $lat, Lon: $lon", "", "")
    }
}
`
  },
  {
    name: 'MainActivity_XML.kt',
    path: 'app/src/main/java/com/example/gpslocation/MainActivity_XML.kt',
    language: 'kotlin',
    description: 'Classic XML View / ViewBinding version for traditional Android development with AppCompatActivity.',
    code: `package com.example.gpslocation

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.location.Address
import android.location.Geocoder
import android.os.Build
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.example.gpslocation.databinding.ActivityMainBinding
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import java.util.Locale

class MainActivity_XML : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    // Permission request contract
    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val coarseGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false

        if (fineGranted || coarseGranted) {
            fetchLocation()
        } else {
            Toast.makeText(this, "Permission denied. Cannot retrieve GPS.", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        // Get Location button click
        binding.btnGetLocation.setOnClickListener {
            checkPermissionsAndFetch()
        }

        // Quick Preset for VSB Karur Karudayampalayam
        binding.btnVsbKarur.setOnClickListener {
            updateUI(
                cityName = "Karur",
                lat = 10.97682,
                lon = 78.00523,
                address = "VSB Engineering College, NH 67, Karudayampalayam, Karur - 639111"
            )
        }
    }

    private fun checkPermissionsAndFetch() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            fetchLocation()
        } else {
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    @SuppressLint("MissingPermission")
    private fun fetchLocation() {
        binding.progressBar.visibility = View.VISIBLE
        binding.btnGetLocation.isEnabled = false

        fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, null)
            .addOnSuccessListener { location ->
                binding.progressBar.visibility = View.GONE
                binding.btnGetLocation.isEnabled = true

                if (location != null) {
                    val lat = location.latitude
                    val lon = location.longitude
                    decodeAddress(lat, lon)
                } else {
                    Toast.makeText(this, "Unable to get fresh GPS fix. Ensure Location is ON.", Toast.LENGTH_SHORT).show()
                }
            }
            .addOnFailureListener { e ->
                binding.progressBar.visibility = View.GONE
                binding.btnGetLocation.isEnabled = true
                Toast.makeText(this, "Error: \${e.message}", Toast.LENGTH_SHORT).show()
            }
    }

    @Suppress("DEPRECATION")
    private fun decodeAddress(lat: Double, lon: Double) {
        val geocoder = Geocoder(this, Locale.getDefault())

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            geocoder.getFromLocation(lat, lon, 1, object : Geocoder.GeocodeListener {
                override fun onGeocode(addresses: MutableList<Address>) {
                    val addr = addresses.firstOrNull()
                    val city = addr?.locality ?: addr?.subAdminArea ?: "Unknown"
                    val full = addr?.getAddressLine(0) ?: "Lat: $lat, Lon: $lon"
                    runOnUiThread { updateUI(city, lat, lon, full) }
                }

                override fun onError(errorMessage: String?) {
                    runOnUiThread { updateUI("Unknown", lat, lon, "Lat: $lat, Lon: $lon") }
                }
            })
        } else {
            try {
                val addresses = geocoder.getFromLocation(lat, lon, 1)
                val addr = addresses?.firstOrNull()
                val city = addr?.locality ?: addr?.subAdminArea ?: "Unknown"
                val full = addr?.getAddressLine(0) ?: "Lat: $lat, Lon: $lon"
                updateUI(city, lat, lon, full)
            } catch (e: Exception) {
                updateUI("Unknown", lat, lon, "Lat: $lat, Lon: $lon")
            }
        }
    }

    private fun updateUI(cityName: String, lat: Double, lon: Double, address: String) {
        binding.tvCityName.text = cityName
        binding.tvLatitude.text = String.format(Locale.US, "%.6f", lat)
        binding.tvLongitude.text = String.format(Locale.US, "%.6f", lon)
        binding.tvFullAddress.text = address
    }
}
`
  },
  {
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Manifest declaring ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION, and INTERNET permissions required for GPS and Geocoder.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.gpslocation">

    <!-- Permissions required for GPS and Network location -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- Permission required for Geocoder reverse address lookups -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="GPS Location App"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Material3.DayNight.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>
`
  },
  {
    name: 'build.gradle.kts',
    path: 'app/build.gradle.kts',
    language: 'kotlin',
    description: 'Gradle configuration including Google Play Services Location, Jetpack Compose, and AndroidX libraries.',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.example.gpslocation"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.gpslocation"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        viewBinding = true
    }
}

dependencies {
    // Google Play Services Location (FusedLocationProviderClient)
    implementation("com.google.android.gms:play-services-location:21.3.0")

    // AndroidX & Kotlin Coroutines
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")

    // Jetpack Compose BOM & UI
    implementation(platform("androidx.compose:compose-bom:2024.12.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // Material 3 & AppCompat
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
}
`
  },
  {
    name: 'activity_main.xml',
    path: 'app/src/main/res/layout/activity_main.xml',
    language: 'xml',
    description: 'Standard Android layout file for traditional XML ViewBinding approach.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:padding="20dp"
    android:background="#0F172A">

    <!-- Card with City Name, Latitude, Longitude -->
    <com.google.android.material.card.MaterialCardView
        android:id="@+id/cardLocation"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        app:cardCornerRadius="16dp"
        app:cardElevation="6dp"
        app:cardBackgroundColor="#1E293B"
        app:strokeColor="#334155"
        app:strokeWidth="1dp"
        app:layout_constraintTop_toTopOf="parent">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:padding="20dp">

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="DETECTED CITY"
                android:textSize="12sp"
                android:textColor="#94A3B8"
                android:textStyle="bold" />

            <TextView
                android:id="@+id/tvCityName"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Not Fetched"
                android:textSize="28sp"
                android:textStyle="bold"
                android:textColor="#FFFFFF"
                android:layout_marginTop="4dp" />

            <View
                android:layout_width="match_parent"
                android:layout_height="1dp"
                android:background="#334155"
                android:layout_marginVertical="16dp" />

            <!-- Coordinates Row -->
            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="horizontal"
                android:weightSum="2">

                <LinearLayout
                    android:layout_width="0dp"
                    android:layout_height="wrap_content"
                    android:layout_weight="1"
                    android:orientation="vertical">

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="LATITUDE"
                        android:textSize="11sp"
                        android:textColor="#94A3B8" />

                    <TextView
                        android:id="@+id/tvLatitude"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="--"
                        android:textSize="18sp"
                        android:textStyle="bold"
                        android:textColor="#10B981" />
                </LinearLayout>

                <LinearLayout
                    android:layout_width="0dp"
                    android:layout_height="wrap_content"
                    android:layout_weight="1"
                    android:orientation="vertical">

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="LONGITUDE"
                        android:textSize="11sp"
                        android:textColor="#94A3B8" />

                    <TextView
                        android:id="@+id/tvLongitude"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="--"
                        android:textSize="18sp"
                        android:textStyle="bold"
                        android:textColor="#10B981" />
                </LinearLayout>
            </LinearLayout>

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="FULL ADDRESS"
                android:textSize="11sp"
                android:textColor="#94A3B8"
                android:layout_marginTop="16dp" />

            <TextView
                android:id="@+id/tvFullAddress"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Tap 'Get Location' below."
                android:textSize="13sp"
                android:textColor="#CBD5E1"
                android:layout_marginTop="4dp" />

        </LinearLayout>
    </com.google.android.material.card.MaterialCardView>

    <!-- Progress Bar -->
    <ProgressBar
        android:id="@+id/progressBar"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:visibility="gone"
        app:layout_constraintTop_toBottomOf="@id/cardLocation"
        app:layout_constraintBottom_toTopOf="@id/btnGetLocation"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <!-- Get Location Button -->
    <com.google.android.material.button.MaterialButton
        android:id="@+id/btnGetLocation"
        android:layout_width="match_parent"
        android:layout_height="56dp"
        android:text="Get Location"
        android:textAllCaps="false"
        android:textSize="16sp"
        android:textStyle="bold"
        app:cornerRadius="12dp"
        app:backgroundTint="#10B981"
        android:textColor="#000000"
        app:layout_constraintBottom_toTopOf="@id/btnVsbKarur"
        android:layout_marginBottom="12dp" />

    <!-- VSB Karur Quick Button -->
    <com.google.android.material.button.MaterialButton
        android:id="@+id/btnVsbKarur"
        style="@style/Widget.Material3.Button.OutlinedButton"
        android:layout_width="match_parent"
        android:layout_height="50dp"
        android:text="📍 VSB Karur (Karudayampalayam)"
        android:textAllCaps="false"
        app:cornerRadius="12dp"
        android:textColor="#FFFFFF"
        app:strokeColor="#10B981"
        app:layout_constraintBottom_toBottomOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
`
  }
];
