import classnames from 'classnames'
import SwiperContainer from '@containers/common/SwiperContainer'
import RenderAdClick from '@containers/common/RenderAdClick'

import './index.less'

const AdSwiperItem = ({item}) => {
  const setting = JSON.parse(item.setting || '{"appSetting":{"appOpenScreenImages":null},"showSetting":{"title":true,"recommendation":false}}')
  const showSetting = setting.showSetting || {}
  return (
      <div className="swiper-item">
        {<RenderAdClick
          render={(onClick) => (
            <a href={item.link} key={item.id} target='_blank' onClick={e => onClick(item.id)} title={item.title}>
                <div className='ad-img'>
                    <img src={item.image} alt={item.title} />
                </div>
                {showSetting.title && <div className="ad-title">
                    <div className="ad-title-text">{item.title}</div>
                </div>}
            </a>
          )}
        />}
          {showSetting.recommendation && <span className='ad-spread'>推广</span>}
      </div>
  )
}

const SideAdBox = (props) => {
  const { adList=[], className } = props
  const hasAds = adList.length > 0

  return (
    hasAds ? <div className={classnames('side-ad-box', className)}>
      <SwiperContainer>
        {adList.map(item => (<AdSwiperItem key={item.id} item={item} />))}
      </SwiperContainer>
    </div> : null
  )
}

export default SideAdBox