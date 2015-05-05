
function initStorage(){
	//initial demo list
	obj = { "tlist":[
		{
			"name": 'Do it!',
			"date": new Date()
		},
		{
			"name": 'nested',
			"date": new Date(2014,5,23),
			"tlist": [
			{
				"name": 'nested task',
				"date": new Date(2014,5,23)
			}
			] 
		},
		{
			"name": 'Edit this list',
			"date": new Date()
		},
		{
			"header": 'Add header'
		},
		{
			"name": 'task with header',
			"date": new Date()
		},
		{
			"header": 'Old stuff'
		},
		{
			"name": 'task with header',
			"date": new Date(79,12,31)
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
