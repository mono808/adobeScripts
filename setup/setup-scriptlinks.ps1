$scriptsPath = "$env:USERPROFILE\monodev\adobeScripts"
# $scriptsPath = "d:\mono808\monodev\adobeScripts"
# $scriptsPath = "c:\capristuff\adobeScripts"

# CC 2018
$idTag="Version 13.0"
$psTag="Adobe Photoshop CC 2018"
$aiTag="Adobe Illustrator CC 2018"

# CC 2020
# $idTag="Version 15.0"
# $psTag="Adobe Photoshop 2020"
# $aiTag="Adobe Illustrator 2020"

#Scripts Path
New-Item -Path "$env:USERPROFILE\AppData\Roaming\Adobe\InDesign\$idTag\de_DE\Scripts\Scripts Panel\scripts" -ItemType SymbolicLink -Value "$scriptsPath\indesign" -Force
New-Item -Path "$Env:Programfiles\Adobe\$psTag\Presets\Scripts\scripts" -ItemType SymbolicLink -Value  "$scriptsPath\photoshop" -Force
New-Item -Path "$Env:Programfiles\Adobe\$aiTag\Presets\de_DE\Skripten\scripts" -ItemType SymbolicLink -Value  "$scriptsPath\illustrator" -Force

#Startup Scripts
New-Item -Path "$Env:Programfiles\Adobe\Adobe InDesign CC 2018\Scripts\startup scripts\id-startup-scripts.jsx" -ItemType SymbolicLink -Target "$scriptsPath\startup-scripts\indesign.jsx" -Force
New-Item -Path "$Env:Programfiles\Adobe\Adobe Illustrator CC 2018\Startup Scripts\ai-startup-scripts.jsx" -ItemType SymbolicLink -Target  "$scriptsPath\startup-scripts\illustrator.jsx" -Force
New-Item -Path "${env:ProgramFiles(x86)}\Common Files\Adobe\Startup Scripts CC\Adobe Photoshop\ps-startup-scripts.jsx" -ItemType SymbolicLink -Target  "$scriptsPath\startup-scripts\photoshop.jsx" -Force

#Env variables
[System.Environment]::SetEnvironmentVariable('csroot','\\cs-server16\CapriShare',[System.EnvironmentVariableTarget]::User)
[System.Environment]::SetEnvironmentVariable('pcroot','c:\capristuff',[System.EnvironmentVariableTarget]::User)
[System.Environment]::SetEnvironmentVariable('adobeScripts',"$scriptsPath",[System.EnvironmentVariableTarget]::User)
[System.Environment]::SetEnvironmentVariable('JSINCLUDE',"$scriptsPath\includes",[System.EnvironmentVariableTarget]::User)