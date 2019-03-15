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

    if (currentTheme != undefined)
        setTheme(currentTheme);

    var currentTheme = Cookies.get(themeChanger.settings.cookieName);
    console.log("Cookie stored theme: " + currentTheme);

    $("body").addClass("net " + currentTheme + " js-theme-wrapper");

    // Workaround for iframes (ie, cards)
    console.log($("iframe.theme-sensitive"));

    var curWrappers = [];

    waitForEl("iframe.theme-sensitive", function() {
        var frames = $("iframe.theme-sensitive"),
            frameCount = 0;

        frames.each(function() {
            $(this).load(function() {
                // console.log($(this).contents().find("body").attr("class"));

                var body = $(this).contents().find("body");
                body.addClass("net " + currentTheme + " js-theme-wrapper");

                curWrappers.push(body);

                ++frameCount;
                
                // console.log("Frame length: "+frames.length + "; Count: " + frameCount);
                if (frames.length == frameCount)
                    frameCallback();
            });
        });

        function frameCallback() {
            // console.log(themeChanger);
            console.log(curWrappers);
            console.log(themeChanger.settings.wrappers);
            
            themeChanger.settings.wrappers = themeChanger.settings.wrappers.concat(curWrappers);
            console.log(themeChanger.settings.wrappers);
        }
    });
});