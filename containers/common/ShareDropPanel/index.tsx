import { Component } from 'react'
import dynamic from 'next/dynamic'
import { Dropdown, Menu, message } from 'antd'
import QRCode from 'qrcode.react'

import CustomIcon from '@components/widget/common/Icon'


import './index.less'

const CardIcon = dynamic(() => import('@containers/card/CardIcon'), {ssr: false, loading: () => <span></span>})

const menuData = [
  {key: 'link', name: '复制链接', icon: 'link'},
  {key: 'card', name: '生成卡片', icon: 'card'},
  {key: 'weibo', name: '新浪微博', icon: 'weibo'},
  {key: 'wechat', name: '微信扫一扫', icon: 'wechat'},
]

class ShareDropPanel extends Component {

  handleCopy = (e) => {
    const obj = e.target
    obj.select();
    document.execCommand("Copy");
    // const inputJs = obj.createTextRange();
    // inputJs.execCommand("Copy")
    // var clipBoardContent=this.location.href;
    // window.clipboardData.setData("Text",postNo);
    message.success("复制成功!");
  }

  render() {
    const { 
      children, 
      trigger, 
      placement, 
      exclude=[], 
      url, 
      cover, 
      title, 
      cardType,
      cardName,
      cardTitle,
      cardItem,
      ...rest 
    } = this.props

    const menuFilters = menuData.filter(item => !exclude.includes(item.key))

    const shareUrl = url || typeof window === 'undefined' ? '' : window.location.href
    const weibo = "javascript:void((function(s,d,e,r,l,p,t,z,c){var%20f='http://v.t.sina.com.cn/share/share.php?appkey=1881139527',u=z||d.location,p=['&url=',e(u),'&title=',e(t||d.title),'&source=',e(r),'&sourceUrl=',e(l),'&content=',c||'gb2312','&pic=',e(p||'')].join('');function%20a(){if(!window.open([f,p].join(''),'mb',['toolbar=0,status=0,resizable=1,width=440,height=430,left=',(s.width-440)/2,',top=',(s.height-430)/2].join('')))u.href=[f,p].join('');};if(/Firefox/.test(navigator.userAgent))setTimeout(a,0);else%20a();})(screen,document,encodeURIComponent,'','','" + cover + "', '" + title + ' - 更多 猛戳：' + shareUrl + "（分享来自@梅花网）','" + shareUrl + "#SINA-WEIBO','页面编码gb2312|utf-8默认gb2312'));";

    const menu = <Menu className="share-drop-panel-menu">
      {menuFilters.map(item => {
        if (item.key === 'card') {
          return <Menu.Item key={item.key}>
            <CardIcon
              type={cardType}
              cardName={cardName}
              title={cardTitle}
              item={cardItem}
            >
              <div><CustomIcon name={item.icon} className={item.key} /> <span>{item.name}</span></div>
            </CardIcon>
          </Menu.Item>
        } else if (item.key === 'link') {
          return <Menu.Item key={item.key}><div><CustomIcon name={item.icon} className={item.key} /> <span>{item.name}</span></div><input style={{opacity: 0, position: 'absolute', top: '0px', left: '0px', height: '100%', width: '100%'}} onClick={this.handleCopy} defaultValue={shareUrl} /></Menu.Item>
        } else if (item.key === 'weibo') {
          return <Menu.Item key={item.key}><a href={weibo}><CustomIcon name={item.icon} className={item.key} /> <span>{item.name}</span></a></Menu.Item>
        } else if (item.key === 'wechat') {
          
          return <Menu.Item key={item.key}>
            <div><CustomIcon name={item.icon} className={item.key} /> <span>{item.name}</span></div>
            <div className="qrcode">
              <QRCode 
                value={shareUrl} 
                size={110} 
              />
            </div>
            </Menu.Item>
        }
        return null
      })}
    </Menu>

    return (
      <Dropdown
        {...rest}
        placement={placement || 'topLeft'}
        trigger={trigger || ['click']}
        overlay={menu}
      >
        {children}
      </Dropdown>

    )
  }
 }

 export default ShareDropPanel