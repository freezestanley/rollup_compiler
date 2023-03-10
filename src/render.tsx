import { createRoot } from 'react-dom/client'
import React from 'react'
import Style from './index.less'
import { Button } from './components'

function App() {
  return (
    <div className={Style.global}>
      <Button>this is 123123</Button>
    </div>
  )
}

const app = document.getElementById('root')
if (app) {
  const root = createRoot(app)
  root.render(<App />)
}
