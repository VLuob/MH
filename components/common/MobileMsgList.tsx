import { Icon } from 'antd'

const MobileMsgList = ({ list, onReply }) => (
    <ul className='mobile-msg-list'>
        <li>
            <div className='info-heading'>
                <Icon type='sound' theme='filled' className='info-head' />
                {/* <img src='' alt='头像'/> */}
                <span className='info'>Edison  私信了您 · 2019-04-02 13:42</span>
                <span className='operation'>操作</span>
            </div>
            <div className='info-content'>
                您发布的文章<a href='/'>《营销者的策略篇》</a>审核未通过！操作原因：文章中包含敏感词汇建议修改
            </div>
        </li>
        <li>
            <div className='info-heading'>
                <Icon type='sound' theme='filled' className='info-head' />
                {/* <img src='' alt='头像'/> */}
                <span className='info'>Edison  私信了您 · 2019-04-02 13:42</span>
                <span className='operation' onClick={onReply}>查看</span>
            </div>
            <div className='info-content'>
                您发布的文章<a href='/'>《营销者的策略篇》</a>审核未通过！操作原因：文章中包含敏感词汇建议修改
            </div>
        </li>
    </ul>
)

export default MobileMsgList