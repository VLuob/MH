import { useState, useEffect, useRef } from 'react'
import classnames from 'classnames'
import debounce from 'lodash/debounce'

import CustomIcon from '@components/widget/common/Icon'

const FormNav = (props) => {
  const { forms=[], formCode=0, onFormChange } = props
  const navScrollRef = useRef(null)
  const formNavRef = useRef(null)
  const prevRef = useRef(null)
  const nextRef = useRef(null)

  useEffect(() => {
    initContainer()
    initEvent()

    return () => {
      removeEvent()
    }
  }, [])

  const initEvent = () => {
    navScrollRef.current.addEventListener('scroll', handleScroll, false)
  }
  const removeEvent = () => {
    navScrollRef.current.removeEventListener('scroll', handleScroll, false)
  }

  const initContainer = () => {
    const navRect = navScrollRef.current.getBoundingClientRect()
    const formTags = formNavRef.current.querySelectorAll('.form-tag')
    let w = 0
    for (let tag of formTags) {
      const tagRect = tag.getBoundingClientRect()
      w += tagRect.width + 10
    }
    formNavRef.current.style.width = w + 'px'
    prevRef.current.style.display = 'none'
    if (w < navRect.width + 10) {
      nextRef.current.style.display = 'none'
    }
  }

  const handleScroll = debounce((e) => {
    const navRect = navScrollRef.current.getBoundingClientRect()
    const formRect = formNavRef.current.getBoundingClientRect()
    const scrollLeft = navScrollRef.current.scrollLeft
    // console.log('scroll left', scrollLeft, navRect, formRect)
    if (scrollLeft <= 0) {
      prevRef.current.style.display = 'none'
    } else {
      prevRef.current.style.display = 'block'
    }
    if (scrollLeft + navRect.width >= formRect.width - 1) {
      nextRef.current.style.display = 'none'
    } else {
      nextRef.current.style.display = 'block'
    }
  }, 200)

  const handlePrev = () => {
    const scrollLeft = navScrollRef.current.scrollLeft
    navScrollRef.current.scrollTo({
      left: scrollLeft - 300,
      behavior: 'smooth',
    })
  }
  const handleNext = () => {
    const scrollLeft = navScrollRef.current.scrollLeft
    navScrollRef.current.scrollTo({
      left: scrollLeft + 300,
      behavior: 'smooth',
    })
  }

  const handleFormChange = (code) => {
    if (onFormChange) onFormChange(code)
  }

  return (
    <div className="form-nav-wrapper">
      <div className="sub-nav-scroll" ref={navScrollRef}>
        <ul className="form-nav" ref={formNavRef}>
          <li className={classnames('form-tag', { active: Number(formCode) === 0 })} onClick={e => handleFormChange(0)}>
            全部
          </li>
          {forms.map(item => (
            <li className={classnames('form-tag', { active: Number(formCode) === item.code })} key={item.id} onClick={e => handleFormChange(item.code)}>
              {item.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="form-nav-btn btn-prev" ref={prevRef} onClick={handlePrev}><CustomIcon name="arrow-left-o" /></div>
      <div className="form-nav-btn btn-next" ref={nextRef} onClick={handleNext}><CustomIcon name="arrow-right-o" /></div>
    </div>
  )
}

export default FormNav