import { Avatar } from 'antd' 
import { Component } from 'react'
import classNames from 'classnames'
import { colorList } from '@constants/common/avatar'

/**
 * @param src                   图片路径 
 * @param useImg                使用img标签
 * @param avatarSize            图片大小 
 * @param initialName           显示字段 
 * @param style                 样式 
 * @param className             类名 
 */
export default class AvatarComponent extends Component {
    render() {
        const { src, useImg, style, className, avatarSize, ...rest } = this.props
        const styles = { ...style }

        return (
            <>
                <img 
                    {...rest}
                    ref="img"
                    src={src || '/static/images/icon/avatar.png'} 
                    style={styles} 
                    className={classNames(
                        'avatar-img',
                        className
                    )} 
                />
                {/* <Avatar size={avatarSize} src={src} style={styles} className={className} /> */}
            </>
        )
    }
}