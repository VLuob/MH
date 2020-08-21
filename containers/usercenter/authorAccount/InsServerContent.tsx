import { Button } from 'antd'
import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import ServerComp from '@components/usercenter/ServerComp'

@inject(stores => {
    const { userCenterStore } = stores.store
    const { serverInfo } = userCenterStore

    return {
        serverInfo
    }
})
@observer
export default class InsServerContent extends Component {
    submitClick = () => {
        // console.log(`功能提交`)
    }

    render() {
        const { query, serverInfo } = this.props

        return (
            <div className='ins-server-content'>
                {/* <div className='title'>产品服务</div> */}
                <ServerComp query={query} list={serverInfo} isDropdown={true} />
                {/* <Button type='primary' className='themes' onClick={this.submitClick}>提交</Button> */}
            </div>
        )
    }
}