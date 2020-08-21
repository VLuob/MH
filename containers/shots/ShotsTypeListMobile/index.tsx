import { Component } from 'react'
import classnames from 'classnames'
import moment from 'moment'
import { 
  Icon,
  Tooltip,
  Tag,
} from 'antd'
import CustomIcon from '@components/widget/common/Icon'
import DetailServices from '../DetailServices'

import './index.less'

const TypeItem = (props) => {
  const { icon, name, children, show, className } = props
  return (
    show ? <div className={classnames('type-item', className)}>
      <div className="type-item-name">
        <CustomIcon name={icon} /><span className="name">{name}</span>
      </div>
      <div className="type-item-content">
        {children}
      </div>
    </div> : null
  )
}

const RenderSeparator = ({show}) => {
  return (
    show ? <div className="type-item"><hr className="separator"/></div> : null
  )
}

export default class ShotsTypeListMobile extends Component {

  render() {
    const { 
      brandId,
      brandName,
      productName, 
      categoryId,
      categoryName, 
      formId,
      formName, 
      gmtFirstRelease, 
      tags,
      attachFiles,
      shotsServices=[],
      ...props
    } = this.props;

    const hasTags = tags.length > 0
    const hasAttachFiles = attachFiles.length > 0
    const hasServices = shotsServices.length > 0
    
    return (
      <div className="type-list type-list-mobile">
        <TypeItem
          className="service"
          name="服务"
          icon="relation-service"
          show={hasServices}
        >
          <DetailServices services={shotsServices} />
        </TypeItem>
        <TypeItem
          className="brand"
          name="品牌"
          icon="brand"
          show={!!brandName}
        >
          <a href={`/brand/${brandId}/shots`} target="_blank"><Tag>{brandName}</Tag></a>
        </TypeItem>
        <TypeItem
          name="产品"
          icon="production"
          show={!!productName}
        >
          <span>{productName}</span>
        </TypeItem>
        <RenderSeparator show={brandName || productName} />
        <TypeItem
          name="品类"
          icon="category"
          show={!!categoryName}
        >
          <a href={`/shots?category=${categoryId}`} target="_blank"><span>{categoryName}</span></a>
        </TypeItem>
        <TypeItem
          name="形式"
          icon="form"
          show={!!formName}
        >
          <a href={`/shots?form=${formId}`} target="_blank"><span>{formName}</span></a>
        </TypeItem>
        <TypeItem
          name="发表月度"
          icon="publish_month"
          show={!!gmtFirstRelease}
        >
          <span>{moment(gmtFirstRelease).format('YYYY-MM')}</span>
        </TypeItem>
        <TypeItem
          name="标签"
          icon="tag"
          show={hasTags}
        >
          {tags.map((item, i) => (<a key={i} href={`/tag/${item.tagId}/shots`} target="_blank"><Tag key={item.id}>{item.tagName}</Tag></a>))}
        </TypeItem>
        <RenderSeparator show={hasAttachFiles} />
        <TypeItem
          name="附件"
          icon="tag"
          show={hasAttachFiles}
        >
          <div className="download-list">
            {attachFiles.map((item, index) => {
              return (
                <div key={index} className="download-item">
                  <div className="download-name" onClick={e => props.onDownloadAttach(item.id, item.title)}><Icon type="paper-clip" /> <Tooltip title="点击下载此附件">{item.title}</Tooltip></div>
                  <div className="download-info">{item.size}  {item.downloads}次下载</div>
                </div>)
              })
            }
          </div>
        </TypeItem>
      </div>
    )
  }
}