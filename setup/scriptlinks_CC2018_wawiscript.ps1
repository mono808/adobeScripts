#script folders
New-Item -Path "$env:USERPROFILE\AppData\Roaming\Adobe\InDesign\Version 13.0\de_DE\Scripts\Scripts Panel\scripts" -ItemType SymbolicLink -Target "c:/wawiscript/adobeScripts/indesign" -Force
New-Item -Path "$Env:Programfiles\Adobe\Adobe Photoshop CC 2018\Presets\Scripts\scripts" -ItemType SymbolicLink -Target  "c:/wawiscript/adobeScripts/Photoshop" -Force
New-Item -Path "$Env:Programfiles\Adobe\Adobe Illustrator CC 2018\Presets\de_DE\Skripten\scripts" -ItemType SymbolicLink -Target  "c:/wawiscript/adobeScripts/illustrator" -Force
#app specific startup scripts
New-Item -Path "$Env:Programfiles\Adobe\Adobe InDesign CC 2018\Scripts\startup scripts\id-startup-scripts.jsx" -ItemType SymbolicLink -Target "c:/wawiscript/adobeScripts/indesign/startup-scripts-id.jsx" -Force
New-Item -Path "$Env:Programfiles\Adobe\Adobe Illustrator CC 2018\Startup Scripts\ai-startup-scripts.jsx" -ItemType SymbolicLink -Target  "c:/wawiscript/adobeScripts/illustrator/startup-scripts-ai.jsx" -Force
New-Item -Path "${env:ProgramFiles(x86)}\Common Files\Adobe\Startup Scripts CC\Adobe Photoshop\ps-startup-scripts.jsx" -ItemType SymbolicLink -Target  "c:/wawiscript/adobeScripts/Photoshop/startup-scripts-ps.jsx" -Force

[System.Environment]::SetEnvironmentVariable('JSINCLUDE', 'C:\wawiscript\adobeScripts\includes')
[System.Environment]::SetEnvironmentVariable('pcroot', 'C:\capri-stuff')
[System.Environment]::SetEnvironmentVariable('csroot', '\\cs-server16\CapriShare')