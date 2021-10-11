#target indesign

function main() {
    var ul = /Unterleger|Vordruck/,
        doc = app.activeDocument;

    for (var s = 0, lenS = doc.swatches.length; s < lenS; s++) {
        var colorName = doc.swatches[s].name;
        if(ul.test(colorName)) {           
         
            var myPage = doc.pages.item(0),
                recWidth = 8,
                recHeight = 16,
                startX = myPage.bounds[1],
                startY = myPage.bounds[0],
                textSize = 14,
                colorsGB = [startY, startX, startY + recHeight, startX + recWidth],
                allRects = [],
                abc = [];

            for (i=65;i<=90;i++) {
                abc[abc.length] = String.fromCharCode(i);
            };

            var colorRects = [];
            
            for (var i = 4, lenI = doc.swatches.length; i < lenI; i++)  {
                
                var color = doc.swatches[i];
                
                switch (color.name) {
                    case 'sisBlack':
                    break;
                                                               
                    case 'Unterleger':                        
                    case 'Vordruck':
                        var ulRect = myPage.textFrames.add();
                        ulRect.fillColor = color;
                        ulRect.strokeColor = doc.swatches[0];
                        ulRect.overprintFill = true;
                        ulRect.name = color.name;
                        
                        ulRect.contents = 'UL';
                        var pg = ulRect.paragraphs[0]
                        pg.fillColor = doc.swatches[2];
                        pg.pointSize = textSize;
                        
                        allRects.push(ulRect);
                    break;
                    
                    case 'bgColor':
                    break;
                    
                    default:
                        var colorRect = myPage.textFrames.add();
                        colorRects.push(colorRect);
                        colorRect.geometricBounds = colorsGB;
                        colorRect.name = color.name;
                        colorsGB[1] += recWidth;
                        colorsGB[3] += recWidth;
                        colorRect.fillColor = color;
                        colorRect.strokeColor = doc.swatches[0];
                        colorRect.overprintFill = true;
                        
                        // colorRect.contents = abc[colorRects.length - 1];
                        // colorRect.textFramePreferences.verticalJustification = VerticalJustification.BOTTOM_ALIGN;
                        // var pg = colorRect.paragraphs[0];
                        // pg.fillColor = doc.swatches[2];
                        // pg.pointSize = textSize;
                        
                        allRects.push(colorRect);  
                    break;
                };                         
            };

            ulRect.geometricBounds = [startY, startX-recWidth, startY + recHeight /2, colorsGB[3] - recWidth ];
            var ulTester = myPage.groups.add(allRects);
            ulTester.name = 'UL-Tester';
            return ulTester;
        };
    };
};

main();