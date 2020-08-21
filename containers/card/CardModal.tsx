import { PureComponent } from 'react'
import { inject, observer } from 'mobx-react'
import { Modal, Button, Icon } from 'antd'
import QRCode from 'qrcode.react'
import html2canvas from 'html2canvas'
import Frame from 'react-frame-component'
import CIcon from '@components/widget/common/Icon'
import QrcodeModal from '@components/common/ShareModal'

import CompositionCard from './CompositionCard'
import TopCompositionCard from './TopCompositionCard'
import TopAuthorCard from './TopAuthorCard'

import { utils, config, helper } from '@utils'

import logo from '@static/images/logo.svg'
// import cardBg from '@static/images/card/card_bg.jpg'

const cardBg = 'https://resource.meihua.info/FqsLh04rVfle1j8-LvzItUq0Ngwy?imageslim'


export interface Props {
  onCancel: Function
}

@inject(stores => {
  const { globalStore } = stores.store
  return {
    globalStore,
    qiniuToken: globalStore.qiniuToken,
  }
})
@observer
export default class CardModal extends PureComponent<Props> {
  
  state = {
    showShareIcons: false,
    imageUrl: '',
    imageHash: '',

    showQrcode: false,
  }

  componentDidMount() {
    // this.initQiniuToken()

  }

    
  initQiniuToken() {
    const { globalStore, qiniutoken } = this.props
    if (!qiniutoken) {
      globalStore.fetchQiniuToken()
    }
  }

  handleFrameDodMount = () => {
    // const iframeBody = this.getIframeBody()
    // console.log(this.frameRef)
  }

  // getIframeBody() {
  //   const iFrame = this.frameRef.node
  //   const iframeBody = iFrame.contentDocument ? iFrame.contentWindow.document.getElementsByTagName('body')[0] : iFrame.contentDocument.getElementsByTagName('body')[0]
  //   return iframeBody
  // }

  getImageUrl = (fn) => {
    // const capture = document.querySelector('#share-card-image-html')
    const iFrame = this.frameRef.node
    const capture = iFrame.contentDocument ? iFrame.contentWindow.document.getElementsByTagName('body')[0] : iFrame.contentDocument.getElementsByTagName('body')[0]
    // const capture = iframeBody.querySelector('#mountHere')

    // const div = document.createElement('div')
    // div.appendChild(iFrame.contentWindow.document.getElementsByTagName('html')[0])

    // console.log(iFrame.contentWindow.document.getElementsByTagName('html')[0])
    // console.log(div.innerHTML)

    // const capture = document.querySelector('#share-card-image-html')


    // capture.style.overflow = 'hidden'


    
    // const cloneCapture = document.createElement('div')
    const captureStyle = window.getComputedStyle(capture)
    const w = parseInt(captureStyle.width)
    const h = parseInt(captureStyle.height)
    // cloneCapture.innerHTML = capture.innerHTML
    // cloneCapture.classList.add('create-card-container')
    // cloneCapture.style.position = 'absolute'
    // cloneCapture.style.top = window.scrollY + 'px'
    // cloneCapture.style.width = w + 'px'
    // cloneCapture.style.height = h + 'px'
    // cloneCapture.style.zIndex = '-1'

    // console.log(cloneCapture)

    // const qrcodeWrapper = cloneCapture.querySelector('#qrcode-wrapper')
    // const sourceCanvas = capture.querySelector('#qrcode-canvas')
    // const qrcodeCanvas = qrcodeWrapper.querySelector('#qrcode-canvas')
    // const qrcodeBase64 = sourceCanvas.toDataURL('image/png', 1.0)

    // this.uploadQrcode(qrcodeBase64, (qrcodeUrl) => {
    //   const newImg = new Image()
    //   newImg.src = qrcodeUrl
    //   newImg.style.width = '54px'
    //   newImg.style.height = '54px'
    //   qrcodeWrapper.removeChild(qrcodeCanvas)
    //   qrcodeWrapper.appendChild(newImg)
    //   console.log(cloneCapture.innerHTML)
    // })

    // const newCanvas = document.createElement('canvas')
    // newCanvas.width = w * 2
    // newCanvas.height = h * 2
    // newCanvas.style.width = (w * 2) + 'px'
    // newCanvas.style.height = (h * 2) + 'px'
    // const canvasContext = newCanvas.getContext('2d')
    // canvasContext.scale(2,2)


    // document.body.appendChild(cloneCapture)

    const config = {
      logging: true,
      profile: true,
      //Whether to allow cross-origin images to taint the canvas
      allowTaint: true,
      //Whether to test each image if it taints the canvas before drawing them
      taintTest: false,
      // scale: 1,
      // allowTaint: true
      useCORS: true,
      // foreignObjectRendering: true,
      // dpi: 96,
      dpi: window.devicePixelRatio,
      // dpi: 300,
      // canvas: newCanvas,
    }
    html2canvas(capture, config).then(canvas => {
      // window.scrollTo(scrollX,scrollY)
      const strDataURI = canvas.toDataURL('image/png', 1.0)
      const imgUrl = strDataURI.replace("image/png", "image/octet-stream");
      // console.log(imgUrl)
      // utils.down(imgUrl, '分享卡片.png')
      // capture.style.overflow = ''
      if (fn) fn(imgUrl)
    })

  }
  
  handleSave = () => {
    // this.getImageUrl(imgUrl => {
    //   const { cardName } = this.props
    //   console.log('card name',cardName)
    //   // console.log(imgUrl)
    //   utils.down(imgUrl, `${cardName || '分享卡片'}.png`)
    //   // window.open(imgUrl,  cardName + ".png")
    // })

    this.uploadImage((imgHash) => {
      const { cardName } = this.props
      this.setState({imgHash, imageUrl: `${config.RESOURCE_QINIU_DOMAIN}/${imgHash}`})
      window.open(`${config.RESOURCE_QINIU_DOMAIN}/${imgHash}?attname=${cardName}.png`)
    })

  }

  uploadQrcode(base64, fn) {
    const { qiniuToken } = this.props
    const token = qiniuToken
    helper.qiniuPutb64({base64, token}).then((res) => {
      if (fn) fn(`${config.RESOURCE_QINIU_DOMAIN}/${res.hash}`)
    })
  }

  uploadImage(fn) {
    const {imageHash} = this.props
    if (imageHash) {
      if (fn) fn(imageHash)
    } else {
      this.getImageUrl(imgUrl => {
        const { qiniuToken } = this.props;
        const token = qiniuToken;
        helper.qiniuPutb64({base64: imgUrl, token}).then((res) => {
          const imageUrl = `${config.RESOURCE_QINIU_DOMAIN}/${res.hash}`
          this.setState({imageUrl, imageHash: res.hash})
          if (fn) fn(res.hash)
        })
      })
    }
  }

  handleShareWeibo = () => {
    const { title:currTitle  } = this.props
   this.uploadImage((imgHash) => {
      const cover = `${config.RESOURCE_QINIU_DOMAIN}/${imgHash}`
      const title = currTitle || ''
      const shareUrl = location.href
      // const weibo = "javascript:void((function(s,d,e,r,l,p,t,z,c){var%20f='http://v.t.sina.com.cn/share/share.php?appkey=1881139527',u=z||d.location,p=['&url=',e(u),'&title=',e(t||d.title),'&source=',e(r),'&sourceUrl=',e(l),'&content=',c||'gb2312','&pic=',e(p||'')].join('');function%20a(){if(!window.open([f,p].join(''),'mb',['toolbar=0,status=0,resizable=1,width=440,height=430,left=',(s.width-440)/2,',top=',(s.height-430)/2].join('')))u.href=[f,p].join('');};if(/Firefox/.test(navigator.userAgent))setTimeout(a,0);else%20a();})(screen,document,encodeURIComponent,'','','" + cover + "', '" + title  + "','" + shareUrl + "#SINA-WEIBO','页面编码gb2312|utf-8默认gb2312'));";
      const weibo = `javascript:void((function(s,d,e,r,l,p,t,z,c){var%20f='http://v.t.sina.com.cn/share/share.php?appkey=2549043541',u=z||d.location,p=['&url=',e(u),'&title=',e(t||d.title),'&source=',e(r),'&sourceUrl=',e(l),'&content=',c||'gb2312','&pic=',e(p||'')].join('');function%20a(){if(!window.open([f,p].join(''),'mb',['toolbar=0,status=0,resizable=1,width=440,height=430,left=',(s.width-440)/2,',top=',(s.height-430)/2].join('')))u.href=[f,p].join('');};if(/Firefox/.test(navigator.userAgent))setTimeout(a,0);else%20a();})(screen,document,encodeURIComponent,'','','${cover}', '${title}','${shareUrl}#?weibo','页面编码gb2312|utf-8默认gb2312'));`
      const link = document.createElement('a')
      link.target = '_blank'
      link.href = weibo
      link.click()
   })
  }

  handleShareWechat = () => {
    this.uploadImage((imgHash) => {
      this.setState({imageUrl: `${config.RESOURCE_QINIU_DOMAIN}/${imgHash}`})
      this.handleQrcodeModal(true)
    })
  }

  handleShare = () => {
    this.setState({showShareIcons: true})
  }

  handleReturn = () => {
    this.setState({showShareIcons: false})
  }

  handleQrcodeModal = (visible) => {
    this.setState({showQrcode: !!visible})
  }
  
  render() {
    const { onCancel, visible, type, item, ...rest } = this.props
    const { showShareIcons, showQrcode, imageUrl } = this.state
    let cardContent
    switch(type) {
      case 'compositionDetail':
        cardContent = <CompositionCard 
                        {...rest}
                        item={item}
                      />
        break
      case 'compositionTop':
        cardContent = <TopCompositionCard
                        {...rest}
                        item={item}
                      />
        break
      case 'authorTop':
        cardContent = <TopAuthorCard
                        {...rest}
                        item={item}
                      />
        break
    }

    return (
      <>
      <Modal
        className="modal-card"
        // title="分享卡片"
        width={420}
        visible={visible}
        onCancel={onCancel}
        footer={null}
      >
        <div className="modal-card-container">
          <div className="card-header">分享卡片</div>
          <div id="share-card-image-html" className="card-container">
            {/* <Frame 
              ref={el => this.frameRef = el}
							frameBorder={0}
							initialContent={`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;border:0;outline:0} body{font-family: "Microsoft YaHei",微软雅黑;} div{box-sizing: border-box;}</style></head><body><div id="mountHere"></div></body></html>`}
              mountTarget='#mountHere'
              // contentDidUpdate={this.handleFrameDodMount}
            >
              <div>{cardContent}</div>
            </Frame> */}
          </div>
          <div className="card-footer">
            {!showShareIcons &&
            <div className="card-btns">
                <Button onClick={this.handleSave}>保存</Button>
                <Button type="primary" onClick={this.handleShare}>分享</Button>
            </div>}
            {showShareIcons && 
            <div className="card-share-warpper">
              <div className="btn-return" onClick={this.handleReturn}>
                <CIcon name="double-down" />
              </div>
              <ul className="card-share-icons">
                <li><a className="weibo" onClick={this.handleShareWeibo} ><Icon type="weibo" /></a></li>
                <li><a className="wechat" onClick={this.handleShareWechat} ><Icon type="wechat" /></a></li>
              </ul>
            </div>}
          </div>
        </div>
        
      </Modal>
      <QrcodeModal
        visible={showQrcode}
        url={imageUrl}
        onCancel={e => this.handleQrcodeModal(false)}
      />
      <Frame 
        style={{width: '750px',}}
        ref={el => this.frameRef = el}
        id="share-card-iframe"
        frameBorder={0}
        initialContent={`<!DOCTYPE html><html><head><style>*{margin:0;padding:0;border:0;outline:0} body{font-family: "Microsoft YaHei",微软雅黑;} div{box-sizing: border-box;}</style></head><body><div id="mountHere"></div></body></html>`}
        mountTarget='#mountHere'
      >
        <div>{cardContent}</div>
      </Frame>
      </>
    )
  }
}