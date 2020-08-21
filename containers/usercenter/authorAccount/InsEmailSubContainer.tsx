import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Icon, Avatar, Select, Button, Dropdown, Checkbox, Spin } from 'antd'
import { toJS } from 'mobx'

import AvatarComponent from '@components/common/AvatarComponent'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'

const { Option } = Select
const CheckboxGroup = Checkbox.Group

const emailActiveOptions = [
    { label: '每天', value: 1 },
    { label: '每周', value: 2 },
    { label: '每月', value: 3 }
]

const subOptions = [
    { label: '每天', value: 1 },
    { label: '每周', value: 2 }
]

export interface Props {
    selEmail: string
    recData: Array<any>
    activeData: Array<any>
    emailCollectionData: Array<any>
    updateRecData: Function
    updateActiveData: Function
    subscriptionData: any
    emailOrgMemberList: Array<any>
    fetchGetSubscriptions: Function
    fetchSetSubscriptions: Function
}

export interface State {
    currentKey: number
}

@inject(stores => {
    const { userCenterStore } = stores[`store`]
    const { 
        recData,
        activeData,
        emailCollectionData,
        updateRecData,
        updateActiveData,
        subscriptionData, 
        emailOrgMemberList,
        fetchGetSubscriptions, 
        fetchSetSubscriptions,
        fetchGetSettingMember,
    } = userCenterStore

    return {
        recData,
        activeData,
        emailCollectionData,
        updateRecData,
        updateActiveData,
        subscriptionData,
        emailOrgMemberList,
        fetchGetSubscriptions,
        fetchSetSubscriptions,
        fetchGetSettingMember,
    }
})
@observer
export default class EmailSubContainer extends Component<Props, State> {
    state = {
        receiverLen: ['1', '2', '3'].length,
        selEmail: '1',
        currentKey: 0,
        selectedArray: []
    }

    static getDerivedStateFromProps(props, state) {
        if(state.selectedArray.length <= 0 && props.activeData.length > 0) {
            const currentActiveIndex = props.activeData.findIndex(item => item.relationId === Number(props.query.id))
            if (currentActiveIndex !== -1) {
                return {
                    currentKey: currentActiveIndex,
                    selectedArray: props.activeData[currentActiveIndex][`receivers`] || []
                }
            }
        }

        return {}
    }

    componentDidMount() {
        // const { fetchGetSettingMember } = this.props

        // fetchGetSettingMember()
    }

    handleUpdateEmail = e => {
        const { recData, activeData, emailCollectionData, fetchSetSubscriptions } = this.props
        
        const subscriptions = [
            ...recData, 
            ...activeData,
            ...emailCollectionData,
        ]

        fetchSetSubscriptions({ subscriptions: JSON.stringify(subscriptions) })
    }

    handleActiveData = e => {
        const { activeData } = this.props

        this.setState({ currentKey: e, selectedArray: activeData[e][`receivers`] || [] })
    }

    onActiveChange = key => {
        const { currentKey } = this.state
        const { activeData, updateActiveData } = this.props

        const currentActiveData = [...activeData]
        let newKey = key

        if(key.length <= 0) {
            newKey = [0]
        }

        currentActiveData[currentKey] && (currentActiveData[currentKey][`frequency`] = newKey)

        updateActiveData(currentActiveData)
    }

    onSubChange = key => {
        const { recData, updateRecData } = this.props
        let newKey = key
        
        if(key.length <= 0) {
            newKey = [0]
        }

        const recDatas = [{
            ...recData[0],
            frequency: newKey
        }]

        updateRecData(recDatas)
    }

    handleSelect = key => {
        this.setState({ selEmail: key })
    }

    handleAdd = () => {
        const { receiverLen, selEmail, selectedArray } = this.state

        if(receiverLen > selectedArray.length) {
            this.setState({ selectedArray: [...selectedArray, ''] })
        }
    }

    handleDel = index => {
        const { selectedArray } = this.state

        this.setState({ selectedArray: selectedArray.filter((l, i) => i !== index) })
    }

    render() {
        const { currentKey, selectedArray } = this.state
        const { query, recData, activeData, emailOrgMemberList, subscriptionData } = this.props

        // const currentAuthor = emailOrgMemberList.filter(m => Number(m.id) === Number(query.id))[0] || {}
        // const currentActiveData = activeData.find(item => item.relationId === Number(query.id)) || {}
        // const currentActiveIndex = activeData.findIndex(item => item.relationId === Number(query.id))
        // console.log('email sub', toJS(activeData), toJS(currentAuthor), toJS(currentActiveData))

        return (
            <div className='email-sub-container'>
                {activeData.length <= 0 && <div style={{padding: '30px 0', textAlign: 'center'}}><Spin /></div>}
                {/* <h6 className='email-sub-title'>梅花网推荐邮件</h6> */}
                {/* {recData && recData.length > 0 && <div className='email-sub-checkbox'>
                    <div className='email-single-colunm'>
                        <span className='email-sub-subtitle'>推送</span>
                        {recData[0].frequency && recData[0].frequency.length > -1 && 
                        <CheckboxGroup options={subOptions} value={recData[0].frequency} onChange={this.onSubChange} />}
                    </div>
                    <div className='email-single-colunm'>
                        <span className='email-sub-subtitle'>邮箱</span>
                        <span className='email-sub-mail'>{recData[0].receivers}</span>
                    </div>
                </div>} */}
                {activeData && activeData.length > 0 && <h6 className='email-sub-title'>账户活动邮件</h6>}
                {activeData && activeData.length > 0 && 
                <div className='email-sub-checkbox'>
                    <div className='email-single-colunm'>
                        <span className='email-sub-subtitle'>创作者</span>
                        {activeData && activeData.length > 0 && emailOrgMemberList && emailOrgMemberList.length > 0 && (() => {
                            const value = emailOrgMemberList.filter(m => Number(m.id) === Number(activeData[currentKey].relationId))[0] || {}
                            return (
                                <div className="author-select" style={{display: 'inline-block', width: '403px', height: '38px'}}>
                                    <AvatarComponent
                                        src={value.avatar}
                                        name={value.username}
                                        style={{ width: `20px`, height: `20px`, marginRight: `10px`, fontSize: `22px` }}
                                    />
                                    <UserIdentityComp currentType={value.type} editionType={value.editionType} />
                                    <span style={{marginLeft: '10px'}}>{value.nickname}</span>
                                </div>
                            )
                        })()}
                        {/* {activeData && activeData.length > 0 && emailOrgMemberList && emailOrgMemberList.length > 0 && <Select 
                            style={{ width: 403 }}
                            className='author-select'
                            onChange={this.handleActiveData}
                            defaultValue={(() => {
                                const value = emailOrgMemberList.filter(m => Number(m.id) === Number(activeData[0].relationId))[0] || {}
                            
                                return (
                                    <div>
                                        <AvatarComponent
                                            src={value.avatar}
                                            name={value.username}
                                            style={{ width: `20px`, height: `20px`, marginRight: `10px`, fontSize: `22px` }}
                                        />
                                        <UserIdentityComp currentType={value.type} />
                                        {value.nickname}
                                    </div>
                                )
                            })()} 
                        >
                            {activeData.map((l, index) => (
                                <Option key={index} value={index}>
                                    {(() => {
                                        const filterData = emailOrgMemberList.filter(m => Number(m.id) === Number(l.relationId))
      
                                        return (
                                            <div>
                                                <AvatarComponent
                                                    src={filterData[0] && filterData[0].avatar}
                                                    name={filterData[0] && filterData[0].nickname}
                                                    style={{ width: `15px`, height: `15px`, marginRight: `10px`, marginBottom: `2.5px`, fontSize: `22px` }}
                                                />
                                                <UserIdentityComp currentType={filterData[0] && filterData[0].type} />
                                                {filterData[0] && filterData[0].nickname}
                                            </div>
                                        )
                                    })()}
                                </Option>
                            ))}
                        </Select>} */}
                    </div>
                    <div className='email-single-colunm'>
                        <span className='email-sub-subtitle padding-right'>推送</span>
                        {activeData && activeData.length > 0 && 
                        <CheckboxGroup options={emailActiveOptions} value={activeData[currentKey].frequency} onChange={this.onActiveChange} />}
                    </div>
                    {activeData && activeData.length > 0 && 
                        <div className='email-single-colunm'>
                            <span className='email-sub-subtitle padding-right'>邮箱</span>
                            {selectedArray && selectedArray.map((l, index) => {
                                return (
                                    <div className='email-select-box' key={index}>
                                        <Select open={false} defaultValue={l} style={{ width: 403 }} onChange={this.handleSelect}>
                                            {/* {activeData[currentKey][`receivers`].map((m, mIndex) => (
                                                <Option key={mIndex} value={m}>{m}</Option>
                                            ))} */}
                                        </Select>
                                        {/* {selectedArray.length > 1 && index === 0 && <Button className='email-sub-opt' onClick={this.handleAdd}>添加</Button>} */}
                                        {/* {selectedArray.length > 1 && index > 0 && <Button className='email-sub-opt' onClick={e => this.handleDel(index)}>删除</Button>} */}
                                    </div>
                                )
                            })}
                        </div>
                    }  
                </div>}
                {activeData.length > 0 && <div className='email-sub-btnwrap'>
                    <Button 
                        type='primary' 
                        htmlType='submit' 
                        className='themes email-sub-btn' 
                        onClick={this.handleUpdateEmail} 
                        loading={subscriptionData.updateLoading}
                    >更新邮箱推送</Button>
                </div>}
            </div>
        )
    }
}