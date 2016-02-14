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


;(function (window, document, undefined) {

    /**
     * The use of 'use strict' might crash some libs and ASP.NET
     * because they tend to use arguments.caller.callee
     */
    'use strict';

    // timeout handler
    var ajaxify = {

        /**
         * Default settings
         */
        timeoutTimer: null,
        r20: /%20/g,
        rquery: ( /\?/ ),
        s: {},  // holds the extended settings object
        request: null,
        xdr: false,
        settings: {
            accepts: {
                "*": "*/"+"*", // applying */* directly will be counted as comment
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
        },

        /**
         * @param {Object} obj the passed object
         * @param {Object} src the original object
         */
        merge: function (obj, src) {
            for (var key in src) {
                if (obj.hasOwnProperty(key)) {
                    src[key] = obj[key];
                }
            }

            return src;
        },

        /**
         * http://caniuse.com/#feat=xhr2
         * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
         *
         * @return {Int} The XMLHttpRequest version
         */
        detectXMLHttpVersion: function () {
            if ('FormData' in window) {
                return 2;
            }

            return 1;
        },

        /**
         * @param {Object} data The XMLHttpRequest responseText
         */
        parseJSON: function (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                return [e, data];
            }
        },

        setHeaders: function () {
            if (this.s.contentType !== false) {
                this.request.setRequestHeader("Content-type", this.s.contentType);
            }

            this.request.setRequestHeader("Accept", this.s.accepts[this.s.dataType] ? this.s.accepts[this.s.dataType] : this.s.accepts["*"]);
            this.request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

            // Check for headers option
            for (var i in this.s.headers) {
                if (this.s.headers.hasOwnProperty(i)) {
                    this.request.setRequestHeader(i, this.s.headers[i]);
                }
            }

            return this;
        },


        /**
         * @param {Callback} err
         */
        showAjaxErrors: function (err) {
            if (typeof err === 'function') {
                err(this.request.error, this.request.statusText, this.request.status, this.request.responseText, this.request.getAllResponseHeaders());
            } else {
                console.error("Status text: " + this.request.statusText);
                console.error("XHR error: " + this.request.error);
                console.error("Status: " + this.request.status);
                console.error("Response text: " + this.request.responseText);
            }

            this.abort();

            return this;
        },

        /**
         * @param {Object} settings
         */
        getSettings: function(settings) {
            if (typeof settings === 'object') {
                return this.merge(settings, this.settings);
            } else {
                return this.settings;
            }
        },

        /**
         * @param {Object|Array} data
         */
        convertDataToText: function(data) {
            var pairs = [],
                    add = function(key, value) {
                        // If value is a function, invoke it and return its value
                        value = typeof value === 'function' ? value() : (value === null ? "" : value);
                        pairs[pairs.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
                    };
            if (Array.isArray(data)) {
                ajaxify.each(data, function(index, value) {
                    add(index, value);
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

            return pairs.join("&").replace(this.r20, "+");
        },

        /**
         * @param {Object} settings
         * @param {Callback} done
         * @param {Callback} err
         */
        ajax: function (settings, done, err) {
            if (typeof done !== 'function') {
                throw new Error('Second parameter must be a callback');
            }

            this.s = this.getSettings(settings);

            if (typeof this.s.data !== 'string' && this.s.processData && this.s.data) {
                this.s.data = this.convertDataToText(this.s.data);
            }

            /**
             * IE 5.5+ and any other browser
             */
            this.request = new (window.XMLHttpRequest || window.ActiveXObject)('MSXML2.XMLHTTP.3.0');
            this.s.method = this.s.method.toUpperCase() || 'GET';
            if(this.s.crossOrigin) {
                if(!('withCredentials' in this.request) && window.XDomainRequest) {
                    this.request = new XDomainRequest();
                    this.xdr = true;
                }
            }

            /**
             * Normalize URL
             */
            if (this.s.method === 'GET') {
                this.s.url = (this.s.url += (this.rquery.test(this.s.url) ? "&" : "?") + (this.s.data !== null ? this.s.data : ''));
            }

            /**
             * Open socket
             */
            if (this.xdr) {
                this.request.open(this.s.method, this.s.url);
            } else {
                if (this.detectXMLHttpVersion() === 2 && this.s.async === true) {
                    this.request.withCredentials = this.s.withCredentials;
                }
                this.request.open(this.s.method, this.s.url, this.s.async, this.s.username, this.s.password);
            }

            /**
             * Set all headers
             */
            this.setHeaders();

            /**
             * See if we can set request timeout
             */
            if (this.detectXMLHttpVersion() === 2 && this.s.async === true && this.s.timeout > 0) {
                this.request.timeout = this.s.timeout;
                this.timeoutTimer = window.setTimeout(function() {
                    ajaxify.request.abort("timeout");
                }, ajaxify.s.timeout);
            }

            this.request.onload = function () {
                if (this.readyState === 4) {
                    if (this.status >= 200 && this.status < 300) {
                        // Clear timeout if it exists
                        if (this.timeoutTimer) {
                            window.clearTimeout(this.timeoutTimer);
                        }

                        var response;
                        response = this.responseText;
                        if (ajaxify.s.dataType === 'xml') {
                            response = this.responseXML;
                        }

                        done(response, this.getAllResponseHeaders(), this);
                    } else {
                        ajaxify.showAjaxErrors(err);
                    }
                }
            };

            this.request.ontimeout = function (event) {
                var content = document.getElementsByTagName("body")[0],
                    p = document.createElement('p'),
                    msg = document.createTextNode('Just a little bit longer!');
                    p.appendChild(msg);
                    content.appendChild(p);

                    // Restarts the request.
                    event.target.open(ajaxify.s.method, ajaxify.s.url);

                    // Optionally, set a longer timeout to override the original.
                    event.target.timeout = ajaxify.s.timeout + 5000;
                    event.target.send(ajaxify.s.data);
            };

            this.request.onerror = function () {
                ajaxify.showAjaxErrors(err);
            };

            this.request.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    document.value = (e.loaded / e.total) * 100;
                    document.textContent = document.value; // Fallback for unsupported browsers.
                }
            };

            // Send request
            if(this.xdr) {
                // http://cypressnorth.com/programming/internet-explorer-aborting-ajax-requests-fixed/
                this.request.onprogress = function(){};
                this.request.ontimeout = function(){};
                this.request.onerror = function(){};
                // https://developer.mozilla.org/en-US/docs/Web/API/XDomainRequest
                setTimeout(function() {
                    this.request.send(this.s.method !== "GET" ? this.s.data : null);
                }, 0);
            }
            else {
                this.request.send(this.s.method !== "GET" ? this.s.data : null);
            }

            return this;
        },

        /**
         * @param {Object|Array} obj
         * @param {Callback} callback
         */
        each: function (obj, callback) {
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
        },

        abort: function () {
            if (this.request) {
                this.request.onreadystatechange = function () {};
                this.request.abort();
                this.request = null;
            }

            return this;
        },
    };

    if (typeof module === "object" && module && typeof module.exports === "object") {
        module.exports = ajaxify;
    } else {
        window.ajaxify = ajaxify;
        if (typeof define === "function" && define.amd) {
            define( "ajaxify", [], function () {
                return ajaxify;
            });
        }
    }
})(window, document);
