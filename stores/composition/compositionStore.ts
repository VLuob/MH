import { observable, action, runInAction, toJS } from 'mobx'
import { message } from 'antd'
import jsCookie from 'js-cookie'
import { composition as compositionSys } from '@base/system'
import { compositionApi as api, homeApi, authorApi, collectionApi } from '@api'
import { ClassificationTypes, CompositionTypes, ActionType, FavorTypes, CompositionStatus } from '@base/enums'
import basic from '@base/system/basic'
import { config } from '@utils'

const token = basic.token

const classificationMap = {
  [ClassificationTypes.NORMAL]: 'classifications',
  [ClassificationTypes.CATEGORY]: 'categories',
  [ClassificationTypes.FORM]: 'forms',
}

const hotTypeMap = {
  1: 'week',
  2: 'month',
}

export class CompositionStore {
  @observable compositionsData: any
  @observable shotsData: any
  @observable compositionDetail: any
  @observable compositionEdit: any
  @observable compositionPreview: any
  @observable authors: Array<any>
  @observable batch: string
  @observable classifications: Array<any>
  @observable categories: Array<any>
  @observable forms: Array<any>
  @observable classificationsAll: Array<any>
  @observable brandSuggestion: Array<any>
  @observable tagSuggestion: Array<any>
  @observable memberSuggestion: Array<any>
  @observable hotArticles: any
  @observable newArticles: Array<any>
  @observable authorInfo: any
  @observable relatedArticleData: any
  @observable relatedShotsData: any
  @observable classificationList: Array<any>
  @observable classificationData: any
  @observable compositionFavoritesData: any

  constructor(initialData: any = {}) {
    this.compositionsData = initialData.compositionsData || {
      list: [],
      total: 0,
      isLastPage: false,
      isLoading: false,
      terms: {
        term: {
          type: 2,
        },
        sort: [{
          key: 'gmtPublish',
          value: 'desc',
        }],
        page: 1,
        limit: 36,
      }
    }
    this.shotsData = initialData.shotsData || {
      list: [],
      total: 0,
      isLastPage: false,
      isLoading: false,
      terms: {
        term: {
          type: 2,
        },
        recommended: true,
        page: 1,
        limit: 45,
      }
    }
    this.compositionDetail = initialData.compositionDetail || { composition: {} }
    this.compositionEdit = initialData.compositionEdit || { composition: {} }
    this.compositionPreview = initialData.compositionPreview || { composition: {} }
    this.authors = initialData.authors || []
    this.batch = initialData.batch || ''
    this.classifications = initialData.classifications || []
    this.categories = initialData.categories || []
    this.forms = initialData.forms || []
    this.classificationsAll = initialData.classificationsAll || []
    this.brandSuggestion = initialData.brandSuggestion || []
    this.tagSuggestion = initialData.tagSuggestion || []
    this.memberSuggestion = initialData.memberSuggestion || []

    this.hotArticles = initialData.hotArticles || {
      weekList: [],
      monthList: [],
      isLoading: false,
    }
    this.newArticles = initialData.newArticles || {
      list: [],
      isLoading: false,
    }
    this.authorInfo = initialData.authorInfo || {
      info: {},
      isLoading: false,
    }
    this.relatedArticleData = initialData.relatedArticleData || {
      list: [],
      terms: {
        page: 1,
        limit: 40,
      },
      isLoading: false,
    }
    this.relatedShotsData = initialData.relatedShotsData || {
      list: [],
      terms: {
        page: 1,
        limit: 40,
      },
      isLoading: false,
    }

    this.classificationList = initialData.classificationList || []
    this.classificationData = initialData.classificationData || {
      ssr: true,
      list: [],
      count: 0,
      isLastPage: true,
      state: false,
      terms: {
        term: {
          type: 2,
        },
        recommended: true,
        page: 1,
        limit: 45,
      }
    }

    this.compositionFavoritesData = initialData.compositionFavoritesData || {
      list: [],
      title: '',
      total: 0,
      terms: {
        orderType: 2,  //1热度，2最新，3关注
        pageIndex: 1,
        pageSize: 20,
      },
      isEnd: false,
      loading: false,
      isLoad: false,
    }
  }

  @action.bound
  setCollections(action) {
    const currCollections = this.compositionDetail.composition.collections || 0
    if (action === ActionType.FOCUS) {
      this.compositionDetail.composition.collections = currCollections + 1
    } else {
      this.compositionDetail.composition.collections = currCollections > 0 ? currCollections - 1 : 0
    }
    if (this.compositionDetail.composition.collections > 0) {
      this.compositionDetail.composition.collected = true
    } else {
      this.compositionDetail.composition.collected = false
    }
  }

  @action.bound
  updateBatch(data) {
    this.batch = data
  }

  @action.bound
  setCompositionsData(data, option) {
    const originList = this.compositionsData.list
    const newList = data.list || []
    const list = option.page > 1 ? [...originList, ...newList] : newList
    const limit = option.limit || 40
    const page = option.page || 1
    const total = data.total
    this.compositionsData = {
      list,
      total,
      isLastPage: Math.ceil(total / limit) <= page,
      terms: {
        ...option,
        page,
        limit,
      }
    }
  }

  @action.bound
  @action changeTerms(terms) {
    const classificationData = {
      ...toJS(this.classificationData),
      terms: {
        ...toJS(this.classificationData.terms),
        ...terms,
        term: {
          ...toJS(this.classificationData.terms.term),
          ...toJS(terms.term)
        }
      }
    }

    if (terms && !terms.recommended && terms.page <= 1) {
      classificationData.terms && delete classificationData.terms.batch
    }

    this.classificationData = classificationData
  }

  @action.bound
  @action updateTerms(terms) {
    this.classificationData.terms = terms
  }

  @action.bound
  updateShotsDatas(data) {
    this.classificationData = data
  }
  @action.bound
  changeShotsDatas(data) {
    const count = data.count || data.total

    if (this.shotsData.terms && !data.host && this.shotsData.terms.page <= 1) {
      this.updateBatch(data.batch)
      this.classificationData && this.classificationData.terms && delete this.classificationData.terms.batch
    }

    this.classificationData = {
      ...toJS(this.classificationData),
      list: this.classificationData.terms.page > 1 ? [...toJS(this.classificationData.list), ...data.list] : data.list,
      count: data.total || 0,
      isLastPage: this.classificationData.terms && Math.ceil(count / this.classificationData.terms.limit) <= this.classificationData.terms.page,
      terms: {
        ...toJS(this.classificationData.terms),
        page: this.classificationData.terms.page
      },
      ssr: data.ssr,
      state: data.state
    }

    // TODO: 切换回来的batch修复
    if (this.classificationData.terms && this.classificationData.terms.recommended && !data.host) {
      this.classificationData && this.classificationData.terms && (this.classificationData.terms.batch = this.batch)
    }
  }

  @action.bound
  changeFavor(data) {
    const list = this.classificationData.list.map(l => {
      if (l.compositionId === data.id) {
        l.favored = Boolean(data.action)

        if (Boolean(data.action)) {
          l.favors += 1
        } else {
          l.favors -= 1
        }
      }

      return l
    })

    this.classificationData = {
      ...toJS(this.classificationData),
      ssr: false,
      state: true,
      list
    }
  }

  @action.bound
  changeRelatedShotsFavor(data) {
    const list = this.relatedShotsData.list.map(l => {
      if (l.compositionId === data.id) {
        l.favored = Boolean(data.action)

        if (Boolean(data.action)) {
          l.favors += 1
        } else {
          l.favors -= 1
        }
      }

      return l
    })

    this.relatedShotsData = {
      ...toJS(this.relatedShotsData),
      list
    }
  }

  @action setMemberSuggestion(members) {
    this.memberSuggestion = members
  }

  @action setBrandSuggestion(brands) {
    this.brandSuggestion = brands
  }

  @action resetCompositions(data) {
    this.compositionsData = data || {
      list: [],
      total: 0,
      terms: {
        term: {
          type: 1,
        },
        page: 1,
        limit: 40,
      }
    }
  }

  @action resetCompositionDetail(data, op) {
    if (op === 1) {
      this.compositionEdit = data || {}
    } else {
      this.compositionDetail = data || {}
    }
  }

  @action resetCompositionPreview(data) {
    this.compositionPreview = data || {}
  }

  @action setHotArticles(data, type) {
    this.hotArticles[`${hotTypeMap[type] || 'week'}List`] = data || []
  }

  @action setNewArticles(data) {
    this.newArticles.list = data || []
  }

  @action setAuthorInfo(info) {
    this.authorInfo.info = info || {}
  }

  @action setClassifications(classifications = {}) {
    this.classificationsAll = classifications
    this[classificationMap[ClassificationTypes.NORMAL]] = classifications[classificationMap[ClassificationTypes.NORMAL]]
    this[classificationMap[ClassificationTypes.CATEGORY]] = classifications[classificationMap[ClassificationTypes.CATEGORY]]
    this[classificationMap[ClassificationTypes.FORM]] = classifications[classificationMap[ClassificationTypes.FORM]]
  }

  @action.bound
  async fetchCompositions(option) {
    try {
      this.compositionsData.isLoading = true
      const response = await api.queryCompositions({ ...option, terms: JSON.stringify(option.terms) })
      this.compositionsData.isLoading = false
      if (response.success) {
        this.setCompositionsData(response.data, option.terms)
      }
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  @action.bound
  async fetchInnerShots(option) {
    try {
      const response = await api.queryCompositions({ terms: JSON.stringify(option.terms) })
      return new Promise((resolve, reject) => {
        if (response.success) {
          resolve(response)
        } else {
          reject(response.data.msg)
        }
      })
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  @action.bound
  async fetchComposition(option, callback) {
    try {
      const response = await api.queryComposition(option)
      if (response.success) {
        this.resetCompositionDetail(response.data, option.op)
      }
      if (callback) callback(response)
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  @action.bound
  async fetchCompositionPreviewCode(option, callback) {
    try {
      const response = await api.queryCompositionPreviewCode(option)
      if (!response.success) {
        message.error(response.data.msg)
      }
      if (callback) callback(response)
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  @action.bound
  async fetchCompositionPreview(option) {
    try {
      console.log('before')
      const response = await api.queryCompositionPreview(option)
      // const response = {}
      console.log('after', response)
      if (option.host) {
        return new Promise((resolve, reject) => {
          if (response.success) {
            this.resetCompositionPreview(response.data)
            // resolve(response.data)
          } else {
            // reject(response.data.msg)
          }
          resolve(response)
        })
      } else {
        if (response.success) {
          this.resetCompositionPreview(response.data)
        } else {
          message.error(response.data.msg)
        }
      }
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  @action.bound
  async fetchCompositionByUrl(option, cb) {
    try {
      const response = await api.queryCompositionByUrl(option)
      runInAction(() => {
        if (response.success) {
          if (cb) {
            cb(response.data)
          }
        } else {
          message.error(response.data.msg)
        }
      })
    } catch (error) {

    }
  }

  @action.bound
  async fetchAuthors(option = {}) {
    try {
      const response = await api.queryAuthors(option)
      if (response.success) {
        this.authors = response.data || []
      }
      return response
    } catch (error) {
      return { success: false, data: {} }
    }
  }

  @action.bound
  async fetchClassifications(option) {
    try {
      const response = await api.queryClassifications(option)
      if (response.success) {
        if (option.type) {
          this[classificationMap[option.type]] = response.data
        } else {
          const classifications = response.data || []
          this.setClassifications(classifications)
        }
      }
      return response
    } catch (error) {
      return { success: false, data: {} }
    }
  }

  @action.bound
  async fetchBrandSuggestion(option) {
    try {
      const response = await api.queryBrandSuggestion(option)
      if (response.success) {
        this.brandSuggestion = response.data
      }
    } catch (error) {

    }
  }

  @action.bound
  async fetchTagSuggestion(option) {
    try {
      const response = await api.queryTagSuggestion(option)
      if (response.success) {
        this.tagSuggestion = response.data
      }
    } catch (error) {

    }
  }

  @action.bound
  async fetchMemberSuggestion(option) {
    try {
      const response = await api.queryMemberSuggestion(option)
      if (response.success) {
        this.memberSuggestion = response.data
      }
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  @action.bound
  async addComposition({ toPreview, ...option }, callback) {
    try {
      const response = await api.addComposition(option)
      if (callback) {
        callback(response)
      }
      return response
    } catch (error) {
      const errResult = { success: false, data: { code: 'E100000' } }
      if (callback) {
        callback(errResult)
      }
      return errResult
    }
  }

  @action.bound
  async editComposition({ toPreview, ...option }, callback) {
    try {
      const response = await api.editComposition(option)
      if (callback) {
        callback(response)
      }
      return response
    } catch (error) {
      const errResult = { success: false, data: { code: 'E100000' } }
      if (callback) {
        callback(errResult)
      }
      return errResult
    }
  }

  @action.bound
  async fetchHotArticles(option) {
    this.hotArticles.isLoading = true
    try {
      const response = await api.queryHotArticles(option)
      if (response.success) {
        this.setHotArticles(response.data.list, option.type)
      }
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    } finally {
      this.hotArticles.isLoading = false
    }
  }

  @action.bound
  async fetchNewArticles(option) {
    try {
      this.newArticles.isLoading = true
      const response = await api.queryNewArticles(option)
      if (response.success) {
        this.setNewArticles(response.data)
      }
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    } finally {
      this.newArticles.isLoading = false
    }
  }

  @action.bound
  async downloadAttach(option, callback) {
    try {
      const response = await api.downloadAttach(option)
      if (response.success) {
        if (callback) {
          callback(response.data)
        }
      } else {
        message.error(response.data.msg)
      }
    } catch (error) {

    }
  }

  @action.bound
  async fetchAuthor(option) {
    try {
      this.authorInfo.isLoading = true
      const response = await api.queryAuthor(option)
      if (option.host) {
        return new Promise((resolve, reject) => {
          if (response.success) {
            this.setAuthorInfo(response.data)
            resolve(response.data)
          } else {
            resolve({})
          }
        })
      } else {
        if (response.success) {
          this.setAuthorInfo(response.data)
        } else {
          message.destroy()
          message.error(response.data.msg)
        }
      }
    } catch (error) {
      return { success: true, data: { code: 'E100000' } }
    } finally {
      this.authorInfo.isLoading = false
    }
  }

  /**
   * 获取相关作品
   * @param notAppend true 分页数据不追加
   */
  @action.bound
  async fetchRelatedCompositions({ notAppend, ...option }) {
    const isArticle = option.type === CompositionTypes.ARTICLE
    if (isArticle) {
      this.relatedArticleData.isLoading = true
    } else {
      this.relatedShotsData.isLoading = true
    }
    try {
      const response = await api.queryRelatedCompositions(option)
      if (response.success) {
        const newData = response.data || {}
        const originData = isArticle ? this.relatedArticleData : this.relatedShotsData
        const originList = originData.list || []
        const newList = newData.list || []
        // const list = (option.page > 1 && !notAppend) ? [...originList, ...newList] : newList
        const list = notAppend ? newList : [...originList, ...newList]
        const limit = option.limit || 20
        const page = option.page || 1
        const total = response.data.total
        const data = {
          ...originData,
          total,
          list,
          isLastPage: Math.ceil(total / limit) <= page,
          terms: {
            ...option,
            page,
            limit,
          }
        }
        if (isArticle) {
          this.relatedArticleData = data
        } else {
          this.relatedShotsData = data
        }
      }
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    } finally {
      if (isArticle) {
        this.relatedArticleData.isLoading = false
      } else {
        this.relatedShotsData.isLoading = false
      }
    }
  }

  // 作品列表
  @action.bound
  async fetchGetClientShotsList({ mergeAds, ...option }) {
    try {
      let result

      this.changeTerms(option.terms)

      const options = { ...toJS(this.classificationData) }

      if (options.terms && options.terms.term) {
        options.terms.term.city === 0 && delete options.terms.term.city
        options.terms.term.forms === 0 && delete options.terms.term.forms
        options.terms.term.categories === 0 && delete options.terms.term.categories
      }

      if (option.currentOption && option.currentOption.term) {
        if (option.currentOption.term && option.currentOption.term.follower) {
          options.terms && options.terms.sort && delete options.terms.sort
        } else if (option.currentOption.sort && option.currentOption.sort.length > 0) {
          options.terms && options.terms.term && options.terms.term.follower && delete options.terms.term.follower
        }
      } else {
        if (option.terms && option.terms.term && option.terms.term.follower) {
          options.terms && options.terms.sort && delete options.terms.sort
        } else if (option.terms && option.terms.sort && option.terms.sort.length > 0) {
          options.terms && options.terms.term && options.terms.term.follower && delete options.terms.term.follower
        }
      }

      if (options.terms.page <= 1 && !option.host) {
        this.classificationData.state = false
      }

      let params = { ...option, terms: JSON.stringify(options.terms) }

      if (!option.host) {
        const client = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)

        params = { ...params, client }

        if (token) {
          params = { ...params, token }
        }
      }

      result = await api.getShotsList(params)

      if (result.success) {
        this.classificationData.state = true
        const resultData = result.data
        if (mergeAds) {
          const shotsList = result.data.list || []
          resultData.list = compositionSys.mergeShotsAndAds({ shotsList, adsData: mergeAds })
        }
        this.changeShotsDatas({
          ...toJS(resultData),
          ssr: false,
          state: true
        })
      } else {
        this.classificationData.state = false
      }
      return result

    } catch (err) {
      this.classificationData.state = false
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 作品页喜欢功能
  @action.bound
  async fetchActionFavors(option) {
    try {
      if (!token && !option.action) {
        message.destroy()
        message.error(`您已经喜欢过该作品`)

        return
      }
      const param = { ...option, type: FavorTypes.SHOTS }
      const result = await homeApi.actionFavor(param)

      if (result.success) {
        this.changeFavor(option)

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
      return { success: false, data: { code: 'E100000' } }
    }
  }

  //server api
  @action.bound
  async fetchGetClassifications(option) {
    try {
      const result = await api.getClassifications(option)
      if (result.success) {
        this.setClassifications(result.data)
      }
      return result
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 作品列表 
  @action.bound
  async fetchGetShotsList(option) {
    try {
      const result = await api.getShotsList(params)

      if (result.success) {
        this.classificationData = {
          list: result.data.list,
          count: result.data.total,
          isLastPage: this.classificationData.terms && Math.ceil(result.data.total / this.classificationData.terms.limit) <= this.classificationData.terms.page
        }

        this.classificationData.state = true
      } else {
        this.classificationData.state = false

        message.error(result.data.msg)
      }
    } catch (error) {
      message.error(error)
    }
  }

  @action.bound
  async fetchActionFollow(option) {
    try {
      const response = await authorApi.actionFollow(option)
      message.destroy()
      if (response.success) {
        this.compositionDetail.composition.authorFollowed = !!option.action
        if (option.action === ActionType.FOCUS) {
          message.success('关注成功')
        } else {
          message.success('您已取消关注')
        }
      } else {
        message.error(response.data.msg)
      }
    } catch (error) {

    }
  }


  @action.bound
  async fetchActionFavor(option) {
    try {
      if (!token && !option.action) {
        message.destroy()
        message.error(`您已经喜欢过该作品`)

        return
      }
      const param = { ...option, type: FavorTypes.SHOTS }
      const response = await authorApi.actionFavor(param)
      message.destroy()
      if (response.success) {
        this.compositionDetail.composition.favored = !!option.action
        if (option.action === ActionType.FOCUS) {
          this.compositionDetail.composition.favors = (this.compositionDetail.composition.favors || 0) + 1
          message.success('喜欢成功')
        } else {
          this.compositionDetail.composition.favors = (this.compositionDetail.composition.favors || 0) - 1
          message.success('已取消喜欢')
        }
      } else {
        message.error(response.data.msg)
      }
      return response
    } catch (error) {

    }
  }

  /**
   * 相关作品喜欢动作
   * @param option 
   */
  @action.bound
  async fetchRelatedShotsFavor(option) {
    try {
      if (!token && !option.action) {
        message.destroy()
        message.error(`您已经喜欢过该作品`)

        return
      }
      const param = { ...option, type: FavorTypes.SHOTS }
      const response = await authorApi.actionFavor(param)
      message.destroy()
      if (response.success) {
        this.changeRelatedShotsFavor(option)
        if (option.action === ActionType.FOCUS) {
          message.success('喜欢成功')
        } else {
          message.success('已取消喜欢')
        }
      } else {
        message.error(response.data.msg)
      }
    } catch (error) {

    }
  }

  @action.bound
  async fetchActionCollection(option) {
    try {
      const response = await authorApi.actionCollection(option)
      message.destroy()
      if (response.success) {
        this.compositionDetail.composition.collected = !!option.action
        if (option.action === ActionType.FOCUS) {
          this.compositionDetail.composition.collections = (this.compositionDetail.composition.collections || 0) + 1
          message.success('收藏成功')
        } else {
          this.compositionDetail.composition.collections = (this.compositionDetail.composition.collections || 0) - 1
          message.success('您已取消收藏')
        }
      } else {
        message.error(response.data.msg)
      }
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 关注主页侧边作者
  @action.bound
  async fetchActionFollowAuthor(option) {
    try {
      const response = await authorApi.actionFollow(option)
      if (response.success) {
        message.destroy()
        if (Number(option.action) === ActionType.FOCUS) {
          message.success(`已关注作者`)
        } else {
          message.success(`已取消关注`)
        }
        const info = this.authorInfo.info || {}

        this.setAuthorInfo({
          ...info,
          followed: !!option.action,
        })
      } else {
        message.error(response.data.msg)
      }
    } catch (err) {
      console.log(err)
    }
  }

  @action.bound
  async verifyMemberInvite(option, callback) {
    try {
      const response = await api.verifyMemberInvite(option)
      if (callback) callback(response)
    } catch (error) {

    }
  }

  @action.bound
  async confirmMemberInvite(option, callback) {
    try {
      const response = await api.confirmMemberInvite(option)
      if (callback) callback(response)
    } catch (error) {

    }
  }

  @action.bound
  async fetchCompositionFavorites(option) {
    try {
      this.compositionFavoritesData.loading = true
      const response = await collectionApi.queryCompositionFavorites(option)
      this.compositionFavoritesData.loading = false
      if (response.success) {
        const originList = this.compositionFavoritesData.list || []
        const newList = response.data.data || []
        const list = option.pageIndex > 1 ? [...originList, ...newList] : newList
        const pageIndex = option.pageIndex || 1
        const pageSize = option.pageSize || 20
        const title = response.data.title
        const total = response.data.total_count
        const isEnd = Math.ceil(total / pageSize) <= pageIndex
        this.compositionFavoritesData = {
          loading: false,
          isLoad: true,
          isEnd,
          list,
          title,
          total,
          terms: {
            ...option,
            pageIndex,
            pageSize,
          },
        }
      }
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  @action.bound
  async fetchSyncMawards(option) {
    try {
      const response = await api.syncMawarks(option)
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

}

export default new CompositionStore()