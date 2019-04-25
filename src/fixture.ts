import { defaultConfig } from "./default-config"

defaultConfig.owner = "Oakland-Blockchain-Developers" // TODO: change to etclabs.
defaultConfig.repoName = "testing_repo_3"
defaultConfig.reposRootDir = __dirname
defaultConfig.templateRepoPath = "path-to-template"

const pullRequestFixture = {
  "id": 1,
  "number": 1347,
  "state": "open",
  "locked": true,
  "title": "new-feature",
  "user": {
    "login": "octocat",
    "id": 1,
    "site_admin": false
  },
  "body": "Please pull these awesome changes",
  "labels": [],
  "active_lock_reason": "too heated",
  "created_at": "2011-01-26T19:01:12Z",
  "updated_at": "2011-01-26T19:01:12Z",
  "closed_at": "2011-01-26T19:01:12Z",
  "merged_at": "2011-01-26T19:01:12Z",
  "merge_commit_sha": "e5bd3914e2e596debea16f433f57875b5b90bcd6",
  "assignee": {},
  "assignees": [],
  "requested_reviewers": [],
}

export { pullRequestFixture, defaultConfig }