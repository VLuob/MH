const subjectList = [
//     {
//     name: 'search',
//     pattern: '/search/:tab(shots|article|author|brand|tag|topic)*',
//     page: '/subject/search'
// }, 
{
    name: 'search',
    pattern: '/search!:k',
    page: '/subject/search'
}, 
{
    name: 'search-type-url',
    pattern: '/search/:type!:k!:sort*!:category*!:form*!:classification*!:authorType*!:budgetType*',
    page: '/subject/search'
}, 
{
    name: 'search-type-sort-url',
    pattern: '/search/:type!:k!:sort*!:category*!:form*!:classification*!:authorType*',
    page: '/subject/search'
}, 
{
    name: 'search-type-sort',
    pattern: '/search/:type!:k!:sort*',
    page: '/subject/search'
}, 
{
    name: 'search-type',
    pattern: '/search/:type!:k',
    page: '/subject/search'
}, 

{
    name: 'brand',
    pattern: '/brand/:id/:tab(shots|article)*',
    page: '/subject/brand'
}, {
    name: 'article-classify',
    pattern: '/channel/:id',
    page: '/subject/articlassify'
}]

module.exports = subjectList