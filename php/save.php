<?php
$file = $_POST['file'];
$ext = $_POST['ext'];
$content = $_POST['content'];
$hash = $_POST['hash'];
$salt = $_POST['salt'];

if($hash){
	$hashed_password = crypt($hash, $salt);
	file_put_contents('.'.$file, $hashed_password);
}else{
	file_put_contents($file.'.'.$ext, $content);
}
?>
