import { Component } from 'react'
import { toJS } from 'mobx'
import classnames from 'classnames'
import { Button, Tag, Icon, Avatar, Tooltip } from 'antd'
import AuthorIdentity from '@components/widget/common/UserIdentityComp'
import { AuthorType, CompositionTypes, ActionType } from '@base/enums'
import CIcon from '@components/widget/common/Icon'



export default class AuthorItem extends Component {

  render() {
    const { author, onFollow, onMessage, onEnquiry, onCard } = this.props
    const compositionList = (author.compositionList || []).slice(0, 2)
    let areaName = author.provinceName || ''
    areaName += author.cityName ? `/${author.cityName}` : ''

    const nextAction = author.followed ? ActionType.UNFOCUS : ActionType.FOCUS
    const btnFollowText = author.followed ? '已关注' : '关注'
    const showEnquiry = [AuthorType.PERSONAL, AuthorType.SERVER].includes(author.type)

    return (
      <div className="author-item">
        <div className="info-box">
          <div className="avatar">
            <a href={`/author/${author.code}`} target="_blank"><Avatar icon="user" size={100} src={author.avatar} /></a>
          </div>
          <div className="info">
            <div className="name"><Tooltip title={author.nickname}><a href={`/author/${author.code}`} target="_blank">{author.nickname}</a></Tooltip></div>
            <div className="intro">
              <AuthorIdentity currentType={author.type} editionType={author.editionType} /> <span className="area">{areaName}</span>
            </div>
            <div className="stat">
              <span className="stat-item">
                <Tooltip title={`作品：${author.compositionCount}`}><a href={`/author/${author.code}/shots`} target="_blank">作品 <span className="count">{author.compositionCount}</span></a></Tooltip>
              </span>
              <span className="stat-item">
              <Tooltip title={`文章：${author.articleCount}`}><a href={`/author/${author.code}/article`} target="_blank">文章 <span className="count">{author.articleCount}</span></a></Tooltip>
              </span>
              <span className="stat-item">
              <Tooltip title={`粉丝：${author.fans}`}><a href={`/author/${author.code}/followers`} target="_blank">粉丝 <span className="count">{author.fans}</span></a></Tooltip>
              </span>
            </div>
            <div className="btns">
              <Button className={classnames('btn-follow', {followed: author.followed})} type={author.followed ? null : 'primary'} onClick={e => onFollow(author.id, nextAction)}>{btnFollowText}</Button>
              {/* <Button className="btn-message" onClick={e => onMessage(author)} >私信</Button> */}
              {showEnquiry && <Button className="btn-message" onClick={e => onEnquiry(author)} >询价</Button>}
            </div>
            {/* <a className="btn-icon-card" onClick={onCard}><Tooltip title="分享卡片"><CIcon name="card" /></Tooltip></a> */}
          </div>
        </div>
        <div className="cover-box">
          {compositionList.map(item => (
            <div 
              className="cover" 
              key={item.id}
            >
              <Tooltip title={`${item.type === CompositionTypes.SHOTS ? '作品' : '文章'}：${item.title}`}>
                <a 
                  href={`/${item.type === CompositionTypes.SHOTS ? 'shots' : 'article'}/${item.id}`} 
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