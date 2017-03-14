import React from 'react'
import { Link } from 'react-router'
import { prefixLink } from 'gatsby-helpers'
import Helmet from "react-helmet"
import { config } from 'config'

export default class Index extends React.Component {
  renderPage(page) {
    return <li><Link to={page.path}>{page.data.title}</Link></li>
  }
  renderPages() {
    return this.props.route.pages.map(this.renderPage)
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
        <h1>
          Hi people
        </h1>
        <p>Welcome to your new Gatsby site</p>
        <h2>Below are some pages showing different capabilities built-in to Gatsby</h2>
        <ul>
        {this.renderPages()}
        </ul>
        <h3>Supported file types</h3>
        <ul>
          <li>
            <Link to={prefixLink('/markdown/')}>Markdown</Link>
          </li>
          <li>
            <Link to={prefixLink('/react/')}>JSX (React components)</Link>
          </li>
          <li>
            <Link to={prefixLink('/html/')}>HTML</Link>
          </li>
          <li>
            <Link to={prefixLink('/json/')}>JSON</Link>
          </li>
        </ul>
        <h3>Supported CSS processors</h3>
        <ul>
          <li>
            <Link to={prefixLink('/postcss/')}>PostCSS</Link>
          </li>
          <li>
            <Link to={prefixLink('/css-modules/')}>CSS Modules</Link>
          </li>
        </ul>
      </div>
    )
  }
}
