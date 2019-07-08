import levelup, { LevelUp } from 'levelup'
import leveldown, { LevelDown } from 'leveldown'

interface ITemplate {
  [key: string]: string[]
}


/** 
 * { templates: { "pristine": ["testing_repo_1", "testing_repo_2", ] } }
*/

export default class DB {
  private db: LevelUp<LevelDown>
  constructor() {
    const db = levelup(leveldown(`${__dirname}/templates-db`))
    this.db = db
  }

  public async addTemplate(owner: string, template: string): Promise<any> {
    const addTemp = async (templates: any) => {
      if(!templates[template]) {
        templates[template] = []
        return await this._add(owner, templates)
      }
    }

    try {
      const templates = await this.getTemplates(owner)
      return await addTemp(templates)
    } catch (error) {
      console.log(error.message)
      return await addTemp({})
    }
  }

  public async addSubscriber(owner: string, template: string, subscriber: string): Promise<any> {
    try {
      if (!subscriber.length) return
      const templates = await this.getTemplates(owner)
      console.log("--- SUBSCRIBER ---", subscriber)

      templates[template] = Array.from([ 
        ...templates[template], 
        subscriber 
      ])

      console.log("--- added_templates ---", templates)
      return await this._add(owner, templates)
    } catch (error) {
      console.log(error.message)
      throw error
    }
  }

  public async getTemplates(owner: string): Promise<ITemplate> {
    try {
      console.log("--- OWNER ---", owner)
      const stringResult = await this.db.get(owner)
      const templates = JSON.parse(stringResult.toString())
      console.log("--- get_template ---", templates)
      return templates
    } catch (error) {
      console.log("--- GET_TEMPLATE ---", error.message)
      throw error
    }
  }

  public async getTemplate(owner: string, template: string): Promise<string[]> {
    const templates = await this.getTemplates(owner)
    return templates[template]
  }

  public async removeTemplate(owner: string, template: string): Promise<any> {
    try {
      const templates = await this.getTemplates(owner)
      delete templates[template]
      this._add(owner, templates)
    } catch (error) {
      console.log(error.message)
      throw error
    }
  }

  public async removeSubscriber(owner: string, template: string, newSubscriber: string): Promise<any> {
    try {
      const templates = await this.getTemplates(owner)
      const subscribers = templates[template]
      const newSubscribersList = subscribers.filter((subscriber: string) => {
        return subscriber !== newSubscriber
      })
      templates[template] = [ ...newSubscribersList ]
      return await this._add(owner, templates)
    } catch (error) {
      console.log(error.message)
      throw error
    }
  }

  private async _add(owner: string, templates: any): Promise<any> {
    console.log("--- TEMPLATES_BEING_ADDED ---", templates)

    try {
      return await this.db.put(owner, JSON.stringify({...templates}))
    } catch (error) {
      console.log(error.message)
      throw error
    }
  }
}
