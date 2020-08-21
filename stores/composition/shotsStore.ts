import { observable, action, computed, runInAction, toJS } from 'mobx'
import { message } from 'antd'
import { compositionApi, authorApi, collectionApi, serviceApi } from '@api'
import { ClassificationTypes, CompositionTypes, ActionType, FavorTypes, CompositionStatus, UploadFileTypes } from '@base/enums'
import { composition as compositionSys } from '@base/system'
import { config } from '@utils'

export class ShotsStore {
  @observable detail: any
  @observable files: Array<any>
  @observable autoPlay: boolean
  @observable shotsServices: Array<any>
  @observable shotsData: any

  constructor(initialData: any = {}) {
    this.detail = initialData.detail || {}
    this.files = initialData.files || []
    this.autoPlay = !!initialData.autoPlay
    this.shotsServices = initialData.shotsServices || []
    this.shotsData = initialData.shotsData || {
      list: [],
      loading: false,
      end: false,
      terms: {
        term: {
          type: CompositionTypes.SHOTS,
        },
        recommended: true,
        page: 1,
        limit: 45,
      }
    }
  }

  @computed get filesCount() {
    return this.files.length
  }
  @computed get hasVideo() {
    return this.files.some(item => item.type === UploadFileTypes.WORKS_VIDEO)
  }
  @computed get firstVideoIndex() {
    return this.files.findIndex(item => item.type === UploadFileTypes.WORKS_VIDEO)
  }

  @action.bound
  setDetail(data) {
    this.detail = data || {}
  }
  @action.bound
  setFiles(files) {
    this.files = (files || []).slice().sort((a, b) => a.position - b.position)
  }
  @action.bound
  setFavor(action) {
    this.detail.favored = !!action
    if (action === ActionType.FOCUS) {
      this.detail.favors = (this.detail.favors || 0) + 1
    } else {
      this.detail.favors = (this.detail.favors || 0) - 1
    }
  }
  @action.bound
  setFollow(action) {
    this.detail.authorFollowed = !!action
  }
  @action.bound
  setCollections(action) {
    const currCollections = this.detail.collections || 0
    if (action === ActionType.FOCUS) {
      this.detail.collections = currCollections + 1
    } else {
      this.detail.collections = currCollections > 0 ? currCollections - 1 : 0
    }
    if (this.detail.collections > 0) {
      this.detail.collected = true
    } else {
      this.detail.collected = false
    }
  }
  @action.bound
  setAutoPlay(flag) {
    this.autoPlay = flag
  }

  @action.bound
  async fetchCompositions({ mergeAds, terms, ...option }) {
    try {
      this.shotsData.loading = true
      const response = await compositionApi.queryCompositions({ ...option, terms: JSON.stringify(terms) })
      this.shotsData.loading = false
      if (response.success) {
        const data = response.data || {}
        const newList = data.list || []
        const originList = this.shotsData.list || []
        const total = data.total || 0
        const batch = data.batch || 0
        const end = Math.ceil(total / terms.limit) <= terms.page
        let list = terms.page > 1 ? [...originList, ...newList] : newList
        if (mergeAds) {
          list = compositionSys.mergeShotsAndAds({ shotsList: list, adsData: mergeAds })
        }
        this.shotsData = {
          list,
          total,
          batch,
          end,
          terms,
          loading: false,
        }
      }
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  @action.bound
  async fetchComposition(option) {
    try {
      const response = await compositionApi.queryComposition(option)
      if (response.success) {
        const data = response.data || {}
        const detail = data.composition || {}
        this.setDetail(detail)
        this.setFiles(detail.files)
      }
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  @action.bound
  async fetchCompositionPreview(option) {
    try {
      const response = await compositionApi.queryCompositionPreview(option)
      if (response.success) {
        const data = response.data || {}
        const detail = data.composition || {}
        this.setDetail(detail)
        this.setFiles(detail.files)
      }
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  @action.bound
  async fetchShotsServices(option) {
    try {
      const response = await serviceApi.queryCompositionServices(option)
      if (response.success) {
        this.shotsServices = response.data || []
      }
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  @action.bound
  async fetchFavor(option) {
    try {
      const param = { ...option, type: FavorTypes.SHOTS }
      const response = await authorApi.actionFavor(param)
      if (response.success) {
        this.setFavor(option.action)
      }
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  @action.bound
  async fetchFollow(option) {
    try {
      const response = await authorApi.actionFollow(option)
      message.destroy()
      if (response.success) {
        this.setFollow(option.action)
        if (option.action === ActionType.FOCUS) {
          message.success('关注成功')
        } else {
          message.success('您已取消关注')
        }
      } else {
        message.error(response.data.msg)
      }
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  /**
   * 详情页直接收藏
   * @param option 
   */
  @action.bound
  async fetchCollection(option) {
    try {
      const response = await authorApi.actionCollection(option)
      message.destroy()
      if (response.success) {
        this.detail.collected = !!option.action
        if (option.action === ActionType.FOCUS) {
          this.detail.collections = (this.detail.collections || 0) + 1
          message.success('收藏成功')
        } else {
          this.detail.collections = (this.detail.collections || 0) - 1
          message.success('您已取消收藏')
        }
      } else {
        message.error(response.data.msg)
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  // 作品列表页喜欢
  @action.bound
  async fetchListFavor(option) {
    try {
      
      const param = { ...option, type: FavorTypes.SHOTS }
      const response = await authorApi.actionFavor(param)

      if (response.success) {
        const list = this.shotsData.list.map(l => {
          if (l.compositionId === option.id) {
            l.favored = Boolean(option.action)

            if (Boolean(option.action)) {
              l.favors += 1
            } else {
              l.favors -= 1
            }
          }

          return l
        })

        this.shotsData = {
          ...toJS(this.shotsData),
          ssr: false,
          state: true,
          list
        }

        if (option.action) {
          message.destroy()
          message.success(`喜欢成功`)
        } else {
          message.destroy()
          message.success(`取消喜欢成功`)
        }
      } else {
        message.error(response.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }
}
