<?php
$file = $_POST['file'];
$xtra = $_POST['xtracheck'];
if($xtra==5){
	echo file_get_contents('../synced/' . $file);
}else{
	echo "Unpermitted violation!!!";
}
?>
