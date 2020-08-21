import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Input, Modal, message, Spin, Pagination, Form } from 'antd'
import classnames from 'classnames'
import jsCookie from 'js-cookie'
import moment from 'moment'
import { toJS } from 'mobx';

import PartLoading from '@components/features/PartLoading'
import EmptyComponent from '@components/common/EmptyComponent'
import LetterItem from './LetterItem'

import { config } from '@utils/'
import { LetterSendType, LetterSources } from '@base/enums'

const FormItem = Form.Item
const TextArea = Input.TextArea


const ReasonModal = Form.create()(({
  visible,
  onVisible,
  onConfirm,
  title,
  intro,
  reasonDefault,
  reasonLabel,
  reasonRequired,
  reasonError,
  form,
}) => {

  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return
      form.resetFields()
      onConfirm(fieldsValue)
    })
  }

  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={e => onVisible(false)}
      onOk={okHandle}
    >
      <div className="intro">
        {intro}
      </div>
      <div className="reason">
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} label={reasonLabel}>
          {form.getFieldDecorator('reason', {
            rules: [{
              required: !!reasonRequired,
              message: reasonError,
            }],
            initialValue: reasonDefault
          })(<TextArea placeholder="请输入"  />)}
        </FormItem>
      </div>
    </Modal>
  )
})


export interface Props {
    
}

@inject(stores => {
  const { accountStore, letterStore } = stores.store
  const { letterData } = letterStore
  const { currentUser } = accountStore

  return {
    accountStore,
    currentUser,

    letterStore,
    letterData,
  }
})
@observer
export default class LetterBox extends Component {
  constructor(props) {
    super(props)

    this.state = {

      shieldVisible: false,
      accusationVisible: false,
    }
  }
  
  componentDidMount() {
    // this.requestCurrent()
    this.requestLetters()
  }

  requestLetters(option={}) {
    const { letterStore, letterData, currentUser } = this.props
    letterStore.fetchLetters({
      authorId: currentUser.authorId,
      page: letterData.page || 1,
      size: letterData.size || 10,
      ...option,
    })
  }

  requestCurrent() {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (token) {
      const { accountStore } = this.props
      accountStore.fetchGetClientCurrent()
    }
  }

  handleOpenChat = (record) => {
    const { letterStore, currentUser } = this.props
    const isSender = record.sender
    const receiverName = isSender ? record.receiverName : record.senderName
    const receiverNickName = isSender ? record.receiverNickName : record.senderNickName
    const receiverType = isSender ? record.receiverType : record.senderType
    const receiverId = isSender ? record.receiverId : record.senderId
    const receiverAvatar = isSender ? record.receiverAvatar : record.senderAvatar
    const senderId = isSender ? record.senderId : record.receiverId
    const senderType = isSender ? record.senderType : record.receiverType
    const senderAvatar = isSender ? record.senderAvatar : record.receiverAvatar
    
    letterStore.open({
      type: LetterSendType.REPLY, //回复私信
      // authorId: currentUser.authorId,
      parentId: record.id,
      source: record.source,
      receiverName,
      receiverNickName,
      receiverType,
      receiverId,
      receiverAvatar,
      senderId,
      senderType,
      senderAvatar,
    })
  }
  

  handlePagination = (page, size) => {
    this.requestLetters({ page, size, })
  }

  handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '您是否确认删除该对话？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const { letterStore, currentUser } = this.props
        letterStore.deleteLetter({
          id,
          authorId: currentUser.authorId,
        })
      }
    });
  }

  handleShield = (record) => {
    this.setState({currentRecord: record})
    this.handleShieldVisible(true)
  }

  handleShieldVisible = (flag) => {
    this.setState({shieldVisible: !!flag});
  }

  submitShield = (fields) => {
    const { letterStore } = this.props
    const record = this.state.currentRecord
    const id = record.sender ? record.receiverId : record.senderId
    const type = record.sender ? record.receiverType : record.senderType
    letterStore.shieldLetter({
      id,
      type,
      reason: fields.reason,
    }, (res) => {
      if (res.success) {
        message.destroy()
        message.success('屏蔽成功')
        this.handleShieldVisible(false)
      }
    })

    // Modal.confirm({
    //   title: '您是否确认屏蔽该作者私信？',
    //   okText: '确认',
    //   cancelText: '取消',
    //   onOk: () => {
    //     letterStore.shieldLetter({
    //       id,
    //       type,
    //       reason: fields.reason,
    //     }, (res) => {
    //       if (res.success) {
    //         message.destroy()
    //         message.success('屏蔽成功')
    //         this.handleShieldVisible(false)
    //       }
    //     })
    //   }
    // })
  }

  handleAccusation = (record) => {
    this.setState({currentRecord: record})
    this.handleAccusationVisible(true)
  }

  handleAccusationVisible = (flag) => {
    this.setState({accusationVisible: !!flag})
  }

  submitAccusation = (fields) => {
    const { letterStore, currentUser } = this.props
    const {currentRecord: record} = this.state
    letterStore.accusationLetter({
      id: record.lastMessageId,
      reason: fields.reason,
      authorId: currentUser.authorId,
    }, (res) => {
      if (res.success) {
        message.destroy()
        message.success('举报成功')
        this.handleAccusationVisible(false)
      }
    })
  }

  render() {
    const { 
      currentUser,

      letterData,
    } = this.props
    const {
      shieldVisible,
      accusationVisible,
    } = this.state

    const letterList = letterData.list || []
    const isLoading = letterData.isLoading
    const isLoaded = letterData.isLoaded
    const hasLetters = isLoaded && letterList.length > 0
    const pageIndex = letterData.page || 1
    const pageSize = letterData.size || 20
    const total = letterData.total || 0


    return (
      <div className="user-comment-container">
        <div className="comment-box-wrapper">
            {isLoading && <div className="load-spining"><Spin /></div>}
            {hasLetters ?
            <div className="comment-box">
              <article className="comment-main">
                <ul className="comment-list">
                  {letterList.map((item, index) => {
                    return <LetterItem
                            key={index}
                            item={item}
                            onChat={this.handleOpenChat}
                            onDelete={this.handleDelete}
                            onShield={this.handleShield}
                            onAccusation={this.handleAccusation}
                          />
                  })}
                </ul>
                <div className="comment-footer">
                    <Pagination
                      showQuickJumper
                      hideOnSinglePage
                      defaultCurrent={pageIndex}
                      current={pageIndex}
                      pageSize={pageSize}
                      total={total}
                      onChange={this.handlePagination}
                    />
                </div>
              </article>
            </div>
            : <EmptyComponent text='暂无私信' />}
        </div>
        <ReasonModal
          title="屏蔽"
          reasonLabel="屏蔽理由"
          visible={shieldVisible}
          onVisible={this.handleShieldVisible}
          onConfirm={this.submitShield}
        />
        <ReasonModal
          title="举报用户"
          reasonLabel="举报理由"
          reasonRequired
          reasonError="请输入举报理由"
          visible={accusationVisible}
          onVisible={this.handleAccusationVisible}
          onConfirm={this.submitAccusation}
        />
      </div>
    )
  }
}