const collectionList = [{
    name: 'collection',
    pattern: '/collection',
    page: '/collection',
}, {
    name: 'collection-detail',
    pattern: '/collection/:id/:type(shots|article)*',
    page: '/collection/CollectionDetail',
}]

module.exports = collectionList