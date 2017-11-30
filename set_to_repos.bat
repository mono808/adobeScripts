rmdir /S /Q C:\capri-links\scripts
rmdir /S /Q C:\capri-links\scripts2

rmdir /S /Q "%HOMEPATH%\AppData\Roaming\Adobe\InDesign\Version 8.0\de_DE\Scripts\Scripts Panel\scripts1"
rmdir /S /Q "%HOMEPATH%\AppData\Roaming\Adobe\InDesign\Version 8.0\de_DE\Scripts\Scripts Panel\scripts2"

rmdir /S /Q "C:\Program Files\Adobe\Adobe Illustrator CS6 (64 Bit)\Presets\de_DE\Skripten\scripts1"
rmdir /S /Q "C:\Program Files\Adobe\Adobe Illustrator CS6 (64 Bit)\Presets\de_DE\Skripten\scripts2"

rmdir /S /Q "C:\Program Files\Adobe\Adobe Photoshop CS6 (64 Bit)\Presets\Scripts\scripts1"
rmdir /S /Q "C:\Program Files\Adobe\Adobe Photoshop CS6 (64 Bit)\Presets\Scripts\scripts2"



mklink /D C:\capri-links\scripts C:\repos\adobeScripts1\
mklink /D C:\capri-links\scripts2 C:\repos\adobeScripts2\

mklink /D "%HOMEPATH%\AppData\Roaming\Adobe\InDesign\Version 8.0\de_DE\Scripts\Scripts Panel\scripts1" C:\repos\adobeScripts1\indesign
mklink /D "%HOMEPATH%\AppData\Roaming\Adobe\InDesign\Version 8.0\de_DE\Scripts\Scripts Panel\scripts2" C:\repos\adobeScripts2\indesign

mklink /D "C:\Program Files\Adobe\Adobe Illustrator CS6 (64 Bit)\Presets\de_DE\Skripten\scripts1" C:\repos\adobeScripts1\illustrator
mklink /D "C:\Program Files\Adobe\Adobe Illustrator CS6 (64 Bit)\Presets\de_DE\Skripten\scripts2" C:\repos\adobeScripts2\illustrator

mklink /D "C:\Program Files\Adobe\Adobe Photoshop CS6 (64 Bit)\Presets\Scripts\scripts1" C:\repos\adobeScripts1\Photoshop
mklink /D "C:\Program Files\Adobe\Adobe Photoshop CS6 (64 Bit)\Presets\Scripts\scripts2" C:\repos\adobeScripts2\Photoshop