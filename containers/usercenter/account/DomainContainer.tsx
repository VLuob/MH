import { Component } from 'react'
import { Modal, message, Input, Button } from 'antd'
import { inject, observer } from 'mobx-react'
import { FuncType } from '@base/enums'
import { utils } from '@utils'
import { toJS } from 'mobx'

@inject(stores => {
    const { userCenterStore } = stores.store
    const { domainInfo, changeDomain, updateDomain, fetchSetSetting, domainSettingInfo } = userCenterStore

    return {
        domainInfo,
        updateDomain,
        changeDomain,
        fetchSetSetting,
        domainSettingInfo,
    }
})
@observer
export default class DomainContainer extends Component {
    state = {
        visible: false,
    }
    handleChangeDomain = e => {
        const { changeDomain } = this.props

        changeDomain({ userDomain: e.target.value })
    }

    handleSave = e => {
        const { updateDomain, fetchSetSetting, domainSettingInfo } = this.props
        const { userDomain } = domainSettingInfo

        if(!(/^[a-z0-9A-Z]{8,16}$/).test(userDomain)) {
            message.destroy()
            message.error(`请输入8-16个英文或数字`)

            return 
        }

        this.setState({ visible: true })
        // updateDomain(userDomain)
        // fetchSetSetting({ type: FuncType.DOMAIN, data: JSON.stringify({ userDomain }) })
    }

    handleOk = e => {
        const { updateDomain, fetchSetSetting, domainSettingInfo, domainInfo } = this.props
        const { userDomain } = domainSettingInfo

        updateDomain(userDomain)
        fetchSetSetting({ type: FuncType.DOMAIN, data: JSON.stringify({ userDomain }), org_id: domainInfo.authorId })
        this.setState({ visible: false })
    }

    handleCancel = e => this.setState({ visible: false })

    render() {
        const { visible } = this.state
        const { domainInfo, domainSettingInfo } = this.props
        const { userDomain } = domainSettingInfo
        const timeGap = (domainInfo.gmtModified && domainInfo.gmtCurrent) ? 
            (domainInfo.gmtCurrent - domainInfo.gmtModified) > 30 * 24 * 3600 * 1000 : false

        return (
            <div className='domain-box'>
                <div className='title'>用户域名</div>
                {timeGap ? 
                    <Input type='text' value={userDomain} placeholder={`8-16个英文或数字`} className='domain-input' onChange={this.handleChangeDomain} /> :
                    <Input type='text' disabled value={userDomain} placeholder={`8-16个英文或数字`} className='domain-input' onChange={this.handleChangeDomain} />
                }
                <p className='demo'>用户域名:   {`https://meihua.info/author/${userDomain}`}</p>
                <p className='demo'>域名不得设置与自己不相关的域名，机构需与企业域名一致，梅花网保持回收域名权力</p>
                <p className='demo'>仅支持8-16个英文或者数字，30天内仅能修改一次</p>
                <Button type='primary' className='themes submit-btn' onClick={this.handleSave}>提交</Button>
                <Modal
                    className='safe-container-modal'
                    title={`修改域名`} 
                    visible={visible}
                    okText={`确定`}
                    cancelText={`取消`}
                    style={{ padding: '0 50px' }}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    footer={ <>
                        <Button onClick={this.handleCancel}>取消</Button>
                        <Button onClick={this.handleOk} type='primary' className='themes' style={{ borderRadius: '3px', border: 'none', outline: 'none' }}>确定</Button>
                    </>}>
                    确定要将域名修改为<span style={{ color: '#f00' }}>{userDomain}</span>吗?(仅支持8-16个英文或者数字，30天内仅能修改一次)
                </Modal>
            </div>
        )
    }
}