import { EditionType, AddedServiceType } from '../enums'

const filters = {
  editionMap: {
    [EditionType.FREE]: '免费版',
    [EditionType.STANDARD]: '标准版',
    [EditionType.ADVANCED]: '高级版',
  },

  serviceMap: {
    [AddedServiceType.HOME_PAGE]: '独立作品库官网',
    [AddedServiceType.MINI_APP]: '独立作品库小程序',
    [AddedServiceType.UPLOAD_EXTEND]: '支持4K高清视频上传',
    [AddedServiceType.SHOTS_EXTEND]: '公开作品量扩容100条',
  },
  
  editionDatas: [
    {id: EditionType.FREE, name: '免费版', price: 0,},
    {id: EditionType.STANDARD, name: '标准版', price: 4800, prePrice: 2800, discount: 2000}, //个人创作者 标准版使用优惠价2800
    {id: EditionType.ADVANCED, name: '高级版', price: 7800,},
  ],
  
  serviceDatas: [
    {id: AddedServiceType.HOME_PAGE, name: '独立作品库官网', price: 2000, desc: ['去除梅花网品牌信息', '可使用独立域名', '标准版1个模板，高级版5个模板'] },
    {id: AddedServiceType.MINI_APP, name: '独立作品库小程序', price: 5000, desc: ['去除梅花网品牌信息','  一键制作作品库小程序', '授权绑定客户独立公司信息'], disabled: true, },
    {id: AddedServiceType.UPLOAD_EXTEND, name: '支持4K高清视频上传', price: 2000, desc: ['支持最高4K高清画质视频上传和播放'] },
    // {id: AddedServiceType.SHOTS_EXTEND, name: '公开作品量扩容100条', price: 2000, desc: ['公开发布作品数量库容100条'] },
  ],

}

export default { filters }