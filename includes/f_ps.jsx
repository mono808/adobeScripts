var f_ps = {
    trimAndGetPosition : function () 
    {
        var doc = app.activeDocument;
        /*
        var trims = ['TOPLEFT', 'BOTTOMRIGHT', 'NOE'];
        var trim = f_all.choose_from_array(trims, undefined, 'Bild zuschneiden?');
        if(trim != 'NOE') {
            doc.trim(TrimType[trim]);
        }*/

        if(doc.guides.length > 0 && doc.guides.length < 3) 
        {
            var defaultPos = {
                    x : new UnitValue(doc.width.value/2*-1, 'mm'),
                    y : new UnitValue(80, 'mm'),
            };
            
            var guidePos = {},
                hasVerticalGuide = false,
                i, g;

            for (i = 0; i < doc.guides.length; i+=1) 
            {
                g = doc.guides[i];
                if (g.direction === Direction.VERTICAL) 
                {
                    hasVerticalGuide = true;
                    guidePos.x = g.coordinate*-1;
                } else {
                    guidePos.y = g.coordinate*-1;
                }
            }

            var info = 'Dokument enthält Hilfslinien. Sollen diese zur Platzierung verwenden werden?'
            info += '\n\nBenötigt wird genau eine vertikale Hilflinie zur Markierung der Mitte auf dem Film. ';
            info += 'Optional ist eine zweite waagerechte HL zur Markierung der Kragennaht / Taschenkante';
            if(hasVerticalGuide && Window.confirm(info))
            {
                guidePos.y = guidePos.y || defaultPos.y;
                return guidePos;
            }
        } else {
            alert('Dokument enthält keine oder zu viele Hilfslinien, Motiv wird mittig platziert!');
            return defaultPos;
        }
    },
    
    remove_component_channels : function () 
    {
        var doc = activeDocument,
            i,
            chan;

        if (doc.DocumentMode = DocumentMode.CMYK || doc.DocumentMode = DocumentMode.RGB || doc.DocumentMode = DocumentMode.GRAYSCALE) {
            doc.activeChannels = doc.componentChannels;
            for (i = doc.componentChannels.length-1; i >= 0; i-=1) {
                chan = doc.channels[i];
                chan.remove();
            };
        };
    },
    
    remove_alpha_channels : function (containTeeChannel) 
    {
        var doc = activeDocument,
            i,
            chan,
            teeColor;

        i = doc.channels.length-1;
        do{
            chan = doc.channels[i];
            if(chan.kind === ChannelType.MASKEDAREA || chan.kind === ChannelType.SELECTEDAREA) {
                if(/tee|shirt|tasche|beutel/i.test(chan.name)) {
                    teeColor = chan.color;
                    if(containTeeChannel) {
                        continue;
                    }
                }
                chan.remove();
            };
        }while(i--);

        return teeColor;
    },
    
    recolor_white_spotchannels : function () 
    {
        var doc = app.activeDocument,
            i,
            maxI,
            chan,
            chanColor,
            ubNames = /^(Unterleger|UL|UB|Underbase|Weiß1|Vordruck)$/i,
            w1Names = /^(Weiß|White|Weiß2|HL)$/i,
            dWNames = /^(UL\+Weiß|UB\+White|UB\+|Weiß1&2|Weiß1\+2)$/i;

        for (i = 0, maxI = doc.channels.length; i < maxI; i += 1) {
            chan = doc.channels[i];
            chan.name = chan.name.replace(/weiss/gi, 'Weiß');
            if(chan.kind === ChannelType.SPOTCOLOR) {
                if(ubNames.test(chan.name)) {
                    chanColor = new SolidColor();
                    chanColor.hsb.brightness = 100;
                    chanColor.hsb.hue = 300;
                    chanColor.hsb.saturation = 20;
                    chan.color = chanColor;
                } else if (w1Names.test(chan.name)) {
                    chanColor = new SolidColor();
                    chanColor.hsb.brightness = 100;
                    chanColor.hsb.hue = 120;
                    chanColor.hsb.saturation = 20;
                    chan.color = chanColor;
                } if (dWNames.test(chan.name)) {
                    chanColor = new SolidColor();
                    chanColor.hsb.brightness = 100;
                    chanColor.hsb.hue = 210;
                    chanColor.hsb.saturation = 20;
                    chan.color = chanColor;                    
                }
            }
        }
    },

    rename_cmyk : function () 
    {
        var doc = app.activeDocument,
            antiNames = /^(Cyan|Magenta|Yellow|Gelb|Black|Schwarz)$/i,
            i,
            chan,
            renamedChans = [];
        
        i = doc.channels.length-1;
        do {
            chan = doc.channels[i];
            if(chan.kind === ChannelType.SPOTCOLOR) {
                if(antiNames.test(chan.name) ){
                    renamedChans.push(chan.name);
                    chan.name += ' Ink'
                    renamedChans.push(chan.name);
                }
            }
        }while(i--)
        
        if(renamedChans.length > 0) 
        {
            var alertString = 'Reserved Channel-Names have been renamed:\r'
            for(i = 0; i < renamedChans.length; i+=2) 
            {
                alertString += renamedChans[i] + ' -> ' + renamedChans[i+1] + '\n';
            };
            alert(alertString);
        }
        return renamedChans;
    },
    
    addRGBChannels : function (docRef) 
    {
        this.addGreyscaleChannel(docRef);
        docRef.changeMode(ChangeMode.RGB);
        return this;
    },
    
    addGreyscaleChannel : function (docRef) 
    {

        var white,
            chan;

        white = new RGBColor();
        white.red = 255;
        white.green = 255;
        white.blue = 255;
           
        chan = docRef.channels.add();
        chan.name = 'Grey';
        chan.kind = ChannelType.SPOTCOLOR;
        docRef.selection.load(chan);
        docRef.selection.fill(white);
        docRef.activeChannels = [chan];
        this.move_channel_to_index(1);
        
        docRef.changeMode(ChangeMode.GRAYSCALE);
        var bgLayer = docRef.artLayers[0];
        bgLayer.isBackgroundLayer = false;

        docRef.selection.selectAll();
        docRef.selection.clear();

        return this
    },
    
    createLayersFromSpotChannels : function () 
    {
        var doc = app.activeDocument;
        
        try {
            var bgLayer = doc.artLayers.getByName('Hintergrund');
        } catch(e) {
            var bgLayer = doc.artLayers[0];
        };
        
        bgLayer.isBackgroundLayer = false;
        doc.selection.selectAll();
        doc.selection.clear();
        
        var chan,
            spotLayer,
            i,
            maxI;
        
        for (i = 3, maxI = doc.channels.length; i < maxI; maxI -= 1) {
            chan = doc.channels[i];
            if (chan.kind === ChannelType.SPOTCOLOR) {
                
                doc.activeChannels = [chan];
                doc.selection.load(chan);
                spotLayer = doc.artLayers.add();
                doc.activeLayer = spotLayer;
                doc.selection.fill(chan.color);
                spotLayer.name = chan.name;
                spotLayer.opacity = 100;
                chan.remove();

            } else {
                if (chan.kind === ChannelType.MASKEDAREA || chan.kind === ChannelType.SELECTEDAREA) {
                    chan.remove();
                }
            }
        };
        doc.selection.deselect();                        
        doc.activeChannels = doc.componentChannels;
    },
    
    mergeSpotChannels : function () 
    {
        var doc = app.activeDocument;
        try {
            var bgLayer = doc.artLayers.getByName('Hintergrund');
        } catch(e) {
            var bgLayer = doc.artLayers[0];
        };
        
        bgLayer.isBackgroundLayer = false;
        doc.selection.selectAll();
        doc.selection.clear();        
        
        var chan,
            i,
            maxI;
        
        for (i = 3, maxI = doc.channels.length; i < maxI; maxI -= 1) {                            
            chan = doc.channels[i];
            if (chan.kind == ChannelType.SELECTEDAREA || chan.kind == ChannelType.MASKEDAREA) {
                chan.kind = ChannelType.SPOTCOLOR;
            }
            chan.merge();
        };            

        doc.selection.deselect();                        
        doc.activeChannels = doc.componentChannels;
    },
    
    move_channel_to_index : function (idx) 
    {
        try {
            var idmove = charIDToTypeID( "move" );
            var desc3 = new ActionDescriptor();
            var idnull = charIDToTypeID( "null" );
            var ref2 = new ActionReference();
            var idChnl = charIDToTypeID( "Chnl" );
            var idOrdn = charIDToTypeID( "Ordn" );
            var idTrgt = charIDToTypeID( "Trgt" );
            ref2.putEnumerated( idChnl, idOrdn, idTrgt );
            desc3.putReference( idnull, ref2 );
            var idT = charIDToTypeID( "T   " );
            var ref3 = new ActionReference();
            var idChnl = charIDToTypeID( "Chnl" );
            ref3.putIndex( idChnl, idx );
            desc3.putReference( idT, ref3 );
            executeAction( idmove, desc3, DialogModes.NO );
        } catch (e) {};
    },

    activate_all_channels : function () 
    {
        var doc = app.activeDocument,
            allChans = [],
            i,
            maxI,
            chan;

        for(i = 0, maxI = doc.channels.length; i < maxI; i += 1) {
            chan = doc.channels[i];
            allChans.push(chan);
        }
        doc.activeChannels = allChans;
    },

    check_for_pantone : function () 
    {
        var pantoneChannels = [],
            doc = app.activeDocument,
            i,
            chan,
            tempColor;

        i = doc.channels.length-1;
        do {    
            chan = doc.channels[i];
            if (chan.kind !== ChannelType.COMPONENT){
                try { tempColor = chan.color; }
                catch (e) { pantoneChannels.push(chan.name); }
            }
        } while (i--)

        /*check back & foreground color 4 pantone*/
        try{
            tempColor = app.foregroundColor;
            tempColor = app.backgroundColor;
        } catch(e) {
            this.reset_colors();
        }
                       
        return pantoneChannels;
    },

    check_for_spot_channels : function () 
    {
        var doc = app.activeDocument,
            chan,
            i;

        i = doc.channels.length-1;
        do {
            chan = doc.channels[i];
            if (chan.kind == ChannelType.SPOTCOLOR) {
                return true;
            };
        } while (i--)
    },

    reset_colors : function () {
        var idRset = charIDToTypeID( "Rset" );
        var desc1 = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
        var ref1 = new ActionReference();
        var idClr = charIDToTypeID( "Clr " );
        var idClrs = charIDToTypeID( "Clrs" );
        ref1.putProperty( idClr, idClrs );
        desc1.putReference( idnull, ref1 );
        executeAction( idRset, desc1, DialogModes.NO );
    },
}