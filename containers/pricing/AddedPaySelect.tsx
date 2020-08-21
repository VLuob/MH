import { useState } from 'react'
import classnames from 'classnames'
import { Checkbox, message, Modal, Tooltip } from 'antd'
import CustomIcon from '@components/widget/common/Icon'

import { EditionType, EditionScope, AddedServiceType } from '@base/enums'

const allAddeds = [AddedServiceType.HOME_PAGE, AddedServiceType.MINI_APP, AddedServiceType.UPLOAD_EXTEND, AddedServiceType.SHOTS_EXTEND]
const onlyStandardAddeds = [AddedServiceType.UPLOAD_EXTEND, AddedServiceType.SHOTS_EXTEND]
const standardAndAdvancedAddeds = [AddedServiceType.HOME_PAGE, AddedServiceType.MINI_APP]

const AddedPaySelectItem = (props) => {
  const [showDesc, setShowDesc] = useState(false)
  const { item, isFull, checked, onChecked, scope, edition, authorEditionType, onChangeEdition, author  } = props
  
  let disabled = false
  if (!!author && scope === EditionScope.EDITION_PACKAGE) {
    if (edition === EditionType.ADVANCED) {
      disabled = onlyStandardAddeds.includes(item.id)
    }
  }

  const handleFlodClick = (e) => {
    e.stopPropagation()
    setShowDesc(!showDesc)
  }

  const checkSelectTip = () => {
    let isOk = true
    if (checked) {
      // 已选中的支持取消
      return true
    }
    if (scope === EditionScope.ADDED_SERVICE) {
      if (authorEditionType === EditionType.FREE) {
        let msg = ''
        let nextEdition 
        if (onlyStandardAddeds.includes(item.id)) {
          msg = '很抱歉，该增值功能服务仅标准版创作者可以购买，请先升级版本套餐'
          nextEdition = EditionType.STANDARD
        } else {
          msg = '抱歉，该增值功能服务仅标准版、高级版创作者可以购买，请先升级版本套餐'
          nextEdition = EditionType.ADVANCED
        }
        isOk = false
        Modal.confirm({
          icon: 'info-circle',
          title: msg,
          cancelText: '取消',
          okText: '升级版本',
          onOk: () => {
            onChangeEdition(nextEdition)
          }
        })
      } else if (authorEditionType === EditionType.ADVANCED) {
        if (onlyStandardAddeds.includes(item.id)) {
          isOk = false
          let msg = '很抱歉，该增值功能服务高级版已享有，不必重复购买'
          let nextEdition = EditionType.ADVANCED
          Modal.confirm({
            icon: 'info-circle',
            title: msg,
            cancelText: '取消',
            okText: '查看权益',
            onOk: () => {
              if (typeof window !== undefined) {
                window.scrollTo(0, 0)
              }
              onChangeEdition(nextEdition)
            }
          })
        }
      }
    }
    return isOk
  }

  const handleContentClick = e => {
    if (disabled || item.disabled) {
      return
    }
    if (!author) {
      message.warn('请先选择创作者')
      return
    }
    if (!checkSelectTip()) {
      return
    }
    onChecked(item.id, !checked)
  }

  return (
    <Tooltip title={item.disabled ? '该功能即将上线，敬请期待…' : ''}>
    <div className={classnames("pay-added-box pay-item-select-box", {'active': checked}, {'disabled': disabled || item.disabled})}>
      <div className="pay-added-box-content" onClick={handleContentClick}>
        <Checkbox checked={checked} disabled={disabled || item.disabled}></Checkbox>
        <span className="added-name">{item.name}</span>
        <span className="added-money">{item.price}元/年</span>
        {isFull && <span 
          className="added-btn-flod" 
          onClick={handleFlodClick}
        >
          {showDesc ? '收起' : '了解详情'} <CustomIcon name={showDesc ? 'arrow-up-o' : 'arrow-down-o'} />
        </span>}
      </div>
      {isFull && showDesc && <div className="pay-added-box-desc">
        {item.desc.map((desc, index) => (<p key={index}>{desc}</p>))}
      </div>}
    </div>
  </Tooltip>
  )
}

const AddedPaySelect = (props) => {
  const { addedContents, value, isFull, onChange, author, edition, scope, ...rest } = props

  const authorEdition = (author || {}).edition || {}

  const handleChecked = (id, checked) => {
    const newValues = checked ? [...value, id] : value.filter(v => v !== id)
    onChange(newValues)
  }

  return (
    <div className="pricing-pay-item">
      <div className="pricing-pay-item-label">选择增值功能</div>
      <div className="pricing-pay-item-content">
        <div className={classnames("pricing-pay-added",{'pay-added-horizontal': !isFull})}>
          {addedContents.map(item => {
            const checked = value.includes(item.id)
            // 标准版套餐暂时隐藏小程序增值服务
            const hideCurrentAddedStandard = scope === EditionScope.EDITION_PACKAGE && edition === EditionType.STANDARD && [AddedServiceType.MINI_APP].includes(item.id)
            // 高级版套餐暂时隐藏小程序增值服务，和其他已包含的功能服务
            const hideCurrentAddedAdvanced = scope === EditionScope.EDITION_PACKAGE && edition === EditionType.ADVANCED && [AddedServiceType.MINI_APP, AddedServiceType.SHOTS_EXTEND, AddedServiceType.UPLOAD_EXTEND].includes(item.id)
            const hideCurrentAdded = hideCurrentAddedStandard || hideCurrentAddedAdvanced
            return (
              hideCurrentAdded ? null : <AddedPaySelectItem
                {...rest}
                key={item.id}
                item={item}
                checked={checked}
                isFull={isFull}
                onChecked={handleChecked}
                scope={scope}
                edition={edition}
                authorEditionType={authorEdition.editionType || EditionType.FREE}
                author={author}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AddedPaySelect