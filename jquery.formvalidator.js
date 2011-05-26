/*
	FORM VALIDATION MADE EASY
	------------------------------------------
	Created by Victor Jonsson <http://www.victorjonsson.se>
	Documentation and issue tracking on Github <https://github.com/victorjonsson/jQuery-Form-Validator/>
	Available for download on jQuery.com <http://plugins.jquery.com/project/jQueryFormValidtor/>
 
	(c) 2011 Victor Jonsson, Sweden.
	Dual licensed under the MIT or GPL Version 2 licenses
    
	$version 1.0
*/
(function($) {
    $.extend($.fn, {
        validate : function(language, settings) {

            /*
             * Config
             */
            var config = {
                ignore : [], // Names of inputs not to be validated even though node attribute containing the validation rules tells us to
                errorElementClass : 'error', // Class that will be put on elements which value is invalid
                borderColorOnError : 'red', // Border color of elements which value is invalid, empty string to not change border color
                errorMessageClass : 'jquery_form_error_message', // class name of div containing error messages when validation fails
                validationRuleAttribute : 'data-validation', // name of the attribute holding the validation rules
                errorMessagePosition : 'top' // Can be either "top" or "element"
            };
            
            /*
             * Dialogs
             */
            var lang = {
                errorTitle : 'Form submission failed!',
                requiredFields : 'You have not answered all required fields',
                badTime : 'You have not given a correct time',
                badEmail : 'You have not given a correct e-mail address',
                badTelephone : 'You have not given a correct phone number',
                badSecurityAnswer : 'You have not given a correct answer to the security question',
                badDate : 'You have not given a correct date',
                toLongStart : 'You have given an answer longer then ',
                toLongEnd : ' characters',
                toShortStart : 'You have given an answer shorter then ',
                toShortEnd : ' characters',
                badLength : 'You have to give an answer between ',
                notConfirmed : 'Values could not be confirmed',
                badDomain : 'Incorrect domain value',
                badUrl : 'Incorrect url value',
                badFloat : 'Incorrect float value',
                badCustomVal : 'You gave an incorrect answer',
                badInt : 'Incorrect integer value',
                badSecurityNumber : 'Your social security number was incorrect'
            };

            /*
             * Extends initial settings
             */
            if (settings)
                $.extend(config, settings);
            if (language)
                $.extend(lang, language);

            /**
             * Tells whether or not to validate element with this name and of this type
             * @param string name
             * @param string type
             * @return boolean
             */
            var ignoreInput = function(name, type) {
                if (type == 'submit')
                    return true;
                for (var i = 0; i < config.ignore.length; i++) {
                    if (config.ignore[i] == name)
                        return true;
                }
                return false;
            };

            /**
             * <input data-validation="length12" /> => getAttribute($(element).attr('class'), 'length') = 12
             * @param string classValue
             * @param string attributeName
             * @returns integer
             */
            var getAttributeInteger = function(attrValue, attrName) {
                var regex = new RegExp('(' + attrName + '[0-9\-]+)', "g");
                return attrValue.match(regex)[0].replace(/[^0-9\-]/g, '');
            };

            /**
             * Adds message to error message stack if not already in the message stack
             * @param string mess
             */
            var addErrorMessage = function(mess) {
                if (jQuery.inArray(mess, errorMessages) < 0)
                    errorMessages.push(mess);
            };

            /** Error messages for this validation */
            var errorMessages = [];

            /** Input elements whitch value wasnt valid */
            var errorInputs = [];

            /** Form instance */
            var form = this;


            //
            // Validate radio buttons
            //
            $(this).find('input[type=radio]').each(function() {
                var validationRule = $(this).attr(config.validationRuleAttribute);
                if (typeof validationRule != 'undefined' && validationRule != null) {
                    if (validationRule == 'required') {
                        var radioButtonName = $(this).attr('name');
                        var isChecked = false;
                        form.find('input[name=' + radioButtonName + ']').each(function() {
                            if ($(this).is(':checked'))
                                isChecked = true;
                        });
                        if (!isChecked) {
                            errorMessages.push(lang.requiredFields);
                        }
                    }
                }
            });


            //
            // Validate element values
            //
            $(this).find('input,textarea,select').each(function() {
                if (!ignoreInput($(this).attr('name'), $(this).attr('type'))) {

                    // memorize border color
                    if (jQueryFormUtils.defaultBorderColor == null && $(this).attr('type') == 'text')
                        jQueryFormUtils.defaultBorderColor = $(this).css('border-color');

                    var value = jQuery.trim($(this).val());
                    var validationRules = $(this).attr(config.validationRuleAttribute);

                    if (typeof validationRules != 'undefined' && validationRules != null) {

                        // Required
                        if (validationRules.indexOf('required') > -1 && value == '') {
                            errorInputs.push($(this));
                            addErrorMessage(lang.requiredFields);
                            $(this).attr('data-error', lang.requiredFields);
                        }

                        // Min length
                        if (validationRules.indexOf('validate_min_length') > -1 && value.length < getAttributeInteger(validationRules, 'length')) {
                            errorInputs.push($(this));
                            var mess = lang.toShortStart + getAttributeInteger(validationRules, 'length') + lang.toShortEnd;
                            addErrorMessage(mess);
                            $(this).attr('data-error', mess);
                        }

                        // Max length
                        if (validationRules.indexOf('validate_max_length') > -1 && value.length > getAttributeInteger(validationRules, 'length')) {
                            errorInputs.push($(this));
                            var mess = lang.toLongStart + getAttributeInteger(validationRules, 'length') + lang.toLongEnd;
                            addErrorMessage(mess);
                            $(this).attr('data-error', mess);
                        }

                        // Length range
                        if (validationRules.indexOf('validate_length') > -1) {
                            var range = getAttributeInteger(validationRules, 'length').split('-');
                            if (value.length < parseInt(range[0]) || value.length > parseInt(range[1])) {
                                errorInputs.push($(this));
                                var mess = lang.badLength + getAttributeInteger(validationRules, 'length') + lang.toLongEnd;
                                addErrorMessage(mess);
                                $(this).attr('data-error', mess);
                            }
                        }

                        // Email
                        if (validationRules.indexOf('validate_email') > -1 && !jQueryFormUtils.validateEmail(value)) {
                            errorInputs.push($(this));
                            $(this).attr('data-error', lang.badEmail);
                            addErrorMessage(lang.badEmail);
                        }

                        // Domain
                        else if (validationRules.indexOf('validate_domain') > -1 && !jQueryFormUtils.validateDomain(value)) {
                            errorInputs.push($(this));
                            $(this).attr('data-error', lang.badDomain);
                            addErrorMessage(lang.badDomain);
                        }

                        // Url
                        else if (validationRules.indexOf('validate_url') > -1 && !jQueryFormUtils.validateUrl(value)) {
                            errorInputs.push($(this));
                            $(this).attr('data-error', lang.badUrl);
                            addErrorMessage(lang.badUrl);
                        }

                        // Float
                        else if (validationRules.indexOf('validate_float') > -1 && !jQueryFormUtils.validateFloat(value)) {
                            errorInputs.push($(this));
                            $(this).attr('data-error', lang.badFloat);
                            addErrorMessage(lang.badFloat);
                        }

                        // Integer
                        else if (validationRules.indexOf('validate_int') > -1 && !jQueryFormUtils.validateInteger(value)) {
                            errorInputs.push($(this));
                            $(this).attr('data-error', lang.badInt);
                            addErrorMessage(lang.badInt);
                        }

                        // Time
                        else if (validationRules.indexOf('validate_time') > -1 && !jQueryFormUtils.validateTime(value)) {
                            errorInputs.push($(this));
                            $(this).attr('data-error', lang.badTime);
                            addErrorMessage(lang.badTime);
                        }

                        // Date
                        else if (validationRules.indexOf('validate_date') > -1 && !jQueryFormUtils.validateDate(value)) {
                            errorInputs.push($(this));
                            $(this).attr('data-error', lang.badDate);
                            addErrorMessage(lang.badDate);
                        }

                        // Birth date
                        else if (validationRules.indexOf('validate_birthdate') > -1 && !jQueryFormUtils.validateBirthdate(value)) {
                            errorInputs.push($(this));
                            $(this).attr('data-error', lang.badDate);
                            addErrorMessage(lang.badDate);
                        }

                        // Phone number
                        else if (validationRules.indexOf('validate_phone') > -1 && !jQueryFormUtils.validatePhoneNumber(value)) {
                            errorInputs.push($(this));
                            $(this).attr('data-error', lang.badTelephone);
                            addErrorMessage(lang.badTelephone);
                        }

                        // Swedish phone number
                        else if (validationRules.indexOf('validate_swemobile') > -1 && !jQueryFormUtils.validateSwedishMobileNumber(value)) {
                            errorInputs.push($(this));
                            $(this).attr('data-error', lang.badTelephone);
                            addErrorMessage(lang.badTelephone);
                        }

                        // simple spam check
                        else if (validationRules.indexOf('validate_spamcheck') > -1 && !jQueryFormUtils.simpleSpamCheck(value, validationRules)) {
                            errorInputs.push($(this));
                            $(this).attr('data-error', lang.badSecurityAnswer);
                            addErrorMessage(lang.badSecurityAnswer);
                        }

                        // Custom regexp validation
                        if (validationRules.indexOf('validate_custom') > -1 && validationRules.indexOf('regexp/') > -1) {
                            var regexp = new RegExp(validationRules.split('regexp/')[1].split('/')[0]);
                            if (!regexp.test(value)) {
                                errorInputs.push($(this));
                                $(this).attr('data-error', lang.badCustomVal);
                                addErrorMessage(lang.badCustomVal);
                            }
                        }

                        // Swedish social security number
                        if (validationRules.indexOf('validate_swesc') > -1 && !jQueryFormUtils.validateSwedishSecurityNumber(value)) {
                            errorInputs.push($(this));
                            $(this).attr('data-error', lang.badCustomVal);
                            addErrorMessage(lang.badSecurityNumber);
                        }
                        
                        // confirmation
                        if (validationRules.indexOf('validate_confirmation') > -1) {
                            var conf = '';
                            var confInput = $(form).find('input[name=' + $(this).attr('name') + '_confirmation]').eq(0);
                            if (confInput)
                                conf = confInput.val();
                            if (value != conf) {
                                errorInputs.push($(this));
                                $(this).attr('data-error', lang.notConfirmed);
                                addErrorMessage(lang.notConfirmed);
                            }
                        }
                    }
                }
            });

            
            //
            // Reset style and remove error class
            //
            $(this).find('input,textarea,select')
                    .css('border-color', jQueryFormUtils.defaultBorderColor)
                    .removeClass(config.errorElementClass);


            //
            // Remove possible error messages from last validation
            //
            if (config.errorMessagePosition == 'top')
                $('.' + config.errorMessageClass).remove();
            else
                $('.jquery_form_error_message').remove();


            //
            // Validation failed
            //
            if (errorInputs.length > 0) {

                // Apply error style to invalid inputs
                for (var i = 0; i < errorInputs.length; i++) {
                    if (config.borderColorOnError != '')
                        errorInputs[i].css('border-color', config.borderColorOnError);
                    errorInputs[i].addClass(config.errorElementClass);
                }

                // display all error messages in top of form
                if (config.errorMessagePosition == 'top') {
                    var messages = '<strong>' + lang.errorTitle + '</strong>';
                    for (var i = 0; i < errorMessages.length; i++)
                        messages += '<br />* ' + errorMessages[i];
                    $(this).children().eq(0).prepend('<p class="' + config.errorMessageClass + '">' + messages + '</p>');
                }

                // Display error message below input field
                else {
                    for (var i = 0; i < errorInputs.length; i++) {
                        var parent = errorInputs[i].parent();
                        var errorSpan = parent.find('span[class=jquery_form_error_message]');
                        if (errorSpan.length > 0)
                            errorSpan.eq(0).text(errorInputs[i].attr('data-error'));
                        else
                            parent.append('<span class="jquery_form_error_message">' + errorInputs[i].attr('data-error') + '</span>');
                    }
                }
                return false;
            }
            return true;
        },

        /**
         * Plugin for displaying input length restriction
         */
        restrictLength : function(maxLengthElement) {
            new jQueryFormUtils.lengthRestriction(this, maxLengthElement);
            return this;
        }

    });
})(jQuery);


/**
 * Namespace for helper functions
 */
var jQueryFormUtils = {};

/**
 * Static variable for holding default border color on input
 */
jQueryFormUtils.defaultBorderColor = null;

/**
 * Validate email
 * @return boolean
 */
jQueryFormUtils.validateEmail = function(email) {
    // TODO: is this regexp enough for validating email correct?
    var emailFilter = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/;
    return emailFilter.test(email);
};

/**
 * Validate phone number, at least 7 digits only one hyphen and plus allowed
 * @return boolean
 */
jQueryFormUtils.validatePhoneNumber = function(tele) {
    var numPlus = tele.match(/\+/g);
    var numHifen = tele.match(/-/g);

    if ((numPlus != null && numPlus.length > 1) || (numHifen != null && numHifen.length > 1))
        return false;
    if (numPlus != null && tele.indexOf('+') != 0)
        return false;

    tele = tele.replace(/([-|\+])/g, '');
    return tele.length > 8 && tele.match(/[^0-9]/g) == null;
};

/**
 * Validate that string is a swedish telephone number
 * @param number
 * @return boolean
 */
jQueryFormUtils.validateSwedishMobileNumber = function(number) {
    if (!jQueryFormUtils.validatePhoneNumber(number))
        return false;

    number = number.replace(/[^0-9]/g, '');
    var begin = number.substring(0, 3);

    if (number.length != 10 && begin != '467')
        return false;
    else if (number.length != 11 && begin == '467')
        return false;
    return /07[0-9{1}]/.test(begin) || (begin == '467' && number.substr(3, 1) == '0');
};

/**
 * Is this a valid birth date YYYY-MM-DD
 * @return boolean
 */
jQueryFormUtils.validateBirthdate = function(val) {
    if (!this.validateDate(val))
        return false;

    var d = new Date();
    var currentYear = d.getFullYear();
    var year = parseInt(val.substring(0, 4));

    if (year == currentYear) {
        var month = parseInt(val.substring(5, 7));
        var currentMonth = d.getMonth() + 1;
        if (month == currentMonth) {
            var day = parseInt(val.substring(8, 10));
            var currentDay = d.getDate();
            return day <= currentDay;
        }
        else
            return month < currentMonth;
    }
    else
        return year < currentYear && year > (currentYear - 122);
};

/**
 * Is it a correct date YYYY-MM-DD
 * @param string val
 * @return bool
 */
jQueryFormUtils.validateDate = function(val) {
    // enklast m�jliga...
    if (val.match(/^(\d{4})\-(\d{2})\-(\d{2})$/) == null)
        return false;

    var month = val.substring(5, 8);
    var day = val.substring(8, 11);
    month = jQueryFormUtils.parseDateInt(month);
    day = jQueryFormUtils.parseDateInt(day);

    if (month == 2 && day > 28 || month > 12 || month == 0)
        return false;
    if ((this.isShortMonth(month) && day > 30) || (!this.isShortMonth(month) && day > 31) || day == 0)
        return false;

    return true;
};

/**
 * skum fix. är talet 05 eller lägre ger parseInt rätt int annars får man 0 när man kör parseInt?
 * @param val
 */
jQueryFormUtils.parseDateInt = function(val) {
    if (val.indexOf('0') == 0)
        val = val.replace('0', '');
    return parseInt(val);
};

/**
 * Validate swedish security number yyymmddXXXX
 * @param securityNumber
 */
jQueryFormUtils.validateSwedishSecurityNumber = function(securityNumber) {
    if (!securityNumber.match(/^(\d{4})(\d{2})(\d{2})(\d{4})$/))
        return false;

    var year = RegExp.$1;
    var month = jQueryFormUtils.parseDateInt(RegExp.$2);
    var day = jQueryFormUtils.parseDateInt(RegExp.$3);
    
    // var gender = parseInt( (RegExp.$4) .substring(2,3)) % 2; ==> 1 == male && 0 == female

    var months = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
    if (year % 400 == 0 || year % 4 == 0 && year % 100 != 0)
        months[1] = 29;
    if (month < 1 || month > 12 || day < 1 || day > months[month - 1])
        return false;

    securityNumber = securityNumber.substring(2, securityNumber.length);
    var check = '';
    for (var i = 0; i < securityNumber.length; i++)
        check += ((((i + 1) % 2) + 1) * securityNumber.substring(i, i + 1));
    var checksum = 0;
    for (i = 0; i < check.length; i++)
        checksum += parseInt(check.substring(i, i + 1));

    return checksum % 10 == 0;
};

/**
 * Validate time HH:mm
 * @param string time
 * @return bool
 */
jQueryFormUtils.validateTime = function(time) {
    if (time.match(/^(\d{2}):(\d{2})$/) == null)
        return false;
    else {
        var hours = parseInt(time.split(':')[0]);
        var minutes = parseInt(time.split(':')[1]);
        if (hours > 24 || minutes > 59)
            return false;
    }
    return true;
};

/**
 * Validate float value
 * @param string val
 * @return bool
 */
jQueryFormUtils.validateFloat = function(val) {
    return val.match(/^(\-|)([0-9]+)\.([0-9]+)$/) != null;
};

/**
 * Validate that given value is a number
 * @param string val
 * @return bool
 */
jQueryFormUtils.validateInteger = function(val) {
    return val != '' && val.replace(/[0-9]/g, '') == '';
};

/**
 * Has month only 30 days?
 * @param number m
 * @return bool
 */
jQueryFormUtils.isShortMonth = function(m) {
    return (m % 2 == 0 && m < 7) || (m % 2 != 0 & m > 7);
};

/**
 * Simple spam check
 * @param string val
 * @param string classAttr
 * @return bool
 */
jQueryFormUtils.simpleSpamCheck = function(val, classAttr) {
    var answer = classAttr.match(/captcha([0-9a-z]+)/i)[1].replace('captcha', '');
    return val == answer;
};

/**
 * Validate domain name
 * @param string val
 * @return bool
 */
jQueryFormUtils.validateDomain = function(val) {
    val = val.replace('http://', '').replace('www.', '');
    var arr = new Array('.com', '.net', '.org', '.biz', '.coop', '.info', '.museum', '.name', '.pro',
                        '.edu', '.gov', '.int', '.mil', '.ac', '.ad', '.ae', '.af', '.ag', '.ai', '.al',
                        '.am', '.an', '.ao', '.aq', '.ar', '.as', '.at', '.au', '.aw', '.az', '.ba', '.bb',
                        '.bd', '.be', '.bf', '.bg', '.bh', '.bi', '.bj', '.bm', '.bn', '.bo', '.br', '.bs',
                        '.bt', '.bv', '.bw', '.by', '.bz', '.ca', '.cc', '.cd', '.cf', '.cg', '.ch', '.ci',
                        '.ck', '.cl', '.cm', '.cn', '.co', '.cr', '.cu', '.cv', '.cx', '.cy', '.cz', '.de',
                        '.dj', '.dk', '.dm', '.do', '.dz', '.ec', '.ee', '.eg', '.eh', '.er', '.es', '.et',
                        '.fi', '.fj', '.fk', '.fm', '.fo', '.fr', '.ga', '.gd', '.ge', '.gf', '.gg', '.gh',
                        '.gi', '.gl', '.gm', '.gn', '.gp', '.gq', '.gr', '.gs', '.gt', '.gu', '.gv', '.gy',
                        '.hk', '.hm', '.hn', '.hr', '.ht', '.hu', '.id', '.ie', '.il', '.im', '.in', '.io',
                        '.iq', '.ir', '.is', '.it', '.je', '.jm', '.jo', '.jp', '.ke', '.kg', '.kh', '.ki',
                        '.km', '.kn', '.kp', '.kr', '.kw', '.ky', '.kz', '.la', '.lb', '.lc', '.li', '.lk',
                        '.lr', '.ls', '.lt', '.lu', '.lv', '.ly', '.ma', '.mc', '.md', '.mg', '.mh', '.mk',
                        '.ml', '.mm', '.mn', '.mo', '.mp', '.mq', '.mr', '.ms', '.mt', '.mu', '.mv', '.mw',
                        '.mx', '.my', '.mz', '.na', '.nc', '.ne', '.nf', '.ng', '.ni', '.nl', '.no', '.np',
                        '.nr', '.nu', '.nz', '.om', '.pa', '.pe', '.pf', '.pg', '.ph', '.pk', '.pl', '.pm',
                        '.pn', '.pr', '.ps', '.pt', '.pw', '.py', '.qa', '.re', '.ro', '.rw', '.ru', '.sa',
                        '.sb', '.sc', '.sd', '.se', '.sg', '.sh', '.si', '.sj', '.sk', '.sl', '.sm', '.sn',
                        '.so', '.sr', '.st', '.sv', '.sy', '.sz', '.tc', '.td', '.tf', '.tg', '.th', '.tj',
                        '.tk', '.tm', '.tn', '.to', '.tp', '.tr', '.tt', '.tv', '.tw', '.tz', '.ua', '.ug',
                        '.uk', '.um', '.us', '.uy', '.uz', '.va', '.vc', '.ve', '.vg', '.vi', '.vn', '.vu',
                        '.ws', '.wf', '.ye', '.yt', '.yu', '.za', '.zm', '.zw', '.mobi', '.xxx');
    
    var dot = val.lastIndexOf('.');
    var domain = val.substring(0, dot);
    var ext = val.substring(dot, val.length);
    var hasTopDomain = false;

    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == ext) {
            hasTopDomain = true;
            break;
        }
    }

    if (!hasTopDomain)
        return false;
    else if (dot < 2 || dot > 57)
        return false;
    else {
        var firstChar = domain.substring(0, 1);
        var lastChar = domain.substring(domain.length - 1, domain.length);

        if (firstChar == '-' || firstChar == '.' || lastChar == '-' || lastChar == '.')
            return false;
        if (domain.split('.').length > 3 || domain.split('..').length > 1)
            return false;
        if (domain.replace(/[0-9a-z\.\-]/g, '') != '')
            return false;
    }

    return true;
};

/**
 * Validate url
 * @param string url
 * @return bool
 */
jQueryFormUtils.validateUrl = function(url) {
    var urlFilter = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return urlFilter.test(url);
};

/**
 * Restrict input length
 * @param inputElement Jquery Html object
 * @param maxLengthElement jQuery Html Object
 */
jQueryFormUtils.lengthRestriction = function(inputElement, maxLengthElement) {
    this.input = inputElement;
    this.maxLength = parseInt(maxLengthElement.text());
    var self = this;

    $(this.input).keyup(function() {
        $(this).val($(this).val().substring(0, self.maxLength));
        maxLengthElement.text(self.maxLength - $(this).val().length);
    }).focus(function() {
        $(this).keyup();
    }).keyup();
};