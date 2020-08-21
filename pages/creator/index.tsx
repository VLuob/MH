import { Component } from 'react'
import HeadComponent from '@components/common/HeadComponent'
import CreatorSelect from '@containers/creator'


export default class Creator extends Component {
    static async getInitialProps(ctx) {
        const { asPath, query, req, res, mobxStore } = ctx
        const { globalStore } = mobxStore
        const { serverClientCode, isMobileScreen, setMobileNavigationData } = globalStore

        if (req && req.headers) {

            if (isMobileScreen) {
                setMobileNavigationData({hide: true})
            }
        }

        return {

        }
    }
    
    render() {
        return (
            <>
                <HeadComponent
                    title={`创建创作者-梅花网-营销作品宝库`}
                />
                <CreatorSelect />
            </>
        )
    }
}