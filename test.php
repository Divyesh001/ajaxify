<?php

if (isset($_REQUEST)) {
    echo json_encode($_REQUEST);
    return;
}

// echo file_get_contents('test.xml');
