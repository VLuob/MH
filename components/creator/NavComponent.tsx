export interface Props {
    title: string
}

const NavComponent: React.SFC<Props> = ({
    title
}) => {
    return (
        <div className='nav-component'>
            <div className='nav-title'>{title}</div>
        </div>
    )
}

export default NavComponent