var obj; 
var editor = {};
var infoText = document.getElementById("info-text");

var prioColors = {
	rold: {	descr: "really old", color: "rgb(180, 157, 167)", timediff: -100 },
	old: { descr: "old", color: "rgb(237, 197, 217)"},
	passd: { descr: "just passed", color: "rgb(192, 40, 11)", timediff: - 5},
	today: { descr: "today", color: "rgb(255, 93, 2)", timediff: 0},
	nextd: { descr: "tomorrow", color: "rgb(250, 182, 6)", timediff: 1},
	threed: { descr: "in 3 days", color: "rgb(232, 221, 6)", timediff: 3 },
	week: { descr: "in a week", color: "rgb(126, 243, 59)", timediff: 7},
	upcom: { descr: "upcoming", color: "rgb(11, 221, 239)"},
	future: { descr: "far in the future", color: "rgb(143, 171, 238)", timediff: 100}
};

var keysSorted = Object.keys(prioColors).sort(function(a,b){
	return prioColors[a].timediff - prioColors[b].timediff;
	});

var palette = document.getElementById("palette");
	
for(i = 0; i < keysSorted.length; i++) {
	var prioCol = document.createElement("div");
	prioCol.className = "prio-palette";
	prioCol.style.backgroundColor = prioColors[keysSorted[i]].color;
	prioCol.descr = prioColors[keysSorted[i]].descr;
	prioCol.id = keysSorted[i];
	prioCol.onclick = clickOpenColor;
	prioCol.onmouseover = prioDescrInfoText;
	palette.appendChild(prioCol);
}

//open all button
var openAllButt = document.getElementById("open-all");
openAllButt.onclick = openAll;

//close all button
var closeAllButt = document.getElementById("close-all");
closeAllButt.onclick = closeAll;

//open due today button
var openTodayButt = document.getElementById("open-today");
openTodayButt.onclick = function(){
	openByPrioColor(prioColors.today);
};

//open due today button
var openPassedButt = document.getElementById("open-passed");
openPassedButt.onclick = openPassed;	

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
