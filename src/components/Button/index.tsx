import React from 'react'
import Style from './index.less'
import { ButtonType } from './ButtonTypes'
import aa from './a.png'

const Button: React.FC<ButtonType> = (props: any) => {
  return (
    <div className={Style.Button}>
      {props.children}
      <img src={aa} alt={'111'} />
    </div>
  )
}
export default Button
