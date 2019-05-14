import { Application } from "probot" // eslint-disable-line no-unused-vars

export = (app: Application) => {
  app.on("push", async (context) => {
    const { github, payload } = context

    console.log('GITHUB :: ==>', github);
    console.log('payload :: ==>', payload);
  })
}
