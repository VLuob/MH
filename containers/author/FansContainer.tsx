import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Row, Col, Tabs, Tag, Button, Avatar, message } from 'antd'
import { toJS } from 'mobx'

import SummaryMod from '@components/common/SummaryMod'
import DetailHeader from '@components/author/DetailHeader'

interface Props {
    isBigScreen: boolean
}

interface State {

}

@inject(stores => {
    const { authorStore, globalStore } = stores.store
    const { isBigScreen } = globalStore
    const { fansData, fansParam, fetchGetClientAuthorFans } = authorStore

    return {
        fansData,
        fansParam,
        isBigScreen,
        fetchGetClientAuthorFans
    }
})
@observer
export default class FansContainer extends Component<Props, State> {
    async componentDidMount() {
        // this.reqAuthorFans()
    }

    reqAuthorFans = () => {
        const { query, fansParam, fetchGetClientAuthorFans } = this.props
        const { code } = query

        fetchGetClientAuthorFans({ code, ...fansParam })
    }

    handleFocus = () => {
        
    }

    handleMessage = () => {
        message.destroy()
        message.warning(`评论功能暂未开启`)
    }

    render() {
        const { fansData, isBigScreen } = this.props

        return (
            <div className='origin-like-container'>
                <DetailHeader />
                <div className='origin-like-content'> 
                    {fansData.list && fansData.list.map(item => {
                        return (
                            <SummaryMod item={item} 
                                isBigScreen={isBigScreen}
                                handleFocus={this.handleFocus}
                                handleMessage={this.handleMessage} 
                            />
                        )
                    })}
                </div>
            </div>
        )
    }
}