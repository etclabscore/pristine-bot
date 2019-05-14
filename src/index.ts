import { Application } from "probot" // eslint-disable-line no-unused-vars
const { Clone, Remote } = require("nodegit") // eslint-disable-line no-unused-vars

const ORG = "Oakland-Blockchain-Developers" // TODO: change to OPEN_RPC org.
const HEAD_REPO = "testing_repo" // TODO: change to Pristine
const HEAD_REMOTE_URL = `https://github.com/${ORG}/${HEAD_REPO}.git`
const HEAD_REMOTE_ORIGIN = "test"

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
      
      data.map((repo: any) => {
        return Clone(repo.clone_url, `tmp/repos/${repo.name}`)
          .then((clone: any) => {
            Remote.setUrl(
              clone,
              HEAD_REMOTE_ORIGIN,
              HEAD_REMOTE_URL
            )

            const fetchResult = Promise.resolve(clone.fetchAll())

            return { clone, fetchResult }
          })
      })
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