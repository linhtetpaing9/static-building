import React from 'react'
import Head from 'next/head'
import config from '../../customize/config'
import { TravelCloudClient } from 'travelcloud-antd'
import { Button } from 'antd'

export default class Terms extends React.PureComponent<any> {
  static async getInitialProps() {
    const client = new TravelCloudClient(config.tcUser)
    const terms = (await client.documents({ code: 'terms-and-conditions' })).result[0]
    return { terms }
  }
  render() {
    return (
      <section id="attractions">
        <Head>
          <title>{config.defaultTitle}</title>
        </Head>
        <div className="wrap">
          <h2 dangerouslySetInnerHTML={{ __html: this.props.terms.name }} />
          <div dangerouslySetInnerHTML={{ __html: this.props.terms.content }} />
          {this.props.adminMode && <Button className="edit-btn" href={`https://${config.tcUser}.travelcloud.app/admin/en/site/document/%20/document/edit~2`} target="_blank">Edit </Button>}
        </div>
      </section>
    )
  }
}