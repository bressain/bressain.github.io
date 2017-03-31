import React from 'react'
import { Link } from 'react-router'

import css from './index.module.css'

export default function Header () {
  return (
    <header className={css.container}>
      <hgroup className={css.header}>
        <Link to={'/'}>Bressain.com</Link>
      </hgroup>
    </header>
  )
}
