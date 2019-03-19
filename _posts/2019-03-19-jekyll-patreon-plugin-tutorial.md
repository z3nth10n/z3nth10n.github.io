---
layout: post
section-type: post
title: How to use Patreon in Jekyll (jekyll-patreon plugin tutorial)
date:   2019-03-19 9:22:00 +0100
categories: jekyll-plugin
language: en
locale: 'en'
permalink: "/:language/:year/:month/:day/jekyll-patreon-plugin-tutorial.html"
---

In this post I will explain how to use the plugin called jekyll-patreon. I created this plugin to be able to implement a widget that shows information about our Patreon profile.

**Note:** This plugin requires Ruby 2.5+ and Jekyll 3.8+

## What is this used for?

> A Jekyll plugin that adds Patreon support in your blog to easily embed a widget with goals

## Features 

* Supports several designs: default, fancy, minimal, streamlined, reversed, swapped
* Supports several colors: red, green, orange, red nostripes, green nostripes, orange nostripes, blue nostripes
* Supports i18n (compatible with [jekyll-language-plugin](https://github.com/vwochnik/jekyll-language-plugin))
* Supports Markdown on your Patreon goals

> To see the possible styles && designs navigate to the [assets folder of the main repo](https://github.com/uta-org/jekyll-patreon/tree/master/assets) where the screenshots are located

## Installation

Add this line to your site's Gemfile:

```ruby
gem 'jekyll-patreon'
```

Add this configuration to your _config.yml file:

```yaml
####################
# Patreon Settings #
####################

patreon:
    enabled: true
    design: 'default' # Supports the following desings: default, fancy, minimal, streamlined, reversed, swapped
    title: 'Example title'
    metercolor: 'green' # Supports the following colors: red, green, orange, red nostripes, green nostripes, orange nostripes, blue nostripes
    toptext: 'Example top text' # Text that appears in before the progress bar (optional)
    bottomtext: 'Example bottom text' # Text that appears in after the progress bar (optional)
    showgoaltext: true # Display the goal text?
    showbutton: true # Display the "Become a patron" button?
    username: 'Your username here'
    default_lang: "en" # The default language to use (to avoid writing twice the same text from Patreon)
```

## Usage

Simply just put the following tag where you need this:

<pre>
   <code>
        {&percnt; patreon &percnt;}
   </code>
</pre>

### i18n

To support languages just use [jekyll-language-plugin](https://github.com/vwochnik/jekyll-language-plugin) configuration. Or if you don't use it, do the following steps.

First, in your main index.html (or wherever you need the i18n support) declare the following lines:

<pre><code data-trim class="yaml">
&ndash;&ndash;&ndash;
layout: &lt;layout&gt;
language: en
&ndash;&ndash;&ndash;
</code></pre>

Or if you want to support several languages in the same page:

<pre><code data-trim class="yaml">
&ndash;&ndash;&ndash;
layout: &lt;layout&gt;
languages:
- en
- es
&ndash;&ndash;&ndash;
</code></pre>

Then, in "_data/lang/" create one file for each lang.

> Example: `en.yml` and `es.yml`. 

Then, write the translations of you goals like this:

<pre><code data-trim class="yaml">
#################
# Patreon Goals #
#################

patreon_goal_0: "..."
patreon_goal_1: "..."
patreon_goal_2: "..."
# etc etc...
</code></pre>

There you will need to create as much translations as the number of goals that your Patreon page have. (**Note:** starting index is 0 (zero))

## Issues

Having issues? Just report in [the issue section](https://github.com/uta-org/jekyll-patreon/issues). **Thanks for the feedback!**

**Best regards!**