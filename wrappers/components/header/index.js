import React from 'react'
import { Link } from 'react-router'
import { prefixLink } from 'gatsby-helpers'

import css from './index.module.css'

export default function Header () {
  return (
    <header className={css.container}>
      <hgroup className={css.header}>
        <Link to={prefixLink('/')}>Bressain.com</Link>
      </hgroup>
    </header>
  )
}
