import { Component } from 'react'
import { Row, Col, Icon, Menu, Button, Dropdown, Avatar, Tooltip } from 'antd'
import { inject, observer } from 'mobx-react'
import moment from 'moment'
import { RoleType, AuthorType, AuthorStatus, EditionType, EditionScope } from '@base/enums'
import { utils } from '@utils'
import { toJS } from 'mobx'
import { Router } from '@routes'
import sysOrder from '@base/system/order'

import CreateInsContainer from './CreateInsContainer'
import PartLoading from '@components/features/PartLoading'
import InsSummaryMod from '@components/common/InsSummaryMod'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'
import AuthorEditionTag from '@components/author/AuthorEditionTag'
import AuthorAuthenticationIcon from '@components/author/AuthorAuthenticationIcon'


const editionMap = sysOrder.filters.editionMap
const serviceMap = sysOrder.filters.serviceMap

const authorStatusMap = {
  [AuthorStatus.AUDITING]: '待审核',
  [AuthorStatus.UPDATE_AUDITING]: '更新待审核',
  [AuthorStatus.CLOSED]: '已关闭',
  [AuthorStatus.REFUSED]: '未通过审核',
}

@inject(stores => {
  const { accountStore, userCenterStore } = stores.store
  const { currentUser } = accountStore
  const { state, mineInsList, fetchGetOrgList } = userCenterStore

  return {
    state,
    currentUser,
    mineInsList,
    fetchGetOrgList
  }
})
@observer
export default class InstitutionContainer extends Component {
  state = {
    create: false
  }

  componentDidMount() {
    const { userCenterInfo, currentUser, fetchGetOrgList } = this.props
    const key = utils.getUrlParam(`key`)

    if (key === `create`) {
      this.handleCreate()
    }

    // console.log('user center info ', toJS(userCenterInfo))

    fetchGetOrgList({ user_id: currentUser.id })
  }

  handleCreate = () => {
    // window.location.href = '/creator'
    // this.setState({ create: true })
    window.open('/creator')
  }

  handleSelectManager = (e, item) => {
    switch (e.key) {
      case `createManage`:
        window.location.href = `/teams/${item.id}/creation?type=shots&status=0`
        // Router.pushRoute(`/teams/${item.id}/creation?type=shots&status=0`)
        break
      case 'statistics':
        window.location.href = `/teams/${item.id}/statistics`
        // Router.pushRoute(`/teams/${item.id}/statistics`)
        break
      case `account`:
        let name = `personal`

        // if(AuthorStatus.AUDITING === Number(item.status)) {
        if (!item.authorPassed) {  // 根据authorPassed是否存在判断是否是初次创建
          // 首次创建
          switch (item.type) {
            case AuthorType.PERSONAL:
              window.location.href = `/creator/personal/${item.id}`
              // window.location.href = `/teams/${item.id}/account`
              // Router.pushRoute(`/teams/${item.id}/account`)
              name = `personal`
              break
            case AuthorType.BRANDER:
              window.location.href = `/creator/brand/${item.id}`
              // window.location.href = `/teams/${item.id}/account`
              // Router.pushRoute(`/teams/${item.id}/account`)
              name = `brand`

              break
            case AuthorType.SERVER:
              window.location.href = `/creator/service/${item.id}`
              // window.location.href = `/teams/${item.id}/account`
              // Router.pushRoute(`/teams/${item.id}/account`)
              name = `service`

              break
            case AuthorType.EDITOR:
              window.location.href = `/teams/${item.id}/account`
              // Router.pushRoute(`/teams/${item.id}/account`)
              break
          }
        } else {
          window.location.href = `/teams/${item.id}/account`
          // Router.pushRoute(`/teams/${item.id}/account`)
        }


        // window.location.href = `/teams/${item.id}/account`

        break
    }
  }

  handlePublish = () => window.location.href = '/shots/new'

  renderMenu = (e, item) => {
    const isFirstCreate = !item.authorPassed
    return (
      <Menu onClick={e => this.handleSelectManager(e, item)}>
        {!isFirstCreate && <Menu.Item key='createManage'>创作管理</Menu.Item>}
        {!isFirstCreate && <Menu.Item key='statistics'>创作统计</Menu.Item>}
        <Menu.Item key='account'>资料与账户</Menu.Item>
      </Menu>
    )
  }

  render() {
    const { create } = this.state
    const { state, query, currentUser, mineInsList } = this.props
    const { tab, type, id } = query
    const orgLen = toJS(mineInsList).length > 0

    if (create) {
      return <CreateInsContainer />
    }

    if (!state) {
      return <PartLoading />
    }

    return (
      <div className='institution-container'>
        {!orgLen && <div className='title-line'>
          您目前还没有加入或创建任何创作者
                </div>}
        {!!orgLen && <div className='title-line'>
          管理创作者
                    {/* <a onClick={this.handleCreate}><Icon type='plus-circle' theme='filled' />&nbsp;&nbsp;创建创作者&nbsp;&nbsp;&nbsp;</a> */}
          <Button className="primary-o" href="/creator" target="_blank" style={{ color: '#168dd7', fontSize: '12px', lineHeight: '28px', height: '28px' }}>
            <Icon type='plus-circle' theme='filled' className='join-icon' />
            <span className='name'>创建新创作者</span>
          </Button>
        </div>}
        {!orgLen && <ul className='empty-ins-list clearfix'>
          <li onClick={this.handleCreate}>
            {/* <a href={`/usercenter/${type}/${id}/createinstitution`}> */}
            <Icon type='plus-circle' theme='filled' className='join-icon' />
            <span className='name'>创建新创作者</span>
            {/* </a> */}
          </li>
        </ul>}
        {!!orgLen &&
          <div className='ins-content'>
            {/* <div className='ins-title'>我创建的</div> */}
            <div className="user-author-list">
              {mineInsList.map(item => {
                // const isClosed = item.status === AuthorStatus.CLOSED
                const edition = item.edition || { editionType: EditionType.FREE }
                const extraService = item.extraService || []
                const extraServiceTypes = extraService.map(s => s.editionType)
                const isFreeEdition = edition.editionType === EditionType.FREE
                const isStundardEdition = edition.editionType === EditionType.STANDARD
                const hasService = extraService.length > 0
                const editionLabel = editionMap[edition.editionType]
                const serviceTypeLabel = extraServiceTypes.map(v => serviceMap[v]).join(' + ')
                const expireLabel = isFreeEdition ? '永久' : `${moment(edition.gmtExpire).format('YYYY-MM-DD')} 到期`
                const isFirstCreate = !item.authorPassed
                const isFirstCreateRefused = isFirstCreate && item.status === AuthorStatus.REFUSED
                const isAuditing = item.status === AuthorStatus.AUDITING
                const isUpdateAuditing = item.status === AuthorStatus.UPDATE_AUDITING
                const isClosed = item.status === AuthorStatus.CLOSED
                // const isRefused = item.status === AuthorStatus.REFUSED
                let statusLabel = ''
                let targetUrl = ''
                let targetLabel = '创作者管理中心'
                let authorUrl = null
                if (isClosed) {
                  targetUrl = null
                } else if (!isFirstCreate) {
                  targetUrl = `/teams/${item.id}/creation`
                  authorUrl = `/author/${item.code}`
                } else {
                  authorUrl = null
                  switch (item.type) {
                    case AuthorType.PERSONAL:
                      targetLabel = '修改资料'
                      targetUrl = `/creator/personal/${item.id}`
                      break
                    case AuthorType.BRANDER:
                      targetLabel = '修改资料'
                      targetUrl = `/creator/brand/${item.id}`
                      break
                    case AuthorType.SERVER:
                      targetLabel = '修改资料'
                      targetUrl = `/creator/service/${item.id}`
                      break
                    case AuthorType.EDITOR:
                      targetUrl = `/teams/${item.id}/account`
                      break
                  }
                }
                if (isFirstCreateRefused) {
                  statusLabel = '[未通过审核]'
                } else if (isAuditing) {
                  statusLabel = '[待审核]'
                } else if (isUpdateAuditing) {
                  statusLabel = '[更新待审核]'
                } else if (isClosed) {
                  statusLabel = '[已关闭]'
                }

                return (
                  // <InsSummaryMod 
                  //     key={item.id || item.compositionId}
                  //     item={item}
                  // >
                  //     {!isClosed && <div className='operation-box'>
                  //         <Dropdown overlay={e => this.renderMenu(e, item)} trigger={['click']}>
                  //             <div className='operation-name'>管理 <Icon type='down' /></div>
                  //         </Dropdown>
                  //         <Button className='operation-publish' type='primary' onClick={this.handlePublish}>发布</Button>
                  //     </div>}
                  // </InsSummaryMod>
                  <div className="user-author-item" key={item.id}>
                    <div className="author-avatar">
                      <a href={authorUrl} target="_blank"><Avatar size={50} src={item.avatar} /></a>
                    </div>
                    <div className="author-content">
                      <div className="author-nickname"><Tooltip title={item.nickname}><a href={authorUrl} target="_blank">{item.nickname}</a></Tooltip> <AuthorAuthenticationIcon hide={isFreeEdition} /> {statusLabel ? <span style={{ color: '#ff0000' }}>{statusLabel}</span> : ''}</div>
                      <div className="author-intro">
                        <span className='author-role'>创建者</span>
                        <UserIdentityComp currentType={item.type} editionType={edition.editionType} />
                        {/* <AuthorEditionTag editionType={edition.editionType} authorType={item.type} style={{marginLeft: '10px'}} /> */}
                        <span className="author-company"><Tooltip title={item.name}>{item.name}</Tooltip></span>
                      </div>
                      <div className="author-edition">
                        <p className="edition-info">版本套餐：{editionLabel}</p>
                        {hasService && <p className="edition-info">增值服务：{serviceTypeLabel}</p>}
                        {!isFreeEdition && <p className="edition-info">到期时间：{expireLabel}</p>}
                      </div>
                      <div className="bottom">
                        <Button type="primary" size="small" href={targetUrl} target="_blank" disabled={isClosed}>{targetLabel}</Button>
                        {!isClosed && <>
                          {isFreeEdition && !isAuditing && <Button className="btn-upgrade" type="primary" href={`/pricing?scope=1&v=${EditionType.STANDARD}&aid=${item.id}`} target="_blank">升级版本</Button>}
                          {!isFreeEdition && <Button className="btn-upgrade" type="primary" href={`/pricing?scope=1&v=${edition.editionType}&aid=${item.id}`} target="_blank">续费套餐</Button>}
                          {isStundardEdition && <Button className="btn-upgrade primary-o" href={`/pricing?scope=1&v=${EditionType.ADVANCED}&aid=${item.id}`} target="_blank">升级版本</Button>}
                          {!isFreeEdition && <Button className="btn-upgrade primary-o" href={`/pricing?scope=2&added=${extraServiceTypes.join(',')}&aid=${item.id}`} target="_blank">购买增值功能</Button>}
                        </>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        }
      </div>
    )
  }
}