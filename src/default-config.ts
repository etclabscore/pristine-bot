import { createOptions, createRootReposDir, createSSHUrl } from "./helpers"

export interface IRepo {
  owner: string, 
  repoName: string 
}

export interface IBotConfig extends IRepo {
  defaultRemoteOrigin: string
  defaultBranchName: string
  defaultPRTitle: string,
  defaultConflictCommitMessage: string 
  defaultPRBody: string
  reposRootDir: string
  templateRepoPath: string
  remoteRepoUrl: string
  listeningRepos: string[]
}

export const defaultConfig = {
  defaultRemoteOrigin: "pristine",
  defaultBranchName: "feat/pristine-changes",
  defaultPRTitle: "Pristine changes",
  defaultConflictCommitMessage: "fix: Pristine changes with conflicts",
  defaultPRBody: ""
} as IBotConfig

export default class Config {
  public config: IBotConfig
  constructor(config: any) {
    const options = createOptions([defaultConfig, config])
    const reposRootDir = createRootReposDir(config.rootReposDir)
    
    options.remoteRepoUrl = createSSHUrl(config.owner, config.repoName)
    options.templateRepoPath = `${reposRootDir}/${config.repoName}`
    options.reposRootDir = reposRootDir
    this.config = options
  }

  public get(): IBotConfig {
    return this.config
  }
}
