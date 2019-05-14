import { Application } from "probot" // eslint-disable-line no-unused-vars
const { Clone } = require("nodegit") // eslint-disable-line no-unused-vars

const ORG = "Oakland-Blockchain-Developers" // TODO: change to OPEN_RPC org.
const HEAD_REPO = "testing_repo" // TODO: change to Pristine
const HEAD_REMOTE = `https://github.com/${ORG}/${HEAD_REPO}.git`

console.log("HEAD_REMOTE :: ==>", HEAD_REMOTE)

export = (app: Application) => {
  app.on("push", async (context) => {
    const { 
      github: { repos },
      payload: { repository, ref }
    } = context

    const isHeadPepo = (
      repository.name === HEAD_REPO && ref === "refs/heads/master"
    )

    if (isHeadPepo) {
      const { data } = await genericAsyncFunction(repos.listForOrg,[
        { 
          org: ORG 
        }
      ])
      
      const clones = data.map((repo: any) => {
        return Clone(repo.clone_url, `tmp/repos/${repo.name}`)
          .then((clone: any) => {
            console.log("SINGLE_CLONE :: ==>", clone)
            return clone;
          })
      })

      console.log("CLONES :: ==>", clones)
    }
  })
}

async function genericAsyncFunction(func: any, args: any) {
  try {
    const result = await func(...args)
    return result
  } catch (error) {
    console.error(`ERROR: ${error.message}`)
  }
}