import React from "react"
import { Row, Col, Layout, Divider } from "antd"
import { extractSquareBracket } from "../Utilities/CommonFunction"
import Link from "next/link"


export function SiteFooter({ footerContent, windowSize }) {
  const icons = [
    {
      logo: 'call-logo.png',
      width: 31,
      height: 31,
      col: 6
    },
    {
      logo: 'email-us-logo.png',
      width: 35,
      height: 28,
      col: 10
    },
    {
      logo: 'home-logo.png',
      width: 35,
      height: 33,
      col: 8
    },
  ]
  const [terms, termsLink] = extractSquareBracket(footerContent.attributes.terms)
  const [policy, policyLink] = extractSquareBracket(footerContent.attributes.policy)

  return (
    <Layout.Footer>
      <section id="top-footer" className="pad-x-30">
        <div className="wrap pad-y footer-container p-x-10">
          <Row className={windowSize.width < 992 ? "wrap-xs" : ""}>
            <Col lg={7} className={windowSize.width < 992 ? "m-b-30" : ""}>
              <img width={275} src={footerContent.photo_url} />
            </Col>
            <Col lg={17}>
              <Row>
                {
                  footerContent.photos.map((photo, index) => {
                    const [value, link] = extractSquareBracket(photo.desc)
                    const [title, key] = extractSquareBracket(photo.title)
                    const current = icons[index];
                    const googleMapLink = `https://maps.google.com/?q=${link}`;
                    const isAddress = key != null && key.includes("address");
                    return (
                      <Col className={windowSize.width < 992 ? "m-b-30" : ""} key={`photo-logo-${index}`} lg={current.col}>
                        <div className="footer-address-box">
                          <img width={current.width} height={current.height} src={`/img/${current.logo}`} />
                          <div className="p-l-13 p-t-3">
                            <h3 className="fs-19 color-primary font-secondary">{title}</h3>
                            <Link href={isAddress ? googleMapLink : link}>
                              <a target={isAddress ? "_blank" : ""} className="fs-16 font-secondary text-black">{value}</a>
                            </Link>
                          </div>
                        </div>
                      </Col>
                    )
                  })
                }
              </Row>
            </Col>
          </Row>
          <Divider />
          <Row>
            <Col lg={7}>
              <h3 className={`footer-text m-b-15 text-black ${windowSize.width < 992 ? "text-center" : "m-l-15"}`}>Members of</h3>
              <Row gutter={16} type="flex" justify="center">
                <Col lg={9}>
                  <img src="/img/natas-logo.png" />
                </Col>
                <Col lg={9}>
                  <img src="/img/tourism-logo.png" />
                </Col>
              </Row>
            </Col>
            <Col lg={9}>
              <h3 className={`footer-text text-black m-b-25 ${windowSize.width < 992 ? "text-center m-t-30" : ""}`}>Payment Supported</h3>
              <Row type="flex" gutter={13} justify={windowSize.width < 992 ? "center" : "start"}>
                <Col>
                  <img className="m-r-20" src="/img/paynow-logo.png" />
                </Col>
                <Col className="text-center">
                  <img src="/img/paypal-logo.png" />
                </Col>
              </Row>
            </Col>
            <Col lg={8}>
              <h3 className={`footer-text text-black m-b-25 ${windowSize.width < 992 ? "text-center m-t-30" : ""}`}>Useful links</h3>
              <div className={windowSize.width < 992 ? "text-center" : ""}>
                <Row>
                  <Link href={termsLink}>
                    <a className="font-medium fs-16">{terms}</a>
                  </Link>
                  <Divider type="vertical" className="bg-black" />
                  <Link href={policyLink}>
                    <a className="font-medium m-l-8 fs-16 text-black">{policy}</a >
                  </Link>
                </Row>
              </div>
            </Col>
          </Row>
        </div>
      </section>
      <section id="bottom-footer">
        <div className="m-t-10" dangerouslySetInnerHTML={{ __html: footerContent.content }}></div>
      </section>
    </Layout.Footer>
  )
}