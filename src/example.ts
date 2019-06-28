import PristineBot, { Repo } from "./"

const config = { 
  owner: "etccorelabs",
  workingDir: __dirname,
  templateConfigs: [
    {
      template: "pristine",
      listeningRepos: [
        "testing_repo_1", 
        "testing_repo_2"
      ]
    }, 
    {
      template: "pristine-typescript",
      listeningRepos: [ 
        "testing_repo_3" 
      ]
    }
  ]
}

async function startBot() {
  const bots = await PristineBot(config)

  bots.map((bot: any, index: number) => {
    console.log("-- BOT --", index, bot);
    
    bot.on("error", async (error: any) => {
      console.log("-- REPO_PR_ERROR --", error)
    })
  
    bot.on("submitted", async (repo: Repo) => {
      console.log("-- REPO_PR_SUBMITTED --", repo)
    })
  
    bot.on("completed", async (repos: Repo[]) => {
      console.log("-- ALL_REPO_PRS_SUBMITTED --", repos)
    })
  })
}

startBot()
