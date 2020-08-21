import { Spin } from 'antd'

const Loading = props => {
    return (
        <div className='loading-wrap'>
            <Spin tip={props.tip} size='large' className='loading-inner'></Spin>
        </div>
        // <div className='loading-box' {...props}>
        //     <img src={props.loading || loadingGif} alt='loading图片' />
        // </div>
    )
}

export default Loading