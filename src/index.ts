import { Application } from "probot" // eslint-disable-line no-unused-vars
import MasterRepo from "./publish_repo"

const HEAD_REPO = "Pristine" // Abstract

export = (app: Application) => {
  app.on("push", async (context) => {
    const { 
      github: { repos, gitdata, pullRequests },
      payload: { repository, ref, head_commit, after }
    } = context

    const isPublishRepo = (
      repository.name === HEAD_REPO && ref === "refs/heads/master"
    )

    if (isPublishRepo)  {
      const masterRepo = new MasterRepo({
        owner: "Oakland-Blockchain-Developers",
        repo: "Pristine",
        gitAPI: context.github,
        payload: context.payload,
        headPullBranch: 'feat/pristine_changes'
      })

      const ORG = masterRepo.getOwner()
      const MASTER_REF = masterRepo.createNewRefText(
        masterRepo.getHeadPullBranch(), 
        after.substring(0, 7)
      )

      const { data } = await genericAsyncFunction(repos.listForOrg, [
        { 
          org: ORG
        }
      ] /**, console.log*/)

      data.forEach(async (repo: any) => {
        const { data: { sha } } = await genericAsyncFunction(repos.getCommitRefSha, [{
          owner: ORG,
          repo: repo.name,
          ref: "refs/heads/master"
        }] /**, console.log*/)

        await genericAsyncFunction(gitdata.createRef, [{
          owner: ORG,
          repo: repo.name,
          ref: MASTER_REF,
          sha
        }] /**, console.log*/)

        // this gets you file sha
        const contents = head_commit.modified.map(async (path: string) => {
          
          // TODO: moving to publish_repo.ts
          const oldContent = await genericAsyncFunction(repos.getContents, [{
            owner: ORG,
            repo: repo.name,
            path
          }] /**, console.log*/)

          const { data: { content } } = await genericAsyncFunction(repos.getContents, [{
            owner: ORG,
            repo: HEAD_REPO,
            path
          }] /**, console.log*/)

          if (oldContent) {  
            oldContent.data.updatedContents = content
            oldContent.fileExists = true
            return oldContent
          } else {
            return new Promise((resolve) => {
              resolve({ 
                fileExists: false, 
                data: { updatedContents: content, name: path } 
              })
            })
          }
        })

        const result = await Promise.all(contents)

        result.forEach((file: any) => {
          console.log("FILE :: ==>", file)

          if(file.fileExists) {
            console.log("UPDATE !!!");
            console.log("FILE :: ++>", file)
            genericAsyncFunction(repos.updateFile, [{
              owner: ORG,
              repo: repo.name,
              path: file.data.name,
              message: "feat: new pristine changes",
              content: file.data.updatedContents,
              sha: file.data.sha,
              branch: MASTER_REF
            }] /**, console.log*/)
          } else {
            console.log("CREATE !!!");
            genericAsyncFunction(repos.createFile, [{
              owner: ORG,
              repo: repo.name,
              path: file.data.name,
              message: "feat: new pristine changes",
              content: file.data.updatedContents,
              branch: MASTER_REF
            }] /**, console.log*/)
          }
        })

        await genericAsyncFunction(pullRequests.create, [{
          owner: ORG,
          repo: repo.name,
          title: "Pristine has been updated!",
          head: MASTER_REF,
          base: "refs/heads/master"
        }] /**, console.log*/)
      })
    }
  })
}

async function genericAsyncFunction(func: any, args: any /**, logger: any*/) {
  // if(logger) logger(`Method: ${func.name}\n${JSON.stringify(args)}`)

  try {
    const result = await func(...args)
    return result
  } catch (error) {
    console.error(`ERROR: ${JSON.stringify(error.message, null, 4)}`)
  }
}