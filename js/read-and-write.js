
function initStorage(){
	//initial demo list
	obj = { "tlist":[
		{
			"name": '**Do it!**',
			"date": new Date()
		},
		{
			"name": 'nested',
			"tlist": [
			{
				"name": 'nested task',
			}
			] 
		},
		{
			"name": '*Edit this list*',
			"date": new Date()
		},
		{
			"header": '### Add header'
		},
		{
			"name": 'task with header',
			"date": new Date()
		},
		{
			"header": '# Important'
		},
		{
			"name": 'must be done today',
			"date": new Date()
		},
		{
			"header": '## Old stuff'
		},
		{
			"name": '~~done but still useful to have~~',
			"date": new Date('12,24,2009')
		}
		]
	};
	
	storeTodo();
}

//store
function storeTodo(){
	localStorage.setItem('to-do-list', JSON.stringify(obj));
}

//store directly from (imported) json
function storeJSON(jsontxt){
	localStorage.setItem('to-do-list', jsontxt);
}

//store from converted md
function storeMD(obj){
	localStorage.setItem('to-do-list', JSON.stringify(obj));
}

//store password
function storePassword(pass){
	localStorage.setItem('password', pass);
}

//retrieve
function fetchTodo(){
    try{
		obj = JSON.parse(localStorage.getItem('to-do-list'));
	}catch(e){
		console.log(e);
	}
}

//retrieve as text
function fetchLocalText(){
	return localStorage.getItem('to-do-list');
}

//retrieve as text
function fetchPassword(){
	return localStorage.getItem('password');
}
