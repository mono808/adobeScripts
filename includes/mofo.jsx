//monofolders
var mofo = {

    base_folder     : Folder.current,

    dv              : '/c/capri-links/druckvorstufe/',
    ansichtOut      : '/c/capri-links/distiller/ansicht/out/',
    ansichtIn       : '/c/capri-links/distiller/ansicht/in/',
    ansichtHQOut    : '/c/capri-links/distiller/ansichtHQ/out/',
    ansichtHQIn     : '/c/capri-links/distiller/ansichtHQ/in/',
    ansichtPxOut    : '/c/capri-links/distiller/ansichtPixel/out/',
    ansichtPxIn     : '/c/capri-links/distiller/ansichtPixel/in/',
    filmOut         : '/c/capri-links/distiller/filme/out/',
    filmIn          : '/c/capri-links/distiller/filme/in/',
    rolleOut        : '/c/capri-links/distiller/filmrollen/out/',
    rolleIn         : '/c/capri-links/distiller/filmrollen/in/',
    rolleSaved      : '/c/capri-links/distiller/filmrollen/saved/',
    rollenplanerCS  : '/c/capri-links/druckvorstufe/filmrollenplaner/',
    templates       : '/c/capri-links/druckvorstufe/scriptVorlagen/filme/',
    
    kd              : '/c/capri-links/kundendaten/',
    b2b             : '/c/capri-links/kundendaten/B2B/',
    b2c             : '/c/capri-links/kundendaten/B2C/',

    sc              : '/c/capri-links/scripts/',
    scriptsInc      : '/c/capri-links/scripts/includes/',
    scriptsBT       : '/c/capri-links/scripts/bridgeTalk/',
    scriptsIllu     : '/c/capri-links/scripts/illustrator/',
    scriptsIndd     : '/c/capri-links/scripts/indesign/',
    scriptsPs       : '/c/capri-links/scripts/photoshop/',
    vorlagen        : '/c/capri-links/druckvorstufe/scriptVorlagen/filme/',
    mock            : '/c/capri-links/druckvorstufe/scriptVorlagen/ansicht/',
    
    // job_Folders
    client_folder   : '../',
    job_folder      : './',
    ansicht         : './Ansicht/',
    previews        : './Previews/',
    filmdaten       : './Druckdaten-SD/',
    druckdaten      : './Druckdaten-SD/',
    ddSD            : './Druckdaten-SD/',
    ddDTA           : './Druckdaten-DTA/',
    ddDTG           : './Druckdaten-DTG/',
    ddFLK           : './Druckdaten-FLK/',
    ddFLX           : './Druckdaten-FLX/',
    ddSTK           : './Druckdaten-STK/',
    ddSUB           : './Druckdaten-SUB/',
    orga            : './Organisation/',
    working         : './Working/',

    set_working_folder : function (new_base) {
        var base;
        var jobRE = /\d{1,5}(wme|ang|cs|a)\d\d-0\d\d/i;
        var jobNr;
        
        new_base ? base = new Folder(new_base) : base = new Folder(this.kd).selectDlg('Select JOB Folder:');
        
        if(base && base.exists) {
            jobNr = jobRE.exec(base.displayName);
            if (jobNr) {
                Folder.current = base;
            } else {
                alert('folder is no job-folder, is the jobnr correct?');
            }
        } else {
            alert('base folder could not be set, pls try again');
        }
    },
   
    resolve_path : function (shortHand) {
        if(this.hasOwnProperty(shortHand)) {
            return this[shortHand];
        } else {
            return null;
        }
    },

    folder : function (shortHand) {        
        var resolved_path = this.resolve_path(shortHand);
        if(resolved_path) {return new Folder(resolved_path)}
        else {return null}
    },

    string : function (shortHand) {
        return this.resolve_path(shortHand);
    },

    init : function (set_base, new_base) {
        this.set_fixed_paths();
        if(set_base) {
            new_base ? this.set_base_folder(new_base) : this.set_base_folder();
        }
    }
};

//monofiles
var mofi = {

    // fixed Files
    mockBagMaster    : mofo.mock  + 'taschen/Ansicht_Taschen_Master.indd',
    mockShirtMaster  : mofo.mock  + 'shirts/Ansicht_Shirt_Master.indd',
    pantones         : mofo.sc + 'pantones.txt',

    set_variable_files : function (nfo) 
    {
        if(nfo) {
            var f = mofo,
                n = nfo;

            // Filetags
            this.printTag        = n.printId + '_' + (n.wxh || '00x00') + '_' + n.tech;
            this.docTag          = n.jobNr + '_' + n.jobName;            
            
            // workingfiles
            this.workingAi         = f.working  + this.printTag + '_Working.ai';
            this.workingPs         = f.working  + this.printTag + '_Working.psd';
            this.backupPs          = f.working  + this.printTag + '_Backup.psd';
            this.backupAi          = f.working  + this.printTag + '_Backup.ai';
            this.previewAi         = f.previews + this.printTag + '_Preview.ai';
            this.previewPs         = f.previews + this.printTag + '_Preview.psd';

            // druckdaten
            this.sepAi             = f.ddSD  + this.printTag + '.ai';
            this.sepEps            = f.ddSD  + this.printTag + '.eps';
            this.sd                = f.ddSD  + this.printTag + '.ai';
            this.dta               = f.ddDTA + this.printTag + '.pdf';
            this.flx               = f.ddFLX + this.printTag + '.ai';
            this.flk               = f.ddFLK + this.printTag + '.ai';
            this.dtg               = f.ddDTG + this.printTag + '.tif';
            this.stk               = f.ddDTG + this.printTag + '.ai';

            // filmdaten
            this.film              = f.ddSD     + this.docTag  + '_' + this.printTag + '_Film.indd';
            this.filmPs            = f.filmIn   + this.docTag  + '_' + this.printTag + '_Film.ps';
            this.filmPdf           = f.filmOut  + this.docTag  + '_' + this.printTag + '_Film.pdf';
            
            // ansicht
            this.mockUpPdf         = f.ansicht      + this.docTag  + '_Ansicht.pdf';
            this.mockUpIndd        = f.ansicht      + this.docTag  + '_Ansicht.indd';
            this.mockUpDist        = f.ansichtIn    + this.docTag  + '_Ansicht.ps';
            this.mockUpPostDist    = f.ansichtOut   + this.docTag  + '_Ansicht.pdf';            

            // organisation
            this.filmhuelle        =   f.ddSD + this.docTag + '_Filmhuelle.indd';
        } else 
        {
            Window.alert('no infos for setting job related files');
        }
    },
    
    refesh : function (nfo) 
    {
        if(nfo) {
            this.set_variable_files(nfo);
        }
    },

    resolve_path : function (shortHand) {
        if(this.hasOwnProperty(shortHand)) {
            return this[shortHand];
        } else {
            return null;
        }
    },

    file : function (shortHand) 
    {
        var path_string = this.string(shortHand);
        if(path_string) {
            return new File(path_string);
        } else {
            return null;
        }
    },

    string : function (shortHand) 
    {
        this.set_variable_files(job.nfo);
        var resolved_path = this.resolve_path(shortHand);
        
        if(resolved_path) {
            return resolved_path
        } else {
            return null
        }
    },
};