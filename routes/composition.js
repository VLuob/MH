const compositionList = [{
  name: 'article-new',
  pattern: '/article/new',
  page: '/composition'
},{
  name: 'article-invite',
  pattern: '/article/invite',
  page: '/composition/Invite'
}, {
  name: 'article-edit',
  pattern: '/article/edit/:id',
  page: '/composition',
}, {
  name: 'shots-new',
  pattern: '/shots/new',
  page: '/composition',
}, {
  name: 'shots-invite',
  pattern: '/shots/invite',
  page: '/composition/Invite',
}, {
  name: 'shots-edit',
  pattern: '/shots/edit/:id',
  page: '/composition',
}, {
  name: 'submit-success',
  pattern: '/composition/success/:type-:id-:orgId',
  page: '/composition/SubmitResult',
}, {
  name: 'submit-shots-success',
  pattern: '/composition/shots/result',
  page: '/composition/SubmitShotsResult',
}, {
  name: 'submit-service-success',
  pattern: '/composition/service/result',
  page: '/composition/SubmitServiceResult',
}, {
  name: 'agreement-shots',
  pattern: '/agreement/shots',
  page: '/agreement/shots',
}, {
  name: 'agreement-article',
  pattern: '/agreement/article',
  page: '/agreement/article',
}, {
  name: 'rule-shots',
  pattern: '/rule/shots',
  page: '/rule/shots',
}, {
  name: 'rule-article',
  pattern: '/rule/article',
  page: '/rule/article',
}, 

// 收藏夹聚合
{
  name: 'article-collection',
  pattern: '/article/:id/collection',
  page: '/collection/CompositionCollection'
}, {
  name: 'shots-collection',
  pattern: '/shots/:id/collection',
  page: '/collection/CompositionCollection'
}, 
// 专题聚合
{
  name: 'article-topics',
  pattern: '/article/:id/topics',
  page: '/topic/CompositionTopic'
}, {
  name: 'shots-topics',
  pattern: '/shots/:id/topics',
  page: '/topic/CompositionTopic'
}]


// const compositionList = [{
//   name: 'composition-new',
//   pattern: '/:type/new',
//   page: '/composition'
// }, {
//   name: 'composition-edit',
//   pattern: '/:type/edit/:id',
//   page: '/composition',
// }]
module.exports = compositionList