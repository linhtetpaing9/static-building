import React from 'react'
import App from 'next/app'
import { loadGetInitialProps } from 'next-server/dist/lib/utils'
import WrappedLayout from '../components/Layouts/WrappedLayout'
import * as NProgress from 'nprogress/nprogress'
import Router from 'next/router'
import Rollbar from "rollbar"
import '../customize/styles.less';
import { setupUserback } from 'travelcloud-antd'
import config from '../customize/config'
import { getLayout } from '../components/Utilities/CommonFunction'

Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

class MyApp extends App<any> {
  state = {
    // error
    hasError: false
  }

  static async getInitialProps({ Component, ctx }) {
    const pageProps = await loadGetInitialProps(Component, ctx)
    const content = await getLayout('/api/layout');
    return { pageProps, content }

  }

  componentDidMount(){
    setupUserback()
  }

  componentDidCatch(error) {
    // Display fallback UI
    this.setState({ hasError: true })
    // https://github.com/zeit/next.js/issues/5070
    const rollbar = new Rollbar({
      enabled: location != null && location.hostname !== "localhost",
      accessToken: config.rollbarAccessToken,
      captureUncaught: false,
      captureUnhandledRejections: false,
      payload: {
        tcUser: config.tcUser
      }
    })
    rollbar.error(error)
  }

  render() {
    const { Component, pageProps, content } = this.props

    return (
      <WrappedLayout content={content} hasError={this.state.hasError} pageProps={pageProps}>
        {Component}
      </WrappedLayout>
    )
  }
}

export default MyApp