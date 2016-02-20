<?php

// header("Content-type: application/xml");
 echo "<pre>".print_r($_REQUEST, true)."</pre>";
// echo json_encode($_REQUEST);
//  die;
if (isset($_REQUEST)) {
echo json_encode($_REQUEST);
    die();
// echo file_get_contents('test.xml');
}


?>
