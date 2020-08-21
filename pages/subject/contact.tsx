import { Component } from 'react'
import { initializeStore } from '@stores'

import ContactContent from '@containers/subject/contact'
import HeadComponent from '@components/common/HeadComponent'
import BannerContent from '@containers/subject/contact/BannerContent'
import ContactLayout from '@containers/subject/contact/ContactLayout'

export default class ContactContainer extends Component {
    static async getInitialProps({ req, asPath, query, mobxStore }) {
        const { searchStore } = mobxStore
        let title = `关于我们`

        if(req && req.headers) {
            const pathname = asPath.substr(1) 

            switch(pathname) {
                case 'about':
                    title = `关于我们`
    
                    break
                case 'contact':
                    title = `联系我们`
    
                    break
            }
        }

        return { title }
    }

    render() {
        const { title } = this.props
        let conTitle = title

        if(typeof window !== 'undefined') {
            const pathname = window.location.pathname && (window.location.pathname).substr(1) 
    
            switch (pathname) {
                case 'about':
                    conTitle = `关于我们`

                    break
                case 'contact':
                    conTitle = `联系我们`

                    break
            }
        }

        return (
            <ContactLayout 
                bannerContent={<BannerContent />}
            >
                <HeadComponent title={`${conTitle}-梅花网`} />
                <ContactContent />
            </ContactLayout>
        )
    }
}