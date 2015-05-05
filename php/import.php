<?php
if($_FILES["file"]){
	$type_sel = $_POST['type-sel'];
	$allowedExts = array("json", "JSON", "md", "MD", "markdown");
	$temp = explode(".", $_FILES["file"]["name"]);
	$extension = end($temp);
	$upload_info = '';

	if ((($_FILES["file"]["type"] == "text/plaintext")
	|| ($_FILES["file"]["type"] == "text/JSON")
	|| ($_FILES["file"]["type"] == "application/octet-stream")
	|| ($_FILES["file"]["type"] == "text/x-markdown")
	|| ($_FILES["file"]["type"] == "text/markdown"))
	&& ($_FILES["file"]["size"] < 10000)
	&& in_array($extension, $allowedExts)) {
	  if ($_FILES["file"]["error"] > 0) {
		$upload_info .= "Return Code: " . $_FILES["file"]["error"] . "<br>";
	  } else {
		$upload_info .= "Upload: " . $_FILES["file"]["name"] . "<br>";
		$upload_info .= "Type: " . $_FILES["file"]["type"] . "<br>";
		$upload_info .= "Size: " . ($_FILES["file"]["size"] / 1024) . " kB<br>";
		$upload_info .= "Temp file: " . $_FILES["file"]["tmp_name"] . "<br>"; 
		$import_txt = file_get_contents($_FILES["file"]["tmp_name"]);  
	  }
	}else{
	  $upload_info .= "Invalid file [type:".$_FILES["file"]["type"]."|size:".$_FILES["file"]["size"]."]";
	}
}
if($import_txt){
	$body = '<script src="read-and-write.js"></script>';
	$body .= '<script src="imp-exp.js"></script>';
	if($type_sel == "JSON"){
		$body .= '<script>importJson("'.$import_txt.'");</script>';
	}elseif($type_sel == "Markdown"){
		$body .= '<script src="editor.js"></script>';
		$body .= '<script>importMD('.json_encode($import_txt).');</script>';
	}
	$body .= '<script>window.location.assign("index.php");</script>';
}elseif($upload_info){
	$body = $upload_info;
}else{
	$body = '<h1>Unpermitted violation!!!</h1>';
}
?>
<!DOCTYPE html>
<html>
<head>
<title>Import</title>
<style>
body { background-color: black; color: red; }
h1 { position: absolute; padding: 30%; }
a { color: white; }
</style>
</head>
<body>
<?php
echo $body;
?>
<div id="back"><a href="index.php">Back</a></div>
</body>
</html>
