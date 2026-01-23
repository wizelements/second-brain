[app]
title = Second Brain
package.name = secondbrain
package.domain = org.wizelements

source.dir = .
source.include_exts = py,png,jpg,kv,atlas,json

version = 0.1

requirements = python3,kivy,requests

orientation = portrait
fullscreen = 0

android.permissions = INTERNET,READ_EXTERNAL_STORAGE,WRITE_EXTERNAL_STORAGE
android.api = 31
android.minapi = 21
android.ndk = 25b

p4a.bootstrap = sdl2

[buildozer]
log_level = 2
warn_on_root = 1
