var obj; 
var editor = {};

var impExpDiv = document.getElementById("imp-exp-lnks");

//revert button
var revertButtn = document.getElementById("revert");

revertButtn.onclick = revertJson;

//export import buttons
var expJsonButtn = document.getElementById("exp-json");
var expMDButtn = document.getElementById("exp-md");

expJsonButtn.onclick = exportJson;
expMDButtn.onclick = exportMD;

//textarea for edits
var taEditDiv = document.getElementById("edit-ta");
var newta;

//list div
var listDiv = document.getElementById("todo-list");

//check if web storage is possible
checkStorage();

//fetch list and write it to html
writeMainList();

//edit button
var editButt = document.getElementById("edit");
editButt.listParent = obj;
editButt.onclick = editMode;
