---
layout: post
section-type: post
title: Configuring custom domains on Github Pages (Part 3)
date:   2019-04-02 16:00:00 +0100
categories: tutorial
language: en
locale: 'en'
permalink: "/:language/:year/:month/:day/configuring-custom-domains-github-pages-part-3.html"
---

## Configure and use PHPMyAdmin with Heroku using JawsDB

On the last tutorial I teached you how to configure [your first PHP backend using Heroku](/en/2019/04/01/configuring-custom-domains-github-pages-part-2), now we will introduce PHPMyAdmin on Heroku.

For this, I used [this amazing Heroku template to use PHPMyAdmin by smsaladi](https://github.com/smsaladi/phpmyadmin_heroku). You just need to copy the following lines into your composer:

```json
  "scripts" : {
    "post-install-cmd" : "composer create-project phpmyadmin/phpmyadmin; cp config.inc.php phpmyadmin/"
  }
```

and inside the `require` part:

```json
"ext-mbstring": "*"
```

Also, you'll need to copy the `config.inc.php` into the root of your Heroku project.

You'll need to modify the "post-install-cmd" if you want to use a subfolder pointing to a subdomain as I done on the Part 2:

Modify the "post-install-cmd" to match this:

```json
cd web/ && composer create-project phpmyadmin/phpmyadmin; cp ../config.inc.php phpmyadmin/
```

And create the `phpmyadmin` folder inside the `web` one.

**Note:** If you want to point to a subdomain instead of using the folder, make sure you configured correctly your DNS records at Cloudflare and copy the proper part from my .htaccess in the example of the Part 2.

Then, execute the following commands:

```bash
$ composer update
$ git add .
$ git commit -m "Deploying PHPMyAdmin"
% git push heroku master
```

### Configuring JawsDB

To configure JawsDB, you'll need to follow [the steps on the Heroku guide about this](https://devcenter.heroku.com/articles/jawsdb#provisioning-the-add-on).

I only used this two commands from this guide:

```bash
$ heroku addons:create jawsdb
```

> To add the addon.

```bash
$ heroku config:get JAWSDB_URL
```

> To get your credentials that you will need to use in PHPMyAdmin.

### Configuring environment variables

PHPMyAdmin's `config.inc.php` file will need two environment variables:

* [MYSQL_HOST](https://github.com/smsaladi/phpmyadmin_heroku/blob/cb0930fc82ffed1facb50ecd010b4be29b31c614/config.inc.php#L31)
* [PHPMYADMIN_BLOWFISH_SECRET](https://github.com/smsaladi/phpmyadmin_heroku/blob/cb0930fc82ffed1facb50ecd010b4be29b31c614/config.inc.php#L17)

To generate the blowfish secret, just use a SHA-1 or MD5 hash generators (that doesn't store on its database :joy:, for example sha1-online.com). Once you created one just set it using [this command](https://devcenter.heroku.com/articles/getting-started-with-php#define-config-vars):

```bash
$ heroku config:set PHPMYADMIN_BLOWFISH_SECRET=<hash>
```

The MYSQL_HOST variable can be extracted from the `heroku config:get JAWSDB_URL` I explained before. Just follow its format (`mysql://username:password@hostname:port/default_schema`)

And set it as I explained before for the "**PHPMYADMIN_BLOWFISH_SECRET**" key.

### Can't login using SSL?

Well, that behaviour would be expected if you're using Heroku for free and Cloudflare with SSL.

If you followed the Part 2 of this tutorial, you'll need to unset the **"Always Use HTTPS"** option under **Crypto on your dashboard** and create some rules to keep users redirecting to https:

* https://sql.example.com/
    * Rule => SSL: Off
* http://&#x2A;example.com/&#x2A;
    * Rule => Always Use HTTPS
    
Click **"Save and Deploy"**.

**Important Tip:** Don't login in your DDBB on a public Wifi due to a possible [*MitM attack*](https://en.wikipedia.org/wiki/Man-in-the-middle_attack).

**Best regards!**