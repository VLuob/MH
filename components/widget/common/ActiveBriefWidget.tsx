import { Tag, Avatar } from 'antd'
import { Link } from '@routes'
import { toJS } from 'mobx'
import { AuthorStatus, AuthorType } from '@base/enums'
import { colorList } from '@constants/common/avatar'
import AvatarComponent from '@components/common/AvatarComponent'

const ActiveBriefWidget = ({ item, size, name, meta, area, link, type, mainPage, mainListPage, center, children, isInstitution, tagShow, avatarSrc, ...props }) => {
    const handleClick = () => {
        if (type === AuthorType.INSTITUTION) {
            if (item.status !== AuthorStatus.AUDITING) {
                window.location.href = mainPage
            } else {
                window.location.href = mainListPage
            }
        } else {
            window.location.href = mainPage
        }
    }

    const centerClick = () => {
        if (type === AuthorType.INSTITUTION) {
            if (item.status !== AuthorStatus.AUDITING) {
                window.location.href = center
            } else {
                window.location.href = mainListPage
            }
        } else {
            window.location.href = center
        }
    }

    return (
        <div className='brief-box'>
            <div>
                <a href={link} target='_blank'>
                    <AvatarComponent
                        className='avatar'
                        src={avatarSrc}
                        name={item && item.nickname}
                        style={{ fontSize: '22px' }}
                    />
                </a>
                <ul className='brief-meta'>
                    <li><strong><a href={link} target='_blank'>{name}</a></strong> {isInstitution && <span className='institution-tag'>机构</span>}</li>
                    {!area && meta && <li>{meta}</li>}
                    {mainPage && center && <li>
                        <a onClick={centerClick}>{type === AuthorType.INSTITUTION ? `机构中心` : `个人中心`}</a> <span>·</span> <a onClick={handleClick}>{type === AuthorType.INSTITUTION ? `机构主页` : `个人主页`}</a>
                    </li>}
                    {area && <li>{item.cityName} {item.cityName && item.provinceName && <span>/</span>} {item.provinceName}</li>}
                    {children}
                </ul>
                {tagShow && <div className='brief-tag'>
                    <Tag color='#F1F1F1' style={{ color: '#888888' }}>管理员</Tag>
                    <Tag color='rgba(0, 140, 214, 0.1)' style={{ color: '#008CD6' }}>机构主页</Tag>
                </div>}
            </div>
        </div>
    )
}

export default ActiveBriefWidget