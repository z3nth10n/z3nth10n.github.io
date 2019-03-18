# Adapted from https://code.google.com/p/google-api-ruby-client/

require 'jekyll'
require 'rubygems'
require 'google/api_client'
require 'chronic'
require 'json'

module Jekyll

  class GoogleAnalytics < Generator
    priority :highest

    def generate(site)
      if !site.config['jekyll_ga']
        return
      end

      ga = site.config['jekyll_ga']
      # Local cache setup so we don't hit the sever X amount of times for same data.
      cache_directory = ga['cache_directory'] || "_jekyll_ga"
      cache_filename = ga['cache_filename'] || "ga_cache.json"
      cache_file_path = cache_directory + "/" + cache_filename
      response_data = nil

      # Set the refresh rate in minutes (how long the program will wait before writing a new file)
      refresh_rate = ga['refresh_rate'] || 60

      # If the directory doesn't exist lets make it
      if not Dir.exist?(cache_directory)
        Dir.mkdir(cache_directory)
      end

      # Now lets check for the cache file and how old it is
      if File.exist?(cache_file_path) and ((Time.now - File.mtime(cache_file_path))/60 < refresh_rate)
        response_data = JSON.parse(File.read(cache_file_path));
      else

        client = Google::APIClient.new(
          :application_name => ga['application_name'],
          :application_version => ga['application_version'])

        # Load our credentials for the service account
        key = Google::APIClient::KeyUtils.load_from_pkcs12(ga['key_file'], ga['key_secret'])
        client.authorization = Signet::OAuth2::Client.new(
          :token_credential_uri => 'https://accounts.google.com/o/oauth2/token',
          :audience => 'https://accounts.google.com/o/oauth2/token',
          :scope => 'https://www.googleapis.com/auth/analytics.readonly',
          :issuer => ga['service_account_email'],
          :signing_key => key)

        # Request a token for our service account
        client.authorization.fetch_access_token!
        analytics = client.discovered_api('analytics','v3')

        params = {
          'ids' => ga['profileID'],
          'start-date' => Chronic.parse(ga['start']).strftime("%Y-%m-%d"),
          'end-date' => Chronic.parse(ga['end']).strftime("%Y-%m-%d"),
          'dimensions' => "ga:pagePath",
          'metrics' => ga['metric'],
          'max-results' => 10000
        }
        if ga['segment']
          params['segment'] = ga['segment']
        end
        if ga['filters']
          params['filters'] = ga['filters']
        end

        response = client.execute(:api_method => analytics.data.ga.get, :parameters => params)

        if response.error?
          abort("Client Execute Error: #{response.error_message}")
        end

        response_data = response.data

        File.open(cache_file_path,"w") do |f|
          f.write(response_data.to_json)
        end

      end

      results = Hash[response_data["rows"]]

      site.posts.docs.each { |post|
        url = post.url + '/'

        post.data.merge!("_ga" => (results[url]) ? results[url].to_i : 0)
      }
    end
  end

  class Jekyll::Post
    alias_method :original, :<=>

    # Override comparator to first try _ga value
    def <=>(other)
      if site.config['jekyll_ga']['sort'] != true
        return original(other)
      end

      if self.data['_ga'] && other.data['_ga']
        cmp = self.data['_ga'] <=> other.data['_ga']
      end
      if !cmp || 0 == cmp
        cmp = self.date <=> other.date
      elsif 0 == cmp
        cmp = self.slug <=> other.slug
      end
      return cmp
    end
  end
end
