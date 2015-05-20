function importJson(jsonText){
	storeJSON(jsonText);
}

function importMD(mdText){
	var obj = {};
	obj.tlist = parseToDoMD(mdText);
	storeMD(obj);
}

function exportJson(){
	pass = fetchPassword();
	if(pass===undefined || pass===null){
		alert("Nothing to export. Manage your list with save and revert.");
	}else{
		window.location.assign("php/export.php?type=json&pass="+pass);
	}
}

function exportMD(){
	pass = fetchPassword();
	if(pass===undefined || pass===null){
		alert("Can't export. Manage your list with save and revert.");
	}else{
		window.location.assign("php/export.php?type=md&pass="+pass);
	}
}
