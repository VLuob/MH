import { useState } from 'react'

import CustomIcon from '@components/widget/common/Icon'

import './index.less'

const ServiceShotsView = (props) => {
  const { onAdd, list=[], onRemove } = props

  const handleAdd = () => {
    if (onAdd) onAdd()
  }

  const handleRemove = (record) => {
    if (onRemove) onRemove(record)
  }

  return (
    <div className="service-shots-view-wrapper">
      <div className="service-shots-view-list">
        <div className="service-shots-view-item">
          <div className="service-shots-view-btn" onClick={handleAdd}>
            <div className="icon"><CustomIcon name="plus" /></div>
            <div className="intro">从我的作品库选择<br />与服务相关作品</div>
          </div>
        </div>
        {list.map(item => {
          const isVideo = (item.fileTypes || []).includes('video')
          return (
            <div className="service-shots-view-item" key={item.compositionId}>
              <div className="service-shots-view-cover">
                <img src={`${item.cover}?imageMogr2/thumbnail/!504x360r/size-limit/50k/gravity/center/crop/504x360`} alt="" />
                {isVideo && <span className="video-player"><CustomIcon name="play" /></span>}
              </div>
              <div className="title">{item.title}</div>
              <span className="btn-close" onClick={e => handleRemove(item)}>x</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ServiceShotsView