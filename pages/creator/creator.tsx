import { Component } from 'react'
import jsCookie from 'js-cookie'
import { config } from '@utils/'
import { message } from 'antd'
import HeadComponent from '@components/common/HeadComponent'
import CreatorForm from '@containers/creator/creatorForm'
import { AuthorType } from '@base/enums'

export default class CreatorCreate extends Component {
    static async getInitialProps(ctx) {
        const { query, req, res, mobxStore } = ctx
        const { globalStore } = mobxStore
        const { serverClientCode, isMobileScreen, setMobileNavigationData } = globalStore
        const reatorType = query.type
        let apps = {}
        let titleInfo, creatorType
        let modifyID
        if (query.modify) {
            modifyID = query.modify
        } else {
            modifyID = -1
        }

        if (req && req.headers) {

            if (isMobileScreen) {
                setMobileNavigationData({hide: true})
            }
        }


        if (reatorType !== `personal` && reatorType !== `service` && reatorType !== `brand`) {
            res.writeHead(302, { Location: `/creator` })
            res.end()
            return
        }

        if (reatorType === 'personal') {
            titleInfo = '个人创作者'
            creatorType = AuthorType.PERSONAL
        } else if (reatorType === 'service') {
            titleInfo = '服务商创作者'
            creatorType = AuthorType.SERVER
        } else if (reatorType === 'brand') {
            titleInfo = '品牌主创作者'
            creatorType = AuthorType.BRANDER
        }

        apps = {
            titleInfo,
            creatorType,
            modifyID
        }

        return {
            ...apps
        }
    }

    componentDidMount() {
        const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
        if (!token) {
            message.destroy()
            message.warning(`请登录后操作`)
            location.href = `/signin?c=${location.href}`
        }
    }

    render() {
        const { titleInfo, creatorType, modifyID } = this.props

        return (
            <>
                <HeadComponent
                    title={`${titleInfo}-梅花网-营销作品宝库`}
                />
                <CreatorForm titleInfo={titleInfo} creatorType={creatorType} modifyID={modifyID} />
            </>
        )
    }
}

