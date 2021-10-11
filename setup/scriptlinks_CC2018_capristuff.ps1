New-Item -Path "$env:USERPROFILE\AppData\Roaming\Adobe\InDesign\Version 13.0\de_DE\Scripts\Scripts Panel\scripts" -ItemType SymbolicLink -Value "c:/capristuff/adobeScripts/indesign" -Force
New-Item -Path "C:\Program Files\Adobe\Adobe Photoshop CC 2018\Presets\Scripts\scripts" -ItemType SymbolicLink -Value  "c:/capristuff/adobeScripts/Photoshop" -Force
New-Item -Path "C:\Program Files\Adobe\Adobe Illustrator CC 2018\Presets\de_DE\Skripten\scripts" -ItemType SymbolicLink -Value  "c:/capristuff/adobeScripts/illustrator" -Force

[System.Environment]::SetEnvironmentVariable('csroot','\\cs-server16\CapriShare',[System.EnvironmentVariableTarget]::Machine)
[System.Environment]::SetEnvironmentVariable('pcroot','c:\capristuff\',[System.EnvironmentVariableTarget]::Machine)
[System.Environment]::SetEnvironmentVariable('JSINCLUDE','c:\capristuff\adobescripts\includes',[System.EnvironmentVariableTarget]::Machine)