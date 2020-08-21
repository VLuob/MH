import { Fragment, Component } from 'react'
import { inject, observer } from 'mobx-react'
import { CompositionType } from '@base/enums'
import { Row, Col, Tabs, Tag, Button, Avatar } from 'antd'
import { toJS } from 'mobx'

import LoadMore from '@components/common/LoadMore'
import CommonIntro from '@components/common/CommonIntro'
import ClassifyTab from '@components/common/ClassifyTab'
import DetailHeader from '@components/author/DetailHeader'
import ArticleBriefComp from '@components/common/ArticleBriefComp'

const num = 3
interface Props {
    isBigScreen: boolean
}

interface State {

}

@inject(stores => {
    const { globalStore, authorStore } = stores.store
    const { isBigScreen } = globalStore
    const { favorsData, favorsParam, favorsArticleData, changeFavorsData,
        favorsArticleParam, fetchGetClientAuthorFavor} = authorStore

    return {
        favorsData,
        favorsParam,
        changeFavorsData,
        favorsArticleData,
        favorsArticleParam,
        isBigScreen, 
        fetchGetClientAuthorFavor
    }
})
@observer
export default class FavoriteContainer extends Component<Props, State> {
    state = {
        currentKey: CompositionType.COMPOSITION
    }

    static getDerivedStateFromProps(props, state) {
        if(props.favorsData.ssr) {
            return {
                favorsData: props.favorResultData
            }
        } else {
            return {
                favorsData: props.favorsData
            }
        }
    }

    async componentDidMount() {
        const { favorsData } = this.state
        const { query, changeFavorsData } = this.props
        const { code } = query

        changeFavorsData({
            ...favorsData,
            ssr: false
        })
        this.changeFn(CompositionType.COMPOSITION)
    }

    menuList = () => {
        const { favorsData } = this.props

        return [{
            id: CompositionType.COMPOSITION,
            name: `作品 ${favorsData.articleCount}`,
        }, {
            id: CompositionType.ARTICLE,
            name: `文章 ${favorsData.compositionCount}`
        }]
    }

    changeFn = key => {
        const { query, favorsParam, favorsArticleParam, fetchGetClientAuthorFavor } = this.props
        const { code } = query
        let param = { code, type: key}

        this.setState({ currentKey: key })

        if(key === CompositionType.COMPOSITION) {
            param = { ...param, ...favorsParam }
        } else if(key === CompositionType.ARTICLE) {
            param = { ...param, ...favorsArticleParam }
        }

        fetchGetClientAuthorFavor(param)
    }

    render() {
        const { currentKey } = this.state
        const favorsData = this.state.favorsData || {}
        const { query, favorsArticleData, favorsArticleParam, fetchGetClientComposition } = this.props
        const { type } = query
        const meta = currentKey === CompositionType.COMPOSITION ? `共喜欢了${favorsData.articleCount}组作品` : `共喜欢了${favorsData.compositionCount}篇文章`

        return (
            <div className='origin-like-container'>
                <ClassifyTab
                    keys={CompositionType.COMPOSITION}
                    tabName={`分类`}
                    notMore={true}
                    changeFn={this.changeFn}
                    tabList={this.menuList()}
                    borderless={true} />
                <DetailHeader meta={meta} />
                <div className='origin-like-container'>
                    {currentKey === CompositionType.COMPOSITION ?
                    <>
                        <Row type='flex' gutter={30} align='middle' justify='start'>
                            {favorsData.list && favorsData.list.map((item, index) => {
                                return (
                                    <Fragment key={index}>
                                        <Col>
                                            <CommonIntro item={item} />
                                        </Col>
                                    </Fragment>
                                )
                            })}
                        </Row>
                        {!favorsData && <LoadMore name={`加载更多`} num={num}
                            reqList={e => fetchGetClientComposition({ ...compositionParam, code, type: CompositionType.COMPOSITION, page: compositionParam.page + 1 })} />}
                    </> :
                    <>
                        {favorsArticleData.list && favorsArticleData.list.map((item, index) => {
                            return (
                                <ArticleBriefComp key={item.id} item={item} />
                            )
                        })}
                        {/* {!favorsArticleData && <LoadMore name={`加载更多`} num={num}
                            reqList={e => fetchGetClientComposition({ ...favorsArticleParam, code, type: CompositionType.COMPOSITION, page: favorsArticleParam.page + 1 })} />} */}
                    </>}
                </div>
            </div>
        )
    }
}