import { CommonSortType } from '@base/enums'

const commonSortTypeMap = {
  [CommonSortType.RECOMMEND]: '推荐',
  [CommonSortType.HOT]: '热门',
  [CommonSortType.NEWEST]: '最新',
  [CommonSortType.FOLLOW]: '关注',
  [CommonSortType.MATCH]: '相关',
}

/**
 * 询价预算
 */
const enquiryBudgets = [
  {min: 0, max: 20000, value: '0-20000元'},
  {min: 20000, max: 50000, value: '20000-50000元'},
  {min: 50000, max: 200000, value: '50000-200000元'},
  {min: 200000, max: 500000, value: '200000-500000元'},
  {min: 500000, max: null, value: '500000元以上'},
  {min: null, max: null, value: '按质议价'},
]

/**
 * 询价预算对应排序值
 */
const budgetFilters = [
  { id: 0, label: '全部' },
  { id: 1, label: '0-2万' },
  { id: 2, label: '2-5万' },
  { id: 3, label: '5-20万' },
  { id: 4, label: '20-50万' },
  { id: 5, label: '50万以上' },
  { id: 6, label: '按质定价' },
]

/**
 * 品类形式名称对应icon图标
 */
const  classifyIconMap = {
  // 品类
  '药品诊疗': 'medical',
  '化妆品及个人用品': 'cosmetics',
  '家居用品': 'lamp',
  '营养保健品': 'healthcare',
  '母婴玩具': 'feeding-bottle',
  '服装与饰品': 'clothing',
  '食品饮料': 'cup',
  '房地产': 'estate',
  '家电': 'electrical',
  '电子产品': 'computer',
  '电商零售': 'e-commerce',
  '车': 'car',
  '物流服务': 'logistics',
  '教育培训': 'education',
  '网站与软件': 'ie',
  '文化娱乐': 'book',
  '游戏': 'game',
  '体育运动': 'badminton',
  '餐饮服务': 'restaurant',
  '金融保险': 'finance',
  '旅游航空': 'airplane',

  // 形式
  '平面': 'plane-picture',
  '互动广告': 'swap-ad',
  '户外广告': 'outdoor-ad',
  '插画与动画': 'palette',
  '视频广告': 'video-ad',
  '微电影': 'micro-film',
  '介绍视频': 'introducing-video',
  '应用': 'application',
  '网站': 'site',
  '落地页/H5': 'h5',
  '展示设计': 'display-design',
  '包装设计': 'packing',
  '视觉识别系统': 'eye-vi',
  '商务摄影': 'camera',
  '线下公关活动': 'handshake',
  '短视频': 'short-video',
  '音频': 'audio',

  // 其他
  '其他': 'classification',
}

export default {
  commonSortTypeMap,
  enquiryBudgets,
  budgetFilters,
  classifyIconMap,
}