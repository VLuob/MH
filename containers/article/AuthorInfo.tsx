import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Spin, Avatar, Tag, Button, message } from 'antd'
import ReactTooltip from 'react-tooltip'
import moment from 'moment'
import jsCookie from 'js-cookie'
import { toJS } from 'mobx'
import classnames from 'classnames'
import debounce from 'lodash/debounce'

import SiderBox from '@components/widget/common/SiderBox'
import IntroBoxArticle from '@components/author/IntroBoxArticle'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'
import { AuthorType, FollowTypes, ActionType, LetterSendType, LetterSenderTypes, LetterReceiverTypes, LetterSources } from '@base/enums'
import { config } from '@utils'
import { user } from '@base/system'

export interface Props {
    
}

@inject(stores => {
  const { compositionStore, letterStore, accountStore } = stores.store
  const { authorInfo } = compositionStore
  const { currentUser } = accountStore

  return {
      compositionStore,
      letterStore,
      currentUser,
      authorInfo: authorInfo.info,
      isLoading: authorInfo.isLoading,
  }
})
@observer
export default class AuthorInfo extends Component<Props> {

  authorFollow = () => {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if(!token) {
      window.location.href = `/signin?c=${window.location.pathname}`
      return
    }
    const { compositionStore, authorInfo } = this.props
    const author = authorInfo.author || {}
    const id = author.id 
    const type = FollowTypes.AUTHOR
    const action = authorInfo.followed ? ActionType.UNFOCUS : ActionType.FOCUS
    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)

    compositionStore.fetchActionFollowAuthor({id, type, action, client_code})
  }

  authorMessage = () => {
    const { letterStore, authorInfo, currentUser, compositionId } = this.props
    const author = authorInfo.author || {}
    
    // letterStore.open({
    //   type: LetterSendType.SEND,
    //   senderType: LetterSenderTypes.USER, // 1梅花网用户 2 创作者
    //   senderAvatar: currentUser.avatar,
    //   receiverType: LetterReceiverTypes.AUTHOR,
    //   receiverId: author.id,
    //   receiverNickName: author.nickname,
    //   source: LetterSources.ARTICLE_DETAIL,
    // })
    letterStore.openEnquiry({
      type: LetterSendType.SEND,
      senderType: LetterSenderTypes.USER, // 1梅花网用户 2 创作者
      // senderAvatar: currentUser.avatar,
      receiverType: LetterReceiverTypes.AUTHOR,
      receiverId: author.id,
      // receiverNickName: author.nickname,
      source: LetterSources.ARTICLE_DETAIL,
      relationId: compositionId,
    })
  }

  render() {
    const { authorInfo, isLoading, fixed, navHide, isPreview, currentUser } = this.props
    // const { currentUser } = this.state
    // const currentAuthor = currentUser.author || {}
    const currentAuthor = currentUser || {}
    const author = authorInfo.author || {}
    const articleList = authorInfo.latestCompositions || []
    // const isSelf = currentAuthor.code === author.code || author.currentUserOrg
    const isSelf = Number(currentAuthor.authorId) === Number(author.id) || author.currentUserOrg

    // console.log('author info', toJS(authorInfo), toJS(currentAuthor), toJS(author))

    // let area = ''
    // if (author.provinceName && author.cityName) {
    //   area = author.provinceName + ' / ' + author.cityName
    // } else if (author.provinceName && !author.cityName) {
    //   area = author.provinceName
    // } else if (!author.provinceName && author.cityName) {
    //   area = author.cityName
    // } else {
    //   area = ''
    // }

    // console.log('preview author info', toJS(authorInfo))

    return (
      <div className='sider-author-info user-info-box'>
        <div 
          key="userinfobox"
          className={classnames(
            'user-brief-box',
            {fixed: fixed},
          )} 
          style={{top: navHide ? '20px' : '78px'}}
        >
          <IntroBoxArticle 
              hideNetAge
              isSelf={isSelf}
              id={author.id}
              code={author.code}
              authorInfo={author}
              currentUserOrg={author.currentUserOrg}
              createTime={author.gmtCreate}
              avatar={author.avatar}
              name={author.nickname}
              city={author.cityName}
              netAge={author.degree}
              intro={author.signature}
              onFollow={this.authorFollow}
              followed={authorInfo.followed}
              type={Number(author.type)}
              onMessage={this.authorMessage}
              provice={author.provinceName}
              follow={authorInfo['author-fans']}
              article={authorInfo['author-articles']}
              production={authorInfo['author-works']}
              hideFooter={isPreview}
              editionType={author.editionType}
          />
        </div>
        {
        //   <div className='author-info'>
        //     <div>
        //       <div className='avatar'>
        //         <a href={`/author/${author.code}`} target='_blank'>
        //           <Avatar icon='user' src={author.avatar} size={100} />
        //         </a>
        //       </div>
        //       <h2 className='user-name'>
        //           <a href={`/author/${author.code}`} target='_blank'><span>{author.nickname}</span></a>
        //       </h2>
        //       <div className="author-type"><UserIdentityComp isPerson={!isMechansim} /></div>
        //       {area && <div className='user-area'>{area}</div>}
        //     </div>
        //     <div>
        //       {hasData && <div className='user-data'>
        //           <a href={`/author/${author.code}/shots`} target="_blank" data-for={`box-user-data`} data-tip={`作品: ${authorInfo['author-works'] || 0}`}>作品 <strong>{authorInfo['author-works'] || 0}</strong></a> | <a href={`/author/${author.code}/article`} target="_blank" data-for={`box-user-data`} data-tip={`文章: ${authorInfo['author-articles'] || 0}`}>文章 <strong>{authorInfo['author-articles'] || 0}</strong></a> | <a href={`/author/${author.code}/followers`} target="_blank" data-for={`box-user-data`} data-tip={`粉丝: ${authorInfo['author-fans'] || 0}`}>粉丝 <strong>{authorInfo['author-fans'] || 0}</strong></a>
        //           <ReactTooltip id={`box-user-data`} effect='solid' place='top' />
        //       </div>}
        //       {author.signature && <div className="user-intro">{author.signature}</div>}
        //     </div>
        //     <div>
        //     {hasContact && <div className='user-contact'>
        //       <Button >私信</Button>
        //       {<Button type='primary' >关注</Button>}
        //       </div>}
        //     </div>
        // </div>
      }
      
        
        {!isPreview && 
        <SiderBox
          key="siderbox"
          title='创作者最新文章'
          moreUrl={`/author/${author.code}/article`}
        >
          <ul className='side-article-list'>
            {articleList.map(item => (
              <li key={item.compositionId}>
                  <h4><a href={`/article/${item.compositionId}`} target='_bland'>{item.title}</a></h4>
                  <div className='time'>
                    {moment(item.gmtCreate).format('YYYY-MM-DD')}
                  </div>
              </li>
            ))}
          </ul>
        </SiderBox>}
        {isLoading && 
        <div style={{height: '300px', textAdivgn: 'center'}}>
          <Spin />
        </div>}
      </div>
    )
  }
}