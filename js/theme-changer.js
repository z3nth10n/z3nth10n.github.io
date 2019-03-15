var waitForEl = function(selector, callback) {
    if (jQuery(selector).length) {
        callback();
    } else {
        setTimeout(function() {
            waitForEl(selector, callback);
        }, 100);
    }
};

$(document).ready(function() {

    var themeChanger = {
        settings: {
            wrappers: [],
            buttons: $('.js-theme-button'),
            cookieName: "current-theme"
        },

        init: function() {
            var _self = this;
            this.settings.buttons.on('click', function() {
                var $node = $(this),
                    theme = $node.data('theme');

                setTheme(theme);
                Cookies.set(_self.settings.cookieName, theme);

                //_self.settings.buttons.removeAttr('disabled');
                //$node.attr('disabled', true);
            });
        }
    };
    
    function setTheme(theme) {
        console.log("Setting theme: " + theme);

        themeChanger.settings.wrappers.forEach(function(el) {
            el.removeClass().addClass('net ' + theme)
        });
    }
    
    // Add theme wrapper to body
    $("body").addClass("net default js-theme-wrapper");

    // And them do the workaround for iframes (ie, cards)
    var curWrappers = [];

    waitForEl("iframe.theme-sensitive", function() {
        var frames = $("iframe.theme-sensitive"),
            frameCount = 0;
        
        if(frames.length == 0) {
            // If there is any available frame just assign the cookie
            assignFromCookie();
            return;
        }
        
        console.log("Assigning theme to frames (" + frames.length + ")");

        frames.each(function() {
            $(this).load(function() {
                var body = $(this).contents().find("body");
                body.addClass("net " + getCurrentTheme() + " js-theme-wrapper");

                curWrappers.push(body);

                ++frameCount;

                if (frames.length == frameCount)
                    frameCallback();
            });
        });

        function frameCallback() {
            themeChanger.settings.wrappers = themeChanger.settings.wrappers.concat(curWrappers);
            
            // Assign theme from cookie (if defined)
            assignFromCookie();
        }
    });
    
    function isThemeDefined() {
        return Cookies.get(themeChanger.settings.cookieName);
    }
    
    function getCurrentTheme() {
        var curTheme = isThemeDefined();
        return curTheme != undefined ? curTheme : "default";
    }
    
    function assignFromCookie() {
        var currentTheme = isThemeDefined();
        console.log("Cookie stored theme: " + currentTheme);

        if (currentTheme != undefined)
            setTheme(currentTheme);
        
        setMobileStyles(currentTheme);
    }
    
    /*
    
    <!-- Chrome, Firefox OS and Opera -->
<meta name="theme-color" content="{{site.color-browser}}">
<!-- Windows Phone -->
<meta name="msapplication-navbutton-color" content="{{site.color-browser}}">
<!-- iOS Safari -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="{{site.apple-status-bar-style}}">
    */
    
    var mobileThemes = [];
    
    function setMobileStyles(theme) {
        mobileThemes["default"] = "#2f1f1f";
        mobileThemes["dark"] = "black";
        mobileThemes["light"] = "white";
        
        $("meta[name='theme-color']").attr('content', mobileThemes[theme]);
        $("meta[name='msapplication-navbutton-color']").attr('content', mobileThemes[theme]);
        $("meta[name='apple-mobile-web-app-status-bar-style']").attr('content', mobileThemes[theme]);
    }
    
    // At the end, wait for the wrapper then init
    var defaultWrapper = '.js-theme-wrapper';
    waitForEl(defaultWrapper, function() {
        // Add default wrapper
        themeChanger.settings.wrappers.push($(defaultWrapper));

        // ... and them, init
        themeChanger.init(); 
    });
});