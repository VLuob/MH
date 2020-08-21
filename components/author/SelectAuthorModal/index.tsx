import { useState, useEffect, useCallback } from 'react'
import { toJS } from 'mobx'
import moment from 'moment'
import { Modal, Button, Select, Icon, Avatar, Form } from 'antd'

import { EditionType } from '@base/enums'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'

import sysOrder from '@base/system/order'

import './index.less'

const editionMap = sysOrder.filters.editionMap

const SelectAuthorModal = (props) => {
  const { title, okText, visible, authorId, authors=[], onCancel, onConfirm, form } = props
  const [selectAuthorId, setSelectAuthorId] = useState(authorId)
  const authorItem = authors.find(item => item.id === selectAuthorId) || {}
  const authorEdition = (authorItem || {}).edition || { editionType: EditionType.FREE}

  useEffect(() => {
    setSelectAuthorId(authorId)
  }, [authorId])

  const handleAuthorSelect = (authorId) => {
    setSelectAuthorId(authorId)
  }
  const handleConfirm = () => {
    if (onConfirm) onConfirm(authorItem)
  }


  return (
    <Modal
      // title={title || '选择创作者'}
      maskClosable={false}
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <div className="select-author-modal-title">
        {title || '选择创作者'}
      </div>
      <div className="select-author-modal-wrapper">
          <Select
            suffixIcon={<Icon type="caret-down" />}
            showArrow
            className="author-select"
            placeholder="请选择创作者"
            defaultValue={authorId}
            onSelect={handleAuthorSelect}
          >{
            authors.map((item, i) => {
              const currentAuthorEdition = item.edition ||{editionType: EditionType.FREE}
              
              return (
              <Select.Option key={item.id} value={item.id} item={item} className="select-author-option" >
                <div className="select-author-item">
                  <div className="item-avatar">
                    <Avatar icon="user" src={item.avatar} size={40} />
                  </div>
                  <div className="item-info">
                    <div className="nick">{item.nickname}</div>
                    <div className="domain"><UserIdentityComp currentType={item.type} editionType={currentAuthorEdition.editionType}  /> {item.name}</div>
                  </div>
                </div>
              </Select.Option>
            )})
          }
        </Select>
      {authorItem.id && <div className="author-edition-info">
        <span className="edition-type">套餐版本：{editionMap[authorEdition.editionType]}</span>
        {authorEdition.editionType !== EditionType.FREE && <span className="edition-expire">到期时间：{`${moment(authorEdition.gmtExpire).format('YYYY-MM-DD')} 到期`}</span>}
      </div>}
      </div>
      <div className="select-author-modal-footer">
          <Button 
            type="primary"
            onClick={handleConfirm}
          >{okText || '下一步'}</Button>
      </div>
    </Modal>
  )
}

export default SelectAuthorModal