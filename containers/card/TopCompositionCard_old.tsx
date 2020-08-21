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
        return (
          <div className="card-box card-composition-top" style={{
            backgroundColor: '#f0f2f5',
            paddingBottom: '30px',
            minHeight: '600px',
          }}>
            <div className="card-content" style={{position: 'relative'}}>
              <div className="card-cover" style={{
                position: 'absolute',
                width: '100%',
              }}>
                  <img src={`${item.cover}?imageMogr2/thumbnail/!504x360r/gravity/center/crop/504x360`} style={{maxWidth: '100%'}} />
              </div>
              <div className="card-info-wrapper" style={{
                paddingTop: '200px',
              }}>
                <div className="card-info" style={{
                  margin: '0 15px',
                  position: 'relative',
                  borderRadius: '5px',
                  textAlign: 'center',
                  boxShadow: '0 0 20px 0 rgba(125,124,150,0.20)',
                }}>
                  {/* 此标签为了防止html2canvas截图时候阴影失效，故背景色和阴影分离标签 */}
                  <div className="card-info-bg" style={{
                    padding: '40px',
                    backgroundColor: 'white',
                    borderRadius: '5px',
                    }}>
                    <div className="card-avatar" style={{
                      position: 'absolute',
                      top: '-40px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                    ><img src={item.authorAvatar} style={{ width: '80px', height: '80px', borderRadius: '40px', boxShadow: '0 0 20px 0 rgba(125,124,150,0.20)'}} /></div>
                    <div className="card-author-name" style={{marginTop: '10px'}}>{item.authorName}</div>
                    <div className="card-author-type" style={{marginTop: '10px'}}><AuthorIdentity type={item.authorType} /></div>
                    <div className="card-composition-type" style={{marginTop: '10px', fontSize: '14px'}}>{compositionTypeName}</div>
                    <div className="card-title" style={{marginTop: '10px', fontSize: '20px', color: '#4A4A4A', lineHeight: '1.5', }}>
                    {item.title}
                    </div>
                    <div className="card-summary" style={{marginTop: '10px', fontSize: '16px', color: '#62646A', lineHeight: '24px'}}>
                    梅花网榜单{rankingLabel}收录{compositionTypeName}
                    </div>
                    <div className="card-bottom" style={{marginTop: '50px', textAlign: 'center'}}>
                      <img src={logo} alt="梅花网" style={{width: '65px'}}/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="qrcode-wrapper" style={{margin: '30px 15px 0', height: '54px'}}>
                <div id="qrcode-wrapper" className="qrcode" style={{float: 'left', width: '54px', height: '54px'}}>
                  <QRCode 
                    id="qrcode-canvas"
                    value={qrcodeUrl || ''} 
                    size={54} 
                  />
                </div>
                <div className="qrcode-text" style={{ float: 'left', marginLeft: '10px', fontSize: '12px', color: '#999', lineHeight: '24px'}}>
                  <div>长按图片识别二维码 </div>
                  <div>快速查看原文及更多优质内容</div>
                </div>
              </div>
            </div>
          </div>
        )
    }
}