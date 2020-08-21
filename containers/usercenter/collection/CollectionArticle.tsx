import { Component } from 'react'
import { Row, Col, Icon, Menu } from 'antd'
import { inject, observer } from 'mobx-react'
import { CompositionType } from '@base/enums'
import jsCookie from 'js-cookie'
import { toJS } from 'mobx'
import { config } from '@utils'

import LoadMore from '@components/common/LoadMore'
import ArticleItem from '@components/article/ArticleItem'
import PartLoading from '@components/features/PartLoading'
import DetailHeader from '@components/author/DetailHeader'
import EmptyComponent from '@components/common/EmptyComponent'

let num = 3
@inject(stores => {
    const { userCenterStore } = stores.store
    const { collectionList, collectArticleData, fetchCollectionArtiActionCollect, fetchGetSettingAuthorCollection } = userCenterStore

    return {
        collectionList,
        collectArticleData,
        fetchGetSettingAuthorCollection,
        fetchCollectionArtiActionCollect,
    }
})
@observer
export default class CollectionArticle extends Component {
    reqSettingCollectList = () => {
        const { collectArticleData, fetchGetSettingAuthorCollection, query } = this.props

        fetchGetSettingAuthorCollection({ type: CompositionType.ARTICLE, collection_id: query.collectionId,  size: collectArticleData.size, page: collectArticleData.page })
    }

    changeFn = key => {
        const { fetchGetSettingAuthorCollection } = this.props

        fetchGetSettingAuthorCollection({ type: CompositionType.ARTICLE, collection_id: key })
    }

    handleSearch = key => {
        const { fetchGetSettingAuthorCollection, collectArticleData } = this.props

        fetchGetSettingAuthorCollection({ type: CompositionType.ARTICLE, size: collectArticleData.size, page: 1,collection_id: key, key })
    }

    handleCollectArtiRemove = (e, item) => {
        const { fetchCollectionArtiActionCollect } = this.props

        switch(Number(e.key)) {
            case 0:
                const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)

                fetchCollectionArtiActionCollect({ action: 0, id: item.id, client_code })

                break
        }
    }

    removeMenu = item => {
        return (
            <Menu onClick={e => this.handleCollectArtiRemove(e, item)}>
                <Menu.Item key='0'>取消收藏</Menu.Item>
            </Menu>
        )
    }

    render() {
        const { value, collectArticleData, onCollectionChange } = this.props
        const { state, isLastPage } = collectArticleData

        return (
            <div className='colletion-box'>
                {!!state ? <div className='colletion-content'>
                    {/* <DetailHeader 
                        value={value}
                        placeholder={`搜索`}
                        onChange={onCollectionChange}
                        searchFn={this.handleSearch}
                        type={CompositionType.ARTICLE}
                        meta={`共收藏了${collectArticleData.count || 0}篇文章`} 
                    /> */}
                    {collectArticleData.list && collectArticleData.list.length > 0 ? <div className='article-list'>
                        {collectArticleData.list.map(item => {
                            return (
                                <ArticleItem
                                    item={item}
                                    view={item.views}
                                    title={item.title}
                                    cover={item.cover}
                                    summary={item.summary}
                                    author={item.authorName}
                                    time={item.gmtPublished || item.gmtModified || item.gmtCreate}
                                    authorCode={item.authorCode}
                                    id={item.compositionId || item.id}
                                    key={item.id || item.compositionId}
                                    onFavorRemove={this.handleCollectArtiRemove}
                                    removeMenu={e => this.removeMenu(item)}
                                    classification={item.classificationName}
                                />
                            )
                                
                        })}
                    </div> : <EmptyComponent text='暂未收藏任何文章' />}
                    {!isLastPage && <LoadMore name={`加载更多`} num={num}
                        reqList={this.reqSettingCollectList} />}
                </div> : <PartLoading />}
            </div>
        )
    }
}