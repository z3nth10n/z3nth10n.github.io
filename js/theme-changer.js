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
            wrappers: [$('.js-theme-wrapper')],
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
            $(el).removeClass().addClass('net ' + theme)
        });
    }

    themeChanger.init();
    
    // Add theme wrapper to body
    $("body").addClass("net default js-theme-wrapper");

    // And them do the workaround for iframes (ie, cards)
    var curWrappers = [];

    waitForEl("iframe.theme-sensitive", function() {
        var frames = $("iframe.theme-sensitive"),
            frameCount = 0;

        frames.each(function() {
            $(this).load(function() {
                var body = $(this).contents().find("body");
                body.addClass("net " + currentTheme + " js-theme-wrapper");

                curWrappers.push(body);

                ++frameCount;

                if (frames.length == frameCount)
                    frameCallback();
            });
        });

        function frameCallback() {
            themeChanger.settings.wrappers = themeChanger.settings.wrappers.concat(curWrappers);
        }
    });
    
    // Assign theme from cookie (if defined)
    var currentTheme = Cookies.get(themeChanger.settings.cookieName);
    console.log("Cookie stored theme: " + currentTheme);
    
    if (currentTheme != undefined)
        setTheme(currentTheme);
});