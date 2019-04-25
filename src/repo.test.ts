import { Octokit } from "probot"
import { removeSync, existsSync } from "fs-extra";
import nock from "nock"
import Repo from "./repo"
import { createTemplateOptions, createSSHUrl } from "./helpers"
import { defaultConfig, pullRequestFixture } from "./fixture"
const { defaultRemoteOrigin, owner, repoName, defaultBranchName, defaultPRTitle, defaultPRBody } = defaultConfig

nock.disableNetConnect()

describe("#Repo", () => {
  let repo: Repo
  beforeAll(() => {
    repo = new Repo(createTemplateOptions(defaultConfig), new Octokit)
  })

  afterAll(() => {
    removeSync(repo.getRepoDir())
  })

  test("should clone a repo", async () => {
    await repo.clone()
    expect(existsSync(`${repo.getRepoDir()}/README.md`)).toBe(true)
  })

  test("returns current branch", async () => {
    expect(await repo.getCurrentBranch()).toBe("master")
  })

  test("should return the repos remotes", async () => {
    const [origin] = await repo.getRemotes()
    expect(origin.name).toBe("origin")
  })

  test("adds a remote to cloned repo", async  () => {
    await repo.addRemote(defaultRemoteOrigin, createSSHUrl(owner, repoName))
    const remotes = await repo.getRemotes()

    let found = false
    remotes.forEach((remote: any) => {
      if(remote.name === defaultRemoteOrigin) found = true
    })
    
    expect(found).toBe(true)
  })

  test("should checkout a new branch", async () => {
    await repo.checkoutNewBranch(defaultBranchName, "master")
    expect(await repo.getCurrentBranch()).toBe(defaultBranchName)
  })

  test("does a fetch for origin branches", async () => {
    // TODO: need to write a test for pushing upstream, 
    // need to create a method that can check upstream refs
    await repo.push("origin", defaultBranchName, { "--set-upstream": true })
    const fetch = await repo.fetch("origin")
    console.log("--- fetch ---", fetch)
    expect(true).toBe(true)
  })

  test("removes a remote origin", async () => {
    await repo.removeRemote(defaultRemoteOrigin)
    const remotes = await repo.getRemotes()
    let found = false
    remotes.forEach((remote: any) => {
      if(remote.name === defaultRemoteOrigin) found = true
    })
    expect(found).toBe(false)
  })

  test("creates pull request", async () => {
    nock('https://api.github.com')
      .post(`/repos/${owner}/${repoName}/pulls`)
      .reply(201, pullRequestFixture)

    const response = await repo.submitPullRequest({
      title: defaultPRTitle,
      body: defaultPRBody,
      head: defaultBranchName,
      base: "master"
    })

    expect(response.data).toStrictEqual(pullRequestFixture)
  })
})