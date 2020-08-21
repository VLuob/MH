import { Component } from 'react'
import { Row, Col, Menu } from 'antd'
import { CompositionType } from '@base/enums'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'

import LoadMore from '@components/common/LoadMore'
import ArticleItem from '@components/article/ArticleItem'
import DetailHeader from '@components/author/DetailHeader'
import PartLoading from '@components/features/PartLoading'
import EmptyComponent from '@components/common/EmptyComponent'

let num = 3
@inject(stores => {
    const { userCenterStore } = stores.store
    const { 
        articleFavorData, 
        articleFavorParam,
        fetchGetSettingFavor,
        compositionFavorParam, 
        fetchArticleActionFavor, 
    } = userCenterStore

    return {
        articleFavorData,
        articleFavorParam,
        fetchGetSettingFavor,
        compositionFavorParam,
        fetchArticleActionFavor,
    }
})
@observer
export default class ArticleContainer extends Component {
    reqSettingFavorList = () => {
        const { articleFavorParam, fetchGetSettingFavor } = this.props

        fetchGetSettingFavor({ type: CompositionType.ARTICLE, ...articleFavorParam, page: articleFavorParam.page })
    }

    handleFavorRemove = (e, item) => {
        const { fetchArticleActionFavor } = this.props

        switch(Number(e.key)) {
            case 0:
                fetchArticleActionFavor({ action: 0, id: item.id || item.compositionId })

                break
        }
    }

    removeMenu = item => {
        return (
            <Menu onClick={e => this.handleFavorRemove(e, item)}>
                <Menu.Item key='0'>取消喜欢</Menu.Item>
            </Menu>
        )
    }

    handleSearch = key => {
        const { fetchGetSettingFavor, compositionFavorParam } = this.props

        fetchGetSettingFavor({ type: CompositionType.ARTICLE, ...compositionFavorParam, page: 1, key })
    }

    render() {
        const { value, artiData, onFavorChange, articleFavorData } = this.props
        const { state, isLastPage } = articleFavorData

        return (
            <div className='article-container'>
                <DetailHeader 
                    value={value}
                    placeholder={`搜索`}
                    onChange={onFavorChange}
                    searchFn={this.handleSearch}
                    type={CompositionType.ARTICLE}
                    meta={`共喜欢了${articleFavorData.count}篇文章`} 
                />
                {!!state ? <div>
                    {articleFavorData.list && articleFavorData.list.length > 0 ? <div className='article-box'>
                        <div className='article-list'>
                            {articleFavorData.list.map(item => {
                                return (
                                    <ArticleItem 
                                        item={item}
                                        view={item.views}
                                        title={item.title}
                                        cover={item.cover}
                                        summary={item.summary}
                                        time={item.gmtPublished || 0}
                                        id={item.compositionId || item.id}
                                        author={item.authorName}
                                        authorCode={item.authorCode}
                                        removeMenu={e => this.removeMenu(item)}
                                        key={item.compositionId || item.id}
                                        onFavorRemove={this.handleFavorRemove}
                                        classification={item.classificationName}
                                    />
                                ) 
                            })}
                        </div>
                        {!isLastPage && <LoadMore name={`加载更多`} num={num}
                            reqList={this.reqSettingFavorList} />}
                    </div> : <EmptyComponent text='暂未喜欢任何文章' />}
                </div>: <PartLoading />}
            </div>
        )
    }
}