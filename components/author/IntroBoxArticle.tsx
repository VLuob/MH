import React from 'react'
import { utils } from '@utils'
import { Row, Col, Avatar, Icon, Button, Tag, Radio } from 'antd'
import moment from 'moment'
import ReactTooltip from 'react-tooltip'
import { AuthorType, EditionType } from '@base/enums'
import { toJS } from 'mobx'

import AvatarComponent from '@components/common/AvatarComponent'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'
import AuthorEditionTag from '@components/author/AuthorEditionTag'
import AuthorAuthenticationIcon from '@components/author/AuthorAuthenticationIcon'

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

const IntroBoxArticle: React.SFC<Props> = ({
    id,
    type,
    name,
    city,
    code,
    intro,
    follow,
    isSelf,
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
    hideFooter,
    hideCount,
}) => {
    const netAge = utils.getAge(createTime)

    const hasArea = !!provice || !!city
    const editionType = authorInfo.editionType || EditionType.FREE
    const showEnquiry = [AuthorType.PERSONAL, AuthorType.SERVER].includes(authorInfo.type)
  return (
    <Row>
        <Col className='user-info-col' span={24}>
            <div className='avatar'>
                {/* <Avatar icon='user' src={avatar} size={100} /> */}
                <a href={`/author/${code}`} target='_blank'>
                  <AvatarComponent
                      src={authorInfo.avatar}
                      name={authorInfo.nickname}
                      className={'author-img'}
                      style={{ fontSize: '22px' }}
                  />
                </a>
            </div>
            <h2 className='user-name'>
                <a href={`/author/${code}`} target='_blank'><span>{name}</span></a><AuthorAuthenticationIcon hide={ editionType === EditionType.FREE} style={{marginLeft: '6px', top: '2px'}} />
            </h2>
            <div className='user-type'>
                <UserIdentityComp currentType={type} editionType={editionType} />
                {/* <AuthorEditionTag editionType={editionType} style={{marginLeft: '6px'}} /> */}
            </div>
            <div>
                {hasArea && <div className='user-area'>
                    {provice}
                    {provice && city && <span> / </span>}
                    {city}
                </div>}
            </div>
            {!hideCount && 
            <div className='user-data'>
                <a href={`/author/${code}/shots`} data-for={`box-user-data`} data-tip={`作品: ${production || 0}`} target="_brank">作品 <strong>{production || 0}</strong></a> | <a href={`/author/${code}/article`} data-for={`box-user-data`} data-tip={`文章: ${article || 0}`} target="_brank">文章 <strong>{article || 0}</strong></a> 
                {/* | <a href={`/author/${code}/followers`} data-for={`box-user-data`} data-tip={`粉丝: ${follow || 0}`} target="_brank">粉丝 <strong>{follow || 0}</strong></a> */}
                <ReactTooltip id={`box-user-data`} effect='solid' place='top' />
            </div>}
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
            {!hideFooter && <div className='user-contact'>
                {footer}
                {!footer &&  
                  !isSelf ? 
                  <>
                    {/* <Button>
                        <a href={`/teams/${authorInfo.id}/creation`}>机构中心</a>
                    </Button> 
                    <Button type='primary'>
                        <a href='/shots/new'>发布</a>
                    </Button> */}
                        {!followed && <Button onClick={onFollow}>关注</Button>}
                        {followed && <Button className='completed' onClick={onFollow}>已关注</Button>}
                        {showEnquiry && <Button type='primary' onClick={onMessage}>询价</Button>}
                  </> : 
                  <>
                    <Button>
                        <a href={currentUserOrg ? `/teams/${id}/creation` : `/personal`}>{currentUserOrg ? `创作者中心` : `个人中心`}</a>
                    </Button>
                    <Button type='primary'>
                        <a href='/shots/new'>发布</a>
                    </Button>
                  </>}
            </div>}
        </Col>
    </Row>
  )
}

export default IntroBoxArticle