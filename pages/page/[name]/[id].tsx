import { Col, Row } from "antd";
import React from "react";
import { TravelCloudClient } from "travelcloud-antd";
import { Banner } from "../../../components/Utilities/banner"
import config from "../../../customize/config";

const Page = ({ document }) => {
  return (
    <div id="page" style={{ backgroundColor: '#f7f7f7' }}>
      <Banner backgroundImageUrl={document.photo_url} />
      <div className="wrap pad-y p-t-50">
        <Row>
          <Col span={16} offset={4}>
            <h1 className="page-content-title">{document.name}</h1>
            <div className="page-content" dangerouslySetInnerHTML={{ __html: document.content }} />
          </Col>
        </Row>
      </div>
    </div>
  )

}
Page.getInitialProps = async context => {
  const query = context.query;
  const client = new TravelCloudClient(config.tcUser)
  const document = (await client.document({ id: query.id })).result
  return { document }
}
export default Page