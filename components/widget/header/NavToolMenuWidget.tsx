import jsCookie from 'js-cookie'
import { Link, Router } from '@routes'
import { MineType, AuthorType, EditionType } from '@base/enums'
import { Icon, Menu, message, Button, Avatar, Dropdown, Spin } from 'antd'
import { toJS } from 'mobx'

import CusIcon from '@components/widget/common/Icon' 
import BriefWidget from '@components/widget/common/BriefWidget'
import AvatarComponent from '@components/common/AvatarComponent'
import UserIdentityComp  from '@components/widget/common/UserIdentityComp'
import AuthorEditionTag from '@components/author/AuthorEditionTag'
import AuthorAuthenticationIcon from '@components/author/AuthorAuthenticationIcon'
import EmptyComponent from '@components/common/EmptyComponent'

const publishSvg = '/static/images/account/publish.svg'

const SubMenu = Menu.SubMenu

const NavToolMenuWidget = ({ 
    msg, 
    that,
    link, 
    user, 
    asPath, 
    search, 
    orgList, 
    current, 
    spread,
    messageCount,
    letterCount,
    letterMenu,
    showMenu,
    userInfo, 
    authors,
    authorsLoading,
    navTipShow,
    handleClick,
    handleLogout, 
    handleShowMenu,
    updateNavTipShow,
    onSubMenuTitleClick,
}) => {
    const isLogin = userInfo && !!userInfo.id

    const handlePublish = () => {
        if(isLogin) {
            if(userInfo.hasAuthor) {
                window.location.href = '/shots/new'
            } else {
                window.location.href = '/creator'
            }
        } else {
            window.location.href = `/signin?c=${encodeURIComponent(window.location.pathname)}`
        }
    }

    const handlePublishSelect = (e) => {
       if (e.key === 'publish_enquiry') {
           window.location.href = '/enquiry/new'
       } else {
        if(isLogin) {
            if(userInfo.hasAuthor) {
                if (e.key === 'publish_shots') {
                    window.location.href = '/shots/new'
                } else if (e.key === 'publish_article') {
                    window.location.href = '/article/new'
                } else if (e.key === 'publish_service') {
                    window.location.href = '/service/new'
                }
            } else {
                window.location.href = '/creator'
            }
        } else {
            window.location.href = `/signin?c=${window.location.pathname}`
        }
       }
    }

    const handleSignin = () => {
        window.location.href = `/signin?c=${window.location.pathname}`
    }

    const changeClick = e => {
        switch(e.key) {
            case MineType.FOLLOW: 
                window.location.href = '/personal/follow'

                break
            case MineType.COLLECTION:
                window.location.href = '/personal/collections'
                
                break
            case MineType.FAVOR:
                window.location.href = '/personal/favorite'

                break
            case MineType.DATAANDACCOUNT:
                window.location.href = '/personal/account'

                break
            case MineType.SUBSCRIPTION:
                window.location.href = '/personal/subscribe'

                break
            case MineType.CREATEINSTITUTION:
                window.location.href = '/creator'
                break
            case MineType.ORDER:
                window.location.href = '/personal/order'

                 break
            case MineType.INSTITUTION:
                window.location.href = '/personal/teams'

                break
            case MineType.LOGOUT:
                handleLogout()

                break
        }
    }

    // const onPublishClick = (e) => {
    //     if(!toJS(userInfo).nickName) {
    //         window.location.href = `/signin?c=/shots/new`

    //         return 
    //     }

    //     switch(Number(e.key)) {
    //         case 0:
    //             window.location.href = '/shots/new'

    //             break
    //         case 1: 
    //             if(userInfo.author && userInfo.author.orgCreated) {
    //                 window.location.href = '/shots/new'
    //             } else {
    //                 window.location.href = '/personal/teams?key=create'
    //             }

    //             break
    //     }
    // }

    const closeClick = () => {
        jsCookie.set('meihua_nav_tooltip', true)

        updateNavTipShow(true)
        that.forceUpdate()
    }

    const handleSubMenuTitleCustomClick = (e) => {
        e.stopPropagation()
        window.location.href = '/personal/teams'
    }

    // let host 

    // if(typeof window !== `undefined`) {
    //     host = window.location.host
    // }

    // const menu = () => {
    //     return (
    //         <Menu onClick={onPublishClick} theme='light'>
    //             {userInfo.authorId && <Menu.Item key={0}>个人创作者身份发布</Menu.Item>}
    //             {/* <Menu.Item key={1}>机构发布者身份发布</Menu.Item> */}
    //         </Menu>
    //     )
    // }
    
    return (
        <div className='nav-tool-menu' id='nav-tool-menu'>
            {!navTipShow && !isLogin && <div className='nav-tip-box'>从这里可免费发布您的作品和文章  <Icon type='close' className='nav-tip-close' onClick={closeClick} /></div>}
            <Menu
                theme='dark'
                onClick={handleClick}
                selectedKeys={[]}
                mode='horizontal'>
                <Menu.Item key='publish'>
                    {!spread && <Dropdown
                        placement="bottomRight"
                        overlay={<Menu className="btn-publish-menu" onClick={handlePublishSelect}>
                            <Menu.Item key="publish_shots"><CusIcon name="shots-publish" /> 发布作品</Menu.Item>
                            <Menu.Item key="publish_article"><CusIcon name="article-publish" /> 发布文章</Menu.Item>
                            <Menu.Item key="publish_enquiry"><CusIcon name="enquiry" /> 发布询价</Menu.Item>
                            <Menu.Item key="publish_service"><CusIcon name="relation-service" /> 发布服务</Menu.Item>
                        </Menu>}
                    >
                        <Button type='primary' onClick={handlePublish}>
                        <img src={publishSvg} alt='发布' className='img-publish' />发布
                        </Button>
                    </Dropdown>}
                    {/* <Dropdown overlay={menu} trigger={['click']} placement='bottomRight' getPopupContainer={() => document.getElementById('nav-tool-menu')}>
                        <Button type='primary' onClick={handlePublish}>
                            <img src={publishSvg} alt='发布' className='img-publish' />发布
                        </Button>
                    </Dropdown> */}
                </Menu.Item>
                {/* {isLogin && 
                <Menu.Item key='message' className='nav-message'>
                    <a className="icon-message" href="/personal/message">
                        <Icon type="message" theme="filled" />
                        {messageCount > 0 && <span className="dot">{messageCount}</span>}
                    </a>
                </Menu.Item>} */}
                {isLogin && 
                <Menu.Item key='letter' className='nav-message'>
                    <Dropdown overlay={letterMenu} placement="bottomCenter">
                        <a 
                        className="icon-message" 
                        //href="/personal/letter"
                        >
                            {/* <CusIcon name="letter" /> */}
                            <Icon type="message" theme="filled" />
                            {letterCount > 0 && <span className="dot">{letterCount}</span>}
                        </a>
                    </Dropdown>
                </Menu.Item>}
                {/* <Menu.Item key='search' className='ant-menu-search'>                                                                
                    {search}
                </Menu.Item> */}
                {!isLogin &&
                    <Menu.Item className='ant-menu-signin' key='signin'>
                        <Dropdown 
                            overlay={
                            <div className="nav-drop-signin-overlay">
                                <div className="nav-drop-signin-header">
                                        登录后可享受
                                 </div>
                                 <div className="nav-drop-signin-body">
                                     <ul>
                                         <li><CusIcon name="user" /> 关注喜欢的创作者</li>
                                         <li><CusIcon name="message" /> 参与互动讨论</li>
                                         <li><CusIcon name="star" /> 收藏喜欢的作品</li>
                                     </ul>
                                 </div>
                                 <div className="nav-drop-signin-footer">
                                     <Button type="primary" onClick={handleSignin}>登录</Button>
                                 </div>
                            </div>
                        }>
                            <span><a onClick={handleSignin}>登录</a> / <a href={`/signup`}>注册</a></span>
                        </Dropdown>
                    </Menu.Item>}
                {isLogin && <Menu.Item className='ant-menu-user' key='user'>
                    <Dropdown 
                        //trigger={['click']}
                        visible={showMenu} 
                        style={{ minWidth: '450px' }} 
                        onVisibleChange={visible => {
                            handleShowMenu(visible)
                        }}
                        overlayClassName='nav-tool-float-menu' 
                        overlay={
                        <dl className='user-info' onClick={() => handleShowMenu(showMenu)}>
                            <dd>
                                <BriefWidget 
                                    size={50}
                                    className='avatar'
                                    name={userInfo.nickName}
                                    link={`/personal/creation`}
                                    type={AuthorType.PERSONAL}
                                    center={`/personal/creation`}
                                    mainListPage={`/personal/teams`}
                                    avatarSrc={userInfo.avatar}
                                    meta={(userInfo.email) || ` `}
                                />
                                <div className='nav-list-link'>
                                    <a href={`/personal/creation`}>
                                        <Icon type='user' className='user-icon' />个人中心
                                    </a>
                                </div>
                            </dd>
                            <dd>
                                <Menu
                                    className='nav-list-user'
                                    onClick={changeClick}
                                    mode='inline'>
                                        <Menu.Item key={MineType.FOLLOW}>
                                            <CusIcon name='user1' className='default-icon' />
                                            <span>我的关注</span>
                                        </Menu.Item>
                                        <Menu.Item key={MineType.COLLECTION}>
                                            <CusIcon name='star' className='default-icon' />
                                            <span>我的收藏</span>
                                        </Menu.Item>
                                        <Menu.Item key={MineType.FAVOR}>
                                            <CusIcon name='favor' className='default-icon' />
                                            <span>我的喜欢</span>
                                        </Menu.Item>
                                        <Menu.Item key={MineType.ORDER}>
                                            <CusIcon name='order' className='default-icon' />
                                            <span>我的订单</span>
                                        </Menu.Item>
                                        <Menu.Item key={MineType.DATAANDACCOUNT}>
                                            <CusIcon name='account' className='default-icon' />
                                            <span>账户与资料</span>
                                        </Menu.Item>
                                        <Menu.Item key={MineType.SUBSCRIPTION}>
                                            <CusIcon name='email' className='default-icon' />
                                            <span>邮件订阅</span>
                                        </Menu.Item>
                                </Menu>
                            </dd>
                            <dd>
                                <Menu
                                    className='nav-list-user'
                                    onClick={changeClick}
                                    mode='inline'>
                                    <Menu.Item key={MineType.CREATEINSTITUTION}>
                                        <Icon type='plus-circle' theme='filled' className='default-icon' />
                                        <span>创建创作者</span>
                                    </Menu.Item>
                                    {/* <Menu.Item key={MineType.INSTITUTION}>
                                        <CusIcon name='iconmanagecreator' className='default-icon' />
                                        <span>管理创作者</span>
                                    </Menu.Item> */}
                                    <SubMenu
                                        key={MineType.INSTITUTION}
                                        className="nav-ment-author-submenu"
                                        title={<div>
                                            <div onClick={handleSubMenuTitleCustomClick}>
                                                <CusIcon name='managecreator' className='default-icon' />
                                            <span>管理创作者</span>
                                            </div>
                                        <i 
                                            className="ant-menu-submenu-arrow ant-menu-submenu-arrow-custom" 
                                            onClick={onSubMenuTitleClick}
                                        />
                                        </div>}
                                        style={{padding: '0'}}
                                    >
                                        {authorsLoading && <Menu.Item><div className="authors-loading" style={{textAlign: 'center'}}><Spin /></div></Menu.Item>}
                                        {!authorsLoading && authors.length === 0 && <li>
                                            <div className='nav-authors-empty-container'>
                                                <Avatar size={48} src="/static/images/icon/empty_circle.svg" />
                                                <p className='text'>暂无创作者</p>
                                                <div className="btn-create">
                                                    <Button href="/creator" className="themes">去创建</Button>
                                                </div>
                                            </div>
                                        </li>}
                                        {!authorsLoading && authors.length > 0 && authors.map(item => {
                                            const currentAuthorEdition = item.edition || {editionType: EditionType.FREE}
                                            const isCurrentAuthorFree = currentAuthorEdition.editionType === EditionType.FREE
                                            return (
                                                <Menu.Item key={item.id}>
                                                    <a href={`/teams/${item.id}/creation?type=shots&status=0`}>
                                                        <div className="menu-item-author-wrap">
                                                            <Avatar size={34} src={item.avatar || '/static/images/icon/avatar.png'} icon="user" />
                                                            <div className="author-info">
                                                                <div className="nickname">{item.nickname} <AuthorAuthenticationIcon hide={isCurrentAuthorFree} style={{marginLeft: '6px'}} /></div>
                                                                <div className="type"><UserIdentityComp currentType={item.type} editionType={currentAuthorEdition.editionType} />
                                                                {/* <AuthorEditionTag editionType={currentAuthorEdition.editionType} style={{marginLeft: '6px'}}/> */}
                                                                </div>
                                                            </div>
                                                            <div className="author-more">
                                                                <Dropdown trigger={['hover','click']} overlay={
                                                                    <Menu>
                                                                        <Menu.Item><a href={`/teams/${item.id}/creation?type=shots&status=0`}>创作管理</a></Menu.Item>
                                                                        <Menu.Item><a href={`/teams/${item.id}/statistics`}>创作统计</a></Menu.Item>
                                                                        <Menu.Item><a href={`/teams/${item.id}/account`}>资料与账户</a></Menu.Item>
                                                                    </Menu>
                                                                }>
                                                                    <Icon type="more" />
                                                                </Dropdown>
                                                            </div>
                                                        </div>
                                                    </a>
                                                </Menu.Item>
                                            )
                                        })}
                                    </SubMenu>
                                </Menu>
                            </dd>
                            <dd>
                                <Menu
                                    className='nav-list-user'
                                    onClick={changeClick}
                                    mode='inline'>
                                    <Menu.Item key={MineType.LOGOUT}>
                                        <CusIcon name='iconlogout' className='default-icon' />
                                        <span>退出登录</span>
                                    </Menu.Item>
                                </Menu>
                            </dd>
                            {/* <dt className='clearfix'>
                                <span className='title'>我的机构</span>
                                {!(userInfo.author && userInfo.author.orgCreated) && <span className='operation'>
                                    <a href='/personal/teams?key=create'>创建机构</a>  
                                </span>}
                            </dt> */}
                            {/* <dd>
                                {userInfo.author && !userInfo.author.orgCreated && <div className='create-ins-box'>
                                    <Button className='themes ins-btn'>
                                        <a href='/personal/teams?key=create'>创建机构创作者</a>
                                    </Button>      
                                </div>}
                                {orgList.map(l => {
                                    return (
                                        <div className='institution-info' key={l.id}>
                                            <BriefWidget 
                                                size={50} 
                                                item={l}
                                                isInstitution
                                                code={l.code} 
                                                name={l.nickname} 
                                                tagList={l.tagList} 
                                                avatarSrc={l.avatar} 
                                                mainPage={`/author/${l.code}`} 
                                                type={AuthorType.INSTITUTION}
                                                link={`/teams/${l.id}/creation`} 
                                                mainListPage={`/personal/teams`}
                                                center={`/teams/${l.id}/creation`}
                                                tagShow={l.tagList && l.tagList.length > 0} 
                                            />
                                        </div>
                                    )
                                })}
                            </dd> */}
                        </dl>}>
                        <a className='user-avatar-img' href="/personal/account">
                            {/* <Avatar size={15} src={userInfo.avatar} style={{ marginRight: `10px`, marginBottom: `2.5px` }} /> */}
                            <AvatarComponent 
                                src={userInfo.avatar}
                                name={userInfo.username}
                                style={{ width: `15px`, height: `15px`, marginRight: `10px`, marginBottom: `2.5px`, fontSize: `22px` }}
                            />
                            <span className="nav-nickname">{userInfo.nickName}</span>
                        </a>
                    </Dropdown>
                </Menu.Item>}
            </Menu>
        </div>
    )
}

export default NavToolMenuWidget