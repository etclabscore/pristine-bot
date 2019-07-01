import child from "child_process";
import { promisify } from "util"
import { mkdirp, writeFile } from "fs-extra";
import { defaultConfig, IBotConfig } from "./default-config"
import Repo from "./repo";
import { Octokit } from "probot";
import { createTemplateOptions } from "./helpers";

const spawn = promisify(child.spawn)

export const mockRemoteRepo = async () => {
  const mockRemotePath = `${__dirname}/mock-remote-repo`
  await mkdirp(mockRemotePath)
  await spawn("git", ["init"], { cwd: mockRemotePath })
  await writeFile(`${mockRemotePath}/README.md`, "- Testing README\n")

  return new Repo(createTemplateOptions({
    owner: "etclabscore",
    repoName: "mock-remote-repo",
    reposRootDir: __dirname,
    remoteRepoUrl: mockRemotePath,
  } as IBotConfig), new Octokit)
}

export const mockLocalRepo = async (remoteRepoUrl: string) => {
  return new Repo(createTemplateOptions({
    owner: "etccorelabs",
    repoName: "mock-local-repo",
    reposRootDir: __dirname,
    remoteRepoUrl: remoteRepoUrl
  } as IBotConfig), new Octokit)
}

export const pullRequestFixture = {
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

export { defaultConfig }