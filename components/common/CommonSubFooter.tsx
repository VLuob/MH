import { Component } from 'react'
import ReactTooltip from 'react-tooltip'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'

const renderList = (data, onClicks) => {
    return (
        <>
            {data.map(l => {
                return (
                    <li key={l.id} data-for={`perbox-${l.id}`} data-tip={l.name} onClick={e => onClicks({id: l.id})}>
                        <a href={l.ad_link} target='_blank'>
                            <img src={l.logo} />
                        </a>
                        <ReactTooltip id={`perbox-${l.id}`} effect='solid' place='top' />
                    </li>
                )
            })}
        </>
    )
}

@inject(stores => {
    const { adStore, homeStore } = stores.store
    const { actionSponsorClick } = adStore
    const { sponsor, fetchGetClientSponsor } = homeStore

    return {
        sponsor,
        actionSponsorClick,
        fetchGetClientSponsor,
    }
})
@observer
export default class CommonSubFooter extends Component {
    beforeScrollTop = 0

    componentDidMount() {
        const { fetchGetClientSponsor } = this.props

        fetchGetClientSponsor()

        if (this.checkPageNavFixed()) {
            this.initEvents()
        }
    }

    componentWillUnmount() {
        this.removeEvents()
    }

    initEvents() {
        window.addEventListener('scroll', this.handleScroll, false)
    }

    removeEvents() {
        window.removeEventListener('scroll', this.handleScroll, false)
    }

    handleScroll = (e) => {
        if (!this.sponsorRef || !this.subFooterRef) {
            return
        }
        const windowHeight = window.innerHeight
        const afterScrollTop = window.scrollY
        // console.log(afterScrollTop)
        const delta = afterScrollTop - this.beforeScrollTop
        const sponsorClassList = this.sponsorRef.classList
        if (delta > 0) {
            // console.log('down')
            if (sponsorClassList.contains('fixed')) {
                sponsorClassList.remove('fixed')
            }
        } else {
            // console.log('up')
            const subFooterRef = this.subFooterRef.getBoundingClientRect()
            // console.log(subFooterRef,windowHeight, afterScrollTop, afterScrollTop + windowHeight)
            if (subFooterRef.top > windowHeight && !sponsorClassList.contains('fixed')) {
                sponsorClassList.add('fixed')
            }
        }

        this.beforeScrollTop = afterScrollTop
    }

    checkPageNavFixed() {
        const regExp = /\/(article|shots)\/\d+/
        const pathname = location.pathname
        return regExp.test(pathname)
    }

    render() {
        const { sponsor, showSubFooter, actionSponsorClick } = this.props
        const sponsorLists = renderList(sponsor, actionSponsorClick)
 
        return (
            <>
                {sponsor.length > 0 && showSubFooter &&
                    <div 
                        ref={el => this.subFooterRef = el}
                        className='common-sub-footer'
                    >
                        <h6>梅花网赞助商</h6>
                        <ul 
                            ref={el => this.sponsorRef = el}
                            className='sponsors-menu clearfix'
                        >
                            {sponsorLists}
                        </ul>
                    </div>
                }
            </>
        )
    }
}