import { Popover } from 'antd'

const InfoMenu = ({ list }) => {
    return (
        <ul className='info-box'>
            {list.map(l => (
                <li key={l.id}>
                    <span className='name'>{l.name}</span>
                    <span className='info'>
                        <p>{l.info}</p>
                        {l.desc && <p className="desc">(周三居家办公日，请联系微信在线客服：<Popover trigger="hover" content={<div><img src="/static/images/weixin_vip_qrcode.png" width={160} alt="梅花网微信"/></div>}><a style={{color: '#168dd7'}}>meihua_vip</a></Popover>)</p>}
                    </span>
                </li>
            ))}
        </ul>
    )
}

export default InfoMenu