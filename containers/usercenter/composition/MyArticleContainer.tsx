import { Component } from 'react'
import { Row, Col, Menu, message } from 'antd'
import dynamic from 'next/dynamic'
import { Router } from '@routes'
import { utils } from '@utils'
import { inject, observer } from 'mobx-react'
import { CreationType, CompositionType, CreationShowType } from '@base/enums'
import { toJS } from 'mobx'

// import ClassifyTab from '@components/common/ClassifyTab'
import CommonIntro from '@components/common/CommonIntro'
import ClassifyTabs from '@components/common/ClassifyTabs'
import PartLoading from '@components/features/PartLoading'
import DetailHeader from '@components/author/DetailHeader'
import ArticleItem from '@components/article/ArticleItem'
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
        createArticleData, 
        createArticleParam,
        fetchGetCreationStat,
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
        createArticleData,
        createArticleParam,
        fetchGetCreationStat,
        fetchDeleteComposition,
        fetchSetSettingOperator,
        fetchOperateComposition,
        fetchGetSettingComposition,
    }
})
@observer
export default class MyArticleContainer extends Component {
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
        const { createKeys, setStatArticleStatus, changeCreateKeys, userCenterInfo, createArticleParam, fetchGetSettingComposition } = this.props
        let params = { composition_type: CompositionType.ARTICLE, published: createKeys.published, ...createArticleParam, org_id: userCenterInfo.authorId, page: 1 }
        let currentKey = 0
        const myTab = utils.getUrlParam(`type`) || ``

        setStatArticleStatus(key)

        switch(Number(key)) {
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

    showChangeFn = key => {
        const { createKeys, setShowArticleStatus, changeCreateKeys, userCenterInfo, createArticleParam, fetchGetSettingComposition } = this.props
        const showKey = key === 0 ? 1 : 0 
        let params = { composition_type: CompositionType.ARTICLE, status: createKeys.status, ...createArticleParam, org_id: userCenterInfo.authorId, page: 1 }

        params = { ...params, published: showKey }

        curParam = params
        setShowArticleStatus(key)
        fetchGetSettingComposition(params)
        changeCreateKeys({ ...createKeys, published: showKey })
    }

    reqComposition = () => {
        const { query, createKeys, userCenterInfo, createArticleParam, fetchGetSettingComposition } = this.props
        let params = { composition_type: CompositionType.ARTICLE, ...createKeys, ...createArticleParam, org_id: userCenterInfo.authorId, page: createArticleParam.page + 1 }

        fetchGetSettingComposition(params)
    }

    handleAuditedMenu = (e, item) => {
        const { query, createKeys, fetchOperateComposition, fetchDeleteComposition } = this.props
        const { id } = query

        switch(Number(e.key)) {
            case 0:
                window.open(`/article/edit/${item.id}`, '_blank')

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
                        countParam: { composition_type: CompositionType.ARTICLE },
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
                        countParam: { composition_type: CompositionType.ARTICLE },
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
                //         org_id: id
                //     },
                //     operate: {
                //         fn,
                //         curParam: { ...curParam, ...createKeys }
                //     }
                // })
                fetchDeleteComposition({
                    data: {
                        compositionId: item.id,
                        sourceStatus: item.status
                    },
                    operate: {
                        fn,
                        countFn,
                        countParam: { composition_type: CompositionType.ARTICLE },
                        curParam: { ...curParam, ...createKeys }
                    }
                })

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

    handlePreview = (compositionId) => {
        const { compositionStore } = this.props
        compositionStore.fetchCompositionPreviewCode({compositionId}, (res) => {
            if (res.success) {
                window.open(`/article/preview/${res.data}`)
            }
        })
    }

    render() {
        const { visible, currentItem } = this.props
        const { 
            createKeys, 
            creationStat,
            myArticleParam, 
            statArticleStatus, 
            showArticleStatus, 
            createArticleData, 
            createArticleParam, 
            fetchGetCreationStat,
            fetchGetSettingComposition 
        } = this.props
        const { state } = createArticleData
        const statusList = this.statusRenderList(creationStat)
        const showList = this.showRenderList(creationStat)

        countFn = fetchGetCreationStat
        fn = fetchGetSettingComposition
        curParam = myArticleParam

        return (
            <div className='my-production-box'>
                <div className='classify-tab-box'>
                {/* <ClassifyTab
                    tabName={`专辑`}
                    borderless={true}
                    tabList={menuList} /> */}
                    <ClassifyTabs
                        notMore={true}
                        tabName={`状态`}
                        borderless={true}
                        keys={statArticleStatus}
                        changeFn={this.statusChangeFn}
                        tabList={statusList} />
                    {createKeys && createKeys.status === CreationType.PASS && <ClassifyTabs
                        notMore={true}
                        tabName={`显示`}
                        borderless={true}
                        keys={showArticleStatus}
                        changeFn={this.showChangeFn}
                        tabList={showList} />}
                </div>
                <div className='my-production-content'>
                    {state ? <> 
                        <DetailHeader meta={`共创作了${createArticleData.count}篇文章`} />
                        {createArticleData && createArticleData.list.length > 0 ? 
                            <div className='article-list'>
                                {createArticleData.list.map(item => {
                                    return (
                                        <ArticleItem 
                                            isDropdown 
                                            item={item}
                                            key={item.compositionId || item.id}
                                            id={item.compositionId || item.id}
                                            title={item.title}
                                            cover={item.cover}
                                            summary={item.summary}
                                            authorCode={item.authorCode}
                                            author={item.authorName}
                                            view={item.views}
                                            time={item.gmtPublished || item.gmtModified || item.gmtCreate}
                                            classification={item.classificationName}
                                            status={item.status}
                                            isPreview={item.status === CreationType.AUDITED || item.status === CreationType.DRAFT || item.status === CreationType.REJECT}
                                            onPreview={this.handlePreview}
                                            menu={e => this.auditedMenu(item)}
                                        />
                                    )
                                })}
                            </div> : <EmptyComponent text='暂未发布任何文章' />}
                        {!createArticleData.isLastPage && <LoadMore name={`加载更多`} num={createArticleParam.page}
                            status={createArticleData.state} reqList={this.reqComposition} style={{ marginTop: '20px' }}  />}
                    </> : <PartLoading/>}
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