import { Component } from 'react'

// import Swiper from 'react-id-swiper/lib/ReactIdSwiper.full'
import Swiper from 'react-id-swiper'
// import { Pagination } from 'swiper'

interface Props {
    param: object
}
interface State {

}

export default class SwiperContainer extends Component<Props, State> {
    static async getInitialProps({ query }) {

        return { query }
    }

    render() {
        const { children } = this.props
        const param = this.props.param || {}

        let params = {
            slidesPerView: 1,
            observer: true,
            centeredSlides: true,
            observeParents: true,
            rebuildOnUpdate: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            loop: children && children.length > 1 ? true : false,
            onMouseEnter: () => {
                // console.log(1)
            }
        }
        
        if(children && children.length > 1) {
            params = {
                ...params,
                pagination: {
                    el: '.swiper-pagination',
                    bulletActiveClass: 'my-bullet-active',
                    type: 'bullets',
                    clickable: true,
                }
            }
        }

        const combineParam = { ...params, ...param }

        return (
            <Swiper {...combineParam}>
                {children}
            </Swiper>
        )
    }
}