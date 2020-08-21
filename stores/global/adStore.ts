import { observable, action, runInAction, toJS } from 'mobx'
import { message } from 'antd'
import { adApi } from '@api'

export class AdStore {

  @observable homeAds: any = {}
  @observable articleHomeAds: any = {}
  @observable articleDetailAds: any = {}
  @observable shotsHomeAds: any = {}
  @observable searchKeywordsAds: any = {}
  @observable brandAds: any = {}
  @observable tagAds: any = {}
  @observable globalBottomAds: any = {}
  @observable homeBottomAds: any = {}

  constructor(initialData: any = {}) {
    this.homeAds = initialData.homeAds || {}
    this.articleHomeAds = initialData.articleHomeAds || {}
    this.articleDetailAds = initialData.articleDetailAds || {}
    this.shotsHomeAds = initialData.shotsHomeAds || {}
    this.searchKeywordsAds = initialData.searchKeywordsAds || {}
    this.brandAds = initialData.brandAds || {}
    this.tagAds = initialData.tagAds || {}
    this.globalBottomAds = initialData.globalBottomAds || {}
    this.homeBottomAds = initialData.homeBottomAds || {}
  }

  @action resetHomeAds(adData) {
    this.homeAds = {
      ...toJS(this.homeAds),
      ...adData,
    }
  }

  @action resetArticleHomeAds(adData) {
    this.articleHomeAds = {
      ...this.articleHomeAds,
      ...adData,
    }
  }

  @action resetArticleDetailAds(adData) {
    this.articleDetailAds = {
      ...this.articleDetailAds,
      ...adData,
    }
  }

  @action resetShotsHomeAds(adData) {
    this.shotsHomeAds = {
      ...toJS(this.shotsHomeAds),
      ...adData,
    }
  }

  @action resetSearchKeywordsAds(adData) {
    this.searchKeywordsAds = {
      ...this.searchKeywordsAds,
      ...adData,
    } 
  }

  @action resetBrandAds(adData) {
    this.brandAds = adData
  }

  @action resetTagAds(adData) {
    this.tagAds = adData
  }

  @action resetGlobalBottomAds(adData) {
    this.globalBottomAds = adData
  }

  @action resetHomeBottomAds(adData) {
    this.homeBottomAds = adData
  }

  @action setAds(page_code, adData) {
    switch (page_code) {
      case 'f_h':
        this.resetHomeAds(adData)
        break
      case 'f_a_s': 
        this.resetArticleHomeAds(adData)
        break;
      case 'f_a_d': 
        this.resetArticleDetailAds(adData)
        break;
      case 'f_w_s':
        this.resetShotsHomeAds(adData)
        break
      case 'f_s':
        this.resetSearchKeywordsAds(adData)
        break
      case 'f_b':
        this.resetBrandAds(adData)
        break
      case 'f_t':
        this.resetTagAds(adData)
        break
      case 'p_g': 
        this.resetGlobalBottomAds(adData)
        break
      case 'p_h':
        this.resetHomeBottomAds(adData)
        break
      default:
        break;
    }
  }
 
  // 获取广告数据 
  @action.bound
  async fetchAdvertisement(option) {
    try {
      const response = await adApi.queryAdvertisement(option)
      if(response.success) {
        const adData = response.data || {}
        this.setAds(option.page_code, adData)
      }
      return response.data
    } catch (err) {
      return {success: false, data: {}}
    }
  }

  @action.bound
  async actionAdClick(option) {
    try {
      return await adApi.actionAdClick(option)
    } catch (error) {
      
    }
  }

  @action.bound
  async actionSponsorClick(option) {
    try {
      return  await adApi.actionSponsor(option)
    } catch (error) {

    }
  }
}

export default new AdStore()
