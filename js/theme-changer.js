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
        
        setMobileStyles(theme);
    }
    
    // Add theme wrapper to body
    $("body").addClass("net default js-theme-wrapper");

    // And them do the workaround for iframes (ie, cards)
    var curWrappers = [];

    waitForEl("iframe.theme-sensitive", function() {
        var frames = $("iframe.theme-sensitive"),
            frameCount = 0;
        
        if(frames.length == 0) {
            // If there is any available frame just assign it
            assignTheme();
            return;
        }
        
        console.log("Assigning theme to frames (" + frames.length + ")");

        frames.each(function() {
            $(this).load(function() { // body.addClass("net " + getCurrentTheme() + " js-theme-wrapper");
                var body = $(this).contents().find("body");
                curWrappers.push(body);

                ++frameCount;

                if (frames.length == frameCount)
                    frameCallback();
            });
        });

        function frameCallback() {
            themeChanger.settings.wrappers = themeChanger.settings.wrappers.concat(curWrappers);
            
            // Assign theme from cookie (if defined)
            assignTheme();
        }
    });
    
    function isThemeDefined() {
        return Cookies.get(themeChanger.settings.cookieName);
    }
    
    function getCurrentTheme() {
        var curTheme = isThemeDefined();
        return curTheme != undefined ? curTheme : "default";
    }
    
    function assignTheme() {
        var currentTheme = getCurrentTheme();
        console.log("Current theme: " + currentTheme);

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
        mobileThemes["light"] = "#fff";
        mobileThemes["dark"] = "#000";
        mobileThemes["dark-blue"] = "#003";
        mobileThemes["dark-orange"] = "#804000";
        mobileThemes["dark-red"] = "#3f0000";
        mobileThemes["dark-green"] = "#001800";
        mobileThemes["dark-yellow"] = "#705107";
        mobileThemes["dark-olive-green"] = "#2b3618";
        mobileThemes["dark-cyan"] = "#003f3f";
        mobileThemes["dark-turquoise"] = "#008385";
        mobileThemes["flower-blue"] = "#1f66e5";
        mobileThemes["dark-flower-blue"] = "#1d44b8";
        mobileThemes["sand"] = "#ef7b18";
        mobileThemes["dark-purple"] = "#1f0036";
        mobileThemes["light-purple"] = "#3f23e6";
        mobileThemes["light-pink"] = "#ff6a80";
        mobileThemes["_pink"] = "#ff748c";
        mobileThemes["lilac"] = "#6533cb";
        mobileThemes["_brown"] = "#48240a";
        mobileThemes["light-orange"] = "#977316";
        mobileThemes["light-red"] = "#a93434";
        mobileThemes["light-green"] = "#4ee44e";
        mobileThemes["light-yellow"] = "#e7d748";
        mobileThemes["light-olive-green"] = "#7aa228";
        mobileThemes["light-cyan"] = "#94ffff";
        mobileThemes["light-turquoise"] = "#70e1e1";
        mobileThemes["_salmon"] = "#f73d28";
        mobileThemes["_gray"] = "#5a5a5a";
        
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
        
        assignTheme();
    });
});