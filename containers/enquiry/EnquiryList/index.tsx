
import { Component } from 'react'
import moment from 'moment'
import classnames from 'classnames'
import { toJS } from 'mobx'

import { Tooltip, Empty } from 'antd'

import './index.less'

class EnquiryList extends Component {

  render() {
    const { list = [], loading, contentTooltipClass, isMobileScreen } = this.props
    const hasData = list.length > 0
    // console.log('list', toJS(list))
    return (
      <div className="enquiry-list">
        {loading && <div className="loading"><Span /></div>}
        {!hasData && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
        {hasData && list.map(item => {
          const contactInfo = JSON.parse(item.contactInfo || '{}')
          const isEdit = !!item.gmtEdit
          const gmtTime = isEdit ? item.gmtEdit : (item.gmtPublished || item.gmtCreate)
          const dateStr = moment(gmtTime).format('YYYY-MM-DD')

          return (isMobileScreen
            ? <div className="enquiry-item" key={item.id}>
              <div className="enquiry-item-content-wrapper">
                <div className="enquiry-item-content">
                  <a href={`/enquiry/${item.id}`} target="_blank">{item.content}</a>
                </div>
                <div className="enquiry-item-intro">
                  <span className="company">{contactInfo.company}</span>
                  <span className="date">{dateStr}</span>
                </div>
                <div className="enquiry-item-bottom">
                  <div className="action-left">
                    <a className="tag-form" target="_blank">{item.formName}</a>
                  </div>
                  <div className="action-right">
                    <span className="price">{item.budget}</span>
                  </div>
                </div>
              </div>
            </div>
            : <div className="enquiry-item" key={item.id}>
              <div className="enquiry-item-content-wrapper">
                <div className="enquiry-item-content">
                  <Tooltip title={`询价内容：${item.content}`} overlayClassName={classnames('enquiry-item-content-tooltip', contentTooltipClass)}>
                    <a href={`/enquiry/${item.id}`} target="_blank">{item.content}</a>
                  </Tooltip>
                </div>
                <div className="enquiry-item-intro">
                  <Tooltip title={`创意形式：${item.formName}`}><a /*href={`/shots!0!0!${item.formCode}!0!0`}*/ className="tag-form" target="_blank">{item.formName}</a></Tooltip>
                  <Tooltip title={`机构名称：${contactInfo.company}`}><span className="company">{contactInfo.company}</span></Tooltip>
                  <Tooltip title={`${isEdit ? '编辑' : '发布'}日期：${dateStr}`}><span className="date">{dateStr}{isEdit ? ' 编辑' : ''}</span></Tooltip>
                </div>
              </div>
              <div className="enquiry-item-price-wrapper">
                <div className="enquiry-item-price">
                  <Tooltip title={`预算：${item.budget}`}><span>{item.budget}</span></Tooltip>
                </div>
              </div>
            </div>)
        })}
      </div>
    )
  }
}

export default EnquiryList