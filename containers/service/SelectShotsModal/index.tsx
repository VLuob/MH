import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import jsCookie from 'js-cookie'
import classnames from 'classnames'
import { Modal, Input, Button, Pagination, Spin, message } from 'antd'
import { toJS } from 'mobx'

import { CompositionTypes } from '@base/enums'
import CustomIcon from '@components/widget/common/Icon'

import { config } from '@utils'

import './index.less'

const Search = Input.Search

@inject(stores => {
  const { serviceStore, globalStore } = stores.store
  const { serverClientCode } = globalStore
  const { authorShotsData } = serviceStore
  return {
    serviceStore,

    serverClientCode,
    authorShotsData,
  }
})
@observer
class SelectShotsModal extends Component {
  state = {
    selectedRows: [],
  }
  componentDidMount() {
    this.requestAuthorShots()
  }

  requestAuthorShots = async ({page, limit, ...rest}:any={}) => {
    const { authorId, serverClientCode, serviceStore } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const client = serverClientCode
    const param = {
      token,
      client,
      terms: {
        sort: [{
          "key": "gmtPublish",
          "value": "desc"
        }],
        term: {
          type: CompositionTypes.SHOTS,
          authors: [authorId]
        },
        ...rest,
        page: page || 1,
        limit: limit || 12,
      }
    }
    await serviceStore.fetchAuthorShots(param)
  }

  handleSelectShots = (record) => {
    const { selectedRows } = this.state
    if (selectedRows.some(item => item.compositionId === record.compositionId)) {
      const newRows = selectedRows.filter(item => item.compositionId !== record.compositionId)
      this.setState({selectedRows: newRows})
    } else {
      const newRows = [...selectedRows, record]
      this.setState({selectedRows: newRows})
    }
  }

  handlePaginationChange = (page, limit) => {
    const { authorShotsData} = this.props
    const { terms } = authorShotsData
    this.requestAuthorShots({...terms, page})
  }

  handleSearch = (key) => {
    this.requestAuthorShots({keywords: key, page: 1})
  }

  handleCancel = () => {
    const { onCancel } = this.props
    if (onCancel) onCancel()
  }

  handleConfirm = () => {
    const { onConfirm } = this.props
    const { selectedRows } = this.state
    if (selectedRows.length === 0) {
      message.error('请选择作品')
      return
    }
    if (onConfirm) onConfirm(selectedRows)
  }

  render() {
    const { visible, authorShotsData } = this.props
    const { selectedRows } = this.state
    const { terms, total, list, loading, end} = authorShotsData
    const selectCount = selectedRows.length
    
    return (
      <Modal
        visible={visible}
        maskClosable={false}
        width={854}
        footer={null}
        onCancel={this.handleCancel}
      >
        <div className="service-select-shots-modal">
          <div className="header">
            选择作品
          </div>
          <div className="filter">
            <div className="intro">已选{selectCount}个作品</div>
            <div className="operation">
              <Search onSearch={this.handleSearch} />
              {/* <Button type="primary">添加新作品</Button> */}
            </div>
          </div>
          <div className="content">
            <div className="select-shots-list-wrapper">
              {loading && <div className="loading"><Spin /></div>}
              <div className="select-shots-list">
                {list.map(item => {
                  const isVideo = (item.fileTypes || []).includes('video')
                  const isSelected = selectedRows.some(row => row.compositionId === item.compositionId)
                  return (
                    <div 
                      key={item.compositionId}
                      className={classnames('select-shots-item', {active: isSelected})}
                      onClick={e => this.handleSelectShots(item)}
                    >
                      <div className="cover">
                        <img src={`${item.cover}?imageMogr2/thumbnail/!504x360r/size-limit/50k/gravity/center/crop/504x360`} alt=""/>
                        {isVideo && <span className="video-player"><CustomIcon name="play" /></span>}
                        <span className={classnames('check-box', {checked: isSelected})}></span>
                      </div>
                      <div className="intro">
                        <div className="title">{item.title}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="select-shots-pagination">
              <Pagination 
                hideOnSinglePage
                showQuickJumper
                current={terms.page}
                pageSize={terms.limit}
                total={total}
                onChange={this.handlePaginationChange}
              />
            </div>
          </div>
          <div className="footer">
            <Button onClick={this.handleCancel}>取消</Button>
            <Button type="primary" onClick={this.handleConfirm}>确定</Button>
          </div>
        </div>
      </Modal>
    )
  }
} 

export default SelectShotsModal