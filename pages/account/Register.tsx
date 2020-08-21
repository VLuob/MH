import dynamic from 'next/dynamic'
import { Component } from 'react'
import { initializeStore } from '@stores'
import srvUtils from '@utils/srvutils'
import { composition as compositionSys } from '@base/system'

import HeadComponent from '@components/common/HeadComponent'
import AccountLayout from '@containers/account/AccountLayout'
import RegisterForm from '@containers/account/register/RegisterForm'
import { user } from '@base/system'

const RegisterFormWithNoSSR = dynamic(() => import('@containers/account/register/RegisterForm'), {
    // loading: () => <RegisterForm />,
    loading: () => <div />,
    ssr: false
})

export default class Register extends Component {
    static async getInitialProps({ req, res, query, asPath, mobxStore }) {
        const { accountStore, adStore } = mobxStore
        const pageProps = {}
        if (req && req.headers) {
            const host = req.headers.host
            const isMobile = srvUtils.isMobile(req)
            if (!isMobile) {
                const placeMap = {1: 0, 2: 4, 3: 8} // 广告位置第1、5、9位
                const resAds = await adStore.fetchAdvertisement({host, page_code: 'f_l_l', field_code: ['f_l_l_1', 'f_l_l_2', 'f_l_l_3']})
                const resultHotShots = await accountStore.fetchHotShots({host, limit: 9})
                const resHotShots = compositionSys.mergeShotsAndAds({shotsList: resultHotShots, adsData: resAds, placeMap})
                accountStore.updateHotShots(resHotShots)
                pageProps.resHotShots = resHotShots
            } else {
                accountStore.updateHotShots([])
            }
        }
        return { ...pageProps, query }
    }

    async componentDidMount() {
        user.init()
    }

    render() {
        const { resHotShots, query } = this.props
        return (
            <>
                <HeadComponent 
                    title={`注册-梅花网`} 
                    keywords=" "
                    description=" "
                />
                <AccountLayout resHotShots={resHotShots}>
                    <RegisterFormWithNoSSR query={query} />
                </AccountLayout>
            </>
        )
    }
}