import { Component } from 'react'
import { Router } from '@routes'
import { inject, observer } from 'mobx-react'
import { message, Button } from 'antd'
import { toJS } from 'mobx'

import CustomIcon from '@components/widget/common/Icon'

@inject(stores => {
    const { userCenterStore } = stores.store
    const { personBaseInfo, fetchGetPersonalId, mineInsList, fetchGetOrgList } = userCenterStore

    return {
        personBaseInfo,
        fetchGetPersonalId,
        mineInsList,
        fetchGetOrgList
    }
})

@observer
export default class SelectCreatorType extends Component<Props, State> {
    componentDidMount() {
        const { fetchGetPersonalId, fetchGetOrgList } = this.props

        fetchGetPersonalId(callback => {
            fetchGetOrgList({ user_id: callback.id })
        })
    }

    beforeBouter(msg) {
        message.destroy()
        message.error(msg)
    }

    render() {
        const { personBaseInfo, mineInsList } = this.props
        const orgLen = toJS(mineInsList).length < 10
        const isPerson = toJS(personBaseInfo).authorId

        return (
            <div className='selectCreatorType'>
                <div className='selectBox'>
                    <div className='creatorItem'>
                        <span className="item-icon"><CustomIcon name="author-personal" /></span>
                        <span className='item-title'>个人</span>
                        <span className='item-description'>适合个人创作者</span>
                        <span className="item-btn">
                        {isPerson ?
                            <Button onClick={() => this.beforeBouter(`您仅可注册1个个人创作者`)} type="primary">选择并继续</Button>
                            : <Button href={`/creator/personal`} type="primary">选择并继续</Button>}
                        </span>
                    </div>
                    <div className='verticalLine'></div>
                    <div className='creatorItem'>
                        <span className="item-icon"><CustomIcon name="author-service" /></span>
                        <span className='item-title'>服务商</span>
                        <span className='item-description'>适合服务商创作者</span>
                        <span className="item-btn">
                        {orgLen ? <Button href={`/creator/service`} type="primary">选择并继续</Button>
                            : <Button type="primary" onClick={() => this.beforeBouter(`您仅可注册10个创作者，（不含个人）`)}>选择并继续</Button>}
                        </span>
                    </div>
                    <div className='verticalLine'></div>
                    <div className='creatorItem'>
                        <span className="item-icon"><CustomIcon name="author-brand" /></span>
                        <span className='item-title'>品牌主</span>
                        <span className='item-description'>适合品牌主创作者</span>
                        <span className="item-btn">
                        {orgLen ? <Button type="primary" href={`/creator/brand`}>选择并继续</Button>
                            : <Button type="primary" onClick={() => this.beforeBouter(`您仅可注册10个创作者，（不含个人）`)}>选择并继续</Button>}
                        </span>
                    </div>
                </div>
            </div>
        )
    }
}