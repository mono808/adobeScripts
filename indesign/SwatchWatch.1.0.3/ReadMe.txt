
 SwatchWatch, for InDesign CS5 and above

 (c) 2014 Rorohiko Ltd.
 by Kris Coppieters, kris@rorohiko.com

 Version 1.0.3

 This script will automatically add swatch samples to the end of the document, 
 creating new spreads as needed.

 You can re-run the script as many times as you like: it will remove the old 
 swatch samples, and re-create them.

 The .ini file needs to reside next to the SwatchWatch.jsxbin script.

 Install the .jsxbin script and the SwatchWatchConfig.ini file in your 
 Scripts Palette.

 You can also add a third file, the optional SwatchWatchStyleTemplates.indd 
 template file, in the same location.

 The script relies on six paragraph styles and six object styles to format
 the swatch samples.

 If these don't exist they are added to the document.

 If the styles need to be added the script will attempt to load them from a 
 document called 'SwatchWatchStyleTemplates.indd'. If no such document 
 resides next to the .jsxbin file, it will fall back to building some styles 
 from scratch.

 Once the styles have been created or added to the document, they won't be 
 modified by the script any further: it's up to the user to change them 
 in the document to achieve the desired look and feel.

 Typical workflow:

 Adjust the base parameters in the config file (widths, heights,...)
 Adjust the styles in the SwatchWatchStyleTemplates.indd document
 Run the script once on a document
 -> New object styles and paragraph styles are added to the document
 -> (optional) Modify the newly created styles as desired
 -> (optional) Re-run the script to make it pick up the style adjustments
 As the swatches evolve, re-run the script as desired for an updated overview

 The swatches and swatch info are created on one or two separate layers.
 
 For more info, please open the SwatchWatchConfig.ini file with a text editor
 (BBEdit, TextWranger, NotePad, NotePad++...) and read the information in 
 the .ini file.

 If you use SwatchWatchStyleTemplates.indd, make sure to create it with the
 lowest version of InDesign you have installed, otherwise the script will
 fail when you happen to use it in a version of InDesign that is lower than 
 the version used to create SwatchWatchStyleTemplates.indd

