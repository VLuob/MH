const routes = module.exports = require('next-routes')()

const compositionRouteList = require('./composition')
const accountRouteList = require('./account')
const articleRouteList = require('./article')
const authorRouteList = require('./author')
const shotsRouteList = require('./shots')
const subjectList = require('./subject')
const contactList = require('./contact')
const mainRouteList = require('./main')
const topicRouteList = require('./topic')
const topRouteList = require('./top')
const tagRouteList = require('./tag')
const collectionRouteList = require('./collection')
const unsubscribeRouteList = require('./unsubscribe')
const pricingRouteList = require('./pricing')
const discoverRouteList = require('./discover')
const enquiryRouteList = require('./enquiry')
const serviceRouteList = require('./service')

const routeLists = [
    ...subjectList,
    ...mainRouteList,
    ...unsubscribeRouteList,
    ...compositionRouteList,
    ...shotsRouteList,
    ...authorRouteList, 
    ...articleRouteList,
    ...accountRouteList, 
    ...contactList,
    ...topicRouteList,
    ...topRouteList,
    ...tagRouteList,
    ...collectionRouteList,
    ...pricingRouteList,
    ...discoverRouteList,
    ...enquiryRouteList,
    ...serviceRouteList,
]

let routerRun = ''
routeLists.forEach((l, i) => {
    i === 0 && (routerRun += `routes`)

    routerRun += `.add('${l.name}', '${l.pattern}', '${l.page}')`
})

eval(routerRun)