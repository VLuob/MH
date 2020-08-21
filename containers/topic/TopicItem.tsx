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
  const covers = item.cover ? item.cover.split('|') : []
  return (
    <div className="topic-item">
      <div className="topic-item-content">
        <a href={url} target="_blank">
        <div className="topic-item-cover">
            {covers.map((cover, index) => (
              <img key={index} src={`${cover}?imageMogr2/thumbnail/!200x134r/size-limit/50k/gravity/center/crop/200x134`} alt={item.title}/>
            ))}
        </div>
        </a>
        <div className="topic-item-intro">
          <div className="title"><Tooltip title={item.title}><a href={url} target="_blank">{item.title}</a></Tooltip></div>
          <div className="bottom-wrapper">
            <div className="summary">{item.summary}</div>
            <div className="info">
              {!!item.totalWorks && <><span className="count">{item.totalWorks || 0}</span> 个作品</>}
              {!!item.totalWorks && !!item.totalArticles && <span className="dot">·</span>}
              {!!item.totalArticles && <><span className="count">{item.totalArticles || 0}</span> 篇文章</>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopicItem