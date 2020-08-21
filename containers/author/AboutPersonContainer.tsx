import { Component } from 'react'
import { inject, observer } from 'mobx-react'

import { getCreatorType } from '@base/system'
import { ActionType } from '@base/enums'
import { message, Row, Col, Tabs, Tag, Button, Spin } from 'antd'
import { toJS } from 'mobx'

import { LetterSendType, LetterSenderTypes, LetterReceiverTypes, LetterSources } from '@base/enums'
import SummaryMod from '@components/common/SummaryMod'

const TabPane = Tabs.TabPane

@inject(stores => {
    const { globalStore, authorStore, letterStore, accountStore } = stores.store
    const { isBigScreen, currentWxacode } = globalStore
    const { aboutData, changeAboutData, fetchAboutActionFollow, fetchGetAuthorAbout } = authorStore
    const { currentUser } = accountStore

    return {
        globalStore,
        letterStore,
        aboutData,
        isBigScreen,
        currentWxacode,
        changeAboutData,
        fetchAboutActionFollow,
        fetchGetAuthorAbout,
        currentUser,
    }
})
@observer
export default class AboutPersonContainer extends Component {
    // static getDerivedStateFromProps(props, state) {
    //     if(props.aboutData.ssr) {
    //         return {
    //             aboutData: props.aboutResultData
    //         }
    //     } else {
    //         return {
    //             aboutData: props.aboutData
    //         }
    //     }
    // }

    componentDidMount() {
        const { query, aboutResultData, changeAboutData, fetchGetAuthorAbout, globalStore } = this.props
        const { code } = query

        changeAboutData({ ...aboutResultData })

        const wxacodeParams = {
            scene: `code=${code}`,
            page: 'pages/author/author-detail/author-detail',
            width: 320,
        }
        globalStore.fetchWxacode(wxacodeParams)
    }

    handleFocus = item => {
        const { query, fetchAboutActionFollow } = this.props
        const { code } = query
        let action = ActionType.FOCUS

        if(item.followed) {
            action = ActionType.UNFOCUS
        } else {
            action = ActionType.FOCUS
        }

        fetchAboutActionFollow({ client_code: code, id: item.id, type: item.type, action })
    }

    handleMessage = (author) => {
        const { letterStore, currentUser } = this.props
        // console.log(toJS(author))
        
        letterStore.open({
            type: LetterSendType.SEND,
            senderType: LetterSenderTypes.USER, // 1梅花网用户 2 创作者
            senderAvatar: currentUser.avatar,
            receiverType: LetterReceiverTypes.AUTHOR,
            receiverId: author.id,
            receiverNickName: author.nickname,
            source: LetterSources.ARTICLE_DETAIL,
        })
    }

    render() {
        const { aboutData, isBigScreen, authorInfo, currentWxacode } = this.props
        const insName = getCreatorType(authorInfo.type)
 
        return (
            <div className='origin-personal-container'>
                <Tabs type='card'>
                    <TabPane tab={`${insName}简介`} key='1'>
                        <div className='origin-about-conatainer'>
                            <h6 className='subheading'>{insName}简介</h6>
                            <p className='introduce'>
                                {aboutData.profile && aboutData.profile.length > 0 ? aboutData.profile : `暂无信息`}
                            </p>
                            {/* {aboutData.org && aboutData.org.length > 0 && 
                                <div className='padding-box'></div>
                            } */}
                            {/* {aboutData.org && aboutData.org.length > 0 && 
                                <>  
                                    <h6 className='subheading'>加入机构</h6>
                                    <SummaryMod 
                                        org={aboutData.org} 
                                        onFocus={this.handleFocus}
                                        isBigScreen={isBigScreen} 
                                        onMessage={this.handleMessage} />
                                </>} */}
                            {/* <SummaryMod isBigScreen={isBigScreen} />
                            <SummaryMod isBigScreen={isBigScreen} /> */}
                            {/* {aboutData.tags && aboutData.tags.length > 0 &&
                                <>
                                    <h6 className='subheading'>个人标签</h6>
                                    <div className='tag-list'>
                                        {aboutData.tags.map(l => {
                                            return (
                                                <Tag key={l.id} className='tag' color='#F1F1F1'>{l.name}</Tag>
                                            )
                                        })}
                                    </div>
                                </>
                            } */}
                            
                            <div style={{height: '30px'}}></div>
                            <h6 className='subheading'>微信小程序</h6>
                            <div className='wxacode'>
                                {currentWxacode ? <img src={currentWxacode} alt="微信小程序码" style={{width: '160px'}}/> : <Spin />}
                            </div>
                        </div>
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}