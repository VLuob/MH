import { useRef } from 'react'
import { Carousel, Tooltip } from 'antd'

import { CompositionStatus } from '@base/enums'
import CustomIcon from '@components/widget/common/Icon'
import './index.less'

const CoverCarousel = (props) => {
  const { list = [], onClick } = props
  const isMulti = list.length > 1
  const carouselRef = useRef(null)

  const handlePrev = () => {
    carouselRef.current.prev()
  }
  const handleNext = () => {
    carouselRef.current.next()
  }

  const handleClick = (record) => {
    if (onClick) onClick(record)
  }
  
  return (
    <div className="cover-carousel">
      <Carousel ref={carouselRef} dots={false}>
        {list.map(item => (
          <div className="cover-wrapper" key={item.id}>
            <a
              onClick={e => handleClick(item)}
            >
              <Tooltip title={item.compositionTitle}>
                <img
                  src={`${item.compositionCover}?imageMogr2/thumbnail/!504x360r/size-limit/50k/gravity/center/crop/504x360`}
                  alt={item.compositionTitle}
                />
              </Tooltip>
            </a>
          </div>
        ))}
      </Carousel>
      {isMulti && <>
      <div className="btn-prev" onClick={handlePrev}><CustomIcon name="arrow-left-o" /></div>
      <div className="btn-next" onClick={handleNext}><CustomIcon name="arrow-right-o" /></div>
      </>}
    </div>
  )
}

export default CoverCarousel