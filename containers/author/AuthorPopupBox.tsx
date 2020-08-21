import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { toJS } from 'mobx'
import classnames from 'classnames'
import { Avatar, Button, message, Tooltip } from 'antd'
import jsCookie from 'js-cookie'
import isEqual from 'lodash/isEqual'

import { config } from '@utils'
import { FollowTypes, ActionType, LetterSendType, LetterSenderTypes, LetterReceiverTypes, LetterSources, EditionType, AuthorType } from '@base/enums'

import UserIdentity from '@components/widget/common/UserIdentityComp'
import AuthorEditionTag from '@components/author/AuthorEditionTag'
import AuthorAuthenticationIcon from '@components/author/AuthorAuthenticationIcon'


@inject(({store}) => ({
  authorStore: store.authorStore,
  letterStore: store.letterStore,
  currentUser: store.accountStore.currentUser,
}))
@observer
export default class AuthorPopupBox extends Component {
  state = {
    authorInfo: {},

    loading: false,
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!!nextProps.authorInfo && !isEqual(nextProps.authorInfo, prevState.authorInfo)) {
      return {
        authorInfo: {
          ...prevState.authorInfo,
          followed: nextProps.authorInfo.followed,
        }
      }
    }
    return null
  }

  componentDidMount() {
    this.requestAuthorInfo()
    
  }

  async requestAuthorInfo() {
    const { authorStore, code, onLoad, authorInfo } = this.props
    if (authorInfo) {
      this.setState({authorInfo})
    }
    if (code) {
      this.setState({loading: true})
      const response = await authorStore.fetchAuthorPopup({code})
      this.setState({loading: false})
      if (response.success) {
        const data = response.data || {}
        this.setState({authorInfo: data})
        if (onLoad && response.data) onLoad(true)
      }
    }
  }

  handleFollow = () => {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if(!token) {
      message.destroy()
      message.warn('请登录后关注')
      window.location.href = `/signin?c=${window.location.pathname}`
      return
    }

    this.toFollow()
  }

  async toFollow() {
    const { authorStore, onFollow, onAfterFollowed } = this.props
    const { authorInfo } = this.state
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    const nextAction = authorInfo.followed ? ActionType.UNFOCUS : ActionType.FOCUS

    if (onFollow) {
      onFollow(nextAction)
      return
    }

    const param = {
      type: FollowTypes.AUTHOR,
      id: authorInfo.id,
      action: nextAction,
      token,
      client_code,
    }
    const response = await authorStore.fetchFollow(param)
    message.destroy()
    if (response.success && response.data) {
      this.setState({
        authorInfo: {
          ...authorInfo,
          followed: !!nextAction,
        }
      })
      if (onAfterFollowed) onAfterFollowed(param)
      message.success('已关注作者')
    } else {
      message.success('已取消关注')
    }
  }
  
  handleMessage = () => {
    // message.destroy()
    // message.warn('私信功能暂未开通')
    const { letterStore, currentUser, compositionId } = this.props
    const { authorInfo } = this.state
    const author = authorInfo || {}
    
    letterStore.openEnquiry({
      type: LetterSendType.SEND,
      senderType: LetterSenderTypes.USER, // 1梅花网用户 2 创作者 3 游客
      // senderAvatar: currentUser.avatar,
      receiverType: LetterReceiverTypes.AUTHOR,
      receiverId: author.id,
      // receiverNickName: author.nickname,
      source: LetterSources.AUTHOR_CARD,
      relationId: compositionId,
    })
    // letterStore.open({
    //   type: LetterSendType.SEND,
    //   senderType: LetterSenderTypes.USER, // 1梅花网用户 2 创作者
    //   senderAvatar: currentUser.avatar,
    //   receiverType: LetterReceiverTypes.AUTHOR,
    //   receiverId: author.id,
    //   receiverNickName: author.nickname,
    //   source: LetterSources.AUTHOR_CARD,
    // })
  }

  render() {
    const { authorInfo } = this.state
    const { hideBtns } = this.props

    const showEnquiry = [AuthorType.PERSONAL, AuthorType.SERVER].includes(authorInfo.type)

    return (
      <div className="author-popup-box">
          <div className="author-avatar">
          <a href={`/author/${authorInfo.code}`} target="_blank"><Avatar size={80} src={authorInfo.avatar} /></a>
          </div>
          <div className="author-name">
            <Tooltip title={authorInfo.nickname}>
            <a href={`/author/${authorInfo.code}`} target="_blank">{authorInfo.nickname}</a>
            </Tooltip><AuthorAuthenticationIcon hide={!authorInfo.editionType || authorInfo.editionType === EditionType.FREE} style={{marginLeft: '6px'}} />
          </div>
          <div className="author-type">
              <UserIdentity currentType={authorInfo.type} editionType={authorInfo.editionType} />
              {/* <AuthorEditionTag editionType={authorInfo.editionType || EditionType.FREE} style={{marginLeft: '6px'}} /> */}
          </div>
          <div className="author-area">
            {authorInfo.provinceName}{authorInfo.cityName && `/${authorInfo.cityName}`}
          </div>
          <div className="author-composition">
              <div className="count-item">
                <div>
                    <Tooltip title={`作品: ${authorInfo.worksQuantity || 0}`}>
                    <a href={`/author/${authorInfo.code}/shots`} target="_blank">
                      <div className="composition-name">作品</div>
                      <div className="composition-count">{authorInfo.worksQuantity || 0}</div>
                  </a>
                    </Tooltip>
                </div>
              </div>
              <div className="carve-line">|</div>
              <div className="count-item">
                <div>
                  <Tooltip title={`文章: ${authorInfo.articleQuantity || 0}`}>
                  <a href={`/author/${authorInfo.code}/article`} target="_blank">
                  <div className="composition-name">文章</div>
                  <div className="composition-count">{authorInfo.articleQuantity || 0}</div>
                  </a>
                 </Tooltip>
                </div>
              </div>
          </div>
          {!hideBtns &&
          <div className="btns">
              <Button 
                className={classnames('btn-follow', {followed: authorInfo.followed})}
                onClick={this.handleFollow}
              >
                {authorInfo.followed ? '已关注' : '关注'}
              </Button>
              {showEnquiry && <Button className="btn-enquiry" type="primary" onClick={this.handleMessage}>询价</Button>}
          </div>}
      </div>
    )
  }
}