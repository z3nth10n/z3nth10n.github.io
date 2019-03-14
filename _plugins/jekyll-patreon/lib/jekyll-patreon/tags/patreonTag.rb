# Jekyll - Easy Patreon Embed
#
# z3nth10n - https://github.com/z3nth10n
# United Teamwork Association - https://github.com/uta-org 
#
#   Input:
#     {% patreon z3nth10n %}
#   Output: Patreon donation widget

require "jekyll-patreon/version"
require 'net/http'

module Jekyll
  module Patreon::Tags 
      class PatreonTag < Liquid::Tag
        PatreonWebsiteURL = "https://www.patreon.com/"
        PatreonUserAPIURL = "https://api.patreon.com/user/"
          
        @inc = nil
        @username = nil
        @PatreonID = nil

        def initialize(tag_name, markup, tokens)
          super

          @inc = File.expand_path("../../_inc", __FILE__)
          @username = markup.strip
        end

        def render(context)
          if @PatreonID.nil?
             @PatreonID = getPatreonID(@username) 
          end

          json = escape_json(Net::HTTP.get_response(URI.parse("#{PatreonUserAPIURL}#{@PatreonID}")).body.force_encoding('UTF-8'))

          source = "<script>" + File.read(File.join(@inc, "js", "patreon.js")) + "</script>"
          source += File.read(File.join(@inc, "design_default.html"))
          source += File.read(File.join(@inc, "button.html"))
          source += "<style>" + File.read(File.join(@inc, "css", "design_default.css")) + "</style>"

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
end

# Jekyll.logger.info "Patreon:","Test"
Liquid::Template.register_tag('patreon', Jekyll::Patreon::Tags::PatreonTag)