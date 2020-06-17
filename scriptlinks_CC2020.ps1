New-Item -Path "$env:USERPROFILE\AppData\Roaming\Adobe\InDesign\Version 8.0\de_DE\Scripts\Scripts Panel\scripts" -ItemType SymbolicLink -Value "$env:pcroot/adobeScripts/indesign" -Force
New-Item -Path "C:\Program Files\Adobe\Adobe Illustrator CS6 (64 Bit)\Presets\de_DE\Skripten\scripts" -ItemType SymbolicLink -Value  "$env:pcroot/adobeScripts/illustrator" -Force
New-Item -Path "C:\Program Files\Adobe\Adobe Photoshop CS6 (64 Bit)\Presets\Scripts\scripts" -ItemType SymbolicLink -Value  "$env:pcroot/adobeScripts/Photoshop" -Force

New-Item -Path "$env:USERPROFILE\AppData\Roaming\Adobe\InDesign\Version 15.0\de_DE\Scripts\Scripts Panel\scripts" -ItemType SymbolicLink -Value "$env:pcroot/adobeScripts/indesign" -Force
New-Item -Path "C:\Program Files\Adobe\Adobe Illustrator 2020\Presets\de_DE\Skripten\scripts" -ItemType SymbolicLink -Value  "$env:pcroot/adobeScripts/illustrator" -Force
New-Item -Path "C:\Program Files\Adobe\Adobe Photoshop 2020\Presets\Scripts\scripts" -ItemType SymbolicLink -Value  "$env:pcroot/adobeScripts/Photoshop" -Force

New-Item -Path "C:\Program Files\Adobe\Adobe Illustrator CC 2019\Presets\de_DE\Skripten\scripts" -ItemType SymbolicLink -Value  "$env:pcroot/adobeScripts/illustrator" -Force