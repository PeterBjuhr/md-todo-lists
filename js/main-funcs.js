/*************************
 * Main Functions
 * 
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
	var newul, newli, theader, newstro, parentDiv, editSpan, editSymb;
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
			
			tname=document.createTextNode(listArr[i].name+' ');
			newli.appendChild(tname);
			if(listArr[i].date !== undefined){
				if(typeof(listArr[i].date == "string")){
					listArr[i].date = new Date(listArr[i].date);
				}
				tdate=document.createTextNode(listArr[i].date.toDateString());
				newstro=document.createElement("strong");
				newstro.style.color = getPrioColor(listArr[i].date);
				newstro.appendChild(tdate);
				newli.appendChild(newstro);	
			}	
			
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
				
				editSpan = document.createElement("span");
				editSpan.setAttribute("class", "edit-symb");
				editSymb = document.createTextNode("edit");
				editSpan.appendChild(editSymb);
				editSpan.listParent = listArr[i];
				editSpan.onclick = editMode;
				newli.appendChild(editSpan);
				
				writeSubList(newli, listArr[i].tlist, arrRef+'-'+i);
			}
			
		}else{
			newstro=document.createElement("h3");
			theader=document.createTextNode(listArr[i].header);
			newstro.appendChild(theader);
			newli.appendChild(newstro);
		}
		
		newul.appendChild(newli);
	}
	listParent.appendChild(newul);
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
		
		openPars[o].onclick = closeSubList;
	}

	for(var c = 0; c < closedPars.length; c ++ ){
		
		closedPars[c].onclick = openSubList;
	}
}
	
function openSubList(){
	
	this.parentNode.setAttribute("class", "open");
	this.setAttribute("class", "arrow-up");
	this.onclick = closeSubList;
	var refArr = this.nextSibling.nextSibling.id.split("-");
	var parentTask = findObjFromRef(refArr);
	parentTask.isClosed = false;
	storeTodo();
}

function closeSubList(){
	
	this.parentNode.setAttribute("class", "closed");
	this.setAttribute("class", "arrow-down");
	this.onclick = openSubList;
	var refArr = this.nextSibling.nextSibling.id.split("-");
	var parentTask = findObjFromRef(refArr);
	parentTask.isClosed = true;
	storeTodo();
}

//return different colors depending on the date 
function getPrioColor(date){
	var prio = new Date();
	var old = new Date();
	
	//really old?
	old.setDate(prio.getDate() - 100);
	if (old>date){
		return "rgb(180, 157, 167)";
	}
	
	//old?
	old.setDate(prio.getDate() - 37);
	if (old>date){
		return "rgb(237, 197, 217)";
	}
	
	//today?
	if(prio.getDate() == date.getDate() 
	&& prio.getMonth() == date.getMonth()
	&& prio.getYear() == date.getYear()){
		return "rgb(255, 93, 2)";
	}
	
	//passed date?
	if (prio>date){
		return "rgb(192, 40, 11)";
	}
	
	//next day?
	prio.setDate(prio.getDate() + 1);
	if (prio>date){
		return "rgb(250, 182, 6)";
	}
	
	//within three days?
	prio.setDate(prio.getDate() + 3);
	if (prio>date){
		return "rgb(232, 221, 6)";
	}
	
	//within a week?
	prio.setDate(prio.getDate() + 7);
	if (prio>date){
		return "rgb(126, 243, 59)";
	}
	
	//within four weeks?
	prio.setDate(prio.getDate() + 28);
	if (prio>date){
		return "rgb(11, 221, 239)";
	}
	
	//pretty safe
	return "rgb(143, 171, 238)";
}

/*******************************************
 * Create nodes
 */
 function createBttn(txt){
	bttn=document.createElement("button");
	bttn.appendChild(document.createTextNode(txt));
	return bttn;
}
