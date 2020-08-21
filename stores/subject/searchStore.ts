import { observable, action, runInAction } from 'mobx'
import basic from '@base/system/basic'
import { message } from 'antd'
import { homeApi, authorApi, searchApi } from '@api'
import { SearchType, FavorTypes } from '@base/enums'
import { toJS } from 'mobx'

const token = basic.token

const defaultValues = {
  searchUi: {
    // 是否展开
    spread: false,
  },
  articleHomeAdList: [],
  searchHotList: [],
  searchSimilarWords: [],
  searchFilterData: {
    shots: {
      category: [],
      form: [],
      count: 0
    },
    article: {
      classify: [],
      count: 0
    },
    author: {
      list: [],
      count: 0,
      orgCount: 0,
      personCount: 0
    },
    enquiry: {
      count: 0,
    },
    service: {
      count: 0,
    },
    brand: {
      // list: [],
      count: 0,
    },
    tag: {
      // list: [],
      count: 0,
    },
    topic: {
      count: 0,
    }
  },
  resetResultTerms: {
    recommended: false,
    term: {},
    sort: [{
      // key: 'gmtPublish',
      // value: 'desc',
      key: 'match',
      value: 'asc',
    }],
    page: 1,
    limit: 12,
  },
  searchResultTerms: {
    recommended: false,
    term: {},
    sort: [{
      // key: 'gmtPublish', 
      // value: 'desc',
      key: 'match',
      value: 'asc',
    }],
    page: 1,
    limit: 12,
  },
  searchResultData: {
    list: [],
    type: SearchType.SHOTS,
    count: 0,
    state: false,
    isLastPage: false
  },
  searchClientFilterData: {},
  clientKeywords: '',
  searchPopup: {
    isLoading: false,
    total_quantity: 0,
    article_quantity: 0,
    work_quantity: 0,
    article_list: [],
    work_list: [],
  },
}

export class SearchStore {
  // 头部搜索UI
  @observable searchUi: object = defaultValues.searchUi
  @observable articleHomeAdList = defaultValues.articleHomeAdList
  @observable searchHotList = defaultValues.searchHotList
  @observable searchSimilarWords = defaultValues.searchSimilarWords
  @observable searchFilterData = defaultValues.searchFilterData
  @observable resetResultTerms = defaultValues.resetResultTerms
  @observable searchResultTerms = defaultValues.searchResultTerms
  @observable searchResultData = defaultValues.searchResultData
  @observable searchClientFilterData: object = defaultValues.searchClientFilterData
  @observable clientKeywords: string = defaultValues.clientKeywords
  @observable searchPopup: object = defaultValues.searchPopup

  constructor(initialData = {}) {
    this.searchUi = initialData.searchUi || defaultValues.searchUi
    this.articleHomeAdList = initialData.articleHomeAdList || defaultValues.articleHomeAdList
    this.searchHotList = initialData.searchHotList || defaultValues.searchHotList
    this.searchSimilarWords = initialData.searchSimilarWords || defaultValues.searchSimilarWords
    this.searchFilterData = initialData.searchFilterData || defaultValues.searchFilterData
    this.resetResultTerms = initialData.resetResultTerms || defaultValues.resetResultTerms
    this.searchResultTerms = initialData.searchResultTerms || defaultValues.searchResultTerms
    this.searchResultData = initialData.searchResultData || defaultValues.searchResultData
    this.searchClientFilterData = initialData.searchClientFilterData || defaultValues.searchClientFilterData
    this.clientKeywords = initialData.clientKeywords || defaultValues.clientKeywords
    this.searchPopup = initialData.searchPopup || defaultValues.searchPopup
  }

  @action.bound
  updateSearchUi(option) {
    this.searchUi = {
      ...toJS(this.searchUi),
      ...option,
    }
  }

  @action.bound
  updateKeywords(data) {
    this.clientKeywords = data
  }

  @action.bound
  updateFilterData(data) {
    this.searchClientFilterData = data
  }

  @action.bound
  changeFavor(data) {
    const list = this.searchResultData.list.map(l => {
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

    this.searchResultData = {
      ...toJS(this.searchResultData),
      // ssr: false,
      state: true,
      list
    }
  }

  @action.bound
  resetSearchResultTerms() {
    this.searchResultTerms = this.resetResultTerms
  }

  @action.bound
  updateSearchResultTerms(data) {
    this.searchResultTerms = data
  }

  @action.bound
  changeSearchResultTerms(data) {
    this.searchResultTerms = {
      ...toJS(this.searchResultTerms),
      ...data,
      term: {
        ...toJS(this.searchResultTerms.term),
        ...data.term
      }
    }
  }

  @action.bound
  changeSearchFilterData(data) {
    // const authorAllCount = data.author ? (data.author.org + data.author.personal + data.author.server + data.author.edit) : 0

    this.searchFilterData = {
      shots: {
        category: [{
          id: `0`,
          name: `全部`
        }, ...data.works.category],
        form: [{
          id: `0`,
          name: `全部`
        }, ...data.works.form],
        count: data.works_quantity
      },
      article: {
        classify: [{
          id: `0`,
          name: `全部`
        }, ...data.article],
        count: data.article_quantity,
      },
      author: {
        list: [{
          id: `0`,
          code: '0',
          name: `全部 ${data.author_quantity}`
        }, {
          id: `1`,
          code: '1',
          name: `个人 ${data.author.personal}`
        }, {
          id: `2`,
          code: '2',
          name: `品牌主 ${data.author.org}`
        }, {
          id: `3`,
          code: '3',
          name: `服务商 ${data.author.server}`
        }, {
          id: `4`,
          code: '4',
          name: `编辑 ${data.author.edit}`
        }],
        count: data.author_quantity,
        orgCount: data.author.org,
        personCount: data.author.personal
      },
      enquiry: {
        count: data.enquiryQuantity,
      },
      service: {
        count: data.serviceQuantity,
      },
      brand: {
        count: data.brands_quantity
      },
      tag: {
        count: data.tags_quantity
      },
      topic: {
        count: data.feature_quantity,
      }
    }
  }

  @action.bound
  changeSearchResultData(option, data) {
    const count = data ? (data.totalQuantity || data.total || data.total_count || 0) : 0
    let list = data.dataSet || data.list || data.data

    list = Array.isArray(list) ? list : []

    if (Number(option.search_type) !== SearchType.AUTHOR) {
      this.searchResultData = {
        ...toJS(this.searchResultData),
        list: option.terms.page > 1 ? [...toJS(this.searchResultData.list), ...list] : (list || []),
        count: count,
        state: true,
        type: Number(option.search_type),
        isLastPage: Math.ceil(count / this.searchResultTerms.limit) <= option.terms.page
      }
    } else {
      list = data.data ? data.data : []

      this.searchResultData = {
        ...toJS(this.searchResultData),
        list: option.terms.page > 1 ? [...toJS(this.searchResultData.list), ...list] : (list || []),
        count: count,
        state: true,
        type: Number(option.search_type),
        isLastPage: Math.ceil(count / this.searchResultTerms.limit) <= option.terms.page
      }
    }
  }

  @action.bound
  setSearchHotList(data) {
    this.searchHotList = data || []
  }

  @action.bound
  setSimilarWords(data) {
    this.searchSimilarWords = data || []
  }

  @action.bound
  resetSearchPopup() {
    this.searchPopup = {
      isLoading: false,
      total_quantity: 0,
      article_quantity: 0,
      work_quantity: 0,
      article_list: [],
      work_list: [],
    }
  }

  // server api
  // 首页添加搜索记录
  // @action.bound
  // async fetchSearchAdd(option) {
  //     try {

  //     } catch (err) {
  //         console.log(err)
  //     }
  // }

  // 首页添加搜索记录
  @action.bound
  async fetchSearchHot(option) {
    try {
      const result = await searchApi.getSearchHot(option)

      if (option.host) {
        return new Promise((resolve, reject) => {
          if (result.success) {
            this.setSearchHotList(result.data)
            resolve(result.data)
          } else {
            reject(result.data.msg)
          }
        })
      } else {
        if (result.success) {
          this.setSearchHotList(result.data)
        } else {
          message.destroy()
          message.error(result.data.msg)
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  @action.bound
  async fetchSimilarWords(option) {
    try {
      const result = await searchApi.querySimilarWords(option)
      if (option.host) {
        return new Promise((resolve, reject) => {
          if (result.success) {
            this.setSimilarWords(result.data)
            resolve(result.data)
          } else {
            reject(result.data.msg)
          }
        })
      } else {
        if (result.success) {
          this.setSimilarWords(result.data)
        } else {
          message.destroy()
          message.error(result.data.msg)
        }
      }
    } catch (error) {

    }
  }

  // 搜索过滤条件（作品、文章、创作者对应类型的数量）
  @action.bound
  async fetchGetSearchFilter(option) {
    try {
      const result = await searchApi.getSearchFilter(option)
      if (result.success) {
        this.changeSearchFilterData(result.data)
      }
      return {
        ...result,
        filterData: this.searchFilterData,
      }
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 获取搜索结果
  @action.bound
  async fetchGetSearchContent(option) {
    if (option.terms.page <= 1) {
      this.searchResultData.state = false
    }

    try {
      let result
      let newTerms = { ...option.terms }
      let options = { ...option }

      if (options.search_type === SearchType.AUTHOR) {
        Number(options.author_type) === 0 && delete options.author_type
      }

      let params = { ...options, terms: JSON.stringify(newTerms) }

      if (token) {
        params = { ...params, token }
      }


      result = await searchApi.getSearchContent(params)

      if (options.host) {
        return new Promise((resolve, reject) => {
          if (result.success) {
            this.updateSearchResultTerms(options.terms)
            this.changeSearchResultData(options, result.data)
            resolve(result.data)
          } else {
            reject(result.data.msg)
          }
        })
      } else {
        if (result.success) {
          this.searchResultData.state = true
          this.updateSearchResultTerms(options.terms)
          this.changeSearchResultData(options, result.data)
        } else {
          this.searchResultData.state = false
          message.destroy()
          message.error(result.data.msg)
        }
      }
    } catch (err) {
      this.searchResultData.state = false
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 搜索喜欢功能
  @action.bound
  async fetchSearchFavor(option) {
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
      console.log(err)
    }
  }

  // 搜索关注功能
  @action.bound
  async fetchSearchAuthorFollow(option) {
    try {
      if (!token) {
        message.warning(`请登录后查看`)

        setTimeout(() => {
          window.location.href = `/signin?c=${encodeURIComponent(window.location.pathname)}`
        }, 500)

        return
      }

      const result = await authorApi.actionFollow(option)

      message.destroy()
      if (result.success) {

        if (Number(option.action) === 0) {
          message.success(`已取消关注`)
        } else {
          message.success(`已关注作者`)
        }

        const list = this.searchResultData && this.searchResultData.list

        list.map(item => {
          if (item.id === option.id) {
            item.followed = !item.followed
          }
        })

        this.searchResultData = {
          ...toJS(this.searchResultData),
          list
        }
      } else {
        message.error(result.data.msg)
      }
    } catch (err) {
      console.log(err)
    }
  }

  @action.bound
  async fetchSearchPopup(option) {
    this.searchPopup.isLoading = true
    const response = await searchApi.querySearchPopup(option)
    this.searchPopup.isLoading = false
    if (response.success) {
      this.searchPopup = {
        ...toJS(this.searchPopup),
        ...response.data,
      }
    }
  }
}

export default new SearchStore()