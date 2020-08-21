import { useState, Component } from 'react'
import { Input, Tooltip } from 'antd'
import ContentEditor from '../../ContentEditor'
import { utils } from '@utils'
import CustomIcon from '@components/widget/common/Icon'
import './index.less'

const nameMax = 12

class ServiceContentField extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: props.name,
      price: props.price,
      content: props.content,
      nameCurrent: 0,
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { name, price, content } = nextProps
    if (name !== prevState.name || price !== prevState.price || content !== prevState.content) {
      return {
        name,
        price,
        content,
      }
    }
    return {}
  }

  handleNameChange = (e) => {
    const newName = e.target.value
    const length = utils.getStringLength(newName)
    let nameCurrentLength = Math.ceil(length / 2)
    this.setState({ name: newName, nameCurrent: nameCurrentLength })
    this.handleChange({ name: newName })
  }
  handlePriceChange = (e) => {
    const newPrice = e.target.value
    this.setState({ price: newPrice })
    this.handleChange({ price: newPrice })
  }
  handleContentChange = ({ html, text }) => {
    // console.log('name price', name, price)
    this.setState({ content: html })
    this.handleChange({ content: html })
  }

  handleChange = (option) => {
    const { onChange } = this.props
    const { name, price, content } = this.state
    if (onChange) {
      onChange({
        name: name,
        price: price,
        content: content,
        ...option,
      })
    }
  }

  handleRemove = () => {
    const { onRemove } = this.props
    if (onRemove) onRemove()
  }

  render() {
    const { name, price, content, nameCurrent } = this.state
    const { removeable } = this.props

    return (
      <div className="service-content-section">
        <div className="service-content-field-group">
          <div className="field-name">
            <Input
              className="input-title"
              placeholder="服务内容名称"
              suffix={<span style={{ color: (nameCurrent > nameMax ? 'red' : '#999999') }}>{nameCurrent}/{nameMax}</span>}
              value={name}
              onChange={this.handleNameChange}
            />
          </div>
          <div className="field-price">
            <Input
              placeholder="服务内容价格"
              suffix="元"
              value={price}
              onChange={this.handlePriceChange}
            />
          </div>
        </div>
        <div className="service-content-editor">
          <div className="service-content-editor">
            <ContentEditor
              placeholder="服务内容"
              content={content}
              onChange={this.handleContentChange}
            />
          </div>
        </div>
        {removeable && <div className="btn-remove" onClick={this.handleRemove}>
          <Tooltip title="移除服务清单">
            <CustomIcon name="trash" />
          </Tooltip>
        </div>}
      </div>
    )
  }
}

export default ServiceContentField