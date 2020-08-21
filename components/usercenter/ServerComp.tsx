import { Component } from 'react'
import { Row, Col, Icon } from 'antd'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'

import ServerBox from './ServerBox'
import ServerModal from './ServerModal'
import ServerAddBox from './ServerAddBox'

@inject(stores => {
    const { userCenterStore } = stores.store
    const { serverInfo, serverCustomInfo, fetchPostOrgService, serverContentInfo, updateServerContentInfo } = userCenterStore

    return {
        serverInfo,
        serverCustomInfo,
        serverContentInfo,
        fetchPostOrgService,
        updateServerContentInfo,
    }
})
@observer
export default class ServerComp extends Component {
    state = { show: false }

    editClick = info => {
        const { updateServerContentInfo } = this.props

        this.setState({ show: true })
        updateServerContentInfo(info)
    }

    closeClick = () => {
        this.setState({ show: false })
    }

    handleServer = () => {
        const { query, custom, serverInfo, serverCustomInfo, fetchPostOrgService, serverContentInfo } = this.props
        const { id } = query
        let data 
        let type = 0

        if(custom) {
            type = 1

            data = [
                ...toJS(serverCustomInfo),
                toJS(serverContentInfo)
            ]
        } else {
            type = 0

            data = [
                ...toJS(serverInfo),
                toJS(serverContentInfo)
            ]
        }

        function unique(arr) {
            const res = new Map()

            return arr.filter(a => (!res.has(a.id) && res.set(a.id, 1)))
        }

        const datas = (unique(data.reverse())).reverse()
        // const datas = data

        fetchPostOrgService({ data: datas, org_id: id, type })
        this.setState({ show: false })
    }

    handleClick = (key, item) => {
        const { query, custom, serverInfo, serverCustomInfo, fetchPostOrgService, serverContentInfo } = this.props
        const { id } = query
        let type = 0
        let data
        let info = serverInfo

        if(custom) {
            type = 1
            info = serverCustomInfo
        } else {
            type = 0
            info = serverInfo
        }

        if(Number(key) === 0) {
            this.editClick(item)
        } else {
            data = toJS(info).filter(l => l.id !== item.id)

            fetchPostOrgService({ data, org_id: id, type })
        }
    }

    render() {
        const { show } = this.state
        const { list, custom, isDropdown } = this.props

        return (
            <div className='production-server-box'>
                <Row className='server-list' type='flex' justify='start' align='middle' gutter={40}>
                    {list && list.map(item => {
                        return (
                            <Col key={item.id || item.title}>
                                <ServerBox key={item.id} custom={custom} 
                                    isDropdown={isDropdown} item={item}
                                    onClicks={this.handleClick} />
                            </Col>
                        )
                    })}
                    <Col>
                        <ServerAddBox onClick={e => this.editClick({})} />
                    </Col>
                </Row>
                <ServerModal 
                    show={show} 
                    title={`添加服务客户`} 
                    handleServer={this.handleServer}
                    closeClick={this.closeClick} 
                /> 
            </div>
        )
    }
}