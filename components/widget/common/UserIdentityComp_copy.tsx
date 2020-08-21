import { Tag } from 'antd'
import ReactTooltip from 'react-tooltip'
import { AuthorType } from '@base/enums'


export interface Props {
    isPerson: boolean
    currentType: number
    style: object
    noTip: boolean
}

/**
 * 自定义Icon
 * @param src 
 * @param width
 * @param height
 * @param fill
 * @param className
 * @param style
 */
const UserIdentityComp: React.SFC<Props> = ({
    currentType,
    style,
    noTip,
}) => {
    let name = `个人`
    let tagColor = `#FF9700`
    let color = `#FF9700`
    let background = `rgba(255, 151, 0, 0.2)`

    switch(currentType) {
        case AuthorType.PERSONAL:
            name = `个人`
            color = `#FF9700`
            tagColor = `#FF9700`
            background = `rgba(255, 151, 0, 0.2)`

            break
        case AuthorType.BRANDER:
            name = `品牌主`
            color = `#FE2A06`
            tagColor = `#FE2A06`
            background = `rgba(254, 42, 6, 0.2)`

            break
        case AuthorType.SERVER:
            name = `服务商`
            color = `#29B28B`
            tagColor = `#29B28B`
            background = `rgba(41, 178, 139, 0.2)`

            break
        case AuthorType.EDITOR:
            name = `编辑`
            color = `#168DD7`
            tagColor = `#168DD7`
            background = `rgba(22, 141, 215, 0.2)`

            break
    }

    const tagStyle = style || {}

    return (
        <div className='user-identity' style={{ display: 'inline-block' }}>
            <Tag 
                color={tagColor} 
                style={{ 
                    borderRadius: `2px`, 
                    marginRight: '0', 
                    background, color, 
                    padding: '1px 5px', 
                    fontSize: '12px', 
                    height: '16px',
                    lineHeight: '1',
                    ...tagStyle,
                }} 
                data-for={`user-identity-tip`} 
                data-tip={noTip ? '' : `${name}创作者`}
            >
                {name}
            </Tag>
            {!noTip && <ReactTooltip id={`user-identity-tip`} effect='solid' place='top' />}
        </div>
    )
}

export default UserIdentityComp