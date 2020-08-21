import { observable, action, runInAction } from 'mobx'
import { message } from 'antd'
import { followApi, authorApi, collectionApi } from '@api'
import { toJS } from 'mobx'

import { CompositionTypes, ActionType, FavorTypes } from '@base/enums'
import basic from '@base/system/basic'

const token = basic.token

export class FollowStore {
  @observable followShotsData: object
  @observable followArticleData: object
  @observable followTagData: object
  @observable followAuthorData: object
  @observable followFavoritesData: object

  constructor(initialData = {}) {
    this.followShotsData = initialData.followShotsData || {
      list: [],
      total: 0,
      page: 1,
      size: 20,
      isLoading: false,
      isLoaded: false,
    }
    this.followArticleData = initialData.followArticleData || {
      list: [],
      total: 0,
      page: 1,
      size: 10,
      isLoading: false,
      isLoaded: false,
      isLastPage: false,
    }
    this.followTagData = initialData.followTagData || {
      list: [],
      total: 0,
      isLoading: false,
      isLoaded: false,
    }
    this.followAuthorData = initialData.followAuthorData || {
      list: [],
      total: 0,
      page: 1,
      size: 10,
      isLastPage: false,
      isLoading: false,
      isLoaded: false,
    }
    this.followFavoritesData = initialData.followFavoritesData || {
      list: [],
      total: 0,
      terms: {
        pageIndex: 1,
        pageSize: 20,
      },
      isEnd: false,
      loading: false,
      isLoad: false,
    }
  }

  @action.bound
  setCompositionStatus(status, type) {
    if (type === CompositionTypes.ARTICLE) {
      this.followArticleData.isLoading = status
    } else {
      this.followShotsData.isLoading = status
    }
  }

  @action.bound
  setCompositionData(data, option) {
    const isArticle = option.composition_type === CompositionTypes.ARTICLE
    const originList = this.followShotsData.list || []
    const newList = data.data || []
    const list = option.page > 1 ? [...originList, ...newList] : newList
    const total = data.total_count || 0
    const page = option.page || 1
    const size = option.size || (isArticle ? 10 : 20)
    const isLastPage = Math.ceil(total / size) <= page
    const newData = {list, total, page, size, isLastPage, isLoaded: true, isLoading: false}
    if (isArticle) {
      this.followArticleData = newData
    } else {
      this.followShotsData = newData
    }
  }

  @action.bound
  setAuthorData(data, option) {
    const originList = this.followAuthorData.list || []
    const newList = data.data || []
    const list = option.page > 1 ? [...originList, ...newList] : newList
    const total = data.total_count || 0
    const page = option.page || 1
    const size = option.size || 20
    const isLastPage = Math.ceil(total / size) <= page
    this.followAuthorData = {
      list,
      total,
      page,
      size,
      isLastPage,
      isLoaded: true,
      isLoading: false,
    }
  }

  @action setAuthorFollow(option) {
    const list = (this.followAuthorData.list || []).map((item: any) => {
      if (item.id === option.id) {
        item.followed = !!option.action
      }
      return item
    })
    this.followAuthorData.list = list
  }

  @action setTagFollow(option) {
    const list = (this.followTagData.list || []).filter((item: any) => (item.id !== option.id))
    this.followTagData.list = list
  }

  @action setFavoritesFollow(option) {
    const list = (this.followFavoritesData.list || []).map((item: any) => {
      if (item.id === option.id) {
        item.followed = !!option.action
      }
      return item
    })
    this.followFavoritesData.list = list
  }

  @action setShotsFavor(option) {
    const originList = this.followShotsData.list || []
    const list = originList.map(item => {
      if (option.id === item.compositionId) {
        item.favored = !!option.action
        if (!!option.action) {
          item.favors += 1
        } else {
          item.favors -= 1
        }
      }
      return toJS(item)
    })
    this.followShotsData.list = list
  }

  @action.bound
  setFavoritesData(data, option) {
    const originList = this.followFavoritesData.list || []
    const newList = data.data || []
    const list = option.pageIndex > 1 ? [...originList, ...newList] : newList
    const total = data.total_count || 0
    const pageIndex = option.pageIndex || 1
    const pageSize = option.pageSize || 20
    const isEnd = Math.ceil(total / pageSize) <= pageIndex
    const terms = {
      ...toJS(this.followFavoritesData.terms),
      ...option,
      pageIndex,
      pageSize,
    }
    this.followFavoritesData = {list, total, terms, isEnd, isLoad: true, loading: false}
  }

  @action.bound
  deleteOneFavorites(id) {
    let total = this.followFavoritesData.total || 0
    this.followFavoritesData.list = (this.followFavoritesData.list || []).filter(item => {
      if (item.id === id) {
        total -= 1
      }
      return item.id !== id
    })
    this.followFavoritesData.total = total
  }

  @action.bound
  async fetchFollowCompositions(option) {
    try {
      this.setCompositionStatus(true, option.composition_type)
      const response = await followApi.queryFollowCompositions(option)
      this.setCompositionStatus(false, option.composition_type)
      if (response.success) {
        this.setCompositionData(response.data || {}, option)
      } else {
        message.error(response.data.msg)
      }
    } catch (error) {
      
    }
  }

  @action.bound
  async fetchFollowAuthors(option) {
    try {
      this.followAuthorData.isLoading = true
      const response = await followApi.queryFollowAuthors(option)
      this.followAuthorData.isLoading = false
      if (response.success) {
        this.setAuthorData(response.data || {}, option)
      } else {
        message.error(response.data.msg)
      }
    } catch (error) {
      
    }
  }

  @action.bound
  async fetchFollowTags(option) {
    try {
      this.followTagData.isLoading = true
      const response = await followApi.queryFollowTags(option)
      this.followTagData.isLoading = false
      if (response.success) {
        const data = response.data || {}
        const list = data.data || []
        this.followTagData = {
          list,
          total: data.total_count || 0,
          isLoaded: true,
          isLoading: false,
        }
      } else {
        message.error(response.data.msg)
      }
    } catch (error) {
      
    }
  }

  @action.bound
  async fetchFollowAuthor(option) {
    try {
      const response = await authorApi.actionFollow(option)
      if(response.success) {
          message.destroy()
          if(Number(option.action) === ActionType.FOCUS) {
              message.success(`已关注作者`)
          } else {
              message.success(`已取消关注`)
          }
          this.setAuthorFollow(option)
      } else {
          message.error(response.data.msg)
      }
    } catch (error) {
      
    }
  }

  @action.bound
  async fetchFollowTag(option) {
    try {
      const response = await authorApi.actionFollow(option)
      if(response.success) {
          message.destroy()
          if(Number(option.action) === ActionType.FOCUS) {
              message.success(`已关注标签`)
          } else {
              message.success(`已取消关注`)
          }
          this.setTagFollow(option)
      } else {
          message.error(response.data.msg)
      }
    } catch (error) {
      
    }
  }

  @action.bound
  async fetchShotsFavor(option) {
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
        this.setShotsFavor(option)
        if (!!option.action) {
          message.success('喜欢成功')
        } else {
          message.success('已取消喜欢成功')
        }
      } else {
        message.error(response.data.msg)
      }
    } catch (error) {
      
    }
  }

  @action.bound
  async fetchFollowFavorites(option) {
    try {
      this.followFavoritesData.loading = true
      const response = await followApi.queryFollowFavorites(option)
      this.followFavoritesData.loading = false
      if (response.success) {
        this.setFavoritesData(response.data || {}, option)
      } else {
        message.error(response.data.msg)
      }

    } catch (error) {

    }
  }

  @action.bound
  async actionFollowFavorites(option) {
    const response = await authorApi.actionFollow(option)
      if(response.success) {
          message.destroy()
          if(Number(option.action) === ActionType.FOCUS) {
              message.success(`已关收藏夹`)
          } else {
              message.success(`已取消关注`)
          }
          this.deleteOneFavorites(option.id)
      } else {
          message.error(response.data.msg)
      }
  }
}


export default new FollowStore()