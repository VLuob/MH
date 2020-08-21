import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Icon, Avatar, Select, Button, Dropdown, Checkbox, Spin } from 'antd'
import { toJS } from 'mobx'

import { EmailSubscribeType } from '@base/enums'

import AvatarComponent from '@components/common/AvatarComponent'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'

const { Option } = Select
const CheckboxGroup = Checkbox.Group

const emailActiveOptions = [
    { label: '每天', value: 1 },
    { label: '每周', value: 2 },
    { label: '每月', value: 3 }
]
const emailCollectionOptions = [
    { label: '每天', value: 1 },
    { label: '每周', value: 2 },
    { label: '每月', value: 3 }
]
const subOptions = [
    { label: '每天', value: 1 },
    { label: '每周', value: 2 }
]

const emailRankingOptions = [
    { label: '每周', value: 2 }
]

// 收藏夹统计推送默认值
const defaultEmailContentData = [{ type: EmailSubscribeType.CONTENT, frequency: [2, 3], relationId: null, receivers: [] }]
const defaultEmailCollectionData = [{ type: EmailSubscribeType.COLLECTION, frequency: [2, 3], relationId: null, receivers: [] }]
const defaultEmailStatisticsData = [{ type: EmailSubscribeType.STATISTICS, frequency: [2], relationId: null, receivers: [] }]
const defaultEmailRankingData = [{ type: EmailSubscribeType.RANKING, frequency: [2], relationId: null, receivers: [] }]

export interface Props {
    selEmail: string
    recData: Array<any>
    activeData: Array<any>
    emailCollectionData: Array<any>
    updateRecData: Function
    updateActiveData: Function
    updateEmailCollectionData: (arg: any) => void
    subscriptionData: any
    emailOrgMemberList: Array<any>
    fetchGetSubscriptions: Function
    fetchSetSubscriptions: Function
}

export interface State {
    currentKey: number
}

@inject(stores => {
    const { userCenterStore, accountStore } = stores[`store`]
    const { currentUser } = accountStore
    const { 
        recData,
        activeData,
        emailCollectionData,
        emailRankingData,
        subscriptionStateData,
        updateRecData,
        updateActiveData,
        updateEmailCollectionData,
        updateEmailRankingData,
        updateSubscriptionStateData,
        subscriptionData, 
        emailOrgMemberList,
        fetchGetSubscriptions, 
        fetchSetSubscriptions,
        fetchGetSettingMember,
    } = userCenterStore

    return {
        currentUser,
        recData,
        activeData,
        emailCollectionData,
        emailRankingData,
        subscriptionStateData,
        updateRecData,
        updateActiveData,
        updateEmailCollectionData,
        updateEmailRankingData,
        updateSubscriptionStateData,
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
            return {
                selectedArray: props.activeData[state.currentKey][`receivers`] || []
            }
        }

        return {}
    }

    componentDidMount() {
        // const { fetchGetSettingMember } = this.props

        // fetchGetSettingMember()
    }

    handleUpdateEmail = e => {
        const { recData, activeData, emailCollectionData, emailRankingData, fetchSetSubscriptions } = this.props
        
        const subscriptions = [
            ...toJS(recData), 
            ...toJS(activeData),
            ...toJS(emailCollectionData),
            ...toJS(emailRankingData),
        ]

        fetchSetSubscriptions({ subscriptions: JSON.stringify(subscriptions) })
    }

    handleSubmit = e => {
        const { 
            currentUser, 
            subscriptionStateData, 
            recData, 
            emailCollectionData, 
            activeData, 
            emailRankingData, 
            fetchSetSubscriptions,
            emailOrgMemberList,
        } = this.props
        const {
            contentValues,
            collectionValues,
            statisticsValues,
            rankingValues,
            authorValues,
        } = subscriptionStateData 
        const sourceContentItem = recData[0]
        // const receivers = sourceContentItem.receivers
        const receivers = [currentUser.email]
        const contentSubscriptions = [{
            ...(recData[0] || defaultEmailContentData[0]), 
            relationId: null, 
            receivers: receivers, 
            frequency: contentValues
        }]
        const collectionSubscriptions = [{
            ...(emailCollectionData[0] || defaultEmailCollectionData[0]),
            receivers: receivers, 
            relationId: null, 
            frequency: collectionValues
        }]
        const statisticsSubscriptions = emailOrgMemberList.map(item => {
            return {
                ...(activeData[0] || defaultEmailStatisticsData[0]),
                receivers: receivers, 
                relationId: item.id, 
                frequency: authorValues.includes(item.id) ? statisticsValues : [0],
            }
        })
        const rankingSubscriptions = emailOrgMemberList.map(item => {
            return {
                ...(emailRankingData[0] || defaultEmailRankingData[0]),
                receivers: receivers, 
                relationId: item.id, 
                frequency: authorValues.includes(item.id) ? rankingValues : [0],
            }
        })
        // const statisticsSubscriptions = authorValues.map(authorId => {
        //     return {
        //         ...(activeData[0] || defaultEmailStatisticsData[0]),
        //         receivers: receivers, 
        //         relationId: authorId, 
        //         frequency: statisticsValues
        //     }
        // })
        // const rankingSubscriptions = authorValues.map(authorId => {
        //     return {
        //         ...(emailRankingData[0] || defaultEmailRankingData[0]),
        //         receivers: receivers, 
        //         relationId: authorId, 
        //         frequency: rankingValues,
        //     }
        // })
        const subscriptions = [
            ...contentSubscriptions,
            ...collectionSubscriptions,
            ...statisticsSubscriptions,
            ...rankingSubscriptions,
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

    onRankingChange = key => {
        const { currentKey } = this.state
        const { emailRankingData, updateEmailRankingData } = this.props

        const currentRankingData = [...emailRankingData]
        let newKey = key

        if(key.length <= 0) {
            newKey = [0]
        }

        currentRankingData[currentKey] && (currentRankingData[currentKey][`frequency`] = newKey)

        updateEmailRankingData(currentRankingData)
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

    onCollectionChange = key => {
        const { emailCollectionData, recData, updateEmailCollectionData } = this.props
        let newKey = key.length <= 0 ? [0] : key

        
        const params = [{
            ...(emailCollectionData[0] || defaultEmailCollectionData[0]),
            receivers: recData[0].receivers,
            relationId: recData[0].relationId,
            frequency: newKey,
        }]
        
        updateEmailCollectionData(params)
    }

    handleContentChange = (values) => {
        this.changeSubscriptionState({contentValues: values})
    }
    handleCollectionChange = (values) => {
        this.changeSubscriptionState({collectionValues: values})
    }
    handleStatisticsChange = (values) => {
        this.changeSubscriptionState({statisticsValues: values})
    }
    handleRankingChange = (values) => {
        this.changeSubscriptionState({rankingValues: values})
    }

    handleAuthorChange = (values) => {
        this.changeSubscriptionState({authorValues: values})
    }

    changeSubscriptionState = (values) => {
        const { updateSubscriptionStateData } = this.props
        updateSubscriptionStateData(values)
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
        const { 
            currentUser,
            recData, 
            emailCollectionData, 
            activeData, 
            emailRankingData, 
            emailOrgMemberList, 
            subscriptionData, 
            subscriptionStateData,
        } = this.props
        const { 
            contentValues,
            collectionValues,
            statisticsValues,
            rankingValues,
            authorValues,
        } = subscriptionStateData
        const collectionStatData = emailCollectionData.length > 0 ? emailCollectionData : defaultEmailCollectionData;
        const rankingStatData = emailRankingData.length > 0 ? emailRankingData : defaultEmailRankingData;

        const hasAuthors = emailOrgMemberList.length > 0

        // console.log(toJS(subscriptionStateData))

        const authorOptions = emailOrgMemberList.map((item, index) =>  {
            const label = (
                <span>
                    <AvatarComponent
                        src={item.avatar}
                        name={item.nickname}
                        style={{ width: `15px`, height: `15px`, marginRight: `10px`, marginBottom: `2.5px`, fontSize: `22px` }}
                    />
                    <UserIdentityComp currentType={item.type} />
                    <span className="nickname">{item.nickname}</span>
                </span>
            )
            return {label, value: item.id}
        })

        return (
            <div className='email-sub-container'>
                {subscriptionData.loading && <div style={{padding: '30px 0', textAlign: 'center'}}><Spin /></div>}
                {!subscriptionData.loading && <>
                <div className='email-sub-checkbox'>
                    <h6 className='email-sub-title'>文章作品精选推荐</h6>
                    <div className='email-single-colunm'>
                        <span className='email-sub-subtitle'>频次</span>
                        {<CheckboxGroup options={subOptions} value={contentValues} onChange={this.handleContentChange} />}
                        {/* {recData[0].frequency && recData[0].frequency.length > -1 && 
                        <CheckboxGroup options={subOptions} value={recData[0].frequency} onChange={this.onSubChange} />} */}
                    </div>
                </div>
                <div className='email-sub-checkbox'>
                    <h6 className='email-sub-title'>收藏夹统计报告</h6>
                    <div className='email-single-colunm'>
                        <span className='email-sub-subtitle'>频次</span>
                        {<CheckboxGroup options={emailCollectionOptions} value={collectionValues} onChange={this.handleCollectionChange} />}
                        {/* {collectionStatData[0].frequency && collectionStatData[0].frequency.length > -1 && 
                        <CheckboxGroup options={emailCollectionOptions} value={collectionStatData[0].frequency} onChange={this.onCollectionChange} />} */}
                    </div>
                </div>
                {hasAuthors && <>
                <div className='email-sub-checkbox'>
                    <h6 className='email-sub-title'>作品统计报告</h6>
                    <div className='email-single-colunm'>
                        <span className='email-sub-subtitle'>频次</span>
                        {<CheckboxGroup options={emailActiveOptions} value={statisticsValues} onChange={this.handleStatisticsChange} />}
                        {/* {activeData && activeData.length > 0 && 
                        <CheckboxGroup options={emailActiveOptions} value={activeData[currentKey].frequency} onChange={this.onActiveChange} />} */}
                    </div>
                </div>
                <div className='email-sub-checkbox'>
                    <h6 className='email-sub-title'>排行榜收录作品统计报告</h6>
                    <div className='email-single-colunm'>
                        <span className='email-sub-subtitle'>频次</span>
                        {<CheckboxGroup options={emailRankingOptions} value={rankingValues} onChange={this.handleRankingChange} />}
                        {/* {rankingStatData && rankingStatData.length > 0 && 
                        <CheckboxGroup options={emailRankingOptions} value={rankingStatData[0].frequency} onChange={this.onRankingChange} />} */}
                    </div>
                </div>
                <div className='email-sub-checkbox'>
                    <h6 className='email-sub-title'>创作者</h6>
                    <div className='email-single-colunm'>
                    <CheckboxGroup 
                        className="checkout-group-authors-horizontal" 
                        options={authorOptions} 
                        value={authorValues} 
                        onChange={this.handleAuthorChange} 
                    />
                    </div>
                </div>
                </>}
                <div className='email-sub-checkbox'>
                    <h6 className='email-sub-title'>推送邮箱</h6>
                    <div className='email-single-colunm'>
                        <span className='email-sub-subtitle'>邮箱</span>
                        <span className='email-sub-mail'>{currentUser.email}</span>
                    </div>
                </div>
                </>}




                {/* {activeData && activeData.length > 0 && <h6 className='email-sub-title'>账户活动邮件</h6>} */}
                {/* {activeData && activeData.length > 0 && 
                <div className='email-sub-checkbox'>
                    <div className='email-single-colunm'>
                        <span className='email-sub-subtitle'>创作者</span>
                        {activeData && activeData.length > 0 && emailOrgMemberList && emailOrgMemberList.length > 0 && <Select 
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
                        </Select>}
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
                                        <Select open={false} defaultValue={selectedArray[index]} style={{ width: 403 }} onChange={this.handleSelect}>
                                            {activeData[currentKey][`receivers`].map((m, mIndex) => (
                                                <Option key={mIndex} value={m}>{m}</Option>
                                            ))}
                                        </Select>
                                        {selectedArray.length > 1 && index === 0 && <Button className='email-sub-opt' onClick={this.handleAdd}>添加</Button>}
                                        {selectedArray.length > 1 && index > 0 && <Button className='email-sub-opt' onClick={e => this.handleDel(index)}>删除</Button>}
                                    </div>
                                )
                            })}
                        </div>
                    }  
                </div>} */}



                {!subscriptionData.loading && <div className='email-sub-btnwrap'>
                    <Button 
                        type='primary' 
                        htmlType='submit'
                        className='themes email-sub-btn' 
                        //onClick={this.handleUpdateEmail} 
                        onClick={this.handleSubmit} 
                        loading={subscriptionData.updateLoading}
                    >提交</Button>
                </div>}
            </div>
        )
    }
}