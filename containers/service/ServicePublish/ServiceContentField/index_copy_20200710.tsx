import { useState } from 'react'
import { Input } from 'antd'
import ContentEditor from '../../ContentEditor'
import { utils } from '@utils'

import './index.less'

const nameMax = 12

const ServiceContentField = (props) => {
  const { name, price, content, onChange } = props
  const [nameValue, setNameValue] = useState(name)
  const [priceValue, setPriceValue] = useState(price)
  const [contentValue, setContentValue] = useState(content)
  const [nameCurrent, setNameCurrent] = useState(0)

  const handleNameChange = (e) => {
    const newName = e.target.value
    const length = utils.getStringLength(newName)
    let nameCurrentLength = Math.ceil(length / 2)
    setNameCurrent(nameCurrentLength)
    setNameValue(newName)
    handleChange({name: newName})
  }
  const handlePriceChange = (e) => {
    const newPrice = e.target.value
    setPriceValue(newPrice)
    handleChange({price: newPrice})
  }
  const handleContentChange = ({html, text}) => {
    // console.log('name price', nameValue, priceValue)
    setContentValue(html)
    handleChange({content: html})
  }

  const handleChange = (option) => {
    if (onChange) {
      onChange({
        name: nameValue,
        price: priceValue,
        content: contentValue,
        ...option,
      })
    }
  }

  return (
    <div className="service-content-section">
      <div className="service-content-field-group">
        <div className="field-name">
          <Input
            className="input-title"
            placeholder="服务内容名称"
            suffix={<span style={{color: (nameCurrent > nameMax ? 'red' : '#999999')}}>{nameCurrent}/{nameMax}</span>}
            value={nameValue}
            onChange={handleNameChange} 
          />
        </div>
        <div className="field-price">
          <Input 
            placeholder="服务内容价格" 
            suffix="元" 
            value={priceValue}
            onChange={handlePriceChange}
          />
        </div>
      </div>
      <div className="service-content-editor">
          <div className="service-content-editor">
            <ContentEditor
              placeholder="服务内容"
              content={contentValue}
              onChange={handleContentChange}
            />
          </div>
      </div>
    </div>
  )
}

export default ServiceContentField