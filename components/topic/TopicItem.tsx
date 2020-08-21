import React from 'react'
import moment from 'moment'
import { Tooltip } from 'antd'
import LazyLoad from '@static/js/LazyLoad'
import { CompositionTypes } from '@base/enums'

import emptyImage from '@static/images/common/full-empty.png'

export interface Props {
  id: number|string
  img: string 
  code: string
  title: string 
  author: string 
  time: number|string,
  timeago: string
}

const TopicItem: React.SFC<Props> = ({
  item,
}) => {
  const url = `/topics/${item.id}`
  const subList = (item.cpList || []).slice(0, 2)
  return (
    <div className="topic-item">
      <div className="topic-item-content">
        <a href={url} target="_blank">
        <div className="topic-item-cover">
            <img src={`${item.cover}?imageMogr2/thumbnail/!760x542r/size-limit/50k/gravity/center/crop/760x542`} alt=""/>
          <div className="title-bar">
            <span className="title">{item.title}</span>
          </div>
        </div>
        </a>
        <div className="topic-item-intro">
          <div className="summary">
          {item.summary}
          </div>
          <div className="info">
            共 <span className="count">{item.totalWorks}</span>个作品 <span className="count">{item.totalArticles}</span>篇文章
          </div>
          <ul className="recommended">
            {subList.map(subItem => {
              // let url = ''
              // if (subItem.type === CompositionTypes.ARTICLE) {
              //   url = `/article/${subItem.compositionId}`
              // } else if (subItem.type === CompositionTypes.SHOTS) {
              //   url = `/shots/${subItem.compositionId}`
              // }
              return(
                <li key={subItem.id}><a href={url} target="_blank"><img src={`${subItem.cover}?imageMogr2/thumbnail/!220x156r/size-limit/50k/gravity/center/crop/220x156`} alt=""/></a></li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default TopicItem