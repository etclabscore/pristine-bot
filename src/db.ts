import levelup, { LevelUp } from 'levelup'
import leveldown, { LevelDown } from 'leveldown'

interface IDBOptions {
  owner: string
  template: string
}

interface ITemplate {
  [key: string]: string[]
}


/** 
 * { templates: { "pristine": ["testing_repo_1", "testing_repo_2", ] } }
*/

export default class DB {
  private db: LevelUp<LevelDown>
  private options: IDBOptions
  constructor(options: IDBOptions) {
    const db = levelup(leveldown(`${__dirname}/templates-db`))

    db.get(options.owner, (error, value) => {
      if(error) throw error
      if(!JSON.parse(value.toString())) {
        db.put(options.owner, JSON.stringify({
          templates: {}
        }))
      }
    })

    this.db = db
    this.options = options
  }

  public async addTemplate(): Promise<any> {
    try {
      const { template } = this.options
      const templates = await this.getTemplates()
      if(!templates[template]) {
        templates[template] = []
        return await this._add(templates)
      }
    } catch (error) {
      console.log(error.message)
      throw error
    }
  }

  public async addSubscriber(name: string): Promise<any> {
    try {
      const { template } = this.options
      const templates = await this.getTemplates()
      const subscribers = templates[template]
      templates[template] = [...subscribers, name]
      return await this._add(templates)
    } catch (error) {
      console.log(error.message)
      throw error
    }
  }

  public async getTemplates(): Promise<ITemplate> {
    try {
      const { template } = this.options
      const stringResult = await this.db.get(template).toString()
      const { templates } = JSON.parse(stringResult)
      return templates
    } catch (error) {
      console.log(error.message)
      throw error
    }
  }

  public async removeTemplate(): Promise<any> {
    try {
      const { template } = this.options
      const templates = await this.getTemplates()
      delete templates[template]
      this._add({ ...templates })
    } catch (error) {
      console.log(error.message)
      throw error
    }
  }

  /** TODO: removing subscribers of a template
  public async removeSubscriber(): Promise<any> {
    try {
      const { template } = this.options
      const templates = await this.getTemplates()
      const subscribers = templates[template]
      templates[template] = [...subscribers, name]
      return await this._add(templates)
    } catch (error) {
      console.log(error.message)
      throw error
    }
  }
  */

  private async _add(templates: any): Promise<any> {
    try {
      const { owner } = this.options
      return await this.db.put(owner, JSON.stringify({ ...templates })) 
    } catch (error) {
      console.log(error.message)
      throw error
    }
  }
}
