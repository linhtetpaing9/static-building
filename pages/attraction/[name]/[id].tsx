import React, { useState } from "react"
import Link from "next/link"
import Big from "big.js"
import config from "../../../customize/config"
import scrollToElement from "scroll-to-element"
import { formatCurrency, TravelCloudClient } from "travelcloud-antd"
import { Button, Col, Form, Icon, List, Popover, Result, Row, Tabs } from "antd"
import { PhotoGallery } from "../../../components/Utilities/photo-gallery"
import { ContactFormComponent } from "../../../components/Tour/tour-contact"
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton } from "react-share"
// import { FacebookShareButton, FacebookIcon, TwitterIcon, TwitterShareButton, WhatsappShareButton, WhatsappIcon } from "react-share"
import { IncDecInput } from "../../../components/Tour/tour-booking"
import { PriceBreakdown } from "../../../components/Utilities/price-breakdown"
import { cleanUrl } from "../../../components/Utilities/CommonFunction"

const Page = ({
  generic,
  windowSize,
  cart,
  openCart
}) => {

  const orderResult = cart && cart.order && cart.order.result
  const cartProducts = orderResult ? orderResult.products : null
  // const depositRequired = orderResult ? orderResult.deposit_required : 0
  const paymentRequired = orderResult ? orderResult.payment_required : 0

  if (!generic) {
    return (
      <Result
        status="404"
        title="Error: 404"
        subTitle="Sorry, page not found."
        extra={
          <Link passHref href="/attractions">
            <a>
              <Button type="primary">Check out other attractions</Button>
            </a>
          </Link>
        }
      />
    )
  }

  function updateCart() {
    cart.reset()
    const total = generic.options.reduce((acc, option) => {
      const key = generic.id + '/' + option.id
      const qty = options[key] || 0
      const orderQty = options[key] || 0
      const subTotal = Big(option.price).times(qty)
      acc.onAddToCartPayload.push({
        generic_id: generic.id,
        option_id: option.id,
        quantity: qty
      })
      return {
        totalPrice: acc.totalPrice.add(subTotal),
        totalQty: acc.totalQty + qty,
        onAddToCartPayload: acc.onAddToCartPayload,
        notSameAsOrder: acc.notSameAsOrder || qty !== orderQty,
        orderIsEmpty: acc.orderIsEmpty && orderQty === 0
      }
    }, {
      totalPrice: Big(0),
      totalQty: 0,
      onAddToCartPayload: [],
      notSameAsOrder: false,
      orderIsEmpty: true
    })
    if (total.totalQty === 0) return null
    addToCart(generic, total.onAddToCartPayload)
  }

  function addToCart(generic, form) {
    for (var i in form) {
      cart.addGeneric(generic, form[i])
    }
  }

  const optionsMapped = generic.options.reduce((acc, cur) => {
    acc[`${generic.id}/${cur.id}`] = 0
    return acc
  }, [])

  const [options, setOptions] = useState(optionsMapped)
  const [currentTab, setCurrentTab] = useState('what-to-expect')
  const [contactFormVisible, setContactFormVisible] = useState(false)
  const sharingUrl = `${config.domain}/tour/${cleanUrl(generic.name)}/${generic.id}`

  return (
    <div id="top" className="product-page">
      <PhotoGallery
        photos={generic.photos}
        windowWidth={windowSize.width}
      />

      <div className="wrap">
        <div className="tour-content">

          <div className="pad-top">
            <h1 className="product-name">{generic.name}</h1>
            <h3 className="product-name-alt">{generic.attributes.short_desc || ""}</h3>
          </div>

          <Tabs
            className="tabs"
            activeKey={currentTab}
            onChange={(e) => {
              setCurrentTab(e)
              scrollToElement('.tabs', {
                offset: 0,
                ease: 'in-out-bounce',
                duration: 300
              })
            }}
          >
            <Tabs.TabPane tab="WHAT TO EXPECT" key="what-to-expect">
              <div className="innerHTML" dangerouslySetInnerHTML={{ __html: generic.description }} />
              <Button size="large" className="enquire-btn" key="enquire" onClick={() => setContactFormVisible(true)}>Enquire</Button>
            </Tabs.TabPane>
            <Tabs.TabPane tab="PRICE GUIDE" key="price">
              <List
                className="options-list"
                dataSource={generic.options}
                renderItem={(option: any) => {
                  const key = generic.id + '/' + option.id
                  const qty = cartProducts
                    ? cartProducts.find(prd => prd.product_id == key)?.quantity || 0
                    : 0
                  return (
                    <List.Item key={key}>
                      <Row gutter={40} style={{ fontSize: "1.2em" }}>
                        <Col span={16}>
                          {option.name}
                        </Col>
                        <Col span={8} className="option-price">
                          <div>
                            <strong>{formatCurrency(option.price)}</strong>
                            {option.stock_type === 'Counter' && option.stock === '0'
                              ? <em style={{ color: 'red' }}>Sold out</em>
                              : <div className="room">
                                <Form.Item>
                                  <IncDecInput
                                    min={0}
                                    max={option.stock_type === 'Counter' ? option.stock : 99}
                                    value={qty}
                                    onChange={(newVal) => {
                                      let curOptions = options
                                      curOptions[key] = newVal
                                      setOptions(curOptions)
                                      updateCart()
                                    }}
                                  />
                                </Form.Item>
                              </div>
                            }
                          </div>
                        </Col>
                      </Row>
                    </List.Item>
                  )
                }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 20 }}>
                <Popover
                  content={<PriceBreakdown cartProducts={cartProducts} />}
                  title="Price Breakdown"
                  className="price-breakdown-popover"
                  placement="topRight"
                  trigger="click"
                >
                  <a style={{ fontSize: "1.2em", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                    Total:
                  &nbsp;<strong>{formatCurrency(paymentRequired)}</strong>
                    <Icon type="info-circle" style={{ fontSize: 12, marginLeft: 12 }} />
                  </a>
                </Popover>
              </div>

              <div className="steps-action">
                <Button onClick={() => openCart()} style={{ marginRight: 10 }}>Show Cart</Button>
                <Link href="/checkout"><a><Button type="primary">Checkout</Button></a></Link>
              </div>
            </Tabs.TabPane>
          </Tabs>

          <ContactFormComponent
            subject={`Enquiry on ${generic.name}`}
            emailAdmins={[config.email]}
            useModal
            visible={contactFormVisible}
            closeModal={() => setContactFormVisible(false)}
          />

          <div className="center pad-y">
            <h3 id="share-social">Share on</h3>
            <FacebookShareButton url={sharingUrl}>
              {/* <FacebookIcon size={32} round={true} /> */}
            </FacebookShareButton>
            <span>&nbsp;</span>
            <TwitterShareButton url={sharingUrl} title={generic.name}>
              {/* <TwitterIcon size={32} round={true} /> */}
            </TwitterShareButton>
            <span>&nbsp;</span>
            <WhatsappShareButton url={sharingUrl} title={generic.name}>
              {/* <WhatsappIcon size={32} round={true} /> */}
            </WhatsappShareButton>
          </div>
        </div>
      </div>
    </div>
  )
}

Page.getInitialProps = async context => {
  const client = new TravelCloudClient(config.tcUser)
  const query = context.query
  const generic = (await client.generic({ id: query.id })).result
  return { generic }
}

export default Page