import QRCode from 'qrcode.react'
import { Popover } from 'antd'

import classnames from 'classnames'
import CustomIcon from '@components/widget/common/Icon'

import './index.less'

const ShareBox = (props) => {
  const { className, url, cover, title, description } = props
  const currUrl = url || typeof window === 'undefined' ? '' : window.location.href
  // const weibo = "javascript:void((function(s,d,e,r,l,p,t,z,c){var%20f='http://v.t.sina.com.cn/share/share.php?appkey=1881139527',u=z||d.location,p=['&url=',e(u),'&title=',e(t||d.title),'&source=',e(r),'&sourceUrl=',e(l),'&content=',c||'gb2312','&pic=',e(p||'')].join('');function%20a(){if(!window.open([f,p].join(''),'mb',['toolbar=0,status=0,resizable=1,width=440,height=430,left=',(s.width-440)/2,',top=',(s.height-430)/2].join('')))u.href=[f,p].join('');};if(/Firefox/.test(navigator.userAgent))setTimeout(a,0);else%20a();})(screen,document,encodeURIComponent,'','','" + cover + "', '" + title + ' - 更多 猛戳：' + shareUrl + "（分享来自@梅花网）','" + shareUrl + "#SINA-WEIBO','页面编码gb2312|utf-8默认gb2312'));";
  // const qq = "javascript:void(function(){var d=document,e=encodeURIComponent,r='http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+e('" + shareUrl + "')+'&title='+e('" + title + "')+'',x=function(){if(!window.open(r,'qzone','toolbar=0,resizable=1,scrollbars=yes,status=1,width=600,height=600'))location.href=r};if(/Firefox/.test(navigator.userAgent)){setTimeout(x,0)}else{x()}})();";

  const handleShareClick = (key) => {
    const currentUrl = encodeURIComponent(currUrl)
    const shareTitle = encodeURIComponent(title)
    const shareDesc = encodeURIComponent(description)
    let shareUrl = ''
    switch (key) {
      case 'qq':
        shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${currentUrl}&showcount=0&desc=${shareDesc}&summary=&title=${shareTitle}&pics=&style=203&width=19&height=22`
        break
      case 'wb':
        shareUrl = `http://service.weibo.com/share/share.php?url=${currentUrl}&appkey=&title=${shareTitle}&pic=${cover}&ralateUid=&language=&searchPic=false#_loginLayer_1594732590008`
        break
    }
    window.open(shareUrl)
  }

  return (
    <div className={classnames('share-box-wrapper', className)}>
      <div className="share-box">
        <div className="share-title">
          <span className="text">分享</span>
        </div>
        <div className="share-list">
          <div className="share-item">
            <Popover
              overlayClassName="share-wx-qrcode-overlay"
              //trigger="click"
              placement="right"
              title={<div style={{textAlign: 'center'}}>微信扫一扫</div>}
              content={
                <div className="qrcode">
                  <QRCode 
                    value={currUrl} 
                    size={120} 
                  />
                </div>
              }
            >
            <span className="icon-circle wx">
              <CustomIcon name="wechat" />            
            </span>
          </Popover>
          </div>
          <div className="share-item">
            <a className="icon-circle wb" onClick={e => handleShareClick('wb')}>
              <CustomIcon name="weibo" />            
            </a>
          </div>
          <div className="share-item">
            <a className="icon-circle qq" onClick={e => handleShareClick('qq')}>
              <CustomIcon name="qq" />            
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareBox