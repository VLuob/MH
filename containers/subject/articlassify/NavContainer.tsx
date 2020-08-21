import { Component } from 'react'
import { Button } from 'antd'
import { FocusType } from '@base/enums'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'

@inject(stores => {
    const { articlassifyStore, globalStore } = stores.store
    const { fetchArticlassifyFollow, articlassifyClientDetail, updateArticlassifyDetail } = articlassifyStore

    return {
        fetchArticlassifyFollow,
        articlassifyClientDetail,
        updateArticlassifyDetail,
    }
})
@observer
export default class NavContainer extends Component {
    componentDidMount() {
        const { articlassifyDetail, updateArticlassifyDetail } = this.props

        updateArticlassifyDetail(articlassifyDetail)
    }

    onActionFollow = option => {
        const { articlassifyClientDetail, fetchArticlassifyFollow } = this.props

        fetchArticlassifyFollow({ id: articlassifyClientDetail.classification.id, action: option.action, type: FocusType.CLASSIFY })
    }

    render() {
        const { articlassifyDetail, articlassifyClientDetail } = this.props

        return (
            <div className='nav-container'>
                <div className='banner-container'>
                    {articlassifyClientDetail && articlassifyClientDetail.classification && !articlassifyClientDetail.classification.authorAvatar ? 
                    <div className='nav-no-banner'>
                        <div className='nav-title'> 
                            <span className='nav-title-name'>{articlassifyDetail && articlassifyDetail.classification && articlassifyDetail.classification.name}</span>
                            {articlassifyClientDetail && !articlassifyClientDetail.followed ? 
                                <Button type='primary' shape='round' className='nav-title-unfocus' onClick={e => this.onActionFollow({ action: 1 })}>关注</Button> :
                                <Button type='default' shape='round' className='nav-title-focus completed' onClick={e => this.onActionFollow({ action: 0 })}>已关注</Button>
                            }
                        </div>
                    </div> : 
                    <div className='nav-banner'>
                        <div className='intro-show-img'>
                            <img src={articlassifyClientDetail && articlassifyClientDetail.classification && articlassifyClientDetail.classification.authorAvatar} alt='' className='banner-img' />
                        </div>
                        <div className='nav-title'>
                            <span className='nav-title-name'>{articlassifyClientDetail && articlassifyClientDetail.classification && articlassifyClientDetail.classification.name}</span>
                            {articlassifyClientDetail && !articlassifyClientDetail.followed ? 
                                <Button type='primary' shape='round' className='nav-title-unfocus' onClick={e => this.onActionFollow({ action: 1 })}>关注</Button> :
                                <Button type='default' shape='round' className='nav-title-focus completed' onClick={e => this.onActionFollow({ action: 0 })}>已关注</Button>}
                        </div>
                    </div>}
                </div>
            </div>
        )
    }
}