import { Row, Col, Icon, Button } from 'antd'
import { toJS } from 'mobx'

import IntroComp from '@components/author/IntroComp'
import emptyImage from '@static/images/common/full-empty.png'

const SummaryMod = props => {
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

    const { org, isInstitution, onFocus, onMessage } = props
    const isOrg = props.isOrg

    // compositionList = compositionList && compositionList.length === 3 ? compositionList :
    //     compositionList === 2 ? [...compositionList, {}] : compositionList === 1 ?
    //         [...compositionList, {}, {}] : [{}, {}, {}]
    return (
        <div className='summary-module clearfix'>
            {org && org.map(item => {
                return (
                    <div className='summary-intro-list clearfix' key={item.id}>
                        <div className='summary-intro-box'>
                            {!isOrg && <IntroComp
                                item={item}
                                avatarSize={100}
                                status={item.status}
                                roleType={item.type}
                                //isInstitution={true}
                            >
                                {!item.followed && <Button type='primary' shape='round' onClick={e => onFocus(item)}>+ 关注</Button>}
                                {!!item.followed && <Button className='completed' shape='round' onClick={e => onFocus(item)}>已关注</Button>}
                                <Button shape='round' className='completed' onClick={e => onMessage(item)}>私信</Button>
                            </IntroComp>}
                            {isOrg && <IntroComp
                                item={item}
                                roles={true}
                                avatarSize={100}
                                status={item.status}
                                roleType={item.type}
                                isInstitution={true}
                            >
                                <Button type='primary' shape='round'>
                                    <a href={`/teams/${item.id}`}>
                                        机构主页
                                    </a>
                                </Button>
                            </IntroComp>}
                        </div>
                        {item.compositionList && item.compositionList.length > 0 && <div className='summary-group-box'>
                            {item.compositionList.map(l => {
                                return (
                                    <div className='group-slides' key={l.id}>
                                        {(l.type === 1 || l.type === 2) ? 
                                            <a href={l.type === 1 ? `/shots/${l.id}` : `/article/${l.id}`} target='_blank'>
                                                <img src={l.cover || emptyImage} alt='封面' />
                                            </a> :
                                            <a>
                                                <img src={l.cover || emptyImage} alt='封面' />
                                            </a>
                                        }
                                    </div>
                                )
                            })}
                        </div>}
                    </div>
                )
            })}
        </div>
    )
}

export default SummaryMod