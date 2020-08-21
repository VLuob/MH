import { toJS } from 'mobx'
import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Row, Col, Tabs, Tag, Button, Avatar } from 'antd'

import SummaryMod from '@components/common/SummaryMod'
import DetailHeader from '@components/author/DetailHeader'

interface Props {
    isBigScreen: boolean
}

interface State {

}

@inject(stores => {
    const { globalStore, authorStore } = stores.store
    const { isBigScreen } = globalStore
    const { followData, followParam, fetchGetClientAuthorFollow } = authorStore

    return {
        followData,
        followParam,
        isBigScreen,
        fetchGetClientAuthorFollow
    }
})
@observer
export default class FocusContainer extends Component<Props, State> {
    async componentDidMount() {
        // this.reqClientAuthorFollow()
    }

    reqClientAuthorFollow = () => {
        const { query } = this.props
        const { code } = query
        const { followParam, fetchGetClientAuthorFollow } = this.props

        fetchGetClientAuthorFollow({ code, ...followParam })
    }

    render() {
        const { followData, isBigScreen } = this.props

        return (
            <div className='origin-like-container'>
                <DetailHeader />
                {followData.list && followData.list.map(item => {
                    return (
                        <SummaryMod key={item.key} isBigScreen={isBigScreen} item={item} />
                    )
                })}
            </div>
        )
    }
}