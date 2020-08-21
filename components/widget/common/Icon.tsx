import React, { Component } from 'react'
import classNames from 'classnames'

interface Props {
	color?: string
	name: string
	className?: string
}

class Icon extends Component<Props> {

	render() {
		const { color, name, ...props } = this.props
		const iconProfix = 'mhicon-'
		const className = classNames(
			'icon iconfont', 
			name && name.indexOf(iconProfix) === -1 ? `${iconProfix}${name}` : name,
			props.className
		)
 
		return (
			<i {...props} className={className} />
		)
	}
}

export default Icon