import React from 'react'
import { TravelCloudClient } from 'travelcloud-antd'
import config from '../../customize/config'

const PrivacyPolicy = ({ policy }) => {
  return <div id="privacy-policy" className="wrap p-30" dangerouslySetInnerHTML={{ __html: policy.content }}></div>
}

PrivacyPolicy.getInitialProps = async () => {
  const client = new TravelCloudClient(config.tcUser)
  const policy = (await client.documents(Object.assign({ "code": "privacy-policy" }))).result[0]
  return { policy };
}

export default PrivacyPolicy;