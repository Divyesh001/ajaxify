<?php

// header("Content-type: application/xml");
 // echo "<pre>".print_r($_REQUEST, true)."</pre>";
 foreach ($_REQUEST as $key => $value) {
      echo $key;
 }
 die;
// if (isset($_REQUEST['da'])) {
// echo json_encode(array(
//         'results1' => 1,
//         'results2' => 2,
//         'results3' => 3,
//         'results4' => 4,
//     ));
//     die();
// echo file_get_contents('test.xml');
// }


?>
