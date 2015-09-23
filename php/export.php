<?php
$fail = true;
$userpass = $_REQUEST['pass'];
$file_type = $_REQUEST['type'];
$hash = file_get_contents('../synced/.hashedpass');

$file_name  = "todo.".$file_type;
$read_file  = '../synced/' . $userpass . "." . $file_type;

if (crypt($userpass, $hash) == $hash) {
	header("Content-disposition: attachment; filename=".$file_name);
	header("Content-type: application/".$file_type);
	readfile($read_file);
	$fail = false;
	exit;
}
if($fail){
	$body = '<h1>Unpermitted violation!!!</h1>';
}else{
	$body = '<script>window.location.assign("index.php");</script>';
}
?>
<!DOCTYPE html>
<html>
<head>
<title>Export</title>
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
<div id="back"><a href="../">Back</a></div>
</body>
</html>
