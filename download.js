import { IgApiClient } from 'instagram-private-api'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const ig = new IgApiClient()

ig.state.generateDevice(process.env.INSTAGRAM_USER)
;(async () => {
  await ig.simulate.preLoginFlow()
  await ig.account.login(process.env.INSTAGRAM_USER, process.env.INSTAGRAM_PASS)

  process.nextTick(async () => await ig.simulate.postLoginFlow())

  const id = await ig.user.getIdByUsername(process.env.INSTAGRAM_TARGET_USER)

  const user = await ig.user.info(id)
  fs.writeFileSync('./_data/account.json', JSON.stringify(user))

  const photos = []
  const feed = await ig.feed.user(id)
  const getFeed = async () => {
    const items = await feed.items().catch((error) => {
      setImmediate(() => getFeed())
    })
    items.forEach((item) => {
      photos.push(item)
    })
    if (feed.isMoreAvailable()) {
      setImmediate(() => getFeed())
      return
    }
    fs.writeFileSync('./_data/feed.json', JSON.stringify(photos))
  }
  getFeed()
})()
