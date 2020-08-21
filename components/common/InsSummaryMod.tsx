import { Row, Col, Icon, Button } from 'antd'
import { RoleType, FuncsType, AuthorStatus } from '@base/enums'
import SwiperContainer from '@containers/common/SwiperContainer'
import IntroComp from '@components/author/IntroComp'
import { toJS } from 'mobx'

const InsSummaryMod = props => {
    const params = {
        slidesPerView: 3,
        spaceBetween: 17,
        loop: true,
        pagination: {},
        navigation: {
            // nextEl: '.swiper-button-next'
        },
        breakpoints: {
            1600: {
                slidesPerView: 2,
                spaceBetween: 40,
            },
            1300: {
                slidesPerView: 1,
                spaceBetween: 40,
            }
        },
        autoplay: false
    }

    const item = props.item || {}
    let compositionList = item.compositionList

    compositionList = compositionList && compositionList.length === 3 ? compositionList :
        compositionList === 2 ? [...compositionList, {}] : compositionList === 1 ?
            [...compositionList, {}, {}] : [{}, {}, {}]

    const statusText = item.status === AuthorStatus.AUDITING ? `待审核` : 
        item.status === AuthorStatus.REFUSED ? `未通过` : 
        item.status === AuthorStatus.CLOSED ? `已通过` : ''

    return (
        <div className='summary-module clearfix'>
            <div className='summary-intro-box'>
                <IntroComp 
                    item={item}
                    roles={true}
                    status={item.status}
                    roleType={item.type}
                    isManagement
                >
                    {props.children}
                </IntroComp>
            </div>
            <div className='summary-group-box'>
                {item.compositionList && item.compositionList.map(l => {
                    return (
                        <div className='group-slides' key={l.id}>
                            <a target='_blank' href={l.type !== FuncsType.COMPOSITION ? `/article/${l.id || l.compositionId}` : `/shots/${l.id || l.compositionId}`}>
                                <img src={`${l.cover || l.image}?imageMogr2/thumbnail/!243x173r/size-limit/50k/gravity/center/crop/243x173`} alt='封面' />
                            </a>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default InsSummaryMod