import { Component } from 'react'
import { Router } from '@routes'
import { inject, observer } from 'mobx-react'
import { message } from 'antd'
import { toJS } from 'mobx'

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
                        <span className='item-title'>个人</span>
                        <span className='item-description'>适合个人创作者</span>
                        <div className='item-list'>
                            <span>- 个人创作者标识</span>
                            <span>- 具有个人创作者主页</span>
                            <span>- 拥有作品文章发布和传播能力</span>
                            <span>- 个人类型最多支持注册1个</span>
                        </div>
                        <hr />
                        {isPerson ?
                            <a onClick={() => this.beforeBouter(`您仅可注册1个个人创作者`)}>选择并继续</a>
                            : <a href={`/creator/personal`}>选择并继续</a>}
                    </div>
                    <div className='verticalLine'></div>
                    <div className='creatorItem'>
                        <span className='item-title'>服务商</span>
                        <span className='item-description'>适合服务商机构创作者</span>
                        <div className='item-list'>
                            <span>- 服务商机构创作者标识</span>
                            <span>- 具有服务商机构创作者主页</span>
                            <span>- 拥有作品文章发布和传播能力</span>
                            <span>- 拥有多人协作管理创作者能力（待开发）</span>
                            <span>- 可以添加创作者成员（待开发）</span>
                            <span>- 其他机构更多功能</span>
                            <span>- 服务商和品牌主类型合计最多支持注册10个</span>
                        </div>
                        <hr />
                        {orgLen ? <a href={`/creator/service`}>选择并继续</a>
                            : <a onClick={() => this.beforeBouter(`您仅可注册10个创作者，（不含个人）`)}>选择并继续</a>}
                    </div>
                    <div className='verticalLine'></div>
                    <div className='creatorItem'><span className='item-title'>品牌主</span>
                        <span className='item-description'>适合品牌主机构创作者</span>
                        <div className='item-list'>
                            <span>- 品牌主机构创作者标识</span>
                            <span>- 具有品牌主机构创作者主页</span>
                            <span>- 拥有作品文章发布和传播能力</span>
                            <span>- 拥有多人协作管理创作者能力（待开发）</span>
                            <span>- 可以添加创作者成员（待开发）</span>
                            <span>- 其他机构更多功能</span>
                            <span>- 服务商和品牌主类型合计最多支持注册10个</span>
                        </div>
                        <hr />
                        {orgLen ? <a href={`/creator/brand`}>选择并继续</a>
                            : <a onClick={() => this.beforeBouter(`您仅可注册10个创作者，（不含个人）`)}>选择并继续</a>}
                    </div>
                </div>
            </div>
        )
    }
}