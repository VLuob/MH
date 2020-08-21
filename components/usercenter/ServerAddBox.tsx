import { Icon } from 'antd'

const ServerAddBox = ({ onClick }) => {
    return (
        <div className='server-box' onClick={onClick}>
            <div className='add-box'>
                <Icon type='plus-circle' className='add-icon' />
                <span className='add-text'>添加</span>
                <span className='add-meta'>添加新的机构服务</span>
            </div>
        </div>
    )
}

export default ServerAddBox