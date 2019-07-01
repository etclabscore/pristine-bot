import { removeSync, existsSync, appendFile } from "fs-extra";
import nock from "nock"
import Repo from "./repo"
import { createSSHUrl } from "./helpers"
import { defaultConfig, pullRequestFixture, mockRemoteRepo, mockLocalRepo } from "./fixture"

const { defaultRemoteOrigin, owner, repoName, defaultBranchName, defaultPRTitle, defaultPRBody } = defaultConfig

nock.disableNetConnect()

describe("#Repo", () => {
  let mockRemote: Repo
  let mockLocal: Repo

  beforeAll(async () => {
    mockRemote = await mockRemoteRepo()
    await mockRemote.addAll()
    await mockRemote.commitChanges("feat: i'm a mock remote")
    mockLocal = await mockLocalRepo(mockRemote.getRepoDir())
  })

  afterAll(() => removeSync(mockLocal.getRepoDir()))
  afterEach(() => jest.unmock("./repo"))

  test("should clone a repo", async () => {
    await mockLocal.clone()
    expect(existsSync(`${mockLocal.getRepoDir()}/README.md`)).toBe(true)
  })

  test("returns current branch", async () => {
    expect(await mockLocal.getCurrentBranch()).toBe("master")
  })

  test("should return the repos remotes", async () => {
    const [origin] = await mockLocal.getRemotes()
    expect(origin.name).toBe("origin")
  })

  test("adds a remote repo", async  () => {
    await mockLocal.addRemote(defaultRemoteOrigin, createSSHUrl(owner, repoName))
    const remotes = await mockLocal.getRemotes()

    let found = false
    remotes.forEach((remote: any) => {
      if(remote.name === defaultRemoteOrigin) found = true
    })
    
    expect(found).toBe(true)
  })

  test("should checkout a new branch", async () => {
    await mockLocal.checkoutNewBranch(defaultBranchName, "master")
    expect(await mockLocal.getCurrentBranch()).toBe(defaultBranchName)
  })

  test("does a fetch for origin branches", async () => {
    const response = await mockLocal.push(
      "origin", 
      defaultBranchName, 
      { "--set-upstream": true },
    )
    expect(response).toBe({})
  })

  test("removes a remote origin", async () => {
    await mockLocal.removeRemote(defaultRemoteOrigin)
    const remotes = await mockLocal.getRemotes()
    let found = false
    remotes.forEach((remote: any) => {
      if(remote.name === defaultRemoteOrigin) found = true
    })
    expect(found).toBe(false)
  })

  test("get the owner of a repo", () => {
    expect(mockLocal.getOwner()).toBe(owner)
  })

  test("gets the name of a repo", () => {
    expect(mockLocal.getRepoName()).toBe(repoName)
  })

  test("deletes a local branch", async () => {
    await mockLocal.deleteLocalBranch(defaultBranchName)
    const branches = await mockLocal.getBranchList()
    expect(branches.all.includes(defaultBranchName)).toBe(false)
  })

  test("creates pull request", async () => {
    nock('https://api.github.com')
      .post(`/repos/${owner}/${repoName}/pulls`)
      .reply(201, pullRequestFixture)

    const response = await mockLocal.submitPullRequest({
      title: defaultPRTitle,
      body: defaultPRBody,
      head: defaultBranchName,
      base: "master"
    })

    expect(response.data).toStrictEqual(pullRequestFixture)
  })

  test("delete a remote branche", async () => {
    nock('https://api.github.com')
      .delete(`/repos/${owner}/${repoName}/git/refs/${defaultBranchName}`)
      .reply(204, {})

    const response = await mockLocal.deleteRemoteBranch(defaultBranchName)

    expect(response.data).toBe({})
  })

  test("checks out a branch", async () => {
    const checkoutBranch = "master"
    await mockLocal.checkout(checkoutBranch)
    expect(await mockLocal.getCurrentBranch()).toBe(checkoutBranch)
  })

  test("pulls the latest changes", async () => {
    jest.mock("./repo")
    const response = await mockLocal.pull()
    expect(response).toBe({})
  })

  test("merges master and current branch", async () => {
    await mockLocal.checkoutNewBranch("feat/test-branch", "master")
    await appendFile(`${mockLocal.getRepoDir}/README.md`, "write test\n")
    await mockLocal.addAll()
    await mockLocal.commitChanges("feat: new test changes")
    const result = await mockLocal.merge(["origin/master"])

    expect(result).toBe({})
  })
})