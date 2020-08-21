import { Component } from 'react'
import classnames from 'classnames'
import update from 'immutability-helper'
import { Icon } from 'antd'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import PictureCard from './PictureCard'

export interface Props {
  fileList: Array<object>
  
}


@DragDropContext(HTML5Backend)
export default class PictureCardList extends Component<Props> {
  moveCard = (dragIndex, hoverIndex) => {
    const { fileList, onMoveCard } = this.props
    const dragCard = fileList[dragIndex]
    onMoveCard(
      update(fileList, {$splice: [[dragIndex, 1], [hoverIndex, 0, dragCard]]})
    )
  }
  
  render() {
    const { fileList, ...props } = this.props
    return (
        <div className="ant-upload-list ant-upload-list-picture-card">
          {fileList.length > 0 && <div className="ant-upload-list-item" style={{border: 'none'}}></div>}
          {fileList.map((item, index) => {
            return (
              <PictureCard 
                {...props} 
                key={item.uid} 
                index={index}
                item={item} 
                moveCard={this.moveCard}
              />
            )
          })}
        </div>
    )
  }
}