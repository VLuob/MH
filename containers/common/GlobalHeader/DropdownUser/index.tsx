import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Dropdown, Menu, Button, Avatar, Icon, Spin } from 'antd'
import { MineType, AuthorType, EditionType } from '@base/enums'
import CustomIcon from '@components/widget/common/Icon'
import BriefWidget from '@components/widget/common/BriefWidget'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'
import './index.less'

const SubMenu = Menu.SubMenu

@inject(stores => {
  const { compositionStore, accountStore } = stores.store
  const { authors } = compositionStore

  return {
    compositionStore,
    accountStore,
    authors,
  }
})
@observer
class DropdownUser extends Component {
  state = {
    showMenu: false,
    authorsLoading: false,
  }

  async requestAuthors() {
    const { compositionStore } = this.props
    this.setState({ authorsLoading: true })
    const response = await compositionStore.fetchAuthors()
    this.setState({ authorsLoading: false })
  }

  handleSignin = () => {
    window.location.href = `/signin?c=${encodeURIComponent(window.location.pathname)}`
  }

  handleShowMenu = (flag) => {
    this.setState({ showMenu: !!flag })
  }

  handleLogout() {
    const { accountStore } = this.props
    accountStore.fetchUserLogout()
  }

  handleSubMenuTitleCustomClick = (e) => {
    e.stopPropagation()
    window.location.href = '/personal/teams'
  }

  handleSubMenuTitleClick = () => {
    const { authors } = this.props
    const { authorsLoading } = this.state
    if (!authorsLoading && authors.length === 0) {
      this.requestAuthors()
    }
  }

  changeClick = e => {
    switch (e.key) {
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
        this.handleLogout()

        break
    }
  }

  renderLogout = () => {
    return (
      <Dropdown
        overlay={
          <div className="nav-drop-signin-overlay">
            <div className="nav-drop-signin-header">登录后可享受</div>
            <div className="nav-drop-signin-body">
              <ul>
                <li><CustomIcon name="user" /> 关注喜欢的创作者</li>
                <li><CustomIcon name="message" /> 参与互动讨论</li>
                <li><CustomIcon name="star" /> 收藏喜欢的作品</li>
              </ul>
            </div>
            <div className="nav-drop-signin-footer">
              <Button type="primary" onClick={this.handleSignin}>登录</Button>
            </div>
          </div>
        }>
        <div className="menu-btn user">
          <div className="icon"><Avatar src="/static/images/icon/avatar.png" size={16} /></div>
          <div className="name"><a onClick={this.handleSignin}>登录</a> / <a href={`/signup`}>注册</a></div>
        </div>
      </Dropdown>
    )
  }

  renderLogin = () => {
    const { currentUser = {}, authors = [] } = this.props
    const { showMenu, authorsLoading } = this.state

    return (
      <Dropdown
        //trigger={['click']}
        visible={showMenu}
        style={{ minWidth: '450px' }}
        onVisibleChange={visible => {
          this.handleShowMenu(visible)
        }}
        overlayClassName='nav-tool-float-menu'
        overlay={
          <dl className='user-info' onClick={() => this.handleShowMenu(showMenu)}>
            <dd>
              <BriefWidget
                size={50}
                className='avatar'
                name={currentUser.nickName}
                link={`/personal/creation`}
                type={AuthorType.PERSONAL}
                center={`/personal/creation`}
                mainListPage={`/personal/teams`}
                avatarSrc={currentUser.avatar}
                meta={(currentUser.email) || ` `}
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
                onClick={this.changeClick}
                mode='inline'>
                <Menu.Item key={MineType.FOLLOW}>
                  <CustomIcon name='user1' className='default-icon' />
                  <span>我的关注</span>
                </Menu.Item>
                <Menu.Item key={MineType.COLLECTION}>
                  <CustomIcon name='star' className='default-icon' />
                  <span>我的收藏</span>
                </Menu.Item>
                <Menu.Item key={MineType.FAVOR}>
                  <CustomIcon name='favor' className='default-icon' />
                  <span>我的喜欢</span>
                </Menu.Item>
                <Menu.Item key={MineType.ORDER}>
                  <CustomIcon name='order' className='default-icon' />
                  <span>我的订单</span>
                </Menu.Item>
                <Menu.Item key={MineType.DATAANDACCOUNT}>
                  <CustomIcon name='account' className='default-icon' />
                  <span>账户与资料</span>
                </Menu.Item>
                <Menu.Item key={MineType.SUBSCRIPTION}>
                  <CustomIcon name='email' className='default-icon' />
                  <span>邮件订阅</span>
                </Menu.Item>
              </Menu>
            </dd>
            <dd>
              <Menu
                className='nav-list-user'
                onClick={this.changeClick}
                mode='inline'>
                <Menu.Item key={MineType.CREATEINSTITUTION}>
                  <Icon type='plus-circle' theme='filled' className='default-icon' />
                  <span>创建创作者</span>
                </Menu.Item>
                <SubMenu
                  key={MineType.INSTITUTION}
                  className="nav-ment-author-submenu"
                  title={<div>
                    <div onClick={this.handleSubMenuTitleCustomClick}>
                      <CustomIcon name='managecreator' className='default-icon' />
                      <span>管理创作者</span>
                    </div>
                    <i
                      className="ant-menu-submenu-arrow ant-menu-submenu-arrow-custom"
                      onClick={this.handleSubMenuTitleClick}
                    />
                  </div>}
                  style={{ padding: '0' }}
                >
                  {authorsLoading && <Menu.Item><div className="authors-loading" style={{ textAlign: 'center' }}><Spin /></div></Menu.Item>}
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
                    const currentAuthorEdition = item.edition || { editionType: EditionType.FREE }
                    const isCurrentAuthorFree = currentAuthorEdition.editionType === EditionType.FREE
                    return (
                      <Menu.Item key={item.id}>
                        <a href={`/teams/${item.id}/creation?type=shots&status=0`}>
                          <div className="menu-item-author-wrap">
                            <Avatar size={34} src={item.avatar || '/static/images/icon/avatar.png'} icon="user" />
                            <div className="author-info">
                              <div className="nickname">{item.nickname}</div>
                              <div className="type"><UserIdentityComp currentType={item.type} editionType={currentAuthorEdition.editionType} />
                                {/* <AuthorEditionTag editionType={currentAuthorEdition.editionType} style={{marginLeft: '6px'}}/> */}
                              </div>
                            </div>
                            <div className="author-more">
                              <Dropdown trigger={['hover', 'click']} overlay={
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
                onClick={this.changeClick}
                mode='inline'>
                <Menu.Item key={MineType.LOGOUT}>
                  <CustomIcon name='iconlogout' className='default-icon' />
                  <span>退出登录</span>
                </Menu.Item>
              </Menu>
            </dd>
          </dl>}
      >
        <a className="menu-btn user" href="/personal/account">
          <div className="menu-user-avatar">
            <Avatar src={currentUser.avatar} size={36} alt={currentUser.nickname} />
          </div>
        </a>
      </Dropdown>
    )
  }

  render() {
    const { currentUser = {} } = this.props
    const isLogin = !!currentUser.id

    return (
      isLogin ? this.renderLogin() : this.renderLogout()
    )
  }
}

export default DropdownUser