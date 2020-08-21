import { observable, action, runInAction, toJS } from 'mobx'
import { message } from 'antd'
import { collectionApi as api, authorApi } from '@api'
import { CompositionTypes } from '@base/enums'


export class CollectionStore {
    @observable favoritesData: any
    @observable favoritesDetail: object
    @observable currentFavorites: Array<object>
    @observable favoritesArticles: object
    @observable favoritesShots: object
    @observable myFavoritesData: object
    @observable compositionFavoritesData: any

    constructor(initialData:any = {}) {
        this.favoritesData = initialData.favoritesData || {
            loading: false,
            isLoad: false,
            isEnd: false,
            list: [], 
            total: 0,
            terms: {},
        }
        this.favoritesDetail = initialData.favoritesDetail || {}
        this.currentFavorites = initialData.currentFavorites || []
        this.favoritesArticles = initialData.favoritesArticles || {
            loading: false,
            isLoad: false,
            isEnd: false,
            list: [],
            total: 0,
            terms: {
                pageIndex: 1,
                pageSize: 10,
            },
        }
        this.favoritesShots = initialData.favoritesShots || {
            loading: false,
            isLoad: false,
            isEnd: false,
            list: [],
            total: 0,
            terms: {
                pageIndex: 1,
                pageSize: 40,
            },
        }
        this.myFavoritesData = initialData.myFavoritesData || {
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
    appendCurrentFavorites(favoritesItem) {
        this.currentFavorites.push(favoritesItem)
    }
    @action.bound
    appendMyFavorites(favoritesItem) {
        const favoritesList = this.myFavoritesData.list || []
        favoritesList.push(favoritesItem)
        this.myFavoritesData.list = favoritesList
    }

    @action.bound
    updateOneCurrentFavorites(favoritesItem) {
        const favorites = [...toJS(this.currentFavorites)]
        this.currentFavorites = favorites.map(item => {
            if (item.id === favoritesItem.id) {
                item = {
                    ...item,
                    ...favoritesItem,
                }
            }
            return item
        })
    }
    @action.bound
    updateOneMyFavorites(favoritesItem) {
        const favoritesList = this.myFavoritesData.list || []
        const favorites = [...toJS(favoritesList)]
        this.myFavoritesData.list = favorites.map(item => {
            if (item.id === favoritesItem.id) {
                item = {
                    ...item,
                    ...favoritesItem,
                }
            }
            return item
        })
    }

    @action.bound
    deleteOneCurrentFavorites(id) {
        this.currentFavorites.list = (this.currentFavorites.list || []).filter(item => item.id !== id)
    }
    @action.bound
    deleteOneMyFavorites(id) {
        this.myFavoritesData.list = (this.myFavoritesData.list || []).filter(item => item.id !== id)
    }

    @action.bound
    setMyFavoritesData(data, option) {
        const originList = this.myFavoritesData.list || []
        const newList = data.data || []
        const list = option.pageIndex > 1 ? [...originList, ...newList] : newList
        const total = data.total_count || 0
        const pageIndex = option.pageIndex || 1
        const pageSize = option.pageSize || 20
        const isEnd = Math.ceil(total / pageSize) <= pageIndex
        const terms = {
          ...toJS(this.myFavoritesData.terms),
          ...option,
          pageIndex,
          pageSize,
        }
        this.myFavoritesData = {list, total, terms, isEnd, isLoad: true, loading: false}
      }

    @action.bound
    async fetchPublicFavorites(param:any = {}) {
        try {
            const option: any = {
                ...param,
                page_index: param.page_index || 1,
                page_size: param.page_size || 40,
            }
            this.favoritesData.loading = true
            const response: any = await api.queryPublicFavorites(option)
            this.favoritesData.loading = false
            return new Promise((resolve, reject) => {
                if (response.success) {
                    const originList = this.favoritesData.list ||[]
                    const newList = response.data.data || []
                    const list = option.page_index > 1 ? [...originList, ...newList] : newList
                    const page_index = option.page_index || 1
                    const page_size = option.page_size || 40
                    const total = response.data.total_count
                    const isEnd = Math.ceil(total / page_size) <= page_index
                    this.favoritesData = {
                        loading: false,
                        isLoad: true,
                        isEnd,
                        list,
                        total,
                        terms: {
                            ...option,
                            page_index,
                            page_size,
                        },
                    }
                    resolve(this.favoritesData)
                } else {
                    reject(response.data)
                }
            })
        } catch (error) {
            
        }
    }

    @action.bound
    async fetchFavoritesDetail(option) {
        try {
            const response = await api.queryFavoritesDetail(option)
            return new Promise((resolve, reject) => {
                if (response.success) {
                    this.favoritesDetail = response.data || {}
                } 
                resolve(response)
            })
        } catch (error) {
            
        }
    }

    @action.bound
    async fetchCurrentFavorites(option) {
        try {
            const response = await api.queryCurrentFavorites(option)
            return new Promise((resolve, reject) => {
                if (response.success) {
                    this.currentFavorites = response.data || []
                    resolve(this.currentFavorites)   
                } else {
                    reject(response.data)
                }
            })
        } catch (error) {
        
        }
    }

    @action.bound
    async fetchFavoritesCompositions(option) {
        const isArticle = option.compositionType === CompositionTypes.ARTICLE
        try {
            if (isArticle) {
                this.favoritesArticles.loading = true
            } else {
                this.favoritesShots.loading = true
            }
            const response = await api.queryFavoritesCompositions(option)

            if (isArticle) {
                this.favoritesArticles.loading = false
            } else {
                this.favoritesShots.loading = false
            }
            return new Promise((resolve, reject) => {
                if (response.success) {
                    const originList = (isArticle ? this.favoritesArticles.list : this.favoritesShots.list) || []
                    const newList = response.data.data || []
                    const list = option.pageIndex > 1 ? [...originList, ...newList] : newList
                    const pageIndex = option.pageIndex || 1
                    const pageSize = option.pageSize || (isArticle ? 10 : 40)
                    const total = response.data.totalCount
                    const isEnd = Math.ceil(total / pageSize) <= pageIndex
                    const compositionData = {
                        loading: false,
                        isLoad: true,
                        isEnd,
                        list,
                        total,
                        terms: {
                            ...option,
                            pageIndex,
                            pageSize,
                        },
                    }
                    if (isArticle) {
                        this.favoritesArticles = compositionData
                    } else {
                        this.favoritesShots = compositionData
                    }
                    resolve(compositionData)
                } else {
                    reject(response.data)
                }
            })
        } catch (error) {
            
        }
    }

    @action.bound
    async addFavorites(option) {
        try {
            const response = await api.addFavorites(option)
            return new Promise((resolve, reject) => {
                if (response.success) {
                    const favoritesItem = {
                        ...option,
                        id: response.data,
                    }
                    this.appendCurrentFavorites(favoritesItem)
                    this.appendMyFavorites(favoritesItem)
                } else {

                }
                resolve(response)
            })
        } catch (error) {
            
        }
    }

    @action.bound
    async editFavorites({isDetail, ...option}) {
        try {
            const response = await api.editFavorites(option)
            return new Promise((resolve, reject) => {
                if (response.success) {
                    const favoritesItem = {
                        id: option.id,
                        name: option.name,
                        description: option.description,
                        published: option.published,
                    }
                    this.updateOneCurrentFavorites(favoritesItem)
                    this.updateOneMyFavorites(favoritesItem)
                    if (isDetail) {
                        this.favoritesDetail.name = option.name
                        this.favoritesDetail.description = option.description
                        this.favoritesDetail.published = option.published
                    }
                    
                } 
                resolve(response)
            })
        } catch (error) {
            
        }
    }

    @action.bound
    async deleteFavorites(option) {
        try {
            const response = await api.deleteFavorites(option)
            return new Promise((resolve, reject) => {
                if (response.success) {
                    this.deleteOneCurrentFavorites(option.id)
                    this.deleteOneMyFavorites(option.id)
                } else {
                    message.error(response.data.msg)
                }
                resolve(response)
            })
        } catch (error) {
            
        }
    }

    @action.bound
    async fetchFavoritesDetailFollow(option) {
        try {
            const response = await authorApi.actionFollow(option)
            message.destroy()
            if (response.success) {
                if (!!option.action) {
                    message.success('已关注收藏夹')
                    this.favoritesDetail.follows += 1
                } else {
                    message.success('已取消收藏夹')
                    this.favoritesDetail.follows -= 1
                }
                this.favoritesDetail.followed = !!option.action
            } else {
                message.error(response.data.msg)
            }
        } catch (error) {
            
        }
    }

    @action.bound
    async fetchFavoritesShotsFavor(option) {
        try {
            const response = await authorApi.actionFavor(option)
            message.destroy()
            if (response.success) {
                const list = this.favoritesShots.list.map(item => {
                    if (item.id === option.id) {
                        item.favored = !!option.action

                        if(Boolean(option.action)) {
                            item.favors += 1
                        } else {
                            item.favors -= 1
                        }
                    }
                    return item
                })
                this.favoritesShots = {
                    ...toJS(this.favoritesShots),
                    list,
                }
                if (!!option.action) {
                    message.success('喜欢成功')
                } else {
                    message.success(`取消喜欢成功`)
                }
            } else {
                message.error(response.data.msg)
            }
        } catch (error) {
            
        }
    }

    @action.bound
    async fetchCurrentCollection(option) {
        try {
            const response = await authorApi.actionCollection(option)
            if (response.success) {
                const favorites = this.currentFavorites.map(item => {
                    if (option.collectionId === item.id) {
                        item.collected = !!option.action
                    }
                    return item
                })
                this.currentFavorites = favorites
            } else {
                message.destroy()
                message.error('收藏失败')
            }
            return response
        } catch (error) {
            return {success: false, data: {code: 'E100000'}}
        }
    }


    @action.bound
    async fetchMyFavorites(option) {
      try {
        this.myFavoritesData.loading = true
        const response = await api.queryMyFavorites(option)
        this.myFavoritesData.loading = false
        if (response.success) {
          this.setMyFavoritesData(response.data || {}, option)
        } else {
          message.error(response.data.msg)
        }
  
      } catch (error) {
  
      }
    }

    @action.bound
    async fetchCompositionFavorites(option) {
        try {
            this.compositionFavoritesData.loading = true
            const response = await api.queryCompositionFavorites(option)
            this.compositionFavoritesData.loading = false
            if (response.success) {
                const originList = this.compositionFavoritesData.list ||[]
                const newList = response.data.data || []
                const list = option.pageIndex > 1 ? [...originList, ...newList] : newList
                const pageIndex = option.pageIndex || 1
                const pageSize = option.pageSize || 40
                const title = response.data.title
                const total = response.data.total_count
                const isEnd = Math.ceil(total / pageSize) <= pageIndex
                delete option.host
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
            // return new Promise((resolve, reject) => {
            //     if (response.success) {
            //         const originList = this.compositionFavoritesData.list ||[]
            //         const newList = response.data.data || []
            //         const list = option.pageIndex > 1 ? [...originList, ...newList] : newList
            //         const pageIndex = option.pageIndex || 1
            //         const pageSize = option.pageSize || 40
            //         const title = response.data.title
            //         const total = response.data.total_count
            //         const isEnd = Math.ceil(total / pageSize) <= pageIndex
            //         delete option.host
            //         this.compositionFavoritesData = {
            //             loading: false,
            //             isLoad: true,
            //             isEnd,
            //             list,
            //             title,
            //             total,
            //             terms: {
            //                 ...option,
            //                 pageIndex,
            //                 pageSize,
            //             },
            //         }
            //     }
            //     resolve(response)
            // })
        } catch (error) {
            return {success: false, data: {code: 'E100000'}}
        }
    }
}