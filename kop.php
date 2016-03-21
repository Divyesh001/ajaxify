<?php

// if(isset($_REQUEST['actionfunction']) && $_REQUEST['actionfunction'] == 'showData'){
//     showData($_REQUEST, 10);
// }

// function showData($data, $limit = 10)
// {
//     $page = $data['page'];
//     if($page==1) {
//         $start = 0;
//     } else{
//         $start = ($page-1)*$limit;
//     }

//     $str.=" <li>";
//     $str.="<img  class='lazy'  data-original='{$imgdir2.$a_img[$x]}'  src='{$imgdir2.$a_img[$x]}' />";
//     $str.="<button type='button' onclick='deleteObject('{$imgdir2.$a_img[$x]}', this)'>{$imgdir2.$a_img[$x]}</button>";
//     $str.="</li>";

//     $str.="<input type='hidden' class='nextpage' value='".($page+1)."'><input type='hidden' class='isload' value='true'>";

//     echo $str;
// }

if (isset($_POST['file'])) {
    $maina = $_POST['file'];
    if (is_file($maina)) {
        if(unlink($maina))
        {
            echo json_encode(array('result' => 'success'));
        }
        die();
    }
}

$imgdir2 = '/home/pensionerski/public_html/m/';
$imgdir2 = 'examples/';
$allowed_types = array('png','jpg','jpeg','gif');
$a_img = array();


$files = scandir($imgdir2);
foreach($files as $key => $value){
    $path_parts = pathinfo($value);
    if (in_array($path_parts['extension'], $allowed_types)) {
        $a_img[] = $value;
    }
}

?>

<html> <head>
<meta charset='UTF-8'>
<!-- <script   src="https://code.jquery.com/jquery-2.2.1.min.js"   integrity="sha256-gvQgAFzTH6trSrAWoH1iPo9Xc96QxSZ3feW6kem+O00="   crossorigin="anonymous"></script> -->
<!-- <script src="examples/jquery.lazyload.min.js"></script> -->
</head>
<body>
<!-- <img id='loading' src='img/loading.gif'>
<div id="demoajax" cellspacing="0"> -->
</div>
 <div class="scroll">
<?php
$totimg = count($a_img);
    for($x=0; $x < $totimg; $x++) {
?>
    <li>
        <img  class="lazy"  data-original="<?=$imgdir2.$a_img[$x]?>"  src="<?=$imgdir2.$a_img[$x]?>" />
        <button type="button" onclick="deleteObject('<?=$imgdir2.$a_img[$x]?>', this)"><?=$imgdir2.$a_img[$x]?></button>
    </li>

<?php
    }
?>
</div>
<script>

    // var ajax_arry=[];
    // var ajax_index =0;
    // var sctp = 100;
    // $(function(){
    //     $('#loading').show();
    //     $.ajax({
    //         url:window.location.href,
    //         type:"POST",
    //         data:"actionfunction=showData&page=1",
    //         cache: false,
    //         success: function(response){
    //             $('#loading').hide();
    //             $('#demoajax').html(response);
    //         }
    //     });
    //     $(window).scroll(function() {
    //         var height = $('#demoajax').height();
    //         var scroll_top = $(this).scrollTop();
    //          if(ajax_arry.length>0){
    //             $('#loading').hide();
    //             for(var i=0;i<ajax_arry.length;i++){
    //                 ajax_arry[i].abort();
    //             }
    //          }
    //          var page = $('#demoajax').find('.nextpage').val();
    //          var isload = $('#demoajax').find('.isload').val();

    //         if ((($(window).scrollTop()+document.body.clientHeight)==$(window).height()) && isload=='true') {
    //             $('#loading').show();
    //             var ajaxreq = $.ajax({
    //                 url:"scroll.php",
    //                 type:"POST",
    //                 data:"actionfunction=showData&page="+page,
    //                 cache: false,
    //                 success: function(response){
    //                     $('#demoajax').find('.nextpage').remove();
    //                     $('#demoajax').find('.isload').remove();
    //                     $('#loading').hide();

    //                     $('#demoajax').append(response);
    //                 }
    //             });
    //             ajax_arry[ajax_index++]= ajaxreq;
    //         }
    //         return false;

    //         if($(window).scrollTop() == $(window).height()) {
    //             alert("bottom!");
    //         }
    //     });
    // });

function deleteObject(params, r) {
    // IE 5.5+ and every other browser
    var xhr = new window.XMLHttpRequest() || new window.ActiveXObject('MSXML2.XMLHTTP.3.0');

    xhr.open('POST', window.location.href, true);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');

    xhr.onload = function() {
        if (this.readyState === 4) {
            if (this.status >= 200 && this.status < 400) {
                var response;
                if (this.response) {
                    response = this.response;
                } else if (this.responseType === 'text' || !this.responseType) {
                    response = this.responseText || this.responseXML;
                }
                var d = JSON.parse(response);
                if (d.result == 'success') {
                    r.parentNode.remove();
                } else {
                    alert('batal, ne uspq da mahnesh snimkata :@');
                }
            }
        }
    }
    xhr.send('file='+params);
    xhr = null;
}

</script>
</body>
</html>
