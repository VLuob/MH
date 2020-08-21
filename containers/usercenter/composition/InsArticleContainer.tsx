import { Component } from 'react'
import { Router } from '@routes'
import { utils } from '@utils'
import { Row, Col, Icon, Menu } from 'antd'
import { inject, observer } from 'mobx-react'
import { CreationType, CompositionType, CreationShowType, InsComType, CompositionOperateType, AuthorType } from '@base/enums'
import { toJS } from 'mobx'
import moment from 'moment'

import ClassifyTab from '@components/common/ClassifyTab'
import PartLoading from '@components/features/PartLoading'
import ClassifyTabs from '@components/common/ClassifyTabs'
import DetailHeader from '@components/author/DetailHeader'
import ArticleItem from '@components/article/ArticleItem'
import DeleteModal from '@components/usercenter/DeleteModal'
import EmptyComponent from '@components/common/EmptyComponent'
// import ArticleBriefComp from '@components/common/ArticleBriefComp'

const menuList = [{
  id: 0,
  name: `机构文章`
}, /* {
    id: 1,
    name: `成员文章`
}, {
    id: 2,
    name: `机构主页公开文章`
} */]
let fn
let countFn
let curParam = {}
@inject(stores => {
  const { userCenterStore, compositionStore } = stores.store
  const {
    createKeys,
    creationStat,
    changeCreateKeys,
    createArticleData,
    createArticleParam,
    fetchGetCreationStat,
    fetchDeleteComposition,
    fetchOperateComposition,
    fetchSetSettingOperator,
    fetchGetSettingComposition,
  } = userCenterStore

  return {
    compositionStore,
    createKeys,
    creationStat,
    changeCreateKeys,
    createArticleData,
    createArticleParam,
    fetchGetCreationStat,
    fetchDeleteComposition,
    fetchOperateComposition,
    fetchSetSettingOperator,
    fetchGetSettingComposition,
  }
})
@observer
export default class InsArticleContainer extends Component {
  state = {
    currentKey: 0,
    visible: false,
    currentItem: '',
  }

  async componentDidMount() {
    const { query } = this.props
    const { menu, tab, type, status } = query

    if (status) {
      this.statusChangeFn(Number(status))
    }

    // fetchFavorList({ condition: { type } })
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

  statusChangeFn = key => {
    const { query, createKeys, setInsArticleStatStatus, changeCreateKeys, createArticleParam, fetchGetSettingComposition } = this.props
    const { id } = query
    let params = { composition_type: CompositionType.ARTICLE, published: createKeys.published, org_id: id, ...createArticleParam, page: 1 }
    let currentKey = 0
    let published = createKeys.published
    const insTab = utils.getUrlParam(`type`) || ``

    setInsArticleStatStatus(key)

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
    const { query, createKeys, setInsArticleShowStatus, changeCreateKeys, createArticleParam, fetchGetSettingComposition } = this.props
    const { id } = query
    const showKey = key === 0 ? 1 : 0
    let params = { composition_type: CompositionType.ARTICLE, status: createKeys.status, ...createArticleParam, org_id: id, page: 1 }

    params = { ...params, published: showKey }

    curParam = params
    setInsArticleShowStatus(key)
    fetchGetSettingComposition(params)
    changeCreateKeys({ ...createKeys, published: showKey })
  }

  changeFn = key => {
    const { query, createKeys, createArticleParam, fetchGetSettingComposition } = this.props
    const { id } = query

    this.setState({ currentKey: key })
    fetchGetSettingComposition({ type: key, ...createKeys, composition_type: CompositionType.ARTICLE, ...createArticleParam, org_id: id, page: 1 })
  }

  auditedMenu = item => {
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
        const link = currentAuthor.type === AuthorType.PERSONAL ? `/article/edit/${item.id}` : `/article/edit/${item.id}?orgId=${id}`

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
            countParam: { composition_type: CompositionType.ARTICLE, org_id: id },
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
            countParam: { composition_type: CompositionType.ARTICLE, org_id: id },
            curParam: { ...curParam, ...createKeys }
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
    const {
      query,
      createKeys,
      fetchSetSettingOperator,
      fetchOperateComposition,
    } = this.props
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
        countParam: { composition_type: CompositionType.ARTICLE },
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
        countParam: { composition_type: CompositionType.ARTICLE },
        curParam: { ...curParam, ...createKeys, type: InsComType.INSSHOW, operation: true }
      }
    })
  }

  handlePreview = (compositionId) => {
    const { compositionStore } = this.props
    compositionStore.fetchCompositionPreviewCode({ compositionId }, (res) => {
      if (res.success) {
        window.open(`/article/preview/${res.data}`)
      }
    })
  }

  render() {
    const { currentKey, visible, currentItem } = this.state
    const {
      createKeys,
      creationStat,
      insArticleParam,
      createArticleData,
      fetchGetCreationStat,
      insArticleStatStatus,
      insArticleShowStatus,
      fetchGetSettingComposition,
    } = this.props
    const { state } = createArticleData
    const statusList = this.statusRenderList(creationStat)
    const showList = this.showRenderList(creationStat)

    const item = this.props.item
    const meta = currentKey === InsComType.INS ? `机构文章`
      : currentKey === InsComType.MEMBER ? `成员文章`
        : `机构主页公开文章`

    fn = fetchGetSettingComposition
    countFn = fetchGetCreationStat
    curParam = insArticleParam

    return (
      <div className='ins-prod-container'>
        <div className='classify-tab-box'>
          <ClassifyTab
            tabList={menuList}
            notMore={true}
            changeFn={this.changeFn}
            tabList={menuList}
            borderless={true} />
          <ClassifyTabs
            notMore={true}
            tabName={`状态`}
            borderless={true}
            keys={insArticleStatStatus}
            changeFn={this.statusChangeFn}
            tabList={statusList} />
          {createKeys && createKeys.status === CreationType.PASS && <ClassifyTabs
            notMore={true}
            tabName={`公开`}
            borderless={true}
            keys={insArticleShowStatus}
            changeFn={this.showChangeFn}
            tabList={showList} />}
        </div>
        {/* <DetailHeader meta={''} /> */}
        <div className='ins-prod-content'>
          {state ?
            <>
              {createArticleData && createArticleData.list.length > 0 ?
                <div className='article-list'>
                  {createArticleData.list.map(item => {
                    const isTiming = moment(item.gmtPublished).isAfter(moment())
                    const isPreview = isTiming || item.status === CreationType.AUDITED || item.status === CreationType.DRAFT || item.status === CreationType.REJECT
                    return (
                      <ArticleItem
                        item={item}
                        key={item.compositionId || item.id}
                        id={item.compositionId || item.id}
                        title={item.title}
                        cover={item.cover}
                        summary={item.summary}
                        authorCode={item.authorCode}
                        author={item.authorName}
                        view={item.views}
                        time={item.gmtPublished || item.gmtCreate}
                        isShow={currentKey === InsComType.MEMBER && !item.pageSetting}
                        isRemove={currentKey === InsComType.INSSHOW}
                        isInsComposition={currentKey === InsComType.MEMBER || currentKey === InsComType.INSSHOW}
                        classification={item.classificationName}
                        onPageShow={this.handlePageShow}
                        onPageRemove={this.handlePageRemove}
                        isDropdown
                        status={item.status}
                        published={item.published}
                        isPreview={isPreview}
                        isTiming={isTiming}
                        onPreview={this.handlePreview}
                        menu={e => this.auditedMenu(item)}
                      />
                    )
                  })}
                </div> : <EmptyComponent text='暂未发布任何文章' />
              }
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