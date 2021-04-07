import { Col, Row } from "antd"
import React from "react"

const SellingPoints = ({ sellingpoints }) => {
  return (
    <section id="selling-points">
      <div style={{
        backgroundImage: `url("/img/selling_point_bg.png")`,
        minHeight: 375,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}>
        <div className="wrap p-t-70 p-x-10">
          <h1 className="content-title">{sellingpoints.name}</h1>
          <div className="text-center m-t-50">
            <Row>
              {
                sellingpoints.photos.map((photo, index) => (
                  <Col key={`photo_${index}`} md={{ span: 5, offset: 2 }} lg={{ span: 4, offset: index == 0 ? 0 : 1 }} >
                    <img src={photo.url.replace(".jp", "_o.jp")} />
                    <div className="selling-point-text">
                      <h4>{photo.title}</h4>
                      <p>{photo.desc}</p>
                    </div>
                  </Col>
                ))
              }
            </Row>
            {/* <Row type="flex" justify={windowSize.width <= 360 ? "center": "space-between"}>
              {
                sellingpoints.photos.map((photo, index) => (
                  <div key={`photo_${index}`}>
                    <img src={photo.url.replace(".jp", "_o.jp")} />
                    <div className="selling-point-text">
                      <h4>{photo.title}</h4>
                      <p>{photo.desc}</p>
                    </div>
                  </div>
                ))
              }
            </Row> */}
          </div>
        </div>
      </div>
      <div style={{
        backgroundImage: `url("/img/anniversay-cloud.jpg")`,
        minHeight: 365,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }} />
    </section>
  )
}
export default SellingPoints