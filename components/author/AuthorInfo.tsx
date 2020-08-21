import classnames from 'classnames'
import { Avatar, Tag, Button } from 'antd'
import { AuthorType } from '@base/enums'
import AuthorIdentity from '@components/widget/common/UserIdentityComp'


const AuthorInfo = ({ 
  authorName, 
  authorCode, 
  authorAvatar, 
  authorFollowed, 
  type, 
  editionType,
  avatarSize, 
  onFollow, 
  onEnquiry,
}) => {

  const showEnquiry = [AuthorType.PERSONAL, AuthorType.SERVER].includes(type)

    return (
      <div className="author-info">
        <a href={`/author/${authorCode}`} target="_blank" title={authorName}>
          <Avatar icon="user" src={authorAvatar} size={avatarSize || 40} />
        </a>
        <div className="info">
          <div className="name"><a href={`/author/${authorCode}`} target="_blank">{authorName}</a> </div>
          <div className="type">
            <AuthorIdentity currentType={type} editionType={editionType} />
            {/* {onFollow && <span className={classnames('follow', {followed: !!authorFollowed})} onClick={onFollow}>{!!authorFollowed ? '已关注' : '+ 关注'}</span>} */}
            {/* <span className="follow" onClick={onEnquiry}>询价</span> */}
          </div>
        </div>
        <div className="btns">
          <span 
            className={classnames('btn-follow', {followed: !!authorFollowed})}
            onClick={onFollow}
          >
            {!!authorFollowed ? '已关注' : '+ 关注'}
          </span>
          {showEnquiry && <Button type="primary" className="btn-enquiry" onClick={onEnquiry}>询价</Button>}
        </div>
      </div>
    )
}

export default AuthorInfo