import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import dynamic from 'next/dynamic'

import { Tabs, Icon, message } from 'antd'
import { MessageType } from '@base/enums'
import { Router } from '@routes'

import PartLoading from '@components/features/PartLoading'

const MessageBoxNoSSR = dynamic(() => import('./MessageBox'), {loading: () => <PartLoading />, ssr: false})

const { TabPane } = Tabs

const getKeyType = (key) => {
  let type
  switch (key) {
    case 'comment':
      type = MessageType.COMMENT      
      break
    case 'favor':
      type = MessageType.FAVOR
      break
    case 'follow':
      type = MessageType.FOLLOW
      break
    case 'collection':
      type = MessageType.COLLECTION
      break
    case 'notice':
      type = MessageType.NOTICE
      break
    default:
      type = MessageType.ALL
      break
  }
  return type
}

const getTypeKey = (type) => {
  let key
  switch (type) {
    case MessageType.COMMENT:
      key = 'comment' 
      break
    case MessageType.FAVOR:
      key = 'favor'
      break
    case MessageType.FOLLOW:
      key = 'follow'
      break
    case MessageType.COLLECTION:
      key = 'collection'
      break
    case MessageType.NOTICE:
      key = 'notice'
      break
    default:
      key = ''
      break
  }
  return key
}

@inject(stores => {
  const { messageStore, letterStore } = stores.store
  const { messageStat } = messageStore
  return {
    letterStore,
    messageStore,
    messageStat,
  }
})
@observer
export default class MessageContainer extends Component {
  state = {
    type: MessageType.ALL,
  }

  componentDidMount() {
    const { messageStore, query } = this.props

    const type = getKeyType(query.tab)

    this.setState({type})
    messageStore.fetchMessageStat()
    this.requestMessages({type})
  }

  requestMessages(option={}) {
    const { messageStore, letterStore } = this.props
    const { type } = this.state
    messageStore.fetchMessages({
      type,
      page: 1,
      size: 10,
      ...option,
    }).then(res => {
      // messageStore.fetchMessageStat()
      letterStore.fetchUnreadLetters()
    })
  }

  handleTabChange = (key) => {
    const type = Number(key)
    this.requestMessages({type})
    this.setState({type})
    const tabKey = getTypeKey(type)
    Router.pushRoute(tabKey ? `/personal/message/${tabKey}` : `/personal/message`)
  }

  renderDot(count) {
    return count > 0 ? <span className="dot-count">{count}</span> : ''
  }

  render() {
    const { messageStat } = this.props
    const { type } = this.state

    return (
      <div className='common-container user-message'>
          <div className="user-header">
              <div className="title">我的消息</div>
          </div>
          <Tabs className='user-tabs' size='large' activeKey={String(type)} animated={false} onChange={this.handleTabChange}>
              <TabPane tab={<span className="tab-text">全部</span>} key={String(MessageType.ALL)}>
              {type === MessageType.ALL && <MessageBoxNoSSR type={type} />}
              </TabPane>
              <TabPane tab={<span className="tab-text">评论{this.renderDot(messageStat.commentCount)}</span>} key={String(MessageType.COMMENT)}>
              {type === MessageType.COMMENT && <MessageBoxNoSSR type={type} />}
              </TabPane>
              <TabPane tab={<span className="tab-text">喜欢{this.renderDot(messageStat.favorCount)}</span>} key={String(MessageType.FAVOR)}>
              {type === MessageType.FAVOR && <MessageBoxNoSSR type={type} />}
              </TabPane>
              <TabPane tab={<span className="tab-text">关注{this.renderDot(messageStat.followCount)}</span>} key={String(MessageType.FOLLOW)}>
              {type === MessageType.FOLLOW && <MessageBoxNoSSR type={type} />}
              </TabPane>
              <TabPane tab={<span className="tab-text">收藏{this.renderDot(messageStat.collectionCount)}</span>} key={String(MessageType.COLLECTION)}>
              {type === MessageType.COLLECTION && <MessageBoxNoSSR type={type} />}
              </TabPane>
              <TabPane tab={<span className="tab-text">通知{this.renderDot(messageStat.sysCount)}</span>} key={String(MessageType.NOTICE)}>
              {type === MessageType.NOTICE && <MessageBoxNoSSR type={type} />}
              </TabPane>
          </Tabs>
      </div>
    )
  }
}