import { Component } from 'react'
import { toJS } from 'mobx'
import Swiper from 'swiper'
import classnames from 'classnames'
import { Icon, Tooltip } from 'antd'
import { Player, ControlBar, BigPlayButton, LoadingSpinner, PlayToggle, FullscreenToggle, VolumeMenuButton, CurrentTimeDisplay, PlayProgressBar, ProgressControl } from 'video-react'
import AuthorInfo from '@components/author/AuthorInfo'
import CIcon from '@components/widget/common/Icon' 
import HLSSource from '@components/common/HLSSource'
import TheatreButton from '@components/player/TheatreButton'
import FullscreenToggleButton from '@components/player/FullscreenToggleButton'
import PlayerEnding from './PlayerEnding'

import { UploadFileTypes, EditionType } from '@base/enums'
import { config, session } from '@utils'

import 'video-react/dist/video-react.css'
import './index.less'

const defaultGalleryHeight = 618

interface Props {
  isFullscreen: boolean
  isPreview: boolean
  index: number
  detail: any
  files: Array<any>
  filesCount?: number
  className?: string
}

interface State {
  isFullscreen: boolean
  hideThumbs: boolean
  currentIndex: number
  isOneAndOne: boolean
  showLongPicture: boolean
  players: any
  galleryHeight: number
  isCurrentLongPic: boolean
}

export default class Gallery extends Component<Props, State> {
  mySwiper: any
  playerRefs: any

  constructor(props) {
    super(props)

    this.mySwiper = null
    this.playerRefs = {}
    this.scrollFirstEnter = true

    this.state = {
      isFullscreen: !!props.isFullscreen,
      hideThumbs: true,
      currentIndex: props.index || 0,
      isOneAndOne: false,
      showLongPicture: false,

      players: {},
      // 小于0 表示不设置
      galleryHeight: -1,
      isCurrentLongPic: false,
    }
  }
  componentDidMount() {
    setTimeout(() => {
      this.initSwiter()
      this.initPlayers()
    }, 50)
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.isFullscreen !== this.props.isFullscreen) {
      this.setState({isFullscreen: nextProps.isFullscreen})
    }
  }

  initPlayers() {
    for(let k in this.playerRefs) {
      const playerRef = this.playerRefs[k]
      playerRef.player.subscribeToStateChange(this.handlePlayerStateChange.bind(this, playerRef));
    }
  }
  
  handlePlayerStateChange = (playerRef, state) => {
    const { files, onPlayerCompleted } = this.props
    const { currentIndex, players } = this.state
    const playerIndex = playerRef.index
    const isCurrent = currentIndex === playerIndex
    // console.log('player index', playerIndex, isCurrent, state)
    if (isCurrent) {
      const playerKey = `player${playerIndex}`
      const playerState = players[playerKey] || {}
      // console.log('player state',state.paused, state)
      if (!state.paused) {
        playerRef.isCompleted = false
        playerState.isCompleted = false
      } else if (state.ended && !playerRef.isCompleted) {
        // console.log('completed', state.currentTime )
        playerRef.isCompleted = true
        playerState.isCompleted = true
        if (onPlayerCompleted) onPlayerCompleted()
      }
        const nextPlayers = {
          ...players,
          [playerKey]: playerState,
        }
        this.setState({players: nextPlayers})
    }

  }

  initSwiter() {
    const _this = this
    const { index, autoPlay } = this.props
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
      // navigation: {
      //   nextEl: '.swiper-button-thumb-next',
      //   prevEl: '.swiper-button-thumb-prev',
      // },
      observer:true,
      observeParents:true,
      // paceBetween: 10,
      // centeredSlides: true,
      // slidesPerView: 'auto',
      // touchRatio: 0.2,
      // slideToClickedSlide: true,
      autoScrollOffset: 1,
    });
    
    this.mySwiper = new Swiper('.gallery-swiper-pc', {
      // initialSlide: index || 0,
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

      // 当所有的内嵌图像（img标签）加载完成后Swiper会重新初始化
      updateOnImagesReady: true,

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
          const slides = this.slides
          if (autoPlay) {
            const sessionIsAutoPlay = session.get(config.SESSION_DETAIL_AUTO_PLAY)
            const loopSlide = slides[index || 0]
            session.remove(config.SESSION_DETAIL_AUTO_PLAY)
            if (loopSlide && sessionIsAutoPlay) {
              if (!!index && index >= 0) {
                setTimeout(() => {
                  // 第三个参数为false时不会触发transition回调
                  this.slideToLoop(index, 600, false)
                }, 100)
                // 切换完成后执行
                setTimeout(() => {
                  const currentPlayer = _this.playerRefs[`player${index}`]
                  if (currentPlayer) {
                    currentPlayer.player.muted = true
                    currentPlayer.player.play()
                  }
                }, 600)
              }
            }
          } else {
            if (!!index && index > 0) {
              setTimeout(() => {
                // 第三个参数为false时不会触发transition回调
                this.slideToLoop(index, 600, false)
              }, 100)
            }
          }

          // const firstSlide = this.slides[0]
          // const firstImg = firstSlide.querySelector('img.img-file')
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
            if (typeof slide === 'object' && slide.querySelector('video.video-react-video')) {

            }

            if (typeof slide === 'object' && slide.querySelector('img.img-file')) {
              // const slideWidth = slide.clientWidth
              // const slideHeight = slide.clientHeight
              const img = slide.querySelector('img.img-file')
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
          
          setTimeout(() => {
            this.emit('transitionEnd');//在初始化时触发一次transitionEnd事件，需要先设置transitionEnd
          }, 600)
        }, // end init

        // 动画完成触发事件
        transitionEnd: function() {
          _this.transitionEnd(this)
        },
        // 懒加载
        lazyImageLoad: this.lazyImageLoad,
        // 图片延迟加载结束时执行
        lazyImageReady: this.lazyImageReady,
        // slide变化触发
        slideChange: this.slideChange,

        sliderMove: function(e) {}, //end sliderMove

      }, //end on
      
    })
  }

  transitionEnd = (currSwiper) => {
    const mySwiper = currSwiper || this.mySwiper
    if (!mySwiper) {
      return
    }
    const { isFullscreen, hideThumbs, showLongPicture } = this.state
    const previousIndex = mySwiper.previousIndex
    const currentIndex = mySwiper.realIndex
    const previousSlide = mySwiper.slides[previousIndex]
    const slide = mySwiper.slides[currentIndex]
    const img = slide.querySelector('img.img-file')

    this.setState({currentIndex})
    
    if (img) {
      const windowHeight = window.innerHeight
      const slideWidth = slide.clientWidth
      // const slideHeight = slide.clientHeight
      // const slideHeight = this.state.hideThumbs ? windowHeight - 140 : windowHeight - 220
      const slideHeight = isFullscreen ? (hideThumbs ? windowHeight - 140 : windowHeight - 220) : slide.clientHeight
      // 图片当前渲染宽高
      const imgWidth = img.width
      const imgHeight = img.height
      // 图片原始宽高
      const naturalWidth = img.naturalWidth
      const naturalHeight = img.naturalHeight
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

    if (previousSlide) {
      // 暂停上一个视频，防止声音重叠
      const video = previousSlide.querySelector('video.video-react-video')
      if (video) {
        video.pause()
      }
    }

    this.checkSetLongPuctire(mySwiper)


    if (!this.scrollFirstEnter) {
      if (isFullscreen) {
        if (mySwiper.el) {
          mySwiper.el.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        }
      } else {
        window.scrollTo({ 
          top: 0, 
          behavior: "smooth" 
        });
      }
    } else {
      this.scrollFirstEnter = false
    }
  } // end transitionEnd

  lazyImageLoad = (slideEl, imageEl) => {
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
  } //end lazyImageLoad

  // 图片延迟加载结束时执行
  lazyImageReady = (slideEl, imageEl) => {
    // console.log('lazy ready', imageEl)
    // 图片延迟加载后进行判断计算
    this.checkSetLongPuctire()
  } // end lazyImageReady

  slideChange = (e) => {
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
  } //end slideChange

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

  imgScrollEvent = (e) => {
    e.preventDefault()
    e = e || window.event;  
    const { currentIndex } = this.state
    const currentSlide: any = this.mySwiper.slides[currentIndex]
    if (!currentSlide) {
      return
    }
    const currentImg = currentSlide.querySelector('img.img-file')
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
  }

  handleZoomNormal = () => {
    if (!this.mySwiper) {
      return
    }
    // this.mySwiper.zoom.out()
    const slide = this.mySwiper.slides[this.mySwiper.realIndex]
    const img = slide.querySelector('img.img-file')
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
  
  handleHorizontal = (isHorizontal) => {
    const { onHerizontal } = this.props
    if (!onHerizontal) return
    onHerizontal(isHorizontal, (isHorizontalScreen) => {
      setTimeout(() => {
        this.mySwiper.update()
        this.setState({isOneAndOne: false})
      }, 200)
      
    })
  }
  handleToggleHorizontal = () => {
    const { isHorizontalScreen } = this.props
    this.handleHorizontal(!isHorizontalScreen)
  }
  handleReturnHorizontal = () => {
    this.handleReturn()
    this.handleHorizontal(true)
  }

  handleFullScreen = () => {
    this.setState({isFullscreen: true}, () => {
      const { showLongPicture } = this.state
      document.body.style.overflow = 'hidden'
      const currSlide = this.mySwiper.slides[this.mySwiper.realIndex]
      setTimeout(() => {
        for (let key in this.mySwiper.slides) {
          const slide = this.mySwiper.slides[key]
          // if (typeof slide === 'object' && currSlide !== slide) {
          if (typeof slide === 'object') {
            slide.style.width = `${this.mySwiper.width}px`
            // this.mySwiper.slides[key].style.height = `${this.mySwiper.height}px`
            const img = slide.querySelector('img.img-file')
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
              if (!showLongPicture) {
                img.style.transform = `translate3d(0px, 0px, 0px) scale(${scale})`
                img.style.top = ''
              }
              slide.removeEventListener('mousewheel', this.imgScrollEvent, false)
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
        this.checkSetLongPuctire()
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
            const img = slide.querySelector('img.img-file')
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

  handleThembNext = () => {
    this.mySwiper.slideNext()
    // this.mySwiper.scrollbar.updateSize()
    // this.mySwiper.navigation.update()
  }
  handleThembPrev = () => {
    this.mySwiper.slidePrev()
    // this.mySwiper.scrollbar.updateSize()
    // this.mySwiper.navigation.update()
  }

  handleLongPicture = () => {
    const { showLongPicture, currentIndex } = this.state
    this.setState({showLongPicture: !showLongPicture}, () => {
      this.checkSetLongPuctire()
    })
  }

  handleThumbNext = () => {
    this.mySwiper.slideNext()
  }
  handleThumbPrev = () => {
    this.mySwiper.slidePrev()
  }

  checkSetLongPuctire = (currSwiper) => {
    const mySwiper = currSwiper =  this.mySwiper
    if (!mySwiper) {
      return
    }
    const { showLongPicture, currentIndex, isFullscreen } = this.state
    const slides = mySwiper.slides
    const currentSlide = slides[currentIndex]
    if (!currentSlide) {
      return
    }
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
    const currentGalleryHeight = isFullscreen ? window.innerHeight - 120 : defaultGalleryHeight
    if (naturalWidth > slideWidth) {
      swiperHeight = slideWidth * naturalHeight / naturalWidth
    } else {
      swiperHeight = naturalHeight
    }
    if (swiperHeight < currentGalleryHeight) {
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
    const { detail={}, author={}, filesCount, onFollow, onEnquiry, onFavor, onCollection, isPreview } = this.props
    const { currentIndex, isFullscreen } = this.state
    return (
      <div className="gallery-photos-header">
        <div className="header-item"></div>
        <div className="header-item center">
          <span className="current-index">{currentIndex + 1} / {filesCount}</span>
        </div>
        <div className="header-item">
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

  renderEnding(fileIndex, record) {
    const { autoPlay, relatedShots=[]} = this.props
    const { currentIndex, players } = this.state
    const playerState = players[`player${fileIndex}`] || {}

    // const nextShots = autoPlay ? relatedShots.slice(0,1) : relatedShots.slice(0,2)
    // console.log('player', players)
    return (
      <div>
        {playerState.isCompleted ? <PlayerEnding 
        //visible={playerState.isCompleted}
        visible={true}
        autoPlay={autoPlay}
        currentIndex={currentIndex}
        fileIndex={fileIndex}
        shots={relatedShots}
      /> : null}
      </div>
    )
  }

  render() {
    const { files, filesCount,  className, detail, author={}, isHorizontalScreen  } = this.props
    const { 
      isFullscreen,
      hideThumbs,
      currentIndex,
      isOneAndOne,
      showLongPicture,
      isCurrentLongPic,
      galleryHeight,
    } = this.state
    
    const isSingle = filesCount === 1
    const file = files[currentIndex] || {}
    const currHideThumbs = (hideThumbs && isFullscreen) || isSingle
    const currentIsVideo = file.type === UploadFileTypes.WORKS_VIDEO


    // const showVideoTips = currentIsVideo && !isFullscreen
    // const videoTipsLabel = showVideoTips ?  <div className="attach-tips">部分历史视频来自创作者过往发布在第三方视频平台的低精度版本，未来梅花网作品内容将原生托管高清视频</div> : ''
    const swiperStyle: any = {}
    if (galleryHeight >= 0) {
      if (isFullscreen) {
        swiperStyle.height = ''
        swiperStyle.overflowY = 'auto'
      } else {
        swiperStyle.height = galleryHeight + 60
        swiperStyle.overflowY = ''
      }
    }

    return (
      <>
      <div className={classnames('gallery-photos', className, {fullscreen: isFullscreen}, {single: isSingle})}>
        {isFullscreen && this.renderHeader()}
        <div className={classnames(
          'swiper-container',
          'swiper-no-swiping',
          'gallery-top',
          'gallery-swiper-pc',
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
                  className="swiper-slide max"
                  datatype={isVideo ? 'video' : 'image'}
                >
                  {isVideo
                  // ? (url && <video preload="metadata" controls="controls" data-src={url} className="swiper-lazy"></video>)
                  ? <Player 
                      ref={el => this.playerRefs[`player${fileIndex}`] = ({player: el, index: fileIndex})} 
                      // muted
                      data-src={url} 
                      className="video-file swiper-lazy"
                      poster={item.wmUrl + '?vframe/jpg/offset/7/w/1100'}
                    >
                      {isHls ? <HLSSource isVideoChild src={url} />
                      : <source src={url} />}
                      <BigPlayButton position="center" />
                      <LoadingSpinner />
                      <ControlBar autoHide={false}>
                        <PlayToggle />
                        <VolumeMenuButton vertical />
                        {/* <CurrentTimeDisplay order={4.1} />
                        <ProgressControl order={4.2} /> */}
                        <TheatreButton order={7} className="player-custom-button" onClick={this.handleToggleHorizontal} />
                        <FullscreenToggleButton order={8} />
                        <FullscreenToggle disabled />
                      </ControlBar>
                    </Player>
                  : <img 
                      //data-src={`${url}?imageslim`} 
                      data-src={url} 
                      data-small-src={`${url}?imageView2/2/w/460/h/360`}
                      src={fileIndex === 0 ? `${url}?imageView2/2/w/460/h/360` : null}
                      alt={detail.title}
                      className="img-file swiper-lazy" 
                    />}
                    {isVideo && this.renderEnding(fileIndex,item)}
                  <div className="swiper-lazy-preloader"></div>
                </div>
              )
            })}
          </div>
          {!isSingle && <>
          <div className="swiper-button-next swiper-button-white"></div>
          <div className="swiper-button-prev swiper-button-white"></div>
          </>}
          {/* <div className="btn-fullscreen" onClick={this.handleFullScreen}>
            <CIcon name="fullscreen" />
          </div> */}
          {!isFullscreen && !currentIsVideo &&
          <div className="gallery-status-bar default">
            {!showLongPicture && isCurrentLongPic && <div className="btn-extend-long-pic" onClick={this.handleLongPicture}>点击展开长图</div>}
            <div className="status-bar-wrapper">
              <div className="status-item left">
                <span className="hand">
                  <span className="current-index">{currentIndex + 1}/{filesCount}</span>
                </span>
              </div>
              <div className="status-item center">
                <span className="image-operate">
                  <CIcon name="zoom-in" onClick={this.handleZoomIn} />
                  <CIcon name="zoom-out" onClick={this.handleZoomOut} />
                  <CIcon name={isOneAndOne ? 'suit' : 'screen-one-one'} onClick={this.handleZoomNormal} />
                </span>
              </div>
              <div className="status-item right">
                <div className="image-operate">
                  <Tooltip title={isHorizontalScreen ? '默认视图' : '剧场模式'}>
                    <CIcon name={isHorizontalScreen ? 'cancel-horizontal-screen' : 'horizontal-screen'} onClick={this.handleToggleHorizontal} />
                  </Tooltip>
                  <Tooltip title="全屏">
                    <CIcon name="full-screen" onClick={this.handleFullScreen} />
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>}
        </div>
        {isFullscreen && 
        <div className="gallery-status-bar">
        {!showLongPicture && isCurrentLongPic && <div className="btn-extend-long-pic" onClick={this.handleLongPicture}>点击展开长图</div>}
            <div className="status-bar-wrapper">
              <div className="status-item left">
                {/* <span className="hand">
                  <Icon type={hideThumbs ? 'appstore' : 'down'} onClick={this.handleThumbsToggle} />
                  <span className="current-index">{currentIndex + 1}/{filesCount}</span>
                </span> */}
              </div>
              <div className="status-item center">
                {!currentIsVideo &&
                <span className="image-operate">
                  <CIcon name="zoom-in" onClick={this.handleZoomIn} />
                  <CIcon name="zoom-out" onClick={this.handleZoomOut} />
                  <CIcon name={isOneAndOne ? 'suit' : 'screen-one-one'} onClick={this.handleZoomNormal} />
                </span>}
              </div>
              <div className="status-item right">
                {!currentIsVideo && <div className="image-operate">
                  <Tooltip title="剧场模式">
                    <CIcon name="horizontal-screen" onClick={this.handleReturnHorizontal} />
                  </Tooltip>
                  <Tooltip title="退出全屏">
                    <CIcon name="narrow-screen" onClick={this.handleReturn} />
                  </Tooltip>
                </div>}
              </div>
            </div>
        </div>}
        {/* <div className={classnames('attach-tips', {show: showVideoTips})}>部分历史视频来自创作者过往发布在第三方视频平台的低精度版本，未来梅花网作品内容将原生托管高清视频</div> */}
        <div className={classnames(
          'swiper-container',
          'gallery-thumbs',
          'gallery-thumbs-pc',
          {hide: currHideThumbs}
        )}>
          <div className="swiper-wrapper">
          {files.map(item => {
            const isVideo = item.type === UploadFileTypes.WORKS_VIDEO
            // const thumbSuffix = isVideo ? '?vframe/jpg/offset/7/w/218' : '?imageView2/4/w/218'
            const thumbSuffix = isVideo ? '?vframe/jpg/offset/7/w/218' : '?imageMogr2/thumbnail/!218x154r/size-limit/50k/gravity/center/crop/218x154'
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
          <div className="swiper-button-next swiper-button-black swiper-button-thumb-next" onClick={this.handleThembNext}></div>
          <div className="swiper-button-prev swiper-button-black swiper-button-thumb-prev" onClick={this.handleThembPrev}></div>
          <div className="swiper-scrollbar"></div>
        </div>
      </div>
    </>
    );
  }
}  