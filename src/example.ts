import PristineBot, { Repo } from "./"

const config = {
  owner: "Oakland-Blockchain-Developers",
  repoName: "Pristine",
  rootReposDir: __dirname,
}

async function startBot() {
  const bot = await PristineBot(config)

  bot.on("error", async (error: any) => {
    console.log("-- REPO_PR_ERROR --", error)
  })

  bot.on("submitted", async (repo: Repo) => {
    console.log("-- REPO_PR_SUBMITTED --", repo)
  })

  bot.on("completed", async (repos: Repo[]) => {
    console.log("-- ALL_REPO_PRS_SUBMITTED --", repos)
  })
}

startBot()
