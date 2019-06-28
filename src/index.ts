import { Probot } from "probot"
import dotenv from "dotenv"
import Repo, { IRepoOptions, IPROptions } from "./repo"
import Bot from "./bot"
import { IBotConfig, IRepo } from "./default-config"
import * as BotHelpers from "./helpers"

function configureBots(configs: any) {
  return configs.templateConfigs.map((config: any) => {
    return new Bot({
      owner: configs.owner,
      reposRootDir: configs.workingDir,
      repoName: config.template,
      listeningRepos: config.listeningRepos
    } as IBotConfig)
  })
}

function startBots(bots: Bot[]) {
  return bots.map((bot: Bot) => bot.start)
}

export default async function boostrap(config: any): Promise<any> {
  dotenv.config()
  const botInstances = configureBots(config)
  const bots = startBots(botInstances)
  const cert = (process.env.PRIVATE_KEY || "")
  
  const probot = new Probot({
    cert: cert.replace(/\\n/g, '\n'),
    id: Number(process.env.APP_ID),
    port: Number(process.env.PORT) || 3000,
    secret: process.env.WEBHOOK_SECRET,
    webhookPath: process.env.WEBHOOK_PATH,
    webhookProxy: process.env.WEBHOOK_PROXY_URL
  })
  probot.setup(bots)
  probot.start()
  return botInstances
}

export { Repo, Bot, IBotConfig, IRepo, BotHelpers, IRepoOptions, IPROptions }
