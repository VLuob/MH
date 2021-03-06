import { Component } from 'react'
import QRCode from 'qrcode.react'
import moment from 'moment'

// import logo from '@static/images/logo.svg'


// const logo = 'https://resource.meihua.info/FndvUGrcJUu0k2U_vuUgyhP4tMee' 

// for 2x
// const logo = 'https://resource.meihua.info/FhLZqZNqONzEDP12HLDKpHjknTXs'

// for 2x gray
const logo = 'https://resource.meihua.info/Fpwo7DNhqsjl6ZCGQGuNQarcvSdc'
 
// const cardBg = 'https://resource.meihua.info/FqsLh04rVfle1j8-LvzItUq0Ngwy?imageslim'


export default class CompositionCard extends Component {


    render() {
      const { url, item } = this.props
        const qrcodeUrl = url || `${location.origin}/${item.type === 1 ? 'article' : 'shots'}/${item.compositionId}`
        return (
          <div className="card-box card-composition-detail" 
            style={{
              padding: '40px 30px 60px', 
              fontFamily: '"Microsoft YaHei",微软雅黑', 
              // minHeight: '560px', 
              backgroundColor: '#f0f2f5', 
              // backgroundImage: `url(${cardBg})`, 
              // backgroundSize: 'cover',
            }}>
            <div className="card-content" style={{borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white'}}>
              <div className="card-cover">
                  <img src={`${item.cover}?imageMogr2/thumbnail/!1008x720r/gravity/center/crop/1008x720`} style={{maxWidth: '100%'}} />
              </div>
              <div className="card-info" style={{padding: '40px'}}>
                <div className="card-title" style={{fontSize: '32px', color: '#191919', lineHeight: '1.75', textAlign: 'justify'}}>
                {item.title}
                </div>
                <div className="card-intro" style={{fontSize: '24px', color: '#999', lineHeight: '1', marginTop: '20px'}}>
                  {moment(item.gmtPublished).format('YYYY-MM-DD')} · {item.type === 1 ? item.classificationName : item.categoryName}
                </div>
                <div className="card-summary" style={{marginTop: '20px', fontSize: '28px', color: '#62646A', lineHeight: '48px', textAlign: 'justify'}}>
                {item.summary}
                </div>
                <div className="card-bottom" style={{marginTop: '60px', textAlign: 'center'}}>
                  <img src={logo} alt="梅花网" style={{width: '130px'}}/>
                </div>
              </div>
            </div>
            <div className="qrcode-wrapper" style={{marginTop: '60px', height: '108px'}}>
              <div id="qrcode-wrapper" className="qrcode" style={{float: 'left', width: '108px', height: '108px'}}>
                <QRCode 
                  id="qrcode-canvas"
                  value={qrcodeUrl || ''} 
                  size={108} 
                />
              </div>
              <div className="qrcode-text" style={{ float: 'left', marginLeft: '20px', fontSize: '24px', color: '#999', lineHeight: '48px'}}>
                <div>长按图片识别二维码 </div>
                <div>快速查看原文及更多优质内容</div>
              </div>
            </div>
          </div>
        )
    }
}