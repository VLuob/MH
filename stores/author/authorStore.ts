import { observable, action, runInAction, toJS } from 'mobx'
import { utils, cookie, config } from '@utils'
import basic from '@base/system/basic'
import jsCookie from 'js-cookie'
import { authorApi, serviceApi } from '@api'
import { message } from 'antd'
import { ActionType, FavorTypes, CompositionType } from '@base/enums'

const userApi = config.API_MEIHUA_UCENTER
const api = config.API_MEIHUA
const token = basic.token

export class AuthorStore {
  @observable authorListData: any
  @observable authorData: any
  @observable authors: Array<any>
  @observable originalCondition: any
  @observable condition: any
  @observable favorData: any
  @observable favorCondition: any
  @observable authorParam: any
  @observable compositionData: any
  @observable compositionParam: any
  @observable articleData: any
  @observable articleParam: any
  @observable favorsData: any
  @observable favorsParam: any
  @observable favorsArticleData: any
  @observable favorsArticleParam: any
  @observable followData: any
  @observable followParam: any
  @observable fansData: any
  @observable fansParam: any
  @observable aboutData: any
  @observable briefInfo: any
  @observable collectionList: Array<any>
  @observable authorRecommendeds: Array<any>
  @observable classificationsData: any
  @observable authorInfos: any
  @observable authorServiceData: any

  constructor(initialData: any = {}) {
    this.authorListData = initialData.authorListData || {
      list: [],
      count: 0,
      isLastPage: false,
      state: false,
      ssr: true,
    }
    this.authorData = initialData.authorData || {
      list: [],
      total: 0,
      end: false,
      loading: false,
      terms: {
        term: {},
        recommended: true,
        page: 1,
        limit: 20,
      },
    }
    this.authors = initialData.authors || []
    this.originalCondition = initialData.originalCondition || {
      keywords: null,
      term: {
        type: null,
        province: null,
        city: null,
        follower: null,
        classifications: null,
        categories: null,
        forms: null,
        authors: null,
        gmtStart: null,
        gmtEnd: null,
        compositionType: null
      },
      sort: null,
      recommended: true,
      page: 1,
      limit: 45
    }
    this.condition = initialData.condition || { recommended: true, page: 1, limit: 45 }
    this.favorData = initialData.favorData || {}
    this.favorCondition = initialData.favorCondition || {}
    this.authorParam = initialData.authorParam || { page: 1, size: 60 }
    this.compositionData = initialData.compositionData || {
      list: [],
      count: 0,
      state: false,
      isLastPage: true
    }
    this.compositionParam = initialData.compositionParam || { page: 1, size: 15 }
    this.articleData = initialData.articleData || {
      list: [],
      count: 0,
      state: false,
      isLastPage: true
    }
    this.articleParam = initialData.articleParam || { page: 1, size: 12 }
    this.favorsData = initialData.favorsData || {
      ssr: true,
      list: [],
      count: 0,
      articleCount: 0,
      compositionCount: 0,
      isLastPage: true
    }
    this.favorsParam = initialData.favorsParam || { page: 1, size: 60 }
    this.favorsArticleData = initialData.favorsArticleData || {
      list: [],
      count: 0,
      articleCount: 0,
      compositionCount: 0,
      isLastPage: true
    }
    this.favorsArticleParam = initialData.favorsArticleParam || { page: 1, size: 60 }
    this.followData = initialData.followData || { list: [], count: 0, isLastPage: true }
    this.followParam = initialData.followParam || { page: 1, size: 60 }
    this.fansData = initialData.fansData || { list: [], count: 0, isLastPage: true }
    this.fansParam = initialData.fansParam || { page: 1, size: 60 }
    this.aboutData = initialData.aboutData || { ssr: true, state: false }
    this.briefInfo = initialData.briefInfo || { ssr: true }
    this.collectionList = initialData.collectionList || []
    this.authorRecommendeds = initialData.authorRecommendeds || []
    this.classificationsData = initialData.classificationsData || {
      list: [],
      ssr: true,
      page: 1,
      state: false,
      size: 20,
      count: 0
    }
    this.authorInfos = initialData.authorInfos || {}
    this.authorServiceData = initialData.authorServiceData || {
      list: [],
      loading: false,
      total: 0,
      end: false,
      terms: {
        pageIndex: 1,
        pageSize: 10,
      },
    }
  }

  @action.bound
  updateAuthorInfos(data) {
    this.authorInfos = data
  }

  @action.bound
  changeFavorsData(data) {
    this.favorsData = {
      ...toJS(this.favorsData),
      ssr: data.ssr || false,
      articleCount: data.articleCount,
      compositionCount: data.compositionCount
    }
  }

  @action.bound
  changeFavor(data) {
    const list = this.compositionData.list.map(l => {
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

    this.compositionData = {
      ...toJS(this.compositionData),
      // ssr: false,
      state: true,
      list
    }
  }

  @action.bound
  changeBriefInfo(data) {
    this.briefInfo = data
  }

  @action.bound
  changeAboutData(data) {
    this.aboutData = {
      ...toJS(this.aboutData),
      ...data
    }

    // console.log(toJS(this.aboutData))
  }

  @action.bound
  updateComposition(option) {
    switch (option.type) {
      case CompositionType.COMPOSITION:
        this.compositionData = option.data

        break
      case CompositionType.ARTICLE:
        this.articleData = option.data

        break
    }
  }

  @action.bound
  updateCompositionParam(option) {
    switch (option.type) {
      case CompositionType.COMPOSITION:
        this.compositionParam = option.data

        break
      case CompositionType.ARTICLE:
        this.articleParam = option.data

        break
    }
  }

  @action.bound
  changeComposition(option) {
    switch (option.type) {
      case CompositionType.COMPOSITION:
        this.compositionData = {
          ...toJS(this.compositionData),
          list: option.page > 1 ? [...toJS(this.compositionData.list), ...option.data] : option.data,
          count: option[`total_count`],
          isLastPage: Math.ceil(option[`total_count`] / this.compositionParam.size) <= option.page,
          state: option.state
        }

        this.updateCompositionParam({
          type: CompositionType.COMPOSITION,
          data: {
            ...toJS(this.compositionParam),
            page: option.page + 1,
            size: option.size || 15
          }
        })

        break
      case CompositionType.ARTICLE:
        this.articleData = {
          ...toJS(this.articleData),
          list: option.page > 1 ? [...toJS(this.articleData.list), ...option.data] : option.data,
          count: option[`total_count`],
          isLastPage: Math.ceil(option[`total_count`] / this.articleParam.size) <= option.page,
          state: option.state,
          ssr: option.ssr
        }

        this.updateCompositionParam({
          type: CompositionType.ARTICLE,
          data: {
            ...toJS(this.articleParam),
            page: option.page + 1,
            size: option.size || 12
          }
        })

        break
    }
  }

  @action.bound
  changeCondition(data) {
    this.condition = {
      ...toJS(this.condition),
      ...data,
      term: {
        ...toJS(this.condition.term),
        ...data.term
      }
    }
  }

  @action.bound
  updateClassificationData(data) {
    this.classificationsData = data || []
  }

  @action.bound
  changeAuthorList(data) {
    const list = data.data || toJS(data.list) || []
    let count = data.count || data.total_count

    count = isNaN(count) ? 0 : count

    this.authorListData = {
      ...toJS(this.authorListData),
      list: this.condition.page > 1 ? [...toJS(this.authorListData.list), ...list] : list,
      count: count || 0,
      isLastPage: Math.ceil(count / this.condition.limit) <= data.page,
      ssr: data.ssr,
      state: data.state
    }

    this.condition = {
      ...toJS(this.condition),
      page: data.page || 1
    }

    // console.log('author list', toJS(this.authorListData))
  }

  @action.bound
  setAuthorRecommendeds(data) {
    this.authorRecommendeds = data || []
  }

  // 获取作者列表 
  @action.bound
  async fetchAuthorList(option) {
    if (option.condition.page <= 1) {
      this.authorListData.state = false
    }

    try {
      const params = { ...option, condition: JSON.stringify(toJS(option.condition)) }
      const result = await authorApi.queryAuthorList(params)

      if (option.host) {
        return new Promise((resolve, reject) => {
          if (result.success) {
            this.condition = toJS({ ...this.condition, ...option.condition })
            this.changeAuthorList({
              ...result.data,
              ssr: true,
              state: true,
              page: this.condition.page
            })

            resolve(this.authorListData)
          } else {
            this.authorListData.state = false
            // reject(result.data.msg)
          }
        })
      } else {
        if (result.success) {
          this.condition = toJS({ ...this.condition, ...option.condition })
          this.changeAuthorList({
            ...result.data,
            ssr: false,
            state: true,
            page: this.condition.page
          })
        } else {
          this.authorListData.state = false
          message.error(result.data.msg)
        }
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  /**
   * 获取创作者列表数据（新）
   * @param option 
   */
  @action.bound
  async fetchAuthorData({condition, ...option}) {
    try {
      this.authorData.loading = true
      const params = { ...option, condition: JSON.stringify(toJS(condition)) }
      const response = await authorApi.queryAuthorList(params)
      this.authorData.loading = false
      if (response.success) {
        const data = response.data || {}
        const originList = this.authorData.list || []
        const newList = data.data || []
        const total = data.total_count || 0
        const list = condition.page > 1 ? [...originList, ...newList] : newList
        const end = Math.ceil(total / condition.limit) <= condition.page
        this.authorData = {
          list,
          total,
          end,
          loading: false,
          terms: condition,
        }
      }
      return response
    } catch (error) {
      return {success: false, data: {code: 'E100000'}}
    }
  }

  /**
   * 获取已发布创作者
   * @param option 
   */
  @action.bound
  async fetchAuthors(option = {}) {
    try {
      const response = await authorApi.queryAuthors(option)
      if (response.success) {
        this.authors = response.data || []
      }
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 获取主页作者喜欢 
  @action.bound
  async fetchFavorList(option) {
    try {
      const result = await authorApi.getAuthorFavor({ condition: JSON.stringify(option.condition) })

      runInAction(() => {
        if (result.success) {

        } else {
          message.error(result.data.msg)
        }
      })
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 获取主页个人/机构的作品/文章
  @action.bound
  async fetchGetComposition(option) {
    if (option.page < 2) {
      switch (option.type) {
        case CompositionType.COMPOSITION:
          this.compositionData.state = false

          break
        case CompositionType.ARTICLE:
          this.articleData.state = false

          break
      }
    }

    try {
      const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
      const params = { ...option }
      if (!params.client_code) {
        params.client_code = client_code
      }
      const result = await authorApi.getComposition(params)
      !result.data && (result.data = {})
      if (result.success) {
        this.changeComposition({
          type: option.type,
          ...result.data,
          page: option.page,
          size: option.size,
          state: true,
        })
      } else {
        this.compositionData.state = false
        this.articleData.state = false
      }
      return result
    } catch (err) {
      return { success: false, data: { code: 'E100000', msg: '' } }
    }
  }

  @action.bound
  async fetchAuthorServices(option) {
    try {
      this.authorServiceData.loading = true
      const response = await serviceApi.queryAuthorServices(option)
      this.authorServiceData.loading = false
      if (response.success) {
        const data = response.data || {}
        const originList = this.authorServiceData.list || []
        const newList = data.dataSet || []
        const list = option.pageIndex > 1 ? [...originList, ...newList] : newList
        const total = data.totalQuantity || 0
        const end = Math.ceil(total / option.pageSize) <= option.pageIndex
        this.authorServiceData = {
          list,
          total,
          end,
          loading: false,
          terms: option,
        }
      }
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000', msg: '' } }
    }
  }

  // 获取主页作者喜欢
  @action.bound
  async fetchGetClientAuthorFavor(option) {
    try {
      const result = await authorApi.getClientAuthorFavor(option)

      runInAction(() => {
        if (result.success) {
          switch (option.type) {
            case CompositionType.COMPOSITION:
              this.favorsData = {
                ...toJS(this.favorsData),
                list: result.data,
                count: result.data.length,
                isLastPage: Math.ceil(result.data[`total_count`] / this.favorsParam.size) <= this.favorsParam.page
              }

              break
            case CompositionType.ARTICLE:
              this.favorsArticleData = {
                ...toJS(this.favorsArticleData),
                list: result.data,
                count: result.data.length,
                isLastPage: Math.ceil(result.data[`total_count`] / this.favorsArticleParam.size) <= this.favorsArticleParam.page
              }

              break
          }
        } else {
          message.error(result.data.msg)
        }
      })
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 获取主页个人/机构的关于信息
  @action.bound
  async fetchGetAuthorAbout(option) {
    try {
      const result = await authorApi.getAuthorAbout(option)

      if (option.host) {
        return new Promise((resolve, reject) => {
          if (result.success) {
            this.changeAboutData({
              ...result.data,
              ssr: true,
              state: true
            })

            resolve(this.aboutData)
          } else {
            // console.log(result)
            reject(result.data.msg)
          }
        })
      } else {
        if (result.success) {
          this.changeAboutData({
            ...result.data,
            ssr: false,
            state: true
          })
        } else {
          message.error(result.data.msg)
        }
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 获取主页关注创作者信息
  @action.bound
  async fetchGetClientAuthorFollow(option) {
    try {
      const result = await authorApi.getClientAuthorFollow(option)

      runInAction(() => {
        if (result.success) {
          this.followData = {
            ...toJS(this.followData),
            list: result.data.data,
            count: result.data.data.length,
            isLastPage: Math.ceil(result.data[`total_count`] / this.favorsParam.size) <= this.favorsParam.page
          }
        } else {
          message.error(result.data.msg)
        }
      })
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 主页创作者粉丝信息
  @action.bound
  async fetchGetClientAuthorFans(option) {
    try {
      const result = await authorApi.getClientAuthorFans(option)

      runInAction(() => {
        if (result.success) {
          this.fansData = {
            ...toJS(this.fansData),
            list: result.data.data,
            count: result.data.data.length,
            isLastPage: Math.ceil(result.data[`total_count`] / this.fansParam.size) <= this.fansParam.page
          }
        } else {
          message.error(result.data.msg)
        }
      })
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 获取主页作者喜欢数
  @action.bound
  async fetchGetAuthorFavorCount(option) {
    try {
      const result = await authorApi.getAuthorFavorCount(option)

      if (option.host) {
        return new Promise((resolve, reject) => {
          if (result.success) {
            this.changeFavorsData({
              ...result.data,
              ssr: true
            })

            resolve(this.favorsData)
          } else {
            reject(result.data.msg)
          }
        })
      } else {
        this.changeFavorsData({
          ...result.data,
          ssr: false
        })
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 关注主页侧边作者
  @action.bound
  async fetchSideActionFollow(option) {
    try {
      if (!token) {
        window.location.href = `/signin?c=${window.location.pathname}`
        return
      }

      const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
      const param = { ...option, client_code }
      const result = await authorApi.actionFollow(param)

      if (result.success) {
        message.destroy()

        if (Number(option.action) === ActionType.FOCUS) {
          message.success(`已关注作者`)
        } else {
          message.success(`已取消关注`)
        }

        this.changeBriefInfo({
          ...toJS(this.briefInfo),
          followed: Boolean(option.action)
        })
      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 关注关于作者
  @action.bound
  async fetchInsAboutActionFollow(option) {
    try {
      const result = await authorApi.actionFollow(option)

      if (result.success) {
        message.destroy()
        if (Number(option.action) === 0) {
          message.success(`已取消关注`)
        } else {
          message.success(`已关注作者`)
        }

        const members = this.aboutData && this.aboutData.members.map(l => {
          if (l.id === option.id) {
            l.followed = option.action
          }

          return l
        })

        this.changeAboutData({
          ...toJS(this.aboutData),
          members
        })
      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 关注作者
  @action.bound
  async fetchActionFollow(option) {
    try {
      const result = await authorApi.actionFollow(option)

      if (result.success) {
        message.destroy()

        const list = [...this.authorRecommendeds]

        list.map(item => {
          if (item.id === option.id) {
            item.followed = !!option.action
            // console.log(!!option.action, toJS(item))
          }
          return item
        })

        this.authorRecommendeds = list

        if (Number(option.action) === 0) {
          message.success(`已取消关注`)
        } else {
          message.success(`已关注作者`)
        }
      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 关注作者
  @action.bound
  async fetchAuthorActionFollow(option) {
    try {
      if (!token) {
        message.warning(`请登录后查看`)

        setTimeout(() => {
          window.location.href = `/signin?c=${encodeURIComponent(window.location.pathname)}`
        }, 500)

        return
      }

      const result = await authorApi.actionFollow(option)

      if (result.success) {
        message.destroy()

        if (Number(option.action) === 0) {
          message.success(`已取消关注`)
        } else {
          message.success(`已关注作者`)
        }

        const list = this.authorListData && this.authorListData.list

        list.map(item => {
          if (item.id === option.id) {
            item.followed = !item.followed
          }
        })

        this.authorListData = {
          ...toJS(this.authorListData),
          list
        }
      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 关注个人关注作者
  @action.bound
  async fetchAboutActionFollow(option) {
    try {
      const result = await authorApi.actionFollow(option)

      if (result.success) {
        message.destroy()

        if (Number(option.action) === 0) {
          message.success(`已取消关注`)
        } else {
          message.success(`已关注作者`)
        }

        const org = this.aboutData && this.aboutData.org.map(l => {
          if (l.id === option.id) {
            l.followed = Boolean(option.action)
          }

          return l
        })

        this.changeAboutData({
          ...toJS(this.aboutData),
          org
        })

      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 作品喜欢功能 
  @action.bound
  async fetchActionFavor(option) {
    try {
      if (!token && !option.action) {
        message.destroy()
        message.error(`您已经喜欢过该作品`)

        return
      }
      const param = { token, ...option, type: FavorTypes.SHOTS }
      const result = await authorApi.actionFavor(param)

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

  // 收藏作品
  @action.bound
  async fetchActionCollection(option) {
    try {
      const result = await authorApi.actionCollection(option)

      runInAction(() => {
        if (result.success) {
          message.destroy()
          message.success(`收藏成功`)
        } else {
          message.error(result.data.msg)
        }
      })
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 获取文件夹列表
  @action.bound
  async fetchGetCollectionList(option) {
    try {
      const result = await authorApi.getCollectionList(option)

      runInAction(() => {
        if (result.success) {
          this.collectionList = result.data
        } else {
          message.error(result.data.msg)
        }
      })
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 新增文件夹
  @action.bound
  async fetchGetCollectionAdd(option) {
    try {
      const result = await authorApi.getCollectionAdd(option)

      runInAction(() => {
        if (result.success) {
          message.destroy()
          message.success(`新增文件夹成功`)
        } else {
          message.error(result.data.msg)
        }
      })
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 获取创作者主页基本信息
  @action.bound
  async fetchGetAuthorCommon(option) {
    try {
      const result = await authorApi.getAuthorCommon(option)
      if (result.success) {
        this.changeBriefInfo(result.data)
      } else {
        this.changeBriefInfo({})
      }
      return result
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 获取作者推荐
  @action.bound
  async fetchAuthorRecommended(option) {
    try {
      const param = { token, ...option }
      const result = await authorApi.getAuthorRecommended(param)

      if (option.host) {
        return new Promise((resolve, reject) => {
          if (result.success) {
            // this.authorRecommendeds = result.data
            this.setAuthorRecommendeds(result.data)
            resolve(result.data)
          } else {
            reject(result.data.msg)
          }
        })
      } else {
        if (result.success) {
          this.setAuthorRecommendeds(result.data)
          // this.authorRecommendeds = result.data
        }
      }

    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 获取不同分类的作者
  @action.bound
  async fetchGetClassComposition(option) {
    try {
      const result = await authorApi.getClassComposition(option)
      if (result.success) {
        this.classificationsData = {
          ...toJS(this.classificationsData),
          list: result.data.data || [],
          count: result.data.total_count,
        }
      }
      return result
    } catch (err) {
      return { success: false, data: { code: 'E00001', msg: '网络错误' } }
    }
  }

  // 关注特邀作者
  @action.bound
  async fetchSpecialActionFollow(option) {
    try {
      const result = await authorApi.actionFollow(option)

      if (result.success) {
        if (Number(option.action) === ActionType.FOCUS) {
          message.success(`已关注作者`)
        } else {
          message.success(`已取消关注`)
        }

        const list = this.classificationsData && this.classificationsData.list

        list.map(item => {
          if (item.id === option.id) {
            item.followed = !item.followed
          }
        })

        this.classificationsData = {
          ...toJS(this.classificationsData),
          list
        }
      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  @action.bound
  async fetchSpecialFollowBetch(option, cb) {
    try {
      const result = await authorApi.actionFollow(option)
      if (result.success) {
        message.destroy()
        if (Number(option.action) === ActionType.FOCUS) {
          message.success(`一键关注成功`)
        } else {
          message.success(`已取消关注`)
        }

        const originList = this.classificationsData && this.classificationsData.list
        const idsArr = option.id.split(',')
        const list = originList.map(item => {
          if (idsArr.includes(String(item.id))) {
            item.followed = !!option.action
          }
          return item
        })

        this.classificationsData = {
          ...toJS(this.classificationsData),
          list
        }
      } else {
        message.error(result.data.msg)
      }

      if (cb) cb(result)
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  @action.bound
  async fetchAuthorPopup(option) {
    try {
      const response = await authorApi.queryAuthorPopup(option)
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  @action.bound
  async fetchFollow(option) {
    try {
      const response = await authorApi.actionFollow(option)
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  @action.bound
  async modifyAuthorBanner({ type, isDefault, ...option }, callback) {
    try {
      const response = await authorApi.setAuthorBanner(option)
      if (response.success) {
        if (isDefault) {
          this.briefInfo = {
            ...toJS(this.briefInfo),
            banner: option.banner,
          }
        }
      }
      if (callback) callback(response)
      return response
    } catch (error) {
      return { success: false, data: { code: 'E100000' } }
    }
  }
}

export default new AuthorStore()