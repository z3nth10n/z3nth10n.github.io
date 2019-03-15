$(document).ready(function() {
   $("body").addClass("net default js-theme-wrapper");
    
    (function(exports) {
      var themeChanger = {
        settings: {
          wrapper: $('.js-theme-wrapper'),
          buttons: $('.js-theme-button')
        },

        init: function () {
          var _self = this;
          this.settings.buttons.on('click', function () {
            var $node = $(this),
                theme = $node.data('theme');
            _self.settings.wrapper.removeClass().addClass('net ' + theme);
            //_self.settings.buttons.removeAttr('disabled');
            //$node.attr('disabled', true);
          });
        }
      };

      themeChanger.init();
    }(window));
});