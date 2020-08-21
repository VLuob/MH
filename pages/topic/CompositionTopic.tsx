import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import CompositionTopicContainer from '@containers/topic/CompositionTopicContainer'
import HeadComponent from '@components/common/HeadComponent'

import Error from '@components/common/Error'
import { TopicSortTypes } from '@base/enums'
import { toJS } from 'mobx'

@inject(stores => {
    const { topicStore } = stores.store
    const { compositionTopicData } = topicStore
    return {
        compositionTopicData,
    }
})
@observer
export default class CompositionTopic extends Component {
    static async getInitialProps(ctx) {
        const { req, res, asPath, query, mobxStore } = ctx
        const { topicStore } = mobxStore

        let datas: any = {}
        let statusCode = 0

        if (req && req.headers) {
            const host = req.headers.host
            const compositionId = query.id
            statusCode = res.statusCode > 200 ? res.statusCode : 0

            
            const resultCompositionTopics = await topicStore.fetchCompositionTopics({host, compositionId, pageIndex: 1, pageSize: 100})

            if (!resultCompositionTopics || !resultCompositionTopics.success) {
              statusCode = 404
            } else {
              const params = {
                  host, 
                  page: 1,
                  size: 20,
                  order_type: TopicSortTypes.NEW , 
              }
              const resultTopicsData = await topicStore.fetchTopics(params)
            }
        }

         return {
          statusCode,
          asPath,
          query,
          ...datas,
        }
    }

    render() {
        const { statusCode, query, compositionTopicData } = this.props

        if (statusCode) {
            return <Error statusCode={statusCode} />
        }

        return (
            <>
                <HeadComponent
                    title={`${compositionTopicData.title}被收录的专题 - 营销作品宝库 - 梅花网`}
                />
                <CompositionTopicContainer query={query} />
            </>
        )
    }
}