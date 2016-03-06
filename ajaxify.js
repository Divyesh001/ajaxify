/**
 * MIT License
 * ===========
 *
 * Copyright (c) 2015 Stanimir Dimitrov <stanimirdim92@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS
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


(function (window, document, factory) {
    /**
     * The use of 'use strict' might crash some libs and ASP.NET
     * because they tend to use arguments.caller.callee
     */
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        window.ajaxify = factory(window, document);
    }
})(this, document, function (window, document, undefined) {

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
                '*': '*/*',
                text: 'text/plain',
                html: 'text/html',
                xml: 'application/xml, text/xml',
                json: 'application/json, text/javascript',
            },
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            async: true,
            method: 'GET',
            timeout: 0, // XHR2
            url: location.href,
            username: null,
            password: null,
            withCredentials: false,
            dataType: 'json',
            data: null,
            processData: true,
            headers: {},
            crossOrigin: false,
            responseType: '', // XHR2
            allowedResponseTypes: {
                '': '""',
                'arraybuffer': 'arraybuffer',
                'blob': 'blob',
                'document': 'document',
                'json': 'json',
                'text': 'text'
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
     *
     * @return {String}
     */
    var parseBlob = function (data, mimeType) {
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

            return (window.URL || window.webkitURL || window.mozURL || window.msURL).createObjectURL(blob);
        } catch (e) {
            return [e, data];
        }
    };

    /**
     * @param {String}
     * @param {String} If it's not a valid mime type, the browser will throw an error
     *
     * @return {Object|Document}
     */
    var parseXML = function (data, mimeType) {
        try {
            if (window.DOMParser) {
                return new window.DOMParser().parseFromString(data, (mimeType !== undefined ? mimeType : config.s.accepts.xml));
            } else {
                var xml;
                xml = new window.ActiveXObject('Microsoft.XMLDOM');
                xml.async = false;
                xml.loadXML(data);

                return xml;
            }
        } catch (e) {
            return e;
        }
    };

    /**
     * TODO: extend this function to use all array types, btoa and atob
     *
     * @param  {Array} The data from the XHR response passed as array
     * @param  {String} Resource mime type
     *
     * @return {String}
     */
    var parseArrayBuffer = function (data, mimeType) {
        try {
            var uInt8Array = new Uint8Array(data);
            var i = uInt8Array.length;
            var binaryString = new Array(i);
            while (i--) {
                binaryString[i] = String.fromCharCode(uInt8Array[i]);
            }

            data = binaryString.join('');
            return 'data:'+mimeType+';base64,'+window.btoa(data);
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

        return config.settings;
    };

    /**
     * @param  {Object} XMLHttpRequest
     *
     * @return {Object}
     */
    var setHeaders = function (request) {
        if (config.s.contentType !== false) {
            request.setRequestHeader('Content-type', config.s.contentType);
        }

        request.setRequestHeader('Accept', config.s.accepts[config.s.dataType] ? config.s.accepts[config.s.dataType] : config.s.accepts['*']);
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
                if (callback.call(obj[i], i, obj[i]) === false) {
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
     * TODO: this should not be activated for arraybuffer or blob
     *
     * @param {Object|Array} Data for XMLHttpRequest
     *
     * @return {String}
     */
    var convertDataToString = function (data) {
        var pairs = [];
        if (Array.isArray(data)) {
            each(data, function (index, value) {
                pairs[pairs.length] = encodeURIComponent(index) + '=' + encodeURIComponent(value);
            });
        } else {
            for (var prop in data) {
                if (data.hasOwnProperty(prop)) {
                    pairs.push(encodeURIComponent(prop) + '=' + encodeURIComponent(data[prop]));
                }
            }
        }

        return pairs.join('&').replace('/%20/g', '+');
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
        var request = new window.XMLHttpRequest() || new window.ActiveXObject('MSXML2.XMLHTTP.3.0');

        /**
         * We should convert only plain objects or arrays.
         * XH2 allows us to pass Blob or ArraBuffer directly to xhr.send() via ArrayBufferView
         */
        if (typeof config.s.data !== 'string' &&
                   config.s.processData === true &&
                   config.s.data &&
                   config.s.responseType.toLowerCase() !== 'arraybuffer' &&
                   config.s.responseType.toLowerCase() !== 'blob'
            ) {
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
            config.s.url = (config.s.url += ((/\?/).test(config.s.url) ? '&' : '?') + (config.s.data !== null ? config.s.data : '') + '&time=' + new Date().getTime());
        }

        /**
         * Open socket
         */
        if (config.xdr === true) {
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
        if (config.s.async === true && config.s.timeout > 0) {
            if (detectXMLHttpVersion() === 2) {
                request.timeout = config.s.timeout;
            } else {
                config.timeoutTimer = window.setTimeout(function () {
                    request.abort('timeout');
                }, config.s.timeout);
            }
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
                    } else if (request.responseType === 'text' || !request.responseType) {
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
            var body = document.getElementsByTagName('body')[0],
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
                request.send(config.s.data);
            }, 4); // 4 is the minimum time. It's hard coded in the browsers.
        } else {
            request.send(config.s.data);
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
});
