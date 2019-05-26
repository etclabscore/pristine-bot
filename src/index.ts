import { Application } from "probot" // eslint-disable-line no-unused-vars

const HEAD_REPO = "Pristine"
const ORG = "Oakland-Blockchain-Developers"
const BRANCH_REF = "refs/heads/feat/pristine"

export = (app: Application) => {
  app.on("push", async (context) => {
    const { 
      github: { repos, gitdata, pullRequests },
      payload: { repository, ref, head_commit }
    } = context

    const isPublishRepo = (
      repository.name === HEAD_REPO && ref === "refs/heads/master"
    )

    if (isPublishRepo)  {
      const reposList = await genericAsyncFunction(repos.listForOrg, [
        { 
          org: ORG
        }
      ] /**, console.log*/)

      const repoNames = reposList.data.map(async (repo: any) => {
        const oldCommit = await genericAsyncFunction(repos.getCommitRefSha, [{
          owner: ORG,
          repo: repo.name,
          ref: "refs/heads/master"
        }] /**, console.log*/)

        console.log("OLD_DATA :: ==>", oldCommit.data.sha)

        await genericAsyncFunction(gitdata.createRef, [{
          owner: ORG,
          repo: repo.name,
          ref: BRANCH_REF,
          sha: oldCommit.data.sha
        }] /**, console.log*/)

        const filesToCommit: any = head_commit.modified.map(async (path: string) => {
          const { data: { content } } = await genericAsyncFunction(repos.getContents, [{
            owner: ORG,
            repo: HEAD_REPO,
            path,
            ref: "refs/heads/master"
          }] /**, console.log*/)

          const buff = Buffer.from(content, 'base64');  
          const text = buff.toString();

          const blob = await genericAsyncFunction(gitdata.createBlob, [{ 
            owner: ORG,
            repo: repo.name,
            content: text
          }])

          return {
            sha: blob.data.sha,
            path,
            mode: '100644',
            type: 'blob'
          }
        })

        const fileBlobs = await Promise.all(filesToCommit)

        const newTree = await genericAsyncFunction(gitdata.createTree, [{ 
          owner: ORG,
          repo:  repo.name,
          tree: fileBlobs,
          base_tree: oldCommit.data.commit.tree.sha
        }])

        console.log("NEW_TREE :: ==>", newTree.data.tree)

        const newCommit = await genericAsyncFunction(gitdata.createCommit, [{
          owner: ORG,
          repo: repo.name,
          parents: [oldCommit.data.sha],
          tree: newTree.data.sha,
          message: "feat: new pristine changes"
        }])

        console.log("NEW_COMMIT :: ==>", newCommit.data.sha)

        await genericAsyncFunction(gitdata.updateRef, [{
          owner: ORG,
          repo: repo.name,
          ref: "heads/feat/pristine",
          sha: newCommit.data.sha,
          force: true
        }] /**, console.log*/)

        return repo.name;
      })

      const names = await Promise.all(repoNames)

      names.forEach((name: any) => {
        genericAsyncFunction(pullRequests.create, [{
          owner: ORG,
          repo: name,
          title: "Pristine has been updated!",
          head: BRANCH_REF,
          base: "refs/heads/master"
        }] /**, console.log*/)
      });
    }
  })
}

async function genericAsyncFunction(func: any, args: any /**, logger: any*/) {
  // if(logger) logger(`Method: ${func.name}\n${JSON.stringify(args)}`)

  try {
    const result = await func(...args)
    return result
  } catch (error) {
    console.error("THESE_ARE_ERRORS :: ==>", error)
  }
}