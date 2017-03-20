import React from 'react'
import { Link } from 'react-router'
import { prefixLink } from 'gatsby-helpers'

import '../css/global.css'
import '../css/markdown-styles.css'
import '../css/atom-one-dark.css'

import css from '../css/_template.module.css'

import { rhythm } from '../utils/typography'

module.exports = React.createClass({
  propTypes () {
    return {
      children: React.PropTypes.any,
    }
  },
  render () {
    return (
      <div>
        <div className={css.headerWrapper}>
          <div className={css.header}>
            <Link to={prefixLink('/')}>Bressain.com</Link>
          </div>
        </div>
        <div className={css.main}>
          {this.props.children}
        </div>
      </div>
    )
  }
})
