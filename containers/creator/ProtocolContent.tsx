import { Component } from 'react'

interface Props {
    
}

export default class ProtocolContent extends Component<Props> {
    render() {
        return (
            <div className='protocol-content'>
                <h2 className='protocol-title'>
                    梅花网机构创作者认领协议
                </h2>
                <div className='protocol-substance'>
                    <h3 className='protocol-subtitle'>您需要保证：</h3>
                    <ul className='protocol-list'>
                        <li>1  您能够代表认领的服务商公司，并获得公司的授权。</li>
                        <li>2  梅花网营销服务商收录各个服务商的城市分支机构和总公司，请确认您所认领的机构所在城市。</li>
                    </ul>
                    <h3 className='protocol-subtitle'>另外：</h3>
                    <ul className='protocol-list'>
                        <li>1  申请提交后，我们会通过电话和您进行有关信息的核实，请确保联系方式准确。</li>
                        <li>2  梅花网有权拒绝不正当和不符合事实的营销服务商认领申请。</li>
                        <li>3  梅花网通常将在1-3个工作日内完成审核。</li>
                    </ul>
                </div>
            </div>
        )
    }
}