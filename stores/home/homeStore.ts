import { observable, action, computed, runInAction } from 'mobx'
import { message } from 'antd'
import jsCookie from 'js-cookie'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import basic from '@base/system/basic'
import { composition as compositionSys } from '@base/system'
import { homeApi, authorApi, compositionApi } from '@api'
import { FavorTypes } from '@base/enums'
import { toJS } from 'mobx'
import { config } from '@utils'


const token = basic.token

export class HomeStore {
    @observable sponsor: Array<any>
    @observable number: number
    @observable batch: string 
    @observable state: string
    @observable shotsData: any
    @observable latestCompositionList: Array<any>
    @observable recommendData: Array<any>
    @observable featureList: Array<any>

    constructor(initialData = {}) {
        this.sponsor = initialData.sponsor || []
        this.number = initialData.number || 1
        this.batch = initialData.batch || ''
        this.state = initialData.state || 'pending'
        this.shotsData = initialData.shotsData || {
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
        this.latestCompositionList = initialData.latestCompositionList || []
        this.recommendData = initialData.recommendData || []
        this.featureList = initialData.featureList || []
    }

    @action.bound
    changeFeatureList(data) {
        this.featureList = data || []
    }

    @action.bound
    updateRecData(data) {
        this.recommendData = data
    }

    @action.bound
    updateBatch(data) {
        this.batch = data
    }

    @action.bound
    changeShotsData(option) {
        delete option.terms

        this.shotsData.terms = {
            ...toJS(this.shotsData.terms),
            ...toJS(option),
            term: {
                ...toJS(this.shotsData.terms.term),
                ...toJS(option.term)
            }
        }
    }

    @action.bound
    updateShotDatas(data) {
        this.shotsData = data
    }

    @action.bound
    changeShotsDatas(data) {
        if(this.shotsData.terms && !data.host && this.shotsData.terms.page <= 2) {
            this.updateBatch(data.batch)
            this.shotsData && this.shotsData.terms && delete this.shotsData.terms.batch
        }

        this.shotsData = {
            ...toJS(this.shotsData),
            list: this.shotsData.terms.page > 1 ? [...toJS(this.shotsData.list), ...data.list] : data.list,
            count: data.total || 0,
            isLastPage: this.shotsData.terms && Math.ceil(data.total / this.shotsData.terms.limit) <= this.shotsData.terms.page,
            terms: {
                ...toJS(this.shotsData.terms),
                page: this.shotsData.terms.page + 1
            },
            // ssr: data.ssr,
            state: data.state
        }

        // TODO: 切换回来的batch修复
        if (this.shotsData.terms && this.shotsData.terms.recommended) {
            this.shotsData.terms.batch = data.batch
        }
        // if(this.shotsData.terms && this.shotsData.terms.recommended && data.batch && data.host) {
        //     this.shotsData && this.shotsData.terms && (this.shotsData.terms.batch = data.batch)
        // } else if(this.shotsData.terms && this.shotsData.terms.recommended && !data.host) {
        //     this.shotsData && this.shotsData.terms && (this.shotsData.terms.batch = this.batch)
        // } 
    }

    @action.bound
    changeFavor(data) {
        const list = this.shotsData.list.map(l => {
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

        this.shotsData = {
            ...toJS(this.shotsData),
            // ssr: false,
            state: true,
            list
        }
    }

    @action.bound
    setActionFollow(option) {
        this.recommendData.map(item => {
            if(item.id === option.id) {
                item.followed = !!option.action
            }
            return item
        })
    }

    @action.bound
    async fetchShotsList({mergeAds, ...option}) {
        if(option.terms.page <= 1 && !option.host) {
            this.shotsData.state = false
        }

        try {
            let result
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

            this.shotsData.terms = option.terms

            if(result.success) {
                const resultData = result.data
                if (mergeAds) {
                    const shotsList = result.data.list || []
                    resultData.list = compositionSys.mergeShotsAndAds({shotsList, adsData: mergeAds})
                }
                this.changeShotsDatas({
                    ...toJS(resultData),
                    ssr: false,
                    state: true
                })
            } else {
                this.shotsData.state = false
            }
            return result
        } catch(err) {
            return {success: false, data: {code: 'E100000'}}
        }
    }

    @action.bound
    async fetchGetClientSponsor(option) {
        try {
            const result = await homeApi.getClientSponsor(option)

            if(result.success) {
                this.sponsor = result.data
            } else {
                message.destroy()
                message.error(result.data.msg)
            }
        } catch (err) {
            return {success: false, data: {code: 'E100000'}}
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
            return {success: false, data: {code: 'E100000'}}
        }
    }

    // 首页获取专题推荐
    @action.bound
    async fetchRecommendTopics(option) {
        try {
            const result = await homeApi.getRecommendTopics(option)
            if (result.success) {
                this.changeFeatureList(result.data)
            } 
            return result.data
        } catch (error) {
            return {success: false, data: {code: 'E100000'}}
        }
    }


    // server api
    // 获取首页广告数据 
    @action.bound
    async fetchGetAdvertisement(option) {
        try {
            const result = await homeApi.getAdvertisement(option)
            return result
        } catch (err) {
            return {success: false, data: {code: 'E100000'}}
        }
    }

    // 获取最新作品
    @action.bound
    async fetchGetLatestCompositions(option) {
        try {
            const result = await homeApi.getLatestCompositions(option)

            if(result.success) {
                return new Promise((resolve, reject) => {
                    if(result.success) {
                        this.latestCompositionList = result.data || []
                        resolve(result.data)
                    } else {
                        reject(result.data.msg)
                    }
                })
            } else {
                message.error(result.data.msg)
            }
        } catch(err) {
            return {success: false, data: {code: 'E100000'}}
        }
    }

    // 首页推荐创作者
    @action.bound
    async fetchGetAuthorRecommended(option) {
        try {
            const result = await homeApi.getAuthorRecommended(option)
            if(result.success) {
                this.updateRecData(result.data || [])
            } 
            return result.data || []
        } catch (err) {
            return {success: false, data: {code: 'E100000'}}
        }
    }

    // 关注侧边栏作者
    @action.bound
    async fetchActionFollow(option) {
        try {
            const result = await authorApi.actionFollow(option)

            if(result.success) {
                message.destroy()

                this.setActionFollow(option)

                if(Number(option.action) === 0) {
                    message.success(`已取消关注`)
                } else {
                    message.success(`已关注作者`)
                }
            } else {
                message.error(result.data.msg)
            }
        } catch (err) {
            runInAction(() => {
                return {success: false, data: {code: 'E100000'}}
            })
        }
    }

    // 首页赞助商
    @action.bound
    async fetchGetSponsor(option) {
        try {
            const result = await homeApi.getSponsor(option)

            if(result.success) {
                return new Promise((resolve, reject) => {
                    if(result.success) {
                        resolve(result.data)
                    } else {
                        reject(result.data.msg)
                    }
                })
            } else {
                message.error(result.data.msg)
            }
        } catch (err) {
            return {success: false, data: {code: 'E100000'}}
        }
    }
}

export default new HomeStore()