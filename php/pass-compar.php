<?php
$userpass = $_POST['userpass'];
$hash = file_get_contents('.hashedpass');

if (crypt($userpass, $hash) == $hash) {
	echo json_encode((object) array('right'=> true));
}else{
	echo json_encode((object) array('maxpass'=> 3));
}
?>
