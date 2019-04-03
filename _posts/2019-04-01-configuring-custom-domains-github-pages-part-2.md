---
layout: post
section-type: post
title: Configuring custom domains on Github Pages (Part 2)
date:   2019-04-01 16:00:00 +0100
categories: tutorial
language: en
locale: 'en'
permalink: "/:language/:year/:month/:day/configuring-custom-domains-github-pages-part-2.html"
---

## Configure Heroku to use multiple subdomains on the same domain for free with SSL

In this tutorial, the first step I'll show you is how to have a Heroku app deployed with PHP, that we will use as backend.

You'll need yto have an account on Heroku, so please [feel free to register](https://signup.heroku.com/login).

> For this, you'll need to reproduce the steps on the [Getting started on PHP with Heroku tutorial](https://devcenter.heroku.com/articles/getting-started-with-php) until the config vars part.

**Note:** If you already knows about how to deploy a PHP application, create one.

Once we arrive here, we will need to undo some steps from the Heroku tutorial, because personally, I won't use Symfony (I prefer Laravel, I will teach some basics on next tutorials), but I don't want to mess with routing by the moment.

So, you'll need to remove manually these lines from the `composer.json` file:

```json
  "require" : {
    "silex/silex": "^2.0.4",
    "monolog/monolog": "^1.22",
    "twig/twig": "^2.0",
    "symfony/twig-bridge": "^3"
  }
```

replace this part like this:

```json
  "require" : {}
```

By the moment we won't use any require.

Then just use the following commands to update the project and upload a new version of it:

In Linux:

```bash
$ rm -rf vendor
$ rm composer.lock
```

In Windows:

```dos
@ rmdir /S vendor
@ del /F composer.lock
```

Then:

```bash
$ composer install
$ git add .
$ git commit -m "<commit message>"
$ git push heroku master
```

### Some caveats

In order to login on Heroku you'll need to execute the `heroku login` command, but once you make your first commit if you put wrong credentials (at pushing) [an error would be prompting in your scene](https://devcenter.heroku.com/articles/git#http-git-authentication), if this happens to you, I have a solution for you:

First remove Git credentials by using:

```bash
$ git config --system --unset credential.helper
```

If you're in Windows and you use Mingw64 console for your projects and you're using CMD you're out of risk because [the git-credential-store settings](https://git-scm.com/docs/git-credential-store) won't be deleted.

I just readed this article where [Heroku suggests you to use its `auth:token` option](https://devcenter.heroku.com/articles/authentication). This are the credentials you need to use on your first login, the one given from the `.netrc` at your HOME path.

## Configure custom domains

To achieve this you'll need to follow [this tutorial](https://devcenter.heroku.com/articles/custom-domains#add-a-custom-domain-with-a-subdomain). **Note:** Don't try to add them until you deploy the app for first time.

Then all you need to do is add a new `CNAME record` on your Cloudflare dashboard ([we were using Cloudflare on the last post](/en/2019/03/31/configuring-custom-domains-github-pages-part-1)) pointing to the DNS link prompted in console. **Note:** By default I use `app.example.com` subdomain.

But the good news here are that you can use as much subdomains as you need, and with some tricks, in your projects.

Normally other users would deploy several projects, but I want to use a single project. So, I would use some `.htaccess config` to achieve this.

The first thing to keep in mind is that we will use subfolders to point to different subfolders, for example:

```
root
    web/
        phpmyadmin/ # This points to sql.example.com
        api/        # This points to api.example.com
        dev/        # This points to dev.example.com
```

First you'll need to add all these subdomains:

```bash
$ heroku domains:add api.example.com
$ heroku domains:add dev.example.com
$ heroku domains:add sql.example.com
```

And then, go to Cloudflare and add there subdomains as `CNAME records`:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/01-heroku+free%20ssl/00.PNG?raw=true)

* In this screenshot I'm missing the `sql` subdomain.

Remove the current `.htaccess` file under `web` folder and create a new one.

Then, you'll need the following .htaccess configuration:

```apache
Options +FollowSymLinks

RewriteEngine On

# Subdomain 1 (folder sql-admin)
RewriteCond %{HTTP_HOST} ^sql\.z3nth10n\.net$ [NC]
RewriteCond %{REQUEST_URI} !^/phpmyadmin/.*$
RewriteRule ^(.*)$ /phpmyadmin/$1 [L]

# Subdomain 2 (folder api)
RewriteCond %{HTTP_HOST} ^api\.z3nth10n\.net$ [NC]
RewriteCond %{REQUEST_URI} !^/api/.*$
RewriteRule ^(.*)$ /api/$1 [L]

# Subdomain 3 (folder dev)
RewriteCond %{HTTP_HOST} ^dev\.z3nth10n\.net$ [NC]
RewriteCond %{REQUEST_URI} !^/dev/.*$
RewriteRule ^(.*)$ /dev/$1 [L]
```

As you can see it has a very simple pattern usage:

```apache
# Subdomain # (folder <name>)
RewriteCond %{HTTP_HOST} ^<subdomain x>\.example\.com$ [NC]
RewriteCond %{REQUEST_URI} !^/<folder name>/.*$
RewriteRule ^(.*)$ /<folder name>/$1 [L]
```

## Configuring SSL

We'll there come the problems. Because SSL isn't free at all in Heroku. You'll need [a paid dyno to have it](https://devcenter.heroku.com/articles/ssl).

But Cloudflare can encrypt the last end-point (User-Cloudflare), for this, we will need to go to the Crypto section under our dashboard and put SSL to **"Flexible" mode** (if you put it on **"Full"** or **"Full (Strict)"** a 502 error will be prompted). This means that Cloudflare will offer its SSL as protection, but from Heroku to Cloudflare there won't be any encryptation tunnel as the one that SSL/TLS offers.

* You can read more about this [here under "Cloudflare SSL Configuration" heading](https://www.cloudflare.com/ssl/).

Then, to enforce all users to use https by default, scroll down and **enable the "Always Use HTTPS" option**.

**Best regards!**