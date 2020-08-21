import { Component } from 'react'
import jsCookie from 'js-cookie'
import { inject, observer } from 'mobx-react'

import Portal from '@components/common/Portal'
import Loading from '@components/features/Loading'
import LayoutContainer from '@containers/common/LayoutContainer'

interface Props {
    component: any,
    isClear: boolean,
    globalLoading: boolean,
    getClientWidth: any,
}

interface State {

}

@inject(stores => {
    const { globalStore } = stores.store
    const { globalLoading, getClientWidth } = globalStore

    return {
        globalLoading,
        getClientWidth,
    }
})
@observer
class Containers extends Component<Props, State> {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.getClientWidths()

        if(typeof window !== 'undefined') {
            window.addEventListener('resize', this.getClientWidths, false)
        }
    }

    componentWillUnmount() {
        if(typeof window !== 'undefined') {
            window.removeEventListener('resize', this.getClientWidths, false)
        }
    }
    
    handleClientWidth = () => (typeof document !== 'undefined' && document.body.offsetWidth)

    getClientWidths = () => {
        this.props.getClientWidth(this.handleClientWidth())
    }

    render() {
        const { component, globalLoading } = this.props

        return (
            <> 
                <LayoutContainer component={component} />
                <Portal selector='#commonModal'>
                    {globalLoading && <Loading />}
                </Portal>
            </>
        )
    }
}

export default Containers