var cursor;
var keysObj;

function setEditorContent(txt){
	t=document.createTextNode(txt);
	newta.appendChild(t);
}

function editMode(){
	showEditor();

	//Show editor tip instead
	showEditorTip();
	disablePrioInfoText();

	editor.listParent = this.listParent;
	writeListToEditor();

	//Set editor height
	console.log(newta.scrollHeight);
	if(newta.scrollHeight > 619){
		editHeight = 619;
	}else{
		editHeight = newta.scrollHeight + 30;
	}
	newta.style.height = editHeight + 'px';
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
	orangButt.onclick = writeMainList;

	var greenButt = createEditorButton('green', 'Update')
	newp.appendChild(greenButt);
	greenButt.onclick = saveEditorContent;

	taEditDiv.appendChild(newp);

	//set editor focus
	newta.focus();
}

function saveEditorContent(){
	newObjFromEditor();
	storeTodo();
	writeMainList();
	saveJson();
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
	keysObj = { arr: [
		{ key: 9, insert: "    ", modkey: 'shiftKey' }, //Shift + tab
		{ key: 27, func: writeMainList }, //escape
		{ key: 13, func: saveEditorContent, modkey: 'ctrlKey' }, // Ctrl + Enter
		{ key: 13, func: autoIndent }, // Enter
		{ key: 8, func: backwardsRemove } // Backspace
	]};

	//Catching the keydown events
	newta.onkeydown = doSpecialKeys;
}

//Do special key Action
function doSpecialKeys(e){
	var modkeyCond;
	var s = keysObj.arr;
	for(var c in s){
		if(s[c].hasOwnProperty('modkey')){
			modkeyCond = e[s[c].modkey];
		}else{
			modkeyCond = true;
		}
		if(modkeyCond && e.keyCode==s[c].key){
			e.preventDefault();
			if(s[c].hasOwnProperty('insert')){
				var sel = this.selectionStart;
				this.value = this.value.substring(0,sel) + s[c].insert + this.value.substring(sel);
				this.selectionEnd = sel+s[c].insert.length;
			}else if(s[c].hasOwnProperty('func')){
				s[c].func();
			}
		}
	}
}

function autoIndent(){

	var line = getLine();
	var indMatch = line.match(/^(\s{4})*/);
	insertAtSelection("\n" + indMatch[0]);
}

function backwardsRemove(){
	var line = getLine();
	var indtest = /^(\s{4})+$/.test(line);
	var cbMatch = line.match(/^\s*(-\s\[\s+\]\s*)$/);
	if(indtest){
		removeAtPosition(newta.selectionStart, 4);
	}else if(cbMatch){
		removeAtPosition(newta.selectionStart, cbMatch[1].length);
	}else{
		removeAtPosition(newta.selectionStart, 1);
	}
}

function getLine(){
	var selStart = newta.selectionStart;
	var lineStart = newta.value.substring(0, selStart).lastIndexOf("\n") + 1;

	return newta.value.substring(lineStart, selStart);
}

function insertAtSelection(input){
	var selStart = newta.selectionStart;
	newta.value = newta.value.substring(0, selStart) + input + newta.value.substring(selStart);
	newta.selectionEnd = selStart + input.length;
}

function removeAtPosition(position, nrTokens){
	var usePos = position - nrTokens;
	newta.value = newta.value.substring(0, usePos) + newta.value.substring(position);
	newta.selectionEnd = usePos;
}

//Autocompletion in editor
function enableAutoreplace(){

	newta.onkeyup = function(){
		this.value = this.value.replace(/^((\s{4})*)-$/gm, insertMDCheckbx);
		this.value = this.value.replace(/(\s\*{2}\w+)(\s)(?!\*{2})$/gm, insertBoldEnd);

		//Set cursor
		if(cursor){
			this.selectionEnd = cursor;
			cursor = undefined;
		}
	}
}

function insertMDCheckbx(match, p1, p2, offset, str){

	var repl = p1 + '- [ ] ';
	cursor = offset + repl.length;
	return repl;
}

function insertBoldEnd(match, p1, p2, offset, str){

	var repl = p1 + '**' + p2;
	cursor = offset + repl.length;
	return repl;
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

	var todoPatt = /\-\s?\[\s\]/;
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
			newmain[p] = { header: textArr[i].trim() };
			p++;
		}
	}

	return newmain;

}

function getTodo(str){
	var roughCutArr = str.split(/\*{2}([^\*]+)(\*{2})?\s*$/);

	var tname = roughCutArr[0].replace(/-\s?\[\s\]/g, '');

	if(roughCutArr[1] !== undefined){
		var tdate = roughCutArr[1].replace(/[\*]/g, '');
	}else{
		var tdate = "undef";
	}

	datObj = convertDateStr(tdate);

	return { name: tname.trim(), date: datObj };
}

function convertDateStr(tdate){

	//No date
	if(tdate == "undef"){
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
