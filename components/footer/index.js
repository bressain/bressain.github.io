import React from 'react'
import { Link } from 'react-router'

import css from './index.module.css'
import { GithubIcon, LinkedInIcon, RssIcon, TwitterIcon } from '../images'

export default function () {
  return (
    <footer className={css.container}>
      <div className={css.footer}>
        <div className={css.icons}>
          <Link to={'/pages/about/'}>
            <img className={css.avatar} src="https://www.gravatar.com/avatar/cd238df2a13bd0593a5be2ad19834c01?s=60" alt="about me" />
          </Link>
          <a href="https://twitter.com/bressain">
            <TwitterIcon className={css.social} />
          </a>
          <a href="https://www.linkedin.com/in/bressaindinkelman/">
            <LinkedInIcon className={css.social} />
          </a>
          <a href="https://www.github.com/bressain/">
            <GithubIcon className={css.social} />
          </a>
          <a href="/atom.xml">
            <RssIcon className={css.social} />
          </a>
        </div>
        <div className={css['license-container']}>
          <a className={css['cc-badge']} rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/">
            <img alt="Creative Commons License" style={{ borderWidth: 0 }} src="https://i.creativecommons.org/l/by-nc/4.0/88x31.png" />
          </a>
          <div className={css.licenses}>
            <a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/">Articles licensed under CC BY-NC 4.0</a>
            <br />
            <a rel="license" href="https://opensource.org/licenses/MIT">Code licensed under MIT</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
