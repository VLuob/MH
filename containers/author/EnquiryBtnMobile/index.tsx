import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import jsCookie from 'js-cookie'

import { Button } from 'antd'

import { ActionType, AuthorType, EditionType, FollowTypes, LetterSendType, LetterSources, LetterSenderTypes, LetterReceiverTypes } from '@base/enums'
import { config } from '@utils'

import CustomIcon from '@components/widget/common/Icon'
import ShareDropPanel from '@containers/common/ShareDropPanel'

import './index.less'

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
class AuthorEnquiryBtnMobile extends Component {

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

    return (
      <div className="author-detail-enquiry-btn-fixed">
        <div className="enquiry-btn" onClick={this.handleEnquiry}>
          <CustomIcon name="enquiry" />
        </div>
      </div>
    )
  }
}

export default AuthorEnquiryBtnMobile