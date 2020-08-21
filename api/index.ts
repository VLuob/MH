import homeApi from './home'
import accountApi from './account'
import authorApi from './author'
import userCenterApi from './account/userCenter'
import statisticsApi from './account/statistics'
import messageApi from './account/message'
import letterApi from './account/letter'
import followApi from './account/follow'
import orderApi from './account/order'
import enquiryApi from './enquiry'
import serviceApi from './service'
import compositionApi from './composition'
import commentApi from './composition/comment'
import globalApi from './global'
import adApi from './global/ad'
import productApi from './global/product'
import searchApi from './subject/search'
import brandApi from './subject/brand'
import articlassifyApi from './subject/articlassify'
import unsubscribeApi from './subject/unsubscribe'
import tagApi from './tag'
import topicApi from './topic'
import topApi from './top'
import collectionApi from './collection'
import payApi from './global/pay'

export { 
  globalApi, 
  payApi,
  adApi, 
  productApi,
  homeApi, 
  accountApi, 
  
  // 个人中心
  userCenterApi, 
  statisticsApi,
  messageApi,
  letterApi,
  followApi,
  orderApi,
  
  authorApi, 
  compositionApi, 
  commentApi, 
  articlassifyApi,
  unsubscribeApi,
  searchApi, 
  brandApi, 
  tagApi, 
  topicApi,
  topApi,
  collectionApi,
  enquiryApi,
  serviceApi,
}
