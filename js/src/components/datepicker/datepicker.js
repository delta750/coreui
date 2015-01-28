cui.namespace('calendar', cui.plugin);

cui.plugin.calendar = (function calendar() {
    var
        // Constants
        VERSION = {
            name: 'cui.plugin.calendar',
            version: '0.0.1',
            date: '20131008'
        },
        MONTH_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November' ,'December'],
        MSHORT_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        DAYS_WK_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        DAYS_MON = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        CULTURES = {
            USA: {
                mask: 'MM|DD|YYYY',
                delim: '/'
            },
            INT: {
                mask: 'DD|MM|YYYY',
                delim: '/'
            },
            SYS: {
                mask: 'YYYY|MM|DD',
                delim: '-'
            }
        },
        ID_PREFIXES = {
            datePicker: 'datePicker_',
            calIcon: 'cal_'
        },
        CLASSES = {
            hidden: 'hidden',
            selected: 'selected',
            invalidDate: 'invalidDate'
        },
        SELECTORS = {
            icon: '.calendar'
        },
        ICON_TOOLTIP = {
            show: 'Open the calendar popup',
            hide: 'Close the calendar popup'
        },
        OPTIONS_TOOLTIP = {
            show: 'Open options',
            hide: 'Close options'
        },

        // Common element caches
        $body,
        $window,

        // Private API
        _priv = {},
        _events = {},
        _imgPath = cui.environment.getImagesPath('components') + 'datepicker/',
        _defaultSettings = {
            datePickers: [
                {
                    inputId: '',
                    culture: 'USA',
                    minDate: '01/01/1950',
                    maxDate: '12/31/2150',
                    display: {
                        theme: 0,
                        autoError: false,
                        enableBoundaryDetection: true
                    }
                }
            ]
        },
        _mySettings = {
            datePickers: []
        },

        /**
         * Initialize all calendar icons on the page
         */
        _init = function _init() {
            // Cache common elements
            $body = $('body');
            $window = $(window);

            // Add click event on calendar icons
            $body.on('click', SELECTORS.icon, _events._iconClick);

            // Add events to date inputs
            $(SELECTORS.icon).each(function() {
                var $icon = $(this),
                    $input = $('#' + (this.id.substring(this.id.indexOf(ID_PREFIXES.calIcon) + 4)));

                if ($input.length) {
                    $input.on('blur', _events._inputBlur);
                }

                $icon.attr('title', ICON_TOOLTIP.show);
            });

            // add body.click
            $body.on('click', _events._bodyClick);

            // add window.resize
            $window.on('resize', _events._windowResize);
        },

        _setImagesPath = function _setImagesPath(url) {
            if (url && typeof url === 'string' && $.trim(url).length > 0) {
                _imgPath = url;
            }
        },

        _customize = function _customize(settings) {
            var minDefaultDate = new Date(_defaultSettings.datePickers[0].minDate),
                maxDefaultDate = new Date(_defaultSettings.datePickers[0].maxDate),
                dp, i, j, k;

            // check if any settings are passed
            if (settings && typeof settings === 'object') {
                i = settings.datePickers.length;

                while (j < i) {
                    dp = settings.datePickers[j];

                    if (dp && dp.inputId) {
                        if ($.trim(dp.inputId).length > 0) {
                            // check if display was passed, else add it
                            if (!dp.display) {
                                dp.display = {};
                            }

                            // if id exists, add to mySettings
                            _mySettings.datePickers[k] = {
                                inputId: dp.inputId,
                                culture: dp.culture || _defaultSettings.datePickers[0].culture,
                                minDate: dp.minDate || _priv._setDateToCulture({day: minDefaultDate.getDate(), month: (minDefaultDate.getMonth()+1), year: minDefaultDate.getFullYear()}, dp.inputId, CULTURES[dp.culture]),
                                maxDate: dp.maxDate || _priv._setDateToCulture({day: maxDefaultDate.getDate(), month: (maxDefaultDate.getMonth()+1), year: maxDefaultDate.getFullYear()}, dp.inputId, CULTURES[dp.culture]),
                                display: {
                                    theme: dp.display.theme || _defaultSettings.datePickers[0].display.theme,
                                    autoError: dp.display.autoError || _defaultSettings.datePickers[0].display.autoError,
                                    enableBoundaryDetection: dp.display.enableBoundaryDetection || _defaultSettings.datePickers[0].display.enableBoundaryDetection
                                }
                            };

                            k += 1;
                        }
                    }

                    j += 1;
                }
            }
        },

        /* _getVersion */
        _getVersion = function _getVersion() {
            return VERSION || '';
        },

        /* _hideAll */
        _hideAll = function _hideAll() {
            _priv._hideAllDatePickers();
        };

    /////////////////////
    // Private methods //
    /////////////////////

    _priv._getSettings = function _getSettings(inputId) {
        var i = _mySettings.datePickers.length;

        // make sure custom settings were set, else return default
        if (i === 0) {
            return _defaultSettings.datePickers[0];
        }

        while ((i -= 1) >= 0) {
            // find custom settings and return those if match
            if (_mySettings.datePickers[i].inputId === inputId) {
                return _mySettings.datePickers[i];
            }
        }

        // return default settings
        return _defaultSettings.datePickers[0];
    };

    _priv._showHideDatePicker = function _showHideDatePicker(calIcon, cal, forceHide) {
        var inputId = calIcon.id.substring(calIcon.id.indexOf(ID_PREFIXES.calIcon) + 4);

        forceHide = forceHide || false;

        // Check if calendar already exists for this associated control
        if (cal) {

            // If it exists, show it or hide it
            if ($(cal).hasClass(CLASSES.hidden) && !forceHide) {
                // Refresh calendar
                cal = _priv._refreshDatePickerHtml(cal);

                // Position calendar
                _priv._setDatePickerPosition(cal);

                _priv._showDatePicker(cal);

                if (_priv._getSettings(inputId).display.enableBoundaryDetection) {
                    _priv._handleBoundaryDetection(cal);
                }

                $('#dpCalWrap_' + inputId).focus();
            }
            else {
                _priv._hideDatePicker(cal);

                $(calIcon).focus();
            }
        }
        else {
            cal = _priv._createDatePicker(calIcon);

            // Position calendar
            _priv._setDatePickerPosition(cal);

            if (_priv._getSettings(inputId).display.enableBoundaryDetection) {
                _priv._handleBoundaryDetection(cal);
            }

            $('#dpCalWrap_' + inputId).focus();

            calIcon.title = ICON_TOOLTIP.hide;
        }
    };

    /**
     * Creates a new date picker for a given icon and adds it to the DOM
     * @param   {Element}  elem  Icon element
     * @return  {Element}        Date picker element
     */
    _priv._createDatePicker = function _createDatePicker(elem) {
        var inputId = elem.id.substring(elem.id.indexOf(ID_PREFIXES.calIcon) + 4),
            $cal = $('<div/>');

        $cal
            .attr('id', ID_PREFIXES.datePicker + inputId)
            .attr('style', 'inline-block')
            .addClass('dp')
            .html(_priv._getDatePickerHtml(_priv._getDatePickerInitialDate(inputId), inputId));

        $body.append($cal);

        // Add click event to calendar and use delegation to handle clicks on it
        $body
            .on('click', '.dp', _events._calClick)
            .on('dblclick', '.dp', _events._calClick)
            // Add keydown event to handle keystrokes like 'esc'
            .on('keydown', '.dp', _events._calKeydown);

        return $cal.get(0);
    };

    _priv._refreshDatePickerHtml = function _refreshDatePickerHtml(cal) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1));

        cal.innerHTML = _priv._getDatePickerHtml(_priv._getDatePickerInitialDate(inputId), inputId);
        return cal;
    };

    _priv._getDatePickerHtml = function _getDatePickerHtml(dmyCal, inputId) {
        var html = '',
            calDate = null,
            weekday = -1,
            lastDayMonth = 0,
            lastDayPrevMonth = 0,
            prevMon = 0,
            prevYr = 0,
            nextMon = 0,
            nextYr = 0,
            i = 0,
            rows = 0;
            daysCnt = 0,
            titleDate = null,
            today = new Date(),

            __getDayTitle = function __getDayTitle(date) {
                return DAYS_WK_EN[date.getDay()] + ', ' + MONTH_EN[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
            };

        dmyCal = _priv._convertDMYToNumeric(dmyCal);

        // Calendar wrapper
        // ---------------------------
        html += '<div id="dpCalWrap_' + inputId + '" class="dpCalWrap" tabindex="1"><div class="dpCal">';

        // Calendar main
        // ---------------------------
        // Header
        html += _priv._getHeaderHtml(dmyCal, inputId);

        // Body
        // One-letter abbreviation for each single day
        html += '<div class="dpBody"><div class="dpDayDesc"><ul><li>S</li><li>M</li><li>T</li><li>W</li><li>T</li><li>F</li><li>S</li></ul></div><div class="dpWeekNbrDays">';

        // Days
        html += '<div class="dpDays"><ul>';

        // Calculate the day where the 1st of the month falls
        calDate = new Date(dmyCal.month.toString() + '/01/' + dmyCal.year.toString());
        weekday = calDate.getDay();

        // Calculate the last day of the month
        lastDayMonth = _priv._getLastDayOfMonth(calDate);

        // Get next and previous months/year
        nextMon = dmyCal.month + 1;
        nextYr = dmyCal.year;
        if (dmyCal.month === 1) {
            prevMon = 12;
            prevYr = dmyCal.year - 1;
        }
        else {
            prevMon = dmyCal.month - 1;
            prevYr = dmyCal.year;
            if (nextMon > 12) {
                nextMon = 1;
                nextYr += 1;
            }
        }

        // Calculate the last day of the previous month if applicable
        lastDayPrevMonth = _priv._getLastDayOfMonth(new Date(prevMon + '/01/' + prevYr));

        // Start with previous month days when applicable
        // If the first of the month falls on a Sunday, add one extra row with previous month's days
        if (weekday === 0) {
            weekday = 7;
        }

        while (weekday > 0) {
            // Counts the number of days used in row (1...7)
            daysCnt += 1;

            html += '<li class="prevMonthDay';

            if (i === 0) {
                html += ' newLine';
                rows += 1;
                i += 1;
            }

            // Validate date and show as clickable or read-only
            titleDate = new Date(prevMon + '/' + (lastDayPrevMonth - weekday + 1) + '/' + prevYr);
            if (_priv._validateMinMaxRange({day: (lastDayPrevMonth - weekday + 1), month: prevMon, year: prevYr}, inputId)) {
                html += '"><a href="#" title="' + __getDayTitle(titleDate) + '" tabindex="1">' + (lastDayPrevMonth - weekday + 1) + '</a></li>';
            }
            else {
                html += '"><span class="disabled">' + (lastDayPrevMonth - weekday + 1) + '</span></li>';
            }

            weekday -= 1;
        }
        i = 0;

        // Month"s days
        while (i < lastDayMonth) {
            // Counts the number of days used in row (1...7)
            daysCnt += 1;

            html += '<li class="';

            if (daysCnt === 8) {
                html += 'newLine';
                rows += 1;
                daysCnt = 1;
            }

            // Check if today's date falls into this month
            if (today.getDate() === (i + 1) && today.getMonth() === (dmyCal.month - 1) && today.getFullYear() === dmyCal.year) {
                html += ' today';
            }

            // Check if there is a selected day
            dateParsed = _priv._processDate($.trim(document.getElementById(inputId).value), inputId);
            if (dateParsed.valid) {
                if (parseInt(dateParsed.dmy.day, 10) === (i + 1) && parseInt(dateParsed.dmy.month, 10) === dmyCal.month && parseInt(dateParsed.dmy.year, 10) === dmyCal.year) {
                    html += ' selectedDay';
                }
            }

            // Validate date and show as clickable or read-only
            titleDate = new Date(dmyCal.month.toString() + '/' + (i + 1) + '/' + dmyCal.year.toString());
            if (_priv._validateMinMaxRange({day: (i + 1), month: dmyCal.month, year: dmyCal.year}, inputId)) {
                html += '"><a href="#" title="' + __getDayTitle(titleDate) + '" tabindex="1">' + (i + 1) + '</a></li>';
            }
            else {
                html += '"><span class="disabled">' + (i + 1) + '</span></li>';
            }

            i += 1;
        }
        i = 0;

        // Next month's day when applicable
        if (daysCnt === 7) {
            daysCnt = 0;
        }
        while (daysCnt < 7) {
            html += '<li class="nextMonthDay';

            if (daysCnt === 0) {
                html += ' newLine';
                rows += 1;
            }

            // Validate date and show as clickable or read-only
            titleDate = new Date(nextMon + '/' + (i + 1) + '/' + nextYr);
            if (_priv._validateMinMaxRange({day: (i + 1), month: nextMon, year: nextYr}, inputId)) {
                html += '"><a href="#" title="' + __getDayTitle(titleDate) + '" tabindex="1">' + (i + 1) + '</a></li>';
            }
            else {
                html += '"><span class="disabled">' + (i + 1) + '</span></li>';
            }

            daysCnt += 1;
            i += 1;

            if (daysCnt === 7 && rows < 6) {
                // Add extra row to keep consistent 6-row calendar
                daysCnt = 0;
            }
        }
        i = 0;

        // Footer
        html += '</ul></div></div><div class="dpFoot"></div></div></div>';

        // Calendar shadow
        html += '<div class="dpCalShadow"></div></div>';

        // Options
        // ---------------------------
        html += '<div id="dpOptions_' + inputId + '" class="dpOptWrap hidden" tabindex="1">';

        // Months
        html += '<div class="dpOpt"><div class="dpMon">' + _priv._setOptionsMonths(dmyCal, inputId) + '</div>';

        // Years
        html += '<div class="dpYr">' + _priv._setOptionsYears(dmyCal, inputId) + '</div>';

        // Other
        html += '<div id="dpOther_' + inputId + '" class="dpOther"><div class="dpOtherL"><a href="#" title="Today" tabindex="1">Today</a></div><div class="dpOtherR"><a href="#" id="dpOK_' + inputId + '" title="OK" tabindex="1">OK</a><a href="#" title="Cancel" tabindex="1">Cancel</a></div></div>';

        // Options shadow
        html += '</div><div class="dpOptShadow"></div></div></div>';

        return html;
    };

    _priv._getHeaderHtml = function _getHeaderHtml(dmyCal, inputId) {
        var html = '',
            settings = _priv._getSettings(inputId),
            minDate = _priv._parseDateStringToDateObject(settings.minDate, inputId),
            maxDate = _priv._parseDateStringToDateObject(settings.maxDate, inputId);

        html = '<div class="dpHead">';

        // Previous navigation items
        if (dmyCal.month === (minDate.getMonth() + 1) && dmyCal.year === minDate.getFullYear()) {
            html += '<ul class="lIcons"><li><span class="grayedOut"><img src="' + _imgPath + 'CalendarPreviousQuarter.png" alt="Previous quarter"></span></li><li><span class="grayedOut"><img src="' + _imgPath + 'CalendarPreviousMonth.png" alt="Previous month"></span></li></ul>';
        }
        else {
            html += '<ul class="lIcons"><li><a href="#" class="fastNavPrevQtr" title="Previous quarter" tabindex="1"><img src="' + _imgPath + 'CalendarPreviousQuarter.png" alt="Previous quarter"></a></li><li><a href="#" class="navPrevMon" title="Previous month" tabindex="1"><img src="' + _imgPath + 'CalendarPreviousMonth.png" alt="Previous month"></a></li></ul>';
        }

        // Month year
        html += '<div class="title"><a href="#" class="monthYear" title="' + OPTIONS_TOOLTIP.show + '" tabindex="1">' + MONTH_EN[dmyCal.month - 1] + ' ' + dmyCal.year.toString()  + '</a><input type="hidden" id="dpSel_' + inputId + '" value="' + dmyCal.month.toString() + '/' + dmyCal.year.toString() + '"></div>';

        // Next navigation items
        if (dmyCal.month === (maxDate.getMonth() + 1) && dmyCal.year === maxDate.getFullYear()) {
            html += '<ul class="rIcons"><li><span class="grayedOut"><img src="' + _imgPath + 'CalendarNextMonth.png" alt="Next month"></span></li><li><span class="grayedOut"><img src="' + _imgPath + 'CalendarNextQuarter.png" alt="Next quarter"></span></li></ul>';
        }
        else {
            html += '<ul class="rIcons"><li><a href="#" class="navNextMon" title="Next month" tabindex="1"><img src="' + _imgPath + 'CalendarNextMonth.png" alt="Next month"></a></li><li><a href="#" class="fastNavNextQtr" title="Next quarter" tabindex="1"><img src="' + _imgPath + 'CalendarNextQuarter.png" alt="Next quarter"></a></li></ul>';
        }

        html += '</div>';

        return html;
    };

    _priv._setDatePickerPosition = function _setDatePickerPosition(cal) {
        var input = document.getElementById(cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1))),
            inputParent = null,
            coord = [],
            offset,
            borderTop = 0,
            borderBottom = 0;

        if (input) {
            // Using the parent help us determine the (x,y) for calendar
            inputParent = input.parentNode;

            // Parent must be positioned at least relative
            inputParent.style.position = 'relative';

            // Get parent's coordinates
            offset = $(inputParent).offset();
            coord = [offset.left, offset.top];

            // Set 'x' value to calendar
            cal.style.left = coord[0] + 'px';

            // Calculate 'y' value
            borderTop = parseInt($(input).css('border-top-width'), 10);
            borderBottom = parseInt($(input).css('border-bottom-width'), 10);

            // Set 'y' value to calendar
            cal.style.top = (coord[1] + input.clientHeight + borderTop + borderBottom + input.offsetTop) + 'px';
        }
    };

    _priv._showDatePicker = function _showDatePicker(cal) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.calIcon + '_') + (ID_PREFIXES.calIcon.length + 1));

        $(cal).removeClass(CLASSES.hidden);

        $('#' + ID_PREFIXES.calIcon + inputId).attr('title', ICON_TOOLTIP.hide);
    };

    _priv._hideDatePicker = function _hideDatePicker(cal) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.calIcon + '_') + (ID_PREFIXES.calIcon.length + 1));

        $(cal).addClass(CLASSES.hidden);

        $('#' + ID_PREFIXES.calIcon + inputId).attr('title', ICON_TOOLTIP.show);
    };

    _priv._hideAllDatePickers = function _hideAllDatePickers(inputId) {
        if (!inputId || typeof inputId !== 'string') {
            inputId = '';
        }

        $('div.dp').each(function() {
            var $cal = $(this);

            if (this.id !== (ID_PREFIXES.datePicker + inputId)) {
                if (!$cal.hasClass(CLASSES.hidden)) {
                    $cal.addClass(CLASSES.hidden);

                    document.getElementById(ID_PREFIXES.calIcon + this.id.substring(this.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1))).title = ICON_TOOLTIP.show;
                }
            }
        });
    };

    _priv._showHideOptions = function _showHideOptions(elem, opts, forceHide) {
        var inputId = opts.id.substring(opts.id.indexOf('_') + 1),
            $opts = $(opts),
            cal = document.getElementById(ID_PREFIXES.datePicker + inputId),
            monthYear = _priv._getMonthYearFromCalHeader(cal);

        forceHide = forceHide || false;

        if ($opts.hasClass(CLASSES.hidden) && !forceHide) {
            // get current month and year in calendar and set hidden in case they changed
            document.getElementById('selMon_' + inputId).value = monthYear[0];
            document.getElementById('selYr_' + inputId).value = monthYear[1];

            // then refresh options to have selected month/year
            $opts.find('div.dpMon').html(_priv._setOptionsMonths(_priv._convertDMYToNumeric({day: 1, month: monthYear[0], year: monthYear[1]}), inputId));

            $opts.find('div.dpYr').html(_priv._setOptionsYears(_priv._convertDMYToNumeric({day: 1, month: monthYear[0], year: monthYear[1]}), inputId));

            _priv._positionOptions(elem, opts);

            elem.title = OPTIONS_TOOLTIP.hide;

            _priv._showOptions(opts);

            if (_priv._getSettings(inputId).display.enableBoundaryDetection) {
                _priv._handleBoundaryDetection(opts);
            }

            $opts.focus();
        }
        else {
            elem.title = OPTIONS_TOOLTIP.show;

            _priv._hideOptions(opts);

            $(elem).focus();
        }
    };

    _priv._setOptionsSelectedMonth = function _setOptionsSelectedMonth(elem, opts, cal) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1)),
            selMonth = document.getElementById('selMon_' + inputId);

        // Unhighlight all months
        $(opts).find('a, span.disabled').each(function() {
            $(this).parent().removeClass(CLASSES.selected);
        });

        // Highlight selected month
        $(elem).parent().addClass(CLASSES.selected);

        selMonth.value = _priv._getMonthValFromShortStr(elem.innerHTML);
    };

    _priv._setOptionsSelectedYear = function _setOptionsSelectedYear(elem, opts, cal) {
        var yr = elem.innerHTML,
            inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1)),
            selMonth = document.getElementById('selMon_' + inputId),
            selYear = document.getElementById('selYr_' + inputId),
            divMonths = $('#dpOptions_' + inputId + ' div.dpMon').get(0);

        // Unhighlight all years
        $(opts).find('a').each(function() {
            $(this).parent().removeClass(CLASSES.selected);
        });

        // Highlight selected year
        $(elem).parent().addClass(CLASSES.selected);

        selYear.value = yr;

        // Make sure only proper months are available for selected yr
        divMonths.innerHTML = _priv._setOptionsMonths(_priv._convertDMYToNumeric({day: 1, month: selMonth.value, year: yr}), inputId);
    };

    _priv._setOptionsYears = function _setOptionsYears(dmyCal, inputId) {
        var html = '',
            i = 0,
            selYear = document.getElementById('selYr_' + inputId);

        dmyCal.year = parseInt(dmyCal.year, 10);

        if (selYear) {
            selYear = parseInt(selYear.value, 10);
        }
        else {
            selYear = dmyCal.year;
        }

        html += '<ul>';

        while (i < 10) {
            html += '<li class="';
            if ((i % 2) === 0) {
                html += 'newLine';
            }

            if ((dmyCal.year - (5 - i)) === selYear) {
                html += ' selected';
            }

            // Validate date and show as clickable or read-only
            if (_priv._validateMinMaxRange({day: 0, month: 0, year: (dmyCal.year - (5 - i))}, inputId)) {
                html += '"><a href="#" title="' + (dmyCal.year - (5 - i)) + '" tabindex="1">' + (dmyCal.year - (5 - i)) + '</a>';
            }
            else {
                html += '"><span class="disabled">' + (dmyCal.year - (5 - i)) + '</span>';
            }

            // Set hidden for efficiency on navigation purposes
            if (i === 0) {
                html += '<input type="hidden" id="startOptYr_' + inputId + '" value="' + (dmyCal.year - (5 - i)) + '"></li>';
            }
            else if (i === 9) {
                html += '<input type="hidden" id="endOptYr_' + inputId + '" value="' + (dmyCal.year - (5 - i)) + '"></li>';
            }
            else {
                html += '</li>';
            }
            i += 1;
        }

        // Option"s actions
        if (_priv._validateMinMaxRange({day: 0, month: 0, year: (dmyCal.year - 6)}, inputId)) {
            html += '<li class="newLine"><a href="#" class="fastNavPrevYrs" title="Previous years" tabindex="1"><img src="' + _imgPath + 'CalendarPreviousQuarter.png" alt="Previous years"></a></li>';
        }
        else {
            html += '<li class="newLine"><span class="grayedOut"><img src="' + _imgPath + 'CalendarPreviousQuarter.png" alt="Previous years"></span></li>';
        }

        if (_priv._validateMinMaxRange({day: 0, month: 0, year: (dmyCal.year + 5)}, inputId)) {
            html += '<li><a href="#" class="fastNavNextYrs" title="Next years" tabindex="1"><img src="' + _imgPath + 'CalendarNextQuarter.png" alt="Next years"></a></li>';
        }
        else {
            html += '<li><span class="grayedOut"><img src="' + _imgPath + 'CalendarNextQuarter.png" alt="Next years"></span></li>';
        }

        html += '</ul><input type="hidden" id="selYr_' + inputId + '" value="' + selYear.toString() + '">';

        return html;
    };

    _priv._setOptionsMonths = function _setOptionsMonths(dmyCal, inputId) {
        var html ='',
            i = 0,
            selMonth = document.getElementById('selMon_' + inputId);

        if (selMonth) {
            selMonth = parseInt(selMonth.value, 10);
        }
        else {
            selMonth = dmyCal.month;
        }

        html += '<ul>';

        // Add available months
        while (i < 12) {
            html += '<li class="';
            if ((i % 2) === 0) {
                html += 'newLine';
            }

            // If month is 0, ignore highlighting keep current one
            if ((i + 1) === selMonth) {
                html += ' selected';
            }

            // Validate date and show as clickable or read-only
            if (_priv._validateMinMaxRange({day: 1, month: (i + 1), year: dmyCal.year}, inputId) || _priv._validateMinMaxRange({day: _priv._getLastDayOfMonth(new Date((i + 1) + '/01/' + dmyCal.year)), month: (i + 1), year: dmyCal.year}, inputId)) {
                html += '"><a href="#" title="' + MONTH_EN[i] + '" tabindex="1">' + MSHORT_EN[i] + '</a></li>';
            }
            else {
                html += '"><span class="disabled">' + MSHORT_EN[i] + '</span></li>';
            }

            i += 1;
        }

        html += '</ul><input type="hidden" id="selMon_' + inputId + '" value="' + selMonth.toString() + '">';

        return html;
    };

    _priv._positionOptions = function _positionOptions(elem, option) {
        // Set 'x' and 'y' value to options
        option.style.left = parseInt(elem.offsetLeft + (elem.clientWidth / 2), 10) + 'px';
        option.style.top = elem.clientHeight + 'px';
    };

    _priv._showOptions = function _showOptions(opts) {
        $(opts).removeClass(CLASSES.hidden);
    };

    _priv._hideOptions = function _hideOptions(opts) {
        $(opts).addClass(CLASSES.hidden);
    };

    _priv._handleBoundaryDetection = function _handleBoundaryDetection(elem) {
        var bodyElem = document.body,
            scrollLeft = bodyElem.scrollLeft,
            scrollTop = bodyElem.scrollTop,
            viewportHeight = window.innerHeight || document.body.parentElement.offsetHeight;

        // Get scrollbar positions
        if (scrollTop === 0) {
            if (bodyElem.parentElement.scrollTop !== 0) {
                scrollTop = bodyElem.parentElement.scrollTop;
            }
        }
        if (scrollLeft === 0) {
            if (bodyElem.parentElement.scrollLeft !== 0) {
                scrollLeft = bodyElem.parentElement.scrollLeft;
            }
        }

        // Vertical boundary top
        if ((viewportHeight - (elem.parentNode.offsetTop + 1) - (elem.offsetTop - scrollTop) - 20) < elem.clientHeight) {
            window.scrollBy(0, elem.clientHeight - (viewportHeight - (elem.parentNode.offsetTop + 1) - (elem.offsetTop - scrollTop) - 20));
        }

        // Horizontal boundary left
        if ((bodyElem.clientWidth - (elem.offsetLeft + elem.parentNode.offsetLeft) + scrollLeft - 5) < elem.clientWidth) {
            window.scrollBy(elem.clientWidth - (bodyElem.clientWidth - (elem.offsetLeft + elem.parentNode.offsetLeft) + scrollLeft) + 5, 0);
        }

        // Horizontal boundary right
        if (scrollLeft - elem.offsetLeft - elem.parentNode.offsetLeft + 5 > 0) {
            window.scrollBy(-1 * (scrollLeft - elem.offsetLeft - elem.parentNode.offsetLeft + 5), 0);
        }
    };

    _priv._getMonthValFromLongStr = function _getMonthValFromLongStr(monthStr) {
        var i = MONTH_EN.length;

        while ((i -= 1) >= 0) {
            if (monthStr === MONTH_EN[i]) {
                i += 1;
                break;
            }
        }

        return i;
    };

    _priv._getMonthValFromShortStr = function _getMonthValFromShortStr(monthStr) {
        var i = MSHORT_EN.length;

        while ((i -= 1) >= 0) {
            if (monthStr === MSHORT_EN[i]) {
                i += 1;
                break;
            }
        }

        return i;
    };

    _priv._getMonthYearFromCalHeader = function _getMonthYearFromCalHeader(cal) {
        var monthYear = $(cal).find('a.monthYear').get(0),
            splitMonYr = monthYear.innerHTML.split(' '),
            mon = _priv._getMonthValFromLongStr(splitMonYr[0]),
            yr = splitMonYr[1];

        return [mon, yr];
    };

    _priv._getLastDayOfMonth = function _getLastDayOfMonth(date) {
        var mon = date.getMonth() + 1,
            lastDayMonth = 0,
            dateTest = null;

        lastDayMonth = DAYS_MON[mon - 1];
        // Check for leap year
        if (mon === 2) {
            dateTest = new Date('02/29/' + date.getFullYear());
            if ((dateTest.getMonth() + 1) === mon) {
                lastDayMonth += 1;
            }
        }

        return lastDayMonth;
    };

    _priv._getDatePickerInitialDate = function _getDatePickerInitialDate(inputId) {
        var input = document.getElementById(inputId),
            // Returns date as 'Month Year'
            __buildCalDate = function __buildCalDate(dateParsed) {
                // local variables
                var date = null;

                if (!dateParsed.valid) {
                    date = new Date();
                }
                else {
                    date = new Date(dateParsed.dmy.month + '/' + dateParsed.dmy.day + '/' + dateParsed.dmy.year);
                }
                return {
                    day: date.getDate(),
                    month: date.getMonth() + 1,
                    year: date.getFullYear()
                };
            };

        if (input) {
            // Clean and validate date
            return __buildCalDate(_priv._processDate($.trim(input.value), inputId));
        }
    };

    _priv._getFormattedDate = function _getFormattedDate(dateStr, inputId) {
        var dateParsed = {};

        // Validate date
        dateParsed = _priv._processDate($.trim(dateStr), inputId);
        if (dateParsed.valid) {
        return dateParsed.stringValue;
        }

        return null;
    };

    _priv._processDate = function _processDate(dateStr, inputId) {
        var dateParsed = {
                valid: false,
                dmy: {},
                stringValue: ''
            },
            splitDate = {},
            dateTest = null,
            settings = _priv._getSettings(inputId);

        dateParsed.stringValue = dateStr;

        // Get day, month and year separate
        splitDate = _priv._getDateFromCulture(dateStr, inputId);

        dateParsed.dmy = splitDate.dmy;
        dateParsed.stringValue = splitDate.ordered[0] + CULTURES[settings.culture].delim + splitDate.ordered[1] + CULTURES[settings.culture].delim + splitDate.ordered[2];

        // Normalized date string (0d/0m/yyyy)
        dateStr = dateParsed.stringValue;

        // Validate
        if (dateStr.length === CULTURES[settings.culture].mask.length) {
            dateTest = new Date(dateParsed.dmy.month + '/' + dateParsed.dmy.day + '/' + dateParsed.dmy.year);

            // Month has to match otherwise either day of month are invalid (checks for leap year)
            if (parseInt(dateParsed.dmy.month, 10) === (dateTest.getMonth() + 1)) {
                dateParsed.valid = _priv._validateMinMaxRange(_priv._convertDMYToNumeric(dateParsed.dmy), inputId);
            }
        }

        return dateParsed;
    };

    _priv._convertDMYToNumeric = function _convertDMYToNumeric(dmy) {
        return {day: parseInt(dmy.day, 10), month: parseInt(dmy.month, 10), year: parseInt(dmy.year, 10)};
    };

    _priv._validateMinMaxRange = function _validateMinMaxRange(dmyCal, inputId) {
        var settings = _priv._getSettings(inputId),
            minDate = _priv._parseDateStringToDateObject(settings.minDate, inputId),
            maxDate = _priv._parseDateStringToDateObject(settings.maxDate, inputId),
            dateTest = null;

        if (dmyCal.day === 0 && dmyCal.month === 0) {
            // Validate year only
            if (dmyCal.year >= minDate.getFullYear() && dmyCal.year <= maxDate.getFullYear()) {
                return true;
            }
        }
        else {
            dateTest = new Date(dmyCal.month + '/' + dmyCal.day + '/' + dmyCal.year);
            if (dateTest >= minDate && dateTest <= maxDate) {
                return true;
            }
        }

        return false;
    };

    _priv._getDateFromCulture = function _getDateFromCulture(dateStr, inputId) {
        var dateParsed = {
                dmy: {
                    day: '',
                    month: '',
                    year: ''
                },
                ordered: []
            },
            day = '',
            mon = '',
            yr = '',
            settings = _priv._getSettings(inputId),
            dateSplit = dateStr.split(CULTURES[settings.culture].delim),
            maskSplit = CULTURES[settings.culture].mask.split('|'),
            i = dateSplit.length,
            j = 0;

        // Date split and mask split must match in length
        if (i === maskSplit.length) {
            // Get day, month and year and add to [day, mon, yr] array
            while (j < i) {
                switch (maskSplit[j]) {
                    case 'DD':
                        day = parseInt(dateSplit[j], 10);
                        if (!isNaN(day)) {
                            if (day < 10) {
                                dateParsed.dmy.day = '0' + day;
                            }
                            else {
                                dateParsed.dmy.day = day.toString();
                            }
                            dateParsed.ordered[j] = dateParsed.dmy.day;
                        }

                        break;
                    case 'MM':
                        mon = parseInt(dateSplit[j], 10);
                        if (!isNaN(mon)) {
                            if (mon < 10) {
                                dateParsed.dmy.month = '0' + mon;
                            }
                            else {
                                dateParsed.dmy.month = mon.toString();
                            }
                            dateParsed.ordered[j] = dateParsed.dmy.month;
                        }
                        break;
                    case 'YYYY':
                        yr = parseInt(dateSplit[j], 10);
                        if (!isNaN(yr)) {
                            dateParsed.dmy.year = yr.toString();
                            dateParsed.ordered[j] = dateParsed.dmy.year;
                        }
                        break;
                    default:
                        break;
                }

                j += 1;
            }
        }

        return dateParsed;
    };

    _priv._parseDateStringToDateObject = function _parseDateStringToDateObject(dateStr, inputId) {
        var dateDMY = _priv._getDateFromCulture(dateStr, inputId);

        return new Date(dateDMY.dmy.month + '/' + dateDMY.dmy.day + '/' + dateDMY.dmy.year);
    };

    _priv._setDateToCulture = function _setDateToCulture(dmyCal, inputId, culture) {
        if (typeof culture === 'undefined') {
            return _priv._setDateToSelectedCulture(dmyCal, inputId, CULTURES[_priv._getSettings(inputId).culture]);
        }
        else {
            return _priv._setDateToSelectedCulture(dmyCal, inputId, culture);
        }
    };

    _priv._setDateToSelectedCulture = function _setDateToSelectedCulture(dmyCal, inputId, culture) {
        var maskSplit = culture.mask.split('|'),
            i = maskSplit.length,
            j = 0,
            dateStr = '';

        // Set day, month and year as a string date based on the culture's date
        while (j < i) {
            switch (maskSplit[j]) {
                case 'DD':
                    dateStr += dmyCal.day.toString() + culture.delim;
                    break;
                case 'MM':
                    dateStr += dmyCal.month.toString() + culture.delim;
                    break;
                case 'YYYY':
                    dateStr += dmyCal.year.toString() + culture.delim;
                    break;
                default:
                    break;
            }

            j += 1;
        }

        return dateStr.substring(0, dateStr.length - 1);
    };

    _priv._runOptionsActions = function _runOptionsActions(elem, opts, cal) {
        var actions = $(opts).find('a'),
            i = actions.length,
            j = 0;

        while (j < i) {
            if (actions.get(j) === elem) {
                switch (j) {
                    case 0:
                        _priv._runOptionsToday(cal);
                        break;

                    case 1:
                        _priv._runOptionsOK(cal);
                        break;

                    case 2:
                        _priv._runOptionsClose(cal);
                        break;

                    default:
                        break;
                }

                break;
            }

            j += 1;
        }
    };

    _priv._runOptionsToday = function _runOptionsToday(cal) {
        _priv._setSelectedDate(null, cal);
    };

    _priv._runOptionsOK = function _runOptionsOK(cal) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1)),
            selMonth = document.getElementById('selMon_' + inputId),
            selYear = document.getElementById('selYr_' + inputId),
            settings = _priv._getSettings(inputId),
            minDate = _priv._parseDateStringToDateObject(settings.minDate, inputId),
            maxDate = _priv._parseDateStringToDateObject(settings.maxDate, inputId),
            dateTest = new Date(selMonth.value + '/01/' + selYear.value);

        // Check if month is available for year selected, else default to minDate/maxDate's month
        if (!_priv._validateMinMaxRange(_priv._convertDMYToNumeric({day: 1, month: selMonth.value, year: selYear.value}), inputId)) {
            if (dateTest < minDate) {
                selMonth.value = minDate.getMonth() + 1;
            }
            else if (dateTest > maxDate) {
                selMonth.value = maxDate.getMonth() + 1;
            }
        }

        cal.innerHTML = _priv._getDatePickerHtml(
                            _priv._convertDMYToNumeric(
                                {
                                    day: 1,
                                    month: selMonth.value,
                                    year: selYear.value
                                }
                            ), inputId);

        _priv._runOptionsClose(cal);
    };

    _priv._runOptionsClose = function _runOptionsClose(cal) {
        _priv._showHideOptions($(cal).find('a.monthYear').get(0), document.getElementById('dpOptions_' + cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1))), true);
    };

    _priv._getSelectedDate = function _getSelectedDate(elem, cal) {
        var dmyCal = {},
            inputId = '',
            hidden = null,
            splitHdn = [],
            $parent,
            todaysDate = new Date();

        if (elem) {
            // Get date from calendar click
            inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1));
            hidden = document.getElementById('dpSel_' + inputId);
            splitHdn = hidden.value.split('/');
            dmyCal = {
                day: parseInt(elem.innerHTML, 10),
                month: parseInt(splitHdn[0], 10),
                year: parseInt(splitHdn[1], 10)
            };

            $parent = $(elem.parentNode);

            if ($parent.hasClass('prevMonthDay')) {
                dmyCal.month -= 1;

                if (dmyCal.month < 1) {
                    dmyCal.month = 12;
                    dmyCal.year -= 1;
                }
            }
            else if ($parent.hasClass('nextMonthDay')) {
                dmyCal.month += 1;

                if (dmyCal.month > 12) {
                    dmyCal.month = 1;
                    dmyCal.year += 1;
                }
            }
        }
        else {
            // Use today's date
            dmyCal = {day: todaysDate.getDate(), month: todaysDate.getMonth() + 1, year: todaysDate.getFullYear()};
        }

        return dmyCal;
    };

    _priv._setSelectedDate = function _setSelectedDate(elem, cal) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1)),
            input = document.getElementById(inputId),
            dmyCal = _priv._getSelectedDate(elem, cal),
            settings = _priv._getSettings(inputId);

        // Set input's value with selected day
        input.value = _priv._getFormattedDate(_priv._setDateToCulture(dmyCal, inputId), inputId);

        if (settings.display.autoError) {
            _priv._removeInlineError(input);
        }

        _priv._hideDatePicker(cal);

        $('#' + ID_PREFIXES.calIcon + inputId).focus();
    };

    _priv._handleCalHeaderNavigation = function _handleCalHeaderNavigation(elem, cal) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1)),
            monthYear = _priv._getMonthYearFromCalHeader(cal),
            dmyCal = {
                day: 1,
                month: monthYear[0],
                year: monthYear[1]
            },
            settings = _priv._getSettings(inputId),
            minDate = _priv._parseDateStringToDateObject(settings.minDate, inputId),
            maxDate = _priv._parseDateStringToDateObject(settings.maxDate, inputId),
            minDateMonth = minDate.getMonth() + 1,
            maxDateMonth = maxDate.getMonth() + 1,
            minDateYear = minDate.getFullYear(),
            maxDateYear = maxDate.getFullYear(),
            className = '';

        if (typeof elem === 'string') {
            className = elem;
        }
        else {
            className = elem.className;
        }

        switch (className) {
            case 'fastNavPrevQtr':
                // Make sure we only navigate when it is possible
                if (!(dmyCal.month === minDateMonth && dmyCal.year === minDateYear)) {
                    dmyCal.day = _priv._getLastDayOfMonth(new Date('01/' + monthYear[0] + '/' + monthYear[1]));
                    dmyCal = _priv._previousQuarter(_priv._convertDMYToNumeric(dmyCal));
                    if (_priv._validateMinMaxRange(dmyCal, inputId)) {
                        cal.innerHTML = _priv._getDatePickerHtml(dmyCal, inputId);
                        if (cal.innerHTML.indexOf(elem.className) > -1) {
                            $(cal).find('a.' + elem.className).focus();
                        }
                        else {
                            $(cal).find('a.monthYear').focus();
                        }
                    }
                    else {
                        // Move to the earliest month as I can go allowed by minDate
                        if (dmyCal.month < minDateMonth || dmyCal.year < minDateYear) {
                            dmyCal.month = minDateMonth;
                            dmyCal.year = minDateYear;
                            cal.innerHTML = _priv._getDatePickerHtml(dmyCal, inputId);
                            if (cal.innerHTML.indexOf(elem.className) > -1) {
                                $(cal).find('a.' + elem.className).focus();
                            }
                            else {
                                $(cal).find('a.monthYear').focus();
                            }
                        }
                    }
                }
                break;

            case 'navPrevMon':
                // Make sure we only navigate when it is possible
                if (!(dmyCal.month === minDateMonth && dmyCal.year === minDateYear)) {
                    dmyCal.day = _priv._getLastDayOfMonth(new Date('01/' + monthYear[0] + '/' + monthYear[1]));
                    dmyCal = _priv._previousMonth(_priv._convertDMYToNumeric(dmyCal));
                    if (_priv._validateMinMaxRange(dmyCal, inputId)) {
                        cal.innerHTML = _priv._getDatePickerHtml(dmyCal, inputId);
                        if (cal.innerHTML.indexOf(elem.className) > -1) {
                            $(cal).find('a.' + elem.className).focus();
                        }
                        else {
                            $(cal).find('a.monthYear').focus();
                        }
                    }
                }
                break;

            case 'navNextMon':
                // Make sure we only navigate when it is possible
                if (!(dmyCal.month === maxDateMonth && dmyCal.year === maxDateYear)) {
                    dmyCal = _priv._nextMonth(_priv._convertDMYToNumeric(dmyCal));
                    if (_priv._validateMinMaxRange(dmyCal, inputId)) {
                        cal.innerHTML = _priv._getDatePickerHtml(dmyCal, inputId);
                        if (cal.innerHTML.indexOf(elem.className) > -1) {
                            $(cal).find('a.' + elem.className).focus();
                        }
                        else {
                            $(cal).find('a.monthYear').focus();
                        }
                    }
                }
                break;

            case 'fastNavNextQtr':
                // Make sure we only navigate when it is possible
                if (!(dmyCal.month === maxDateMonth && dmyCal.year === maxDateYear)) {
                    dmyCal = _priv._nextQuarter(_priv._convertDMYToNumeric(dmyCal));
                    if (_priv._validateMinMaxRange(dmyCal, inputId)) {
                        cal.innerHTML = _priv._getDatePickerHtml(dmyCal, inputId);
                        if (cal.innerHTML.indexOf(elem.className) > -1) {
                            $(cal).find('a.' + elem.className).focus();
                        }
                        else {
                            $(cal).find('a.monthYear').focus();
                        }
                    }
                    else {
                        // Move to the latest month as I can go allowed by maxDate
                        if (dmyCal.month > maxDateMonth || dmyCal.year > maxDate.getFullYear()) {
                            dmyCal.month = maxDateMonth;
                            dmyCal.year = maxDateYear;
                            cal.innerHTML = _priv._getDatePickerHtml(dmyCal, inputId);
                            if (cal.innerHTML.indexOf(elem.className) > -1) {
                                $(cal).find('a.' + elem.className).focus();
                            }
                            else {
                                $(cal).find('a.monthYear').focus();
                            }
                        }
                    }
                }
                break;

            case 'navPrevYear':
                // Make sure we only navigate when it is possible
                if (!(dmyCal.month === maxDateMonth && dmyCal.year === maxDateYear)) {
                    dmyCal.day = _priv._getLastDayOfMonth(new Date('01/' + monthYear[0] + '/' + monthYear[1]));
                    dmyCal = _priv._previousYear(_priv._convertDMYToNumeric(dmyCal));
                    if (_priv._validateMinMaxRange(dmyCal, inputId)) {
                        cal.innerHTML = _priv._getDatePickerHtml(dmyCal, inputId);
                    }
                }
                break;

            case 'navNextYear':
                // Make sure we only navigate when it is possible
                if (!(dmyCal.month === maxDateMonth && dmyCal.year === maxDateYear)) {
                    dmyCal = _priv._nextYear(_priv._convertDMYToNumeric(dmyCal));
                    if (_priv._validateMinMaxRange(dmyCal, inputId)) {
                        cal.innerHTML = _priv._getDatePickerHtml(dmyCal, inputId);
                    }
                }
                break;

            default:
                break;
        }
    };

    _priv._handleOptionsNavigation = function _handleOptionsNavigation(elem, cal) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1)),
            startOptYr = parseInt(document.getElementById('startOptYr_' + inputId).value, 10),
            endOptYr = parseInt(document.getElementById('endOptYr_' + inputId).value, 10),
            selYear = parseInt(document.getElementById('selYr_' + inputId).value, 10),
            divMonths = $('#dpOptions_' + inputId).find('div.dpMon').get(0),
            divYears = $('#dpOptions_' + inputId).find('div.dpYr').get(0),
            settings = _priv._getSettings(inputId),
            minDate = _priv._parseDateStringToDateObject(settings.minDate, inputId),
            maxDate = _priv._parseDateStringToDateObject(settings.maxDate, inputId);

        switch (elem.className) {
            case 'fastNavPrevYrs':
                // Make sure we can only navigate to allowed years by min/max date
                if (_priv._validateMinMaxRange({day: 31, month: 12, year: (startOptYr - 1)}, inputId)) {
                    divYears.innerHTML = _priv._setOptionsYears({day: 1, month: 1, year: (startOptYr - 5)}, inputId);

                    if (selYear >= (startOptYr - 10) && selYear < startOptYr) {
                        divMonths.innerHTML = _priv._setOptionsMonths({day: 31, month: 12, year: selYear}, inputId);
                    }
                    else {
                        divMonths.innerHTML = _priv._setOptionsMonths({day: 31, month: 12, year: (startOptYr - 1)}, inputId);
                    }

                    if (minDate.getFullYear() < (startOptYr - 10)) {
                        $(cal).find('a.' + elem.className).focus();
                    }
                    else {
                        $(cal).find('a.fastNavNextYrs').focus();
                    }
                }
                break;
            case 'fastNavNextYrs':
                // Make sure we can only navigate to allowed years by min/max date
                if (_priv._validateMinMaxRange({day: 1, month: 1, year: (endOptYr + 1)}, inputId)) {
                    divYears.innerHTML = _priv._setOptionsYears({day: 1, month: 1, year: (endOptYr + 6)}, inputId);

                    if (selYear > endOptYr && selYear <= (endOptYr + 10)) {
                        divMonths.innerHTML = _priv._setOptionsMonths({day: 1, month: 1, year: selYear}, inputId);
                    }
                    else {
                        divMonths.innerHTML = _priv._setOptionsMonths({day: 1, month: 1, year: (endOptYr + 1)}, inputId);
                    }

                    if (maxDate.getFullYear() > (endOptYr + 10)) {
                        $(cal).find('a.' + elem.className).focus();
                    }
                    else {
                        $(cal).find('a.fastNavPrevYrs').focus();
                    }
                }
                break;
        }
    };

    /**
     * Subtract 3 months and return updated calendar
     * @param   {Object}  dmyCal  Calendar object
     * @return  {Object}          Updated calendar object
     */
    _priv._previousQuarter = function _previousQuarter(dmyCal) {
        dmyCal.month += -3;

        return _priv._recalculateDMY(dmyCal);
    };

    /**
     * Subtract 1 month and return updated calendar
     * @param   {Object}  dmyCal  Calendar object
     * @return  {Object}          Updated calendar object
     */
    _priv._previousMonth = function _previousMonth(dmyCal) {
        dmyCal.month += -1;

        return _priv._recalculateDMY(dmyCal);
    };

    /**
     * Add 1 month and return updated calendar
     * @param   {Object}  dmyCal  Calendar object
     * @return  {Object}          Updated calendar object
     */
    _priv._nextMonth = function _nextMonth(dmyCal) {
        dmyCal.month += 1;

        return _priv._recalculateDMY(dmyCal);
    };

    /**
     * Add 3 months and return updated calendar
     * @param   {Object}  dmyCal  Calendar object
     * @return  {Object}          Updated calendar object
     */
    _priv._nextQuarter = function _nextQuarter(dmyCal) {
        dmyCal.month += 3;

        return _priv._recalculateDMY(dmyCal);
    };

    /**
     * Subtract 1 year and return updated calendar
     * @param   {Object}  dmyCal  Calendar object
     * @return  {Object}          Updated calendar object
     */
    _priv._previousYear = function _previousYear(dmyCal) {
        dmyCal.month += -12;

        return _priv._recalculateDMY(dmyCal);
    };

    /**
     * Add 1 year and return updated calendar
     * @param   {Object}  dmyCal  Calendar object
     * @return  {Object}          Updated calendar object
     */
    _priv._nextYear = function _nextYear(dmyCal) {
        dmyCal.month += 12;

        return _priv._recalculateDMY(dmyCal);
    };

    /**
     * Correct the date for a calendar that has had its month or year changed
     * @param   {Object}  dmyCal  Calendar object
     * @return  {Object}          Updated calendar object
     */
    _priv._recalculateDMY = function _recalculateDMY(dmyCal) {
        if (dmyCal.month <= 0) {
            dmyCal.month += 12;
            dmyCal.year -= 1;
        }
        else if (dmyCal.month > 12) {
            dmyCal.month -= 12;
            dmyCal.year += 1;
        }

        return dmyCal;
    };

    _priv._showInlineError = function _showInlineError(elem) {
        $(elem).addClass(CLASSES.invalidDate);
    };

    _priv._removeInlineError = function _removeInlineError(elem) {
        $(elem).removeClass(CLASSES.invalidDate);
    };

    _priv._forceOptionsOK = function _forceOptionsOK(cal) {
        var inputId = cal.id.substring(cal.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1)),
            okBtn = document.getElementById('dpOK_' + inputId),
            opts = document.getElementById('dpOther_' + inputId);

        _priv._runOptionsActions(okBtn, opts, cal);
    };

    ////////////
    // Events //
    ////////////

    _events._iconClick = function _iconClick(ev) {
        var target = ev.target,
            iconId = target.id.substring(target.id.indexOf(ID_PREFIXES.calIcon) + ID_PREFIXES.calIcon.length),
            cal = document.getElementById(ID_PREFIXES.datePicker + iconId);

        // Hide other datepickers
        _priv._hideAllDatePickers(iconId);

        _priv._showHideDatePicker(target, cal);

        // Do we need this?
        // ev.preventDefault();
    };

    _events._inputBlur = function _inputBlur(ev) {
        var input = ev.target,
            dateParsed = null,
            settings = _priv._getSettings(input.id);

        if (input) {
            if ($.trim(input.value).length > 0) {
                dateParsed = _priv._getFormattedDate(input.value, input.id);
                if (dateParsed) {
                    input.value = dateParsed;
                    if (settings.display.autoError) {
                        _priv._removeInlineError(input);
                    }
                }
                else {
                    if (settings.display.autoError) {
                        _priv._showInlineError(input);
                    }
                }
            }
            else {
                if (settings.display.autoError) {
                    _priv._removeInlineError(input);
                }
            }
        }
    };

    _events._calClick = function _calClick(ev) {
        var icon = ev.target,
            parent = icon,
            clickElem = null,
            clickParent = null;

        // Use delegation on the calendar div container to know what was clicked
        while (parent.id.indexOf(ID_PREFIXES.datePicker) < 0) {
            if (parent.nodeName === 'A') {
                clickElem = parent;
            }

            parent = parent.parentNode;
        }

        if (clickElem) {
            switch (clickElem.className) {
                case 'fastNavPrevQtr':
                case 'navPrevMon':
                case 'navNextMon':
                case 'fastNavNextQtr':
                    _priv._handleCalHeaderNavigation(clickElem, parent);
                    break;
                case 'monthYear':
                    _priv._showHideOptions(clickElem, document.getElementById('dpOptions_' + parent.id.substring(parent.id.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1))));
                    break;
                case 'fastNavPrevYrs':
                case 'fastNavNextYrs':
                    _priv._handleOptionsNavigation(clickElem, parent);
                    break;
                default:
                    // Check on parent's container to determine what was clicked
                    // Options - mon, yr, footer links, cal days
                    clickParent = clickElem;
                    while (clickParent !== parent && clickParent.nodeName !== 'BODY') {
                        if (clickParent.className === 'dpMon') {
                            _priv._setOptionsSelectedMonth(clickElem, clickParent, parent);
                            if (ev.type === 'dblclick') {
                                _priv._forceOptionsOK(parent);
                            }
                            break;
                        }
                        else if (clickParent.className === 'dpYr') {
                            _priv._setOptionsSelectedYear(clickElem, clickParent, parent);
                            if (ev.type === 'dblclick') {
                                _priv._forceOptionsOK(parent);
                            }
                            break;
                        }
                        else if (clickParent.className === 'dpOther') {
                            _priv._runOptionsActions(clickElem, clickParent, parent);
                            break;
                        }
                        else if (clickParent.className === 'dpDays') {
                            _priv._setSelectedDate(clickElem, parent);
                            break;
                        }

                        clickParent = clickParent.parentNode;
                    }

                    break;
            }
        }

        // Do we need this?
        // ev.preventDefault();
    };

    _events._calKeydown = function _calKeydown(ev) {
        var elem = ev.target,
            parentId = $(elem).closest('.dp').attr('id'),
            inputId = parentId.substring(parentId.indexOf(ID_PREFIXES.datePicker + '_') + (ID_PREFIXES.datePicker.length + 1)),
            calIcon = document.getElementById(ID_PREFIXES.calIcon + inputId),
            cal = document.getElementById(ID_PREFIXES.datePicker + inputId),
            $cal = $(cal),
            linksCal = [],
            linksOpts = [];

        switch (ev.keyCode) {
            case 27: // 'Esc' was pressed, close calendar
                _priv._showHideDatePicker(calIcon, cal, true);
                break;

            case 9: // 'Shift + Tab' (ev.shiftKey) or 'Tab' (!ev.shiftKey)
                linksCal = $('#dpCalWrap_' + inputId).find('a');
                linksOpts = $('#dpOptions_' + inputId).find('a');

                // Calendar
                if ((elem.id === ('dpCalWrap_' + inputId) && ev.shiftKey) || (linksCal[linksCal.length - 1] === elem && !ev.shiftKey)) {
                    _priv._hideDatePicker(cal);
                    $('#' + ID_PREFIXES.calIcon + inputId).focus();

                    // Do we need this?
                    //ev.preventDefault();
                }
                // Options
                if ((elem.id === ('dpOptions_' + inputId) && ev.shiftKey) || (linksOpts[linksOpts.length - 1] === elem && !ev.shiftKey)) {
                    _priv._runOptionsClose(cal);

                    // Do we need this?
                    //ev.preventDefault();
                }
                break;

            case 37: // left arrow goes back 1 month
                if ($('#dpOptions_' + inputId).hasClass(CLASSES.hidden)) {
                    _priv._handleCalHeaderNavigation($cal.find('.navPrevMon').get(0), cal);

                    // Do we need this?
                    //ev.preventDefault();
                }
                break;

            case 39: // right arrow goes forward 1 month
                if ($('#dpOptions_' + inputId).hasClass(CLASSES.hidden)) {
                    _priv._handleCalHeaderNavigation($cal.find('.navNextMon').get(0), cal);

                    // Do we need this?
                    //ev.preventDefault();
                }
                break;

            case 38: // up arrow goes forward 1 year
                if ($('#dpOptions_' + inputId).hasClass(CLASSES.hidden)) {
                    _priv._handleCalHeaderNavigation('navNextYear', cal);
                    $cal.find('a.monthYear').focus();

                    // Do we need this?
                    //ev.preventDefault();
                }
                break;

            case 40: // down arrow goes back 1 year
                if ($('#dpOptions_' + inputId).hasClass(CLASSES.hidden)) {
                    _priv._handleCalHeaderNavigation('navPrevYear', cal);
                    $cal.find('a.monthYear').focus();

                    // Do we need this?
                    //ev.preventDefault();
                }
                break;

            default:
                break;
        }
    };

    _events._bodyClick = function _bodyClick(ev) {
        var $target = $(ev.target),
            $parent = $target.closest('#' + ID_PREFIXES.datePicker);

        // Check to see whether click happened inside or outside calendar
        if (!$parent.length) {
            // Make sure calendar is closed
            _priv._hideAllDatePickers();
        }
    };

    _events._windowResize = function _windowResize( /*ev*/ ) {
        // Reposition opened calendars
        $('div.dp:not(.hidden)').each(function() {
            _priv._setDatePickerPosition(this);
        });
    };

    $(document).ready(_init);

    // Reveal public API
    return {
        init: _init,
        setImagesPath: _setImagesPath,
        customize: _customize,
        getVersion: _getVersion,
        hideAll: _hideAll
    };
}());
