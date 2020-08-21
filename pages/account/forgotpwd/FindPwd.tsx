import { Component } from 'react'

import jsCookie from 'js-cookie'
import { ApplyType } from '@base/enums'

import HeadComponent from '@components/common/HeadComponent'
import EmailForm from '@containers/account/findPwd/EmailForm'
import PhoneForm from '@containers/account/findPwd/PhoneForm'
import AccountLayout from '@containers/account/AccountLayout'

export default class EmailContainer extends Component {
    static async getInitialProps({ query }) {
        // console.log(query)
        return {
            ...query
        }
    }

    render() {
        const { type } = this.props
        const types = type === ApplyType.EMAIL ? '邮箱' : '手机'
        const numType = type === ApplyType.EMAIL ? 1 : 2

        jsCookie.set('setPwdType', numType)

        return (
            <>
                <HeadComponent title={`找回密码-梅花网`} />
                <AccountLayout>
                    <h3 className='headline'>通过{types}找回密码</h3>
                    <div className='forgot-box'>
                        {type === ApplyType.EMAIL ? <EmailForm /> : <PhoneForm />}
                    </div>
                </AccountLayout>
            </>
        )
    }
}