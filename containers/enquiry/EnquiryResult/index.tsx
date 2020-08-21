import { Button } from 'antd'

import CustomIcon from '@components/widget/common/Icon'

import './index.less'

const EnquiryResult = (props) => {
  const { hideBtns, text, desc, showDesc, icon, cancelText, okText, onCancel, onOk, hideOkBtn } = props

  return (
    <div className="enquiry-result-wrapper">
      <div className="enquiry-submit-result">
        <div className="title">
          <span className="icon-wrapper">
            <CustomIcon name={icon || 'check-circle'} />
          </span>
          <span className="text">{text || '询价提交成功！'}</span>
        </div>
        {showDesc && <div className="desc">{desc || '审核通过后会显示在询价列表界面'}</div>}
      </div>
      {!hideBtns && <div className="enquiry-completed-btns">
        <Button onClick={onCancel}>{cancelText || '关闭'}</Button>
        {!hideOkBtn && <Button type="primary" onClick={onOk}>{okText || '查看询价'}</Button>}
      </div>}
    </div>
  )
}

export default EnquiryResult