import classnames from 'classnames'
import { Tooltip } from 'antd'
import './index.less'

import { EditionType, AuthorType } from '@base/enums'

// const advancedIcon = '/static/images/author/advanced.svg'
// const advancedMiniIcon = '/static/images/author/advanced_mini.svg'
// const standardIcon = '/static/images/author/standard.svg'
// const standardMiniIcon = '/static/images/author/standard_mini.svg'
const advancedIcon = '/static/images/author/advanced.svg'
const advancedPersonalIcon = '/static/images/author/advanced_personal.svg'
const advancedServiceIcon = '/static/images/author/advanced_service.svg'
const advancedMiniIcon = '/static/images/author/advanced_mini.svg'
const standardIcon = '/static/images/author/standard.svg'
const standardPersonalIcon = '/static/images/author/standard_personal.svg'
const standardServiceIcon = '/static/images/author/standard_service.svg'
const standardMiniIcon = '/static/images/author/standard_mini.svg'

const AuthorEditionTag = (props) => {
  const { editionType, authorType, authorId, mini, className, ...rest } = props
  const isFreeEdition = editionType === EditionType.FREE || !editionType
  let title = ''
  let iconUrl = ''
  let link = '/pricing'
  let paramArr = []
  if (editionType === EditionType.ADVANCED) {
    if (authorType === AuthorType.PERSONAL) {
      title = '金牌个人创作者'
      iconUrl = advancedPersonalIcon
    } else if (authorType === AuthorType.SERVER) {
      title = '金牌服务商创作者'
      iconUrl = advancedServiceIcon
    } else {
      title = '创作者高级版'
      iconUrl = mini ? advancedMiniIcon : advancedIcon
    }
  } else {
    if (authorType === AuthorType.PERSONAL) {
      title = '金牌个人创作者'
      iconUrl = standardPersonalIcon
    } else if (authorType === AuthorType.SERVER) {
      title = '金牌服务商创作者'
      iconUrl = standardServiceIcon
    } else {
      title = '创作者标准版'
      iconUrl = mini ? standardMiniIcon : standardIcon
    }
  }
  // if (editionType) {
  //   paramArr.push(`v=${editionType}`)
  // }
  // if (authorId) {
  //   paramArr.push(`aid=${authorId}`)
  // }
  // if (paramArr.length > 0) {
  //   link += `?${paramArr.join('&')}`
  // }

  return (
    isFreeEdition ? null : <span className={classnames('edition-tag-wrapper', className)} {...rest}>
      <a href={link} target="_blank"><Tooltip title={title}><img src={iconUrl} alt={title}/></Tooltip></a>
    </span>
  )
}

export default AuthorEditionTag