import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Router } from '@routes'

import HeadComponent from '@components/common/HeadComponent'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'

import iconGouImage from '@static/images/icon/gou.png'

import { AuthorType } from '@base/enums'

const authorTypeNameMap = {
    [AuthorType.PERSONAL]: '个人',
    [AuthorType.SERVER]: '服务商',
    [AuthorType.BRANDER]: '品牌主',
    [AuthorType.EDITOR]: '编辑',
}

@inject(stores => {
    const { globalStore } = stores.store
    const { isMobileScreen } = globalStore
    return {
        isMobileScreen,
    }
})
@observer
export default class CreatorReview extends Component {
    static async getInitialProps(ctx) {
        const { query, req, mobxStore } = ctx
        const { globalStore } = mobxStore
        const { isMobileScreen, setMobileNavigationData } = globalStore

        const creatorType = query.type ? Number(query.type) : ''
        const org_id = query.id

        if (req && req.headers) {
            if (isMobileScreen) {
                setMobileNavigationData({hide: true})
            }
        }
        
        return {
            creatorType,
            org_id
        }
    }

    render() {
        const { creatorType, org_id, isMobileScreen } = this.props

        return (
            <>
                <HeadComponent
                    title={`审核中-梅花网-营销作品宝库`}
                />
                {isMobileScreen && <MbNavigatorBar
                    showTitle
                    title={`创建${authorTypeNameMap[creatorType] || ''}创作者`}
                />}
                <div className='reviewPage'>
                    <div className='reviewBox'>
                        <div className="title">
                            <span className='icon'>
                                <img src={iconGouImage} alt="" /> 
                            </span>
                            <span>提交成功</span>
                        </div>
                        <div className='tips'>提交成功，我们将会尽快完成审核</div>
                        <div className='btn-group'>
                            {creatorType ? <a href={`/creator/${creatorType}/${org_id}`}>修改申请</a>
                                : <a onClick={() => Router.back()}>修改申请</a>}
                                <a href={`/`}>返回首页</a>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}