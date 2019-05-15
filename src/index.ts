import { Application } from "probot" // eslint-disable-line no-unused-vars
const { Clone /**, Branch, Cherrypick*/} = require("nodegit") // eslint-disable-line no-unused-vars

const ORG = "Oakland-Blockchain-Developers" // TODO: change to OPEN_RPC org.
const HEAD_REPO = "testing_repo" // TODO: change to Pristine
// const HEAD_PULL_BRANCH = 'feat/new_pristine_changes'

export = (app: Application) => {
  app.on("push", async (context) => {
    const { 
      github: { repos },
      payload: { repository, ref, after }
    } = context

    const isHeadPepo = (
      repository.name === HEAD_REPO && ref === "refs/heads/master"
    )

    if (isHeadPepo) {
      const { data } = await genericAsyncFunction(repos.listForOrg, [
        { 
          org: ORG 
        }
      ])

      Clone.clone(repository.clone_url, `tmp/head/${HEAD_REPO}`)
        .then((repo: any) => {
          return repo.getMasterCommit();
        })
        .then((firstCommitOnMaster: any) => {
            return firstCommitOnMaster.getTree();
        })
        .then((tree: any) => {
          data.forEach((repo: any) => {
            Clone.clone(repo.clone_url, `tmp/repos/${repo.name}`)
              .then((clone: any) => {
                clone.getMasterCommit()
                  .then((commit: any) => {
                    commit.getTree()
                      .then((subtree: any) => {
                        console.log("SUB_TREE :: ==>", subtree)
                        return subtree.diff(tree, () => {})
                      })
                      .then((diffList: any) => {
                        console.log("DIFF_LIST :: ==>", diffList)
                      })
                      .catch((error: any) => { console.log("ERROR_TREE :: ==>", error) })
                    // Branch.create(clone, HEAD_PULL_BRANCH, commit, 1)
                    //   .then(() => {
                    //     return commit.getTree()
                    //   })
                    //   .then((subTree: any) => { 
                    //     return subTree.diff(tree, () => { console.log("DIFF_CALLBACK") })
                    //   })
                    //   .then((diffList: any) => {
                    //     console.log("difflist :: ==>", diffList)
                    //   })
                    //   .catch((error: any) => {
                    //     console.error("ERROR :: =>", error)
                    //   })
    
                    return commit
                  })
              })
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