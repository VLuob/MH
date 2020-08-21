import { Component } from 'react'
import classnames from 'classnames'
import EmptyComponent from '@components/common/EmptyComponent'

interface Props {
    children: object,
    NavContainer: object
}
interface State {
    
}

export default class BrandLayout extends Component<Props, State> {
    render() {
        const { children, NavContainer, className, hasOwner } = this.props
 
        return (
            <div className={classnames(
                'brand-layout',
                {'has-owner': hasOwner},
                className,
            )}>
                {NavContainer}
                <div className='brand-container'>
                    {children ? 
                        children : <EmptyComponent text='列表为空' />
                    }
                </div>
            </div>
        )
    }
}