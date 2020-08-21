import { Component } from 'react'
import { Layout, Row, Col, Modal } from 'antd'

const { Footer } = Layout

import InfoMenu from '@components/widget/footer/InfoMenu'
import SubscribeComp from '@components/common/SubscribeComp'
import FooterMenu from '@components/widget/footer/FooterMenu'
import { infoList, meihuaList, aboutUsList, prodAndServeList } from '../../constants/common/footer'

// import homeLogoSvg from '@static/images/logo.svg'
const homeLogoSvg = '/static/images/logo.svg'
const wxPng = '/static/images/account/wx-qrcode.png'


export default class CommonFooter extends Component {
    state = {
        wechatVisible: false
    }
    handleWechatVisible = (flag) => {
        this.setState({wechatVisible: !!flag})
    }
    
    render() {
        const { fetchGetSubscription } = this.props
        const { wechatVisible } = this.state

        return (
            <Footer className='common-footer'>
                <div className='footer-pc'>
                    <Row type='flex' justify='start' align='top' gutter={24}>
                        <Col className='footer-col' xxl={5} xl={5} lg={5} md={5} sm={24} xs={24}>
                            <InfoMenu list={infoList} />
                        </Col>
                        <Col className='footer-col' xxl={14} xl={14} lg={14} md={14} sm={24} xs={24}>
                            {/* <Row type='flex' justify='space-around' align='top' gutter={{xs: 500, sm: 40, lg: 40, xl: 200}}> */}
                            <Row type='flex' justify='space-around' align='top'>
                                <Col>
                                    <FooterMenu title={`关于梅花网`} list={meihuaList} />
                                </Col>
                                <Col>
                                    {/* <FooterMenu title={`订阅我们`} list={aboutUsList} /> */}
                                    <div className='footer-box'>
                                        <h2>订阅我们</h2>
                                        <ul className='footer-menu'>
                                            <li><a className='name' onClick={e => this.handleWechatVisible(true)}>梅花网微信</a></li>
                                            <li><a href="https://weibo.com/meihua2002" className='name' target='_blank'>梅花网微博</a></li>
                                            <li><a href="http://www.meihua.info/feed" className='name' target='_blank'>RSS订阅</a></li>
                                        </ul>
                                    </div>
                                </Col>
                                <Col>
                                    <FooterMenu title={`产品和服务`} list={prodAndServeList} />
                                </Col>
                            </Row>
                        </Col>
                        <Col className='footer-col' xxl={5} xl={5} lg={5} md={5} sm={24} xs={24}>
                            <SubscribeComp subFn={fetchGetSubscription} />
                        </Col>
                    </Row>
                    <div className='copy-right-box'>
                        Copyright © 梅花网  <a href="http://www.beian.miit.gov.cn" target="_blank">沪ICP备05009163号</a>     <a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=31010502000234" target="_blank">公网安备 31010502000234号</a>    
                    </div>
                </div>
                <div className='footer-mb'>
                    <div className='footer-menu'>
                        <Row type='flex' justify='space-around' align='top'>
                            <Col>
                                <div className='footer-box'>
                                    <a href='/about'>关于我们</a>
                                </div>
                            </Col>
                            <Col>
                                <div className='footer-box'>
                                    <a href='/contact'>联系我们</a>
                                </div>
                            </Col>
                        </Row>
                        {/* <div className='contact-phone'>
                            业务垂询：413817141082
                        </div> */}
                        <div className='copyright'>
                            <p>Copyright © 梅花网  <a href="http://www.beian.miit.gov.cn" target="_blank">沪ICP备05009163号</a></p>
                            <p><a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=31010502000234" target="_blank">公网安备 31010502000234号</a></p>
                        </div>
                        <div className='logo'>
                            <img className='logo-box' src={homeLogoSvg} />
                        </div>
                    </div>
                </div>
                <Modal
                    visible={wechatVisible}
                    onCancel={e => this.handleWechatVisible(false)}
                    footer={null}
                    width={270}
                >
                    <img src={wxPng} alt=""/>
                    <div style={{textAlign: 'center'}}>微信公众号：梅花网</div>
                </Modal>
            </Footer>
        )
    }
}