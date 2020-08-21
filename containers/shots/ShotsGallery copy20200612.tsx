import { Component } from 'react'
import { toJS } from 'mobx'
import Swiper from 'swiper'
import classnames from 'classnames'
import { Icon } from 'antd'
import { Player, ControlBar, BigPlayButton, LoadingSpinner } from 'video-react'
import AuthorInfo from '@components/author/AuthorInfo'
import { UploadFileTypes, EditionType } from '@base/enums'
import CIcon from '@components/widget/common/Icon' 
import HLSSource from '@components/common/HLSSource'

import 'video-react/dist/video-react.css'
import author from '@api/author'

// import icon11 from '@static/images/icon/icon_1_1.svg'

interface Props {
  isFullscreen: boolean
  isPreview: boolean
  index: number
  detail: any
  files: Array<any>
  className: string
}

interface State {
  isFullscreen: boolean
  hideThumbs: boolean
  currentIndex: number
  isOneAndOne: boolean
}

export default class GalleryImage extends Component<Props, State> {
  mySwiper: any

  constructor(props) {
    super(props)

    this.mySwiper = null

    this.state = {
      isFullscreen: !!props.isFullscreen,
      hideThumbs: false,
      currentIndex: 0,
      isOneAndOne: false,
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
    const { index } = this.props
    // const slidesPerView = window.outerWidth <= 1360 ? 7 : 9
    const galleryThumbs = new Swiper('.gallery-thumbs-pc', {
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
    
    this.mySwiper = new Swiper('.gallery-swiper-pc', {
      
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

      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
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
          const slides = this.slides

          // const firstSlide = this.slides[0]
          // const firstImg = firstSlide.querySelector('img')
          // if (firstImg) {
          //   const slideWidth = firstSlide.clientWidth
          //   const slideHeight = firstSlide.clientHeight
          //   const imgWidth = firstImg.width
          //   const imgHeight = firstImg.height
          //   let scale = 0.1
          //   if (slideHeight < imgHeight) {
          //     scale = parseFloat((slideHeight / imgHeight).toFixed(4))
          //   } else if (slideWidth < imgWidth) {
          //     scale = parseFloat((slideWidth / imgWidth).toFixed(4))
          //   }
          //   firstImg.style.transform = `translate3d(0px, 0px, 0px) scale(${scale})`
          // }

          for (let k in slides) {
            const slide = slides[k]
            if (typeof slide === 'object' && slide.querySelector('img')) {
              // const slideWidth = slide.clientWidth
              // const slideHeight = slide.clientHeight
              const img = slide.querySelector('img')
              // console.log(img.src, img['data-url'])
              // img.onload = () => {
              //   // console.log('width', img.width, 'height', img.height, img.src)
              //   const image = new Image()
              //   image.src = img.src
              //   image.onload = () => {
              //     // console.log('image w', image.width, 'image h', image.height, 'slide height', slideHeight)
              //   }

              // }

              


              let x = 0;
              let y = 0;
              let l = 0;
              let t = 0;
              let isDown = false;

              const downStartEvent = (e) => {
                e.stopPropagation()

                //获取x坐标和y坐标
                x = e.targetTouches ? e.targetTouches[0].clientX : e.clientX;
                y = e.targetTouches ? e.targetTouches[0].clientY : e.clientY;


                const transformStyle = img.style.transform
                // let scale = 1
                let translateArr = [0,0,0]
                if (transformStyle) {
                  const translateStr = transformStyle.substring(transformStyle.indexOf('translate3d(') + 12, transformStyle.indexOf(')'))
                  const translateVals = translateStr.split(',')
                  translateArr = translateVals.map(v => parseInt(v))
                  // const scaleStr = transformStyle.substring(transformStyle.lastIndexOf('(') + 1,transformStyle.lastIndexOf(')'))
                  // scale = scaleStr ? parseInt(scaleStr) : 1
                }
                
                //获取左部和顶部的偏移量
                // l = img.offsetLeft;
                // t = img.offsetTop;
                l = translateArr[0];
                t = translateArr[1];
                //开关打开
                isDown = true;
                //设置样式  
                img.style.cursor = 'grab';
                // console.log('mouse down', isDown)

                const mouseMoveFn = (e) => {
                  e.returnValue = false
                  if (isDown === false) {
                    return;
                  }
                //   console.log('mouse move', isDown)
                  //获取x和y
                  let nx = e.targetTouches ? e.targetTouches[0].clientX : e.clientX;
                  let ny = e.targetTouches ? e.targetTouches[0].clientY : e.clientY;
                  //计算移动后的左偏移量和顶部的偏移量
                  // let nl = nx - (x - l);
                  // let nt = ny - (y - t);
                  // console.log(x,y,nx,ny)
    
                  // let nl = nx - x
                  // let nt = ny - y
                  let nl = nx - x + l;
                  let nt = ny - y + t;
              
                  // img.style.left = nl + 'px';
                  // img.style.top = nt + 'px';
  
                  const transformStyle = img.style.transform
                  let scale = 1
                  // let translateArr = [0,0,0]
                  if (transformStyle) {
                    // const translateStr = transformStyle.substring(transformStyle.indexOf('(') + 1, transformStyle.indexOf(')'))
                    // const translateVals = translateStr.split(',')
                    // translateArr = translateVals.map(v => parseInt(v))
                    const scaleStr = transformStyle.substring(transformStyle.lastIndexOf('scale(') + 6,transformStyle.lastIndexOf(')'))
                    scale = scaleStr ? parseFloat(scaleStr) : 1
                  }
                  // console.log('scale', scale, transformStyle)
  
                  img.style.transform = `translate3d(${nl}px, ${nt}px, 0px) scale(${scale})`
                  //设置样式  
                  img.style.cursor = 'grabbing';
                  // img.style.left = `${nl}px`
                  // img.style.top = `${nt}px`
                }


                document.addEventListener('mousemove', mouseMoveFn, false)
                document.addEventListener('touchmove', mouseMoveFn, { passive: false })


                const upEndEvent = (e) => {
                  e.stopPropagation()
                  //开关关闭
                  isDown = false;
                  img.style.cursor = 'grab';
                  document.removeEventListener('mousemove', mouseMoveFn, false)
                  document.removeEventListener('touchmove', mouseMoveFn, false)
                  // console.log('mouse up', isDown)
                }

                document.addEventListener('mouseup', upEndEvent, false)
                document.addEventListener('touchend', upEndEvent, false)
  
              }

              
              img.addEventListener('mousedown', downStartEvent, false)
              img.addEventListener('touchstart', downStartEvent, false)

            }
          }

        }, // end init


        transitionEnd: () => {
          if (!this.mySwiper) {
            return
          }
          const { isFullscreen, hideThumbs } = this.state

          const previousIndex = this.mySwiper.previousIndex
            const currentIndex = this.mySwiper.realIndex
            this.setState({currentIndex})
            // console.log('transition end ', currentIndex)
            const previousSlide = this.mySwiper.slides[previousIndex]
            const slide = this.mySwiper.slides[currentIndex]
            // console.log('data type', slide.getAttribute('datatype'))
            const img = slide.querySelector('img')
            if (img) {
              const windowHeight = window.innerHeight
              const slideWidth = slide.clientWidth
              // const slideHeight = slide.clientHeight
              // const slideHeight = this.state.hideThumbs ? windowHeight - 140 : windowHeight - 220
              const slideHeight = isFullscreen ? (hideThumbs ? windowHeight - 140 : windowHeight - 220) : slide.clientHeight
              const imgWidth = img.width
              const imgHeight = img.height
              let scale = 1
              
              // if (isFullscreen) {
                if (slideHeight < imgHeight) {
                  scale = parseFloat((slideHeight / imgHeight).toFixed(4))
                } else if (slideWidth < imgWidth) {
                  scale = parseFloat((slideWidth / imgWidth).toFixed(4))
                }
              // } 
    
              // console.log('fullscreen', currentIndex, slideWidth, slideHeight, img.width, img.height)
              // img.style.width = `${imgWidth}px`

              img.style.transform = `translate3d(0px, 0px, 0px) scale(${scale})`
              img.style.top = ''
              slide.removeEventListener('mousewheel', this.imgScrollEvent, false)
            }

            // 暂停上一个视频，防止声音重叠
            const video = previousSlide.querySelector('video.video-react-video')
            if (video) {
              video.pause()
            }
          
        }, // end transitionEnd


        lazyImageLoad: function(slideEl, imageEl){
          // console.log(slideEl);//哪个slide里面的图片在加载，返回slide的DOM
          // console.log($(slideEl).index());//哪个slide里面(JQ)的图片在加载，返回slide的index
          // console.log(imageEl);//哪个图片在加载，返回图片的DOM
          if (imageEl.nodeName === 'IMG') {
            const smallSrc = imageEl.getAttribute('data-small-src')
            imageEl.removeAttribute('data-small-src')
            imageEl.setAttribute('src', smallSrc);

            // 处理第一张图首次加载后自适应
            // if (this.slides[0] === slideEl) {
              // imageEl.style.transform = `translate3d(0px, 0px, 0px) scale(0.1)`
              // imageEl.onload = () => {
              //   // console.log('lazy load', imageEl.width, imageEl.height,this.slides[0] === slideEl)
              //   const slideWidth = slideEl.clientWidth
              //   const slideHeight = slideEl.clientHeight
              //   const imgWidth = imageEl.width
              //   const imgHeight = imageEl.height
              //   let scale = 1
              //   if (slideHeight < imgHeight) {
              //     scale = parseFloat((slideHeight / imgHeight).toFixed(4))
              //   } else if (slideWidth < imgWidth) {
              //     scale = parseFloat((slideWidth / imgWidth).toFixed(4))
              //   }
              //   imageEl.style.transform = `translate3d(0px, 0px, 0px) scale(${scale})`
              // }
            // }
          }

        }, //end lazyImageLoad

        sliderMove: function(e) {
          // console.log(e.target)

        }, //end sliderMove

        slideChange: (e) => {
          this.setState({isOneAndOne: false})
          this.mySwiper.allowTouchMove = true

          const { isFullscreen, hideThumbs } = this.state
          const prevIndex = this.mySwiper.previousIndex
          const prevSlide = this.mySwiper.slides[prevIndex]
          const prevImg = prevSlide.querySelector('img')
          if (prevImg) {
            const windowHeight = window.innerHeight
            const slideWidth = prevSlide.clientWidth
            // const slideHeight = slide.clientHeight
            const slideHeight = hideThumbs ? windowHeight - 140 : windowHeight - 220
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
        }, //end slideChange


      }, //end on
      
    })
  }

  handleThumbsToggle = () => {
    this.setState({hideThumbs: !this.state.hideThumbs})
  }

  handleZoomIn = () => {
    if (!this.mySwiper) {
      return
    }
    const slide = this.mySwiper.slides[this.mySwiper.realIndex]
    const img = slide.querySelector('img')
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
    const img = slide.querySelector('img')
    if (img) {
      const transformValues = this.getTransformValues(img.style.transform)
      let scale = transformValues[3] - 0.2
      if (scale > 0.2) {
        img.style.transform = `translate3d(${transformValues[0]}px, ${transformValues[1]}px, ${transformValues[2]}px) scale(${scale})`
      }
      // this.mySwiper.zoom.in()
    }
  }

  imgScrollEvent = (e) => {
    e.preventDefault()
    e = e || window.event;  
    const { currentIndex } = this.state
    const currentSlide: any = this.mySwiper.slides[currentIndex]
    if (!currentSlide) {
      return
    }
    const currentImg = currentSlide.querySelector('img')
    if (!currentImg) {
      return
    }
    const [transX, transY, transZ, scale]: Array<number> = this.getTransformValues(currentImg.style.transform)
    let delta: number = 0
    if (e.wheelDelta) {  //判断浏览器IE，谷歌滑轮事件               
        if (e.wheelDelta > 0) { //当滑轮向上滚动时  
          //  console.log('上滚')
           delta = 1
        }  
        if (e.wheelDelta < 0) { //当滑轮向下滚动时  
            //  console.log('下滚')
             delta = -1
        }  
    } else if (e.detail) {  //Firefox滑轮事件  
        if (e.detail> 0) { //当滑轮向下滚动时  
          //  console.log('下滚')
           delta = -1
        }  
        if (e.detail< 0) { //当滑轮向上滚动时  
            // console.log('上滚')  
            delta = 1
        }  
    }

    currentImg.style.transform = `translate3d(${transX}px, ${transY + (delta * 50)}px, ${transZ}px) scale(${scale})`

    // if (delta > 0) {
    //   // currentImg.
    // } else if (delta < 0) {

    // }
  }

  handleZoomNormal = () => {
    if (!this.mySwiper) {
      return
    }
    // this.mySwiper.zoom.out()
    const slide = this.mySwiper.slides[this.mySwiper.realIndex]
    const img = slide.querySelector('img')
    if (img) {
      const { isOneAndOne, hideThumbs, isFullscreen } = this.state
      // img.style.maxHeight = 'initial'
      const windowHeight = window.innerHeight
      const slideWidth = slide.clientWidth
      // const slideHeight = slide.clientHeight
      const slideHeight = isFullscreen ? (hideThumbs ? windowHeight - 140 : windowHeight - 220) : slide.clientHeight
      const imgWidth = img.width
      const imgHeight = img.height
      let scale = 1

      if (isOneAndOne) {
        // slide.classList.add('max')
        if (slideHeight < imgHeight) {
          scale = parseFloat((slideHeight / imgHeight).toFixed(4))
        } else if (slideWidth < imgWidth) {
          scale = parseFloat((slideWidth / imgWidth).toFixed(4))
        }
        img.style.top = ''
        slide.removeEventListener('mousewheel', this.imgScrollEvent, false)
      } else {
        slide.classList.remove('max')
        scale = 1
        if (img.height > slide.clientHeight) {
          img.style.top = 0
          slide.addEventListener('mousewheel', this.imgScrollEvent, false)
        }
      }
      
      img.style.transform = `translate3d(0px, 0px, 0px) scale(${scale})`
      // console.log('img height',slide.clientHeight, img.height, imgHeight)
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
    if (!this.mySwiper) {
      return false
    }
    const slide = this.mySwiper.slides[this.mySwiper.realIndex]
    const img = slide.querySelector('img')
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
    this.setState({isFullscreen: true}, () => {
      document.body.style.overflow = 'hidden'
      const currSlide = this.mySwiper.slides[this.mySwiper.realIndex]
      setTimeout(() => {
        for (let key in this.mySwiper.slides) {
          const slide = this.mySwiper.slides[key]
          // if (typeof slide === 'object' && currSlide !== slide) {
          if (typeof slide === 'object') {
            slide.style.width = `${this.mySwiper.width}px`
            // this.mySwiper.slides[key].style.height = `${this.mySwiper.height}px`

            const img = slide.querySelector('img')
            if (img) {
              const windowHeight = window.innerHeight
              const slideWidth = slide.clientWidth
              // const slideHeight = slide.clientHeight
              const slideHeight = this.state.hideThumbs ? windowHeight - 140 : windowHeight - 220
              // console.log('currSlide === slide',currSlide === slide, slideHeight)
              slide.classList.remove('max')
              const imgWidth = img.width
              const imgHeight = img.height
              let scale = 0.1
              if (slideHeight < imgHeight) {
                scale = parseFloat((slideHeight / imgHeight).toFixed(4))
              } else if (slideWidth < imgWidth) {
                scale = parseFloat((slideWidth / imgWidth).toFixed(4))
              } else {
                scale = 1
              }
  
              img.style.transform = `translate3d(0px, 0px, 0px) scale(${scale})`
              img.style.top = ''
              slide.removeEventListener('mousewheel', this.imgScrollEvent, false)

            }

          }
        }
        this.mySwiper.update()

        // for (let key in this.mySwiper.slides) {
        //   const slide = this.mySwiper.slides[key]
        //   if (typeof slide === 'object') {

        //     const img = slide.querySelector('img')
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
        // const img = slide.querySelector('img')
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
    const { onClose } = this.props
    if (onClose) {
      onClose()
      return
    } 
    this.setState({isFullscreen: false}, () => {
      document.body.style.overflow = ''
      setTimeout(() => {
        for (let key in this.mySwiper.slides) {
          const slide = this.mySwiper.slides[key]
          if (typeof slide === 'object') {
            slide.style.width = `${this.mySwiper.width}px`
            const img = slide.querySelector('img')
            if (img) {
              // img.style.transform = ''
              const slideWidth = slide.clientWidth
              const slideHeight = slide.clientHeight
              slide.classList.remove('max')
              const imgWidth = img.width
              const imgHeight = img.height
              let scale = 0.1
              if (slideHeight < imgHeight) {
                scale = parseFloat((slideHeight / imgHeight).toFixed(4))
              } else if (slideWidth < imgWidth) {
                scale = parseFloat((slideWidth / imgWidth).toFixed(4))
              } else {
                scale = 1
              }
  
              img.style.transform = `translate3d(0px, 0px, 0px) scale(${scale})`
              img.style.top = ''
              slide.removeEventListener('mousewheel', this.imgScrollEvent, false)
            }
          }
        }
        this.setState({isOneAndOne: false})
        this.mySwiper.allowTouchMove = true
        this.mySwiper.update()
      }, 200)
    })
  }

  renderHeader() {
    const { detail={}, author={}, onFollow, onEnquiry, onFavor, onCollection, isPreview } = this.props

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
            {!isPreview &&
            <span className="action favor">
              <span 
                className={classnames('action-icon', {active: detail.favored})}
                onClick={onFavor}
              >
                <Icon type="heart" theme="filled" />
              </span>
              <span className="count">{detail.favors || 0}</span>
            </span>}
            {!isPreview &&
            <span className="action collection">
              <span 
                className={classnames('action-icon', {active: detail.collected})}
                onClick={onCollection}
              >
                <Icon type="star" theme="filled" />
              </span>
              <span className="count">{detail.collections || 0}</span>
            </span>}
            <span className="action close">
              <Icon type="close" onClick={this.handleReturn} />
            </span>
          </div>
        </div>
    )
  }

  getUrl(item) {
    const { author={} } = this.props
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
    const { files,  className, detail, author={}  } = this.props
    const { 
      isFullscreen,
      hideThumbs,
      currentIndex,
      isOneAndOne,
    } = this.state

    // console.log('is origin size', isOneAndOne)
    
    const sortFiles = files.slice().sort((a,b) => a.position - b.position)
    const total = files.length
    const file = sortFiles[currentIndex] || {}
    const currHideThumbs = hideThumbs && isFullscreen
    const currentIsVideo = file.type === UploadFileTypes.WORKS_VIDEO

    const showVideoTips = currentIsVideo && !isFullscreen
    // const videoTipsLabel = showVideoTips ?  <div className="attach-tips">部分历史视频来自创作者过往发布在第三方视频平台的低精度版本，未来梅花网作品内容将原生托管高清视频</div> : ''

    return (
      <>
      <div className={classnames('gallery-photos', className, {fullscreen: isFullscreen})}>
        {this.renderHeader()}
        <div className={classnames(
          'swiper-container',
          'swiper-no-swiping',
          'gallery-top',
          'gallery-swiper-pc',
          {'hide-thumbs': hideThumbs}
        )}>
          <div className="swiper-wrapper">
            {sortFiles.map((item, fileIndex) => {
              const isVideo = item.type === UploadFileTypes.WORKS_VIDEO
              const { url, isHls } = this.getUrl(item)
              
              return (
                <div 
                  key={item.id}
                  className="swiper-slide max"  
                  datatype={isVideo ? 'video' : 'image'}
                >
                  {isVideo
                  // ? (url && <video preload="metadata" controls="controls" data-src={url} className="swiper-lazy"></video>)
                  ? <Player 
                      ref="playerRef" 
                      data-src={url} 
                      className="swiper-lazy"
                      poster={item.wmUrl + '?vframe/jpg/offset/7/w/1100'}
                    >
                      {isHls ? <HLSSource isVideoChild src={url} />
                      : <source src={url} />}
                      <BigPlayButton position="center" />
                      <LoadingSpinner />
                      {/* <ControlBar /> */}
                    </Player>
                  : <img 
                      //data-src={`${url}?imageslim`} 
                      data-src={url} 
                      data-small-src={`${url}?imageView2/2/w/460/h/360`}
                      src={fileIndex === 0 ? `${url}?imageView2/2/w/460/h/360` : null}
                      alt={detail.title}
                      className="swiper-lazy" 
                    />}
                  <div className="swiper-lazy-preloader"></div>
                </div>
              )
            })}
          </div>
          <div className="swiper-button-next swiper-button-white"></div>
          <div className="swiper-button-prev swiper-button-white"></div>
          <div className="btn-fullscreen" onClick={this.handleFullScreen}>
            <CIcon name="fullscreen" />
          </div>
          {!isFullscreen && !currentIsVideo &&
          <div className="gallery-status-bar default">
            <div className="inline-block">
              <span className="hand">
                <span className="current-index">{currentIndex + 1}/{total}</span>
              </span>
              <span className="image-operate">
                <Icon type="zoom-in" onClick={this.handleZoomIn} />
                <Icon type="zoom-out" onClick={this.handleZoomOut} />
                <CIcon name={isOneAndOne ? 'suit' : 'screen-one-one'} onClick={this.handleZoomNormal} />
              </span>
            </div>
          </div>}
        </div>
        {isFullscreen && 
        <div className="gallery-status-bar">
            <div className="inline-block">
              <span className="hand">
                <Icon type={hideThumbs ? 'appstore' : 'down'} onClick={this.handleThumbsToggle} />
                <span className="current-index">{currentIndex + 1}/{total}</span>
              </span>
              {!currentIsVideo &&
              <span className="image-operate">
                <Icon type="zoom-in" onClick={this.handleZoomIn} />
                <Icon type="zoom-out" onClick={this.handleZoomOut} />
                <CIcon name={isOneAndOne ? 'suit' : 'screen-one-one'} onClick={this.handleZoomNormal} />
              </span>}
            </div>
        </div>}
        {/* <div className={classnames('attach-tips', {show: showVideoTips})}>部分历史视频来自创作者过往发布在第三方视频平台的低精度版本，未来梅花网作品内容将原生托管高清视频</div> */}
        {<div className={classnames(
          'swiper-container',
          'gallery-thumbs',
          'gallery-thumbs-pc',
          {hide: currHideThumbs}
        )}>
          <div className="swiper-wrapper">
          {sortFiles.map(item => {
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
          <div className="swiper-scrollbar"></div>
        </div>}
      </div>
    </>
    );
  }
}  