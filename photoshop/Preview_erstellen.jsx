#target photoshop-60.064

#includepath '/c/capri-links/scripts2/includes'
#include 'augment_objects.jsx'
#include 'universal_functions.jsx'
#include 'photoshop_functions.jsx'
#include 'interactSwitch.jsx'
#include 'statics.jsx'
#include 'variables.jsx'

var interaction = new InteractSwitch();
interaction.set('none');

create_preview_doc(app.activeDocument);

interaction.reset();

