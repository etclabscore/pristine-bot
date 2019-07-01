import { ensureDirSync, existsSync } from "fs-extra"
import { IBotConfig } from "./default-config"
import git, { SimpleGit } from "simple-git/promise"

export interface IRepoOptions extends IBotConfig {
  remoteUrl: string
}

export interface IPROptions {
  title: string
  body: string
  base: string
  head: string
}

export default class Repo {
  public config: IRepoOptions
  public localGit: SimpleGit
  public githubApi: any
  public repoDir: string

  constructor(config: IRepoOptions, githubApi: any) {
    const repoDir = `${config.reposRootDir}/${config.repoName}`
    ensureDirSync(repoDir)
    this.config = config
    this.localGit = git(repoDir)
    this.githubApi = githubApi
    this.repoDir = repoDir
  }

  public getOwner(): IRepoOptions["owner"] {
    return this.config.owner
  }

  public getRepoName(): IRepoOptions["repoName"]  {
    return this.config.repoName
  }

  public getRepoDir(): string {
    return this.repoDir
  }

  public async deleteLocalBranch(branch: string): Promise<any> {
    return await this.localGit.deleteLocalBranch(branch)
  }

  public async deleteRemoteBranch(branch: string): Promise<any> {
    return await this.githubApi.gitdata.deleteRef({
      owner: this.getOwner(),
      repo: this.getRepoName(),
      ref: `heads/${branch}`
    })
  }

  public async checkout(branch: string): Promise<any> {
    return await this.localGit.checkout(branch)
  }

  public async checkoutNewBranch(branch: string, startPoint: string) {
    return await this.localGit.checkoutBranch(branch, startPoint)
  }

  public async getRemotes() {
    return await this.localGit.getRemotes(false)
  }

  public async addRemote(originName: string, originPath: string): Promise<any> {
    return await this.localGit.addRemote(originName, originPath) // TODO: not working
  }

  public async fetch(origin: string): Promise<any> {
    return await this.localGit.raw([ "fetch", origin ])
  }

  public async pull(): Promise<any> {
    return await this.localGit.pull()
  }

  public async merge(mergeArgs: string[]):Promise<any> {
    return await this.localGit.merge(mergeArgs)
  }

  public async clone(): Promise<any> {
    const { remoteUrl } = this.config
    return await this.localGit.raw([
      "clone",  
      remoteUrl,
      this.getRepoDir()
    ])    
  }

  public async addAll(): Promise<any> {
    return await this.localGit.add("./*")
  }

  public async commitChanges(message: string): Promise<any> {
    return await this.localGit.commit(message)
  }

  public async push(origin: string, branch: string, options: git.Options): Promise<any> {
    await this.localGit.push(origin, branch, options)
  }

  public async removeRemote(origin: string): Promise<any> {
    return await this.localGit.removeRemote(origin)
  }

  public async getBranchList(): Promise<any> {
    return await this.localGit.branchLocal()
  }

  public async getCurrentBranch(): Promise<string> {
    const { current } = await this.getBranchList()
    return current
  }

  public exists(): boolean {
    return existsSync(`${this.getRepoDir()}/.git`)
  }

  public async submitPullRequest(options: IPROptions): Promise<any> {
    return await this.githubApi.pullRequests.create({
      owner: this.getOwner(),
      repo: this.getRepoName(),
      title: options.title,
      body: options.body,
      head: `refs/heads/${options.head}`,
      base: `refs/heads/${options.base}`
    })
  }
}