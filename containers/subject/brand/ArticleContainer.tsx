import { Component } from 'react'
import dynamic from 'next/dynamic'
import { Row, Col, Tabs } from 'antd'
import { inject, observer } from 'mobx-react'
import { CompositionTypes } from '@base/enums' 
import { toJS } from 'mobx'

import ShareGroup from '@containers/shots/ShareGroup'
import SubTab from '@components/widget/common/SubTab'
import ArticleItem from '@components/article/ArticleItem'
import PartLoading from '@components/features/PartLoading'
import EmptyComponent from '@components/common/EmptyComponent'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
    loading: () => <p></p>,
    ssr: false
})

const subTabList = [{
    key: `gmtCreate`,
    name: `最新`,
},{
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

let num = 3
@inject(stores => {
    const { brandStore, globalStore } = stores.store
    const { brandArtiListData, brandClientDetail, updateBrandArtiListData, updateBrandArtiListTerms, fetchGetBrandShotsList } = brandStore
    const { isMobileScreen } = globalStore

    return {
        isMobileScreen,
        brandArtiListData,
        brandClientDetail,
        updateBrandArtiListData,
        updateBrandArtiListTerms,
        fetchGetBrandShotsList,
    }
})
@observer
export default class ShotsContainer extends Component {


    reqBrandList = option => {
        const { query, brandArtiListData, updateBrandArtiListTerms, fetchGetBrandShotsList } = this.props
        const { id } = query
        const param = { terms: { ...option, page: 1, limit: brandArtiListData.terms.limit, term: { ...option.term, type: CompositionTypes.ARTICLE, brands: [id] }, recommended: false } }

        updateBrandArtiListTerms(param.terms)
        fetchGetBrandShotsList(param)
    }

    reqBrandArtiList = () => {
        const { brandArtiListData, fetchGetBrandShotsList } = this.props
        const param = { terms: brandArtiListData.terms }

        fetchGetBrandShotsList(param)
    }

    render() {
        const { isMobileScreen, brandClientDetail, brandArtiListData } = this.props
        const { isLastPage } = brandArtiListData
        const gutter = isMobileScreen ? 15 : 30

        return (
            <>
                {!isMobileScreen && <SubTab
                    subTabList={subTabList}
                    reqList={this.reqBrandList}
                    condition={brandArtiListData.terms}
                />}
                <div className='brand-content'>
                    {brandArtiListData.state ? 
                        <div>
                            {brandArtiListData.list && brandArtiListData.list.length > 0 ?
                                <div className='article-list'>
                                    {/* <Row type='flex' align='middle' justify='start' gutter={gutter}> */}
                                        {brandArtiListData.list && brandArtiListData.list.map(item => {
                                            return (
                                                <ArticleItem
                                                    item={item}
                                                    key={item.compositionId || item.id}
                                                    id={item.compositionId || item.id}
                                                    title={item.title}
                                                    cover={item.cover}
                                                    summary={item.summary}
                                                    authorCode={item.authorCode}
                                                    author={item.authorName}
                                                    view={item.views}
                                                    time={item.gmtPublish}
                                                    classification={item.classificationName}
                                                />
                                            )
                                        })}
                                {/* </Row> */}
                            </div> : <EmptyComponent text='未找到相关文章' />}
                        </div> : <PartLoading />}
                    {/* {brandClientDetail.brand && <ShareGroup 
                        className='right'
                        tagPageShare={brandClientDetail.brand.chName}
                        // title={brandClientDetail.brand.chName}
                        // authorName={brandClientDetail.brand.creator}
                    />} */}
                    {brandArtiListData.state && !isLastPage && <LoadMore name={`加载更多`} num={brandArtiListData.terms ? brandArtiListData.terms.page : num}
                        status={brandArtiListData.state} reqList={this.reqBrandArtiList} />}
                </div>
            </>
        )
    }
}