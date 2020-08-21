import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import classnames from 'classnames'
import { Icon, Progress, Spin, Tooltip } from 'antd'
import { UploadFileTypes } from '@base/enums'
import CIcon from '@components/widget/common/Icon'

const ItemTypes = {
  CARD: 'pictureCard',
}

const UploadDone = ({item, onDelete, onCover, onFullscreen}) => {
  const isVideo = item.fileType === UploadFileTypes.WORKS_VIDEO || (item.type || '').indexOf('video/') >= 0
  const url = item.url || item.thumbUrl || item.response.data.url
  
  return (
    <>
      <div className="ant-upload-list-item-info">
        <span>
          <a className="ant-upload-list-item-thumbnail">
            <img src={isVideo ? `${url}?vframe/jpg/offset/7/w/318` : `${url}?imageView2/4/w/318`} alt={item.name}/>
          </a>
          <span className="ant-upload-list-item-name">{item.name}</span>
        </span>
        {isVideo && 
        <div className="video-play-icon">
          {/* <CIcon name="video-play" /> */}
          <img src="/static/images/icon/video_black.svg" alt=""/>
        </div>}
      </div>
      <Tooltip title="删除"><span className="close" onClick={onDelete}><Icon type="close" /></span></Tooltip>
      <span className={classnames(
        'ant-upload-list-item-actions',
      )}>
        <a className="set-fullscreen" onClick={onFullscreen}>查看预览</a>
        <a className="set-cover" onClick={onCover} >设为封面</a>
      </span>
    </>
  )
}

const  Uploading = ({item, onDelete}) => {
  return (
    <div className="uploading-mark-bg">
      <div className="ant-upload-list-item-info">
        <span>
          <div className="ant-upload-list-item-uploading-text">
            {/* <Spin indicator={<Icon type="loading" style={{fontSize: 24}} spin />} /> */}
            <div className="uploading-text">正在上传中</div>
          </div>
          <span className="ant-upload-list-item-name" title={item.name}>{item.name}</span>
        </span>
      </div>
      <span className="close" onClick={onDelete}><Icon type="close" /></span>
      <div className="ant-upload-list-item-progress">
        <Progress percent={parseInt(item.percent || 0)} />
      </div>
    </div>
  )
}

const PictureCard = ({item, index, onDelete, onCover, moveCard, onFullscreen}) => {
  const statusClass = `ant-upload-list-item-${item.status}`
  const isDone = item.status === 'done'
  const isUploading = item.status === 'uploading'
  const isError = item.status === 'error'

  const ref = useRef(null)
  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover(item, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect()
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      // Determine mouse position
      const clientOffset = monitor.getClientOffset()
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex)
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })
  const [{ isDragging }, drag] = useDrag({
    item: { type: ItemTypes.CARD, uid: item.uid, index },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })
  const opacity = isDragging ? 0 : 1

  drag(drop(ref))

  return (
    <div 
      ref={ref}
      key={item.uid}
      className={classnames('ant-upload-list-item', statusClass)}
      style={{opacity}}
    >
        {(isDone || isError) && <UploadDone item={item} onDelete={e => onDelete(item.uid)} onCover={e => onCover(item.uid)} onFullscreen={e => onFullscreen(index)} />}
        {isUploading && <Uploading item={item} onDelete={e => onDelete(item.uid)} />}
    </div>
  )
  
}


export default PictureCard