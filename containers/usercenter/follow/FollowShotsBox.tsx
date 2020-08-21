import { Component } from 'react'
import { Row, Col, Icon } from 'antd'
import { inject, observer } from 'mobx-react'
import { CompositionTypes } from '@base/enums'

import LoadMore from '@components/common/LoadMore'
import CommonIntro from '@components/common/CommonIntro'
import DetailHeader from '@components/author/DetailHeader'

let num = 3
@inject(stores => {
    const { followStore } = stores.store
    const { followShotsData } = followStore

    return {
        followStore,
        followShotsData,
    }
})
@observer
export default class FollowShotsBox extends Component {
    componentDidMount() {
        this.requestShots()
    }

    requestShots({page, size}={}) {
        const { followStore } = this.props
        followStore.fetchFollowCompositions({
            composition_type: CompositionTypes.SHOTS,
            page: page || 1,
            size: size || 20,
        })
    }

    handleNext = () => {
        const { followShotsData } = this.props
        this.requestShots({page: followShotsData.page + 1})
    }

    handleFavor = (option) => {
        const { followStore } = this.props
        followStore.fetchShotsFavor(option)
    }

    render() {
        const { followShotsData } = this.props
        const shotsList = followShotsData.list || []
        const { isLastPage, isLoading, isLoaded } = followShotsData

        return (
            <div className='prod-container'>
                <DetailHeader meta={`关注的创作者最新作品`} />
                <div className='prod-box'>
                    <Row type='flex' align='middle' justify='start' gutter={30}>
                        {shotsList.map(item => {
                            return (
                                <Col key={item.id}>
                                    <CommonIntro 
                                        item={item} 
                                        onFavor={this.handleFavor}
                                    />
                                </Col>
                            )
                        })}
                    </Row>
                    {!isLastPage && isLoaded && <LoadMore name={`加载更多`} num={num}
                        reqList={this.handleNext} />}
                </div>
            </div>
        )
    }
}