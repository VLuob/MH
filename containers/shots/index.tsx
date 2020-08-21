import { Component } from 'react'
import { Row, Col } from 'antd'
import { toJS } from 'mobx'
import dynamic from 'next/dynamic'

import { inject, observer } from 'mobx-react'
import { Router } from '@routes'
import { CompositionTypes, CommonSortType } from '@base/enums' 
// import LoadMore from '@components/common/LoadMore'
import SubTab from '@components/widget/common/SubTab'
import { subTabList } from '@constants/composition/list'
import PartLoading from '@components/features/PartLoading'
import EmptyComponent from '@components/common/EmptyComponent'

import CommonIntro from '@components/common/CommonIntro'
// import ClassifyTab from '@components/common/ClassifyTab'
import ClassifyDropdown from '@components/common/ClassifyDropdown'
import BottomTabBar from '@containers/common/BottomTabBar'
import SubFilterBar from './SubFilterBar'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
    loading: () => <p></p>,
    ssr: false
})

interface Props {

}

interface State {

}

let num = 3
let currentOption = {}
@inject(stores => {
    const { adStore, globalStore, compositionStore, accountStore } = stores.store
    const { currentUser } = accountStore
    const { shotsHomeAds } = adStore
    const { isMobileScreen } = globalStore
    const { changeTerms, updateShotsDatas, fetchActionFavors, classificationsAll, classificationData, fetchGetClientShotsList } = compositionStore

    return {
        currentUser,
        adStore,
        compositionStore,
        shotsHomeAds,
        changeTerms,
        isMobileScreen,
        updateShotsDatas,
        fetchActionFavors,
        classificationData,
        fetchGetClientShotsList,
        classificationsAll,
    }
})
@observer
export default class ShotsListContainer extends Component<Props, State> {

    reqComposition = () => {
        const { classificationData, fetchGetClientShotsList } = this.props
        const param = { ...classificationData.terms, page: classificationData.terms.page + 1 }

        fetchGetClientShotsList({ terms: param })
    }

    // changeRoute(option) {
    //     const originQuery = {...this.props.query}
    //     const routeScopes = ['follow', 'popular', 'like', 'newest', 'read', 'comment', 'collection', 'recommend']
    //     if (routeScopes.some(scope => option[scope] === '')) {
    //         routeScopes.forEach(scope => {
    //             delete originQuery[scope]
    //         })
    //     }
    //     const query = {
    //         ...originQuery,
    //         ...option,
    //     }
    //     let pathArr = []
    //     if (!!query.category) pathArr.push(`category=${query.category}`)
    //     if (!!query.form) pathArr.push(`form=${query.form}`)
    //     if (query.follow === '') {
    //         pathArr.push('follow')
    //     } else if (query.popular === '') {
    //         pathArr.push(`popular`)
    //     } else if (query.like === '') {
    //         pathArr.push(`like`)
    //     } else if (query.newest === '') {
    //         pathArr.push(`newest`)
    //     } else if (query.read === '') {
    //         pathArr.push(`read`)
    //     } else if (query.comment === '') {
    //         pathArr.push(`comment`)
    //     } else if (query.collection === '') {
    //         pathArr.push(`collection`)
    //     } else {
    //         pathArr.push(`recommend`)
    //     }
    //     if (!!query.province) pathArr.push(`province=${query.province}`)
    //     if (!!query.city) pathArr.push(`city=${query.city}`)
    //     Router.pushRoute(`/shots?${pathArr.join('&')}`)
    // }

    changeRoute(option) {
        const originQuery = {...this.props.query}
        const query = {
            ...originQuery,
            ...option,
        }
        const sort = query.sort || CommonSortType.RECOMMEND
        const category = query.category || '0'
        const form = query.form || '0'
        const province = query.province || '0'
        const city = query.city || '0'
        const urlPath = `!${sort}!${category}!${form}!${province}!${city}`
        Router.pushRoute(`/shots${urlPath}`)
    }

    changeCategories = (key, item) => {
        const { classifications, classificationData, fetchGetClientShotsList } = this.props

        const originTerms = classificationData.terms || {}
        const originTerm = originTerms.term || {}
        const param = {
            ...toJS(originTerms),
            term: {
                ...toJS(originTerm),
                categoryCodes: Number(key) === 0 ? undefined : [key],
                // categories: Number(key) === 0 ? undefined : [key],
            },
            page: 1
        }
        
        this.changeRoute({category: key})
        fetchGetClientShotsList({ terms: param, currentOption })

    }

    changeForms = (key, item) => {
        const { classifications, classificationData, fetchGetClientShotsList } = this.props
        const originTerms = classificationData.terms || {}
        const originTerm = originTerms.term || {}
        const param = {
            ...toJS(originTerms),
            term: {
                ...toJS(originTerm),
                formCodes: Number(key) === 0 ? undefined : [key],
                // forms: Number(key) === 0 ? undefined : [key],
            },
            page: 1
        }

        this.changeRoute({form: key})
        fetchGetClientShotsList({ terms: param, currentOption })
    }

    recommendClick = () => {
        const { changeTerms, classificationData, fetchGetClientShotsList, shotsHomeAds } = this.props
        const terms = classificationData.terms

        terms.term && terms.term.follower && delete terms.term.follower
        terms.sort && delete terms.sort

        const param = { ...terms, page: 1, recommended: true, term: { type: CompositionTypes.SHOTS } }

        // 插入广告
        let hasAds = false
        let mergeAds = {}
        const shotsAdFields = ['f_w_s_1','f_w_s_2','f_w_s_3']
        shotsAdFields.forEach(field => {
            if (shotsHomeAds[field]) {
                mergeAds[field] = shotsHomeAds[field]
                hasAds = true
            }
        })

        this.changeRoute({sort: CommonSortType.RECOMMEND})
        changeTerms(param)
        fetchGetClientShotsList({ terms: param, mergeAds: hasAds ? mergeAds : null })
    }

    reqShotsList = (option,routeOption) => {
        const { changeTerms, fetchGetClientShotsList, classificationData } = this.props
        const params = { ...option, page: 1, limit: classificationData.terms.limit, recommended: false }

        currentOption = option

        changeTerms(params)

        this.changeRoute(routeOption)
        fetchGetClientShotsList({ terms: params })
    }

    handleRefresh = () => {
        const { changeTerms, classificationData, fetchGetClientShotsList, shotsHomeAds } = this.props
        const terms = classificationData.terms
        const param = { ...terms, page: 1, }
        const shotsParam: any = { terms: param}

        if (terms.recommended) {
            // 插入广告
            let hasAds = false
            let mergeAds = {}
            const shotsAdFields = ['f_w_s_1','f_w_s_2','f_w_s_3']
            shotsAdFields.forEach(field => {
                if (shotsHomeAds[field]) {
                    mergeAds[field] = shotsHomeAds[field]
                    hasAds = true
                }
            })
            if (hasAds) {
                shotsParam.mergeAds = mergeAds
            }
        }

        changeTerms(param)
        fetchGetClientShotsList(shotsParam)
    }

    handleAdClick = (id) => {
        const { adStore } = this.props
        adStore.actionAdClick({id})
    }

    render() {
        const { currentUser, isMobileScreen, fetchActionFavors, query, classificationsAll, classificationData } = this.props
        const classifications = classificationsAll 
        const { state, isLastPage } = classificationData

        const categories = classifications.categories || []
        const forms = classifications.forms || []

        const shotsList = classificationData.list || []
        const condition = classificationData.terms || {}
        const conditionTerm = condition.term || {}
        const conditionCategories = (conditionTerm.categoryCodes || [])
        const conditionForms = (conditionTerm.formCodes || [])
        // const conditionCategories = (conditionTerm.categories || [])
        // const conditionForms = (conditionTerm.forms || [])
        const gutter = isMobileScreen ? 15 : 30
        const hasShots = shotsList.length > 0

        return (
            <>
            <div className='production-box media-prod-content'>
                {isMobileScreen && <div className='sub-tab-content'>
                    <SubFilterBar 
                        query={query}
                        currentUser={currentUser}
                        categoryId={Number(conditionCategories[0])}
                        formId={Number(conditionForms[0])}
                        categories={categories}
                        forms={forms}
                        onRequestList={this.reqShotsList}
                        onRecommended={this.recommendClick}
                        onCategoryChange={this.changeCategories}
                        onFormChange={this.changeForms}
                    />
                </div>}
                {!isMobileScreen && <div className='classify-content'>
                    <div className="classify-wrapper">
                        <ClassifyDropdown
                            classifyName="品类"
                            currentId={Number(conditionCategories[0])}
                            dataSource={categories}
                            onChange={this.changeCategories}
                        />
                        <ClassifyDropdown
                            classifyName="形式"
                            currentId={Number(conditionForms[0])}
                            dataSource={forms}
                            onChange={this.changeForms}
                        />
                    </div>
                </div>}
                {!isMobileScreen && <div className='sub-tab-content'>
                    <div className='sub-tab-box'> 
                        <Row type='flex' align='middle' justify='center' gutter={24}>
                            <Col span={24}>
                                <SubTab
                                    showRefreshBtn
                                    subTabList={subTabList}
                                    condition={condition}
                                    // originalCondition={originalCondition} 
                                    recommendClick={this.recommendClick}
                                    reqList={this.reqShotsList}
                                    userInfo={currentUser} />
                            </Col>
                        </Row>
                    </div>
                </div>}
                <div className='production-content'>
                    {/* {state ? 
                        <>
                            <Row type='flex' align='middle' justify='center' gutter={24}>
                                <Col span={24}>
                                    <Row type='flex' align='middle' justify='start' gutter={gutter}>
                                        {classificationData.list && classificationData.list.length > 0 ? classificationData.list.map(item => {
                                            return (
                                                <Col key={item.id || item.compositionId}>
                                                    <CommonIntro 
                                                        brand
                                                        item={item} 
                                                        authorDetail
                                                        onFavor={fetchActionFavors}
                                                        onAdClick={this.handleAdClick}
                                                    />
                                                </Col>
                                            )
                                        }) : <EmptyComponent text='暂无相关作品' />}
                                    </Row>
                                </Col>
                            </Row>
                            {!isLastPage && <LoadMore name={`加载更多`} num={num}
                                reqList={this.reqComposition} />}
                        </> : <PartLoading />} */}
                    
                        <>
                            <Row type='flex' align='middle' justify='center' gutter={24}>
                                <Col span={24}>
                                    <Row type='flex' align='middle' justify='start' gutter={gutter}>
                                        {hasShots ? shotsList.map(item => {
                                            return (
                                                <Col key={item.id || item.compositionId}>
                                                    <CommonIntro 
                                                        brand
                                                        item={item} 
                                                        authorDetail
                                                        onFavor={fetchActionFavors}
                                                        onAdClick={this.handleAdClick}
                                                    />
                                                </Col>
                                            )
                                        }) : <EmptyComponent text='暂无相关作品' />}
                                    </Row>
                                </Col>
                            </Row>
                            {!isLastPage && hasShots && <LoadMore name={`加载更多`} num={num}
                                reqList={this.reqComposition} />}
                        </>  
                        {!state && <PartLoading float mask />}
                </div> 
            </div>
            {isMobileScreen && <BottomTabBar currentPath="shots" onRefresh={this.handleRefresh} />}
            </>
        )
    }
}