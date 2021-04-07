import React from 'react'
import { TravelCloudClient } from 'travelcloud-antd'
import config from '../../customize/config'

const TermsOfUse = ({ terms }) => {
  return <div id="terms-of-use" className="wrap p-30" dangerouslySetInnerHTML={{__html: terms.content }}></div>
}

TermsOfUse.getInitialProps = async () => {
  const client = new TravelCloudClient(config.tcUser)
  const terms = (await client.documents(Object.assign({ "code": "terms-of-use" }))).result[0]
  return { terms };
}

export default TermsOfUse;