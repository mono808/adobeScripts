#app specific startup scripts
New-Item -Path "$Env:Programfiles\Adobe\Adobe InDesign CC 2018\Scripts\startup scripts\id-startup-scripts.jsx" -ItemType SymbolicLink -Target "c:\capristuff\adobeScripts\startup-scripts\indesign.jsx" -Force
New-Item -Path "$Env:Programfiles\Adobe\Adobe Illustrator CC 2018\Startup Scripts\ai-startup-scripts.jsx" -ItemType SymbolicLink -Target  "c:\capristuff\adobeScripts\startup-scripts\illustrator.jsx" -Force
New-Item -Path "${env:ProgramFiles(x86)}\Common Files\Adobe\Startup Scripts CC\Adobe Photoshop\ps-startup-scripts.jsx" -ItemType SymbolicLink -Target  "c:\capristuff\adobeScripts\startup-scripts\photoshop.jsx" -Force

#common startup scripts
#New-Item -Path "$Env:Programfiles\Common Files\Adobe\Startup Scripts CC\Adobe InDesign\id-startup-scripts.jsx" -ItemType SymbolicLink -Target "$env:pcroot/adobeScripts/startup-scripts/indesign.jsx" -Force
#New-Item -Path "$Env:Programfiles\Common Files\Adobe\Startup Scripts CC\Adobe Photoshop\ps-startup-scripts.jsx" -ItemType SymbolicLink -Target  "$env:pcroot/adobeScripts/Photoshop/startup-scripts-ps.jsx" -Fo