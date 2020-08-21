import { Component } from 'react'
import { inject, observer } from 'mobx-react'

import TopicContainer from '@containers/topic'
import HeadComponent from '@components/common/HeadComponent'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'

import { TopicSortTypes } from '@base/enums'
import { toJS } from 'mobx'

@inject(stores => {
    const { globalStore } = stores.store
    const { isMobileScreen } = globalStore

    return {
        isMobileScreen,
    }
})
@observer
export default class Topic extends Component {
    static async getInitialProps(ctx) {
        const { req, asPath, query, mobxStore } = ctx
        const { topicStore, globalStore } = mobxStore
        const { isMobileScreen, setMobileNavigationData } = globalStore

        let datas = {}

        if (req && req.headers) {
            if (isMobileScreen) {
                setMobileNavigationData({hide: true})
            }
            
            const params = {
                page: 1,
                size: 20,
                order_type: query.sort === 'new' ? TopicSortTypes.NEW : TopicSortTypes.RECOMMEND, // 1 创建时间，2 置顶
                classification_id: query.type,
            }
            await topicStore.fetchTopics(params)
            await topicStore.fetchTopicClassifications({})
        }

         return {
            asPath,
            query,
            ...datas,
        }
    }

    render() {
        const { query, isMobileScreen } = this.props
        const title = '全部营销案例作品专题 - 营销作品宝库 - 梅花网（全部、品牌、品类、节日节气等）'
        const description = '梅花网主题作品专题，整合热门节日节气、行业趋势、品牌动向的作品及内容。'
        const keywords = '节日节气、品牌、营销合集、营销节点、热点借势'

        return (
            <>
                <HeadComponent
                    title={title}
                    keywords={keywords}
                    description={description}
                />
                {isMobileScreen && <MbNavigatorBar 
                    showTitle 
                    btnType="back"
                    backUrl="/discover"
                    title="专题" 
                />}
                <TopicContainer 
                    query={query}
                />
            </>
        )
    }
}