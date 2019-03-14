# Jekyll - Easy Patreon Embed
#
# z3nth10n - https://github.com/z3nth10n
# United Teamwork Association - https://github.com/uta-org 
#
#   Input:
#     {% patreon z3nth10n %}
#   Output: Patreon donation widget

require 'net/http'

module Jekyll
  class Patreon < Liquid::Tag
    @profile = nil
    PatreonWebsiteURL = "https://www.patreon.com/"
    PatreonUserAPIURL = "https://api.patreon.com/user/"
    @PatreonID = nil

    def initialize(tag_name, markup, tokens)
      super
        
      @profile = markup.strip
    end

    def render(context)
      if @PatreonID.nil?
         @PatreonID = getPatreonID(@profile) 
      end
     
      json = escape_json(Net::HTTP.get_response(URI.parse("#{PatreonUserAPIURL}#{@PatreonID}")).body.force_encoding('UTF-8'))
        
      source = "<link href=\"/css/patreon_default.css\" rel=\"stylesheet\">"
      source += "<script async src=\"https://c6.patreon.com/becomePatronButton.bundle.js\"></script>"
      source += "<script>"
      source += "var PatreonData = JSON.parse(\"#{json}\");"
      source += "console.log(PatreonData);"
      source += "var GoalieTronShowGoalText = \"\"; // {showgoaltext};"
      source += "</script>"
      source += "<script src=\"/js/plugins/patreon.js\"></script>"
      source += "<a href=\"https://www.patreon.com/bePatron?u=#{@PatreonID}\" data-patreon-widget-type=\"become-patron-button\">Become a Patron!</a>"
      source += "<div id=\"goalietron_toptext\">{toptext}</div>"
      source += "<div class=\"goalietron_goalmoney\">"
      source += "<span id=\"goalietron_goalmoneytext\"></span>"
      source += "<span id=\"goalietron_goalreached\" class='goalreached'></span>"
      source += "</div>"
      source += "<div id=\"goalietron_paypername\"></div>"
      source += "<div class=\"meter {metercolor}\" id=\"goalietron_meter\">"
      source += "<span style=\"width: 0%\"></span>"
      source += "</div>"
      source += "<div id=\"goalietron_goaltext\"></div>"
      source += "<div id=\"goalietron_bottomtext\">{bottomtext}</div>"
      source += "<div class=\"goalietron_button\">{goalietron_button}</div>"
        
      source
    end
      
    def getPatreonID(username)
      patreon_url = URI.encode("#{PatreonWebsiteURL}#{username}")
    
      # Jekyll.logger.info "Patreon profile url:",patreon_url
      patreon_source = Net::HTTP.get_response(URI.parse(patreon_url)).body.force_encoding('UTF-8').delete!("\r\n\\")

      patreon_id_index = patreon_source.index("\"creator_id\": ")
    
      unless patreon_id_index.nil?

          patreon_id_index += 14
          endidpos = patreon_source.from(patreon_id_index).index("\n")
          
          if endidpos.nil?
            endidpos = patreon_source.from(patreon_id_index).index("}")
          end
          
          if endidpos.nil?
              raiseError()
          end
          
          patreon_id = patreon_source.from(patreon_id_index)[0, endidpos].strip

          # Jekyll.logger.info "Patreon ID:",patreon_id
          
          if patreon_id.nil?
              raiseError()
          end
          
          return Integer(patreon_id)
      end
        
      return -1
    end
      
    def raiseError()
        raise RuntimeError, "An error occurred getting the ID from your Patreon profile"
    end
      
    JSON_ESCAPE_MAP = {
    '\\'    => '\\\\',
    '</'    => '<\/',
    "\r\n"  => '\n',
    "\n"    => '\n',
    "\r"    => '\n',
    '"'     => '\\"' }

    def escape_json(json)
      json.gsub(/(\\|<\/|\r\n|[\n\r"])/) { JSON_ESCAPE_MAP[$1] }
    end
  end
end

# Jekyll.logger.info "Patreon:","Test"
Liquid::Template.register_tag('patreon', Jekyll::Patreon)