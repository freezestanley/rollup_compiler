import React from 'react'
import Style from './index.less'
import {ButtonType } from './ButtonTypes'

const Button:React.FC<ButtonType> = (props:any) => {
    return (<div className={Style.Button}>{props.children}</div>)
}
export default Button