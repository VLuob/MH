import React from 'react'
import { Tooltip, Avatar, Dropdown, Menu } from 'antd'

export interface Props {
    member: Array<object>
    maxCount: number

}

/**
 * 自定义Icon
 * @param src 
 * @param width
 * @param height
 * @param fill
 * @param className
 * @param style
 */
const Members: React.SFC<Props> = ({ members, maxCount, ...props}) => {
    const max = maxCount || 5
    const hasExp = members.length > max
    let firstMembers = []
    let menu = null
    if (hasExp) {
        firstMembers = members.slice(0, max)
        const expMembers = members.slice(max)
        menu = (<Menu>
            {expMembers.map(item => (
                <Menu.Item key={item.id}>
                    <Tooltip title={item.authorName}>
                        <a href={`/author/${item.authorCode}`} target="_blank">
                            <Avatar icon="user" src={item.authorAvatar} />
                        </a>
                    </Tooltip>
                </Menu.Item>
            ))}
        </Menu>)
    } else {
        firstMembers = members
    }

    return (
        <span className="members">
            <span className="label">共同创作者</span>  
            <span className="members-list">
            {firstMembers.map(item => (
                <Tooltip key={item.id} title={item.authorName}>
                    <a href={`/author/${item.authorCode}`} target="_blank">
                        <Avatar icon="user" src={item.authorAvatar} />
                    </a>
                </Tooltip>))}
            </span>
            {hasExp && <span className="members-exp">
                <Dropdown overlay={menu}>
                    <a className="ant-dropdown-link">···</a>
                </Dropdown> 
            </span>}
        </span>
    )
} 

export default Members