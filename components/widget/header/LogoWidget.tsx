import { Link } from '@routes'

const LogoWidget = ({ img }) => {
    return (
        <div className='logo-box'>
            <a href='/'>
                <img src={img} alt='梅花logo' />
            </a>
        </div>
    )
}

export default LogoWidget