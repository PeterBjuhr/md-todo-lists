
function setEditorContent(txt){ 
	t=document.createTextNode(txt);
	newta.appendChild(t);
}

function editMode(){
	showEditor();
	editor.listParent = this.listParent;
	writeListToEditor();
}
/******************************************
 * 
 * Show editor
 * 
 */
function showEditor(){
	clearEditor();
	newhl=document.createElement("hr");
	taEditDiv.appendChild(newhl);
	newta=document.createElement("textarea");
	newta.setAttribute("id",'editor');
	taEditDiv.appendChild(newta);
	
	//enable some extra features of the editor
	var shortcodeObj = { arr: [ 
		{ key: 9, insert: "    " },
		{ key: 189, insert: "- [ ] " } 
	]};
	enableshortcut(shortcodeObj);
	
	newp=document.createElement("p");
	newp.setAttribute("class",'r-align');
	
	var orangButt = createEditorButton('orange', 'Cancel')
	newp.appendChild(orangButt);
	orangButt.onclick = function(){
		writeMainList();
	}
	
	var greenButt = createEditorButton('green', 'Update')
	newp.appendChild(greenButt);
	greenButt.onclick = function(){
		newObjFromEditor();
		storeTodo();
		writeMainList();
		saveJson();
		if(editor.listParent == obj){
			closeAll();
		}
	}
	
	taEditDiv.appendChild(newp);
}

function createEditorButton(color, text){
	var newbttn=document.createElement("button");
	newbttn.type = "button";
	newbttn.setAttribute("class", color+'-butt');
	tupd=document.createTextNode(text);
	newbttn.appendChild(tupd);
	
	return newbttn;
}

//enable shortcut in editor
function enableshortcut(shcObj){
	newta.onkeydown = function(e){
		var s = shcObj.arr;
		for(var c in s){
			if(e.keyCode==s[c].key){
				e.preventDefault();
				var sel = this.selectionStart;
				this.value = this.value.substring(0,sel) + s[c].insert + this.value.substring(sel);
				this.selectionEnd = sel+s[c].insert.length;
			}
		}
	}
}

/************************************
 * 
 * Write list in editor as markdown
 * 
 */
function writeListToEditor(){
	setEditorContent(editorSubList(editor.listParent.tlist, 0));
}

function editorSubList(listArr, ind){
	var rettxt = '';
	
	for(var i in listArr){
		
		if(listArr[i].name){
		
			rettxt += createTab(ind);
			rettxt += "- [ ] ";
			rettxt += listArr[i].name;
			if(listArr[i].date !== undefined){
				rettxt += " **";
				rettxt += listArr[i].date.toDateString();
				rettxt += "**";
			}
			
			rettxt += '\n';	
			
			if(Array.isArray(listArr[i].tlist)){
				rettxt += editorSubList(listArr[i].tlist, ind+1);
			}
		}else{
			
			if(listArr[i].header){
				rettxt += '\n';
				rettxt += createTab(ind);
				rettxt += "###";
				rettxt += listArr[i].header;
				rettxt += '\n\n';
			}
			
		}		
		
	}
	return rettxt;
}

function createTab(nr){
	if(nr==0){
		return '';
	}
	
	var tab = "    ";
	
	var rettxt = '';
	
	for(var i = 0; i < nr; i++) { 
		rettxt += tab;
	}
	
	return rettxt;
}

/*********************************************
 * 
 * Create new list from updated editor
 * 
 */
function newObjFromEditor(){
	
	editor.listParent.tlist = parseToDoMD(newta.value.trim());
}
	
function parseToDoMD(editText){
	
	var textArr = editText.split("\n");
	
	var newmain = Array();
	var newsub;
	
	var childSteps = 0;
	var todoParent = Array();
	
	var todoPatt = /\[/;
	var tabPatt = /    /g;
	
	var p=0;
	var tabs;
	var tname, tdate, theader;
	
	for(var i = 0; i < textArr.length; i++){
		
		if(todoPatt.test(textArr[i])){
			tabs = textArr[i].match(tabPatt);
			if(tabs){
				// nested
				var t = tabs.length;
				
				if(t > childSteps){
					//new nesting level
					todoParent[t].tlist = Array();					
				}
					
				childSteps = t;
				var childTodo = getTodo(textArr[i]);
				todoParent[t].tlist.push(childTodo);
				todoParent[t+1] = childTodo;
			}else{
				// unnested
				childSteps = 0;
				
				if(textArr[i]){
					newmain[p] = getTodo(textArr[i]);
					todoParent[1] = newmain[p];
					p++;
				}
			}
		}else{
			theader = textArr[i].replace(/[-\#]/g,'');
			newmain[p] = { header: theader.trim() };
			p++;
		}
	}
	
	return newmain; 
	
}

function getTodo(str){
	var roughCutArr = str.split('**');
	
	var tname = roughCutArr[0].replace(/[-\[\]\*]/g, '');
	
	if(roughCutArr[1] !== undefined){
		var tdate = roughCutArr[1].replace(/[\*]/g, '');
	}else{
		var tdate = "0";
	}
	
	datObj = convertDateStr(tdate);
	
	return { name: tname.trim(), date: datObj };
}

function convertDateStr(tdate){
	
	if(tdate.length==6){
		dateArr = [
				'20'+tdate.substring(0,2),
				tdate.substring(2,4),
				tdate.substring(4,6)
				];
		return new Date(dateArr.join());
	}

	var d = new Date(); 
	switch(tdate) {
	case "0":
	case "u":
	case "undefined":
		return undefined;
	case "today":
	case "now":
	case "n":
	case "td":
		return d;
	case "tomorrow":
	case "next day":
	case "tom":
	case "tm":
	case "1":
		d.setDate(d.getDate() + 1);
		return d;
	case "3":
		d.setDate(d.getDate() + 3);
		return d;
	case "5":
	case "":
		d.setDate(d.getDate() + 5);
		return d;
	case "week":
	case "next week":
	case "7":
		d.setDate(d.getDate() + 7);
		return d;
	case "14":
		d.setDate(d.getDate() + 14);
		return d;
	case "month":
	case "m":
	case "next month":
	case "4w":
	case "4 weeks":
	case "four weeks":
	case "in four weeks":
		d.setDate(d.getDate() + 28);
		return d;
	default:
		return new Date(tdate);
	}
}	

function clearEditor(){
	listDiv.innerHTML = '';
	taEditDiv.innerHTML = '';
}	
	
	
