# Pristine Bot 

Pull request bot for [Pristine](https://github.com/etclabscore/pristine) updates 

The Pristine bot will submit pull requests when Pristine gets updated.

## How to configure Pristine Bot in your org:

...

## Whats the problem?:

- The root Pristine project gets updated and as a developer you want to apply those changes to projects that use Pristine.

- The problem is multiple projects might use pristine, so it would be cumbersome to have to update each repo manually.

## Proposed solution:

- Pristine Bot: There's a bunch of bots that submit pull request to repos, for lots of reasons, pristine bot will do the same whenever an update is submitted to the pristine project.

- Steps:

1. Going to use [Probot](https://github.com/probot/probot)

2. Probot has a cli that you can use to scaffold a bot project.

3. Create a github app:
    - have to get a `webhook_proxy_url` (This is for testing and exposing your localhost to the webhooks).
    - Get `webhook secret` for security.
    - Set persmissions.
    - Download the private key and move it to your project's directory. As long as it's in the root of your project, Probot will find it automatically regardless of the filename.
    - Edit .env and set APP_ID to the ID of the app you just created. The App ID can be found in your app settings page here 

4. Hooks to listen for:
  - we want to listen for a "push" event on pristines master branch. 
    - The push event is going to give you a payload, contained within this payload is:
      - ref: `ref/heads/master`
      - head: `COMMIT_AFTER_PUSH`
      - plus more...
    - Theres a number of different options here
      - `git show HEAD`
        - This will show us the changes.
        - Then we do something with those changes. 
      -  `git remote add pristine <PRISTINE_URL>`
          - Pretty much do [this](https://thoughts.t37.net/merging-2-different-git-repositories-without-losing-your-history-de7a06bba804) flow, but just applying the lastest changes.
    - List all repos in an org and apply changes, we can blacklist the ones that don't use pristine, if thats the case. 

I think we can make changes to repos, without adding persistence to the bot, yet.

Continue spec here `...`

### Contributing

How to contribute, build and release are outlined in [CONTRIBUTING.md](CONTRIBUTING.md), [BUILDING.md](BUILDING.md) and [RELEASING.md](RELEASING.md) respectively. Commits in this repository follow the [CONVENTIONAL_COMMITS.md](CONVENTIONAL_COMMITS.md) specification.

