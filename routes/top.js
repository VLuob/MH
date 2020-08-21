const topList = [{
  name: 'top',
  pattern: '/top/:type(shots|article|author)/:rank(total|week|sharp)*',
  page: '/top',
},{
  name: 'top-url',
  pattern: '/top/:type(shots|article|author)!:rankType!:ranking*',
  page: '/top',
},{
  name: 'top-url-noranking',
  pattern: '/top/:type(shots|article|author)!:rankType*',
  page: '/top',
}]

module.exports = topList