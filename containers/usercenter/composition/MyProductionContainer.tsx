import { Component } from 'react'
import { Row, Col, Menu, Modal, Button } from 'antd'
import { toJS } from 'mobx'
import { utils } from '@utils'
import dynamic from 'next/dynamic'
import { Router } from '@routes'
import { inject, observer } from 'mobx-react'
import { CreationType, CompositionType, CreationShowType } from '@base/enums'

// import ClassifyTab from '@components/common/ClassifyTab'
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

let curParam = {}
let fn
let countFn
@inject(stores => {
  const { userCenterStore, compositionStore } = stores.store
  const {
    createKeys,
    creationStat,
    compFilterData,
    changeCreateKeys,
    focusArticleData,
    focusArticleParam,
    fetchProdActionFavor,
    fetchGetCreationStat,
    createCompositionData,
    createCompositionParam,
    fetchDeleteComposition,
    fetchSetSettingOperator,
    fetchOperateComposition,
    fetchGetSettingComposition,
  } = userCenterStore

  return {
    compositionStore,
    createKeys,
    creationStat,
    compFilterData,
    changeCreateKeys,
    focusArticleData,
    focusArticleParam,
    fetchGetCreationStat,
    fetchProdActionFavor,
    createCompositionData,
    createCompositionParam,
    fetchDeleteComposition,
    fetchSetSettingOperator,
    fetchOperateComposition,
    fetchGetSettingComposition,
  }
})
@observer
export default class MyProductionContainer extends Component {
  state = {
    visible: false,
    currentItem: ''
  }

  showModal = item => {
    this.setState({ visible: true, currentItem: item })
  }

  handleOk = (e, item) => {
    const { createKeys, fetchDeleteComposition } = this.props

    this.setState({ visible: false })
    fetchDeleteComposition({
      data: {
        compositionId: item.id,
        sourceStatus: item.status
      },
      operate: {
        fn,
        countFn,
        countParam: { composition_type: CompositionType.COMPOSITION },
        curParam: { ...curParam, ...createKeys, operation: true }
      }
    })
  }

  handleCancel = e => {
    this.setState({ visible: false })
  }

  statusRenderList = stat => {
    const pass = (stat && stat.filter_status && stat.filter_status.filter(l => l.status === CreationType.PASS)[0]) || {}
    const draft = (stat && stat.filter_status && stat.filter_status.filter(l => l.status === CreationType.DRAFT)[0]) || {}
    const refused = (stat && stat.filter_status && stat.filter_status.filter(l => l.status === CreationType.REJECT)[0]) || {}
    const audited = (stat && stat.filter_status && stat.filter_status.filter(l => l.status === CreationType.AUDITED)[0]) || {}

    const passCount = pass.count || 0
    const draftCount = draft.count || 0
    const refusedCount = refused.count || 0
    const auditedCount = audited.count || 0

    // const passCount = stat && stat.filter_status && stat.filter_status.filter(l => l.status === CreationType.PASS)[0].count
    // const draftCount = stat && stat.filter_status && stat.filter_status.filter(l => l.status === CreationType.DRAFT)[0].count
    // const refusedCount = stat && stat.filter_status && stat.filter_status.filter(l => l.status === CreationType.REJECT)[0].count
    // const auditedCount = stat && stat.filter_status && stat.filter_status.filter(l => l.status === CreationType.AUDITED)[0].count

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
        name: `显示 (${publishCount})`,
        published: 1
      }, {
        id: 1,
        name: `隐藏 (${hiddenCount})`,
        published: 0
      }]

    return list
  }

  statusChangeFn = key => {
    const { createKeys, setStatStatus, userCenterInfo, changeCreateKeys, createCompositionParam, fetchGetSettingComposition } = this.props
    let params = { composition_type: CompositionType.COMPOSITION, ...createCompositionParam, org_id: userCenterInfo.authorId, page: 1 }
    let currentKey = 0
    const myTab = utils.getUrlParam(`type`) || ``

    setStatStatus(key)

    switch (Number(key)) {
      case 1:
        currentKey = 2

        break
      case 2:
        currentKey = 5

        break
      case 3:
        currentKey = 1

        break
      case 0:
      default:
        currentKey = 3

        break
    }

    params = { ...params, published: createKeys.published, status: currentKey }
    curParam = params

    fetchGetSettingComposition(params)
    changeCreateKeys({ ...createKeys, status: currentKey })

    Router.pushRoute(`/personal/creation?type=${myTab}&status=${key}`)
  }

  handleAuditedMenu = (e, item) => {
    const {
      query,
      createKeys,
      fetchDeleteComposition,
      fetchOperateComposition,
      fetchSetSettingOperator,
    } = this.props
    const { id } = query

    switch (Number(e.key)) {
      case 0:
        const link = !id ? `/shots/edit/${item.id}` : `/shots/edit/${item.id}?orgId=${id}`

        window.open(link, '_blank')

        break
      case 1:
        // fetchSetSettingOperator({ 
        //     data: {
        //         type: 2, 
        //         composition_id: item.id,
        //     },
        //     operate: {
        //         fn, 
        //         curParam: { ...curParam, ...createKeys }
        //     }})

        fetchOperateComposition({
          data: {
            compositionId: item.id,
            showStatus: CreationShowType.HIDDEN
          },
          operate: {
            fn,
            countFn,
            countParam: { composition_type: CompositionType.COMPOSITION },
            curParam: { ...curParam, ...createKeys }
          }
        })

        break
      case 2:
        // fetchSetSettingOperator({
        //     data: { 
        //         type: 3, 
        //         composition_id: item.id, 
        //     },
        //     operate: {
        //         fn, 
        //         curParam: { ...curParam, ...createKeys }
        //     }
        // })

        fetchOperateComposition({
          data: {
            compositionId: item.id,
            showStatus: CreationShowType.SHOW
          },
          operate: {
            fn,
            countFn,
            countParam: { composition_type: CompositionType.COMPOSITION },
            curParam: { ...curParam, ...createKeys }
          }
        })

        // console.log(`公开`)

        break
      case 3:
        // fetchSetSettingOperator({
        //     data: {
        //         type: 1,
        //         composition_id: item.id,
        //     },
        //     operate: {
        //         fn,
        //         curParam: { ...curParam, ...createKeys }
        //     }
        // })

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

  auditedMenu = item => {
    return (
      <Menu onClick={e => this.handleAuditedMenu(e, item)}>
        <Menu.Item key='0'>编辑</Menu.Item>
        {Number(item.published) === CreationShowType.SHOW && Number(item.status) === CreationType.PASS && <Menu.Item key='1'>隐藏</Menu.Item>}
        {Number(item.published) === CreationShowType.HIDDEN && item.published !== null && Number(item.status) === CreationType.PASS && <Menu.Item key='2'>显示</Menu.Item>}
        <Menu.Item key='3'>删除</Menu.Item>
      </Menu>
    )
  }

  showChangeFn = key => {
    const { createKeys, setShowStatus, userCenterInfo, changeCreateKeys, createCompositionParam, fetchGetSettingComposition } = this.props
    const showKey = key === 0 ? 1 : 0
    let params = { composition_type: CompositionType.COMPOSITION, status: createKeys.status, ...createCompositionParam, org_id: userCenterInfo.authorId, page: 1 }

    setShowStatus(key)

    params = { ...params, published: showKey }

    curParam = params
    fetchGetSettingComposition(params)
    changeCreateKeys({ ...createKeys, published: showKey })
  }

  reqComposition = () => {
    const { createKeys, userCenterInfo, createCompositionParam, fetchGetSettingComposition } = this.props
    let params = { composition_type: CompositionType.COMPOSITION, ...createKeys, ...createCompositionParam, org_id: userCenterInfo.authorId, page: createCompositionParam.page + 1 }

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
    const { visible, currentItem } = this.state
    const {
      createKeys,
      statStatus,
      showStatus,
      creationStat,
      myCreationParam,
      fetchGetCreationStat,
      fetchProdActionFavor,
      createCompositionData,
      fetchGetSettingComposition,
    } = this.props
    const { state } = createCompositionData
    const statusList = this.statusRenderList(creationStat)
    const showList = this.showRenderList(creationStat)

    fn = fetchGetSettingComposition
    countFn = fetchGetCreationStat
    curParam = myCreationParam

    return (
      <div className='my-production-box'>
        <div className='classify-tab-box'>
          <ClassifyTabs
            keys={statStatus}
            notMore={true}
            tabName={`状态`}
            borderless={true}
            changeFn={this.statusChangeFn}
            tabList={statusList} 
          />
          {createKeys && createKeys.status === CreationType.PASS && <ClassifyTabs
            keys={showStatus}
            notMore={true}
            tabName={`显示`}
            borderless={true}
            changeFn={this.showChangeFn}
            tabList={showList} 
          />}
        </div>
        {!!state ? <div className='my-production-content'>
          <DetailHeader meta={`共创作了${createCompositionData.count}组作品`} />
          {createCompositionData && createCompositionData.list.length > 0 ? <Row type='flex' gutter={30} align='middle' justify='start'>
            {createCompositionData.list.map(item => {
              return (
                <Col key={item.id}>
                  <CommonIntro
                    brand
                    item={item}
                    isDropdown={true}
                    isPreview={item.status === CreationType.AUDITED || item.status === CreationType.DRAFT || item.status === CreationType.REJECT}
                    // menu={e => this.auditedMenu(item.status === 2, createKeys.published === 0, item)}
                    menu={e => this.auditedMenu(item)}
                    onFavor={fetchProdActionFavor}
                    onPreview={this.handlePreview}
                  />
                </Col>
              )
            })}
          </Row> : <EmptyComponent text='暂未发布任何作品' />}
          {!createCompositionData.isLastPage && <LoadMore name={`加载更多`} num={myCreationParam.page}
            status={createCompositionData.state} reqList={this.reqComposition} />}
        </div> : <PartLoading />}
        <DeleteModal
          visible={visible}
          onCancel={this.handleCancel}
          onConfirm={e => this.handleOk(e, currentItem)}
        />
      </div>
    )
  }
}