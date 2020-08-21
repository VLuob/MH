import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import classnames from 'classnames'
import ReactTooltip from 'react-tooltip'
import jsCookie from 'js-cookie'
import { Icon, Button, Avatar } from 'antd'

import { ActionType, AuthorType, EditionType, FollowTypes, LetterSendType, LetterSources, LetterSenderTypes, LetterReceiverTypes } from '@base/enums'
import { utils, config } from '@utils'
import { toJS } from 'mobx'

import IntroBox from '@components/author/IntroBox'
import SiderBox from '@components/widget/common/SiderBox'
import PartLoading from '@components/features/PartLoading'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'
import CustomIcon from '@components/widget/common/Icon'
import AuthorItemSmall from '@components/author/AuthorItemSmall'
import ArticleItemSmall from '@components/article/ArticleItemSmall'

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
export default class AuthorSider extends Component {
  state = {
    descEllipsis: true
  }

  handleDescEllipsis = () => {
    this.setState({ descEllipsis: !this.state.descEllipsis })
  }

  handleFollow = item => {
    const { query, fetchSideActionFollow } = this.props
    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    let action = ActionType.FOCUS

    if (item.followed) {
      action = ActionType.UNFOCUS
    } else {
      action = ActionType.FOCUS
    }

    // fetchSideActionFollow({ client_code, id: item.id, type: item.type, action })
    fetchSideActionFollow({ client_code, id: item.id, type: FollowTypes.AUTHOR, action })
  }

  authorFollow = () => {
    const { query, briefInfo, fetchSideActionFollow } = this.props
    const { id, code, type } = query
    let action = ActionType.FOCUS

    if (briefInfo.followed) {
      action = ActionType.UNFOCUS
    } else {
      action = ActionType.FOCUS
    }

    // fetchSideActionFollow({ id: briefInfo.id, type: briefInfo.type, action })
    fetchSideActionFollow({ id: briefInfo.id, type: FollowTypes.AUTHOR, action })
  }

  authorMessage = () => {
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

    // letterStore.open({
    //     type: LetterSendType.SEND,
    //     senderType: LetterSenderTypes.USER, // 1梅花网用户 2 创作者
    //     senderAvatar: currentUser.avatar,
    //     receiverType: LetterReceiverTypes.AUTHOR,
    //     receiverId: author.id,
    //     receiverNickName: author.nickname,
    //     source: LetterSources.ARTICLE_DETAIL,
    // })
  }

  render() {
    const { query, briefInfo, isMobileScreen } = this.props
    const { descEllipsis } = this.state
    const { code } = query
    const authorInfo = briefInfo
    const edition = authorInfo.edition || { editionType: EditionType.FREE }
    const currentUser = this.props.currentUser || {}
    const orgAndMemberList = authorInfo.type === AuthorType.INSTITUTION ? authorInfo.orgList : authorInfo.memberList
    const selfCodes = currentUser && currentUser.author && currentUser.author.code
    const isSelf = selfCodes === code || authorInfo.currentUserOrg
    const isEditor = authorInfo.type === AuthorType.EDITOR
    const isLogin = !!currentUser.id
    const isSelfAuthor = currentUser.id === authorInfo.userId
    const showRank = !isEditor && !!authorInfo.rank
    const showRanking = !isEditor && (authorInfo.ranking || []).length > 0
    const rankingItem = (authorInfo.ranking || [])[0] || {}

    const authorAreas = []
    if (authorInfo.provinceName) {
      authorAreas.push(authorInfo.provinceName)
    }
    if (authorInfo.cityName) {
      authorAreas.push(authorInfo.cityName)
    }

    // console.log('author info',toJS(authorInfo))
    const cutLength = 86
    const enProfileLength = utils.getStringLength(authorInfo.profile || '')
    // const cnProfileLength = Math.ceil(enProfileLength / 2)
    const isExcess = enProfileLength > cutLength
    let profile = authorInfo.profile
    if (descEllipsis && isExcess) {
      profile = utils.getSubstr(profile, cutLength)
    }

    let hideFollow = false
    if (typeof window !== 'undefined') {
      hideFollow = window.innerWidth <= 320
    }

    // console.log(toJS(rankingItem))

    return (
      <>
        {isMobileScreen ?
          <div className="mb-author-info-box">
            <div className="author-info-wrapper">
              <div className="author-avatar">
                <Avatar size={70} src={authorInfo.avatar} />
              </div>
              <div className="author-info-content">
                <div className="author-info-group">
                  <div className="author-nickname">
                    {authorInfo.nickname}
                  </div>
                  <div className="author-intro">
                    <UserIdentityComp currentType={authorInfo.type} editionType={edition.editionType} />
                    <span className="author-area">
                      {authorAreas.join('/')}
                    </span>
                  </div>
                </div>
                {!hideFollow && <div className="author-info-actions">
                  <Button className={authorInfo.followed ? 'followed' : 'no-follow'} onClick={this.authorFollow}>{authorInfo.followed ? '已关注' : '关注'}</Button>
                </div>}
              </div>
            </div>
            <div className="author-desc-box">
              <div className="author-desc-wrapper">
                <div className="author-desc">
                  {profile || ''}
                </div>
                {authorInfo.profile && isExcess && <div className="btn-show-more" onClick={this.handleDescEllipsis}>
                  {descEllipsis ? <span>展开 <CustomIcon name="arrow-down-o" /></span> : <span>收起 <CustomIcon name="arrow-up-o" /></span>}
                </div>}
              </div>
            </div>
          </div>
          : <div className='user-info-box'>
            <div className='user-brief-box'>
              <IntroBox
                isSelf={isSelf}
                isSelfAuthor={isSelfAuthor}
                isLogin={isLogin}
                id={authorInfo.id}
                code={authorInfo.code}
                authorInfo={authorInfo}
                currentUserOrg={authorInfo.currentUserOrg}
                createTime={authorInfo.gmtCreate}
                avatar={authorInfo.avatar}
                name={authorInfo.nickname}
                city={authorInfo.cityName}
                // netAge={authorInfo.degree}
                intro={authorInfo.signature}
                onFollow={this.authorFollow}
                followed={authorInfo.followed}
                type={Number(authorInfo.type)}
                follow={authorInfo.fans}
                onMessage={this.authorMessage}
                provice={authorInfo.provinceName}
                article={authorInfo.articleCount}
                production={authorInfo.compositionCount}
              />
              <div className='user-data-box'>
                <ul className='user-data-list'>
                  <li>作品浏览量合计 <Icon type='question-circle' className='mention-icon' data-for={`user-data-list-tips`} data-tip={`已发布作品的累计浏览量`} /><span className='count'>{authorInfo.views}</span></li>
                  <li>作品喜欢量合计 <Icon type='question-circle' className='mention-icon' data-for={`user-data-list-tips`} data-tip={`已发布作品的累计喜欢数`} /><span className='count'>{authorInfo.favorCount || 0}</span></li>
                  {showRank && <li>创作者总排行榜 <Icon type='question-circle' className='mention-icon' data-for={`user-data-list-tips`} data-tip={`基于作品浏览量、喜欢数、收藏量、评论量的全站排行`} /><a className='count' href="/top/author!10" target="_blank">第{authorInfo.rank || 0}名</a></li>}
                  {showRanking && <li>创作者周排行榜 <Icon type='question-circle' className='mention-icon' data-for={`user-data-list-tips`} data-tip={`基于作品浏览量、喜欢数、收藏量、评论量的全站一周排行`} /><a className='count' href={`/top/author!${rankingItem.rankingListType}!${rankingItem.id}`} target="_blank">第{rankingItem.rankingNum || 1}期第{rankingItem.ranking || 0}名</a></li>}
                  <ReactTooltip id={`user-data-list-tips`} effect='solid' place='top' />
                </ul>
                {/* <div className="user-website">
                        <div className="user-website-title">独立官网</div>
                        <div className="user-website-content">
                            <a href={``} target="_blank"><Avatar size={24} src={authorInfo.avatar} /> <span className="nickname">{authorInfo.nickname}</span></a>   
                        </div>
                    </div> */}
                {authorInfo.profile && <SiderBox
                  title='关于'
                  moreUrl={`/author/${authorInfo.code}/about`}
                  hideMore={!(authorInfo.profile && authorInfo.profile.length > 0)}
                >
                  <pre className='sider-about-intro six-ellipsis'>
                    {authorInfo.profile || ''}
                  </pre>
                </SiderBox>}
                {orgAndMemberList && orgAndMemberList.length > 0 && <SiderBox
                  title={Number(authorInfo.type) === AuthorType.INSTITUTION ? '机构成员' : '加入机构'}
                  moreUrl=''
                  hideMore={!(orgAndMemberList && orgAndMemberList.length > 0)}
                >
                  {(orgAndMemberList && orgAndMemberList.length > 0) ?
                    <ul className='sider-author-list'>
                      {orgAndMemberList && orgAndMemberList.map(item => {
                        return (
                          <AuthorItemSmall
                            item={item}
                            key={item.id}
                            authorCode={item.code}
                            avatar={item.avatar}
                            title={item.nickname}
                            production={item.compositionCount || 0}
                            article={item.articleCount || 0}
                            member={item.members || 0}
                            onFollow={e => this.handleFollow(item)}
                          />
                        )
                      })}
                    </ul> :
                    <div className='sider-about-intro'>
                      {'暂无信息'}
                    </div>
                  }
                </SiderBox>}
                {(authorInfo.compositionList && authorInfo.compositionList.length > 0) && <SiderBox title='文章' moreUrl={`/author/${authorInfo.code}/article`}
                  hideMore={!(authorInfo.compositionList && authorInfo.compositionList.length > 0)}
                >
                  {(authorInfo.compositionList && authorInfo.compositionList.length > 0) ?
                    <ul className='side-article-list'>
                      {authorInfo.compositionList && authorInfo.compositionList.map(l => {
                        const timeago = utils.timeago(l.gmtPublished)
                        return (
                          <ArticleItemSmall
                            key={l.id}
                            img={l.cover}
                            title={l.title}
                            author={l.author}
                            timeago={timeago}
                            id={l.id || l.compositionId}
                            code={l.authorCode}
                          />
                        )
                      })}
                    </ul> :
                    <div className='sider-about-intro'>
                      {'暂无信息'}
                    </div>
                  }
                </SiderBox>}
              </div>
            </div>
          </div>}
      </>
    )
  }
}