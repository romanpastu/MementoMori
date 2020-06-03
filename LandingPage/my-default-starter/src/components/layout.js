/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql } from "gatsby"
import dashboardImage from "../images/dashboard.png"
import Header from "./header"
import "./layout2.css"
import { FaColumns , FaChartLine, FaMoneyBill} from 'react-icons/fa';

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <>
      {/* <Header siteTitle={data.site.siteMetadata.title} />
      <div
        style={{
          margin: `0 auto`,
          maxWidth: 960,
          padding: `0 1.0875rem 1.45rem`,
        }}
      >
        <main>{children}</main>
        <footer>
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.org">Gatsby</a>
        </footer>
      </div> */}
      <div id="PageContainer">
        <main>
          <section className="section1">
            <div className="subsection1">
              <div className="section1Content">
                <p className="logo">MementoMori</p>
                <p className="h1Section1">Start tracking your life with MementoMori</p>
                <p className="pSection1">Changed the way of perceiving life for thousands of people</p>
                <div className="buttonCenterSection1">
                  <a href="http://app.mementomori.io/login" className="buttonSection1">Try the app</a>
                </div>
                <div className="bigTextSection1Container">
                  <div className="bigTextSection1">
                    <p className="pSection1Big"> Try mementomori now, and start improving your life by tracking it. Its free and easy, it will change how you view the time</p>
                  </div>
                </div>
                <div className="centererContainer">
                  <div className="imgContainerSection1">
                    <img className="imgSection1" src={dashboardImage}></img>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="section2">
            <div className="propertiesGrid">
              <div className="boxContainer">
                <div className="icon"><FaColumns className="faIcon"/></div>
                <div><p className="gridTitle">Easy to use interface</p></div>
                <div><p className="gridText">The interface has been designed to provide the biggest amount of information in a blink of an eye. Get an overview of your whole life in a single page.</p></div>
              </div>
              <div className="boxContainer">
                <div className="icon"><FaChartLine className="faIcon"/></div>
                <div><p className="gridTitle">Statistical analysis</p></div>
                <div><p className="gridText">All your data can be used to generate statistical reports. This will allow you to obtain a peek on whats going on on your life at certain moments, and take decisions based on that.</p></div>
              </div>
              <div className="boxContainer">
                <div className="icon"><FaMoneyBill className="faIcon"/></div>
                <div><p className="gridTitle">Free of charge</p></div>
                <div><p className="gridText">All the data is provided to you free of charge, because we want you to help to improve your life</p></div>
              </div>
            </div>
          </section>
        </main>
      </div>

    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
