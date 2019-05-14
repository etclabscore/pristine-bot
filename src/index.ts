import { Application } from "probot" // eslint-disable-line no-unused-vars
// const nodegit = require("nodegit") // eslint-disable-line no-unused-vars

const ORG = "Oakland-Blockchain-Developers"
const HEAD_REPO = "testing_repo"
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
      const { data } = await repos.listForOrg(
        { 
          org: ORG
        }
      )
      
      console.log("LIST :: ==>", data)
    }
  })
}
