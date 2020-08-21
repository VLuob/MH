import React from 'react'
import { Row, Col, Avatar, Icon, Button, Tag, Radio } from 'antd'
import moment from 'moment'
import ReactTooltip from 'react-tooltip'
import { toJS } from 'mobx'
import { EditionType, AuthorType } from '@base/enums'

import AvatarComponent from '@components/common/AvatarComponent'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'
import MiniappIcon from '@containers/widget/MiniappIcon'
import QRCodeIcon from '@components/widget/common/QRCodeIcon'
import AuthorEditionTag from '@components/author/AuthorEditionTag'
import AuthorAuthenticationIcon from '@components/author/AuthorAuthenticationIcon'
import { utils, config } from '@utils'

export interface Props {
  avatar: string;
  name: string;
  area: string;
  production: number;
  article: number;
  follow: number;
  intro: string;
  netAge: number;
  type: number;
  footer: any;
  code: string;
  onFollow: Function;
  onMessage: Function;
  isSelf: boolean; 
}

const getNetAge: string = (sTime: number|string) => {
    const startDate = moment(sTime)
    const endDate = moment()
    const diffYear = endDate.diff(startDate, 'year')
    
    let netAge = ''
    if(diffYear > 0) {
        netAge += `${diffYear}年`
        const subMonth = endDate.diff(startDate.add(diffYear, 'year'), 'month')
        if(subMonth > 0) {
            netAge += `${subMonth}个月`
        }
    } else if (endDate.diff(startDate, 'month') > 0) {
        const diffMonth = endDate.diff(startDate, 'month')
        netAge += `${diffMonth}个月`
    } else {
        const diffDay = endDate.diff(startDate, 'day')
        netAge += `${diffDay}天`
    }

    return netAge
}

const IntroBox: React.SFC<Props> = ({
    id,
    type,
    name,
    city,
    code,
    intro,
    follow,
    isSelf,
    isLogin,
    isSelfAuthor,
    footer,  
    avatar,
    hideNetAge,
    provice,
    article,
    followed,
    onFollow,
    onMessage,
    authorInfo,
    production,
    createTime,
    currentUserOrg,
}) => {
    const netAge = utils.getAge(createTime)
    const hasArea = !!provice || !!city
    // console.log('authorInfo', toJS(authorInfo))
    const edition = authorInfo.edition || {editionType: EditionType.FREE}
    const isFreeEdition = edition.editionType === EditionType.FREE

    const showEnquiry = [AuthorType.PERSONAL, AuthorType.SERVER].includes(authorInfo.type)
  return (
    <Row>
        <Col className='user-info-col' span={24}>
            <div className='avatar'>
                <AvatarComponent
                    src={authorInfo.avatar}
                    name={authorInfo.nickname}
                    className={'author-img'}
                    style={{ fontSize: '22px' }}
                />
            </div>
            <h2 className='user-name'>
                <span>{authorInfo.nickname}</span>
            </h2>
            {!isFreeEdition && <div className="user-author-name">
                <AuthorAuthenticationIcon  />
                <span>{authorInfo.name}</span>
            </div>}
            <div className='user-type'>
                <UserIdentityComp currentType={type} editionType={edition.editionType} />
                {/* {!isFreeEdition && <AuthorEditionTag editionType={edition.editionType} authorId={authorInfo.id} style={{marginLeft: '6px'}} />} */}
                <span className="wx-mini-icon" style={{marginLeft: '6px'}}>
                    {/* <MiniappIcon
                        placement="bottomCenter"
                        params={{scene: `code=${code}`, page: 'pages/author/author-detail/author-detail', width: 320}}
                    /> */}
                    <QRCodeIcon
                        placement="bottom"
                        url={config.CURRENT_DOMAIN + `/author/${authorInfo.code}`}
                    />
                </span>
            </div>
            <div>
                {hasArea && <div className='user-area'>
                    {provice}
                    {provice && city && <span> / </span>}
                    {city}
                </div>}
            </div>
            <div className='user-data'>
                <a href={`/author/${code}/shots`} data-for={`box-user-data`} data-tip={`作品: ${production || 0}`}>作品 <strong>{production || 0}</strong></a> | <a href={`/author/${code}/article`} data-for={`box-user-data`} data-tip={`文章: ${article || 0}`}>文章 <strong>{article || 0}</strong></a> 
                {/* | <a data-for={`box-user-data`} data-tip={`粉丝: ${follow || 0}`}>粉丝 <strong>{follow || 0}</strong></a> */}
                <ReactTooltip id={`box-user-data`} effect='solid' place='top' />
            </div>
            <div>
                {!!intro &&
                <div className='user-intro'>
                    {intro}
                </div>}
            </div>
            <div>
                {!hideNetAge &&
                <div className='user-net-age'>
                    梅花网龄：{netAge}
                </div>}
            </div>
            <div className='user-contact'>
                {footer}
                {!footer &&  
                  !isSelfAuthor ? 
                  <>
                    {!followed && <Button onClick={onFollow}>关注</Button>}
                    {followed && <Button className='completed' onClick={onFollow}>已关注</Button>}
                    {showEnquiry && <Button type='primary' onClick={onMessage}>询价</Button>}
                  </> : 
                  <>
                    <Button type="primary" style={{width: '240px'}}>
                        <a href={`/teams/${id}/creation`} target="_blank">{`创作者管理中心`}</a>
                    </Button>
                  </>}
            </div>
        </Col>
    </Row>
  )
}

export default IntroBox