import React from 'react'
import { Avatar, Tooltip, Tag } from 'antd'
import { utils } from '@utils/'
import { AuthorType } from '@base/enums'
import { toJS } from 'mobx'

import AvatarComponent from '@components/common/AvatarComponent'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'

export interface Props {
  avatar: string
  title: string
  type: number
  signature: string
  followed: boolean
  onFollow: Function
}

const AuthorItemSmall: React.SFC<Props> = ({
  item,
  avatar,
  title,
  type,
  signature,
  authorCode,
  followed,
  onFollow,
}) => {
  const strLength = utils.getStringLength(title || '') 
  const nextAction = followed ? 0 : 1 
  const isInstitution = type === AuthorType.INSTITUTION 

  return (
    <li>
        <div className='left mode-lbox'>
              <a href={`/author/${authorCode}`} target='blank'>
            {/* <Avatar icon='user' src={avatar} size={40} /> */}
            <AvatarComponent 
                src={item.avatar}
                name={item.authorName}
                className={'author-img'} 
            />
          </a>
        </div>
        <div className='mode-rbox'>
            <h4>
              <span className='title'>
                <Tooltip title={title}>
                    <a href={`/author/${authorCode}`} target='blank'>{title}</a>
                </Tooltip> 
              </span>
              <a className='follow' onClick={e => onFollow(nextAction)}>{followed ? '已关注' : '+ 关注'}</a>
              </h4>
            <div className='footer-bar'>
                <UserIdentityComp currentType={type} />
                <a>{signature || ''}</a>
            </div>
        </div>
    </li>
  )
}

export default AuthorItemSmall