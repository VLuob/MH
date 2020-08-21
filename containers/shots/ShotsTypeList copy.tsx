import { Component } from 'react'
import classnames from 'classnames'
import moment from 'moment'
import { 
  Icon,
  Tooltip,
  Tag,
} from 'antd'
import CustomIcon from '@components/widget/common/Icon'

const iconBrand = '/static/images/icon/icon_brand.svg'
const iconProduction = '/static/images/icon/icon_production.svg'
const iconForm = '/static/images/icon/icon_form.svg'
const iconPublishTime = '/static/images/icon/icon_pulish_time.svg'

export default class ShotsTypeList extends Component {

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
      ...props
    } = this.props;

    const hasTags = tags.length > 0
    const hasAttachFiles = attachFiles.length > 0
    
    return (
      <ul className="type-list">
        {brandName && <li className="type-item"><CustomIcon name="brand" /><a href={`/brand/${brandId}/shots`} target="_blank"><Tooltip title={'品牌：' + brandName}><Tag>{brandName}</Tag></Tooltip></a></li>}
        {productName && <li className="type-item"><CustomIcon name="production" /><Tooltip title={'产品：' + productName}><span>{productName}</span></Tooltip></li>}
        {(brandName || productName) && <li className="type-item"><hr className="separator"/></li>}
        {categoryName && <li className="type-item"><CustomIcon name="category" /><Tooltip title={'品类：' + categoryName}><a href={`/shots?category=${categoryId}`} target="_blank"><span>{categoryName}</span></a></Tooltip></li>}
        {formName && <li className="type-item"><CustomIcon name="form" /><Tooltip title={'形式：' + formName}><a href={`/shots?form=${formId}`} target="_blank"><span>{formName}</span></a></Tooltip></li>}
        {gmtFirstRelease && <li className="type-item"><CustomIcon name="publish_month" /> <Tooltip title={'发表月度：' + moment(gmtFirstRelease).format('YYYY-MM')}><span>{moment(gmtFirstRelease).format('YYYY-MM')}</span></Tooltip></li>}
        {hasTags && 
          <li className="type-item tags">
            <CustomIcon name="tag" />
            {tags.map((item, i) => (<a key={i} href={`/tag/${item.tagId}/shots`} target="_blank"><Tooltip title={item.tagName}><span key={item.id}>{i > 0 && <i>·</i>}{item.tagName}</span></Tooltip></a>))}
          </li>}
        {hasAttachFiles && <li className="type-item"><hr className="separator"/></li>}
        {hasAttachFiles && <li className="type-item">
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
        </li>}
      </ul>
    )
  }
}