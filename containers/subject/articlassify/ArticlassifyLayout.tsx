import { Component } from 'react'
import EmptyComponent from '@components/common/EmptyComponent'

interface Props {
    children: object,
    NavContainer: object
}
interface State {
    
}

export default class ArticlassifyLayout extends Component<Props, State> {
    render() {
        const { children, NavContainer } = this.props

        return (
            <div className='brand-layout articlassify-layout'>
                {NavContainer}
                <div className='brand-container articlassify-container'>
                    {children ? 
                        children : <EmptyComponent text='列表为空' />
                    }
                </div>
            </div>
        )
    }
}