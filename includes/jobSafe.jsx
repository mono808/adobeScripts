function set_jobSafe(serialInput) {

    /*global function for creating a jobSafe object with a private variable to store a folder reference*/
    if(typeof JobSafe !== 'function')
    {
        function JobSafe (initFolder) {
            var storedFolder = null;
            return {
                set : function (args) {
                    if(args) {
                        if(args instanceof Folder) {
                            storedFolder = args;
                        } else if (args instanceof String) {
                            storedFolder = new Folder(args);
                        }
                    }
                },
                get : function () {
                    return storedFolder ? storedFolder : null;
                }
            }
        }
    }
    
    var input = serialInput ? eval(serialInput) : null;
    
    /*if input is provided, check if there is a global jobSafe already*/
    if(!input) {
        $.writeln('estk: no input for jobSafe given');
        return null;
    }
    if(typeof jobSafe == "undefined") {
        $.writeln('estk: jobSafe initialized');
        jobSafe = new JobSafe();
    }

    jobSafe.set(input);
    $.writeln('estk: jobSafe set to: ' + input.name);
}

function get_jobSafe() {
    if(typeof jobSafe != "undefined") {
        var f = jobSafe.get();
        $.writeln('estk: got ' + f.name + 'from jobSafe');
        return f.toSource();
    }
}

var fd = new Folder('/c/capri-links/kundendaten/B2B/Criminals/0546A17-014_Mausi-Shirts/');
set_jobSafe(fd);
var fd = get_jobSafe();

var fl = new File('/c/capri-links/kundendaten/B2B/Criminals/0546A17-014_Mausi-Shirts');
bridge5.open(fl);
