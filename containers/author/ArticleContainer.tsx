import { Component } from 'react'
import { Row, Col } from 'antd'
import dynamic from 'next/dynamic'
import { inject, observer } from 'mobx-react'
import { CompositionType } from '@base/enums'
import { toJS } from 'mobx'

// import LoadMore from '@components/common/LoadMore'
import ArticleItem from '@components/article/ArticleItem'
import AuthorHeader from '@components/author/AuthorHeader'
import PartLoading from '@components/features/PartLoading'
import EmptyComponent from '@components/common/EmptyComponent'
// import ArticleBriefComp from '@components/common/ArticleBriefComp'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
    loading: () => <p></p>,
    ssr: false
})

const num = 3
@inject(stores => {
    const { authorStore } = stores.store
    const { 
        articleData, 
        articleParam, 
        fetchFavorList, 
        updateComposition,
        fetchGetComposition, 
        updateCompositionParam,
        fetchGetClientComposition,
    } = authorStore

    return {
        articleData,
        articleParam,
        fetchFavorList,
        updateComposition,
        fetchGetComposition,
        updateCompositionParam,
        fetchGetClientComposition,
    }
})
@observer
export default class ArticleContainer extends Component {


    searchFn = val => {
        const { query, articleParam, fetchGetComposition } = this.props
        const { code } = query

        fetchGetComposition({ key: val, code, type: CompositionType.ARTICLE, ...articleParam, page: 1 })
    }
    
    reqComposition = () => {
        const { 
            query, 
            articleParam, 
            compositionData, 
            changeComposition, 
            fetchGetComposition,
            updateCompositionParam,
        } = this.props
        const { code } = query
        let page = articleParam.page

        if(articleParam.page <= 1) {
            updateCompositionParam({
                type: CompositionType.ARTICLE,
                data: {
                    ...toJS(articleParam),
                    page: articleParam.page + 1
                }
            })

            page = articleParam.page + 1
        }

        fetchGetComposition({ ...articleParam, code, type: CompositionType.ARTICLE, page })
    }

    render() {
        const { query, articleData, articleParam, fetchGetClientComposition } = this.props
        const { state } = articleData
        const { code } = query

        return (
            <div className='origin-article-box'>
                {state && <AuthorHeader meta={`共创作了${articleData.count}篇文章`} placeholder={`搜索他的文章`} searchFn={this.searchFn}
                    query={query} fetchGetClientComposition={fetchGetClientComposition} />}
                <div className='origin-article-content'>
                    {state ? 
                        <> 
                            {articleData.list && articleData.list.length > 0 && <div className='article-content'>
                                {articleData.list.length > 0 && articleData.list.map(item => {
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
                                            time={item.gmtPublished}
                                            classification={item.classificationName}
                                        />
                                    )
                                })}
                            </div>}
                            {!articleData.list &&
                                <EmptyComponent text='TA没有发布任何文章' />
                            }
                        </> 
                        // <div className='article-content'>
                        //     {articleData.list && articleData.list.length > 0 ? articleData.list.map(item => (
                        //         // <ArticleBriefComp key={item.id} item={item} />
                        //         <ArticleItem
                        //             key={item.compositionId}
                        //             id={item.compositionId}
                        //             title={item.title}
                        //             cover={item.cover}
                        //             summary={item.summary}
                        //             authorCode={item.authorCode}
                        //             author={item.authorName}
                        //             view={item.view}
                        //             time={item.gmtPublish}
                        //             classification={item.classificationName}
                        //         />
                        //     )) : <EmptyComponent text='TA没有发布任何文章' />}
                        // </div> 
                    : <PartLoading />}
                </div>
                {!articleData.isLastPage && <LoadMore name={`加载更多`} num={num}
                    status={articleData.state} reqList={this.reqComposition} />}
            </div>
        )
    }
}