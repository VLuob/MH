import { Component } from 'react'
import { toJS } from 'mobx'
import classnames from 'classnames'
import { Button, Tag, Icon, Avatar, Tooltip } from 'antd'
import AuthorIdentity from '@components/widget/common/UserIdentityComp'
import CIcon from '@components/widget/common/Icon'
import AuthorEditionTag from '@components/author/AuthorEditionTag'
import AuthorAuthenticationIcon from '@components/author/AuthorAuthenticationIcon'
import { AuthorType, CompositionTypes, ActionType, EditionType } from '@base/enums'



export default class TopAuthorItem extends Component {

  render() {
    const { author, onFollow, onMessage, onCard, cardIcon } = this.props
    const latestWorks = author.latestWorks || []
    const latestArticles = author.latestArticles || []
    const latestCompositions = [...latestWorks, ...latestArticles].slice(0, 2)
    let areaName = author.provinceName || ''
    areaName += author.cityName ? `/${author.cityName}` : ''

    const nextAction = author.followed ? ActionType.UNFOCUS : ActionType.FOCUS
    const btnFollowText = author.followed ? '已关注' : '关注'
    const mbFollowText = author.followed ? '已关注' : '+ 关注'

    const hideEnquiry = [AuthorType.BRANDER, AuthorType.EDITOR].includes(author.type)

    return (
      <div className="top-author-item">
        <span className={classnames('follow-mb', {followed: author.followed})} onClick={e => onFollow(author.id, nextAction)}>{mbFollowText}</span>
        <div className="info-box">
          <div className="avatar">
            <a href={`/author/${author.code}`} target="_blank"><Avatar icon="user" size={100} src={author.avatar} /></a>
          </div>
          <div className="info">
            <div className="name">
              <Tooltip title={author.nickname}><a href={`/author/${author.code}`} target="_blank">{author.nickname}</a></Tooltip>
              <AuthorAuthenticationIcon hide={!author.editionType || author.editionType === EditionType.FREE} style={{marginLeft: '6px'}} />
              <a className="btn-icon-card" onClick={onCard}>
                {cardIcon}
              </a>
            </div>
            <div className="intro">
              <AuthorIdentity currentType={author.type} editionType={author.editionType} /> <span className="area">{areaName}</span>
            </div>
            <div className="stat">
              <span className="stat-item">
                <Tooltip title={`作品：${author.works}`}><a href={`/author/${author.code}/shots`} target="_blank">作品 <span className="count">{author.works}</span></a></Tooltip>
              </span>
              <span className="stat-item">
              <Tooltip title={`文章：${author.articles}`}><a href={`/author/${author.code}/article`} target="_blank">文章 <span className="count">{author.articles}</span></a></Tooltip>
              </span>
              <span className="stat-item">
              {/* <Tooltip title={`粉丝：${author.fans}`}><a href={`/author/${author.code}/followers`} target="_blank">粉丝 <span className="count">{author.fans}</span></a></Tooltip> */}
              <Tooltip title={`粉丝：${author.fans}`}><a>粉丝 <span className="count">{author.fans}</span></a></Tooltip>
              </span>
            </div>
            <div className="btns">
              <Button className={classnames({'btn-message': author.followed})} onClick={e => onFollow(author.id, nextAction)}>{btnFollowText}</Button>
              {!hideEnquiry && <Button type="primary" onClick={e => onMessage(author)} >询价</Button>}
            </div>
            {/* <a className="btn-icon-card" onClick={onCard}>
              {cardIcon}
            </a> */}
          </div>
        </div>
        <div className="cover-box">
          {latestCompositions.map(item => (
            <div 
              className="cover" 
              key={item.compositionId}
            >
              <Tooltip title={`${item.type === CompositionTypes.SHOTS ? '作品' : '文章'}：${item.title}`}>
                <a 
                  href={`/${item.type === CompositionTypes.SHOTS ? 'shots' : 'article'}/${item.compositionId}`} 
                  target="_blank"
                  title={item.title}
                >
                  <img 
                    src={`${item.cover}?imageMogr2/thumbnail/!504x360r/size-limit/50k/gravity/center/crop/504x360`} 
                    alt={item.title}
                    title={item.title}
                  />
                </a>
              </Tooltip>
            </div>
          ))}
        </div>
      </div>
    )
  }
}