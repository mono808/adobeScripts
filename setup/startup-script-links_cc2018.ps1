#app specific startup scripts
New-Item -Path "$Env:Programfiles\Adobe\Adobe InDesign CC 2018\Scripts\startup scripts\id-startup-scripts.jsx" -ItemType SymbolicLink -Target "/c/adobeScripts/indesign/startup-scripts-id.jsx" -Force
New-Item -Path "$Env:Programfiles\Adobe\Adobe Illustrator CC 2018\Startup Scripts\ai-startup-scripts.jsx" -ItemType SymbolicLink -Target  "/c/adobeScripts/illustrator/startup-scripts-ai.jsx" -Force
New-Item -Path "${env:ProgramFiles(x86)}\Common Files\Adobe\Startup Scripts CC\Adobe Photoshop\ps-startup-scripts.jsx" -ItemType SymbolicLink -Target  "/c/adobeScripts/Photoshop/startup-scripts-ps.jsx" -Force

#common startup scripts
#New-Item -Path "$Env:Programfiles\Common Files\Adobe\Startup Scripts CC\Adobe InDesign\id-startup-scripts.jsx" -ItemType SymbolicLink -Target "$env:pcroot/adobeScripts/indesign/startup-scripts-id.jsx" -Force
#New-Item -Path "$Env:Programfiles\Common Files\Adobe\Startup Scripts CC\Adobe Photoshop\ps-startup-scripts.jsx" -ItemType SymbolicLink -Target  "$env:pcroot/adobeScripts/Photoshop/startup-scripts-ps.jsx" -Fo