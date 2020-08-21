import { Component } from 'react'
import dynamic from 'next/dynamic'
import { message } from 'antd'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import jsCookie from 'js-cookie'
import { AuthorType, FollowTypes, LetterSendType, LetterSenderTypes, LetterReceiverTypes, LetterSources } from '@base/enums'
import { config } from '@utils'

// import LoadMore from '@components/common/LoadMore'
import DetailHeader from '@components/author/DetailHeader'
import AuthorItem from '@containers/author/AuthorItem'

import './index.less'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
  loading: () => <p></p>,
  ssr: false
})

let num = 3
@inject(stores => {
  const { followStore, letterStore, accountStore } = stores.store
  const { followAuthorData } = followStore
  const { currentUser } = accountStore

  return {
    letterStore,
    followStore,
    followAuthorData,
    currentUser,
  }
})
@observer
export default class FollowAuthorBox extends Component {
  componentDidMount() {
    this.requestAuthors()
  }

  requestAuthors({ page, size } = {}) {
    const { followStore } = this.props
    followStore.fetchFollowAuthors({
      page: page || 1,
      size: size || 10,
    })
  }

  handleNext = () => {
    const { followAuthorData } = this.props
    this.requestAuthors({ page: followAuthorData.page + 1 })
  }

  handleAuthorFollow = (id, action) => {
    const { followStore } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    if (!token) {
      window.location.href = `/signin?c=${window.location.href}`
      return
    }
    followStore.fetchFollowAuthor({
      id,
      action,
      type: FollowTypes.AUTHOR,
      token,
      client_code,
    })
  }

  handleMessage = (author) => {
    const { letterStore, currentUser } = this.props
    // console.log(toJS(author))

    letterStore.open({
      type: LetterSendType.SEND,
      senderType: LetterSenderTypes.USER, // 1梅花网用户 2 创作者
      senderAvatar: currentUser.avatar,
      receiverType: LetterReceiverTypes.AUTHOR,
      receiverId: author.id,
      receiverNickName: author.nickname,
      source: LetterSources.USER_CENTER_FOLLOW,
    })
  }

  handleEnquiry = (author) => {
    const { letterStore, currentUser } = this.props
    // console.log(toJS(author))

    letterStore.openEnquiry({
      type: LetterSendType.SEND,
      senderType: LetterSenderTypes.USER, // 1梅花网用户 2 创作者
      senderAvatar: currentUser.avatar,
      receiverType: LetterReceiverTypes.AUTHOR,
      receiverId: author.id,
      receiverNickName: author.nickname,
      source: LetterSources.USER_CENTER_FOLLOW,
      relationId: author.id,
    })
  }

  render() {
    const { followAuthorData } = this.props
    const authorList = followAuthorData.list || []
    const { isLastPage, isLoading, isLoaded, total } = followAuthorData

    return (
      <div className='author-container user-author'>
        <DetailHeader meta={`共关注了${total}个创作者`} />
        <div className='prod-box'>
          <div className="author-list" >
            {authorList.map(item => {
              return (
                <AuthorItem
                  key={item.id}
                  item={item}
                  source={LetterSources.USER_CENTER_FOLLOW}
                  // onFollow={this.handleAuthorFollow}
                  // onMessage={this.handleMessage}
                  // onEnquiry={this.handleEnquiry}
                />
              )
            })}
          </div>
          {!isLastPage && isLoaded && <LoadMore name={`加载更多`} num={num}
            reqList={this.handleNext} />}
        </div>
      </div>
    )
  }
}