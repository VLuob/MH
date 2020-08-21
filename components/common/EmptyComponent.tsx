import { Avatar } from 'antd'
import classnames from 'classnames'

const empty = '/static/images/icon/empty_circle.svg'

export interface Props {
    text: string
}

const EmptyComponent: React.SFC<Props> = ({ text, image, className }) => {
    return (
        <div className={classnames('empty-container', className)}>
            <Avatar size={128} src={image || empty} />
            <p className="text">{text || '暂无内容'}</p>
        </div>
    )
}

export default EmptyComponent