picked = type_ahead (['bat', 'bear', 'beaver', 'bee', 'cat', 'cats and dogs', 'dog', 'maggot', 'moose','moth', 'mouse']);
function type_ahead (array) {
	var selected, temp;
	var w = new Window ('dialog {text: "Quick select", alignChildren: "fill"}');
	var selected = [];
	var entry = w.add ('edittext {active: true}');
	var list = w.add ('listbox', [0,0,150,250], array, {multiselect: true});
	entry.onChanging = function ()
	{
		var temp = entry.text;
		var tempArray = [];
		for (var i = 0; i < array.length; i++) {
			if (array[i].toLowerCase().indexOf (temp) == 0) {
				tempArray.push (array[i]);
             }
            if (tempArray.length > 0) {
                // Create the new list with the same bounds as the one it will replace
                tempList = w.add ("listbox", list.bounds, tempArray, {scrolling: true});
                w.remove(list);
                list = tempList;
                list.selection = 0;
            }			
		}
	} // entry.onChanging
	w.add ('button {text: "Ok"}');

	if (w.show () != 2){
		selected = [];
		for (var i = 0; i < list.selection.length; i++) {
			selected.push (list.selection[i].text);
		}
		return selected;
	}

	w.close();

}