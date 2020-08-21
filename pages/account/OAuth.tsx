import { Component } from 'react'
import jsHttpCookie from 'cookie'
import { inject, observer } from 'mobx-react'

import HeadComponent from '@components/common/HeadComponent'
import AccountLayout from '@containers/account/AccountLayout'
import OAuthContainer from '@containers/account/oauth/OAuthContainer'



// @inject(stores => {
//     const { accountStore } = stores.store

//     return {

//     }
// })
// @observer
export default class Login extends Component {
    static async getInitialProps(ctx) {
      const { query } = ctx
        return { query }
    }


    componentDidMount() {

        
    }

    render() {
        const { query } = this.props

        return (
            <>
              <HeadComponent title={`登录-梅花网`} />
              <AccountLayout>
                <OAuthContainer query={query} />
              </AccountLayout>
            </>
        )
    }
}