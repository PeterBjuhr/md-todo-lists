var pass;
var maxpass=5;
var revpassdiv = document.getElementById("rev-pass");

function saveJson(){
	pass = fetchPassword();
	if(pass===undefined || pass===null){
		passdiv=document.createElement("div");
		passdiv.setAttribute("id","set-pass");
		passlab=document.createElement("label");
		var passlabtxt = "Set password (to-do list saved from other device will be replaced)";
		passlab.appendChild(document.createTextNode(passlabtxt));
		passinp=document.createElement("input");
		passinp.type = "password";
		randbttn=createBttn("generate");
		passbttn=createBttn("set");
		cancbttn=createBttn("cancel");
		randbttn.onclick = setRandPassw;
		passbttn.onclick = getPassw;
		cancbttn.onclick = closePassDiv;
		passdiv.appendChild(passlab);
		passdiv.appendChild(passinp);
		passdiv.appendChild(randbttn);
		passdiv.appendChild(passbttn);
		passdiv.appendChild(cancbttn);
		document.body.appendChild(passdiv);
	}else{
		var jsoncont = JSON.stringify(obj);
		var mdcont = editorSubList(obj.tlist, 0);
		ajaxPost('save', 'file='+pass+'&ext=json&content='+jsoncont);
		ajaxPost('save', 'file='+pass+'&ext=md&content='+mdcont);
		ajaxPost('save', 'file=hashedpass&hash='+pass+'&salt='+createPassword());
	}
}

function setRandPassw(){
	this.previousSibling.value = createPassword();
}

function getPassw(){
	pass = this.previousSibling.previousSibling.value;
	if(pass == ''){
		alert("Please set a password!");
	}else{
		storePassword(pass);
		saveJson();
		closePassDiv();
	}
}

function closePassDiv(){
	document.body.removeChild(passdiv);
}	

function revertJson(){
	pass = fetchPassword();
	if(pass===undefined || pass===null){
		revpassdiv.innerHTML = '';
		passlab=document.createElement("label");
		passlab.appendChild(document.createTextNode("Password?"));
		passinp=document.createElement("input");
		passinp.type = "password";
		revpassdiv.appendChild(passlab);
		revpassdiv.appendChild(passinp);
		revertButtn.innerHTML = "Revert";
		
		passinp.onchange = function(){
			comparePasswords(passinp.value);
		}
	}else{
		getContentForRevert();
	}	
}

function createPassword(){
	return Math.random().toString(36).slice(-9);
}

function comparePasswords(userpass){
	var xmlhttp=new XMLHttpRequest();
	var resptext;
	var count=0;
	var resp;
	
	xmlhttp.onreadystatechange=function(){
		if(count<maxpass){
			if (xmlhttp.readyState==4 && xmlhttp.status==200){
				resptext = xmlhttp.responseText;
				console.log(resptext);
				resp = JSON.parse(resptext);
				console.log(resp.right);
				console.log(maxpass);
				if(resp.right){
					storePassword(userpass);
					revertJson();
					revpassdiv.innerHTML = '';
					revertButtn.innerHTML = "Revert from synced";
				}else{
					count++;
				}
			}
		}
	}

	xmlhttp.open("POST",'pass-compar.php',true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send('userpass='+userpass);
}

function getContentForRevert(){
	var xmlhttp=new XMLHttpRequest();
	
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			importJson(xmlhttp.responseText);
			fetchTodo();
			writeMainList();
		}
	}

	xmlhttp.open("POST",'php/revert.php',true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send('file='+pass+'.json'+'&xtracheck='+maxpass);
}

function ajaxPost(phpfile, postdata){

	var xmlhttp=new XMLHttpRequest();
	
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			//console.log(xmlhttp.responseText);
		}
	}

	xmlhttp.open("POST", 'php/' + phpfile + '.php',true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send(postdata);
}
