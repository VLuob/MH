import { Component, createRef } from 'react'
import debounce from 'lodash/debounce'

class RenderShareShiftOut extends Component {
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
    const boxRect = boxRef.getBoundingClientRect()
    // console.log('box rect', boxRect)
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

export default RenderShareShiftOut