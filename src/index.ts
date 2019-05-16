import { Application } from "probot" // eslint-disable-line no-unused-vars

const ORG = "Oakland-Blockchain-Developers" // TODO: change to OPEN_RPC org.
const HEAD_REPO = "testing_repo" // TODO: change to Pristine
const HEAD_PULL_BRANCH = 'feat/new_pristine_changes'

export = (app: Application) => {
  app.on("push", async (context) => {
    const { 
      github: { repos, gitdata, pullRequests},
      payload: { repository, ref, head_commit }
    } = context

    const isHeadPepo = (
      repository.name === HEAD_REPO && ref === "refs/heads/master"
    )

    if (isHeadPepo) {
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

        const refExists = await genericAsyncFunction(repos.getCommitRefSha, [{
          owner: ORG,
          repo: repo.name,
          ref: `heads/${HEAD_PULL_BRANCH}`
        }] /**, console.log*/)

        console.log('REF_EXISTS :: =>', refExists)

        if(!refExists) {
          await genericAsyncFunction(gitdata.createRef, [{
            owner: ORG,
            repo: repo.name,
            ref: `refs/heads/${HEAD_PULL_BRANCH}`,
            sha
          }] /**, console.log*/)
        }

        // this gets you file sha
        const contents = head_commit.modified.map(async (path: string) => {
          const oldContent = await genericAsyncFunction(repos.getContents, [{
            owner: ORG,
            repo: repo.name,
            path
          }] /**, console.log*/)

          console.log("OLD_CONTENTS :: ==>", oldContent)

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
              branch: `refs/heads/${HEAD_PULL_BRANCH}`
            }] /**, console.log*/)
          } else {
            console.log("CREATE !!!");
            genericAsyncFunction(repos.createFile, [{
              owner: ORG,
              repo: repo.name,
              path: file.data.name,
              message: "feat: new pristine changes",
              content: file.data.updatedContents,
              branch: `refs/heads/${HEAD_PULL_BRANCH}`
            }] /**, console.log*/)
          }
        })

        await genericAsyncFunction(pullRequests.create, [{
          owner: ORG,
          repo: repo.name,
          title: "Pristine has been updated!",
          head: `refs/heads/${HEAD_PULL_BRANCH}`,
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