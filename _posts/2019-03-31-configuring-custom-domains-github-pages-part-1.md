---
layout: post
section-type: post
title: Configuring custom domains on Github Pages (Part 1)
date:   2019-03-31 22:00:00 +0100
categories: tutorial
language: en
locale: 'en'
permalink: "/:language/:year/:month/:day/configuring-custom-domains-github-pages-part-1.html"
---

## How to configure Github Pages to use a custom domain with Cloudflare?

In this tutorial I will show you how to configure a domain with [name.com](https://name.com) and use in your Jekyll website with [Cloudflare](https://cloudflare.com).

## Steps

1. Enter [name.com](https://name.com) and then, search for your domain:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/00.PNG?raw=true)

2. After your send your information, you'll need to pay (you can pay with PayPal but you need a verified Paypal account):

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/01.PNG?raw=true)

3. If everything is right, you should be prompted to this:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/02.PNG?raw=true)

4. Then, you'll need to return to your `Repository Settings`:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/03.PNG?raw=true)

5. And write your custom domain (**Note:** the keyword `www` is required):

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/04.PNG?raw=true)

5.1. It's required that you create a `CNAME` file in your site root with the domain you'll manage:

In my case:

- z3nth10n.net
- www.zenth10n.net

But there is a Bash command to do that:

```bash
printf "<domain>\n<domain with www>" > CNAME && git add . && git commit -m "Added CNAME" && git push
```

Example:

```bash
printf "zenth10n.net\nwww.zenth10n.net" > CNAME && git add . && git commit -m "Added CNAME" && git push
```

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/05.PNG?raw=true)

6. Now go to [Cloudflare](https://cloudflare.com) and register a new account:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/06.PNG?raw=true)

7. Cloudflare will request your domain name, simply `Add` it as shown below:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/07.PNG?raw=true)

8. By default this will be shown as this:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/08.PNG?raw=true)

Here you need to press "Continue" button, we'll configure this later.

9. Cloudflare will need a new NS records in name.com:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/12.PNG?raw=true)

10. Go to your site Configuration > Nameservers, and remove then:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/13.PNG?raw=true)

11. You'll need to apply changes in order to make this work:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/14.PNG?raw=true)

12. Then, just write them:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/15.PNG?raw=true)

13. If everything go well you'll see this:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/16.PNG?raw=true)

14. Go to your `_config.yml` file and change all variables that depends on url:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/17.PNG?raw=true)

15. Return to Cloudflare, and point this Github IP: `192.30.252.153` (as an `A record` for the `@ wildcard`) and a `CNAME record` pointing to `www` as a alias to your site url (in my case: `z3nth10n.github.com`) in your Cloudflare dashboard:

![](https://github.com/uta-org/artwork/blob/master/blog/tutorials/00-buy%20a%20domain/18.PNG?raw=true)

16. To check that everything went right, just use this command:

```bash
$ curl -sI "http://z3nth10n.net" | grep "HTTP/\|Location"
```

If you have problems in Windows, you can use:

```
ipconfig /flushdns
```

This will delete all your DNS cache, so if you have any issue and you fix it, your changes will apply quicklier.

17. Enjoy!

**Note:** In case you have problems don't hesistate to ask in a comment.

**Best regards!**