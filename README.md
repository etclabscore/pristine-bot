# Pristine Bot 

Pull request bot for [Pristine](https://github.com/etclabscore/pristine) updates 

The Pristine bot will submit pull requests when Pristine gets updated.

## How to configure Pristine Bot in your org:


## Whats the problem?:

- The root Pristine project gets updated and as a developer you want to apply those changes to projects that use Pristine.

- The problem is multiple projects use pristine, so it would be cumbersome to have to do this manually.

## Proposed solution:

- Pristine Bot: There's a bunch of bots that submit pull request to repos, for lots of reasons, pristine bot will do the same whenever an update is submitted to the pristine project.

- Steps:

1. Going to use [Probot](https://github.com/probot/probot).

2. Probot has a cli that you can use to scaffold a bot project.

3. Create a github app:
    - have to get a `webhook_proxy_url` (This is for testing and exposing your localhost to the webhooks).
    - Get `webhook secret` for security.
    - Set persmissions.
    - Download the private key and move it to your project's directory. As long as it's in the root of your project, Probot will find it automatically regardless of the filename.
    - Edit .env and set APP_ID to the ID of the app you just created. The App ID can be found in your app settings page here 

4. Hooks listen for 



#### Resources

- [opensource.guide](https://opensource.guide/)
- [Github community profiles for public repositories](https://help.github.com/articles/about-community-profiles-for-public-repositories/)
- [Readme Driven Development](http://tom.preston-werner.com/2010/08/23/readme-driven-development.html)
- [pengwynn/flint](https://github.com/pengwynn/flint)
- [Working Backwards](https://www.allthingsdistributed.com/2006/11/working_backwards.html)
- [Literate programming](https://en.wikipedia.org/wiki/Literate_programming)
- [Hammock Driven Development](https://www.youtube.com/watch?v=f84n5oFoZBc)
- [Inversion and The Power of Avoiding Stupidity](https://fs.blog/2013/10/inversion/)
- [choosealicense.com](http://choosealicense.com)

## Getting Started

To get started, [fork](https://help.github.com/articles/fork-a-repo/) or [duplicate](https://help.github.com/articles/duplicating-a-repository/) the repository. Then edit this file and delete everything above this line.

---

### Contributing

How to contribute, build and release are outlined in [CONTRIBUTING.md](CONTRIBUTING.md), [BUILDING.md](BUILDING.md) and [RELEASING.md](RELEASING.md) respectively. Commits in this repository follow the [CONVENTIONAL_COMMITS.md](CONVENTIONAL_COMMITS.md) specification.

