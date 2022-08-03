import fs from 'fs'
import fetch from 'node-fetch'
import { DateTime } from 'luxon'
import nunjucks from 'nunjucks'
import crypto from 'crypto'
import url from 'url'

const env = nunjucks.configure()
const account = JSON.parse(fs.readFileSync('./_data/account.json').toString())
const photos = JSON.parse(fs.readFileSync('./_data/feed.json').toString())
console.log(`${photos.length} posts`)
const style = fs.readFileSync('./style.css')
if (!fs.existsSync('./public/images')) {
  fs.mkdirSync('./public/images', { recursive: true })
}
const media = [account.profile_pic_url]
const mediaLookup = {}
photos.forEach((photo) => {
  if (photo.carousel_media && photo.carousel_media.length) {
    photo.carousel_media.forEach((item) => {
      media.push(item.image_versions2.candidates[0].url)
    })
  } else {
    media.push(photo.image_versions2.candidates[0].url)
  }
})

let i = -1
const fetchMedia = async () => {
  i += 1
  if (typeof media[i] === 'undefined') {
    setImmediate(() => render())
    return
  }
  const filename = url.parse(media[i]).pathname.split('/').pop()
  mediaLookup[crypto.createHash('sha1').update(media[i]).digest('hex')] =
    filename
  if (fs.existsSync(`./public/images/${filename}`)) {
    setImmediate(() => fetchMedia())
    return
  }
  console.log(media[i])
  const response = await fetch(media[i])
  let arrayBuffer = await response.arrayBuffer()
  let buffer = Buffer.from(arrayBuffer)

  fs.createWriteStream(`./public/images/${filename}`).write(buffer)

  setImmediate(() => fetchMedia())
}

const render = () => {
  env.addGlobal('posts', photos)
  env.addGlobal('style', style)
  env.addGlobal('account', account)

  env.addFilter('localUrl', (str) => {
    const hash = crypto.createHash('sha1').update(str).digest('hex')
    if (typeof mediaLookup[hash] === 'string') {
      return mediaLookup[hash]
    }
    return str
  })

  env.addFilter('timestamp', (str) =>
    DateTime.fromSeconds(str).toLocaleString(DateTime.DATETIME_FULL)
  )

  const template = fs.readFileSync('./template.njk').toString()

  fs.writeFileSync(
    './public/index.html',
    env.renderString(template, { account, photos })
  )
}

fetchMedia()
