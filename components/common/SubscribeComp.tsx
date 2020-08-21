import { Component } from 'react'
import { Row, Col } from 'antd'
import { inject, observer } from 'mobx-react'
import classNames from 'classnames'

import SubEmailBox from './SubEmailBox'

const wxPng = '/static/images/account/wx-qrcode.png'
const mcPng = '/static/images/account/wxacode.jpg'
// const mcPng = '/static/images/account/mc-qrcode.png'
const mbHomePng = '/static/images/meihua_home_qrcode.png'

export interface Props {
    title: string
    titleStyle: string
    emailSub: string
    weChatSub: string
}

@inject(stores => {
    const { globalStore } = stores.store
    const { fetchGetSubscription } = globalStore

    return {
        fetchGetSubscription
    }
})
@observer
export default class SubscribeComp extends Component<Props, object> {
    render() {
        const { title, wxName, smName, className, titleStyle, emailSub, weChatSub, wxacodeImg, fetchGetSubscription } = this.props

        return (
            <div className={classNames(
                'subscribe-box',
                className
            )}>
                <h2 className={titleStyle}>订阅精选作品和文章</h2>
                <span className='name'>邮件订阅</span>
                <SubEmailBox subFn={fetchGetSubscription} />
                <span className='name'>微信订阅</span>
                <div className='qrcode-box'>
                    <Row type='flex' justify='start'>
                        <Col>
                            <div className='imgbox'>
                                <img src={wxPng} alt='梅花网微信公众号'/>
                            </div>
                            <span className='img-name'>{wxName || '梅花网微信公众号'}</span>
                        </Col>
                        <Col span={2}></Col>
                        <Col>
                            <div className='imgbox'>
                                <img src={mbHomePng || mcPng} alt='手机浏览梅花网' />
                            </div>
                            <span className='img-name'>{smName || '手机浏览梅花网'}</span>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}