import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import { toJS } from 'mobx'
import jsCookie from 'js-cookie'
import { Modal, Button, Spin, message } from 'antd'

import EmptyComponent from '@components/common/EmptyComponent'
import ServiceFilter from '../ServiceFilter'
import ServiceItem from '@components/service/ServiceItem'

import { Router } from '@routes'
import { ServiceStatus } from '@base/enums'
import { utils, config } from '@utils'

import './index.less'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
  loading: () => <p></p>,
  ssr: false
})


@inject(stores => {
  const { userCenterStore, serviceStore, compositionStore } = stores.store
  const { serviceStatusData, serviceListData } = serviceStore
  const {
    curClientUserInfo,
  } = userCenterStore
  return {
    compositionStore,
    serviceStore,
    serviceStatusData,
    serviceListData,
    currentAuthor: curClientUserInfo,
  }
})
@observer
export default class ServiceContainer extends Component {

  componentDidMount() {
    const { query } = this.props
    this.requestStatus()
    this.requestServices({
      status: query.status || ServiceStatus.PASSED,
    })
  }

  requestStatus() {
    const { currentAuthor, serviceStore, query } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const authorId = query.id
    serviceStore.fetchServiceStatus({ token, authorId })
  }

  requestServices(option = {}) {
    const { currentAuthor, serviceStore, serviceListData, query } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const authorId = query.id
    const terms = serviceListData.terms
    const param = {
      ...terms,
      ...option,
      token,
      authorId,
    }
    serviceStore.fetchServices(param)
  }

  handleStatusChange = (status) => {
    const { query } = this.props
    const authorId = query.id
    this.requestServices({
      status,
      pageIndex: 1,
    })
    Router.pushRoute(`/teams/${authorId}/service?status=${status}`)
  }

  handleLoadMore = () => {
    const { serviceListData } = this.props
    const terms = serviceListData.terms
    this.requestServices({
      pageIndex: terms.pageIndex + 1,
    })
  }

  handleEdit = (record) => {
    window.open(`/service/edit/${record.id}?s=${record.status}`)
  }

  handleRemove = (record) => {
    Modal.confirm({
      title: '是否确认删除该服务？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        this.deleteSave(record)
      }
    })
  }

  handlePreview = async (record) => {
    const { serviceStore } = this.props
    const serviceId = record.id
    const response = await serviceStore.fetchServicePreviewCode({serviceId})
    if (response.success) {
      window.open(`/service/preview/${response.data}`)
    } else {
      message.error(response.data.msg)
    }
  }

  async deleteSave(record) {
    const { serviceStore } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const response = await serviceStore.deleteService({ token, ids: record.id })
    if (response.success) {
      message.success('删除成功')
      this.requestStatus()
      this.requestServices()
    } else {
      message.error(response.data.msg || '删除失败')
    }
  }

  render() {
    const { path, query, serviceStatusData, serviceListData } = this.props

    const currentStatus = Number(query.status) || ServiceStatus.PASSED
    const { loading, end, list } = serviceListData
    const isEmpty = list.length === 0

    return (
      <div className="common-container user-common user-service">
        <div className="user-header">
          <div className="user-header-content">
            <div className="user-header-title">我的服务</div>
          </div>
          <div className="user-header-extra">
            <Button href="/service/new" target="_blank">发布服务</Button>
          </div>
        </div>
        <div className="user-content">
          <ServiceFilter
            status={currentStatus}
            statusData={serviceStatusData}
            onChange={this.handleStatusChange}
          />
          <div className="service-list-wrapper">
            {loading && <div className="list-loading">
              <Spin />
            </div>}
            {!isEmpty && <div className="service-list">
              {list.map(item => {
                return (
                  <ServiceItem
                    key={item.id}
                    item={item}
                    showOperation
                    hideAuthor
                    onEdit={this.handleEdit}
                    onRemove={this.handleRemove}
                    onPreview={this.handlePreview}
                  />
                )
              })}
            </div>}
            {isEmpty && <EmptyComponent />}
            {!end && <div className="service-load-more">
              <LoadMore
                num={3}
                reqList={this.handleLoadMore}
              />
            </div>}
          </div>
        </div>
      </div>
    )
  }
}