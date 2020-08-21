import { Component } from 'react'
import { Row, Col } from 'antd'
import { inject, observer } from 'mobx-react'
import { Router } from '@routes'
import { AdModuleTypes } from '@base/enums'
import TweenOne from 'rc-tween-one'
import dynamic from 'next/dynamic'
import { toJS, has } from 'mobx'

import { CompositionTypes, CommonSortType } from '@base/enums' 
import { subTabList } from '@constants/home/list'
import SubTab from '@components/widget/common/SubTab'
import CommonIntro from '@components/common/CommonIntro'
import PartLoading from '@components/features/PartLoading'
import EmptyComponent from '@components/common/EmptyComponent'
import SwiperContainer from '@containers/common/SwiperContainer'
import BottomTabBar from '@containers/common/BottomTabBar'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
    loading: () => <p></p>,
    ssr: false
})

const bannerKeys = ['f_h_l_t_1', 'f_h_l_t_2', 'f_h_l_t_3', 'f_h_l_t_4', 'f_h_l_t_5']

@inject(stores => {
    const { adStore, homeStore, globalStore, accountStore } = stores.store
    const { currentUser } = accountStore
    const { shotsData, changeShotsData, fetchActionFavor, updateShotDatas, fetchShotsList } = homeStore
    const { actionAdClick, homeAds } = adStore
    const { isMobileScreen } = globalStore

    return {
        currentUser,
        adStore,
        homeAds,
        shotsData, 
        actionAdClick,
        isMobileScreen, 
        changeShotsData, 
        updateShotDatas, 
        fetchActionFavor, 
        fetchShotsList 
    }
})
@observer 
export default class Main extends Component {

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
    //     Router.pushRoute(`/?${pathArr.join('&')}`)
    // }

    changeRoute({sort}) {
        const urlPath = sort ? `!${sort}` : ''
        Router.pushRoute(`/${urlPath}`)
    }

    recommendClick = () => {
        const { shotsData, changeShotsData, fetchShotsList, homeAds } = this.props
        const terms = shotsData.terms

        terms.term && delete terms.term
        terms.sort && delete terms.sort

        const param = { ...terms, page: 1, recommended: true, term: { type: CompositionTypes.SHOTS } }

        // 插入广告
        let hasAds = false
        let mergeAds = {}
        const shotsAdFields = ['f_h_l_w_1','f_h_l_w_2','f_h_l_w_3']
        shotsAdFields.forEach(field => {
            if (homeAds[field]) {
                mergeAds[field] = homeAds[field]
                hasAds = true
            }
        })
        
        fetchShotsList({ terms: param, mergeAds: hasAds ? mergeAds : null })
        changeShotsData(param)
        this.changeRoute({sort: CommonSortType.RECOMMEND})
    }

    reqHomeList = (option, routeOption) => {
        const { shotsData, changeShotsData, fetchShotsList } = this.props
        const param = { ...option, page: 1, limit: shotsData.terms.limit, recommended: false }

        changeShotsData(param)
        fetchShotsList({ terms: param })
        this.changeRoute(routeOption)
    }

    reqComposition = () => {
        const { shotsData, changeShotsData, fetchShotsList } = this.props
        const page = shotsData.terms.page <= 1 ? 2 : shotsData.terms.page

        changeShotsData({ ...shotsData.terms, page })
        fetchShotsList({terms: shotsData.terms})
    }

    handleRefresh = () => {
        const { shotsData, changeShotsData, fetchShotsList, homeAds } = this.props
        const terms = {...shotsData.terms, page: 1}
        const shotsParam = {terms}

        if (terms.recommended) {
            // 插入广告
            let hasAds = false
            let mergeAds = {}
            const shotsAdFields = ['f_h_l_w_1','f_h_l_w_2','f_h_l_w_3']
            shotsAdFields.forEach(field => {
                if (homeAds[field]) {
                    mergeAds[field] = homeAds[field]
                    hasAds = true
                }
            })
            if (hasAds) {
                shotsParam.mergeAds = mergeAds
            }
        }

        changeShotsData({ ...shotsData.terms })
        fetchShotsList(shotsParam)
    }

    render() {
        const { shotsData, currentUser, actionAdClick, isMobileScreen, fetchActionFavor, homeAds } = this.props
        const { isLastPage } = shotsData
        const gutter = isMobileScreen ? 15 : 30

        const adBanners = []
        bannerKeys.forEach(key => {
            adBanners.push(...(homeAds[key] || []))
        })
        
        return (
            <>
            <div className='main-container'>
                {/* {isMobileScreen && <div className="main-module mb-filter-bar">
                    <SubTab 
                        showRefreshBtn
                        subTabList={subTabList} 
                        condition={shotsData.terms} 
                        // originalCondition={originalCondition} 
                        recommendClick={this.recommendClick}
                        reqList={this.reqHomeList}
                        userInfo={currentUser} 
                    />
                </div>} */}
                {adBanners.length > 0 && <SwiperContainer>
                    {adBanners.map(item => {
                        const setting = JSON.parse(item.setting || '{"appSetting":{"appOpenScreenImages":null},"showSetting":{"title":true,"recommendation":false}}')
                        const showSetting = setting.showSetting || {}
                        return (
                            <div className='swiper-box' key={item.id} onClick={e => actionAdClick({ id: item.id })}>
                                <a href={item.link} target='_blank' title={item.title}>
                                    {/* <img src={`${item.image}?imageMogr2/thumbnail/!1920x360r/size-limit/50k/gravity/center/crop/1920x360`}/> */}
                                    <img src={`${item.image}`} alt={item.title} />
                                    {showSetting.title && <TweenOne> 
                                        <div className='swiper-banner'>
                                            <span className='title'>{item.title}</span>
                                        </div>
                                    </TweenOne>}
                                </a>
                                {showSetting.recommendation && <span className="ad-spreads">推广</span>}
                            </div>
                        )
                    })}
                </SwiperContainer>}
                <div className='main-module'> 
                    {!isMobileScreen && <SubTab 
                        showRefreshBtn
                        subTabList={subTabList} 
                        condition={shotsData.terms} 
                        // originalCondition={originalCondition} 
                        recommendClick={this.recommendClick}
                        reqList={this.reqHomeList}
                        userInfo={currentUser} 
                    />}

                    <div className='main-content'>
                        {shotsData.list && shotsData.list.length > 0 ? <Row type='flex' align='middle' justify='start' gutter={gutter}>
                            {shotsData.list && shotsData.list.map((item, index) => {
                                return (
                                    <Col key={(item.id || item.compositionId) + index}>
                                        <CommonIntro 
                                            brand 
                                            item={item} 
                                            authorDetail 
                                            onFavor={fetchActionFavor} 
                                            onAdClick={id => actionAdClick({id})}
                                        /> 
                                    </Col>
                                )
                            })}
                        </Row> : <EmptyComponent text='未找到相关作品' />}
                        {!isLastPage && <LoadMore name={`加载更多`} num={shotsData.terms ? shotsData.terms.page : 3}
                            status={shotsData.state} reqList={this.reqComposition} />}
                        {!shotsData.state && <PartLoading float mask />}
                    </div> 
                </div>
            </div>
            {isMobileScreen && <BottomTabBar currentPath="home" onRefresh={this.handleRefresh} />}
            </>
        )
    }
}