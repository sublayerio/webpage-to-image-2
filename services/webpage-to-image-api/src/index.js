const pkg = require('../package.json')
const puppeteer = require('puppeteer')
const express = require('express')
const uuid = require('uuid')
const path = require('path')
const fs = require('fs')
const morgan = require('morgan')
const app = express()

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const mkdir = (path, options) => new Promise((resolve, reject) => {

    fs.mkdir(path, options, (err, result) => {

        if (err) {
            reject(err)
            return
        }

        resolve(result)
    })
})

const PORT = process.env.PORT || 3000

app.use(morgan('combined'))

app.use('/examples', express.static(__dirname + '/examples'))

app.get('/image', async (req, res) => {

    try {

        const url = req.query.url

        const width = req.query.width ? parseInt(req.query.width, 10) : 1920
        const height = req.query.height ? parseInt(req.query.height, 10) : 1080

        const timeout = req.query.timeout ? Math.min(30000, parseInt(req.query.timeout, 10)) : 0
        const quality = req.query.quality ? Math.max(0, Math.min(100, parseInt(req.query.quality, 10))) : undefined
        const omitBackground = req.query.omitBackground ? req.query.omitBackground === 'true' : false
        const type = req.query.type === 'jpg' ? 'jpg' : 'png'
        const fullPage = req.query.fullPage ? req.query.fullPage === 'true' : false
        const download = req.query.download ? req.query.download === 'true' : false
        const filename = req.query.filename ? req.query.filename : `download.${type}`
        
        const clipX = req.query.clipX ? parseInt(req.query.clipX, 0) : null
        const clipY = req.query.clipY ? parseInt(req.query.clipY, 0) : null
        const clipWidth = req.query.clipWidth ? parseInt(req.query.clipWidth, 0) : null
        const clipHeight = req.query.clipHeight ? parseInt(req.query.clipHeight, 0) : null

        let clip = null

        if (clipX !== null || clipX !== null || clipWidth !== null || clipHeight !== null) {

            clip = {
                x: clipX !== null ? clipX : 0,
                y: clipY !== null ? clipY : 0,
                width: clipWidth !== null ? clipWidth : width,
                height: clipHeight !== null ? clipHeight : height
            }
        }

        if (!url) {
            throw new Error('No url provided. Add the url using the ?url query parameter')
        }

        const id = uuid.v4()

        await mkdir(__dirname + '/tmp').catch(() => {
            // do nothing, already exists
        })

        const filepath = path.resolve(__dirname + `/tmp/${id}.${type}`)

        const browser = await puppeteer.launch({
            args: [
                // Required for Docker version of Puppeteer
                '--no-sandbox',
                '--disable-setuid-sandbox',
                // This will write shared memory files into /tmp instead of /dev/shm,
                // because Docker’s default for /dev/shm is 64MB
                '--disable-dev-shm-usage',
            ]
        })

        const page = await browser.newPage()

        await page.setViewport({
            width,
            height
        })

        await page.goto(url, { waitUntil: 'networkidle2' })

        await wait(timeout)

        await page.screenshot({
            path: filepath,
            fullPage,
            omitBackground,
            quality,
            clip
        })

        await browser.close()

        const file = fs.createReadStream(filepath)

        file.on('end', function () {
            fs.unlink(filepath, (err) => {
                if (err) {
                    console.log('unlink err', err)
                }
            })
        })

        if (download) {
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
            res.setHeader('Content-Type', `image/${type === 'png' ? 'png' : 'jpeg'}`)
        }

        file.pipe(res)

    } catch (e) {
        res.send(e.message)
    }
})

app.get("/", (req, res) => {
    res.send({
        name: pkg.name,
        version: pkg.version
    })
})

app.listen(PORT, () =>
    console.log(`${pkg.name}@${pkg.version} running at port ${PORT}`)
)