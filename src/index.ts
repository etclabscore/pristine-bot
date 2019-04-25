import { Probot } from "probot"
import Repo, { IRepoOptions, IPROptions } from "./repo"
import PristineBot from "./bot"
import { IBotConfig, IRepo } from "./default-config"
import * as BotHelpers from "./helpers"


export default async function boostrap(config: any): Promise<any> {
  const pristine = new PristineBot(config)
  await Probot.run(pristine.start)
  return pristine
}

export { Repo, IBotConfig, IRepo, BotHelpers, IRepoOptions, IPROptions }
