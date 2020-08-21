import { observable, action, runInAction } from 'mobx'
import { message, Modal } from 'antd'
import jsCookie from 'js-cookie'
import { Router } from '@routes'
import { Base64 } from 'js-base64'
import { authorApi, userCenterApi, accountApi } from '@api'
import { cookie, config } from '@utils'
import { toJS } from 'mobx'
import {
  FuncType,
  FavorTypes,
  AuthorType,
  CreationShowType,
  CompositionType,
  CollectionTypes,
  SettingFocusType,
  EmailSubscribeType,
} from '@base/enums'

import basic from '@base/system/basic'
import globalStore from '@stores/global/globalStore'

/**
 * 图片默认是，底部居右，样式1
 * 视频默认是，顶部居左，样式1
 */
const defaultWatermarkInfo = [{ "type": 1, "location": 1, "content": 1 }, { "type": 2, "location": 1, "content": 1 }]

const token = basic.token

export class UserCenterStore {
  @observable state: boolean
  @observable uploadImg: object
  @observable watermarkInfo: Array<object>
  @observable domainInfo: object
  @observable domainSettingInfo: object
  @observable emailSettingInfo: object
  @observable perSettingData: object
  @observable insSettingData: object
  @observable serverInfo: Array<any>
  @observable serverCustomInfo: Array<any>
  @observable mineInsList: Array<any>
  @observable compositionFavorData: object
  @observable compositionFavorParam: object
  @observable articleFavorData
  @observable articleFavorParam: object
  @observable collectionList: Array<any>
  @observable collectCompositionData: object
  @observable collectArticleData: object
  @observable focusCompositionData: object
  @observable focusCompositionParam: object
  @observable focusArticleData: object
  @observable focusArticleParam: object
  @observable focusFocusData: object
  @observable focusFocusParam: object
  @observable focusTagData: object
  @observable focusTagParam: object
  @observable compFilterData: object
  @observable createCompositionData: object
  @observable createCompositionParam: object
  @observable createArticleData: object
  @observable createArticleParam: object
  @observable createKeys: object
  @observable emailOrgMemberList: Array<any>
  @observable personBaseInfo: object
  @observable insBaseInfo: object
  @observable creatorBaseInfo: object
  @observable serverContentInfo: object
  @observable creationStat: Array<any>
  @observable saveDomain: string
  @observable curClientUserInfo: any
  @observable commonAuthor: any
  @observable creatorNickName: Array<any>
  @observable phoneVerifyPassed: boolean
  @observable isExisted: boolean
  @observable subscriptionData: any
  @observable recData: Array<any>
  @observable activeData: Array<any>
  @observable emailCollectionData: Array<any>
  @observable emailRankingData: Array<any>
  @observable subscriptionStateData: any
  @observable authorBanners: Array<string>

  constructor(initialData: any = {}) {
    this.state = initialData.state || false
    this.uploadImg = initialData.uploadImg || {}
    this.watermarkInfo = initialData.watermarkInfo || defaultWatermarkInfo
    this.domainInfo = initialData.domainInfo || {}
    this.domainSettingInfo = initialData.domainSettingInfo || {}
    this.emailSettingInfo = initialData.emailSettingInfo || {}
    this.perSettingData = initialData.perSettingData || {}
    this.insSettingData = initialData.insSettingData || {}
    this.serverInfo = initialData.serverInfo || []
    this.serverCustomInfo = initialData.serverCustomInfo || []
    this.mineInsList = initialData.mineInsList || []
    this.compositionFavorData = initialData.compositionFavorData || {
      list: [],
      count: 0,
      isLastPage: true,
      state: false
    }
    this.compositionFavorParam = initialData.compositionFavorParam || {
      page: 1,
      size: 24
    }
    this.articleFavorData = initialData.articleFavorData || {
      list: [],
      count: 0,
      isLastPage: true,
      state: false
    }
    this.articleFavorParam = initialData.articleFavorParam || {
      page: 1,
      size: 24
    }
    this.collectionList = initialData.collectionList || []
    this.collectCompositionData = initialData.collectCompositionData || {
      list: [],
      count: 0,
      state: false,
      isLastPage: true,
      page: 1,
      size: 24
    }
    this.collectArticleData = initialData.collectArticleData || {
      list: [],
      count: 0,
      state: false,
      isLastPage: true,
      page: 1,
      size: 24
    }
    this.focusCompositionData = initialData.focusCompositionData || { list: [], count: 0, isLastPage: true }
    this.focusCompositionParam = initialData.focusCompositionParam || { page: 1, size: 24 }
    this.focusArticleData = initialData.focusArticleData || { list: [], count: 0, isLastPage: true }
    this.focusArticleParam = initialData.focusArticleParam || { page: 1, size: 24 }
    this.focusFocusData = initialData.focusFocusData || { list: [], count: 0, isLastPage: true }
    this.focusFocusParam = initialData.focusFocusParam || { page: 1, size: 24 }
    this.focusTagData = initialData.focusTagData || { list: [], count: 0, isLastPage: true }
    this.focusTagParam = initialData.focusTagParam || { page: 1, size: 24 }
    this.compFilterData = initialData.compFilterData || { filterStatus: [], publish: [] }
    this.createCompositionData = initialData.createCompositionData || { list: [], count: 0, state: false, isLastPage: true, }
    this.createCompositionParam = initialData.createCompositionParam || { page: 1, size: 24 }
    this.createArticleData = initialData.createArticleData || { list: [], count: 0, isLastPage: true }
    this.createArticleParam = initialData.createArticleParam || { page: 1, size: 24 }
    this.createKeys = initialData.createKeys || { status: 3, }
    this.emailOrgMemberList = initialData.emailOrgMemberList || []
    this.personBaseInfo = initialData.personBaseInfo || {}
    this.insBaseInfo = initialData.insBaseInfo || {}
    this.creatorBaseInfo = initialData.creatorBaseInfo || { province: '', city: '' }
    this.serverContentInfo = initialData.serverContentInfo || { image: '', title: '' }
    this.creationStat = initialData.creationStat || []
    this.saveDomain = initialData.saveDomain || ''
    this.curClientUserInfo = initialData.curClientUserInfo || {}
    this.commonAuthor = initialData.commonAuthor || {}
    this.creatorNickName = initialData.creatorNickName || []
    this.phoneVerifyPassed = initialData.phoneVerifyPassed || false
    this.isExisted = initialData.isExisted || false
    this.subscriptionData = initialData.subscriptionData || { list: [], loading: false, uploadLoading: false }
    this.recData = initialData.recData || []
    this.activeData = initialData.activeData || []
    this.emailCollectionData = initialData.emailCollectionData || []
    this.emailRankingData = initialData.emailRankingData || []
    this.subscriptionStateData = initialData.subscriptionStateData || {
      contentValues: [],
      collectionValues: [],
      statisticsValues: [],
      rankingValues: [],
      authorValues: [],
    }
    this.authorBanners = initialData.authorBanners || []
  }

  @action.bound
  updateRecData(data) {
    this.recData = data
  }

  @action.bound
  updateActiveData(data) {
    this.activeData = data
  }

  @action.bound
  updateEmailCollectionData(data) {
    this.emailCollectionData = data
  }

  @action.bound
  updateEmailRankingData(data) {
    this.emailRankingData = data
  }

  @action.bound
  updateSubscriptionStateData(data = {}) {
    this.subscriptionStateData = {
      ...this.subscriptionStateData,
      ...data,
    }
  }

  // 重置收藏作品数据
  @action.bound
  updateCollectCompositionData(data) {
    this.collectCompositionData = data || {
      list: [],
      count: 0,
      state: false,
      isLastPage: true,
      page: 1,
      size: 24
    }
  }

  // 重置收藏文章数据
  @action.bound
  updateCollectArticleData(data) {
    this.collectArticleData = data || {
      list: [],
      count: 0,
      state: false,
      isLastPage: true,
      page: 1,
      size: 24
    }
  }

  @action.bound
  updateCurUserInfo(data) {
    this.curClientUserInfo = data
  }

  @action.bound
  setCommonAuthor(data) {
    this.commonAuthor = data || {}
  }

  @action.bound
  updateCreatorNickName(data) {
    this.creatorNickName = data
  }

  @action.bound
  updatePhoneVerifyPassed(value) {
    this.phoneVerifyPassed = value
  }

  @action.bound
  updateExisted(value) {
    this.isExisted = value
  }

  // 更新收藏作品
  changeCollectCompositionData(option) {
    this.collectCompositionData = {
      ...toJS(this.collectCompositionData),
      list: option.page === 1 ?
        option.data.data : [...toJS(this.collectCompositionData).list, ...option.data.data],
      count: option.data.total_count,
      page: option.page + 1,
      isLastPage: Math.ceil(option.data.total_count / option.size) <= option.page,
      state: option.state,
      size: option.size,
    }
  }

  // 更新收藏文章
  changeCollectArticleData(option) {
    this.collectArticleData = {
      ...toJS(this.collectArticleData),
      list: option.page === 1 ?
        option.data.data : [...toJS(this.collectArticleData).list, ...option.data.data],
      count: option.data.total_count,
      page: option.page + 1,
      isLastPage: Math.ceil(option.data.total_count / option.size) <= option.page,
      state: option.state,
      size: option.size
    }
  }

  // 修改喜欢作品
  changeFavor(data) {
    const list = this.compositionFavorData.list.map(l => {
      if (l.compositionId === data.id || l.id === data.id) {
        if (Boolean(data.action)) {
          l.favors += 1
        } else {
          if (l.favored) {
            l.favors -= 1
          }
        }

        l.favored = Boolean(data.action)
      }

      return l
    }).filter(l => l.favored)

    this.compositionFavorData = {
      ...toJS(this.compositionFavorData),
      count: this.compositionFavorData.count - 1,
      // ssr: false,
      list
    }
  }

  // 修改收藏作品喜欢操作
  changeCollectionFavor(data) {
    const list = this.collectCompositionData.list.map(l => {
      if (l.compositionId === data.id || l.id === data.id) {
        if (Boolean(data.action)) {
          l.favors += 1
        } else {
          l.favors -= 1
        }

        l.favored = Boolean(data.action)
      }

      return l
    })

    this.collectCompositionData = {
      ...toJS(this.collectCompositionData),
      list
    }
  }

  // 修改收藏作品收藏操作
  changeCollectionCollect(data) {
    const list = this.collectCompositionData.list.map(l => {
      if (l.compositionId === data.compositionId || l.id === data.compositionId) {
        l.collected = Boolean(data.action)
      }

      return l
    }).filter(l => l.collected)

    this.collectCompositionData = {
      ...toJS(this.collectCompositionData),
      count: this.collectCompositionData.count - 1,
      list
    }
  }

  changeCollectionArtiCollect(data) {
    const list = this.collectArticleData.list.map(l => {
      if (l.compositionId === data.id || l.id === data.id) {
        l.collected = Boolean(data.action)
      }

      return l
    }).filter(l => l.collected)

    this.collectArticleData = {
      ...toJS(this.collectArticleData),
      count: this.collectArticleData.count - 1,
      list
    }
  }

  // 删除文章
  changeArtileFavor(data) {
    const list = this.articleFavorData.list.map(l => {
      if (l.compositionId === data.id || l.id === data.id) {
        l.favored = Boolean(data.action)
      }

      return l
    }).filter(l => l.favored)

    this.articleFavorData = {
      ...toJS(this.articleFavorData),
      count: this.articleFavorData.count - 1,
      list
    }
  }

  // 修改服务内容
  @action.bound
  updateServerContentInfo(data) {
    this.serverContentInfo = data || {
      image: '',
      title: ''
    }
  }

  // 修改设置信息
  @action.bound
  changeWatermark(option) {
    const oldInfo = toJS(this.watermarkInfo)
    const info = oldInfo.map(item => {
      let newItem
      if (item.type === option.type) {
        newItem = {
          ...item,
          ...option,
        }
      } else {
        newItem = { ...item }
      }
      return newItem
    })
    this.watermarkInfo = info
  }

  // 修改域名信息
  @action.bound
  changeDomain(option) {
    this.domainSettingInfo = {
      ...toJS(this.domainSettingInfo),
      ...option
    }
  }

  // 更新保存域名
  @action.bound
  updateDomain(data) {
    this.saveDomain = data
  }

  //重置创作条件
  @action.bound
  resetCreateKeys() {
    this.createKeys = {
      status: 3,
      // published: 0
    }
  }

  // 修改创作条件
  @action.bound
  changeCreateKeys(option) {
    this.createKeys = {
      ...toJS(this.createKeys),
      ...option
    }
  }

  // 修改创作条件
  @action.bound
  updateCreationStat(data) {
    this.creationStat = data
  }

  // api
  // 设置邮件,功能,域名设置
  @action.bound
  async fetchSetSetting(option) {
    // globalStore.changeLoading(true)

    try {
      const param = { token, ...option }
      const result = await userCenterApi.setSetting(param)

      runInAction(() => {
        if (result.success) {
          message.destroy()
          message.success(`修改成功`)
        } else {
          message.error(result.data.msg)
        }
      })
    } catch (err) {
      runInAction(() => {
        return { success: false, data: { code: 'E100000' } }
      })
    }

    // globalStore.changeLoading(false)
  }

  // 获取邮件,功能,域名设置
  @action.bound
  async fetchGetSetting(option) {
    // globalStore.changeLoading(true)
    try {
      const param = { token, ...option }
      const result = await userCenterApi.getSetting(param)

      if (result.success) {
        switch (option.type) {
          case FuncType.WATERMARK:
            this.watermarkInfo = (result.data && JSON.parse(result.data.value)) || defaultWatermarkInfo

            break
          case FuncType.DOMAIN:
            this.domainSettingInfo = (result.data && JSON.parse(result.data.value)) || {}
            this.domainInfo = result.data

            break
          case FuncType.EMAIL:
            this.emailSettingInfo = (result.data && JSON.parse(result.data.value)) || {}

            break
        }
      }
    } catch (err) {
      runInAction(() => {
        return { success: false, data: { code: 'E100000' } }
      })
    }

    // globalStore.changeLoading(false)
  }

  // 获取邮件订阅机构成员信息
  @action.bound
  async fetchGetSettingMember(option) {
    try {
      const param = { token, ...option }
      const result = await userCenterApi.getSettingMember(param)
      if (result.success) {
        this.emailOrgMemberList = result.data
      }
      return result
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 获取服务信息
  @action.bound
  async fetchGetOrgService(option) {
    try {
      const param = { token, ...option }
      const result = await userCenterApi.getOrgService(param)

      if (result.success) {
        if (option.type === 0) {
          this.serverInfo = result.data || []
        } else if (option.type) {
          this.serverCustomInfo = result.data || []
        }
      } else {
        console.log(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 保存服务信息
  @action.bound
  async fetchPostOrgService(option) {
    try {
      let param
      let result

      param = { token, ...option, data: JSON.stringify(option.data) }
      result = await userCenterApi.postOrgService(param)

      if (result.success) {
        if (option.type === 0) {
          message.success(`产品服务资料保存成功`)
          this.serverInfo = option.data
        } else if (option.type === 1) {
          message.success(`服务客户保存成功`)
          this.serverCustomInfo = option.data
        }
      } else {
        console.log(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }

    // globalStore.changeLoading(false)
  }

  // 上传图片
  @action.bound
  async fetchUploadImg(option) {
    globalStore.changeLoading(true)

    try {
      const param = { token, ...option }
      const result = await userCenterApi.uploadImg(param)

      runInAction(() => {
        if (result.success) {
          this.uploadImg = result.data
        } else {
          console.log(result.data.msg)
        }
      })
    } catch (err) {
      runInAction(() => {
        return { success: false, data: { code: 'E100000' } }
      })
    }

    globalStore.changeLoading(false)
  }

  // 获取个人/机构简要信息
  @action.bound
  async fetchGetSettingCommon(option) {
    try {
      const param = { token, ...option }
      delete param.type
      const result = await userCenterApi.getSettingCommon(param)
      if (result.success) {
        this.updateCurUserInfo(result.data || {})
        this.setCommonAuthor(result.data || {})
        switch (Number(option.type)) {
          case AuthorType.PERSONAL:
            this.perSettingData = result.data || {}
            break
          case AuthorType.INSTITUTION:
            this.insSettingData = result.data || {}
            break
        }
      }
      return result
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }

  }

  // 获取个人/机构简要信息
  @action.bound
  async fetchGetSettingBaseInfo(option, callback) {
    try {
      const param = { token, ...option }
      const result = await userCenterApi.getSettingBaseInfo(param)
      if (result.success) {
        const type = option.type || result.data.type
        switch (Number(type)) {
          case AuthorType.PERSONAL:
            this.personBaseInfo = result.data

            break
          case AuthorType.INSTITUTION:
          default:
            this.insBaseInfo = result.data
            break
        }
      } else if (result.data.code === 'E100009') {
        // 没有权限
        message.error('错误的创作者ID，暂时无权访问')
        location.href = '/'
      } else {
        message.error(result.data.msg)
      }
      if (callback) callback(result)
      return result
    } catch (err) {
      const resultData = { success: false, data: { code: 'E100000', msg: '' } }
      if (callback) callback(resultData)
      return resultData
    }
  }

  // 保存个人/机构简要信息
  @action.bound
  async fetchSetSettingBaseInfo(option) {
    try {
      const param = { token, ...option }
      const result = await userCenterApi.setSettingBaseInfo(param)

      message.destroy()
      if (result.success) {
        this.fetchGetSettingBaseInfo({ org_id: option.org_id })
        message.success(`提交审核中，通过后会自动修改`)
      } else if (result.data.code === 'E100009') {
        message.error('错误的创作者ID，您没有权限设置')
        location.href = '/'
      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      message.destroy()
      message.error('提交失败')
    }
  }

  // 设置独立作品库官网域名
  async fetchSetShotsWebsiteDomain(option) {
    try {
      const response = await userCenterApi.setShotsWebsiteDomain(option)

      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 获取我的机构
  @action.bound
  async fetchGetOrgList(option) {
    try {
      const param = { token, ...option }
      const result = await userCenterApi.getOrgList(param)

      if (result.success) {
        this.mineInsList = result.data || []
        this.state = true
      } else {
        this.state = false
      }
    } catch (err) {
      this.state = false
    }
  }

  // 获取设置喜欢作品文章
  @action.bound
  async fetchGetSettingFavor(option) {
    switch (option.type) {
      case CompositionType.COMPOSITION:
        if (option.page <= 1) {
          this.compositionFavorData.state = false
        }

        break
      case CompositionType.ARTICLE:
        if (option.page <= 1) {
          this.articleFavorData.state = false
        }

        break
    }

    try {
      const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
      const param = { token, client_code, ...option }
      const result = await userCenterApi.getSettingFavor(param)

      if (result.success) {
        switch (option.type) {
          case CompositionType.COMPOSITION:
            this.compositionFavorData = {
              ...toJS(this.compositionFavorData),
              list: option.page === 1 ?
                result.data.data : [...toJS(this.compositionFavorData).list, ...result.data.data],
              count: result.data[`total_count`],
              isLastPage: Math.ceil(result.data[`total_count`] / this.compositionFavorParam.size) <= option.page,
              state: true
            }

            this.compositionFavorParam = { page: option.page + 1, size: option.size }

            break
          case CompositionType.ARTICLE:
            this.articleFavorData = {
              ...toJS(this.articleFavorData),
              list: option.page === 1 ? result.data.data :
                [...toJS(this.articleFavorData).list, ...result.data.data],
              count: result.data[`total_count`],
              isLastPage: Math.ceil(result.data[`total_count`] / this.articleFavorParam.size) <= option.page,
              state: true
            }

            this.articleFavorParam = { page: option.page + 1, size: option.size }

            break
        }
      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      runInAction(() => {
        return { success: false, data: { code: 'E100000' } }
      })
    }
  }

  // 获取文章/作品的收藏夹（包含的文章作品数）
  @action.bound
  async fetchGetSettingCollection(option) {
    try {
      const param = { token, ...option }
      const result = await userCenterApi.getSettingCollection(param)

      if (result.success) {
        this.collectionList = result.data
        this.fetchGetSettingAuthorCollection({ type: option.type, collection_id: this.collectionList[0].id })
      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 获取收藏作品/文章
  @action.bound
  async fetchGetSettingAuthorCollection(option) {
    switch (option.type) {
      case CompositionType.ARTICLE:
        if (option.page <= 1) {
          this.collectArticleData.state = false
        }
        break
      case CompositionType.COMPOSITION:
      default:
        if (option.page <= 1) {
          this.collectCompositionData.state = false
        }
        break
    }

    try {
      const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
      const param = { token, client_code, ...option }
      const result = await userCenterApi.getSettingAuthorCollection(param)

      if (result.success) {
        switch (option.type) {
          case CompositionType.ARTICLE:
            this.changeCollectArticleData({
              ...option,
              data: result.data,
              state: true,
            })

            break
          case CompositionType.COMPOSITION:
          default:
            this.changeCollectCompositionData({
              ...option,
              data: result.data,
              state: true,
            })

            break
        }
      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 新增文件夹
  @action.bound
  async fetchAddCollectionFolder(option) {
    try {
      const param = { token, ...option }
      const result = await userCenterApi.addCollectionFolder(param)

      runInAction(() => {
        if (result.success) {
          message.destroy()
          message.success(`新增收藏夹成功`)
        } else {
          message.error(result.data.msg)
        }
      })
    } catch (err) {
      runInAction(() => {
        return { success: false, data: { code: 'E100000' } }
      })
    }
  }

  // 获取设置关注信息
  @action.bound
  async fetchGetSettingFollow(option) {
    try {
      const param = { token, ...option }
      const result = await userCenterApi.getSettingFollow(param)

      if (result.success) {
        switch (option.type) {
          case SettingFocusType.COMPOSITION:
            this.focusCompositionData = {
              ...toJS(this.focusCompositionData),
              list: option.page === 1 ? result.data.data :
                [...toJS(this.focusCompositionData).list, ...result.data.data],
              count: result.data[`total_count`],
              isLastPage: Math.ceil(result.data[`total_count`] / this.focusCompositionParam.size) <= this.focusCompositionParam.page
            }

            this.focusCompositionParam = { page: option.page, size: option.size }

            break
          case SettingFocusType.ARTICLE:
            this.focusArticleData = {
              ...toJS(this.focusArticleData),
              list: option.page === 1 ? result.data.data :
                [...toJS(this.focusArticleData).list, ...result.data.data],
              count: result.data[`total_count`],
              isLastPage: Math.ceil(result.data[`total_count`] / this.focusArticleParam.size) <= this.focusArticleParam.page
            }

            this.focusArticleParam = { page: option.page, size: option.size }

            break
          case SettingFocusType.FOCUS:
            this.focusFocusData = {
              ...toJS(this.focusFocusData),
              list: option.page === 1 ? result.data.data :
                [...toJS(this.focusFocusData).list, ...result.data.data],
              count: result.data[`total_count`],
              isLastPage: Math.ceil(result.data[`total_count`] / this.focusFocusParam.size) <= this.focusFocusParam.page
            }

            this.focusFocusParam = { page: option.page, size: option.size }

            break
          case SettingFocusType.TAG:
            this.focusTagData = {
              ...toJS(this.focusTagData),
              list: option.page === 1 ? result.data.data :
                [...toJS(this.focusTagData).list, ...result.data.data],
              count: result.data.data.length || 0,
              isLastPage: Math.ceil(result.data.data.length / this.focusTagParam.size) <= this.focusTagParam.page
            }

            this.focusTagParam = { page: option.page, size: option.size }

            break
        }
      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 获取个人/机构过滤筛选文章作品的条件数据
  @action.bound
  async fetchGetSettingCompositionFilter(option) {
    try {
      const param = { token, ...option }
      const result = await userCenterApi.getSettingCompositionFilter(param)

      this.compFilterData = {
        filterStatus: result.data.filter_status,
        publish: result.data.publish,
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  //个人创作作品喜欢功能
  @action.bound
  async fetchProdActionFavor(option) {
    try {
      if (!token && !option.action) {
        message.destroy()
        message.error(`您已经喜欢过该作品`)

        return
      }

      const params = { ...option, type: FavorTypes.SHOTS }
      const result = await authorApi.actionFavor(params)

      if (result.success) {
        this.changeProdFavor(option)

        if (option.action) {
          message.destroy()
          message.success(`喜欢成功`)
        } else {
          message.destroy()
          message.success(`取消喜欢成功`)
        }
      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      runInAction(() => {
        return { success: false, data: { code: 'E100000' } }
      })
    }
  }

  @action.bound
  changeProdFavor(data) {
    const list = this.createCompositionData.list.map(l => {
      if (l.compositionId === data.id || l.id === data.id) {
        l.favored = Boolean(data.action)

        if (Boolean(data.action)) {
          l.favors += 1
        } else {
          l.favors -= 1
        }
      }

      return l
    })

    this.createCompositionData = {
      ...toJS(this.createCompositionData),
      // ssr: false,
      state: true,
      list
    }
  }

  // 获取个人/机构创作
  @action.bound
  async fetchGetSettingComposition(option) {
    if (option.page <= 1 && !option.operation) {
      switch (option.composition_type) {
        case CompositionType.COMPOSITION:
          this.createCompositionData.state = false

          break
        case CompositionType.ARTICLE:
          this.createArticleData.state = false

          break
      }
    }

    try {
      const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
      const param = { token, client_code, ...option }
      const result = await userCenterApi.getSettingComposition(param)

      if (result.success) {
        switch (option.composition_type) {
          case CompositionType.COMPOSITION:
            this.createCompositionParam = { page: option.page, size: option.size }
            this.createCompositionData = {
              ...toJS(this.createCompositionData),
              list: option.page === 1 ? result.data.data || [] :
                [...toJS(this.createCompositionData).list, ...result.data.data],
              count: result.data[`total_count`] || 0,
              isLastPage: Math.ceil(result.data[`total_count`] / this.createCompositionParam.size) <= this.createCompositionParam.page,
              state: true
            }

            break
          case CompositionType.ARTICLE:
            this.createArticleParam = { page: option.page, size: option.size }
            this.createArticleData = {
              ...toJS(this.createArticleData),
              list: option.page === 1 ? result.data.data || [] :
                [...toJS(this.createArticleData).list, ...result.data.data],
              count: result.data[`total_count`],
              isLastPage: Math.ceil(result.data[`total_count`] / this.createArticleParam.size) <= this.createArticleParam.page,
              state: true
            }

            break
        }
      } else if (result.data.code === 'E100009') {
        message.error('错误的创作者ID，您暂无权限访问')
        location.href = '/'
      }
    } catch (err) {
      switch (option.composition_type) {
        case CompositionType.COMPOSITION:
          this.createCompositionData.state = false

          break
        case CompositionType.ARTICLE:
          this.createArticleData.state = false

          break
      }
    }
  }

  // 设置操作文章作品信息 
  @action.bound
  async fetchSetSettingOperator(option) {
    try {
      const result = await userCenterApi.setSettingOperator(option.data)

      if (result.success) {
        let msg = ''

        switch (option.data.type) {
          case 0:
            msg = `编辑`

            break
          case 1:
            msg = `删除`

            break
          case 2:
            msg = `标记首页隐藏`

            break
          case 3:
            msg = `标记首页显示`

            break
        }

        message.destroy()
        message.success(`${msg}成功`)

        option.operate.fn(option.operate.curParam)
      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 获取统计状态
  @action.bound
  async fetchGetCreationStat(option) {
    try {
      const result = await userCenterApi.getSettingCompositionFilter(option)
      if (result.success) {
        this.updateCreationStat(result.data)
      }
      return result
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 显示隐藏创作
  @action.bound
  async fetchOperateComposition(option) {
    try {
      const result = await userCenterApi.operateComposition(option.data)
      if (result.success) {
        const countParam = { token, ...option.operate.countParam }
        option.operate.fn(option.operate.curParam)
        option.operate.countFn(countParam)

        switch (option.data.showStatus) {
          case CreationShowType.HIDDEN:
            message.destroy()
            message.success(`隐藏成功`)

            break
          case CreationShowType.SHOW:
            message.destroy()
            message.success(`公开成功`)

            break
        }
      } else if (result.data.code === 'E100006') {
      } else {
        message.error(result.data.msg)
      }
      return result
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 删除创作
  @action.bound
  async fetchDeleteComposition(option) {
    try {
      const result = await userCenterApi.deleteComposition(option.data)

      if (option.host) {
        return new Promise((resolve, reject) => {
          if (result.success) {
            const countParam = { token, ...option.operate.countParam }

            option.operate.fn(option.operate.curParam)
            option.operate.countFn(countParam)

            message.destroy()
            message.success(`删除成功`)
          } else {
            message.error(result.data.msg)
          }
        })
      } else {
        if (result.success) {
          const countParam = { token, ...option.operate.countParam }

          option.operate.fn(option.operate.curParam)
          option.operate.countFn(countParam)

          message.destroy()
          message.success(`删除成功`)
        } else {
          message.error(result.data.msg)
        }
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 创建机构
  @action.bound
  async fetchCreateInstitution(option) {
    try {
      const result = await userCenterApi.createInstitution(option)

      if (result.success) {
        if (result.data) {
          message.destroy()
          message.success(`机构创建成功`)

          window.location.href = '/personal/teams'
        } else {
          message.destroy()
          message.error(`机构创建失败`)
        }
      } else {
        message.destroy()
        message.error(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  //获取创作者昵称建议 
  @action.bound
  async fetchGetCreatorNickName(value, callback) {
    const option = { nickname: value }
    try {
      const result = await userCenterApi.getCreatorNickName(option)
      if (result.success) {
        let data = []
        this.updateExisted(false)
        if (value !== '') {
          data.push({
            value: value,
            text: value
          })
          result.data.map(item => {
            if (value !== item) {
              data.push({
                value: item,
                text: item
              })
            } else {
              this.updateExisted(true)
            }
          })
        }
        callback(data)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 验证手机号码
  @action.bound
  async fetchCreatorPhoneVerify(option, callback) {
    try {
      const result = await userCenterApi.creatorPhoneVerify(option)
      if (result.success) {
        this.updatePhoneVerifyPassed(true)
        callback(result.data)
      } else {
        message.destroy()
        message.error(result.data.msg)
      }
    } catch (err) {
      message.error('网络错误')
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 创建创作者
  @action.bound
  async fetchCreateSetBaseInfo(option) {
    try {
      const result = await userCenterApi.createSetBaseInfo(option)

      // console.log(result)
      if (result.success) {
        if (result.data) {
          // message.destroy()
          // message.success(`提交成功`)

          switch (Number(option.type)) {
            case AuthorType.PERSONAL:
              window.location.href = `/review/personal/${result.data.authorId}`
              break
            case AuthorType.BRANDER:
              window.location.href = `/review/brand/${result.data.authorId}`
              break
            case AuthorType.SERVER:
              window.location.href = `/review/service/${result.data.authorId}`
              break
            case AuthorType.EDITOR:
              window.location.href = `/review/${option.creatorType === 1 ? `personal` : option.creatorType === 2 ? `service` : `brand`}/${result.data.authorId}`
              break
          }

        } else {
          message.destroy()
          message.error(`创建失败`)
        }
      } else {
        message.destroy()
        message.error(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 获取用户id
  @action.bound
  async fetchGetPersonalId(callback) {
    try {
      const param = { token }
      const result = await accountApi.getClientCurrent(param)
      if (result.success) {
        this.personBaseInfo = result.data
        callback(result.data)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 获取创作者简要信息
  @action.bound
  async fetchGetCreatorBaseInfo(option, callback) {
    if (!token) {
      return
    }
    try {
      const param = { token, ...option }
      const result = await userCenterApi.getSettingBaseInfo(param)

      if (result.success) {
        this.creatorBaseInfo = result.data
      } else {
        message.error(result.data.msg)
      }
      if (callback) callback(result)
    } catch (err) {
      runInAction(() => {
        return { success: false, data: { code: 'E100000' } }
      })
    }
  }

  // 喜欢页面作品喜欢功能 
  @action.bound
  async fetchFavorActionFavor(option) {
    try {
      if (!token && !option.action) {
        message.destroy()
        message.error(`您已经喜欢过该作品`)

        return
      }
      const param = { ...option, type: FavorTypes.SHOTS }
      const result = await authorApi.actionFavor(param)

      if (result.success) {
        this.changeFavor(option)

        if (option.action) {
          message.destroy()
          message.success(`喜欢成功`)
        } else {
          message.destroy()
          message.error(`已取消喜欢成功`)
        }
      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 喜欢页面文章喜欢功能
  @action.bound
  async fetchArticleActionFavor(option) {
    try {
      const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
      const param = { token, ...option, client_code, type: FavorTypes.ARTICLE }
      const result = await authorApi.actionFavor(param)

      if (result.success) {
        this.changeArtileFavor(option)

        message.destroy()
        message.error(`已取消喜欢成功`)
      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 收藏页面作品喜欢功能
  @action.bound
  async fetchCollectionActionFavor(option) {
    try {
      if (!token && !option.action) {
        message.destroy()
        message.error(`您已经喜欢过该作品`)

        return
      }

      const param = { ...option, type: FavorTypes.SHOTS }
      const result = await authorApi.actionFavor(param)

      if (result.success) {
        this.changeCollectionFavor(option)

        if (option.action) {
          message.destroy()
          message.success(`喜欢成功`)
        } else {
          message.destroy()
          message.error(`已取消喜欢成功`)
        }
      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 收藏页面作品收藏功能
  @action.bound
  async fetchCollectionActionCollect(option) {
    try {
      const param = { ...option, type: CollectionTypes.SHOTS }
      const result = await authorApi.actionCollection(param)

      if (result.success) {
        this.changeCollectionCollect(option)

        if (option.action) {
          message.destroy()
          message.success(`收藏成功`)
        } else {
          message.destroy()
          message.success(`取消收藏成功`)
        }


      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 收藏页面文章收藏功能
  @action.bound
  async fetchCollectionArtiActionCollect(option) {
    try {
      const param = { ...option, type: CollectionTypes.ARTICLE }
      const result = await authorApi.actionCollection(param)

      if (result.success) {
        this.changeCollectionArtiCollect(option)

        if (option.action) {
          message.destroy()
          message.success(`收藏成功`)
        } else {
          message.destroy()
          message.success(`取消收藏成功`)
        }
      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 获取订阅
  @action.bound
  async fetchGetSubscriptions(option) {
    try {
      this.subscriptionData.loading = true
      const result = await userCenterApi.getSubscriptions({ token, ...option })
      this.subscriptionData.loading = false
      if (result.success) {
        const subscriptionList = result.data || []
        this.recData = subscriptionList.filter(l => l.type === EmailSubscribeType.CONTENT)
        this.activeData = subscriptionList.filter(l => l.type === EmailSubscribeType.STATISTICS)
        this.emailCollectionData = subscriptionList.filter(l => l.type === EmailSubscribeType.COLLECTION)
        this.emailRankingData = subscriptionList.filter(l => l.type === EmailSubscribeType.RANKING)
        this.subscriptionData.list = subscriptionList

        const authorIdArr = subscriptionList.reduce((idsArr, item) => {
          const currentAuthorId = String(item.relationId)
          const frequency = item.frequency || [0]
          if (!idsArr.includes(currentAuthorId) && frequency[0]) {
            idsArr.push(currentAuthorId)
          }
          return idsArr
        }, [])
        let subscriptionState: any = {}
        const contentItem = this.recData[0]
        const collectionItem = this.emailCollectionData[0]
        const statisticsItem = this.activeData[0]
        const rankingItem = this.emailRankingData[0]
        subscriptionState.authorValues = authorIdArr

        if (contentItem) {
          subscriptionState.contentValues = contentItem.frequency
        }
        if (collectionItem) {
          subscriptionState.collectionValues = collectionItem.frequency
        }
        if (statisticsItem) {
          subscriptionState.statisticsValues = statisticsItem.frequency
        }
        if (rankingItem) {
          subscriptionState.rankingValues = rankingItem.frequency
        }
        this.updateSubscriptionStateData(subscriptionState)
      } else {
        message.error(result.data.msg)
      }
      return result
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 设置订阅
  @action.bound
  async fetchSetSubscriptions(option) {
    try {
      const param = { token, ...option }
      this.subscriptionData.updateLoading = true
      const result = await userCenterApi.setSubscriptions(param)
      this.subscriptionData.updateLoading = false

      if (result.success) {
        message.success(`邮件订阅设置成功!`)
      } else {
        message.error(result.data.msg)
      }
      return result
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  @action.bound
  async fetchAuthorBanners() {
    try {
      const response = await authorApi.queryAuthorBanners()
      if (response.success) {
        this.authorBanners = response.data || []
      } else {
        message.error(response.data.msg)
      }
    } catch (error) {

    }
  }

  @action.bound
  async modifyAuthorBanner({ type, ...option }, callback) {
    try {
      const response = await authorApi.setAuthorBanner(option)
      if (response.success) {
        this.curClientUserInfo = {
          ...toJS(this.curClientUserInfo),
          banner: option.banner,
        }
        if (type === AuthorType.PERSONAL) {
          this.personBaseInfo = {
            ...toJS(this.personBaseInfo),
            banner: option.banner,
          }
        } else {
          this.insBaseInfo = {
            ...toJS(this.insBaseInfo),
            banner: option.banner,
          }
        }
      }

      if (callback) callback(response)
    } catch (error) {

    }
  }
}

export default new UserCenterStore()