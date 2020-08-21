import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import jsCookie from 'js-cookie'

import { Button } from 'antd'

import { ActionType, AuthorType, EditionType, FollowTypes, LetterSendType, LetterSources, LetterSenderTypes, LetterReceiverTypes } from '@base/enums'
import { config } from '@utils'

import CustomIcon from '@components/widget/common/Icon'
import ShareDropPanel from '@containers/common/ShareDropPanel'

import './AuthorBottomBar.less'

@inject(stores => {
  const { authorStore, letterStore, accountStore, globalStore } = stores.store
  const { isMobileScreen } = globalStore
  const { 
      briefInfo, 
      authorInfos,
      changeBriefInfo, 
      fetchSideActionFollow, 
      fetchGetClientAuthorCommon 
  } = authorStore
  const { currentUser } = accountStore

  return {
      letterStore,
      isMobileScreen,
      currentUser,
      briefInfo,
      authorInfos,
      changeBriefInfo,
      fetchSideActionFollow,
      fetchGetClientAuthorCommon,
  }
})
@observer
class AuthorBottomBar extends Component {

  handleFollow = () => {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (!token) {
      location.href = `/signin?c=${encodeURIComponent(location.href)}`
      return
    }

    const { query={}, briefInfo={}, fetchSideActionFollow } = this.props
    const author = briefInfo
    let action = ActionType.FOCUS

    if(author.followed) {
        action = ActionType.UNFOCUS
    } else {
        action = ActionType.FOCUS
    }

    fetchSideActionFollow({ id: author.id, type: FollowTypes.AUTHOR, action })
  }

  handleEnquiry = () => {
      const { letterStore, currentUser, briefInfo } = this.props
      const author = briefInfo || {}

      letterStore.openEnquiry({
          type: LetterSendType.SEND,
          senderType: LetterSenderTypes.USER, // 1梅花网用户 2 创作者
          // senderAvatar: currentUser.avatar,
          receiverType: LetterReceiverTypes.AUTHOR,
          receiverId: author.id,
          // receiverNickName: author.nickname,
          source: LetterSources.AUTHOR_DETAIL,
          relationId: author.id,
      })
  }
  render() {
    const { briefInfo } = this.props
    const author = briefInfo

    return (
      <div className="author-bottom-bar" id="author-detail-bottom-bar">
        <div className="operation-btns">
          <ShareDropPanel
            getPopupContainer={() => document.querySelector('#author-detail-bottom-bar')}
            exclude={['card']}
          >
            <div className="btn-wrapper">
              <CustomIcon name="share" />
              <div className="btn-text">分享</div>
            </div>
          </ShareDropPanel>
          {/* <div className="btn-wrapper" onClick={this.handleFollow}>
            <CustomIcon name="user1" />
            <div className="btn-text">{author.followed ? '已关注' : '关注'}</div>
          </div> */}
        </div>
        <div className="enquiry-btn" onClick={this.handleEnquiry}>
          <span>询价</span>
        </div>
      </div>
    )
  }
}

export default AuthorBottomBar