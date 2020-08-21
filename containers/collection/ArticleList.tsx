import { Component } from 'react'
import dynamic from 'next/dynamic'
import { inject, observer } from 'mobx-react'
import { CompositionTypes } from '@base/enums' 
import { toJS } from 'mobx'

import ArticleItem from '@components/article/ArticleItem'
import PartLoading from '@components/features/PartLoading'
import EmptyComponent from '@components/common/EmptyComponent'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
    loading: () => <p></p>,
    ssr: false
})

@inject(stores => {
    const { collectionStore, globalStore } = stores.store
    const { favoritesArticles } = collectionStore
    const { serverClientCode } = globalStore

    return {
        collectionStore,
        serverClientCode,
        favoritesArticles,
    }
})
@observer
export default class ShotsContainer extends Component {

    reqCompositions = () => {
        const { favoritesArticles, collectionStore } = this.props
        const terms = favoritesArticles.terms 
        delete terms.host

        const param = { ...terms, pageIndex: terms.pageIndex + 1 }
        collectionStore.fetchFavoritesCompositions(param)
    }

    render() {
        const { favoritesArticles } = this.props
        const { isEnd, loading, list } = favoritesArticles

        return (
            <>
                <div className='collection-content'>
                    {!loading ? 
                        <div>
                            {list.length > 0 ?
                                <div className='article-list'>
                                    <div className="article-list-wrap">
                                        {list.map(item => {
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
                                    </div>
                            </div> : <EmptyComponent text='未找到相关文章' />}
                        </div> : <PartLoading />}

                    {!isEnd && <LoadMore name={`加载更多`} num={3} reqList={this.reqCompositions} />}
                </div>
            </>
        )
    }
}