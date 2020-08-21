import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import classNames from 'classnames'
import { Router } from '@routes'
import { toJS } from 'mobx'
import { Popover, Button } from 'antd'

import PartLoading from '@components/features/PartLoading'

// import mapPng from '@static/images/common/map.png'
// import wxPng from '@static/images/account/wx-qrcode.png'

const wxPng = '/static/images/account/wx-qrcode.png'
const wxVip = '/static/images/weixin_vip_qrcode.png'
const feedbackPic = '/static/images/feedback_qrcode.png'

const mapPng = 'https://resource.meihua.info/Fp3dg-DUPwNgSJ3AgxQuV8l9RYqN'

const sideList = [{
    id: 0,
    tabName: 'about',
    name: `关于我们`
}, {
    id: 1,
    tabName: 'contact',
    name: `联系我们`
}]

@inject(stores => {
    const { globalStore } = stores.store
    const { isMobileScreen } = globalStore

    return {
        isMobileScreen,
    }
})
@observer
export default class ContactContent extends Component {
    state = {
        loading: true,
        tabName: 'about'
    }

    componentDidMount() {
        const pathname = window.location.pathname && (window.location.pathname).substr(1)

        switch(pathname) {
            case sideList[0].tabName:
                Router.pushRoute(`/about`)

                break
            case sideList[1].tabName:
                Router.pushRoute(`/contact`)

                break
        }

        this.setState({ tabName: pathname, loading: false })
    }

    handleClick = tabName => {
        Router.pushRoute(`/${tabName}`)
        this.setState({ tabName })
    }

    handleWxQrcode = () => {

    }

    render() {
        const { tabName, loading } = this.state
        const { isMobileScreen  } = this.props

        return (
            <div className='contact-content'>
                {loading ? 
                    <PartLoading /> :
                    <>
                        <ul className='contact-side'>
                            {sideList.map(item => {
                                return (
                                    <li key={item.id} className={classNames(
                                        { 'contact-side-sel': tabName === item.tabName }
                                    )} onClick={e => this.handleClick(item.tabName)}>
                                        {item.name}
                                    </li>
                                )
                            })}
                        </ul>
                        <div className='contact-sub-content'>
                            {tabName === sideList[0].tabName && <div className='aboutus-content'>
                                <h3 className='contact-title'>关于我们</h3>
                                <div className='contact-text-content'>
                                    <p>
                                        上海梅花信息股份有限公司成立于2002年，梅花网隶属于上海梅花信息股份有限公司。多年来聚焦于为企业市场营销（广告、公关和市场研究）部门提供各类信息情报服务。公司的主要产品包括跨媒体的广告监测数据库、新闻监测平台、媒体公关连线等。在标准化的数据产品基础上，我们还为客户提供定制的媒体监测类服务，包括针对市场推广部门的竞争品牌广告监测服务，针对公关部门的公关传播监测，以及针对战略研究部门的战略信息监测服务。 2014年，梅花网提出科技驱动营销的品牌定位，致力于成为中国最优秀的以互联网技术驱动的营销信息服务商。
                                    </p>
                                    <p>
                                        除了营销情报服务外，梅花信息还运作业内知名的“梅花网”，一个面向营销者的信息中心，提供市场营销资讯、资源、案例、知识以及线上社区。梅花网还定期举办针对专业人群的线下活动。梅花网是中国市场营销专业领域内容最丰富，访问量位居前茅的网站，截止2013年12月，注册用户已超过26.6万，月度不重复访问者已经超过47万，月度网站浏览量超过135万。
                                    </p>
                                    <p>
                                        2010年，梅花信息获得了高新技术企业认证。2012年，被评为上海市明星软件企业。2013年，梅花网通过国际知名认证机构SGS（瑞士通用公证行）审核，获得国内首个媒体监测领域国际标准。2014年，梅花网再度荣获 “上海市明星软件企业”称号。
                                    </p>
                                    <p>
                                        梅花信息总部设在上海，在北京、深圳设有办事机构，员工数160人。目前同时服务1000多家左右的客户。
                                    </p>
                                </div>
                            </div>}
                            {tabName === sideList[1].tabName && <div className='contactus-content'>
                                <div className='aboutus-sub-content'>
                                    <h3 className='contact-title'>联系我们</h3>
                                    <ul className='contact-hotline-list clearfix'>
                                        <li style={{position: 'relative'}}><div>全国客户应答热线：400-880-4636</div><div style={{position: 'absolute', fontSize: '13px', color: '#666'}}>(周三居家办公日，请联系微信在线客服：<Popover trigger="hover" content={<div><img src="/static/images/weixin_vip_qrcode.png" width={160} alt="梅花网微信"/></div>}><a style={{color: '#168dd7'}}>meihua_vip</a></Popover>)</div></li>
                                        <li>全国投搞通道：tougao@meihua.info</li>
                                        <li>全国客服邮箱：cs@meihua.info</li>
                                        <li>全国渠道代理商咨询：channel@meihua.info</li>
                                    </ul>
                                </div>
                                <div className='contact-map-box'>
                                    <img src={mapPng} alt='' className='contact-map-img' />
                                </div>
                                <div className='contact-content-list'>
                                    <h4 className='contact-sub-title'>上海总部</h4>
                                    <ul className='contact-hotline-list clearfix'>
                                        <li><strong>客户及销售督导：</strong>021-5160 2866–8012</li>
                                        <li>联系人：sharon (sharon.zhou@meihua.info)</li>
                                        <li><strong>广告及线下活动合作：</strong>021-5160 2866-8061</li>
                                        <li>联系人：meihua@meihua.info</li>
                                        <li><strong>媒体及市场合作：</strong>021-5160 2866-8042</li><br />
                                        <li>联系人：marketing@meihua.info</li>
                                        <li className='spec-li'><strong>地址：</strong>上海市徐汇区钦州北路1199弄智汇园87号2楼</li>
                                        <li><strong>邮编：</strong>200030 </li>
                                        <li><strong>传真：</strong>021-6228 3501</li>
                                    </ul>
                                    <h4 className='contact-sub-title'>北京分公司</h4>
                                    <ul className='contact-hotline-list clearfix'>
                                        <li className='short-li'><strong>媒体监测服务联系人：</strong>
                                            {isMobileScreen && <br />}
                                            邰海霞 (010-85893398-807) 
                                            <br />
                                            {!isMobileScreen && <div>    
                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                &nbsp;&nbsp;&nbsp;&nbsp; 
                                            </div>}
                                            (010-85802282-807)
                                        </li>
                                        <li><strong>广告及线下活动联系人：</strong>刘振（010-85893398-802）</li>
                                        <li><strong>地址：</strong>北京市朝阳区西大望路3号蓝堡国际中心1座607室</li>
                                        <li><strong>邮编：</strong>100026 </li>
                                    </ul>
                                    <h4 className='contact-sub-title'>深圳分公司</h4>
                                    <ul className='contact-hotline-list clearfix'>
                                        <li><strong>业务联系人：</strong>林妙婷（0755-23917699）</li>
                                        <li><strong>邮编：</strong>518048</li>
                                        <li><strong>地址：</strong>深圳市南山区海德三道海岸大厦东座B区14层AR06</li>
                                    </ul>
                                    <h4 className='contact-sub-title'>其他联络</h4>
                                    <ul className='contact-hotline-list other-contact clearfix'>
                                        <li className='other-contact-li'><strong>邮箱：</strong>meihua@meihua.info</li>
                                    </ul>
                                    <div className="contact-qrcode-group contact-hotline-list">
                                        <div className='contact-qrcode-box'>
                                            <div className='imgbox'>
                                                <img src={wxPng} alt='' />
                                            </div>
                                            <span className='img-name'>{'梅花网微信公众号'}</span>
                                        </div>
                                        <div className='contact-qrcode-box'>
                                            <div className='imgbox padding'>
                                                <img src={wxVip} alt='' />
                                            </div>
                                            <span className='img-name'>{'梅花网微信客服'}</span>
                                        </div>
                                        {/* <div className='contact-qrcode-box'>
                                            <div className='imgbox padding'>
                                                <img src={feedbackPic} alt='' />
                                            </div>
                                            <span className='img-name'>{'在线意见反馈'}</span>
                                        </div> */}
                                    </div>
                                    <h4 className='contact-sub-title'>期待您的声音</h4>
                                    <div className="contact-content-box contact-voice-box">
                                        <div className="feedback">
                                            <Button type="primary" href="https://mingdao.com/form/037ad2adcca84916b76ac4994c94994e" target="_bank">在线意见反馈</Button>
                                        </div>
                                        <div className="desc">您的意见是我们梅花网进步的动力！点击在线意见反馈按钮，发表您的意见！</div>
                                    </div>
                                </div>
                            </div>}
                        </div>
                    </>
                }
            </div>
        )
    }
}