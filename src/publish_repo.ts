// const ORG = "Oakland-Blockchain-Developers" // Abstract.
// const MASTER_REPO = "testing_repo" // Abstract
// const HEAD_PULL_BRANCH = 'feat/pristine_changes' // Abstract
import { genericAsyncFunction } from "./helpers"

export interface OrgOptions {
  owner: string
  repo: string
  headPullBranch: string
  gitAPI: any
  payload: any
}

export interface OrgHelpers {
  // getORG(): string
  // getMasterRepo(): string
  // HEAD_PULL_BRANCH: string
  getLastestContent(path: string): any
  createNewRefText(ref: string, unique: string): string
}

export default class Repo implements OrgHelpers {
  public repo: OrgOptions["repo"];
  public owner: OrgOptions["owner"];
  public gitAPI: OrgOptions["gitAPI"];
  public payload: OrgOptions["payload"];
  public headPullBranch: OrgOptions["headPullBranch"];
  public latestCommit: string
  constructor(options: OrgOptions) {
    this.repo = options.repo
    this.owner = options.owner
    this.gitAPI = options.gitAPI
    this.latestCommit = options.payload.after
    this.payload = options.payload
    this.headPullBranch = options.headPullBranch
    // this.refsArray = [] // new refs
  }  

  getLastestContent = async (path: string) => {
    const { gitAPI: { repos } } = this;

    return await genericAsyncFunction(repos.getContents, [{
      owner: this.owner,
      repo: this.repo,
      path
    }])
  }

  createNewRefText = (branchName: string, unique: string): string => {
    // potential store this value in the constructor
    // in array to have multiple refs or single ref??
    return `refs/heads/${branchName}${unique}`
  }

  getOwner = (): string  => {
    return this.owner
  }

  getRepoName = (): string => {
    return this.repo
  }

  getHeadPullBranch = (): string => {
    return this.headPullBranch
  }
}