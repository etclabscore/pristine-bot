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
      const masterChanges = [ ...head_commit.added, ...head_commit.modified ]

      const latestChanges = await getBatchedChanges(masterChanges, repos.getContents)

      const reposList = await genericAsyncFunction(repos.listForOrg, [
        { 
          org: ORG
        }
      ] /**, console.log*/)

      console.log("REPOSLIST :: ==>", reposList)

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

        const filesToCommit = await createBlob(latestChanges, gitdata.createBlob, repo.name)

        const newTree = await genericAsyncFunction(gitdata.createTree, [{ 
          owner: ORG,
          repo:  repo.name,
          tree: filesToCommit,
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

      submitBatchPR(names, pullRequests.create)
    }
  })
}

async function createBlob(latestChanges: any, createBlob: any, name: string) {
  return await Promise.all(latestChanges.map(async (changes: any) => {
    const blob = await genericAsyncFunction(createBlob, [{ 
      owner: ORG,
      repo: name,
      content: changes.content
    }])

    return {
      sha: blob.data.sha,
      path: changes.path,
      mode: '100644',
      type: 'blob'
    }
  }))
}

async function submitBatchPR(names: any, create: any) {
  return await Promise.all(names.forEach((name: any) => {
    return submitPR(name, create)
  }));
}

function submitPR(name: string, create: any) {
  genericAsyncFunction(create, [{
    owner: ORG,
    repo: name,
    title: "Pristine has been updated!",
    head: BRANCH_REF,
    base: "refs/heads/master"
  }] /**, console.log*/)
}

async function getBatchedChanges(masterChanges: any, getContents: any ) {
  return await Promise.all(masterChanges.map((path: any) => {
    return getPushedChange(getContents, path)
  }))
}

async function getPushedChange(getContents: any, path: string) {
  const { data: { content } } = await genericAsyncFunction(getContents, [{
    owner: ORG,
    repo: HEAD_REPO,
    path,
    ref: "refs/heads/master"
  }] /**, console.log*/)

  const buff = Buffer.from(content, 'base64')
  const text = buff.toString("utf8")

  return { content: text, path }
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
