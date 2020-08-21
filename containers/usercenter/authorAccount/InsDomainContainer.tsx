import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { message, Input, Button, Modal } from 'antd'
import { FuncType, AddedServiceType } from '@base/enums'
import { utils } from '@utils'
import { toJS } from 'mobx'

@inject(stores => {
    const { userCenterStore } = stores.store
    const { 
        changeDomain,
        fetchSetSetting,
        domainSettingInfo,
        domainInfo,
        updateDomain,
        curClientUserInfo,
        fetchSetShotsWebsiteDomain,
    } = userCenterStore

    return {
        changeDomain,
        fetchSetSetting,
        domainSettingInfo,
        domainInfo,
        updateDomain,
        curClientUserInfo,
        fetchSetShotsWebsiteDomain,
    }
})
@observer
export default class DomainContainer extends Component {
    constructor(props) {
        super(props)
        const { curClientUserInfo } = props
        const authorEdition = curClientUserInfo.authorEdition ||{}
        // const serviceTypeArr = (authorEdition.serviceType || '').split(',').map(v => Number(v))
        const workWebsite = curClientUserInfo.workWebsite || {}
        const websiteEditionRight = workWebsite.editionRight || {}
        const hasWebsite = !!curClientUserInfo.workWebsite
        this.state = {
            visible: false,
            websiteDomain: websiteEditionRight.useDomain,
            // hasWebsite: serviceTypeArr.includes(AddedServiceType.HOME_PAGE),
            hasWebsite,
        }
    }
    handleChangeDomain = e => {
        const { query, changeDomain } = this.props
        const { id } = query

        changeDomain({ userDomain: e.target.value, org_id: id })
    }

    handleChangeWebsiteDomain = e => {
        this.setState({websiteDomain: e.target.value})
    }

    handleSave = e => {
        const { query, fetchSetSetting, domainSettingInfo } = this.props
        const { userDomain } = domainSettingInfo
        const { id } = query

        if(userDomain && !(/^[a-z0-9A-Z]{8,16}$/).test(userDomain)) {
            message.destroy()
            message.error(`请输入8-16个英文或数字`)

            return 
        }

        this.setState({ visible: true })

        // fetchSetSetting({ type: FuncType.DOMAIN, data: JSON.stringify({ userDomain }), org_id: id })
    }


    handleOk = e => {
        const { updateDomain, fetchSetSetting, domainSettingInfo, domainInfo } = this.props
        const { userDomain } = domainSettingInfo

        updateDomain(userDomain)
        fetchSetSetting({ type: FuncType.DOMAIN, data: JSON.stringify({ userDomain }), org_id: domainInfo.authorId })
        this.setState({ visible: false })
    }

    handleCancel = e => this.setState({ visible: false })

    handleWebsiteSubmit = () => {
        const { websiteDomain } = this.state
        const reg = /^([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/
        if (!reg.test(websiteDomain)) {
            message.error('请输入正确的域名，不包括http、https头')
            return
        }

       this.websiteDoaminSave()
    }

    async websiteDoaminSave() {
        const { websiteDomain } = this.state
        const { fetchSetShotsWebsiteDomain, curClientUserInfo } = this.props
        const authorId = curClientUserInfo.authorId
        const response = await fetchSetShotsWebsiteDomain({authorId, domain: websiteDomain})
        if (response.success) {
            message.success('保存成功')
        } else {
            message.error('保存失败')
        }
    }

    render() {
        const { visible, websiteDomain, hasWebsite } = this.state
        const { domainSettingInfo, domainInfo, curClientUserInfo } = this.props
        const { userDomain } = domainSettingInfo
        const timeGap = (domainInfo.gmtModified && domainInfo.gmtCurrent) ? (domainInfo.gmtCurrent - domainInfo.gmtModified) > 30 * 24 * 3600 * 1000 : false

        const workWebsite = curClientUserInfo.workWebsite || {}
        const websiteEditionRight = workWebsite.editionRight || {}

        // console.log(toJS(curClientUserInfo))

        return (
            <div className='ins-data-content'>
                <div className='domain-box'>
                    <div className="domain-box-section">
                        <h3 className='title'>用户二级域名</h3>
                        <Input 
                            type='text' 
                            value={userDomain} 
                            disabled={!timeGap}
                            placeholder={`8-16个英文或数字`} 
                            className='domain-input' 
                            onChange={this.handleChangeDomain} 
                        />
                        <p className='demo'>用户域名:   {`https://meihua.info/author/${userDomain}`}</p>
                        <p className='demo'>域名不得设置与自己不相关的域名，机构需与企业域名一致，梅花网保持回收域名权力</p>
                        <p className='demo'>仅支持8-16个英文或者数字，30天内仅能修改一次</p>
                        <Button type='primary' className='themes submit-btn' onClick={this.handleSave}>提交</Button>
                    </div>
                    {hasWebsite ? <div className="domain-box-section">
                        <h3 className='title'>绑定独立域名</h3>
                        <div className="domain-website-input-wrap">
                            <span className="domain-label">https://</span>
                            <Input 
                                type='text' 
                                value={websiteDomain} 
                                // defaultValue={websiteEditionRight.useDomain}
                                disabled={!timeGap}
                                placeholder={'yourdomain.com'} 
                                className='domain-input' 
                                onChange={this.handleChangeWebsiteDomain} 
                            />
                        </div>
                        <p className="demo">请输入您已拥有的自定义域名，如果停止使用，请清除后，点击提交。</p>
                        <p className='demo'>如需设置可参考<a href="https://shimo.im/docs/33C8tH6QvXQjwVCx/" target="_blank">说明文档</a>，如需协助，<a href="https://mingdao.com/form/4fea509732d6474d8704f0fdb4ba2e75" target="_blank">可联系我们。</a></p>
                        <Button type='primary' className='themes submit-btn' onClick={this.handleWebsiteSubmit}>提交</Button>
                    </div> : 
                    <div className="domain-box-section">
                        <div className="domain-not-buy">
                            <div className="domain-not-buy-btn">
                                <Button 
                                    type="primary" 
                                    className="themes" 
                                    href={`/pricing?aid=${curClientUserInfo.authorId}&scope=2`} 
                                    target="_blank"
                                >升级</Button>
                            </div>
                            <div className="domain-not-buy-text">
                                <div className="strong">设置自定义域名连接到独立作品库官网</div>
                                <div className="desc">升级购买独立作品库官网可使用此功能</div>
                            </div>
                        </div>
                    </div>}
                </div>
                <Modal
                    className='safe-container-modal'
                    title={`修改二级域名`} 
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