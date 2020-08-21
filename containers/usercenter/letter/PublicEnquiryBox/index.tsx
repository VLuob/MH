import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import { toJS } from 'mobx'
import jsCookie from 'js-cookie'
import classnames from 'classnames'
import moment from 'moment'
import { message, Modal, Spin, Dropdown, Tooltip, Menu, Pagination } from 'antd'

import EmptyComponent from '@components/common/EmptyComponent'
import CustomIcon from '@components/widget/common/Icon'
import PublicEnquiryFilter from '../PublicEnquiryFilter'

import { Router } from '@routes'
import { PublicEnquiryStatus } from '@base/enums'
import { utils, config } from '@utils'

import './index.less'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
  loading: () => <p></p>,
  ssr: false
})

@inject(stores => {
  const { letterStore, enquiryStore } = stores.store
  const { publicEnquiryData, publicEnquiryStatusData } = letterStore

  return {
    enquiryStore,
    letterStore,
    publicEnquiryData,
    publicEnquiryStatusData,
  }
})
@observer
class PublicEnquiryBox extends Component {

  componentDidMount() {
    const { query } = this.props
    this.requestStatus()
    this.requestEnquirys({
      status: query.status || PublicEnquiryStatus.PASSED,
    })
  }

  requestStatus() {
    const { letterStore } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    letterStore.fetchPublicEnquiryStatus({ token })
  }

  requestEnquirys(option = {}) {
    const { letterStore, publicEnquiryData, query } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const terms = publicEnquiryData.terms
    const param = {
      ...terms,
      ...option,
      token,
    }
    letterStore.fetchPublicEnquirys(param)
  }

  handleStatusChange = (status) => {
    this.requestEnquirys({
      status,
      pageIndex: 1,
    })
    Router.pushRoute(`/personal/letter/public?status=${status}`)
  }

  handleLoadMore = () => {
    const { publicEnquiryData } = this.props
    const terms = publicEnquiryData.terms
    this.requestEnquirys({
      pageIndex: terms.pageIndex + 1,
    })
  }

  handlePagination = (pageIndex, size) => {
    this.requestEnquirys({pageIndex})
  }

  handleOpen = async (record) => {
    const { enquiryStore } = this.props
    if (record.status === PublicEnquiryStatus.PASSED) {
      window.open(`/enquiry/${record.id}`)
    } else {
      const enquiryId = record.id
      const response = await enquiryStore.fetchEnquiryPreviewCode({enquiryId})
      if (response.success) {
        const enquiryCode = response.data
        window.open(`/enquiry/preview/${enquiryCode}`)
      } else {
        message.error(response.data.msg)
      }
    }
  }
  handleEdit = (record) => {
    window.open(`/enquiry/edit/${record.id}`)
  }
  handleDelete = (record) => {
    Modal.confirm({
      title: '是否确认删除该询价?',
      cancelText: '取消',
      okText: '确定',
      onOk: () => {
        this.handleDeleteSave(record)
      }
    })
  }
  handleDeleteSave = async (record) => {
    const { enquiryStore } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const enquiryId = record.id
    const response = await enquiryStore.deleteEnquiry({token, enquiryId})
    if (response.success) {
      message.success('删除成功')
      this.requestStatus()
      this.requestEnquirys()
    } else {
      message.error(response.data.msg)
    }
  }

  render() {
    const { query, publicEnquiryStatusData, publicEnquiryData } = this.props

    const currentStatus = Number(query.status) || PublicEnquiryStatus.PASSED
    const { loading, end, list, total, terms } = publicEnquiryData
    const { pageIndex, pageSize } = terms
    const isEmpty = list.length === 0

    return (
      <div className="user-content-container user-enquiry-container">
        <PublicEnquiryFilter
          status={currentStatus}
          statusData={publicEnquiryStatusData}
          onChange={this.handleStatusChange}
        />
        <div className="enquiry-list-wrapper">
          {loading && <div className="list-loading">
            <Spin />
          </div>}
          {!isEmpty && <div className="enquiry-list">
            {list.map(item => {
              const contactInfo = JSON.parse(item.contactInfo || '{}')
              const isEdit = !!item.gmtEdit
              const gmtTime = isEdit ? item.gmtEdit : (item.gmtPublished || item.gmtCreate)
              const dateStr = moment(gmtTime).format('YYYY-MM-DD')
              return (
                <div className="enquiry-item" key={item.id}>
                  <div className="enquiry-item-content-wrapper">
                    <div className="enquiry-item-content">
                      <Tooltip title={`询价内容：${item.content}`} >
                        <a onClick={e => this.handleOpen(item)}>{item.content}</a>
                      </Tooltip>
                    </div>
                    <div className="enquiry-item-intro">
                      <Tooltip title={`创意形式：${item.formName}`}><a className="tag-form" target="_blank">{item.formName}</a></Tooltip>
                      <Tooltip title={`机构名称：${contactInfo.company}`}><span className="company">{contactInfo.company}</span></Tooltip>
                      <Tooltip title={`${isEdit ? '编辑' : '发布'}日期：${dateStr}`}><span className="date">{dateStr}{isEdit ? ' 编辑' : ''}</span></Tooltip>
                    </div>
                  </div>
                  <div className="enquiry-item-price-wrapper">
                    <div className="enquiry-item-price">
                      <Tooltip title={`预算：${item.budget}`}><span>{item.budget}</span></Tooltip>
                    </div>
                    <div className="enquiry-item-extra">
                      <Dropdown
                        placement="bottomRight"
                        overlay={<Menu>
                          <Menu.Item key="edit" onClick={e => this.handleEdit(item)}>编辑</Menu.Item>
                          <Menu.Item key="delete" onClick={e => this.handleDelete(item)}>删除</Menu.Item>
                        </Menu>}
                      >
                        <CustomIcon name="ellipsis" />
                      </Dropdown>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>}
          {!isEmpty && <div className="comment-footer">
            <Pagination
              showQuickJumper
              hideOnSinglePage
              defaultCurrent={pageIndex}
              current={pageIndex}
              pageSize={pageSize}
              total={total}
              onChange={this.handlePagination}
            />
          </div>}
          {isEmpty && <EmptyComponent />}
          {/* {!end && <div className="service-load-more">
            <LoadMore
              num={3}
              reqList={this.handleLoadMore}
            />
          </div>} */}
        </div>
      </div>
    )
  }
}

export default PublicEnquiryBox