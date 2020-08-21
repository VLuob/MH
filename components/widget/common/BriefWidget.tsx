import { Tag, Avatar } from 'antd'
import { Link } from '@routes'
import { toJS } from 'mobx'
import { AuthorStatus, AuthorType } from '@base/enums'
import { colorList } from '@constants/common/avatar'

import AvatarComponent from '@components/common/AvatarComponent'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'

const BriefWidget = ({ item, size, name, meta, area, link, type, mainPage, mainListPage, center, children, isInstitution, tagShow, avatarSrc, ...props }) => {
    // const handleClick = () => {
    //     if(type === AuthorType.INSTITUTION) {
    //         if(item.status !== AuthorStatus.AUDITING) {
    //             window.location.href = mainPage
    //         } else {
    //             window.location.href = mainListPage
    //         }
    //     } else {
    //         window.location.href = mainPage
    //     }
    // }
  
    // const centerClick = () => {
    //     if(type === AuthorType.INSTITUTION) {
    //         if(item.status !== AuthorStatus.AUDITING) {
    //             window.location.href = center
    //         } else {
    //             window.location.href = mainListPage
    //         }
    //     } else {
    //         window.location.href = center
    //     }
    // }

    return (
        <div className='brief-box'>
            <div>    
                <AvatarComponent 
                    className='avatar' 
                    src={avatarSrc} 
                    //divStyle={{ float: `left` }}
                    name={item && item.nickname}
                    style={{ fontSize: '22px' }}
                />
                {/* <Avatar className='avatar' src={avatarSrc} size={size} style={{ backgroundColor, fontSize: '12px', border: 'none' }}>
                    {initialName}
                </Avatar> */}
                <ul className='brief-meta'>
                    {/* <li><strong>{isInstitution && item.status === AuthorStatus.AUDITING && <span className='brief-status'>[待审核]</span>}{<UserIdentityComp isPerson={!isInstitution} />}{name}</strong></li> */}
                    <li><span className='brief-name'>{name}</span></li>
                    {!area && meta && <li><span className='brief-name-meta'>{meta}</span></li>}
                    {/* {mainPage && center && <li>
                        <a onClick={centerClick}>{type === AuthorType.INSTITUTION ? `机构中心` : `个人中心`}</a> <span>·</span> <a onClick={handleClick}>{type === AuthorType.INSTITUTION ? `机构主页` : `个人主页`}</a>
                    </li>} */}
                    {area && <li>{item.cityName} {item.cityName && item.provinceName && <span>/</span>} {item.provinceName}</li>}
                    {children}
                </ul>
                {tagShow && <div className='brief-tag'>
                    <Tag color='#F1F1F1' style={{ color: '#888888' }}>管理员</Tag>
                    <Tag color='rgba(0, 140, 214, 0.1)' style={{ color: '#008CD6' }}>机构主页</Tag>
                </div>}
            </div> 
            {/* </Link> */}
        </div>
    )
}

export default BriefWidget