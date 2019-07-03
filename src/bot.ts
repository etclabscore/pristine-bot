import util from "util";
import { EventEmitter } from "events";
import { Application, Context, Octokit} from "probot"
import { AppsListReposResponseRepositoriesItem } from "@octokit/rest";
import Repo from "./repo"
import Config, { IBotConfig } from "./default-config"
import { isTemplateRepo, createOptions, createTemplateOptions } from "./helpers"

export default class Bot {
  public config: Config
  public events: EventEmitter
  [key: string]: any
  constructor(config: IBotConfig) {
    this.events = new EventEmitter()
    this.config = new Config(config)
  }

  public on(event: "error", callback: any): void
  public on(event: "submitted", callback: any): void
  public on(event: "completed", callback: any): void
  public on(eventName: string, callback: (result: any) => Promise<void>) {
    return this.events.on(eventName, async (result: any) => {
      await callback(result)
    })
  }

  public async getLatastCommit(repo: Repo): Promise<any> {
    if(!repo.exists()) await repo.clone()
    const current = await repo.getCurrentBranch()
    if(current !== "master") await repo.checkout("master")

    return await repo.pull()
  }

  public async mergeUnrelatedHistory(repo: Repo): Promise<any> {
    const { defaultRemoteOrigin, defaultConflictCommitMessage } = this.config.get()
    const mergeArgs = [
      `${defaultRemoteOrigin}/master`, 
      "-S", 
      "--allow-unrelated-histories",
    ]

    try {
      return await repo.merge(mergeArgs)
    } catch (error) {
      try {
        const addAll = await repo.addAll()
        const commit = await repo.commitChanges(defaultConflictCommitMessage)
        util.log(addAll)
        console.log("--- ADD_ALL ---", addAll);
        util.log(commit)
        console.log("--- COMMIT ---", commit);
        return { message: "Merged with conflicts" }
      } catch (error) {
        await this.events.emit("error", error)
      }
    }
  }

  public async checkoutDefaultPRBranch(repo: Repo): Promise<any> {
    const { defaultBranchName } = this.config.get()
    const branchList = await repo.getBranchList()

    if(!branchList.all.includes(defaultBranchName)) {
      return await repo.checkoutNewBranch(defaultBranchName, "master")
    } else if(branchList.current === "master") {
      return await repo.checkout(defaultBranchName)
    }
  }

  public async addDefaultPROrigin(repo: Repo): Promise<any> {
    const { defaultRemoteOrigin, remoteRepoUrl } = this.config.get()

    const added = await repo.addRemote(defaultRemoteOrigin, remoteRepoUrl)
    util.log(added)
    console.log("--- ADDED ---")

    const remotes = await repo.getRemotes()
    let found = false
    remotes.forEach((remote: any) => {
      if(remote.name === defaultRemoteOrigin) found = true
    })

    if(!found) return await this.addDefaultPROrigin(repo)

    return added
  }

  public async pushTemplateChanges(repo: Repo): Promise<any> {
    const { defaultBranchName } = this.config.get()
    const result = await repo.push("origin", defaultBranchName, {
      "--set-upstream": true
    })
    util.log(result)
    console.log("--- PUSH_COMMAND ---")
    return result
  }

  public async submitTemplatePR(repo: Repo): Promise<any> {
    const { defaultPRTitle, defaultPRBody, defaultBranchName } = this.config.get()
    const prOptions = {
      title: defaultPRTitle,
      body: defaultPRBody,
      base: "master",
      head: defaultBranchName
    }

    const submitted = await repo.submitPullRequest(prOptions)
    await this.events.emit("submitted", repo)
    return submitted
  }

  public async fetchDefaultTemplateOrigin(repo: Repo): Promise<any> {
    const { defaultRemoteOrigin } = this.config.get()
    const fetchResult = await repo.fetch(defaultRemoteOrigin)
    util.log(fetchResult)
    console.log("--- FETCH_RESULT ---")
    return fetchResult
  }

  public async removeDefaultPROrigin(repo: Repo): Promise<any> {
    const { defaultRemoteOrigin } = this.config.get()

    const remotes = await repo.getRemotes()

    let found = false

    remotes.forEach((remote: any) => {
      if(remote.name === defaultRemoteOrigin) found = true
    })
    
    if (found) {
      const rm = await repo.removeRemote(defaultRemoteOrigin)
      util.log(rm)
      console.log("-- RM_REMOTE --")
      return rm  
    }

    return { message: "nothing to remove" }
  }

  public async deleteRemotePRBranch(repo: Repo): Promise<any> {
    const { defaultBranchName } = this.config.get()

    try {
      const deleted = await repo.deleteRemoteBranch(defaultBranchName)
      console.log(deleted)
      console.log("-- deleted branch through api --")
      return deleted
    } catch (error) {
      util.log(error)
      return { message: "no branch to delete" }
    }
  }

  public async mergeTemplateCommits(repo: Repo): Promise<any> {
    try {
      await this.getLatastCommit(repo)
      await this.removeDefaultPROrigin(repo)
      await this.deleteRemotePRBranch(repo)
      await this.checkoutDefaultPRBranch(repo)
      await this.addDefaultPROrigin(repo)
      await this.fetchDefaultTemplateOrigin(repo)
      await this.mergeUnrelatedHistory(repo)
      await this.pushTemplateChanges(repo)
      await this.submitTemplatePR(repo)
    } catch (error) {
      util.log(error)
      console.log("--- TEMPLATE_COMMITS_ERROR ---")
    }

    return repo
  }
  
  public getOwnerRepos = async (githubApi: Octokit): Promise<Repo[]> => {
    const { data: { repositories } } = await githubApi.apps.listRepos()

    return await Promise.all(repositories.map(async (repoData: AppsListReposResponseRepositoriesItem) => {
      const options = createOptions([this.config.get(), {
        owner: repoData.owner.login,
        repoName: repoData.name,
        remoteUrl: repoData.ssh_url,
      }])

      util.log(options)
      return new Repo(options, githubApi)
    }))
  }

  public updateTemplateRepo = async (github: Octokit): Promise<Repo> => {
    const repo = new Repo(createTemplateOptions(this.config.get()), github)
    await this.getLatastCommit(repo)
    return repo
  }

  public start = async (app: Application): Promise<void> => {
    // Commands:
    // - ./add-template - user types "./add-template", then pristine bot adds the template and account owner.
    //    - account-owner - from github payload
    //    - template-name - from github payload
    // - ./add-template-list - from the template repo, comment this command and a list of repos - repo-name-1\n- repo-name-2\n- repo-name-3\n
    //    - account-owner - from github payload
    //    - ["repo-name-1", "repo-name-2", "repo-name-3"] - from user comment
    // - ./add-to-template-list
    //    - account-owner - from github payload
    //    - template-name - from github payload
    //    - repo-name - from user comment
    // - ./remove-template
    //    - account-owner - from github payload
    //    - template-name - from github payload
    // - ./remove-from-template-list
    //    - account-owner - from github payload
    //    - template-name - from github payload
    //    - repo-name - from user comment


    app.on("issue_comment.created", async (context: Context) => {
      const { payload: { action, title, name, owner } } = context


      if(action === "created") {
        switch (title) {
          case "add-template":
            // db.saveTemplate(name, owner, [])
            break;
        
          default:
            break;
        } 
      }
    })

    app.on("push", async (context: Context) => {
      util.log(`--- EVENT_HAS_BEEN_RECIEVED ---`);
      const { github, payload: { repository: { name }, ref } } = context
      const { repoName, listeningRepos } = this.config.get()
      if (!isTemplateRepo(name, repoName, ref)) return
      const template = await this.updateTemplateRepo(github)
      const reposList = await this.getOwnerRepos(github)

      const repos = await Promise.all(reposList.map(async (repo: Repo) => {
        // Have to change this up because its returning undefined to the repo array
        if(repo.getRepoName() === name) return
        if(!listeningRepos.includes(repo.getRepoName())) return
        return this.mergeTemplateCommits(repo)
      }))

      await this.events.emit("completed", { template, repos })
    })
  }  
}
