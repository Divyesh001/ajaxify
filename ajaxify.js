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

var ajaxify = (function (window, document, undefined) {

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
     *
     * @return {Object}
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
        if ('FormData' in window) {
            return 2;
        }

        return 1;
    };

    /**
     * @param {Object}
     *
     * @return {Object|Array}
     */
    var parseJSON = function (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            return [e, data];
        }
    };

    /**
     * @param  {Array} The data from the XHR response passed as array
     * @param  {String} Resource mime type
     * @param  {String} HTML attr where we want to append the data
     * @param  {Boolean} Determinates if it should return the blob url or append to element
     *
     * @return {String}
     */
    var parseBlob = function (data, mimeType, htmlAttr, append) {
        try {
           var blob;
            var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
            if(BlobBuilder) {
                // android
                var builder = new BlobBuilder();
                builder.append([data]);
                blob = builder.getBlob(mimeType);
            } else {
                blob = new Blob([data], {type: mimeType});
            }

            var url = (window.URL || window.webkitURL || window.mozURL || window.msURL).createObjectURL(blob);

            if (append === true) {
                if (!htmlAttr || typeof htmlAttr !== 'string') {
                    var content = document.getElementsByTagName("body")[0],
                    img = document.createElement('img');
                    img.setAttribute("id", 'my_blob_id');
                    content.appendChild(img);
                    htmlAttr = "#my_blob_id";
                }
                document.querySelector(htmlAttr).src = url;
            } else {
                return url;
            }

        } catch (e) {
            return [e, data];
        }
    };

    /**
     * @param {String}
     * @param {String} If it's not a valid mime type, the browser will throw an error
     *
     * @return {Object|Array}
     */
    var parseXML = function (data, mimeType) {
        var xml;

        try {
            if (window.DOMParser) {
                xml = new window.DOMParser().parseFromString(data, (mimeType !== undefined ? mimeType : config.s.accepts.xml));
            } else {
                xml = new window.ActiveXObject("Microsoft.XMLDOM");
                xml.async = false;
                xml.loadXML(data);
            }

            return xml;
        } catch (e) {
            return [e, xml];
        }
    };

    /**
     * @param  {Array} The data from the XHR response passed as array
     * @param  {String} Resource mime type
     * @param  {String} HTML attr where we want to append the data
     * @param  {Boolean} Determinates if it should return the blob url or append to element
     *
     * @return {String}
     */
    var parseArrayBuffer = function (data, mimeType, htmlAttr, ret) {
        try {
            var uInt8Array = new Uint8Array(data);
            var i = uInt8Array.length;
            var binaryString = new Array(i);
            while (i--) {
                binaryString[i] = String.fromCharCode(uInt8Array[i]);
            }

            data = binaryString.join('');
            data = "data:"+mimeType+";base64,"+window.btoa(data);
            if (ret === true) {
                if (!htmlAttr || typeof htmlAttr !== 'string') {
                    var content = document.getElementsByTagName("body")[0],
                    img = document.createElement('img');
                    img.setAttribute("id", 'my_arraybuffer_id');
                    content.appendChild(img);
                    htmlAttr = "#my_arraybuffer_id";
                }
                document.querySelector(htmlAttr).src = data;

            } else {
                return data;
            }

        } catch (e) {
            return [e, data];
        }
    };

    /**
     * @param  {Object} Custom settings
     *
     * @return {Object}
     */
    var getSettings = function (settings) {
        if (typeof settings === 'object') {
            return merge(settings, config.settings);
        }

        return settings;
    };

    /**
     * @param  {Object} XMLHttpRequest
     *
     * @return {Object}
     */
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

    /**
     * @param  {Object} XMLHttpRequest
     * @param  {Object}
     *
     * @return {Object}
     */
    var showAjaxErrors = function (request, methods) {
        methods.error.call(methods, request);

        abort(request);

        return this;
    };

    /**
     * @param {Object|Array} Data for XMLHttpRequest
     *
     * @return {String}
     */
    var convertDataToString = function (data) {
        var pairs = [];
        if (Array.isArray(data)) {
            each(data, function (index, value) {
                value = typeof value === 'function' ? value() : (value === null ? "" : value);
                pairs[pairs.length] = encodeURIComponent(index) + "=" + encodeURIComponent(value);
            });
        } else {
            for (var prop in data) {
                if (data.hasOwnProperty(prop)) {
                    var k = encodeURIComponent(prop),
                        v = encodeURIComponent(data[prop]);
                    pairs.push( k + "=" + v);
                }
            }
        }

        return pairs.join("&").replace('/%20/g', "+");
    };

    /**
     * @param {Object} Custom settings
     *
     * @return {Object}
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
        var request = new (window.XMLHttpRequest || window.ActiveXObject)('MSXML2.XMLHTTP.3.0');

        if (typeof config.s.data !== 'string' && config.s.processData && config.s.data) {
            config.s.data = convertDataToString(config.s.data);
        }

        config.s.method = config.s.method.toUpperCase() || 'GET';
        if(config.s.crossOrigin) {
            if(!('withCredentials' in request) && window.XDomainRequest) {
                request = new window.XDomainRequest();
                config.xdr = true;
            }
        }

        /**
         * Normalize URL
         */
        if (config.s.method === 'GET') {
            config.s.url = (config.s.url += ((/\?/).test(config.s.url) ? "&" : "?") + (config.s.data !== null ? config.s.data : ''));
        }

        /**
         * Open socket
         */
        if (config.xdr) {
            request.open(config.s.method, config.s.url);
        } else {
            if ('withCredentials' in request) {
                request.withCredentials = config.s.withCredentials;
            }
            request.open(config.s.method, config.s.url, config.s.async, config.s.username, config.s.password);
        }

        if (config.s.responseType !== '' && detectXMLHttpVersion() === 2) {
            request.responseType = (config.s.allowedResponseTypes[config.s.responseType] ? config.s.allowedResponseTypes[config.s.responseType] : '');
        }

        setHeaders(request);

        /**
         * See if we can set request timeout
         */
        if (detectXMLHttpVersion() === 2 && config.s.async === true && config.s.timeout > 0) {
            request.timeout = config.s.timeout;
        } else {
            config.timeoutTimer = window.setTimeout(function () {
                request.abort("timeout");
            }, config.s.timeout);
        }

        /**
         * Listen for specific event triggers
         */
        request.onload = function () {
            if (request.readyState === 4) {
                if (request.status >= 200 && request.status < 400) {
                    if (config.timeoutTimer) {
                        window.clearTimeout(config.timeoutTimer);
                    }

                    var response;
                    if (request.response) {
                        response = request.response;
                    } else if (request.responseType === "text" || !request.responseType) {
                        response = request.responseText || request.responseXML;
                    }


                    methods.done.call(methods, response, this.getAllResponseHeaders(), this);
                } else {
                    showAjaxErrors(request, methods);
                }

                methods.always.call(methods, request);
            }
        };

        /**
         * @param  {Object}
         */
        request.ontimeout = function (event) {
            var body = document.getElementsByTagName("body")[0],
            p = document.createElement('p'),
            msg = document.createTextNode('Loading...');
            p.appendChild(msg);
            body.appendChild(p);

            event.target.open(config.s.method, config.s.url);

            event.target.timeout = config.s.timeout + 5000;
            event.target.send(config.s.data);
        };

        request.onerror = function () {
            showAjaxErrors(request, methods);
        };

        /**
         * @param  {Object}
         */
        request.upload.onprogress = function (event) {
            if (event.lengthComputable) {
                document.value = (event.loaded / event.total) * 100;
                document.textContent = document.value; // Fallback for unsupported browsers.
            }
        };

        /**
         * Send data
         */
        if(config.xdr) {
            // http://cypressnorth.com/programming/internet-explorer-aborting-ajax-requests-fixed/
            request.onprogress = function (){};
            request.ontimeout = function (){};
            request.onerror = function (){};
            // https://developer.mozilla.org/en-US/docs/Web/API/XDomainRequest
            setTimeout(function () {
                request.send(config.s.method !== "GET" ? config.s.data : null);
            }, 4); // 4 is the minimum time. It's hard coded in the browser.
        } else {
            request.send(config.s.method !== "GET" ? config.s.data : null);
        }

        /**
         * Chaining methods
         */
        var xhrReq = {
            /**
             * @param  {Function}
             *
             * @return {Object}
             */
            done: function (callback) {
                methods.done = callback;

                return xhrReq;
            },

            /**
             * @param  {Function}
             *
             * @return {Object}
             */
            error: function (callback) {
                methods.error = callback;

                return xhrReq;
            },

            /**
             * @param  {Function}
             *
             * @return {Object}
             */
            always: function (callback) {
                methods.always = callback;

                return xhrReq;
            }
        };

        return xhrReq;
    };

    /**
     * @param {Object|Array}
     * @param {Function}
     *
     * @return {Object}
     */
    var each = function (obj, callback) {
        var i = 0;

        if (Array.isArray(obj)) {
            Array.prototype.forEach.call(obj, callback);
        } else {
            for (i in obj) {
                if (callback.call(obj[i], i, obj[i] ) === false) {
                    break;
                }
            }
        }

        return obj;
    };

    /**
     * @param  {Object} XMLHttpRequest
     *
     * @return {Function}
     */
    var abort = function (request) {
        if (request) {
            request.onload = function () {};
            request.abort();
            request = null;
        }

        return this;
    };

    /**
     * @param  {Object}
     *
     * @return {Function}
     */
    exports.ajax = function (settings) {
        return xhr(settings);
    };

    /**
     * @param  {Object}
     * @param  {Object}
     *
     * @return {Function}
     */
    exports.each = function (obj, callback) {
        return each(obj, callback);
    };

    /**
     * @param  {Object}
     *
     * @return {Function}
     */
    exports.parseJSON = function (data) {
        return parseJSON(data);
    };

    /**
     * @param  {Object}
     *
     * @return {Function}
     */
    exports.parseXML = function (data) {
        return parseXML(data);
    };

    /**
     * @param  {Object}
     *
     * @return {Function}
     */
    exports.parseBlob = function (data, mimeType, htmlAttr, append) {
        return parseBlob(data, mimeType, htmlAttr, append);
    };

    /**
     * @param  {Object}
     *
     * @return {Function}
     */
    exports.parseArrayBuffer = function (data, mimeType, htmlAttr, append) {
        return parseArrayBuffer(data, mimeType, htmlAttr, append);
    };

    return exports;
})(window, document);