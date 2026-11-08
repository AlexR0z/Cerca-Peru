import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// La web de Perú Vive vive en la carpeta superior (index.html, css, js, img).
// Se copia tal cual a los assets de la app al compilar: así hay una sola versión que mantener.
val carpetaWeb = rootProject.projectDir.parentFile

val copiarWeb by tasks.registering(Copy::class) {
    from(carpetaWeb) {
        include("index.html", "css/**", "js/**", "img/**")
    }
    into(layout.buildDirectory.dir("generated/web/www"))
}

android {
    namespace = "pe.peruvive.app"
    compileSdk = 36

    defaultConfig {
        applicationId = "pe.peruvive.app"
        minSdk = 26
        targetSdk = 36 // Google Play lo exige desde el 31 de agosto de 2026
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    // "www/" (la web copiada) más "offline/" (src/main/assets, librerías para uso sin conexión)
    sourceSets["main"].assets.srcDir(layout.buildDirectory.dir("generated/web"))
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }
}

// Antes de cualquier compilación hay que haber copiado la web.
tasks.named("preBuild") {
    dependsOn(copiarWeb)
}
tasks.configureEach {
    if (name.startsWith("merge") && name.endsWith("Assets")) {
        dependsOn(copiarWeb)
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.17.0")
    implementation("androidx.appcompat:appcompat:1.7.1")
    implementation("androidx.webkit:webkit:1.17.1")
}
