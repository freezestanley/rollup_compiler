import React from 'react'
import Style from './index.less'
import { ButtonType } from './ButtonTypes'
import a from './img/a.png'

const Button: React.FC<ButtonType> = (props: any) => {
  return (
    <div className={Style.Button}>
      {props.children}
      <img src={a} alt={'this is img'} />
      <div className={Style.asd}>asdfasdfa</div>
      <div className={Style.you}>77888888</div>
    </div>
  )
}
export default Button
