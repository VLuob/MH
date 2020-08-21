import { Router } from '@routes'
import { utils } from '@utils'
import { Component } from 'react'
import { Row, Col, Spin, Button, message } from 'antd'
import { inject, observer } from 'mobx-react'
import { FocusType, ActionType, FollowTypes } from '@base/enums'
import jsCookie from 'js-cookie'
import { toJS } from 'mobx'

import Recommend from '@components/common/Recommend'
import EmptyComponent from '@components/common/EmptyComponent'
import RecomendMobile from '@components/common/mobile/RecomendMobile'
import AuthorList from '@components/author/AuthorList'

import { config } from '@utils'

let authorLen = 0
@inject(stores => {
    const { accountStore, authorStore, globalStore } = stores.store
    const { currentUser, updateUserInfo, loginFailInfo, activeResultData, saveClientSigninInfo, fetchActivateUser } = accountStore
    const { classificationsData, fetchSpecialActionFollow } = authorStore
    const { isMobileScreen } = globalStore

    return {
        authorStore,
        currentUser,
        loginFailInfo,
        updateUserInfo,
        fetchActivateUser,
        classificationsData,
        fetchSpecialActionFollow,

        activeResultData,
        saveClientSigninInfo,

        isMobileScreen,
    }
})
@observer
export default class ActiveContainer extends Component {
    state = {
        isBetchFollored: false,
        isActived: true,
    }
    
    // componentDidMount() {
        // const { fetchActivateUser } = this.props
        // const activation_token = utils.getUrlParam('activation_token')
        // fetchActivateUser({ activation_token })
    // }

    renderButton = () => {
        return (
            <div className='operation'>
                <Button type='default' className='default-themes'>
                    <a href='/shots/new'>发布作品</a>
                </Button>
                <Button type='primary' className='themes' style={{ borderRadius: '3px', border: 'none', outline: 'none' }}>
                    <a href='/'>进入首页</a>
                </Button>
            </div>
        )
    }

    handleRecomand = item => {
        const { fetchSpecialActionFollow } = this.props
        const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
        let action = ActionType.FOCUS

        if(item.followed) {
            action = ActionType.UNFOCUS
        } else {
            action = ActionType.FOCUS
        }

        fetchSpecialActionFollow({ client_code, id: item.id, type: FocusType.AUTHOR, action })
    }

    clickRoute = item => {
        window.location.href = `/author/${item.code}`
    }

    handleFollowBetch = () => {
        const { classificationsData, authorStore } = this.props
        const authorList = classificationsData.list || []
        const ids = authorList.map(item => item.id).join(',')
        const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
        authorStore.fetchSpecialFollowBetch({
            client_code,
            id: ids,
            type: FollowTypes.AUTHOR,
            action: ActionType.FOCUS
        }, (res) => {
            if (res.success) {
                this.setState({isBetchFollored: true})
            }
        })
    }

    render() {
        const { asPath, classificationsData, isMobileScreen, activeResultData, fetchSpecialActionFollow } = this.props
        const { isBetchFollored, isActived } = this.state 
        const buttonList = this.renderButton()

        const isActiveSuccess = activeResultData.success

        return (
            <div className='pc-container' style={{display: 'block'}}>
                <div className='active-box author-containers'>
                    <div className="active-info-box">
                        {!isActived && <div className='title'>激活中，请稍等...</div>}
                        {isActived && <>
                        {isActiveSuccess ? <>
                        {!isMobileScreen 
                            ? <div className='title'>恭喜您注册成功，以下是为您推荐的优质创作者，关注他们您将会在首页看到他们的最新作品！</div>
                            : <>
                                <div className='title'>恭喜您注册成功</div>
                                <div className='meta'>
                                    以下是为您推荐的优质创作者<br/>关注他们您将会在首页看到他们的最新作品！
                                </div>
                            </>}
                        </> : <div className='title' style={{color: '#f00'}}>激活失败：参数错误</div>}
                        </>}
                        {buttonList}
                    </div> 
                    <div className="active-actions">
                        <span className="label">推荐创作者</span>
                        <span className="btn-follow"><Button type="primary" onClick={this.handleFollowBetch} disabled={isBetchFollored}>一键关注</Button></span>
                    </div>
                    <div className='active-content author-content'>
                        {classificationsData && classificationsData.list.length > 0 ? <Col span={24}> 
                            <AuthorList 
                                data={classificationsData} 
                                onRoute={this.clickRoute} 
                                isMobileScreen={isMobileScreen}
                                fetchFollow={fetchSpecialActionFollow} 
                            />
                        </Col> : <EmptyComponent text='暂无相关创作者' />} 
                    </div>
                </div>
            </div>
        )
    }
}