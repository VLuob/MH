const authorList = [{
    name: 'author',
    pattern: '/author',
    page: '/author'
}, 
{
    name: 'author-url',
    pattern: '/author!:sort!:type!:province!:city!:formCode',
    page: '/author'
}, 
// {
//     name: 'author-url',
//     pattern: '/author!:sort!:type!:province!:city',
//     page: '/author'
// }, 
{
    name: 'author-detail',
    pattern: '/author/:code/:tab(service|shots|article|about)*',
    page: '/author/AuthorDetail'
}]

module.exports = authorList