const next = require('next')
const routes = require('./routes')
const cacheableResponse = require('cacheable-response')
const compression = require('compression')
const LRUCache = require('lru-cache')
const path = require('path')

const app = next({ dev: process.env.NODE_ENV !== 'production' })
const handler = routes.getRequestHandler(app)
const express = require('express')
const bodyParser = require('body-parser')
const { parse } = require('url')
const { createServer } = require('http')


const log4js = require('./base/log/log')
const logInfo = log4js.getLogger('things')
const logError = log4js.getLogger('error')

const ssrCache = new LRUCache({
    max: 100,
    maxAge: 1000 * 60 * 60 // 1hour
})

function renderAndCache (req, res) {
  if (ssrCache.has(req.url)) {
    return res.send(ssrCache.get(req.url))
  }

  // Match route + parse params
  const {route, params} = routes.match(req.url)
  if(!route) return handler(req, res)

  app.renderToHTML(req, res, route.page, params).then((html) => {
    ssrCache.set(req.url, html)
    res.send(html)
  })
  .catch((err) => {
    app.renderError(err, req, res, route.page, params)
  })
}

app.prepare().then(() => {
    const srv = express()
    srv.use(bodyParser.urlencoded({ extended: false }))
    
    /**
     * 微信分享
     */
    srv.use('/MP_verify_AuCa2UHkgRyzPdwI.txt', (req, res) => {
        res.sendFile(path.resolve(__dirname, './static/images/MP_verify_AuCa2UHkgRyzPdwI.txt'))
    })

    srv.use('/card/:id', (req, res) => {
      const id = req.params.id
      const html = getCardRenderHtml(id)
      res.send(html)
    })

    srv.post('/record-log', (req, res) => {
      const data = req.body
      switch (data.type) {
        case 'error':
          logError.error(data.msg)
          break;
        default:
          logInfo.info(data.msg)
          break;
      }
      res.send('')
    })

    srv.get('*', (req, res) => {
        const parsedUrl = parse(req.url, true)
        const { pathname, query } = parsedUrl
        // logInfo.debug('This little thing went to market');
        // logInfo.info('This little thing stayed at home');
        // logInfo.error('This little thing had roast beef');
        // logInfo.fatal('This little thing had none');
        // logInfo.trace('and this little thing went wee, wee, wee, all the way home.');

        // logError.debug('This little thing went to market');
        // logError.info('This little thing stayed at home');
        // logError.error('This little thing had roast beef');
        // logError.fatal('This little thing had none');
        // logError.trace('and this little thing went wee, wee, wee, all the way home.');

        return handler(req, res, parsedUrl)
    })

    // srv.get('*', (req, res) => {
    //     return ssrCache({ req, res, pagePath: '/' })
    // })

    srv.listen(6005, '0.0.0.0', err => {
        if(err) throw err

        console.log('> Ready on http://metest.meihua.info:6005')
    })

    // createServer((req, res) => {
    //     // Be sure to pass `true` as the second argument to `url.parse`.
    //     // This tells it to parse the query portion of the URL.
    //     const parsedUrl = parse(req.url, true)
    //     const { pathname, query } = parsedUrl
    //     const options = {
    //         root: __dirname + '/static/',
    //         headers: {
    //             'Content-Type': 'text/plain;charset=UTF-8',
    //         }
    //     }

    //     if(pathname === '/txt') {
    //         // res.writeHead(302, { Location: `/` })
    //         // res.end()
    //     }

    //     handler(req, res, parsedUrl)

    //     // if(pathname === '/signin') {
    //         // console.log(1)
    //     //     app.render(req, res, '/', query)
    //     // } else if(pathname === '/author') {
    //     //     // console.log(2)
    //     //     app.render(req, res, '/author', query)
    //     // } else {
    //     //     handler(req, res, parsedUrl)
    //     // }
    // }).listen(6005, '0.0.0.0', err => {
    //     if(err) throw err

    //     console.log('> Ready on http://metest.meihua.info:6005')
    // })
}).catch(err => {
  console.log('prepare err', err)
})



const getCardRenderHtml = (id) => {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta name="viewport" content="width=device-width" />
  <title>分享卡片-梅花网</title>
    <style>
          body {background:#000;}
          .img {width: 750px;margin: 30px auto 0;}
          img {height:100%;}
          .btn,.btn-cover {width: 750px;position: fixed;text-align: center;padding: 10px 0; margin-top: 10px;}
          .div_img {width: 750px;margin: 0 auto;height:500px;text-align:center;}
          .md_saveImg {background: #404040;margin-left: 20px;color: #ffffff;width: 230px;height: 40px;border-radius: 20px;font-size: 18px;text-align: center;line-height: 40px;letter-spacing: 2px;cursor: pointer;margin: 10px auto;}
           .md_saveImg a {color:#ffffff;}
          .btn-cover {background: #000;opacity:0.5;}
          .font-in {width: 341px;margin: auto; white-space: pre-wrap;color: gray;}
          @media screen and (max-width: 750px) {.div_img, .btn,.btn-cover,.img {width: 100%;}}
          @media screen and (max-width: 341px) {.font-in {width: 100%;}}
      </style>
  </head>
  <body>
      <div class="img">
          <div class="div_img">
          <img src="https://resource.meihua.info/${id}">
              </div>
          <div class="btn">
              <div class="font-in">请长按保存本地后，再分享到朋友圈</div>
          </div>
      </div>
  </body>
  </html>
  `
}