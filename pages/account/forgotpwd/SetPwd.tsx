import { Component } from 'react'
import { utils, cookie, config } from '@utils'

import SetPwdForm from '@components/account/SetPwdForm'
import HeadComponent from '@components/common/HeadComponent'
import AccountLayout from '@containers/account/AccountLayout'

import { ApplyType } from '@base/enums'
import { initializeStore } from '@stores'
import { inject, observer } from 'mobx-react'

interface Props {
    type: string,
    phoneData: any,
    fetchPasswordReset: any
}

@inject(stores => {
    const { accountStore } = stores.store
    const { phoneData, fetchPasswordReset } = accountStore

    return {
        phoneData,
        fetchPasswordReset
    }
})
@observer
export default class SetPwd extends Component<Props, ChildNode> {
    static async getInitialProps({ query, res, mobxStore }) {
        const { phoneData } = mobxStore.accountStore
        
        // if(!phoneData.token) {
        //     res.redirect(`/signin`)

        //     return
        // }

        return {
            ...query
        }
    }

    render() {
        const { type, phoneData, fetchPasswordReset } = this.props
        // const types = type === ApplyType.EMAIL ? `邮箱` : `手机`
        const types = utils.getUrlParam(`token`) ? `邮箱` : `手机`

        return (
            <>
                <HeadComponent title={`重置密码-梅花网`} />
                <AccountLayout>
                    <h3 className='headline'>通过{types}找回密码</h3>
                    <div className='other-box'>
                        <SetPwdForm phoneData={phoneData}
                            fetchPasswordReset={fetchPasswordReset} />
                    </div>
                </AccountLayout>
            </>
        )
    }
}