import { Component } from 'react'
import QRCode from 'qrcode.react'
import moment from 'moment'
import { Avatar } from 'antd'

import AuthorIdentity from '@components/widget/common/UserIdentityComp'

// import logo from '@static/images/logo_gray.svg'

// const logo = 'https://resource.meihua.info/Foj-kDkfaV6x6R4zRF8Ym7fUnjQE' 

// for 2x
const logo = 'https://resource.meihua.info/Fpwo7DNhqsjl6ZCGQGuNQarcvSdc'

export default class TopCompositionCard extends Component {

    render() {
      const { url, item, rankingLabel } = this.props
        const qrcodeUrl = url || `${location.origin}/${item.type === 1 ? 'article' : 'shots'}/${item.compositionId}`
        const compositionTypeName = item.type === 1 ? '文章' : '作品'
        const summary = `梅花网榜单${rankingLabel}收录${compositionTypeName}`
        return (
          <div className="card-box card-composition-top" style={{
            backgroundColor: '#f0f2f5',
            paddingBottom: '60px',
            // minHeight: '600px',
          }}>
            <div className="card-content" style={{position: 'relative'}}>
              <div className="card-cover" style={{
                position: 'absolute',
                width: '100%',
              }}>
                  <img src={`${item.cover}?imageMogr2/thumbnail/!1008x720r/gravity/center/crop/1008x720`} style={{maxWidth: '100%'}} />
              </div>
              <div className="card-info-wrapper" style={{
                paddingTop: '400px',
              }}>
                <div className="card-info" style={{
                  margin: '0 30px',
                  position: 'relative',
                  borderRadius: '10px',
                  textAlign: 'center',
                  boxShadow: '0 0 20px 0 rgba(125,124,150,0.20)',
                }}>
                  {/* 此标签为了防止html2canvas截图时候阴影失效，故背景色和阴影分离标签 */}
                  <div className="card-info-bg" style={{
                    padding: '80px',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    }}>
                    <div className="card-avatar" style={{
                      position: 'absolute',
                      top: '-80px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                    ><img src={item.authorAvatar} style={{ width: '160px', height: '160px', borderRadius: '80px', boxShadow: '0 0 20px 0 rgba(125,124,150,0.20)'}} /></div>
                    <div className="card-author-name" style={{marginTop: '20px', fontSize: '32px'}}>{item.authorName}</div>
                    <div className="card-author-type" style={{marginTop: '30px'}}><AuthorIdentity noTip currentType={item.authorType} style={{fontSize: '24px', padding: '2px 10px 8px', borderRadius: '4px', lineHeight: '1.4'}}/></div>
                    <div className="card-composition-type" style={{marginTop: '20px', fontSize: '28px'}}>{compositionTypeName}</div>
                    <div className="card-title" style={{marginTop: '20px', fontSize: '40px', color: '#4A4A4A', lineHeight: '1.5', }}>
                    {item.title}
                    </div>
                    <div className="card-summary" style={{marginTop: '20px', fontSize: '32px', color: '#62646A', lineHeight: '48px'}}>
                    {summary}
                    </div>
                    <div className="card-bottom" style={{marginTop: '100px', textAlign: 'center'}}>
                      <img src={logo} alt="梅花网" style={{width: '130px'}}/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="qrcode-wrapper" style={{margin: '60px 30px 0', height: '108px'}}>
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
          </div>
        )
    }
}