﻿/*!
 * jqValidate v1.0.0
 * Copyright (c) 2013, in shenzhen. luzhao@xunlei.com
 */

 var onInputChange = (function($){
    
    /*
    ie9 doesn't trigger oninput event when content is removed with BACKSPACE, ctrl+x etc... 
    I will not bother with feature check.
    */
    var onInputSupport = 'oninput' in document.createElement('input');

    function OnInputChange(element, callback, options) {
        this.element = element;
        this.$element = $(element);
        this.value = element.value;
        this._callback = callback;
        this.options = $.extend({
            time: 100
        }, options);        
        $(element).on('focus', $.proxy(this._listen, this));
        $(element).on('blur', $.proxy(this._unlisten, this));
    }

    OnInputChange.prototype = {
        
        _listen: function(){
            if(onInputSupport){
                this.$element.on('input', $.proxy(this._run, this));
            }
            else {
                this._interval = window.setInterval($.proxy(this._check, this), this.options.time);
            }
            return true;
        },
        
        _unlisten: function(){
            if(onInputSupport){
                this.$element.off('input', this._run);
            }
            else {
                window.clearInterval(this._interval);
            }
            return true;
        },
        
        _run: function(){
            this.value = this.element.value;
            var callback = $.proxy(this._callback, this.element);
            callback(this.value);
        },
        
        _check: function(){
            if(this.element.value != this.value) {
                this._run();
            }
        }
    };
    
    $.fn.onInputChange = function(callback, options){
        return this.each(function(){
            new OnInputChange(this, callback, options);
        });
    };
    
    return {
        Constructor: OnInputChange,
        support:onInputSupport
    };
    
})(window.jQuery);

;(function ($) {
    "use strict"
    
    var message = {
        required: '不能为空。',
        minLength: '字符长度不够。',
        maxLength: '字符超长。',
        mobile: '非法的电话号码。',
        email: '非法的邮箱。',
        chineseName: '非法的中文名。',
        idCard: '非法的身份证号。'
    };
    
    var numericRegex = /^[0-9]+$/,
        mobileRegex = /^(13[0-9]|15[0-9]|18[0-9]|14[0-9])\d{8}$/,
        emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
        chineseNameRegex = /^[\u4E00-\u9FA5]{2,}(?:·[\u4E00-\u9FA5]{1,})*$/,
        idCardRegex = /(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}[X|x|0-9]$)|(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)/;

    var validate = {
        required: function (value) {
            value = $.trim(value);
            return value !== "" && value !== null;
        },
        
        number: function(value) {
            return numericRegex.test(value);
        },
        
        minLength: function (value, length) {
            if (!numericRegex.test(length)) {
                return false;
            }

            return (value.length >= parseInt(length, 10));
        },
        
        maxLength: function (value, length) {
            if (!numericRegex.test(length)) {
                return false;
            }
            
            return (value.length <= parseInt(length, 10));
        },
        
        mobile: function (value) {
            return mobileRegex.test(value);
        },
        
        email: function (value) {
            return emailRegex.test(value);
        },
        
        chineseName: function (value) {
            return chineseNameRegex.test(value);
        },
        
        idCard: function (value) {
            return idCardRegex.test(value);
        }
    };
    
    $.validate = validate;
    
    $.fn.validate = function (type) {
        var result,
            condition,
            value = $.trim($(this).val()),
            func = validate[type];
        
        if (!$.isFunction(func)) {
            throw new Error("can't find this validate type:" + type);
        }
        
        switch (type) {
            case "minLength":
                var minLength = this.attr("data-min-length");
                if (minLength === undefined || minLength === null) {
                    throw new Error("can't find attribute data-min-length");
                }
                result = func(value, minLength);
                break;
                
            case "maxLength":
                var maxLength = this.attr("data-max-length");
                if (maxLength === undefined || maxLength === null) {
                    throw new Error("can't find attribute data-max-length");
                }
                result = func(value, maxLength);
                break;
                
            default:
                //"no any other condition, direct call validate function";
                result = func(value);
        };
        
        return result;
    };
    
    $.fn.monitor = function (type, callback) {
        callback = $.isFunction(callback) ? callback : $.noop;
        
        var typeSeparator = /\s+/,
            $this = this;
        
        this.on("change.validate", function() {
            var typeArr = type.split(typeSeparator),
                result = {
                    code: "success",
                    msg: []
                };
                
            for (var i = 0, j = typeArr.length; i < j; i++) {
                if (!$this.validate(typeArr[i])) {
                    result.code = "fail";
                    result.msg.push({
                        type: typeArr[i],
                        message: message[typeArr[i]]
                    });
                }
            }
            
            callback(result);
        });
        
        return this;
    };
})(jQuery);