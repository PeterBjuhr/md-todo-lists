/*
 * Main Functions
 */
function checkStorage(){
	if(typeof(Storage)!==undefined){
		fetchTodo();
		if(obj===undefined || obj===null){
			initStorage();
		}
	}else{
	  alert("Warning, local storage not available in your browser! Please try another browser!");
	}
}

function writeMainList(){

	//clean
	listDiv.innerHTML = "";
	taEditDiv.innerHTML = "";

	//write list
	writeSubList(listDiv, obj.tlist, 'm');

	//enable folding
	enableFolding();
	//enable info text to describe colors
	clearInfoText();
	enablePrioInfoText();
}

//checkbox functionality
function checkChecked(){
	if(this.checked){
		var arrRef = this.parentNode.parentNode.id;
		var refArr = arrRef.split("-");
		var useArr = findArrayFromRef(refArr);
		var delIndex = this.nextSibling.value;
		clearTask(useArr, delIndex);
		if(useArr.length === 0){
			var x = findObjFromRef(refArr);
			if(x.tlist.length === 0){
				x.tlist = 0;
			}
		}
		storeTodo();
		writeMainList();
		saveJson();
	}
}

function writeSubList(listParent, listArr, arrRef){
	var newul, newli, task, newstro, parentDiv, editSpan, editSymb;
	newul=document.createElement("ul");
	newul.setAttribute("class","task-list");
	newul.setAttribute("id",arrRef);

	for(var i = 0; i < listArr.length; i ++ ){
		newli=document.createElement("li");

		if(listArr[i].name){

			inp=document.createElement("input");
			inp.type = "checkbox";
			newli.appendChild(inp);
			inp.onchange = checkChecked;

			hidd=document.createElement("input");
			hidd.type = "hidden";
			hidd.value = i;
			newli.appendChild(hidd);

			task=document.createElement("span");
			task.setAttribute("class", "task");
			newli.appendChild(task);
			task.innerHTML = basicMD(listArr[i].name) + '&nbsp;';

			if(listArr[i].date !== undefined){
				if(typeof(listArr[i].date == "string")){
					listArr[i].date = new Date(listArr[i].date);
				}
				tdate=document.createTextNode(listArr[i].date.toDateString());
				newstro=document.createElement("strong");
				var prio = getPrioColor(listArr[i].date);
				listArr[i].date.prio = prio;
				newstro.style.color = prio.color;
				newstro.appendChild(tdate);
				newli.appendChild(newstro);
			}

			editSpan = document.createElement("span");
			editSpan.setAttribute("class", "edit-symb");
			editSymb = document.createTextNode("edit");
			editSpan.appendChild(editSymb);
			editSpan.listParent = listArr[i];
			editSpan.onclick = editMode;
			newli.appendChild(editSpan);

			if(Array.isArray(listArr[i].tlist)){
				parentDiv = document.createElement("div");
				if(listArr[i].isClosed){
					newli.setAttribute("class", "closed");
					parentDiv.setAttribute("class", "arrow-down");
				}else{
					newli.setAttribute("class", "open");
					parentDiv.setAttribute("class", "arrow-up");
				}
				newli.appendChild(parentDiv);

				writeSubList(newli, listArr[i].tlist, arrRef+'-'+i);
			}
		}else{
			var text;
			var hmatch = listArr[i].header.match(/(#+)(.+)/);
			if(hmatch){
				newstro = document.createElement("h" + hmatch[1].length);
				text = hmatch[2];
			}else if(listArr[i].header){
				newstro = document.createElement("p");
				text = listArr[i].header;
			}else{
				continue;
			}
			newstro.innerHTML = basicMD(text);
			newli.appendChild(newstro);
		}

		newul.appendChild(newli);
	}
	listParent.appendChild(newul);
}

//Basic markdown parsing
function basicMD(mdtext){

	mdtext = mdtext.replace(/\*{2}(.+)\*{2}/g, '<strong>$1</strong>');
	mdtext = mdtext.replace(/\*{1}([^\*]+)\*{1}/g, '<em>$1</em>');
	mdtext = mdtext.replace(/`(.+)`/g, '<code>$1</code>');
	mdtext = mdtext.replace(/~~(.+)~~/g, '<s>$1</s>');
	mdtext = mdtext.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');

	return mdtext;
}

function findArrayFromRef(refArr){
	var r, p;
	var n = refArr.length;

	//simplest case, reference to main array
	if(n==1){
		r = obj.tlist
	//otherwise use recursion on sliced array
	}else{
		p = findArrayFromRef(refArr.slice(0,n-1));
		r = p[refArr[n-1]].tlist;
	}
	return r;
}

function findObjFromRef(refArr){
	var r, p;
	var n = refArr.length;

	if(n<=2){
		r = obj.tlist[refArr[1]];
	}else{
		p = findArrayFromRef(refArr.slice(0,n-1));
		r = p[refArr[n-1]];
	}
	return r;
}

function clearTask(listArr, index){
	listArr.splice(index,1);
}

/*
 * Enable folding of sublist
 */
function enableFolding(){
	var openPars = document.getElementsByClassName("arrow-up");
	var closedPars = document.getElementsByClassName("arrow-down");

	for(var o = 0; o < openPars.length; o ++ ){

		openPars[o].onclick = clickCloseSublist;
	}

	for(var c = 0; c < closedPars.length; c ++ ){

		closedPars[c].onclick = clickOpenSublist;
	}
}

function clickOpenSublist(){

	openSubList(this.parentNode, this);
}

function openSubList(parent, elem){

	parent.setAttribute("class", "open");
	elem.setAttribute("class", "arrow-up");
	elem.onclick = clickCloseSublist;
	var refArr = elem.nextSibling.nextSibling.id.split("-");
	var parentTask = findObjFromRef(refArr);
	parentTask.isClosed = false;
	storeTodo();
}

function getMainList(){
	if(!document.getElementById("m")){
		writeMainList();
	}
	var mainUl = document.getElementById("m");
	return mainUl.getElementsByTagName("li");
}

function openAll(){

	var mainList = getMainList();

	for (var i=0; i < mainList.length; i++) {
		if(mainList[i].className == "closed"){
			var parent = mainList[i];
			var arrow = parent.getElementsByClassName("arrow-down")[0];
			openSubList(parent, arrow);
		}
	}
}

function openPassed(){

	var mainList = getMainList();

	for (var i=0; i < mainList.length; i++) {
		if(mainList[i].className == "closed"){
			var parent = mainList[i];
			var subList = parent.getElementsByTagName("ul")[0];
			var parentTask = findObjFromRef(subList.id.split("-"));
			if(sublistHasPassed(parentTask.tlist)){
				openParents(parent);
			}
		}
	}
}

function openByPrioColor(prio){

	var mainList = getMainList();

	for (var i=0; i < mainList.length; i++) {
		if(mainList[i].className == "closed"){
			var parent = mainList[i];
			var subList = parent.getElementsByTagName("ul")[0];
			var parentTask = findObjFromRef(subList.id.split("-"));
			if(sublistHasDuePrio(prio, parentTask.tlist)){
				openParents(parent);
			}
		}
	}
}

function clickOpenColor(){
	//close all first?
	closeAll();
	openByPrioColor(prioColors[this.id]);
}

function openParents(elem){

	var mainUl = document.getElementById("m");

	while(!(mainUl.isSameNode(elem))){
		if(elem.tagName == "LI" && elem.className == "closed"){
			var arrow = elem.getElementsByClassName("arrow-down")[0];
			openSubList(elem, arrow);
		}
		elem = elem.parentNode;
	}
}

function clickCloseSublist(){

	closeSubList(this.parentNode, this);
}

function closeSubList(parent, elem){

	parent.setAttribute("class", "closed");
	elem.setAttribute("class", "arrow-down");
	elem.onclick = clickOpenSublist;
	var refArr = elem.nextSibling.nextSibling.id.split("-");
	var parentTask = findObjFromRef(refArr);
	parentTask.isClosed = true;
	storeTodo();
}

function closeAll(){

	var mainList = getMainList();

	for (var i=0; i < mainList.length; i++) {
		if(mainList[i].className == "open"){
			var parent = mainList[i];
			var arrow = parent.getElementsByClassName("arrow-up")[0];
			closeSubList(parent, arrow);
		}
	}
}

/*
 * Checking the dates
 */

function sublistHasPassed(sublist){

	var now = new Date();

	for(var i = 0; i < sublist.length; i ++ ){
		var date = sublist[i].date;
		if(date && prioColors.today != date.prio && now > date){
			return true;
		}
	}
}

function sublistHasDuePrio(prio, sublist){

	for(var i = 0; i < sublist.length; i ++ ){
		var date = sublist[i].date;
		if(date && prio == date.prio){
			return true;
		}
	}
}

//return the prio color depending on the date
function getPrioColor(date){

	var prio = new Date();
	var old = new Date();

	//really old?
	old.setDate(prio.getDate() + prioColors.rold.timediff);
	if (old>date){
		return prioColors.rold;
	}

	//old?
	old = new Date();
	old.setDate(prio.getDate() + prioColors.passd.timediff);
	if (old>date){
		return prioColors.old;
	}

	//today?
	if(prio.getDate() == date.getDate()
	&& prio.getMonth() == date.getMonth()
	&& prio.getYear() == date.getYear()){
		return prioColors.today;
	}

	//passed date?
	if (prio>date){
		return prioColors.passd;
	}

	//next day?
	prio.setDate(prio.getDate() + prioColors.nextd.timediff);
	if (prio>date){
		return prioColors.nextd;
	}

	//within three days?
	prio = new Date();
	prio.setDate(prio.getDate() + prioColors.threed.timediff);
	if (prio>date){
		return prioColors.threed;
	}

	//within a week?
	prio = new Date();
	prio.setDate(prio.getDate() + prioColors.week.timediff);
	if (prio>date){
		return prioColors.week;
	}

	//within four weeks?
	prio = new Date();
	prio.setDate(prio.getDate() + prioColors.future.timediff);
	if (prio>date){
		return prioColors.upcom;
	}

	//pretty far ahead
	return prioColors.future;
}

/*
 * Setting the info text
 */

function enablePrioInfoText(){
	var prioArr = document.getElementsByClassName("prio-palette");
	for (var i = 0; i < prioArr.length; i++){
		prioArr[i].addEventListener('mouseover', prioDescrInfoText);
		prioArr[i].addEventListener('mouseout', clearInfoText);
	}
}

function disablePrioInfoText(){
	var prioArr = document.getElementsByClassName("prio-palette");
	for (var i = 0; i < prioArr.length; i++){
		prioArr[i].removeEventListener('mouseover', prioDescrInfoText);
		prioArr[i].removeEventListener('mouseout', clearInfoText);
	}
}

function prioDescrInfoText(){
	infoText.innerHTML = this.descr;
	infoText.style.color = this.style.backgroundColor;
}

function showEditorTip(){
	var editTip = "Use shift + Tab to create nested task." +
			" Use Ctrl + Enter to Save." +
			" Use Esc to Cancel";
	infoText.innerHTML = editTip;
	infoText.style.color = "black";
}

function clearInfoText(){
	infoText.innerHTML = "";
}

/*
 * Create nodes
 */
function createBttn(txt){
	bttn=document.createElement("button");
	bttn.appendChild(document.createTextNode(txt));
	return bttn;
}
