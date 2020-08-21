import { Component, createRef } from 'react'
import debounce from 'lodash/debounce'

class RenderActionBarScrollFixed extends Component {
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

  handleScrollEvent = (e) => {
    const boxRef = this.boxRef.current
    if (!boxRef) {
      return
    }
    const docScrollTop = document.documentElement.scrollTop
    const winHeight = window.innerHeight
    const footerRef = document.querySelector('.common-footer')
    const footerRect = footerRef.getBoundingClientRect()
    // console.log('doc scroll top', docScrollTop, footerRect.top, winHeight)
    if (docScrollTop > 800 && footerRect.top > winHeight) {
      boxRef.classList.add('show')
    } else {
      boxRef.classList.remove('show')
    }
  }

  render() {

    return this.props.render({
      ref: this.boxRef,

    })
  }
}

export default RenderActionBarScrollFixed