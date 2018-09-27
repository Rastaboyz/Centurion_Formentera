# Centurion_Formentera
Control de accesos

# Generar APK
https://ionicframework.com/docs/v1/guide/publishing.html

1) cd [PROJECT PATH]
2) ionic cordova build --release android
3) cd "C:\Program Files\Java\jdk1.8.0_181\bin"
4) jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore "[RUTA_PREFERIDA]\my-release-key.keystore" "[RUTA_PROYECTO]\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk" alias_name
5) cd "[RUTA_USUARIO]\AppData\Local\Android\Sdk\build-tools\28.0.2"
6) zipalign -v 4 "[RUTA_PROYECTO]\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk" "[RUTA_PROYECTO]\platforms\android\app\build\outputs\apk\release\Centurion.apk"

3.1) Crear clave firmada
keytool -genkey -v -keystore "[RUTA_PREFERIDA]\my-release-key.keystore" -alias alias_name -keyalg RSA -keysize 2048 -validity 10000

