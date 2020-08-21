import { Component } from 'react'
import classnames from 'classnames'
import { 
  Icon,
  Tooltip,
} from 'antd'
import CIcon from '@components/widget/common/Icon'
import QrcodeModal from '@components/common/ShareModal'


export default class ShareGroup extends Component {
  state = {
    shareUrl: '',
    showQrcode: false,
    showShare: false,
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!!nextProps.shareUrl && nextProps.shareUrl !== prevState.shareUrl) {
      return {
        shareUrl: nextProps.shareUrl,
      }
    }
    return null
  }

  componentDidMount() {
    this.initShareUrl()
    this.checkShare()
  }


  initShareUrl() {
    const shareUrl = location.href
    this.setState({shareUrl})
  }

  checkShare() {
    const winWidth = window.innerWidth
    if (winWidth > 768) {
      this.setState({showShare: true})
    }
  }

  handleQrcodeModal = (visible) => {
    this.setState({showQrcode: !!visible})
  }

  render() {
    const { 
      className, 
      title, 
      description, 
      cover,
      authorName, 
      favored, 
      collected, 
      favors, 
      collections, 
      comments, 
      hideActions, 
      hideFavor,
      hideCollection,
      hideComment,
      onFavor, 
      onCollection, 
      onCard, 
      showCard,
      tagPageShare, 
      scope,
      cardIcon,
      miniappIcon,
      style,
    } = this.props

    const {shareUrl, showQrcode, showShare} = this.state

    let titleAuthorName = '《' + title + '》  创作者：' + authorName 
    if (tagPageShare) {
      titleAuthorName = tagPageShare + ' - 梅花网'
    }

    switch(scope) {
      case 'topic':
          titleAuthorName = title + ' - 梅花网'
        break;
      case 'topic-detail':
        titleAuthorName = title + ' - 专题 - 梅花网'
        break;
      case 'top':
        titleAuthorName = title + ' - 梅花网'
        break
    }

		// const weibo = "javascript:void((function(s,d,e,r,l,p,t,z,c){var%20f='http://v.t.sina.com.cn/share/share.php?appkey=1881139527',u=z||d.location,p=['&url=',e(u),'&title=',e(t||d.title),'&source=',e(r),'&sourceUrl=',e(l),'&content=',c||'gb2312','&pic=',e(p||'')].join('');function%20a(){if(!window.open([f,p].join(''),'mb',['toolbar=0,status=0,resizable=1,width=440,height=430,left=',(s.width-440)/2,',top=',(s.height-430)/2].join('')))u.href=[f,p].join('');};if(/Firefox/.test(navigator.userAgent))setTimeout(a,0);else%20a();})(screen,document,encodeURIComponent,'','','" + cover + "', '《" + title + '》  创作者：' + authorName + ' - 更多 猛戳：' + shareUrl + "（分享来自@梅花网）','" + shareUrl + "#SINA-WEIBO','页面编码gb2312|utf-8默认gb2312'));";
		const weibo = "javascript:void((function(s,d,e,r,l,p,t,z,c){var%20f='http://v.t.sina.com.cn/share/share.php?appkey=1881139527',u=z||d.location,p=['&url=',e(u),'&title=',e(t||d.title),'&source=',e(r),'&sourceUrl=',e(l),'&content=',c||'gb2312','&pic=',e(p||'')].join('');function%20a(){if(!window.open([f,p].join(''),'mb',['toolbar=0,status=0,resizable=1,width=440,height=430,left=',(s.width-440)/2,',top=',(s.height-430)/2].join('')))u.href=[f,p].join('');};if(/Firefox/.test(navigator.userAgent))setTimeout(a,0);else%20a();})(screen,document,encodeURIComponent,'','','" + cover + "', '" + titleAuthorName + ' - 更多 猛戳：' + shareUrl + "（分享来自@梅花网）','" + shareUrl + "#SINA-WEIBO','页面编码gb2312|utf-8默认gb2312'));";
		// const qq = "javascript:void(function(){var d=document,e=encodeURIComponent,r='http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+e('" + shareUrl + "#QZONE')+'&title='+e('" + title + "')+'',x=function(){if(!window.open(r,'qzone','toolbar=0,resizable=1,scrollbars=yes,status=1,width=600,height=600'))location.href=r};if(/Firefox/.test(navigator.userAgent)){setTimeout(x,0)}else{x()}})();";


    return (
      <>
      <div 
        className={classnames(
          'share-container', 
          {'not-actions': hideActions},
          className,
        )}
        style={style}
      >
        {!hideActions &&
        <div className="actions">
          {!hideFavor &&
          <div className="action-item favor">
            <Tooltip title="喜欢">
            <div className={classnames('action-icon', 'favor', {active: favored})} onClick={onFavor}>
              {/* <Icon type="heart" theme="filled" /> */}
              <CIcon name="heart" />
            </div>
            </Tooltip>
            <div className="count">{favors || 0}</div>
          </div>}
          {!hideCollection &&
          <div className="action-item collection">
              <Tooltip title="收藏">
            <div className={classnames('action-icon', 'collection', {active: collected})} onClick={onCollection}>
                {/* <Icon type="star" theme="filled" /> */}
                <CIcon name="star" />
            </div>
              </Tooltip>
            <div className="count">{collections || 0}</div>
          </div>}
          {!hideComment &&
          <div className="action-item comment">
              <Tooltip title="评论"> 
            <div className={classnames('action-icon', 'comment')} >
                <a href="#comment"><CIcon name="pinglun" /></a>
            </div>
              </Tooltip>
            <div className="count">{comments || 0}</div>
          </div>}
        </div>}

        {showShare && 
        <div>
          <div className="share-title">
            分享
          </div>
          <div className="shares">
            <div className="action-icon wx" onClick={e => this.handleQrcodeModal(true)}>
              <a>
                {/* <Icon type="wechat" /> */}
                <CIcon name="wechat" />
              </a>
            </div>
            <div className="action-icon weibo">
              <a href={weibo} >
                {/* <Icon type="weibo" /> */}
                <CIcon name="weibo" />
              </a>
            </div>
            {showCard && 
            <div className="action-icon card">
              <a onClick={onCard}>
                {cardIcon || <CIcon name="card" />}
              </a>
            </div>}
            {/* <div className="action-icon qq">
              <a href={qq} target="_blank">
                <Icon type="qq" />
              </a>
            </div> */}
            {miniappIcon && <div className="action-icon mini-app">
              <a>
                {/* <CIcon name="mini-app" /> */}
                {miniappIcon}
              </a>
            </div>}
          </div>
        </div>}
      </div>
      {showShare &&
      <QrcodeModal
        visible={showQrcode}
        url={shareUrl}
        onCancel={e => this.handleQrcodeModal(false)}
      />}
      </>
    )
  }
}