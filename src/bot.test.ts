import { EventEmitter } from "events";
import { removeSync } from "fs-extra";
import Bot from "./bot"
import Config from "./default-config";
import { defaultConfig } from "./fixture"

describe("#Bot", () => {
  let bot: Bot
  beforeAll(() => {
    bot = new Bot(defaultConfig)
  });

  afterAll(() => {
    removeSync("./tmp")
  })

  test("that Bot is constructed", () => {
    expect(bot.events).toBeInstanceOf(EventEmitter)
    expect(bot.config).toBeInstanceOf(Config)
  })
})
