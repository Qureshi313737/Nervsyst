plugins {
    id("com.android.application")
}

val runNumber = (System.getenv("GITHUB_RUN_NUMBER") ?: "1").toInt()

android {
    namespace = "com.neuromap.atlas"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.neuromap.atlas"
        minSdk = 26
        targetSdk = 34
        versionCode = runNumber
        versionName = "1.0.$runNumber"
    }

    // Public sideload key kept in the repo so every build can update the
    // previous install. It is not a secret; use your own key for a store release.
    signingConfigs {
        create("sideload") {
            storeFile = file("neuromap.keystore")
            storePassword = "neuromap"
            keyAlias = "neuromap"
            keyPassword = "neuromap"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("sideload")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
}
