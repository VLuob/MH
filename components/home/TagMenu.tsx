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

const TagMenu: React.SFC<Props> = ({ 
    size, 
    list,
    link, 
    className,
    onFollow 
}) => {
    return (
        <ul className={classNames('tag-menu', className)}>
            {list.map(item => {
                return (
                    <li className='clearfix' key={item.id}>
                        <div className='left tag-imgbox'>
                            <a href={`${link}/${item.id}`} target='_blank'>
                                <Avatar icon='user' src={item.cover + '?imageMogr2/thumbnail/!80x80r/size-limit/50k/gravity/center/crop/80x80'} size={size} />
                            </a>
                        </div>
                        <div className='tag-detail clearfix'>
                            <h4>
                                <a href={`${link}/${item.id}`} target='_blank'>
                                    <span className='title'>
                                        <Tooltip title={item.nickname || item.title}>{item.nickname || item.title}</Tooltip>  &nbsp;&nbsp;
                                        {item.type === AuthorType.INSTITUTION && <Tag color='#191919'>机构</Tag>}
                                    </span>
                                </a>
                                {!item.followed && onFollow && <span className='follow' onClick={e => onFollow(item, 1)}>+ 关注</span>}
                                {item.followed && onFollow && <span className='followed' onClick={e => onFollow(item, 0)}>已关注</span>}
                            </h4>
                            <div className='footer-bar'>
                                <span className='describe'>
                                    <Tooltip title={item.signature || item.summary}>{item.signature || item.summary}</Tooltip>
                                </span>
                            </div>
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}

export default TagMenu