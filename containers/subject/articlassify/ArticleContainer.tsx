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

let num = 3
@inject(stores => {
    const { articlassifyStore, globalStore } = stores.store
    const { 
        articlassifyListData, 
        updateArticlassifyDetail, 
        updateBrandArtiListTerms, 
        fetchGetArticlassifyList,
        articlassifyClientDetail, 
    } = articlassifyStore
    const { isMobileScreen } = globalStore
 
    return {
        isMobileScreen,
        articlassifyListData,
        updateArticlassifyDetail,
        updateBrandArtiListTerms,
        fetchGetArticlassifyList,
        articlassifyClientDetail,
    }
})
@observer
export default class ShotsContainer extends Component {

    reqClassifyList = option => {
        const { query, updateBrandArtiListTerms, fetchGetArticlassifyList, articlassifyListData } = this.props
        const { id } = query
        const param = { terms: { ...option, page: 1, limit: articlassifyListData.terms.limit, term: { ...option.term, type: CompositionTypes.ARTICLE, classifications: [id] }, recommended: false } }

        updateBrandArtiListTerms(param.terms)
        fetchGetArticlassifyList(param)
    }

    reqBrandArtiList = () => {
        const { fetchGetArticlassifyList, articlassifyListData } = this.props
        const param = { terms: articlassifyListData.terms }

        fetchGetArticlassifyList(param)
    }

    render() {
        // const { resultArticlassifyData } = this.state
        const { isMobileScreen, articlassifyListData } = this.props
        const { isLastPage } = articlassifyListData
        const gutter = isMobileScreen ? 15 : 30

        return (
            <>
                <SubTab
                    subTabList={subTabList}
                    reqList={this.reqClassifyList}
                    condition={articlassifyListData.terms}
                />
                <div className='brand-content'>
                    {articlassifyListData.state ? 
                        <div>
                            {articlassifyListData.list && articlassifyListData.list.length > 0 ?
                                <div className='article-list'>
                                    <Row type='flex' align='middle' justify='start' gutter={gutter}>
                                        {articlassifyListData.list && articlassifyListData.list.map(item => {
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
                                    </Row>
                                </div> : <EmptyComponent text='未找到相关文章' />}
                        </div> : <PartLoading />}
                        {articlassifyListData.classification && <ShareGroup
                            className='right'
                            tagPageShare={articlassifyListData.classification.name}
                            // title={articlassifyClientDetail.classification.name}
                            // authorName={articlassifyClientDetail.classification.creator}
                        />}
                    {articlassifyListData.state && !isLastPage && <LoadMore name={`加载更多`} num={articlassifyListData.terms ? articlassifyListData.terms.page : num}
                        status={articlassifyListData.state} reqList={this.reqBrandArtiList} />}
                </div>
            </>
        )
    }
}