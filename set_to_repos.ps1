remove-item -path "$env:USERPROFILE\AppData\Roaming\Adobe\InDesign\Version 8.0\de_DE\Scripts\Scripts Panel\scripts"
Remove-Item -Path "C:\Program Files\Adobe\Adobe Illustrator CS6 (64 Bit)\Presets\de_DE\Skripten\scripts"
remove-item -path "C:\Program Files\Adobe\Adobe Photoshop CS6 (64 Bit)\Presets\Scripts\scripts"

New-Item -Path "$env:USERPROFILE\AppData\Roaming\Adobe\InDesign\Version 8.0\de_DE\Scripts\Scripts Panel\scripts" -ItemType SymbolicLink -Value "$env:pcroot/adobeScripts/indesign"
New-Item -Path "C:\Program Files\Adobe\Adobe Illustrator CS6 (64 Bit)\Presets\de_DE\Skripten\scripts" -ItemType SymbolicLink -Value  "$env:pcroot/adobeScripts/illustrator"
New-Item -Path "C:\Program Files\Adobe\Adobe Photoshop CS6 (64 Bit)\Presets\Scripts\scripts" -ItemType SymbolicLink -Value  "$env:pcroot/adobeScripts/Photoshop"