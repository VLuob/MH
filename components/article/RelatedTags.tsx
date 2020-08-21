import { Tag, Tooltip } from 'antd'
import { CompositionTypes } from '@base/enums'
import './RelatedTags.less'

const addHttp = (link: string) => {
  const l: string = link.trim()
  const hasHttp: boolean = ['https://','http://','//'].some(v => l.indexOf(v) === 0)
  return hasHttp ? l : `http://${l}`
}

const RelatedTags = ({identificationList, featureQuantity, collectionQuantity, rankingListType, compositionId, type}) => {
  const identifications = identificationList || []
  const isNone = !featureQuantity && !collectionQuantity && !rankingListType && identifications.length === 0
  const typeKey = type === CompositionTypes.ARTICLE ? 'article' : 'shots'
  return (
    isNone 
    ? null 
    : <div className="related-tags">
      {identifications.map((item, index) => {
        const link = item.link || ''
        if (!link) {
          return (<a key={index}><Tooltip title={item.title}><Tag >{item.title}</Tag></Tooltip></a>)
        } else {
          return (<a key={index} href={addHttp(link)} target="_blank"><Tooltip title={item.title}><Tag >{item.title}</Tag></Tooltip></a>)
        }
      })}
      {!!rankingListType && <a href={`/top/${typeKey}`} target="_blank"><Tooltip title="梅花网排行榜上作品"><Tag >梅花网排行榜上作品</Tag></Tooltip></a>} 
      {!!featureQuantity && <a href={`/${typeKey}/${compositionId}/topics`} target="_blank"><Tooltip title={`${featureQuantity || 0}个专题收录`}><Tag>{featureQuantity || 0}个专题收录</Tag></Tooltip></a>}
      {!!collectionQuantity && <a href={`/${typeKey}/${compositionId}/collection`} target="_blank"><Tooltip title={`${collectionQuantity || 0}个收藏夹收藏`}><Tag>{collectionQuantity || 0}个收藏夹收藏</Tag></Tooltip></a>}
    </div>
  )
}

export default RelatedTags