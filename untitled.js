/**
 * MIT License
 * ===========
 *
 * Copyright (c) 2015 Stanimir Dimitrov <stanimirdim92@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * @author     Stanimir Dimitrov <stanimirdim92@gmail.com>
 * @copyright  2016 (c) Stanimir Dimitrov.
 * @license    http://www.opensource.org/licenses/mit-license.php  MIT License
 */


(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory;
  } else {
    root.ajaxify = factory(root);
  }
})(this, function (root) {

    /**
     * The use of 'use strict' might crash some libs and ASP.NET
     * because they tend to use arguments.caller.callee
     */
    'use strict';

    var exports = {};

    var config = {

        /**
         * Default settings
         */
        timeoutTimer: null,
        r20: /%20/g,
        rquery: ( /\?/ ),
        s: {},  // holds the extended settings object
        xdr: false,
        settings: {
            accepts: {
                "*": "*/*",
                text: "text/plain",
                html: "text/html",
                xml: "application/xml, text/xml",
                json: "application/json, text/javascript",
            },
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            async: true,
            method: "GET",
            timeout: 0, // XHR2
            url: location.href,
            username: null,
            password: null,
            withCredentials: false,
            dataType: "json",
            data: null,
            processData: true,
            headers: {},
            crossOrigin: false,
            responseType: "", // XHR2
            allowedResponseTypes: {
                "": "''",
                "arraybuffer": "arraybuffer",
                "blob": "blob",
                "document": "document",
                "json": "json",
                "text": "text"
            }
        }
    };

    /**
     * @param {Object} obj the passed object
     * @param {Object} src the original object
     */
    var merge = function (obj, src) {
        for (var key in src) {
            if (obj.hasOwnProperty(key)) {
                src[key] = obj[key];
            }
        }

        return src;
    };

    /**
     * http://caniuse.com/#feat=xhr2
     * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
     *
     * @return {Int} The XMLHttpRequest version
     */
    var detectXMLHttpVersion = function () {
        if ('FormData' in root) {
            return 2;
        }

        return 1;
    };

    /**
     * @param {Object} data The XMLHttpRequest responseText
     */
    var parseJSON = function (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            return [e, data];
        }
    };

    var getSettings = function (settings) {
        if (typeof settings === 'object') {
            return merge(settings, config.settings);
        }

        return settings;
    };

    var setHeaders = function (request) {
        if (config.s.contentType !== false) {
            request.setRequestHeader("Content-type", config.s.contentType);
        }

        request.setRequestHeader("Accept", config.s.accepts[config.s.dataType] ? config.s.accepts[config.s.dataType] : config.s.accepts["*"]);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        // Check for headers option
        for (var i in config.s.headers) {
            if (config.s.headers.hasOwnProperty(i)) {
                request.setRequestHeader(i, config.s.headers[i]);
            }
        }

        return this;
    };

    var showAjaxErrors = function (err, request, methods) {
        if (typeof err === 'function') {
            methods.error.apply(methods, request);
        } else {
            console.error("Status text: " + request.statusText);
            console.error("XHR error: " + request.error);
            console.error("Status: " + request.status);
            console.error("Response text: " + request.responseText);
            console.error("Response headers: " + request.getAllResponseHeaders());
        }

        request.abort();

        return this;
    };

    /**
     * @param {Object} settings
     */
    var xhr = function (settings) {

        var methods = {
            done: function () {},
            error: function () {},
            always: function () {}
        };
        config.s = getSettings(settings);
        /**
         * IE 5.5+ and any other browser
         */
        var request = new (root.XMLHttpRequest || root.ActiveXObject)('MSXML2.XMLHTTP.3.0');

        // if (typeof config.s.data !== 'string' && config.s.processData && config.s.data) {
        //     config.s.data = this.convertDataToText(config.s.data);
        // }

        // config.s.method = config.s.method.toUpperCase() || 'GET';
        // if(config.s.crossOrigin) {
        //     if(!('withCredentials' in config.request) && root.XDomainRequest) {
        //         config.request = new XDomainRequest();
        //         this.xdr = true;
        //     }
        // }

        // /**
        //  * Normalize URL
        //  */
        // if (config.s.method === 'GET') {
        //     config.s.url = (config.s.url += (this.rquery.test(config.s.url) ? "&" : "?") + (config.s.data !== null ? config.s.data : ''));
        // }

        // *
        //  * Open socket

        if (config.xdr) {
            config.request.open(config.s.method, config.s.url);
        } else {
            if (detectXMLHttpVersion() === 2 && config.s.async === true) {
                request.withCredentials = config.s.withCredentials;
            }
            request.open(config.s.method, config.s.url, config.s.async, config.s.username, config.s.password);
        }

        if (request.responseType) {
            request.responseType = (config.s.allowedResponseTypes[config.s.responseType] ? config.s.allowedResponseTypes[config.s.responseType] : '');
        }

        /**
         * Set all headers
         */
        setHeaders(request);

        /**
         * See if we can set request timeout
         */
        // if (detectXMLHttpVersion() === 2 && config.s.async === true && config.s.timeout > 0) {
        //     config.request.timeout = config.s.timeout;
        //     config.timeoutTimer = root.setTimeout(function() {
        //         config.request.abort("timeout");
        //     }, config.s.timeout);
        // }

        /**
         * Listen for specific event triggers
         */
        request.onload = function () {
            if (request.readyState === 4) {
                if (equest.status >= 200 && request.status < 300) {

                    // Clear timeout if it exists
                    if (config.timeoutTimer) {
                        root.clearTimeout(config.timeoutTimer);
                    }

                    var response;
                    response = request.responseText;
                    if (config.s.dataType === 'xml') {
                        response = request.responseXML;
                    }

                    methods.done.apply(methods, request);
                } else {
                    showAjaxErrors(err, request, methods);
                }
            }
        };

        // config.request.ontimeout = function (event) {
        //     var content = document.getElementsByTagName("body")[0],
        //     p = document.createElement('p'),
        //     msg = document.createTextNode('Loading...');
        //     p.appendChild(msg);
        //     content.appendChild(p);

        //     event.target.open(ajaxify.s.method, ajaxify.s.url);

        //     event.target.timeout = ajaxify.s.timeout + 5000;
        //     event.target.send(ajaxify.s.data);
        // };

        // config.request.onerror = function () {
        //     ajaxify.showAjaxErrors(err);
        // };

        // config.request.upload.onprogress = function(e) {
        //     if (e.lengthComputable) {
        //         document.value = (e.loaded / e.total) * 100;
        //         document.textContent = document.value; // Fallback for unsupported browsers.
        //     }
        // };

        // Send request
        // if(this.xdr) {
        //     // http://cypressnorth.com/programming/internet-explorer-aborting-ajax-requests-fixed/
        //     config.request.onprogress = function(){};
        //     config.request.ontimeout = function(){};
        //     config.request.onerror = function(){};
        //     // https://developer.mozilla.org/en-US/docs/Web/API/XDomainRequest
        //     setTimeout(function() {
        //         config.request.send(config.s.method !== "GET" ? config.s.data : null);
        //     }, 4);
        // }
        // else {
        //     config.request.send(config.s.method !== "GET" ? config.s.data : null);
        // }

        var xhrReq = {
          done: function (callback) {
            methods.done = callback;
            return xhrReq;
          },
          error: function (callback) {
            methods.error = callback;
            return xhrReq;
          },
          always: function (callback) {
            methods.always = callback;
            return xhrReq;
          }
        };

        return xhrReq;
    };

    exports.ajax = function(settings) {
        return xhr(settings);
    };

    return exports;
});
