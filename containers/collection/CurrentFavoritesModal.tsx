import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import jsCookie from 'js-cookie'
import { Modal, Button, message } from 'antd'
import CustomIcon from '@components/widget/common/Icon'

import EditFavoritesModal from './EditFavoritesModal'

import { config } from '@utils'

import './currentFavoritesModal.less'

@inject(stores => {
  const { collectionStore, globalStore } = stores.store
  const { currentFavorites } = collectionStore
  const { serverClientCode } = globalStore
  return {
    collectionStore,
    currentFavorites,
    serverClientCode,
  }
})
@observer
export default class CurrentFavoritesModal extends Component {
  state = {
    editModal: false,
    recordValue: null,
  }

  componentDidMount() {
    const { collectionStore, compositionId } = this.props
    collectionStore.fetchCurrentFavorites({ composition_id: compositionId })
  }

  handleCollection = (record) => {
    const { compositionId, serverClientCode, collectionStore, onSuccess } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (!token) {
      location.href = '/signin?c=' + location.href
      return
    }

    const nextAction = record.collected ? 0 : 1
    const params = {
      clientCode: serverClientCode,
      compositionId,
      collectionId: record.id,
      action: nextAction,
    }
    collectionStore.fetchCurrentCollection(params).then(res => {
      if (res.success) {
        if (onSuccess) onSuccess({ compositionId, collectionId: record.id, action: nextAction })
      }
    })
  }

  handleEditVisible = (flag, recordValue = null) => {
    this.setState({ editModal: !!flag, recordValue })
  }

  handleEditSubmit = (values) => {
    const { collectionStore } = this.props
    const resultFn = res => {
      if (res.success) {
        this.handleEditVisible(false)
      } else {
        message.error(res.data.msg)
      }
    }

    if (!values.id) {
      collectionStore.addFavorites(values).then(resultFn)
    } else {
      collectionStore.editFavorites(values).then(resultFn)
    }
  }

  render() {
    const { visible, onClose, currentFavorites } = this.props
    const { editModal, recordValue } = this.state

    return (
      <>
        <Modal
          width={405}
          visible={visible}
          title="收藏"
          onCancel={onClose}
          footer={null}
        >
          <div className="current-favorites-container">
            <div className="current-favorites-content">
              <div className="current-favorites-list">
                {currentFavorites.map(item => {
                  return (
                    <div className="current-favorites-item" key={item.id}>
                      <span className="name" onClick={e => this.handleEditVisible(true, item)}>{item.name} {!item.published && <CustomIcon name="lock" />}</span>
                      <span className="btn">
                        <Button type={item.collected ? '' : 'primary'} onClick={e => this.handleCollection(item)}>{item.collected ? '已收藏' : '收藏'}</Button>
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="current-favorite-add" onClick={e => this.handleEditVisible(true)}>
              <CustomIcon name="plus" /> 创建收藏夹
                    </div>
          </div>
        </Modal>
        {editModal && <EditFavoritesModal
          visible={editModal}
          values={recordValue}
          onClose={e => this.handleEditVisible(false)}
          onSubmit={this.handleEditSubmit}
        />}
      </>
    )
  }
}