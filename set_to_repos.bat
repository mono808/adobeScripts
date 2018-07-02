rmdir /S /Q "%HOMEPATH%\AppData\Roaming\Adobe\InDesign\Version 8.0\de_DE\Scripts\Scripts Panel\scripts"
rmdir /S /Q "C:\Program Files\Adobe\Adobe Illustrator CS6 (64 Bit)\Presets\de_DE\Skripten\scripts"
rmdir /S /Q "C:\Program Files\Adobe\Adobe Photoshop CS6 (64 Bit)\Presets\Scripts\scripts"

mklink /D "%HOMEPATH%\AppData\Roaming\Adobe\InDesign\Version 8.0\de_DE\Scripts\Scripts Panel\scripts" C:\capri-stuff\adobeScripts\indesign
mklink /D "C:\Program Files\Adobe\Adobe Illustrator CS6 (64 Bit)\Presets\de_DE\Skripten\scripts" C:\capri-stuff\adobeScripts\illustrator
mklink /D "C:\Program Files\Adobe\Adobe Photoshop CS6 (64 Bit)\Presets\Scripts\scripts" C:\capri-stuff\adobeScripts\Photoshop
