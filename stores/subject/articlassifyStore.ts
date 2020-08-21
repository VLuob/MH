import { observable, action, runInAction } from 'mobx'
import basic from '@base/system/basic'
import { ActionType, CompositionTypes } from '@base/enums'
import { articlassifyApi, authorApi, compositionApi } from '@api'
import jsCookie from 'js-cookie'
import { message } from 'antd'
import { config } from '@utils'

import { toJS } from 'mobx'

const token = basic.token

export class ArticlassifyStore {
    @observable batch: string
    @observable articlassifyClientDetail: object
    @observable classifyListData: object 
    @observable articlassifyListData: object

    constructor(initialData = {}) {
        this.batch = initialData.batch || ''
        this.articlassifyClientDetail = initialData.articlassifyClientDetail || {}
        this.classifyListData = initialData.classifyListData || {}
        this.articlassifyListData = initialData.articlassifyListData || {
            ssr: true,
            list: [],
            count: 0,
            isLastPage: true,
            state: false,
            terms: {
                term: {
                    type: CompositionTypes.ARTICLE
                },
                sort: [{
                    key: 'gmtPublish',
                    value: 'desc'
                }],
                recommended: false,
                page: 1,
                limit: 15,
            }
        }
    }

    // TODO:显示品牌页面
    @action.bound
    updateArticlassifyDetail(data) {
        this.articlassifyClientDetail = data
    }

    @action.bound
    updateBrandArtiListTerms(terms) {
        this.articlassifyListData = {
            ...toJS(this.articlassifyListData),
            terms: {
                ...toJS(this.articlassifyListData.terms),
                ...terms,
                term: {
                    ...toJS(this.articlassifyListData.terms.term),
                    ...terms.term
                }
            }
        }
    }

    @action.bound
    updateBatch(data) {
        this.batch = data
    }

    @action.bound
    updateArticlassifyData(data) {
        this.articlassifyListData = data || {
            ssr: true,
            list: [],
            count: 0,
            isLastPage: true,
            state: false,
            terms: {
                term: {
                    type: CompositionTypes.ARTICLE
                },
                sort: [{
                    key: 'gmtPublish',
                    value: 'desc'
                }],
                recommended: false,
                page: 1,
                limit: 15,
            }
        }
    }

    // 修改分类数据
    @action.bound
    changeArticlassifyData(data) {
        let classifyData = this.classifyListData

        switch(data.term.type) {
            case CompositionTypes.SHOTS:
                classifyData = this.classifyListData

                break
            case CompositionTypes.ARTICLE:
                classifyData = this.articlassifyListData

                break
        }

        if(classifyData.terms && !data.host && classifyData.terms.page <= 2) {
            this.updateBatch(data.batch)
            classifyData && classifyData.terms && delete classifyData.terms.batch
        }

        let resultData = {
            ...toJS(classifyData),
            list: data.page > 1 ? [...toJS(classifyData.list), ...data.list] : data.list,
            count: data.total || 0,
            isLastPage: classifyData.terms && Math.ceil(data.total / classifyData.terms.limit) <= classifyData.terms.page,
            terms: {
                ...toJS(classifyData.terms),
                page: data.page + 1,
                limit: data.limit || 15
            },
            ssr: data.ssr,
            state: data.state
        }

        //TODO: 完成文章部分 
        switch(data.term.type) {
            case CompositionTypes.SHOTS:
                this.classifyListData = resultData

                break
            case CompositionTypes.ARTICLE:
                this.articlassifyListData = resultData

                break
        }
    }
    
    // 分类详情
    @action.bound
    async fetchArticlassifyDetail(option) {
        try {
            const result = await articlassifyApi.classifyDetail(option)
            
            if(option.host) {
                return new Promise((resolve, reject) => {
                    if(result.success) {
                        this.articlassifyClientDetail = result.data

                        resolve(result.data)
                    } else {
                        reject(result.data)
                    }
                })
            } else {
                if(result.success) {
                    this.articlassifyClientDetail = result.data
                } else {
                    message.error(result.data.msg)
                }
            }
        } catch(err) {
            // console.log(err)
        }
    }

    // 分类关注
    @action.bound
    async fetchArticlassifyFollow(option) {
        try {
            if(!token) {
                window.location.href = `/signin?c=${window.location.pathname}`

                return
            }

            const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
            const params = { ...option, token, client_code }
            const result = await authorApi.actionFollow(params)

            if(result.success) {
                message.destroy()

                if(Number(option.action) === ActionType.FOCUS) {
                    message.success(`已关注该文章分类`)
                } else {
                    message.success(`已取消关注`)
                }

                this.articlassifyClientDetail.followed = !!option.action
            } else {
                message.destroy()
                message.error(result.data.msg)
            }
        } catch (err) {
            // console.log(err)
        }
    }

    // 品牌作品列表
    @action.bound
    async fetchGetArticlassifyList(option) {
        switch(option.terms.term.type) {
            case CompositionTypes.SHOTS:
                if(option.terms.page <= 1 && !option.host) {
                    this.classifyListData.state = false
                }

                break
            case CompositionTypes.ARTICLE:
                if(option.terms.page <= 1 && !option.host) {
                    this.articlassifyListData.state = false
                }

                break
        }

        try {
            let result

            if(option.terms.page <= 1 && option.terms.batch) {
                delete option.terms.batch
            }

            let params = { ...option, terms: JSON.stringify(option.terms) }

            if(!option.host) {
                const client = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)

                params = { ...params, client }

                if(token) {
                    params = { ...params, token }
                }
            }

            if(token) {
                params = { ...params, token }
            }

            result = await compositionApi.getShotsList(params)
            

            if(option.host) {
                return new Promise((resolve, reject) => {
                    if(result.success) {
                        this.changeArticlassifyData({
                            ...option.terms,
                            ...result.data,
                            ssr: true,
                            host: option.host,
                            state: true
                        })

                        resolve(this.articlassifyListData)
                    } else {
                        switch(option.terms.term.type) {
                            case CompositionTypes.SHOTS:
                                this.classifyListData.state = false

                                break
                            case CompositionTypes.ARTICLE:
                                this.articlassifyListData.state = false

                                break
                        }

                        // reject(result.data.msg)
                        reject(result.data)
                    }
                })
            } else {
                if(result.success) {
                    this.changeArticlassifyData({
                        ...option.terms,
                        ...result.data,
                        ssr: false,
                        state: true
                    })
                } else {
                    this.classifyListData.state = false
                    message.error(result.data.msg)
                }
            }
        } catch(err) {
            // console.log(err)
        }
    }
}

export default new ArticlassifyStore()