const shotsList = [{
  name: 'shots',
  pattern: '/shots',
  page: '/shots'
},{
  name: 'shots-url',
  pattern: '/shots!:sort!:category!:form!:province!:city',
  page: '/shots'
},{
  name: 'shots-detail',
  pattern: '/shots/:id',
  page: '/shots/ShotsDetail'
},{
  name: 'shots-preview',
  pattern: '/shots/preview/:id',
  page: '/shots/ShotsPreview'
}]

module.exports = shotsList