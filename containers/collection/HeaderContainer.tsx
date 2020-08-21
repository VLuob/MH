import { Component } from 'react'
import { FollowTypes } from '@base/enums'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import { Button, Avatar } from 'antd'
import jsCookie from 'js-cookie'
import { config } from '@utils'
// import UserIdentity from '@components/widget/common/UserIdentityComp'

@inject(stores => {
    const { collectionStore, globalStore } = stores.store
    const { favoritesDetail } = collectionStore
    const { serverClientCode } = globalStore

    return {
        collectionStore,
        favoritesDetail,
        serverClientCode,
    }
})
@observer
export default class HeaderContainer extends Component {
    onActionFollow = option => {
        const { favoritesDetail, serverClientCode, collectionStore } = this.props
        const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
        if (!token) {
            window.location.href = `/signin?c=${window.location.pathname}`
            return
        }
        collectionStore.fetchFavoritesDetailFollow({ id: favoritesDetail.id, action: option.action, type: FollowTypes.COLLECTION, client_code: serverClientCode })
    }

    render() {
        const { favoritesDetail, } = this.props

        return (
            <div className='collection-header-container'>
                <div className='banner-container'>
                    <div className='header-no-banner'>
                        <div className='header-title'> 
                            <span className='header-title-name'>{favoritesDetail.name}</span>
                            {!favoritesDetail.followed ? 
                                <Button type='primary' shape='round' className='header-title-unfocus' onClick={e => this.onActionFollow({ action: 1 })}>关注</Button> :
                                <Button type='default' shape='round' className='header-title-focus completed' onClick={e => this.onActionFollow({ action: 0 })}>已关注</Button>
                            }
                        </div>
                        <div className="header-intro">
                            <span className="header-userinfo">
                                <a className="avatar">
                                    <Avatar icon="user" size={40} src={favoritesDetail.userAvatar} />  
                                </a>
                                <span className="name">{favoritesDetail.userNickname}</span>
                            </span>
                            <span className="stat">
                                <span className="text">{favoritesDetail.pv || 0}人浏览</span>
                                <span className="text">{favoritesDetail.follows || 0}人关注</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}