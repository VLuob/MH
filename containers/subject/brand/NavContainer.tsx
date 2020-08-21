import { Component } from 'react'
import { Button } from 'antd'
import { FocusType } from '@base/enums'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'

@inject(stores => {
    const { brandStore, adStore } = stores.store
    const { fetchBrandFollow } = brandStore
    const { brandAds } = adStore

    return {
        brandAds,
        fetchBrandFollow,
    }
})
@observer
export default class NavContainer extends Component {
    onActionFollow = option => {
        const { brandDetail, fetchBrandFollow } = this.props

        fetchBrandFollow({ id: brandDetail.brand.id, action: option.action, type: FocusType.BRAND })
    }

    render() {
        const { brandDetail, brandAds } = this.props
        // console.log('brandAds',toJS(brandAds), toJS(brandDetail))
        const bAds = brandAds['f_b'] || []
        const adItem = bAds[0] || {}
        const bannerImage = adItem.image
        const bannerTitle = adItem.title

        return (
            <div className='nav-container'>
                <div className='banner-container'>
                    {!bannerImage ? <div className='nav-no-banner'>
                        <div className='nav-title'> 
                            <span className='nav-title-name'>{brandDetail && brandDetail.brand && brandDetail.brand.chName}</span>
                            {!brandDetail.followed ? 
                                <Button type='primary' shape='round' className='nav-title-unfocus' onClick={e => this.onActionFollow({ action: 1 })}>关注</Button> :
                                <Button type='default' shape='round' className='nav-title-focus completed' onClick={e => this.onActionFollow({ action: 0 })}>已关注</Button>
                            }
                        </div>
                    </div> : 
                    <div className='nav-banner'>
                        <div className='intro-show-img'>
                                <img src={bannerImage + '?imageMogr2/thumbnail/!1920x360r/gravity/center/crop/1920x360'} alt={bannerTitle} className='banner-img' />
                        </div>
                        <div className='nav-title'>
                                <span className='nav-title-name'>{brandDetail && brandDetail.brand && brandDetail.brand.chName}</span>
                                {brandDetail && !brandDetail.followed ? 
                                <Button type='primary' shape='round' className='nav-title-unfocus' onClick={e => this.onActionFollow({ action: 1 })}>关注</Button> :
                                <Button type='default' shape='round' className='nav-title-focus completed' onClick={e => this.onActionFollow({ action: 0 })}>已关注</Button>}
                        </div>
                    </div>}
                </div>
            </div>
        )
    }
}