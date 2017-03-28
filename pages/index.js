import React from 'react'
import { Link } from 'react-router'
import { prefixLink } from 'gatsby-helpers'
import Helmet from "react-helmet"
import { config } from 'config'

import css from './index.module.css'
import Footer from '../components/footer'
import * as pathUtil from '../utils/pathUtil'
import * as textUtil from '../utils/textUtil'

export default class Index extends React.Component {
  renderPage(page) {
    return (
      <li key={page.data.title} className={css.post}>
        <h2><Link to={page.path}>{page.data.title}</Link></h2>
        <div className={css['post-preview']} dangerouslySetInnerHTML={{ __html: textUtil.chopToBreak(page.data.body) }}/>
        <div className={css['read-more']}><Link to={page.path}>Read more >></Link></div>
      </li>
    )
  }
  renderPages() {
    const pages = pathUtil.getAllBlogPosts(this.props.route.pages).reverse().slice(0, 5)
    return (
      <ul className={css.posts}>
        {pages.map(this.renderPage)}
      </ul>
    )
  }
  render () {
    return (
      <div>
        <Helmet
          title={config.siteTitle}
          meta={[
            {"name": "description", "content": "Blog and other things from Bressain Dinkelman"},
            {"name": "keywords", "content": "Bressain,Dinkelman,software development,blog"},
          ]}
        />
        <header className={css['header-container']}>
          <hgroup className={css.header}>
            <h1 className={css.title}><Link to={prefixLink('/pages/about/')}>Bressain Dinkelman</Link></h1>
          </hgroup>
        </header>
        <section className={css.container}>
          {this.renderPages()}
        </section>
        <Footer />
      </div>
    )
  }
}
