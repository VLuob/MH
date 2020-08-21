import { observable, action, runInAction } from 'mobx'
import basic from '@base/system/basic'
import { FavorTypes, ActionType, CompositionTypes } from '@base/enums'
import { homeApi, brandApi, authorApi, compositionApi } from '@api'
import jsCookie from 'js-cookie'
import { message } from 'antd'
import { config } from '@utils'

import { toJS } from 'mobx'

const token = basic.token

export class BrandStore {
    @observable batch: string
    @observable brandClientDetail
    @observable brandOwner
    @observable brandListData: object
    @observable resetBrandListData: object
    @observable brandArtiListData: object
    @observable resetBrandArtiListData: object

    constructor(initialData = {}) {
        this.batch = initialData.batch || ''
        this.brandClientDetail = initialData.brandClientDetail || {}
        this.brandOwner = initialData.brandOwner || {}
        this.brandListData = initialData.brandListData || {
            ssr: true,
            list: [],
            count: 0,
            isLastPage: true,
            state: false,
            terms: {
                term: {
                    type: CompositionTypes.SHOTS
                },
                sort: [{
                    key: 'gmtPublish',
                    value: 'desc'
                }],
                recommended: false,
                page: 1,
                limit: 50,
            }
        }
        this.resetBrandListData = initialData.resetBrandListData || {
            ssr: false,
            list: [],
            count: 0,
            isLastPage: true,
            state: false,
            terms: {
                term: {
                    type: CompositionTypes.SHOTS,
                },
                sort: [{
                    key: 'gmtPublish',
                    value: 'desc'
                }],
                recommended: false,
                page: 1,
                limit: 50,
            }
        }
        this.brandArtiListData = initialData.brandArtiListData || {
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
                limit: 10,
            }
        }
        this.resetBrandArtiListData = initialData.resetBrandArtiListData || {
            ssr: false,
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
                limit: 10,
            }
        }
    }

    @action.bound
    updateBatch(data) {
        this.batch = data
    }

    @action.bound
    updateBrandListTerms(terms) {
        this.brandListData = {
            ...toJS(this.brandListData),
            terms: {
                ...toJS(this.brandListData.terms),
                ...terms,
                term: {
                    ...toJS(this.brandListData.terms.term), 
                    ...terms.term
                }
            }
        }
    }

    @action.bound
    updateBrandArtiListTerms(terms) {
        this.brandArtiListData = {
            ...toJS(this.brandArtiListData),
            terms: {
                ...toJS(this.brandArtiListData.terms),
                ...terms,
                term: {
                    ...toJS(this.brandArtiListData.terms.term),
                    ...terms.term
                }
            }
        }
    }

    // TODO:显示品牌页面
    @action.bound
    updateBrandDetail(data) {
        this.brandClientDetail = data
    }

    @action.bound
    updateBrandOwner(data) {
        this.brandOwner = data;
    }

    @action.bound
    changeBrandOwnerFollow(action) {
        const brandOwner = this.brandOwner
        const author = brandOwner.author || {}
        this.brandOwner = {
            ...brandOwner,
            author: {
                ...author,
                followed: !!action
            }
        }
    }

    @action.bound
    changeFavor(data) {
        const list = this.brandListData.list.map(l => {
            if(l.compositionId === data.id) {
                l.favored = Boolean(data.action)

                if(Boolean(data.action)) {
                    l.favors += 1
                } else {
                    l.favors -= 1
                }
            }

            return l
        })

        this.brandListData = {
            ...toJS(this.brandListData),
            ssr: false,
            state: true,
            list
        }
    }

    @action.bound
    updateBrandListData(data) {
        this.brandListData = data || {
            ssr: false,
            list: [],
            count: 0,
            isLastPage: true,
            state: false,
            terms: {
                term: {
                    type: CompositionTypes.SHOTS
                },
                recommended: true,
                page: 1,
                limit: 50,
            }
        }
    }

    @action.bound
    updateBrandArtiListData(data) {
        this.brandArtiListData = data || {
            ssr: false,
            list: [],
            count: 0,
            isLastPage: true,
            state: false,
            terms: {
                term: {
                    type: CompositionTypes.ARTICLE
                },
                recommended: true,
                page: 1,
                limit: 10,
            }
        }
    }

    @action.bound
    changeBrandListData(data) {
        let brandData = this.brandListData

        switch(data.term.type) {
            case CompositionTypes.SHOTS:
                brandData = this.brandListData

                break
            case CompositionTypes.ARTICLE:
                brandData = this.brandArtiListData

                break
        }

        if(brandData.terms && !data.host && brandData.terms.page <= 2) {
            this.updateBatch(data.batch)
            brandData && brandData.terms && delete brandData.terms.batch
        }

        let resultData = {
            ...toJS(brandData),
            list: data.page > 1 ? [...toJS(brandData.list), ...data.list] : data.list,
            count: data.total || 0,
            isLastPage: brandData.terms && Math.ceil(data.total / brandData.terms.limit) <= brandData.terms.page,
            terms: {
                ...toJS(brandData.terms),
                page: data.page + 1,
                limit: data.limit || 15
            },
            ssr: data.ssr,
            state: data.state
        }

        //TODO: 完成文章部分 
        switch(data.term.type) {
            case CompositionTypes.SHOTS:
                this.brandListData = resultData

                break
            case CompositionTypes.ARTICLE:
                this.brandArtiListData = resultData

                break
        }
    }

    // 品牌作品列表
    @action.bound
    async fetchGetBrandShotsList(option) {
        switch(option.terms.term.type) {
            case CompositionTypes.SHOTS:
                if(option.terms.page <= 1 && !option.host) {
                    this.brandListData.state = false
                    this.brandArtiListData.state = false
                }

                break
            case CompositionTypes.ARTICLE:
                if(option.terms.page <= 1 && !option.host) {
                    this.brandListData.state = false
                    this.brandArtiListData.state = false
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
                        this.changeBrandListData({
                            ...option.terms,
                            ...result.data,
                            host: option.host,
                            ssr: false,
                            state: true
                        })

                        switch(option.terms.term.type) {
                            case CompositionTypes.SHOTS:
                                resolve(this.brandListData)

                                break
                            case CompositionTypes.ARTICLE:
                                resolve(this.brandArtiListData)

                                break
                        }
                        
                    } else {
                        switch(option.terms.term.type) {
                            case CompositionTypes.SHOTS:
                                this.brandListData.state = false
                                this.brandArtiListData.state = false

                                break
                            case CompositionTypes.ARTICLE:
                                this.brandArtiListData.state = false
                                this.brandListData.state = false

                                break
                        }

                        // reject(result.data.msg)
                        resolve(result.data)
                    }
                })
            } else {
                if(result.success) {
                    setTimeout(() => {
                        this.changeBrandListData({
                            ...option.terms,
                            ...result.data,
                            ssr: false,
                            state: true
                        })
                    }, 100)
                } else {
                    this.brandListData.state = false
                    message.error(result.data.msg)
                }
            }
        } catch(err) {
            // console.log(err)
        }
    }

    // 品牌详情
    @action.bound
    async fetchBrandDetail(option) {
        try {
            const result = await brandApi.brandDetail(option)
            if(option.host) {
                return new Promise((resolve, reject) => {
                    if(result.success) {
                        this.brandClientDetail = result.data
                        resolve(result.data)
                    } else {
                        resolve(result.data)
                    }
                })
            } else {
                if(result.success) {
                    this.brandClientDetail = result.data
                } else {
                    message.error(result.data.msg)
                }
            }
        } catch(err) {
            // console.log(err)
        }
    }

    // 主品牌详情
    @action.bound
    async fetchBrandOwner(option) {
        try {
            const result = await brandApi.queryBrandOwner(option)
    
            if(option.host) {
                return new Promise((resolve, reject) => {
                    if(result.success) {
                        // this.brandOwner = result.data
                        this.updateBrandOwner(result.data)
                        resolve(this.brandOwner)
                    } else {
                        reject(result.data.msg)
                    }
                })
            } else {
                if(result.success) {
                    this.brandOwner = result.data
                } else {
                    message.error(result.data.msg)
                }
            }
        } catch (err) {
            // console.log(err)
        }
    }

    // 品牌关注
    @action.bound
    async fetchBrandFollow(option) {
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
                    message.success(`已关注品牌`)
                } else {
                    message.success(`已取消关注`)
                }

                this.brandClientDetail.followed = !!option.action
            } else {
                message.error(result.data.msg)
            }
        } catch (err) {
            // console.log(err)
        }
    }

    // 首页喜欢功能
    @action.bound
    async fetchActionFavor(option) {
        try {
            if(!token && !option.action) {
                message.destroy()
                message.error(`您已经喜欢过该作品`)

                return 
            }
            const param = { ...option, type: FavorTypes.SHOTS }
            const result = await homeApi.actionFavor(param)

            if(result.success) {
                this.changeFavor(option)

                if(option.action) {
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

      // 关注侧边作者
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
                this.changeBrandOwnerFollow(option.action)
            } else {
                message.error(response.data.msg)
            }
        } catch(err) {
            console.log(err)
        }
    }
}

export default new BrandStore()