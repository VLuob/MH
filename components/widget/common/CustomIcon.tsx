import React from 'react'
import ReactSVG from 'react-svg'
import { Icon } from 'antd'

export interface Props {
    src: string
}

/**
 * 自定义Icon
 * @param src 
 * @param width
 * @param height
 * @param fill
 * @param className
 * @param style
 */
const CustomIcon: React.SFC<Props> = ({ src,...props}) => {
    const Comp = () => <ReactSVG src={src} {...props} />

    return (
        <Icon component={Comp} />
    )
} 

export default CustomIcon