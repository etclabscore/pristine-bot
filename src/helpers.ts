import { ensureDirSync } from "fs-extra"
import { IRepoOptions } from "./repo"
import { assign } from "lodash"
import { IBotConfig } from "./default-config";

export function isTemplateRepo(eventRepo: string, templateRepo: string, eventRef: string): boolean {
  return eventRepo === templateRepo && eventRef === "refs/heads/master"
}

export function createRootReposDirPath(dirname: string): string {
  return `${dirname}/tmp/repos` 
}

export function createOptions(options: any[]) {
  return assign({}, ...options)
}
 
export function createRootReposDir(rootPath: string) {
  const reposRootDir = createRootReposDirPath(__dirname)
  ensureDirSync(reposRootDir)
  return reposRootDir
}

export function createSSHUrl(owner: string, repoName: string) { 
  return `git@github.com:${owner}/${repoName}.git`
}

export function createTemplateOptions(config: IBotConfig) {
  const remoteUrl = createSSHUrl(config.owner, config.repoName)
  return createOptions([config, { remoteUrl }] as IRepoOptions[])
}
