import { Component } from 'react'
import { toJS } from 'mobx'
import Swiper from 'swiper'
import classnames from 'classnames'
import { Icon } from 'antd'
import { Player, ControlBar, BigPlayButton } from 'video-react'
import AuthorInfo from '@components/author/AuthorInfo'
import { UploadFileTypes, EditionType } from '@base/enums'
import CIcon from '@components/widget/common/Icon' 
import HLSSource from '@components/common/HLSSource'

import ActionsMobileFullscreen from '../ActionsMobileFullscreen'

import 'video-react/dist/video-react.css'

import './index.less'

const defaultGalleryHeight = 430

// let mySwiper = null

export default class GalleryMobile extends Component {
  constructor(props) {
    super(props)

    this.mySwiper = null

    this.state = {
      isFullscreen: !!props.isFullscreen,
      hideThumbs: false,
      currentIndex: 0,
      isOneAndOne: false,
      showLongPicture: false,
      galleryHeight: -1,
      isCurrentLongPic: false,
    }
  }
  componentDidMount() {
    setTimeout(() => {
      this.initSwiter()
    }, 50)

  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.isFullscreen !== this.props.isFullscreen) {
      this.setState({isFullscreen: nextProps.isFullscreen})
    }
  }
  

  initSwiter() {
    const _this = this
    const { index } = this.props
    // const slidesPerView = window.outerWidth <= 1360 ? 7 : 9
    const galleryThumbs = new Swiper('.gallery-thumbs-mb', {
      spaceBetween: 10,
      // slidesPerView: slidesPerView,
      slidesPerView: 'auto',
      centerInsufficientSlides: true,
      // loop: true,
      freeMode: true,
      loopedSlides: 1, //looped slides should be the same
      watchSlidesVisibility: true,//防止不可点击
      slideToClickedSlide: true,
      // watchSlidesProgress: true,
      scrollbar: {
        el: '.swiper-scrollbar',
        hide: true,
      },
      observer:true,
      observeParents:true,
      // paceBetween: 10,
      // centeredSlides: true,
      // slidesPerView: 'auto',
      // touchRatio: 0.2,
      // slideToClickedSlide: true,
    });
    
    this.mySwiper = new Swiper('.gallery-swiper-mb', {
      spaceBetween: 10,
      // loop:true,
      loopedSlides: 5, //looped slides should be the same
      watchSlidesProgress : true,
      watchSlidesVisibility : true,
      // effect : 'coverflow',
      // slidesPerView: 3,
      // centeredSlides: true,
      // coverflowEffect: {
      //   rotate: 30,
      //   stretch: 10,
      //   depth: 60,
      //   modifier: 2,
      //   slideShadows : true
      // },

      // zoom: true,
      setWrapperSize :true,

      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },

      lazy: {
        loadPrevNext: true,
      },

      thumbs: {
        swiper: galleryThumbs,
        slideThumbActiveClass: 'my-slide-thumb-active',
      },

      on: {
        init: function(){
          if (!!index && index > 0) {
            setTimeout(() => {
              this.slideToLoop(index, 600, false)
            }, 100)
          }
          // const slides = this.slides


          // for (let k in slides) {
          //   const slide = slides[k]
          //   if (typeof slide === 'object' && slide.querySelector('img.img-file')) {
          //     const slideHeight = slide.clientHeight
          //     const img = slide.querySelector('img.img-file')
          //     // console.log(img.src, img['data-url'])
              
          //   }
          // }
          setTimeout(() => {
            this.emit('transitionEnd');//在初始化时触发一次transitionEnd事件，需要先设置transitionEnd
          }, 600)
        },


        // 动画完成触发事件
        transitionEnd: function() {
          _this.transitionEnd(this)
        },

        lazyImageLoad: function(slideEl, imageEl){
          // console.log(slideEl);//哪个slide里面的图片在加载，返回slide的DOM
          // console.log($(slideEl).index());//哪个slide里面(JQ)的图片在加载，返回slide的index
          // console.log(imageEl);//哪个图片在加载，返回图片的DOM
          if (imageEl.nodeName === 'IMG') {
            const smallSrc = imageEl.getAttribute('data-small-src')
            imageEl.removeAttribute('data-small-src')
            imageEl.setAttribute('src', smallSrc);
          }

        }, //end lazyImageLoad

        sliderMove: function(e) {
          // console.log(e.target)

        },

        slideChange: (e) => {
          this.setState({isOneAndOne: false})
          this.mySwiper.allowTouchMove = true

          const { isFullscreen, hideThumbs } = this.state
          const prevIndex = this.mySwiper.previousIndex
          const prevSlide = this.mySwiper.slides[prevIndex]
          const prevImg = prevSlide.querySelector('img.img-file')
          if (prevImg) {
            const windowHeight = window.innerHeight
            const slideWidth = prevSlide.clientWidth
            // const slideHeight = slide.clientHeight
            // const slideHeight = hideThumbs ? windowHeight - 140 : windowHeight - 220
            const slideHeight = windowHeight
            const imgWidth = prevImg.width
            const imgHeight = prevImg.height
            let scale = 1
            
            if (isFullscreen) {
              if (slideHeight < imgHeight) {
                scale = parseFloat((slideHeight / imgHeight).toFixed(4))
              } else if (slideWidth < imgWidth) {
                scale = parseFloat((slideWidth / imgWidth).toFixed(4))
              }
              prevImg.style.transform = `translate3d(0px, 0px, 0px) scale(${scale})`
            }
  
            // console.log('fullscreen', currentIndex, slideWidth, slideHeight, img.width, img.height)
            // img.style.width = `${imgWidth}px`

          }
        },

        tap: (e) => {
          // console.log('tap', e.target.nodeName)
          if (e.target.nodeName === 'IMG') {
            const { isFullscreen } = this.state
            if (isFullscreen) {
              this.handleReturn()
            } else {
              this.handleFullScreen()
            }
            
          }
        }
      },
      
    })
  }

  transitionEnd = (currSwiper) => {
    const mySwiper = currSwiper || this.mySwiper
    if (!mySwiper) {
      return
    }
    const { isFullscreen } = this.state

    const previousIndex = mySwiper.previousIndex
      const currentIndex = mySwiper.realIndex
      this.setState({currentIndex})
      // console.log('transition end ', currentIndex)

      const previousSlide = mySwiper.slides[previousIndex]
      const slide = mySwiper.slides[currentIndex]
      // console.log('data type', slide.getAttribute('datatype'))
      const img = slide.querySelector('img.img-file')
      if (img) {
        const windowHeight = window.innerHeight
        const slideWidth = slide.clientWidth
        // const slideHeight = slide.clientHeight
        // const slideHeight = this.state.hideThumbs ? windowHeight - 140 : windowHeight - 220
        const slideHeight = windowHeight
        const imgWidth = img.width
        const imgHeight = img.height
        let scale = 1
        
        if (isFullscreen) {
          if (slideHeight < imgHeight) {
            scale = parseFloat((slideHeight / imgHeight).toFixed(4))
          } else if (slideWidth < imgWidth) {
            scale = parseFloat((slideWidth / imgWidth).toFixed(4))
          }
        }
        // console.log('fullscreen', currentIndex, slideWidth, slideHeight, img.width, img.height)
        // img.style.width = `${imgWidth}px`

        img.style.transform = `translate3d(0px, 0px, 0px) scale(${scale})`

      }

      if (previousSlide)  {
        // 暂停上一个视频，防止声音重叠
        const video = previousSlide.querySelector('video.video-react-video')
        if (video) {
          video.pause()
        }
      }
      if (!isFullscreen) {
        this.checkSetLongPuctire(mySwiper)
      }
  }

  handleThumbsToggle = () => {
    this.setState({hideThumbs: !this.state.hideThumbs})
  }

  handleZoomIn = () => {
    if (!this.mySwiper) {
      return
    }
    const slide = this.mySwiper.slides[this.mySwiper.realIndex]
    const img = slide.querySelector('img.img-file')
    if (img) {
      const transformValues = this.getTransformValues(img.style.transform)
      this.mySwiper.allowTouchMove = false
      let scale = transformValues[3] + 0.2
      if (scale < 10) {
        img.style.transform = `translate3d(${transformValues[0]}px, ${transformValues[1]}px, ${transformValues[2]}px) scale(${scale})`
      }
      // this.mySwiper.zoom.in()
    }
  }

  handleZoomOut = () => {
    if (!this.mySwiper) {
      return
    }
    // this.mySwiper.allowTouchMove = true
    // this.mySwiper.zoom.out()

    this.mySwiper.allowTouchMove = true
    const slide = this.mySwiper.slides[this.mySwiper.realIndex]
    const img = slide.querySelector('img.img-file')
    if (img) {
      const transformValues = this.getTransformValues(img.style.transform)
      let scale = transformValues[3] - 0.2
      if (scale > 0.2) {
        img.style.transform = `translate3d(${transformValues[0]}px, ${transformValues[1]}px, ${transformValues[2]}px) scale(${scale})`
      }
      // this.mySwiper.zoom.in()
    }
  }

  handleZoomNormal = () => {
    if (!this.mySwiper) {
      return
    }
    // this.mySwiper.zoom.out()
    const slide = this.mySwiper.slides[this.mySwiper.realIndex]
    const img = slide.querySelector('img.img-file')
    if (img) {
      const { isOneAndOne, hideThumbs } = this.state
      // img.style.maxHeight = 'initial'
      const windowHeight = window.innerHeight
      const slideWidth = slide.clientWidth
      // const slideHeight = slide.clientHeight
      const slideHeight = hideThumbs ? windowHeight - 140 : windowHeight - 220
      const imgWidth = img.width
      const imgHeight = img.height
      let scale = 1

      if (isOneAndOne) {
        if (slideHeight < imgHeight) {
          scale = parseFloat((slideHeight / imgHeight).toFixed(4))
        } else if (slideWidth < imgWidth) {
          scale = parseFloat((slideWidth / imgWidth).toFixed(4))
        }
      } else {
        scale = 1
      }
      
      img.style.transform = `translate3d(0px, 0px, 0px) scale(${scale})`
      // console.log(slide.clientHeight, img.height)
      if (imgHeight > slideHeight || imgWidth > slideWidth) {
        this.mySwiper.allowTouchMove = false
      }

      this.setState({isOneAndOne: !isOneAndOne})
    }
  }

  getTransformValues = (transformStyle) => {
    let scale = 1
    let translateArr = [0,0,0]
    if (transformStyle) {
      const translateStr = transformStyle.substring(transformStyle.indexOf('translate3d(') + 12, transformStyle.indexOf(')'))
      const translateVals = translateStr.split(',')
      translateArr = translateVals.map(v => parseInt(v))
      const scaleStr = transformStyle.substring(transformStyle.lastIndexOf('scale(') + 6,transformStyle.lastIndexOf(')'))
      scale = scaleStr ? parseFloat(scaleStr) : 1
    }
    return [...translateArr, scale]
  }

  checkIsOriginSize = () => {
    if (!this.mySiper) {
      return false
    }
    const slide = this.mySwiper.slides[this.mySwiper.realIndex]
    const img = slide.querySelector('img.img-file')
    if (img) {
      const transformValues = this.getTransformValues(img.style.transform)
      // const windowHeight = window.innerHeight
      // const slideWidth = slide.clientWidth
      // // const slideHeight = slide.clientHeight
      // const slideHeight = this.state.hideThumbs ? windowHeight - 140 : windowHeight - 220
      // const imgWidth = img.width
      // const imgHeight = img.height
      if (transformValues[3] === 1) {
        return true
      }
      return false
    }
  }

  handleFullScreen = () => {
    const { onToggleFullscreen } = this.props
    if (onToggleFullscreen) {
      onToggleFullscreen(true)
    }
    this.setState({isFullscreen: true}, () => {
      document.body.style.overflow = 'hidden'
      const currSlide = this.mySwiper.slides[this.mySwiper.realIndex]
      setTimeout(() => {
        for (let key in this.mySwiper.slides) {
          const slide = this.mySwiper.slides[key]
          // console.log(currSlide === slide)
          if (typeof slide === 'object' && currSlide !==slide) {
            slide.style.width = `${this.mySwiper.width}px`
            // this.mySwiper.slides[key].style.height = `${this.mySwiper.height}px`

            const img = slide.querySelector('img.img-file')
            if (img) {
              const windowHeight = window.innerHeight
              const slideWidth = slide.clientWidth
              // const slideHeight = slide.clientHeight
              const slideHeight = this.state.hideThumbs ? windowHeight - 140 : windowHeight - 220

              const imgWidth = img.width
              const imgHeight = img.height
              let scale = 0.1
              if (slideHeight < imgHeight) {
                scale = parseFloat((slideHeight / imgHeight).toFixed(4))
              } else if (slideWidth < imgWidth) {
                scale = parseFloat((slideWidth / imgWidth).toFixed(4))
              }
  
              // console.log('fullscreen', currentIndex, slideWidth, slideHeight, img.width, img.height)
              // img.style.width = `${imgWidth}px`
              img.style.transform = `translate3d(0px, 0px, 0px) scale(${scale})`

            }

          }
        }
        this.mySwiper.update()

        // for (let key in this.mySwiper.slides) {
        //   const slide = this.mySwiper.slides[key]
        //   if (typeof slide === 'object') {

        //     const img = slide.querySelector('img.img-file')
        //     if (img) {
        //       const windowHeight = window.innerHeight
        //       const slideWidth = slide.clientWidth
        //       // const slideHeight = slide.clientHeight
        //       const slideHeight = this.state.hideThumbs ? windowHeight - 140 : windowHeight - 220
        //       const imgWidth = img.width
        //       const imgHeight = img.height
        //       let scale = 1
        //       if (slideWidth < imgWidth) {
        //         scale = parseFloat((slideWidth / imgWidth).toFixed(4))
        //       } else if (slideHeight < imgHeight) {
        //         scale = parseFloat((slideHeight / imgHeight).toFixed(4))
        //       }
  
        //       // console.log('fullscreen', currentIndex, slideWidth, slideHeight, img.width, img.height)
        //       // img.style.width = `${imgWidth}px`
        //       img.style.transform = `translate3d(0px, 0px, 0px) scale(${scale})`

        //     }

        //   }
        // }
        // const currentIndex = this.mySwiper.realIndex
        // const slide = this.mySwiper.slides[currentIndex]
        // const img = slide.querySelector('img.img-file')
        // const windowHeight = window.innerHeight
        // const slideWidth = slide.clientWidth
        // // const slideHeight = slide.clientHeight
        // const slideHeight = this.state.hideThumbs ? windowHeight - 140 : windowHeight - 220
        // const imgWidth = img.width
        // const imgHeight = img.height
        // let scale = 1
        // if (slideWidth < imgWidth) {
        //   scale = parseFloat((slideWidth / imgWidth).toFixed(4))
        // } else if (slideHeight < imgHeight) {
        //   scale = parseFloat((slideHeight / imgHeight).toFixed(4))
        // }

        // // console.log('fullscreen', currentIndex, slideWidth, slideHeight, img.width, img.height)
        // // img.style.width = `${imgWidth}px`
        // img.style.transform = `translate3d(0px, 0px, 0px) scale(${scale})`

        this.setState({isOneAndOne: false})

      }, 200)
    })
  }
  
  handleReturn = () => {
    const { onClose, onToggleFullscreen } = this.props
    if (onToggleFullscreen) {
      onToggleFullscreen(false)
    }
    if (onClose) {
      onClose()
      return
    } 
    document.body.style.overflow = ''
    this.setState({isFullscreen: false}, () => {
      setTimeout(() => {
        for (let key in this.mySwiper.slides) {
          const slide = this.mySwiper.slides[key]
          if (typeof slide === 'object') {
            slide.style.width = `${this.mySwiper.width}px`
            const img = slide.querySelector('img.img-file')
            if (img) {
              img.style.transform = ''
            }
            // this.mySwiper.slides[key].style.height = `${this.mySwiper.height}px`
          }
        }
        this.mySwiper.allowTouchMove = true
        this.mySwiper.zoom.out()
        this.mySwiper.update()
      }, 200)
    })
  }
  
  handleComment = () => {
    this.handleReturn()
    location.href = '#comment'
  }

  handleLongPicture = () => {
    const { showLongPicture, currentIndex } = this.state
    this.setState({showLongPicture: !showLongPicture}, () => {
      this.checkSetLongPuctire()
    })
  }

  checkSetLongPuctire = (currSwiper) => {
    const mySwiper = currSwiper ||  this.mySwiper
    if (!mySwiper) {
      return
    }
    const { showLongPicture, currentIndex } = this.state
    const slides = mySwiper.slides
    const currentSlide = slides[currentIndex]
    const currentImg = currentSlide.querySelector('img.img-file')
    let swiperHeight = -1
    let isCurrentLongPic = false
    if (!currentImg) {
      this.setState({galleryHeight: -1})
      return
    }
    const slideWidth = currentSlide.clientWidth
    const naturalWidth = currentImg.naturalWidth
    const naturalHeight = currentImg.naturalHeight
    if (naturalWidth > slideWidth) {
      swiperHeight = slideWidth * naturalHeight / naturalWidth
    } else {
      swiperHeight = naturalHeight
    }
    if (swiperHeight < defaultGalleryHeight) {
      swiperHeight = -1
      isCurrentLongPic = false
    } else {
      currentImg.style.top = 0
      isCurrentLongPic = true
    }
    if (!showLongPicture) {
      swiperHeight = -1
    } 
    currentImg.style.transform = ''
    // console.log('curr img',currentImg.naturalWidth, currentImg.naturalHeight, currentImg.width, currentImg.height)
    this.setState({galleryHeight: swiperHeight, isCurrentLongPic})
  }

  renderHeader() {
    const { detail={}, author, files, onFollow, onEnquiry, onFavor, onCollection, isPreview } = this.props
    const { currentIndex } = this.state
    const total = files.length

    return (
      <div className="gallery-photos-header">
          {!isPreview &&
          <AuthorInfo
            authorName={detail.authorName}
            authorCode={detail.authorCode}
            authorAvatar={detail.authorAvatar}
            authorFollowed={detail.authorFollowed}
            type={detail.authorType}
            editionType={author.editionType}
            onFollow={onFollow}
            onEnquiry={onEnquiry}
          />}
          <div className="actions">
            <span className="current-index">{currentIndex + 1} / {total}</span>
            
            <span className="action close">
              <Icon type="close" onClick={this.handleReturn} />
            </span>
          </div>
        </div>
    )
  }

  getUrl(item) {
    const { author } = this.props
    const isVideo = item.type === UploadFileTypes.WORKS_VIDEO
    let url = item.wmUrl || item.url
    let isHls = false
    const resolution = JSON.parse(item.resolution || '{}')
    const isHorizontal = resolution.width >= resolution.height
    if (isVideo && resolution.width) {
      if (author.editionType === EditionType.FREE) {
        if (isHorizontal) {
          if (resolution.width > 1280) {
            let w = 1280
            let h = parseInt(w * resolution.height / resolution.width)
            url = `${item.wmUrl}?avvod/m3u8/s/${w}x${h}/vb/1000k`
            isHls = true
          } else if (resolution.height > 720) {
            let h = 720
            let w = parseInt(h * resolution.width / resolution.height)
            url = `${item.wmUrl}?avvod/m3u8/s/${w}x${h}/vb/1000k`
            isHls = true
          }
        }
      } else if (author.editionType === EditionType.STANDARD) {
        if (isHorizontal) {
          if (resolution.width > 1920) {
            let w = 1920
            let h = parseInt(w * resolution.height / resolution.width)
            url = `${item.wmUrl}?avvod/m3u8/s/${w}x${h}/vb/1000k`
            isHls = true
          } else if (resolution.height > 1080) {
            let h = 1080
            let w = parseInt(h * resolution.width / resolution.height)
            url = `${item.wmUrl}?avvod/m3u8/s/${w}x${h}/vb/1000k`
            isHls = true
          }
        }
      }
    }
    return { url, isHls }
  }

  render() {
    const { detail={}, files, filesCount,  className, isPreview, onFavor, onCollection  } = this.props
    const { 
      isFullscreen,
      hideThumbs,
      currentIndex,
      isOneAndOne,
      showLongPicture,
      galleryHeight,
      isCurrentLongPic,
    } = this.state

    // console.log('is origin size', isOneAndOne)

    const file = files[currentIndex] || {}
    const currHideThumbs = hideThumbs || isFullscreen
    const currentIsVideo = file.type === UploadFileTypes.WORKS_VIDEO

    const showVideoTips = currentIsVideo && !isFullscreen
    // const videoTipsLabel = showVideoTips ?  <div className="attach-tips">部分历史视频来自创作者过往发布在第三方视频平台的低精度版本，未来梅花网作品内容将原生托管高清视频</div> : ''

    const swiperStyle: any = {}
    if (galleryHeight >= 0) {
      swiperStyle.height = galleryHeight
    }

    return (
      <>
      <div className={classnames('gallery-photos gallery-photos-mb', className, {fullscreen: isFullscreen})}>
        {/* {this.renderHeader()} */}
        {isFullscreen && <div className="fullscreen-top">
          <span className="current-index">{currentIndex + 1}/{filesCount}</span>
        </div>}
        <div className={classnames(
          'swiper-container',
          'gallery-top',
          'gallery-swiper-mb',
          {'hide-thumbs': hideThumbs}
        )}
        style={swiperStyle}
        >
          <div className="swiper-wrapper">
            {files.map((item, fileIndex) => {
              const isVideo = item.type === UploadFileTypes.WORKS_VIDEO
              const { url, isHls } = this.getUrl(item)
              return (
                <div 
                  key={item.id}
                  className="swiper-slide"  
                  datatype={isVideo ? 'video' : 'image'}
                >
                  {isVideo
                  ? <Player 
                      ref="playerRef" 
                      data-src={url} 
                      className="swiper-lazy"
                      poster={item.wmUrl + '?vframe/jpg/offset/7/w/1100'}
                    >
                      {isHls ? <HLSSource isVideoChild src={url} />
                      : <source src={url} />}
                      <BigPlayButton position="center" />
                      {/* <ControlBar /> */}
                    </Player>
                  : <img 
                      data-src={`${url}?imageslim`} 
                      data-small-src={`${url}?imageView2/2/w/260/h/360`}
                      src={fileIndex === 0 ? `${url}?imageView2/2/w/260/h/360` : null}
                      className="swiper-lazy img-file" 
                    />}
                  <div className="swiper-lazy-preloader"></div>
                </div>
              )
            })}
          </div>
          {/* <div className="btn-fullscreen" onClick={this.handleFullScreen}>
            <CIcon name="fullscreen" />
          </div> */}
          {isCurrentLongPic && <div className="btn-extend-long-pic" onClick={this.handleLongPicture}>{showLongPicture ? '收起' : '展开'}</div>}
          {isFullscreen && <ActionsMobileFullscreen
            detail={detail}
            cardType="compositionDetail"
            favored={detail.favored}
            collected={detail.collected}
            favors={detail.favors}
            collections={detail.collections}
            comments={detail.comments}
            onFavor={onFavor}
            onCollection={onCollection}
            onComment={this.handleComment}
          />}
        </div>
        {/* <div className="gallery-status-bar-mb">
          <div>{!hideThumbs && <div className="title">{detail.title}</div>}</div>
          <div>
            <span className="hand" onClick={this.handleThumbsToggle}>
              {hideThumbs ? '展开' : '收起'} <Icon type={hideThumbs ? 'up' : 'down'} />
            </span>
            {!hideThumbs && <div className="inline-block">
              {!isPreview &&
                <span className="action views" >
                  <span 
                      className="action-icon"
                  >
                    <Icon type="eye" theme="filled" />
                  </span>
                  <span className="count">{detail.views || 0}</span>
                </span>}
              {!isPreview &&
                <span className="action favor" onClick={onFavor} >
                  <span 
                    className={classnames('action-icon', {active: detail.favored})}
                  >
                    <Icon type="heart" theme="filled" />
                  </span>
                  <span className="count">{detail.favors || 0}</span>
                </span>}
                {!isPreview &&
                <span className="action comment">
                  <a href="#comment" onClick={this.handleComment}>
                    <span 
                      className="action-icon"
                    >
                      <CIcon name="pinglun" />
                    </span>
                    <span className="count">{detail.comments || 0}</span>
                  </a>
                </span>}
            </div>}

          </div>
        </div> */}
        {/* <div className={classnames('attach-tips', {show: showVideoTips})}>部分历史视频来自创作者过往发布在第三方视频平台的低精度版本，未来梅花网作品内容将原生托管高清视频</div> */}
        <div className={classnames(
          'swiper-container',
          'gallery-thumbs',
          'gallery-thumbs-mb',
          {hide: currHideThumbs}
        )}>
          <div className="swiper-wrapper">
          {files.map(item => {
            const isVideo = item.type === UploadFileTypes.WORKS_VIDEO
            const thumbSuffix = isVideo ? '?vframe/jpg/offset/7/w/218' : '?imageView2/4/w/218'
            const url = (item.wmUrl || item.url) + thumbSuffix
            return (
              <div 
                key={item.id}
                className="swiper-slide" 
              >
                {/* <img src={`${item.wmUrl}?imageMogr2/thumbnail/204x/gravity/North/crop/!200x95a0a15`} /> */}
                <img src={url} />
              </div>
            )
          })}
          </div>
          {/* <div className="swiper-scrollbar"></div> */}
        </div>
      </div>
    </>
    );
  }
}  