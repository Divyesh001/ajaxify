# Ajaxify
Ajax library with similar syntax like jQuery

# How to use:

### FormData
    var formData = new FormData();
    formData.append('da', 'da=da&asd=dsa');
    formData.append('id', 123456);

    ajaxify.ajax({
        url: 'test.php',
        method: "POST",
        data: formData,
        dataType: "text",
        processData: false,
        contentType: false,
        headers: {
            "my-Awes0mE-H3ad3R": "header4e"
        }
    }).done(function (response, headers, XHR) {
        console.log(response);
        console.log(headers);
        console.log(XHR);
    });

### Array

    var arr = [10, 20, 30, 'yes', 'no'];

    ajaxify.ajax({
        url: 'test.php',
        method: "POST",
        data: arr,
        headers: {
            "my-Awes0mE-H3ad3R": "header4e"
        }
    }).done(function (response, headers, XHR) {
        console.log(response);
        console.log(headers);
        console.log(XHR);
    });

### Text

    var t = "yes=thisisatext&nothisisnotatext";

    ajaxify.ajax({
        url: 'test.php',
        method: "POST",
        data: t,
        headers: {
            "my-Awes0mE-H3ad3R": "header4e"
        }
    }).done(function (response, headers, XHR) {
        console.log(response);
        console.log(headers);
        console.log(XHR);
    });

### Object

    var obj = {
        yes: 'thisIsCamelCase'
    };

    ajaxify.ajax({
        url: 'test.php',
        method: "POST",
        data: obj,
        headers: {
            "my-Awes0mE-H3ad3R": "header4e"
        }
    }).done(function (response, headers, XHR) {
        console.log(response);
        console.log(headers);
        console.log(XHR);
    });


### XML

####### From PHP file. The script will return plain text
    ajaxify.ajax({
        url: 'test.php',
        method: "GET",
        headers: {
            "my-Awes0mE-H3ad3R": "header4e"
        }
    }).done(function (response, headers, XHR) {
        console.log(response);
        console.log(headers);
        console.log(XHR);
    });

####### Directly from XML file. The script will return an XML object
    ajaxify.ajax({
        url: 'test.xml',
        method: "GET",
        headers: {
            "my-Awes0mE-H3ad3R": "header4e"
        }
    }).done(function (response, headers, XHR) {
        console.log(response);
        console.log(headers);
        console.log(XHR);
    });
