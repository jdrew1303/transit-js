// Copyright (c) Cognitect, Inc.
// All rights reserved.

"use strict";

goog.provide("com.cognitect.transit.eq");

goog.scope(function() {

var eq = com.cognitect.transit.eq;

/**
 * @const
 * @type {string}
 */
eq.transitHashCodeProperty = "$com$cognitect$transit$hashCode$";

eq.equals = function (x, y) {
    if(x == null) {
        return y == null;
    } else if(x === y) {
        return true;
    } else if(typeof x === "object") {
        if(Array.isArray(x)) {
            if(Array.isArray(y)) {
                if(x.length === y.length) {
                    for(var i = 0; i < x.length; i++) {
                        if(!eq.equals(x[i], y[i])) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else if(x.com$cognitect$transit$equals) {
            return x.com$cognitect$transit$equals(y);      
        } else if(typeof y === "object") {
            var sub   = 0,
                xklen = 0,
                yklen = Object.keys(y).length;
            for(var p in x) {
                if(!x.hasOwnProperty(p)) continue;
                xklen++;
                if(p == eq.transitHashCodeProperty) {
                    if(!y[p]) sub = -1;
                    continue;
                }
                if(!y.hasOwnProperty(p)) {
                    return false;
                } else {
                    if(!eq.equals(x[p], y[p])) {
                        return false;
                    }
                }
            }
            return (xklen + sub) === yklen;
        } else {
            return false;
        }
    } else {
        return false
    }
};

eq.hashCombine = function(seed, hash) {
    return seed ^ (hash + 0x9e3779b9 + (seed << 6) + (seed >> 2));
};

eq.stringCodeCache     = {};
eq.stringCodeCacheSize = 0;

/**
 * @const
 * @type {number}
 */
eq.STR_CACHE_MAX       = 256;

eq.hashString = function(str) {
    // a la goog.string.HashCode
    // http://docs.closure-library.googlecode.com/git/local_closure_goog_string_string.js.source.html#line1206
    var cached = eq.stringCodeCache[str];
    if(cached != null) {
        return cached;
    }
    var code = 0;
    for (var i = 0; i < str.length; ++i) {
        code = 31 * code + str.charCodeAt(i);
        code %= 0x100000000;
    }
    eq.stringCodeCacheSize++;
    if(eq.stringCodeCacheSize >= eq.STR_CACHE_MAX) {
        eq.stringCodeCache = {};
        eq.stringCodeCacheSize = 1;
    }
    eq.stringCodeCache[str] = code;
    return code;
};

eq.hashMapLike = function(m) {
    var code = 0;
    // ES6 Map-like case
    if(m.forEach != null) {
        m.forEach(function(val, key, m) {
            code = (code + (eq.hashCode(key) ^ eq.hashCode(val))) % 4503599627370496;
        });
    } else {
        // JS Object case
        var keys = Object.keys(m);
        for(var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if(key === eq.transitHashCodeProperty) continue;
            var val = m[key];
            code = (code + (eq.hashCode(key) ^ eq.hashCode(val))) % 4503599627370496;
        }
    }
    return code;
};

eq.hashArrayLike = function(arr) {
    var code = 0;
    for(var i = 0; i < arr.length; i++) {
        code = eq.hashCombine(code, eq.hashCode(arr[i]));
    }
    return code;
}

eq.hashCode = function(x) {
    if(x === null) {
        return 0;
    } else {
        var t = typeof x;
        switch(t) {
        case 'number':
            return x;
            break;
        case 'boolean':
            return x === true ? 1 : 0;
            break;
        case 'string':
            return eq.hashString(x);
            break;
        default:
            if(x instanceof Date) {
                return x.valueOf();
            } else if(Array.isArray(x)) {
                return eq.hashArrayLike(x);
            } if(x.com$cognitect$transit$hashCode) {
                return x.com$cognitect$transit$hashCode();
            } else if(x[eq.transitHashCodeProperty]) {
                return x[eq.transitHashCodeProperty];
            } else {
                var code = eq.hashMapLike(x);
                x[eq.transitHashCodeProperty] = code;
                return code;
            }
            break;
        }
    }
}

eq.extendToEQ = function(obj, opts) {
    obj.com$cognitect$transit$hashCode = opts.hashCode;
    obj.com$cognitect$transit$equals = opts.equals;
    return obj;
}

});
