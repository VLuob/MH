import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import ServerComp from '@components/usercenter/ServerComp'

@inject(stores => {
    const { userCenterStore } = stores.store
    const { serverCustomInfo } = userCenterStore

    return {
        serverCustomInfo
    }
})
@observer
export default class InsServerContent extends Component {
    render() {
        const { query, serverCustomInfo } = this.props

        return (
            <div className='ins-server-content'>
                {/* <div className='title'>服务客户</div> */}
                <ServerComp query={query} custom={true} isDropdown={true} list={serverCustomInfo} />
            </div>
        )
    }
}