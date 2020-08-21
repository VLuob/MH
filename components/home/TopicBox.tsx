import React, { Component } from 'react'
import classNames from 'classnames'
import { Tag, Avatar, Tooltip } from 'antd'
import { AuthorType } from '@base/enums'

export interface Props {
    size: number
    title: string 
    avatar: string 
    member: number 
    article: number 
    className: string 
    production: number 
    onFollow: Function 
    link: string 
    list: Array<any> 
}

const TopicBox: React.SFC<Props> = ({ 
    size, 
    list,
    link, 
    className,
    onFollow 
}) => {
    return (
        <ul className={classNames('tag-menu', className)}>
            {list.map(item => {
                const url = `/topics/${item.id}`
                const covers = item.cover ? item.cover.split('|') : []
                return (
                    <li className="side-topic-item" key={item.id}>
                        <div className="topic-item-content">
                            <a href={url} target="_blank">
                            <div className="topic-item-cover">
                                {/* <img src={`${item.banner}?imageMogr2/thumbnail/!1920x360r/size-limit/50k/gravity/center/crop/1920x360`} alt={item.title}/> */}
                                {covers.map((cover, index) => (
                                <img key={index} src={`${cover}?imageMogr2/thumbnail/!200x134r/size-limit/50k/gravity/center/crop/200x134`} alt={item.title}/>
                                ))}
                            </div>
                            </a>
                            <div className="topic-item-intro">
                            <div className="title"><Tooltip title={item.title}><a href={url} target="_blank">{item.title}</a></Tooltip></div>
                            <div className="bottom-wrapper">
                                <div className="info">
                                {!!item.totalWorks && <><span className="count">{item.totalWorks || 0}</span> 个作品</>}
                                {!!item.totalWorks && !!item.totalArticles && <span className="dot">·</span>}
                                {!!item.totalArticles && <><span className="count">{item.totalArticles || 0}</span> 篇文章</>}
                                </div>
                            </div>
                            </div>
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}

export default TopicBox