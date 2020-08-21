import { Component, createRef } from 'react'
import debounce from 'lodash/debounce'

class RenderServiceItemsShiftOut extends Component {
  state = {
    isShiftOut: false,
  }
  boxRef = createRef()

  componentDidMount() {
    this.initEvents()
  }

  componentWillUnmount() {
    this.removeEvents()
  }

  initEvents() {
    document.addEventListener('scroll', this.handleScrollEvent, false)
  }

  removeEvents() {
    document.removeEventListener('scroll', this.handleScrollEvent, false)
  }

  handleScrollEvent = debounce((e) => {
    const boxRef = this.boxRef.current
    if (!boxRef) {
      return
    }
    const extraRef = document.querySelector('.service-detail-extra-container')
    const wrapperRef = boxRef.querySelector('.service-items-wrapper')
    const boxRect = boxRef.getBoundingClientRect()
    const wrapperRect = wrapperRef.getBoundingClientRect()
    const extraRect = extraRef.getBoundingClientRect()
    // console.log('box rect',extraRect,  extraRect.top < wrapperRect.bottom)
    // console.log('box rect',extraRect, wrapperRect, extraRect.top < wrapperRect.bottom)
    if (extraRect.top > wrapperRect.bottom) {
      // wrapperRef.style.top = ''
      // wrapperRef.style.bottom = ''
      boxRef.classList.remove('hidden')
    } else {
      // wrapperRef.style.top = 'initial'
      // wrapperRef.style.bottom = extraRect.top + 'px'
      boxRef.classList.add('hidden')
    }
    if (boxRect.bottom < -10) {
      boxRef.classList.add('fixed')
    } else {
      boxRef.classList.remove('fixed')
    }
  }, 50)

  render() {

    return this.props.render({
      ref: this.boxRef,

    })
  }
}

export default RenderServiceItemsShiftOut