
import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import moment from 'moment'
import { Button, Checkbox, DatePicker, message, Avatar, Spin } from 'antd'
import { LetterSendType, LetterSenderTypes, LetterSources } from '@base/enums'

import CustomIcon from '@components/widget/common/Icon'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'

import './index.less'


const Div = (props) => {
  const childrenProps = { ...props };
  delete childrenProps.show;
  return <div {...childrenProps} />;
};

@inject(stores => {
  const { accountStore, letterStore, enquiryStore, compositionStore, globalStore } = stores.store
  const { referrerSource } = globalStore
  const { enquiryUi, enquiryData } = letterStore
  const { currentUser } = accountStore

  return {
    accountStore,
    letterStore,
    enquiryStore,
    compositionStore,

    enquiryData,
    referrerSource,
    currentUser,
  }
})
@observer
class EnquiryAuthors extends Component {
  state = {
    authorsFetching: true,
    sendFetching: false,
    authors: [],
    selectedIds: [],

    checkPublicEnquiry: false, 
    gmtExpire: moment().add(30, 'days')
  }

  componentDidMount() {
    this.requestRecommendAuthors()
  }

  async requestRecommendAuthors() {
    const { enquiryStore, formId } = this.props
    this.setState({authorsFetching: true})
    const response = await enquiryStore.fetchRecommendAuthors({formId})
    this.setState({authorsFetching: false})
    if (response.success) {
      const authors = response.data || []
      // const selectedIds = authors.map(item => item.id)
      this.setState({authors})
    }
  }

  handleCheckChange = (e) => {
    const { selectedIds } = this.state
    const record = e.target.record || {}
    let newIds = []
    if (e.target.checked) {
      newIds = [...selectedIds, record.id]
    } else {
      newIds = selectedIds.filter(v => v !== record.id)
    }
    this.setState({selectedIds: newIds})
  }

  handlePublishChecked = (e) => {
    this.setState({checkPublicEnquiry: e.target.checked})
  }

  handleExpireChange = (picker, dateString) => {
    this.setState({gmtExpire: picker})
  }

  handleRefresh = () => {
    this.requestRecommendAuthors()
  }

  handleSubmit = (e) => {
    const { isPublicEnquiry } = this.props
    const { selectedIds, checkPublicEnquiry, gmtExpire } = this.state

    if (isPublicEnquiry && selectedIds.length === 0) {
      message.destroy()
      message.error('请选择创作者')
      return
    }

    if (!isPublicEnquiry && !checkPublicEnquiry && selectedIds.length === 0) {
      message.destroy()
      message.error('请选择创作者或公开询价')
      return
    }

    if (!isPublicEnquiry && checkPublicEnquiry) {
      if (!gmtExpire) {
        message.destroy()
        message.error('请选择询价有效期')
        return
      }
      if (gmtExpire.isBefore(moment())) {
        message.destroy()
        message.error('询价有效期错误')
        return
      }
    } 
    
    this.handleSend()
  }

  handleSend = async () => {
    const { onSuccess, enquiryStore, enquiryValues, enquiryData, currentUser={}, isPublicEnquiry } = this.props
    const { selectedIds, gmtExpire, checkPublicEnquiry } = this.state
    const isLogin = !!currentUser.id
    const authorIds = selectedIds.join(',')
    const param = {
      ...enquiryValues,
      authorIds,
      source: enquiryData.source || LetterSources.PUBLIC_ENQUIRY,
      senderType: isPublicEnquiry ? LetterSenderTypes.USER : (enquiryData.senderType || LetterSenderTypes.VISTOR),
      senderId: enquiryData.senderId,
    }
    this.setState({sendFetching: true})
    let isSuccess = false
    if (selectedIds.length > 0) {
      const response = await enquiryStore.betchSendEnquiry(param)
      this.setState({sendFetching: false})
      if (response.success) {
        isSuccess = true
      } else {
        isSuccess = false
        message.destroy()
        message.error(response.data.msg)
      }
    }
    if (checkPublicEnquiry) {
      const publicParam = {
        ...enquiryValues,
        expireTime: gmtExpire.valueOf(),
      }
      const publicRes = await enquiryStore.addEnquiry(publicParam)
      this.setState({sendFetching: false})
      if (publicRes.success) {
        isSuccess = true
      } else {
        isSuccess = false
        message.destroy()
        message.error(publicRes.data.msg)
      }
    }

    if (isSuccess) {
      if (onSuccess) onSuccess(authorIds)
    }

    // const response = await enquiryStore.betchSendEnquiry(param)
    // if (checkPublicEnquiry) {
    //   const publicParam = {
    //     ...enquiryValues,
    //     expireTime: gmtExpire.valueOf(),
    //   }
    //   const publicRes = await enquiryStore.addEnquiry(publicParam)
    //   this.setState({sendFetching: false})
    //   if (response.success && publicRes.success) {
    //     if (onSuccess) onSuccess(authorIds)
    //   }
      
    // } else {
    //   this.setState({sendFetching: false})
    //   if (response.success) {
    //     if (onSuccess) {
    //       onSuccess(authorIds)
    //     }
    //   } else {
    //     message.destroy()
    //     message.error(response.data.msg)
    //   }
    // }

  }

  handleCancel = () => {
    const { onCancel } = this.props
    if (onCancel) onCancel()
  }

  render() {
    const {
      authorsFetching,
      sendFetching,
      authors,
      selectedIds,
      checkPublicEnquiry,
      gmtExpire,
    } = this.state
    const { enquiryUi, currentUser, isPublicEnquiry, cancelText, hideCancelBtn  } = this.props
    const user = currentUser || {}
    const isLogin = !!user.id
    
    return (
      <>
        <div className="enquiry-authors-box">
          <div className="title">符合您询价需求的服务商推荐</div>
          <div className="header">
            <div className="label-text">
            将询价发送给以下户外广告服务商
            </div>
            <div className="btn-refresh" onClick={this.handleRefresh}>换一批</div>
          </div>
          <div className="author-list-wrapper">
            <div className="enquiry-author-list">
              {authors.map(item => {
                const isChecked = selectedIds.includes(item.id)
                return (
                  <div className="enquiry-author-item" key={item.id}>
                    <div className="checkbox-wrapper">
                    <Checkbox checked={isChecked} record={item} onChange={this.handleCheckChange} />
                    </div>
                    <div className="author-wrapper">
                      <div className="avatar">
                        <Avatar size={40} src={item.avatar} />
                      </div>
                      <div className="info">
                        <div className="nickname">{item.nickname}</div>
                        <div className="intro">
                          <UserIdentityComp currentType={item.type} editionType={item.editionType} />
                        </div>
                      </div>
                    </div>
                    <div className="count-wrapper">
                      作品 <span className="count">{item.works || 0}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            {authorsFetching && <div className="spin-wrapper">
              <Spin />
            </div>}
          </div>
          {!isPublicEnquiry && <div className="enquiry-public-wrapper">
            <div className="label">公开询价（公开询价后所有服务商都可看到该询价内容）</div>
            <div className="content">
              <div className="checkbox">
                <Checkbox onClick={this.handlePublishChecked} checked={checkPublicEnquiry}>公开询价</Checkbox>
              </div>
              {checkPublicEnquiry && <div className="datepicker-wrapper">
                <span className="text">该询价有效期</span>
                <DatePicker 
                  suffixIcon={<CustomIcon name="calendar" />}
                  value={gmtExpire} 
                  onChange={this.handleExpireChange} 
                />
              </div>}
            </div>
          </div>}
          <div className="enquiry-author-bottom">
            <Button type="primary" onClick={this.handleSubmit} loading={sendFetching}>发送</Button>
            {!hideCancelBtn && <span className="btn-cancel" onClick={this.handleCancel}>{cancelText || '跳过'}</span>}
          </div>
        </div>
      </>
    )
  }
}

export default EnquiryAuthors