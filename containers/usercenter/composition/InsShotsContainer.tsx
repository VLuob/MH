import { Component } from 'react'
import { Router } from '@routes'
import { utils } from '@utils'
import { Row, Col, Icon, Menu, Modal } from 'antd'
import { inject, observer } from 'mobx-react'
import { CreationType, CompositionType, CreationShowType, InsComType, CompositionOperateType, AuthorType, EditionType, EditionScope } from '@base/enums'
import dynamic from 'next/dynamic'
import moment from 'moment'
import { toJS } from 'mobx'

import ClassifyTab from '@components/common/ClassifyTab'
import CommonIntro from '@components/common/CommonIntro'
import ClassifyTabs from '@components/common/ClassifyTabs'
import DetailHeader from '@components/author/DetailHeader'
import PartLoading from '@components/features/PartLoading'
import DeleteModal from '@components/usercenter/DeleteModal'
import EmptyComponent from '@components/common/EmptyComponent'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
  loading: () => <p></p>,
  ssr: false
})

const menuList = [{
  id: 0,
  name: `机构作品`
}/* , {
    id: 1,
    name: `成员作品`
}, {
    id: 2,
    name: `机构主页公开作品`
} */]

let fn
let countFn
let curParam = {}
let currentKey = 0
@inject(stores => {
  const { userCenterStore, compositionStore } = stores.store
  const {
    createKeys,
    creationStat,
    changeCreateKeys,
    fetchGetCreationStat,
    createCompositionData,
    fetchDeleteComposition,
    createCompositionParam,
    fetchSetSettingOperator,
    fetchOperateComposition,
    fetchGetSettingComposition,
    fetchProdActionFavor } = userCenterStore

  return {
    compositionStore,
    createKeys,
    creationStat,
    changeCreateKeys,
    fetchGetCreationStat,
    createCompositionData,
    createCompositionParam,
    fetchDeleteComposition,
    fetchOperateComposition,
    fetchSetSettingOperator,
    fetchGetSettingComposition,
    fetchProdActionFavor
  }
})
@observer
export default class InsShotsContainer extends Component {
  state = {
    visible: false,
    currentItem: '',
    currentKey: InsComType.INS
  }

  async componentDidMount() {
    const { query } = this.props
    const { menu, tab, type, status } = query

    if (status) {
      this.statusChangeFn(Number(status))
    }
  }

  showModal = item => {
    this.setState({ visible: true, currentItem: item })
  }

  handleOk = (e, item) => {
    const { query, createKeys, fetchDeleteComposition } = this.props
    const { id } = query

    this.setState({ visible: false })
    fetchDeleteComposition({
      data: {
        compositionId: item.id,
        sourceStatus: item.status
      },
      operate: {
        fn,
        countFn,
        countParam: { composition_type: CompositionType.COMPOSITION, org_id: id },
        curParam: { ...curParam, ...createKeys, operation: true }
      }
    })
  }

  handleCancel = e => {
    this.setState({ visible: false })
  }

  statusRenderList = stat => {
    // const passCount = stat && stat.filter_status && stat.filter_status.filter(l => l.status === CreationType.PASS)[0].count
    // const draftCount = stat && stat.filter_status && stat.filter_status.filter(l => l.status === CreationType.DRAFT)[0].count
    // const refusedCount = stat && stat.filter_status && stat.filter_status.filter(l => l.status === CreationType.REJECT)[0].count
    // const auditedCount = stat && stat.filter_status && stat.filter_status.filter(l => l.status === CreationType.AUDITED)[0].count

    const pass = (stat && stat.filter_status && stat.filter_status.filter(l => l.status === CreationType.PASS)[0]) || {}
    const draft = (stat && stat.filter_status && stat.filter_status.filter(l => l.status === CreationType.DRAFT)[0]) || {}
    const refused = (stat && stat.filter_status && stat.filter_status.filter(l => l.status === CreationType.REJECT)[0]) || {}
    const audited = (stat && stat.filter_status && stat.filter_status.filter(l => l.status === CreationType.AUDITED)[0]) || {}

    const passCount = pass.count || 0
    const draftCount = draft.count || 0
    const refusedCount = refused.count || 0
    const auditedCount = audited.count || 0

    const list = [{
      id: 0,
      name: `已通过 (${passCount})`,
      status: 3
    }, {
      id: 1,
      name: `待审核 (${auditedCount})`,
      status: 2
    }, {
      id: 2,
      name: `未通过 (${refusedCount})`,
      status: 5
    }, {
      id: 3,
      name: `草稿 (${draftCount})`,
      status: 1
    }]

    return list
  }

  showRenderList = stat => {
    const publish = (stat && stat.publish && stat.publish.filter(l => l.published === CreationShowType.SHOW)[0]) || {}
    const hidden = (stat && stat.publish && stat.publish.filter(l => l.published === CreationShowType.HIDDEN)[0]) || {}

    const publishCount = publish.count || 0
    const hiddenCount = hidden.count || 0
    // const publishCount = stat && stat.publish.filter(l => l.published === CreationShowType.SHOW)[0].count
    // const hiddenCount = stat && stat.publish.filter(l => l.published === CreationShowType.HIDDEN)[0].count
    const allCount = publishCount + hiddenCount

    const list = [/* {
            id: 0,
            name: `全部 (${allCount})`,
            published: -1
        }, */ {
        id: 0,
        name: `公开 (${publishCount})`,
        published: 1
      }, {
        id: 1,
        name: `隐藏 (${hiddenCount})`,
        published: 0
      }]

    return list
  }

  changeFn = key => {
    const { query, createKeys, createCompositionParam, fetchGetSettingComposition } = this.props
    const { id } = query

    currentKey = key

    fetchGetSettingComposition({ type: key, org_id: id, ...createKeys, composition_type: CompositionType.COMPOSITION, ...createCompositionParam, page: 1 })
    this.setState({ currentKey: key })
  }

  statusChangeFn = key => {
    const { query, createKeys, setInsStatStatus, changeCreateKeys, createCompositionParam, fetchGetSettingComposition, currentAuthor } = this.props
    const { id } = query
    let params = { composition_type: CompositionType.COMPOSITION, ...createCompositionParam, org_id: id, page: 1 }
    let currentKey = 0
    let published = createKeys.published
    const insTab = utils.getUrlParam(`type`) || ``

    setInsStatStatus(key)

    switch (Number(key)) {
      // 待审核
      case 1:
        currentKey = 2

        break
      // 未通过
      case 2:
        currentKey = 5

        break
      // 草稿
      case 3:
        currentKey = 1

        break
      // 已通过
      case 0:
      default:
        currentKey = 3
        // 首次加载默认请求公开显示作品
        if (!published && published !== 0) {
          published = 1
        }

        break
    }

    params = { ...params, published, status: currentKey }
    curParam = params

    fetchGetSettingComposition(params)
    changeCreateKeys({ ...createKeys, status: currentKey })

    Router.pushRoute(`/teams/${id}/creation?type=${insTab}&status=${key}`)
  }

  showChangeFn = key => {
    const { query, createKeys, setInsShowStatus, changeCreateKeys, createCompositionParam, fetchGetSettingComposition } = this.props
    const { id } = query
    const showKey = key === 0 ? 1 : 0
    let params = { composition_type: CompositionType.COMPOSITION, status: createKeys.status, ...createCompositionParam, org_id: id, page: 1 }

    setInsShowStatus(key)

    params = { ...params, published: showKey }

    curParam = params
    fetchGetSettingComposition(params)
    changeCreateKeys({ ...createKeys, published: showKey })
  }

  auditedMenu = item => {
    // console.log(toJS(item))
    return (
      <Menu onClick={e => this.handleAuditedMenu(e, item)}>
        <Menu.Item key='0'>编辑</Menu.Item>
        {Number(item.published) === CreationShowType.SHOW && Number(item.status) === CreationType.PASS && <Menu.Item key='1'>隐藏</Menu.Item>}
        {Number(item.published) === CreationShowType.HIDDEN && item.published !== null && Number(item.status) === CreationType.PASS && <Menu.Item key='2'>公开</Menu.Item>}
        <Menu.Item key='3'>删除</Menu.Item>
      </Menu>
    )
  }

  handleAuditedMenu = (e, item) => {
    const { query, createKeys, fetchOperateComposition, fetchDeleteComposition, fetchSetSettingOperator, currentAuthor } = this.props
    const { id } = query

    switch (Number(e.key)) {
      case 0:
        const link = currentAuthor.type === AuthorType.PERSONAL ? `/shots/edit/${item.id}` : `/shots/edit/${item.id}?orgId=${id}`

        window.open(link, '_blank')

        break
      case 1:
        fetchOperateComposition({
          data: {
            compositionId: item.id,
            showStatus: CreationShowType.HIDDEN
          },
          operate: {
            fn,
            countFn,
            countParam: { composition_type: CompositionType.COMPOSITION, org_id: id },
            curParam: { ...curParam, ...createKeys }
          }
        })

        // console.log(`隐藏`)

        break
      case 2:
        fetchOperateComposition({
          data: {
            compositionId: item.id,
            showStatus: CreationShowType.SHOW
          },
          operate: {
            fn,
            countFn,
            countParam: { composition_type: CompositionType.COMPOSITION, org_id: id },
            curParam: { ...curParam, ...createKeys }
          }
        }).then(res => {
          if (!res.success && res.data.code === 'E100006') {
            Modal.confirm({
              title: '温馨提示',
              content: '您的账户公开发布作品量已超过限额，您可隐藏其他作品后继续公开该作品，或者购买公开作品库数量。',
              cancelText: '返回修改',
              okText: '在线升级',
              okButtonProps: { className: 'themes' },
              onOk: () => {
                window.open(`/pricing?v=${EditionType.ADVANCED}&scope=${EditionScope.ADDED_SERVICE}&aid=${id}`)
              }
            })
          }
        })

        // console.log(`公开`)

        break
      case 3:
        // fetchDeleteComposition({
        //     data: {
        //         compositionId: item.id,
        //         sourceStatus: item.status
        //     },
        //     operate: {
        //         fn,
        //         countFn,
        //         countParam: { composition_type: CompositionType.COMPOSITION },
        //         curParam: { ...curParam, ...createKeys }
        //     }
        // })

        this.showModal(item)
        // console.log(`删除`)

        break
    }
  }

  handlePageShow = (e, item) => {
    const { query, createKeys, fetchSetSettingOperator, fetchOperateComposition } = this.props
    const { id } = query

    e.preventDefault()

    fetchSetSettingOperator({
      data: {
        type: CompositionOperateType.MARK,
        composition_id: item.id,
        org_id: id
      },
      operate: {
        fn,
        countFn,
        countParam: { composition_type: CompositionType.COMPOSITION },
        curParam: { ...curParam, ...createKeys, type: InsComType.MEMBER, operation: true }
      }
    })
  }

  handlePageRemove = (e, item) => {
    const {
      query,
      createKeys,
      createCompositionData,
      fetchSetSettingOperator,
      fetchOperateComposition,
    } = this.props
    const { id } = query

    e.preventDefault()

    fetchSetSettingOperator({
      data: {
        type: CompositionOperateType.REMOVE,
        composition_id: item.id,
        org_id: id
      },
      operate: {
        fn,
        countFn,
        countParam: { composition_type: CompositionType.COMPOSITION },
        curParam: { ...curParam, ...createKeys, type: InsComType.INSSHOW, operation: true }
      }
    })
  }

  reqComposition = () => {
    const { query, createKeys, createCompositionParam, fetchGetSettingComposition } = this.props
    const { id } = query
    let params = { ...createKeys, type: currentKey, composition_type: CompositionType.COMPOSITION, ...createCompositionParam, org_id: id, page: createCompositionParam.page + 1 }

    fetchGetSettingComposition(params)
  }

  handlePreview = (compositionId) => {
    const { compositionStore } = this.props
    compositionStore.fetchCompositionPreviewCode({ compositionId }, (res) => {
      if (res.success) {
        window.open(`/shots/preview/${res.data}`)
      }
    })
  }

  render() {
    const { visible, currentKey, currentItem } = this.state
    const {
      createKeys,
      creationStat,
      insStatStatus,
      insShowStatus,
      insCreationParam,
      fetchGetCreationStat,
      fetchProdActionFavor,
      createCompositionData,
      createCompositionParam,
      fetchGetSettingComposition,
    } = this.props
    const { state } = createCompositionData
    const item = this.props.item
    const meta = currentKey === InsComType.INS ? `机构作品`
      : currentKey === InsComType.MEMBER ? `成员作品`
        : `机构主页公开作品`

    const statusList = this.statusRenderList(creationStat)
    const showList = this.showRenderList(creationStat)

    fn = fetchGetSettingComposition
    countFn = fetchGetCreationStat
    curParam = insCreationParam

    return (
      <div className='ins-prod-container'>
        <div className='classify-tab-box'>
          <ClassifyTab
            notMore={true}
            tabList={menuList}
            changeFn={this.changeFn}
            borderless={true} />
          {currentKey === InsComType.INS && <ClassifyTabs
            keys={insStatStatus}
            notMore={true}
            tabName={`状态`}
            borderless={true}
            changeFn={this.statusChangeFn}
            tabList={statusList} />}
          {currentKey === InsComType.INS && createKeys && createKeys.status === CreationType.PASS && <ClassifyTabs
            keys={insShowStatus}
            notMore={true}
            tabName={`公开`}
            borderless={true}
            changeFn={this.showChangeFn}
            tabList={showList} />}
        </div>
        {/* <DetailHeader meta={''} /> */}
        <div className='ins-prod-content'>
          {state ? <>
            {createCompositionData && createCompositionData.list.length > 0 ? <Row type='flex' align='middle' justify='start' gutter={30}>
              {createCompositionData.list.map(item => {
                const isTiming = moment(item.gmtPublished).isAfter(moment())
                const isPreview = isTiming || item.status === CreationType.AUDITED || item.status === CreationType.DRAFT || item.status === CreationType.REJECT
                // console.log('isTiming', isTiming, moment(item.gmtPublished).format('YYYY-MM-DD HH:mm'))
                return (
                  <Col key={item.id}>
                    <CommonIntro
                      brand
                      item={item}
                      isDropdown={true}
                      onFavor={fetchProdActionFavor}
                      menu={e => this.auditedMenu(item)}
                      handlePageShow={this.handlePageShow}
                      handlePageRemove={this.handlePageRemove}
                      isRemove={currentKey === InsComType.INSSHOW}
                      isShow={currentKey === InsComType.MEMBER && !item.pageSetting}
                      isInsComposition={currentKey === InsComType.MEMBER && currentKey === InsComType.INSSHOW}
                      isTiming={isTiming}
                      isPreview={isPreview}
                      onPreview={this.handlePreview}
                    />
                  </Col>
                )
              })}
            </Row> : <EmptyComponent text='未找到相关作品' />}
            {!createCompositionData.isLastPage && <LoadMore name={`加载更多`} num={createCompositionParam.page}
              status={createCompositionData.state} reqList={this.reqComposition} />}
          </> : <PartLoading />}
          <DeleteModal
            visible={visible}
            onCancel={this.handleCancel}
            onConfirm={e => this.handleOk(e, currentItem)}
          />
        </div>
      </div>
    )
  }
}