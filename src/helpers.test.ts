import * as helpers from "./helpers"
import { existsSync, removeSync } from "fs-extra";
import { defaultConfig } from "./default-config";

const owner = "etclabscore"
const repoName = "Pristine"

describe.skip("Helper Methods", () => {
  afterAll(() => {
    removeSync(`${__dirname}/tmp`)
  })

  test("should return false, not the template repo.", () => {
    const notTemplate = "NOT"
    expect(
      helpers.isTemplateRepo(notTemplate, repoName, "refs/heads/not/master")
    ).toBe(false)
  })

  test("should create a string dir path", () => {
    const reposDir = helpers.createRootReposDirPath("/root")
    expect(reposDir).toBe("/root/tmp/repos")
  })

  test("should merge an array of objects", () => {
    const options = helpers.createOptions([{a: 1}, {a: 2}, {a: 3}])
    expect(options.a).toBe(3)
  })

  test("should create a root repo dir", () => {
    const dir = helpers.createRootReposDir(__dirname)
    expect(dir).toBe(`${__dirname}/tmp/repos`)
    expect(existsSync(dir)).toBe(true)
  })

  test("creates a repos ssh clone url string", () => {
    const sshUrl = helpers.createSSHUrl(owner, repoName)
    expect(sshUrl).toBe(`git@github.com:${owner}/${repoName}.git`)
  })

  test("creates repo options for a template repo.", () => {
    const defaultPRBody = "PR_BODY!"
    const options = helpers.createTemplateOptions(defaultConfig)
    options.defaultPRBody = defaultPRBody
    expect(options).toStrictEqual({ 
      defaultBranchName: "feat/pristine-changes",
      defaultConflictCommitMessage: "fix: Pristine changes with conflicts",
      defaultPRBody,
      defaultPRTitle: "Pristine has been updated",
      defaultRemoteOrigin: "pristine",
      remoteUrl: "git@github.com:undefined/undefined.git",
    })
  })
})