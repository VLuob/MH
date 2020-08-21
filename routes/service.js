const serviceList = [{
  name: 'service-new',
  pattern: '/service/new',
  page: '/composition',
},{
  name: 'service-edit',
  pattern: '/service/edit/:id',
  page: '/composition',
},{
  name: 'service-detail',
  pattern: '/service/:id',
  page: '/service/ServiceDetail',
},{
  name: 'service-preview',
  pattern: '/service/preview/:id',
  page: '/service/ServicePreview',
}]

module.exports = serviceList
