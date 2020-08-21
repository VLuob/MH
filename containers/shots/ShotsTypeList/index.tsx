import { Component } from 'react'
import classnames from 'classnames'
import moment from 'moment'
import { 
  Icon,
  Tooltip,
  Tag,
} from 'antd'

import CustomIcon from '@components/widget/common/Icon'
import RelatedTags from '@components/article/RelatedTags'
import PrizeTag from '@components/common/PrizeTag'
import DetailServices from '../DetailServices'

import { TopTypes, TopStatTypes } from '@base/enums'

import './index.less'
import { toJS } from 'mobx'

const addHttp = (link: string) => {
  const l: string = link.trim()
  const hasHttp: boolean = ['https://','http://','//'].some(v => l.indexOf(v) === 0)
  return hasHttp ? l : `http://${l}`
}


const topNameMap = {
  [TopTypes.SHOTS]: '作品',
  [TopTypes.ARTICLE]: '文章',
  [TopTypes.AUTHOR]: '创作者',
}

const getRankTypeData = (record) => {
  let typeName = ''
  let typeKey = ''
  let rankName = ''
  let rankKey = ''
  switch(record.type) {
    case TopTypes.ARTICLE:
      typeName = '文章'       
      typeKey = 'article'
      break
    case TopTypes.SHOTS:
      typeName = '作品'           
      typeKey = 'shots'
      break
    case TopTypes.AUTHOR:
      typeName = '创作者'          
      typeKey = 'author'         
      break
    default:
      typeName = '作品'       
      typeKey = 'shots'
      break
  }
  
  switch (record.rankingListType) {
    case TopStatTypes.TOTAL:
      rankName = '总榜'       
      rankKey = 'total'
      break
    case TopStatTypes.WEEK:
      rankName = '周榜'   
      rankKey = 'week'
      break
    case TopStatTypes.SHARP:
      rankName = '新锐榜'   
      rankKey = 'sharp'
      break
    default:
      if (record.type === TopTypes.AUTHOR) {
        rankName = '总榜'   
        rankKey = 'total'
      } else {
        rankName = '新锐榜'   
        rankKey = 'sharp'
      }
      break
  }
  return {rankName, typeName, rankKey, typeKey}
}

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

export default class ShotsTypeList extends Component {

  render() {
    const { 
      className,
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
      type,
      compositionId,
      identificationList=[],
      rankingListType,
      ranking=[],
      featureQuantity,
      collectionQuantity,
      shotsServices=[],
      ...props
    } = this.props;

    const hasTags = tags.length > 0
    const hasAttachFiles = attachFiles.length > 0
    const hasServices = shotsServices.length > 0
    
    const filterRanking = ranking || []
    const filterIdentifications = identificationList || []

    return (
      <div className={classnames('detail-type-list', className)}>
        <TypeItem
          className="service"
          name="服务"
          icon="relation-service"
          show={hasServices}
        >
          <DetailServices services={shotsServices} />
        </TypeItem>
        <TypeItem
          name="奖项"
          icon="prize"
          show={filterRanking.length > 0 || filterIdentifications.length > 0}
        >
          {filterIdentifications.map((item, index) => {
            const link = item.link || ''
            return (<PrizeTag
              key={item.id}
              tooltip={item.summary || item.title}
              url={link ? addHttp(link) : null}
              text={item.title}
            />)
          })}
          {filterRanking.map(item => {
            const { rankName, typeName, rankKey, typeKey } = getRankTypeData(item)
            return (<PrizeTag
              key={item.id}
              tooltip={`${typeName}${rankName}第${item.rankingNum || item.name}期第${item.ranking}名`}
              url={`/top/${typeKey}!${item.rankingListType}!${item.id}`}
              logo={`No.${item.ranking}`}
              text={`${typeName}${rankName}`}
            />)
          })}
        </TypeItem>
        <TypeItem
          className="brand"
          name="品牌"
          icon="brand"
          show={!!brandName}
        >
          <Tooltip title={`品牌：${brandName}`}><a href={`/brand/${brandId}/shots`} target="_blank"><Tag>{brandName}</Tag></a></Tooltip>
        </TypeItem>
        <TypeItem
          name="产品"
          icon="production"
          show={!!productName}
        >
          <span>{productName}</span>
        </TypeItem>
        {/* <TypeItem
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
        </TypeItem> */}
        <TypeItem
          name="发布周期"
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
          {tags.map((item, i) => (<Tooltip title={`标签：${item.tagName}`} key={item.tagId}><a key={i} href={`/tag/${item.tagId}`} target="_blank"><Tag key={item.id}>{item.tagName}</Tag></a></Tooltip>))}
        </TypeItem>
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