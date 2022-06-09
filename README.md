# adobeScripts
AdobeScripts is a collection of ExtendScripts for automating digital prepress tasks.


## Description
Adobe Software can be automated with the ExtendScript language. ExtendScript is based on Javascript ES3.
ES5, some ES6 features and common.js module functionality can be polyfilled, though.

The Scripts focus mainly on automating workflows of getting digital art files ready for production and quickly and precisely generating mockups for potential customers.


## Getting Started
* clone repo
* adjust $scriptsPath in setup/setup-scriptlinks.ps1
* run setup/setup-scriptlinks.ps1 as admin

   this will replace your user scripts folder with symlinks to $scriptsPath. This makes updating / editing scripts easy while the scripts are still available via the menubar within the corresponding adobe software.
   

### Dependencies

The scripts require the corresponding Adobe Software to run. Tested on Version CS6 and above.

Scripts are written for windows os. Language is javascript, so they should run on mac os, too. But your mileage may vary.


### Executing program

* Scripts can either be run from within Adobe Software, under File -> Scripts
* or run the "runscript" for a quicksearch ui to run scripts. Useful for illustrator and photoshop because they dont have a scripts panel like indesign.
