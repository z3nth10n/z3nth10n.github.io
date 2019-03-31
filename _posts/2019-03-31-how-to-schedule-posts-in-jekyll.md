---
layout: post
section-type: post
title: How to schedule posts in Jekyll 
date:   2019-03-31 9:22:00 +0100
categories: tutorial
language: en
locale: 'en'
permalink: "/:language/:year/:month/:day/how-schedule-posts-in-jekyll.html"
---

In this post I will explain how to use **Jekyll Scheduler** a bash utility to schedule Jekyll post upload.

> Jekyll Scheduler is a bash script (executed preferably by CircleCI nightly triggers) that schedule your posts.

Requires a that you Jekyll repository has a [CircleCI environment](https://z3nth10n.net/en/2019/03/20/jekyll-plugin-issue-with-github-pages) set.

You'll need to access to [the repository of this script](https://github.com/uta-org/jekyll-scheduler) to download some files that you'll need in this tutorial.

## Setup steps

0. Clone this repo outside of your Jekyll site.
	- `git clone https://github.com/uta-org/jekyll-scheduler.git`
1. Create a `sch.ini` file, with this configuration:

```ini
schedule_date=<date in YYYY-MM-DD format>
schedule_post=<url to your posts>
```

*Example:*

```ini
schedule_date=2019-03-31
schedule_post=2019-03-31-how-schedule-posts-in-jekyll.md
schedule_date=2019-03-31
schedule_post=2019-03-31-configuring-custom-domains-github-pages-part-1.md
schedule_date=2019-04-01
schedule_post=2019-04-01-configuring-custom-domains-github-pages-part-2.md
```

> This will schedule two posts for 2019-03-31 and one for 2019-04-01.

3. Create a "script" folder on your site root path.
	- `mkdir script`
2. Copy this script and the `ini` file into "script" folder.
	- `cp sch.ini <path to your jekyll site>/script/sch.ini && cp get_scheduled_posts.sh <path to your jekyll site>/script/get_scheduled_posts.sh`
4. Create a folder called "scheduled-posts" inside your site root folder.
	- `mkdir scheduled-posts`
5. Copy this on your `circle.yml` configuration file:

#### Don't use this method!

> ```yaml
> defaults: &defaults
>     working_directory: ~/repo
>     
> version: 2
> jobs:
>   # Your jobs here... 
>     schedule_posts:
>         <<: *defaults
>         docker:
>           - image: circleci/ruby:2.6.0-node
>         filters:
>             branches:
>                 only:
>                   - gh-pages-ci
>                 ignore:
>                   - master
>         steps:
>             - checkout 
>             - run:
>                 name: Executing scheduler
>                 command: bash ~/repo/script/get_scheduled_posts.sh
> workflows:
>     version: 2
>     test-deploy:
>         jobs:
>             - schedule_posts:
>                 filters:
>                     branches:
>                         only:
>                           - gh-pages-ci
>                         ignore:
>                           - master              
>     nightly:
>         triggers:
>             - schedule:
>                 cron: "0 0 * * *"
>                 filters:
>                     branches:
>                         only:
>                             - gh-pages-ci
>                         ignore:
>                             - master
>         jobs:
>             - schedule_posts
> ```
>
> **Note:** This will execute the scheduler any time you make a push. Or every day at 12AM.

**Note2:** This is not the optimal way to accomplish the task, I strongly recommend you to use this as an unique step in your main job, and put this after `checkout` happens. See [my example at this file](https://github.com/z3nth10n/z3nth10n.github.io/blob/4500f380cd722a25e83108d5335edb87a9a3274e/circle.yml#L23).

```yaml
            - run:
                name: Executing scheduler
                command: bash ~/repo/script/get_scheduled_posts.sh
```

6. You'll need to sync all your scheduled posts in local, for accomplish that create a Git alias in your environment to automatize this on the local-side.

For this, you'll need to download `scheduler-alias.sh`, with the following command:

`wget https://raw.githubusercontent.com/uta-org/jekyll-scheduler/master/scheduler-alias.sh -O ~/UnitedTeamworkAssociation/scheduler-alias.sh`

And then, create an alias for it:

`git config --global alias.publish '!script="$HOME/UnitedTeamworkAssociation/scheduler-alias.sh" && bash "$script"'`

All together:

`wget https://raw.githubusercontent.com/uta-org/jekyll-scheduler/master/scheduler-alias.sh -O ${HOME}/UnitedTeamworkAssociation/scheduler-alias.sh && git config --global alias.publish '!script="$HOME/UnitedTeamworkAssociation/scheduler-alias.sh" && bash "$script"'`

So, instead of using `git push` use `git publish`.

**Note:** This command must be called from you repository root.

7. Enjoy!

### How does the script works?

It simply copies the files required by the date from the "scheduled-posts" folder to the "_posts" one.

So, just simply write posts as you normally do.

**Best regards!**