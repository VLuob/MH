const enquiryList = [{
  name: 'enquiry-new',
  pattern: '/enquiry/new',
  page: '/enquiry/EnquiryPublish',
},{
  name: 'enquiry-edit',
  pattern: '/enquiry/edit/:id',
  page: '/enquiry/EnquiryPublish',
},{
  name: 'enquiry-detail',
  pattern: '/enquiry/:id',
  page: '/enquiry/EnquiryDetail',
},{
  name: 'enquiry-preview',
  pattern: '/enquiry/preview/:id',
  page: '/enquiry/EnquiryPreview',
},{
  name: 'enquiry-url',
  pattern: '/enquiry!:sort*!:formCode*!:budget*',
  page: '/enquiry',
},{
  name: 'enquiry',
  pattern: '/enquiry',
  page: '/enquiry',
}]

module.exports = enquiryList
