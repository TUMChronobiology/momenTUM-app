<?php

    // If blocked by CORS, you may need to add
    // header('Access-Control-Allow-Origin: *');

    foreach ($_POST as $key => $value) {
        file_put_contents('data.txt', $key . ':' . $value . '; ', FILE_APPEND);
    }

    file_put_contents('data.txt', "\n", FILE_APPEND);

    echo true;
?>
