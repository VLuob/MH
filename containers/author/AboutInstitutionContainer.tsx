import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Row, Col, Button, Spin } from 'antd'
import { getCreatorType } from '@base/system'
import { ActionType } from '@base/enums'
import jsCookie from 'js-cookie'
import { toJS } from 'mobx'
import { config } from '@utils'

// import AvatarComponent from '@components/common/AvatarComponent'
// import { serviceCustomerList } from '@constants/author/serviceCustomer'

import emptyImage from '@static/images/common/full-empty.png'

@inject(stores => {
    const { globalStore, authorStore, compositionStore } = stores.store
    const { isBigScreen, currentWxacode } = globalStore
    const { 
        aboutData,
        changeAboutData, 
        fetchGetAuthorAbout, 
        fetchInsAboutActionFollow, 
    } = authorStore

    return {
        globalStore,
        currentWxacode,
        aboutData,
        isBigScreen,
        changeAboutData,
        fetchGetAuthorAbout,
        fetchInsAboutActionFollow,
    }
})
@observer
export default class AboutInstitutionContainer extends Component {
    componentDidMount() {
        const { aboutData, changeAboutData, insAboutResultData, globalStore, query } = this.props
        const {code} = query

        // this.reqInsAbout()
        changeAboutData({ ...insAboutResultData })

        const wxacodeParams = {
            scene: `code=${code}`,
            page: 'pages/author/author-detail/author-detail',
            width: 320,
        }
        globalStore.fetchWxacode(wxacodeParams)
    }

    reqInsAbout = () => {
        const { query, fetchGetAuthorAbout } = this.props
        const { code } = query

        fetchGetAuthorAbout({ code })
    }

    handleFollow = item => {
        const { fetchInsAboutActionFollow } = this.props
        const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
        const { id, type } = item
        let action = ActionType.FOCUS

        if(item.followed) {
            action = ActionType.UNFOCUS
        } else {
            action = ActionType.FOCUS
        }

        fetchInsAboutActionFollow({ client_code, id, type, action })
    }

    render() {
        const { aboutData, authorInfo, currentWxacode } = this.props
        const insName = getCreatorType(authorInfo.type)

        return (
            <div className='origin-about-conatainer'>
                <h6 className='subheading'>{insName}介绍</h6>
                {<p className='introduce'>
                    {aboutData.profile ? aboutData.profile : '暂无信息'}
                </p>}
                <div style={{height: '30px'}}></div>
                <h6 className='subheading'>微信小程序</h6>
                <div className='wxacode'>
                    {currentWxacode ? <img src={currentWxacode} alt="微信小程序码" style={{width: '160px'}}/> : <Spin />}
                </div>
                {aboutData.members && aboutData.members.length > 0 && <div className='padding-box'></div>}
                {/* {aboutData.members && aboutData.members.length > 0 &&
                <>
                    <h6 className='subheading'>{insName}成员</h6>
                    <div className='member-introduce'>
                        <Row type='flex' justify='start' align='middle' gutter={34}>
                            {aboutData.members.map(item => {
                                return (
                                    <Col lg={6} xl={4} xxl={4} key={item.id}>
                                        <div className='member-box'>
                                            <a href={`/author/${item.code}`} target='_blank'>
                                                <AvatarComponent 
                                                    className='member-img'
                                                    src={item.avatar}
                                                    name={item.nickname}
                                                    style={{ fontSize: '22px' }}
                                                />
                                            </a>
                                            <a href={`/author/${item.code}`} target='_blank' className='member-name multi-ellipsis'>{item.name}</a>
                                            <span className='member-detail'>作品 {item.compositionCount || 0}    粉丝 {item.fans || 0}</span>
                                            {!!item.followed && <Button className='completed' shape='round' onClick={e => this.handleFollow(item)}>已关注</Button>}
                                            {!item.followed && <Button className='completed' shape='round' onClick={e => this.handleFollow(item)}>+ 关注</Button>}
                                        </div>
                                    </Col>
                                )
                            })}
                        </Row>
                    </div>
                </>} */}
                {aboutData.customerService && aboutData.customerService.length > 0 && 
                    <>    
                    <h6 className='subheading'>产品服务</h6>
                    <div className='service-production'>
                        <div className='service-inner'>
                            <Row type='flex' justify='start' align='middle' gutter={34}>
                                {aboutData.customerService.map(l => {
                                    return (
                                        <Col key={l.id}>
                                            <div className='production-inner-box'>
                                                <img src={l.image || emptyImage} alt='' className='prod-img' />
                                                <p className='meta'>{l.title}</p>
                                            </div>
                                        </Col>
                                    )
                                })}
                            </Row>
                        </div>
                    </div>
                </>}
                {aboutData.customerService && aboutData.customerService.length > 0 &&
                    <>
                        <h6 className='subheading'>服务客户</h6>
                        <div className='service-customer clearfix'>
                            {aboutData.customerService.map(l => {
                                return (
                                    <li key={l.id}>
                                        <img src={l.image || emptyImage} />
                                    </li>
                                )
                            })}
                        </div>
                    </>
                }
            </div>
        )
    }
}