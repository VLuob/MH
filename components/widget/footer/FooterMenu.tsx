const FooterMenu = ({ title, list }) => {
    return (
        <div className='footer-box'>
            <h2>{title}</h2>
            <ul className='footer-menu'>
                {list.map(l => (
                    <li key={l.id}>
                        <a href={l.link} className='name' target='_blank'>{l.name}</a>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default FooterMenu