import { Component } from 'react'
import dynamic from 'next/dynamic'
import { Row, Col, Tabs } from 'antd'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'

import { CompositionTypes } from '@base/enums' 

import ShareGroup from '@containers/shots/ShareGroup'
import SubTab from '@components/widget/common/SubTab'
import CommonIntro from '@components/common/CommonIntro'
import PartLoading from '@components/features/PartLoading'
import EmptyComponent from '@components/common/EmptyComponent'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
    loading: () => <p></p>,
    ssr: false
})

const num = 3

const subTabList = [{
    key: `gmtCreate`,
    name: `最新`,
}, {
    key: `degree`,
    name: `热门`,
    // menu: [{
    //     key: 'degree',
    //     name: `热门`
    // }, {
    //     key: 'favors',
    //     name: `喜欢`
    // }, {
    //     key: 'views',
    //     name: `浏览`
    // }]
}]

@inject(stores => {
    const { brandStore, globalStore } = stores.store
    const { brandListData, fetchActionFavor, brandClientDetail, updateBrandListData, updateBrandListTerms, fetchGetBrandShotsList } = brandStore
    const { isMobileScreen } = globalStore

    return {
        brandListData,
        isMobileScreen, 
        fetchActionFavor,
        brandClientDetail,
        updateBrandListData,
        updateBrandListTerms,
        fetchGetBrandShotsList,
    }
})
@observer
export default class ShotsContainer extends Component {
    reqBrandShotsList = () => {
        const { brandListData, fetchGetBrandShotsList } = this.props
        const param = { terms: brandListData.terms }

        fetchGetBrandShotsList(param)
    }

    reqBrandList = option => {
        const { query, brandListData, updateBrandListTerms, fetchGetBrandShotsList } = this.props
        const { id } = query
        const param = { terms: { ...option, page: 1, limit: brandListData.terms.limit, term: { ...option.term, brands: [id] }, recommended: false }}

        updateBrandListTerms(param.terms)
        fetchGetBrandShotsList(param)
    }

    onActionFavor = option => {
        const { fetchActionFavor } = this.props

        fetchActionFavor(option)
    }

    render() {
        const { brandListData, isMobileScreen, brandClientDetail } = this.props
        const { isLastPage } = brandListData
        const gutter = isMobileScreen ? 15 : 30

        return (
            <>
                {!isMobileScreen && <SubTab
                    subTabList={subTabList}
                    reqList={this.reqBrandList}
                    condition={brandListData.terms}
                />}
                <div className='brand-content'>
                    {brandListData.state ? 
                        <>
                            {brandListData.list && brandListData.list.length > 0 ? <Row type='flex' align='middle' justify='start' gutter={gutter}>
                                {brandListData.list && brandListData.list.map(item => {
                                    return (
                                        <Col key={item.id || item.compositionId}>
                                            <CommonIntro
                                                brand
                                                item={item}
                                                authorDetail
                                                onFavor={this.onActionFavor} />
                                        </Col>
                                    )
                                })}
                            </Row> : <EmptyComponent text='未找到相关作品' />}
                        </> : <PartLoading />}
                    {/* {brandClientDetail.brand && <ShareGroup className='right' 
                        tagPageShare={brandClientDetail.brand.chName}
                        // title={brandClientDetail.brand.chName}
                        // authorName={brandClientDetail.brand.creator}
                    />} */}
                </div>
                {brandListData.state && !isLastPage && <LoadMore name={`加载更多`} num={brandListData.terms ? brandListData.terms.page : num}
                    status={brandListData.state} reqList={this.reqBrandShotsList} />}
            </>
        )
    }
}