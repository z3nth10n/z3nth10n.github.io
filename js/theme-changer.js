$(document).ready(function() {
   $("body").addClass("net default js-theme-wrapper");
    
    (function(exports) {
      function setTheme(_themeChanger, theme) {
        console.log("Setting theme: " + theme);
        _themeChanger.settings.wrapper.removeClass().addClass('net ' + theme);
      }   
    
      var themeChanger = {
        settings: {
          wrapper: $('.js-theme-wrapper'),
          buttons: $('.js-theme-button'),
          cookieName: "current-theme"    
        },

        init: function () {
          var _self = this;
          this.settings.buttons.on('click', function () {
            var $node = $(this),
                theme = $node.data('theme');
            
            setTheme(_self, theme);      
            Cookies.set(_self.settings.cookieName, theme);
            //_self.settings.buttons.removeAttr('disabled');
            //$node.attr('disabled', true);
          });
        }
      };

      themeChanger.init();
        
      var currentTheme = Cookies.get(themeChanger.settings.cookieName);
        
      console.log("Cookie stored theme: " + currentTheme);
        
      if(currentTheme != undefined)
        setTheme(themeChanger, currentTheme); 
    }(window));
});