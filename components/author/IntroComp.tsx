import { Icon, Menu, Button, Avatar, Dropdown } from 'antd'
import { RoleType, AuthorStatus, AuthorType, EditionType } from '@base/enums'
import classNames from 'classnames'
import ReactTooltip from 'react-tooltip'
import { toJS } from 'mobx'

import { utils, config } from '@utils'
import AvatarComponent from '@components/common/AvatarComponent'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'
import AuthorEditionTag from './AuthorEditionTag'
import AuthorAuthenticationIcon from './AuthorAuthenticationIcon'
import MiniappIcon from '@containers/widget/MiniappIcon'
import QRCodeIcon from '@components/widget/common/QRCodeIcon'

const IntroComp = ({
  item,
  menu,
  roles,
  status,
  onClicks,
  onEnquiry,
  children,
  roleType,
  isDropdown,
  isManagement,
  isMobileScreen,
}) => {
  const items = item || {}
  const currentRole = roles && `创建者`
  const isFirstCreate = !items.authorPassed
  const isFirstCreateRefused = isFirstCreate && status === AuthorStatus.REFUSED
  const isAuditing = status === AuthorStatus.AUDITING
  const isUpdateAuditing = status === AuthorStatus.UPDATE_AUDITING
  const isClosed = status === AuthorStatus.CLOSED
  const isRefused = status === AuthorStatus.REFUSED
  const isHidden = !!item.filtered
  const formatArea = utils.formatArea(item.provinceName, item.cityName)
  const hideEnquiry = [AuthorType.BRANDER, AuthorType.EDITOR].includes(item.type)

  // console.log('is first', isFirstCreate, status,status === AuthorStatus.REFUSED && isFirstCreate,status !== AuthorStatus.PASSED || isFirstCreateRefused)

  // let targetUrl = isManagement ?  `/teams/${item.id}/account` :  `/author/${item.code}`
  let targetUrl = ''
  if (isManagement) {
    if (isClosed) {
      targetUrl = null
    } else if (!isFirstCreate) {
      targetUrl = `/teams/${item.id}/account`
    } else {
      switch (item.type) {
        case AuthorType.PERSONAL:
          targetUrl = `/creator/personal/${item.id}`
          break
        case AuthorType.BRANDER:
          targetUrl = `/creator/brand/${item.id}`
          break
        case AuthorType.SERVER:
          targetUrl = `/creator/service/${item.id}`
          break
        case AuthorType.EDITOR:
          targetUrl = `/teams/${item.id}/account`
          break
      }
    }
  } else {
    targetUrl = `/author/${item.code}`
  }

  let statusText = ''
  if (isManagement) {
    if (isAuditing) {
      statusText = '[待审核]'
    } else if (isUpdateAuditing) {
      statusText = '[待审核]'
    } else if (isClosed) {
      statusText = '[已关闭]'
    } else if (isHidden) {
      statusText = '[已隐藏]'
    }
  }


  return (
    <div className='intro-box'>
      <div className={classNames('imgbox',
        { 'ins-img-box': isManagement })}>
        <a href={targetUrl} target='_blank'>
          <AvatarComponent
            src={items.avatar || items.image}
            name={items.nickname}
            style={{ fontSize: '22px' }}
          />
        </a>
        {!!isManagement && (typeof status === 'number') && (isAuditing || isUpdateAuditing || isClosed || isFirstCreateRefused) && <div className='ins-status'>
          {isFirstCreateRefused && <span className='ins-pass-reject'>资料审核未通过</span>}
          {isAuditing && <span className='ins-pass-audited'>资料审核中</span>}
          {isUpdateAuditing && <span className='ins-pass-audited'>更新资料审核中</span>}
          {isClosed && <span className='ins-pass-reject'>已关闭</span>}
        </div>}
        {roles && <div className='intro-role'>{currentRole}</div>}
      </div>
      <div className='content-box'>
        {
          // (status === AuthorStatus.REFUSED || status === AuthorStatus.AUDITING) ? 
          // <div className='title-container'>
          //     <span className='title-box'>
          //         {/* {statusText && <span className='title-status'>[{statusText}]</span>} */}
          //         <span className='title single-ellipsis' data-for={`perbox-${item.id}`} data-tip={item.nickname || item.title}>{item.nickname || item.title}</span>
          //         <ReactTooltip id={`perbox-${item.id}`} effect='solid' place='top' />
          //     </span>
          // </div> : 
          <a href={targetUrl} target='_blank'>
            <span className='title-box'>
              {/* {statusText && <span className='title-status'>[{statusText}]</span>} */}
              <span className='title single-ellipsis' data-for={`perbox-${item.id}`} data-tip={item.nickname || item.title}>{item.nickname || item.title} <AuthorAuthenticationIcon hide={!item.editionType || item.editionType === EditionType.FREE} /> <span style={{ color: '#888', fontWeight: 'normal' }}>{statusText}</span></span>
              <ReactTooltip id={`perbox-${item.id}`} effect='solid' place='top' />
            </span>
          </a>
        }
        <span className='area'>
          <UserIdentityComp currentType={item.type} editionType={item.editionType} />
          {/* <AuthorEditionTag editionType={item.editionType || EditionType.FREE} style={{marginRight: '6px'}}/> */}
          <span className="wx-mini-icon" style={{ marginRight: '5px', fontSize: '14px' }}>
            {/* <MiniappIcon
              placement="bottomCenter"
              params={{ scene: `code=${item.code}`, page: 'pages/author/author-detail/author-detail', width: 320 }}
            /> */}
            <QRCodeIcon
              placement="topRight"
              url={config.CURRENT_DOMAIN + `/author/${item.code}`}
            />
          </span>
          {formatArea && <span className="area-label">
            {formatArea}
          </span>}
        </span>
        <span className='brief'><span data-for={`perbox-${item.id}`} data-tip={`作品: ${items.compositionCount || 0}`}>作品 <strong className='sum'>{items.compositionCount || 0}</strong></span> | <span data-for={`perbox-${item.id}`} data-tip={`文章: ${items.articleCount || 0}`}>文章 <strong className='sum'>{items.articleCount || 0}</strong></span>
          {/* | <span data-for={`perbox-${item.id}`} data-tip={`粉丝: ${items.fans || 0}`}>粉丝 <strong className='sum'>{items.fans || 0}</strong></span> */}
        </span>
        {!isMobileScreen && isDropdown && <Dropdown overlay={menu} trigger={['hover']} placement='bottomRight'>
          <a onClick={e => { e.stopPropagation() }} className='ant-dropdown-link' href='#'><Icon type='more' /></a>
        </Dropdown>}
        {!!isMobileScreen && hideEnquiry &&
          <>
            {!item.followed && <Button type='primary' className='attention not-attention' onClick={e => onClicks(item)}><Icon type='plus' />关注</Button>}
            {!!item.followed && <Button type='default' className='attention completed' onClick={e => onClicks(item)}>已关注</Button>}
          </>
        }
        {!!isMobileScreen && !hideEnquiry && <Button type='primary' className='btn-enquiry' onClick={e => onEnquiry(item)}>询价</Button>
        }
        {children}
      </div>
    </div>
  )
}

export default IntroComp