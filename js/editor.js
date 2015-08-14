
function setEditorContent(txt){ 
	t=document.createTextNode(txt);
	newta.appendChild(t);
}

function editMode(){
	showEditor();
	showEditorTip();
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
	enableSpecialKeys();
	enableAutoreplace();
	
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

//Enable special keys in editor
function enableSpecialKeys(){
	//Defining keys
	var keysObj = { arr: [ 
		{ key: 9, insert: "    " }, //tab
	]};

	//Catching the keydown events
	newta.onkeydown = function(e){
		var s = keysObj.arr;
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

//Autocompletion in editor
function enableAutoreplace(){

	newta.onkeyup = function(){
		this.value = this.value.replace(/^((\s{4})*)-$/gm, '$1- [ ] ');
		this.value = this.value.replace(/(\s\*{2}\w+)(\s)(?!\*{2})$/g, '$1**$2');
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

	//No date
	if(tdate == "0" || tdate == "undefined"){
		return undefined;
	}

	//Date with 6 digits
	var ddrgx = /^\d{6}$/;
	if(ddrgx.test(tdate)){
		dateArr = [
				'20'+tdate.substring(0,2),
				tdate.substring(2,4),
				tdate.substring(4,6)
				];
		return new Date(dateArr.join());
	}
	
	var d = new Date();

	//Simple addition (from today)
	var nrgx = /^\d{1,2}$/;
	if(nrgx.test(tdate)){
		var add = parseInt(tdate);
		d.setDate(d.getDate() + add);
		return d;
	}

	//Addition by weeks
	var wrgx = /(\d)w/i;
	var matchArr = tdate.match(wrgx);
	if(matchArr){
		var add = parseInt(matchArr[1]) * 7;
		d.setDate(d.getDate() + add);
		return d;
	}

	//Addition by month
	var mrgx = /(\d)m/i;
	var matchArr = tdate.match(mrgx);
	if(matchArr){
		var m = d.getMonth();
		var add = parseInt(matchArr[1]);
		d.setMonth(m + add);
		return d;
	}

	//Keywords
	var krgx = /^\D+$/g;
	if(krgx.test(tdate)){ 
		switch(tdate) {
			case "today":
			case "now":
			case "n":
			case "td":
				return d;
			case "tomorrow":
			case "next day":
			case "tom":
			case "tm":
				d.setDate(d.getDate() + 1);
				return d;
			case "next week":
				d.setDate(d.getDate() + 7);
				return d;
			case "next month":
				d.setDate(d.getDate() + 30);
				return d;
		}
	}

	return new Date(tdate);
}	

function clearEditor(){
	listDiv.innerHTML = '';
	taEditDiv.innerHTML = '';
}	
	
	
