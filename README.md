# Ajaxify

This is a vanilla Javascript AJAX library. The syntax is similar to jQuery.

[![Build Status](https://travis-ci.org/Stanimirdim92/ajaxify.svg?branch=master)](https://travis-ci.org/Stanimirdim92/ajaxify)

### Supported data types:

 - JSON
 - Document
 - Text
 - XML
 - Blob
 - ArrayBuffer
 - No JSONP support, sorry. Use CORS!

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

    var t = "yes=thisisatext&no=thisisnotatext";

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

####### From PHP file. The script will return plain text, which we parse as XML document
    ajaxify.ajax({
        url: 'test.php',
        method: "GET",
        headers: {
            "my-Awes0mE-H3ad3R": "header4e"
        }
    }).done(function (response, headers, XHR) {
        console.log(ajaxify.parseXML(response));
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

### Blob
    ajaxify.ajax({
        url: 'ajax-icon-big.jpg',
        responseType: 'blob',
        method: "GET",
        headers: {
            "my-Awes0mE-H3ad3R": "header4e"
        }
    }).done(function (response, headers, XHR) {
        var blob = ajaxify.parseBlob(response, 'image/jpeg');

        document.querySelector('#imgId').src = blob;
    });

### ArrayBufer
    ajaxify.ajax({
        url: 'ajax-application-development.jpg',
        responseType: 'arraybuffer',
        method: "GET",
        headers: {
            "my-Awes0mE-H3ad3R": "header4e"
        }
    }).done(function (response, headers, XHR) {
        var buffer = ajaxify.parseArrayBuffer(response, Uint8Array, 'image/jpeg');

        document.querySelector('#imgId').src = buffer;
    });


TODO:
 - File upload
 - Progress bar

