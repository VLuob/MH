
const AuthorAuthenticationIcon = (props) => {
  const { style, hide, ...rest } = props
  const newStyle = {
    width: '16px', 
    height: '16px',
    position: 'relative', 
    top: '-2px',
    ...style,
  }
  return (
    null
    // hide ? null : <img src={'/static/images/icon/authentication.svg'} {...rest} style={newStyle}/>
  )
}

export default AuthorAuthenticationIcon