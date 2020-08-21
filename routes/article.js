const articleList = [{
    name: 'article',
    pattern: '/article',
    page: '/article'
},{
    name: 'article-url',
    pattern: '/article!:sort',
    page: '/article'
},{
    name: 'article-detail',
    pattern: '/article/:id',
    page: '/article/ArticleDetail'
},{
    name: 'article-preview',
    pattern: '/article/preview/:id',
    page: '/article/ArticlePreview'
}]

module.exports = articleList