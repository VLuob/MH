import { Spin } from 'antd'
import classnames from 'classnames'

const Loading = (props) => {
    const {tip, size, className, float, mask, ...rest} = props
    return (
        <div className={classnames(
            'part-loading-wrap',
            {float, mask},
        )} {...rest}>
            <Spin tip={tip} size={size || 'large'} className='loading-inner'></Spin>
        </div>
    )
}

export default Loading