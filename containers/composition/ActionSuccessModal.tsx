import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Modal, Icon, Spin } from 'antd'

import { compositionApi } from '@api'
import { CompositionTypes } from '@base/enums'

import './ActionSuccessModal.less'

@inject(stores => {
  const { globalStore } = stores.store
  const { serverClientCode } = globalStore
  return {
    serverClientCode
  }
})
@observer
export default class ActionSuccessModal extends Component {
  state = {
    loading: true,
    relatedCompositions: [],
    
  }

  componentDidMount() {
    const { compositionId, serverClientCode, scope } = this.props
    if (!compositionId) {
      return
    }
    const param = {compositionId, clientCode: serverClientCode}

    const resultFn = (res => {
      this.setState({loading: false})
      if (res.success) {
        this.setState({relatedCompositions: res.data || []})
      }
    })
    if (scope === 'collection') {
      compositionApi.queryCollectionRelateds(param).then(resultFn)
    } else {
      compositionApi.queryFavorRelateds(param).then(resultFn)
    }
  }

  render() {
    const { visible, onClose, scope, compositionType } = this.props
    const { relatedCompositions, loading } = this.state
    const compositions = relatedCompositions.slice(0, 2)

    let title = ''
    let desc = ''
    if (scope === 'collection') {
      title = '收藏成功'
      desc = '收藏了此作品的用户还收藏了以下作品'
    } else {
      if (compositionType === CompositionTypes.ARTICLE) {
        title = '喜欢成功'
        desc = '喜欢了该文章的用户还喜欢了以下文章'
      } else {
        title = '喜欢成功'
        desc = '喜欢了此作品的用户还喜欢了以下作品'
      }
    }

    return (
      <Modal
        visible={visible}
        onCancel={onClose}
        footer={null}
      >
        <div className="action-success-modal">
          <div className="action-success-title">
            <Icon type="check-circle" theme="filled" /> {title}
          </div>
          <div className="action-success-intro">
            {desc}
          </div>
          <div className="action-success-content">
            {loading && <div className="loading"><Spin /></div> }
            {!loading && <ul className="list">
              {compositions.map(item => {
                const jumpUrl = item.type === CompositionTypes.ARTICLE ? `/article/${item.id}` : `/shots/${item.id}`
                return (
                  <li>
                    <div className="cover">
                      <a href={jumpUrl} target="_blank"><img src={item.cover + '?imageMogr2/thumbnail/!560x400r/size-limit/50k/gravity/center/crop/560x400'} /></a>
                    </div>
                    <div className="title"><a href={jumpUrl} target="_blank">{item.title}</a></div>
                  </li>
                )
              })}
            </ul>}
          </div>
        </div>
      </Modal>
    )
  }
}