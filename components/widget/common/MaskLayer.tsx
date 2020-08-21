const MaskLayer = ({ className, style }) => {
    const combineClassName = className ? `mask-layer ${className}` : `mask-layer`

    return (
        <div className={combineClassName} style={style}></div>
    )
}

export default MaskLayer