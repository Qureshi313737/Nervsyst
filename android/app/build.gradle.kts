plugins {
    id("com.android.application")
}

val runNumber = (System.getenv("GITHUB_RUN_NUMBER") ?: "1").toInt()

android {
    namespace = "com.neuromap.atlas"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.lumifya.neuromap"
        minSdk = 26
        targetSdk = 36
        versionCode = runNumber
        versionName = "1.1.$runNumber"
    }

    // Release signing. In CI, a private Play upload key is used when the
    // NEUROMAP_KEYSTORE_* environment variables are set (from GitHub secrets).
    // Otherwise the public sideload key kept in the repo is used, so local and
    // fork builds still produce an installable APK. Never use the public key
    // as your Play upload key.
    val privateKs = System.getenv("NEUROMAP_KEYSTORE_FILE")?.let { file(it) }?.takeIf { it.exists() }
    signingConfigs {
        create("sideload") {
            if (privateKs != null) {
                storeFile = privateKs
                storePassword = System.getenv("NEUROMAP_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("NEUROMAP_KEY_ALIAS")
                keyPassword = System.getenv("NEUROMAP_KEY_PASSWORD")
            } else {
                storeFile = file("neuromap.keystore")
                storePassword = "neuromap"
                keyAlias = "neuromap"
                keyPassword = "neuromap"
            }
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
