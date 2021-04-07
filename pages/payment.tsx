import React from 'react'
import Big from 'big.js'
import config from '../customize/config'
import { TravelCloudClient, redirectToPayment, formatCurrency } from 'travelcloud-antd'
import { Row, Col, Card, Button, Icon, Avatar, Modal } from 'antd'
import { Order } from '../components/Payment/Order'
import { priceDisplay } from '../components/Utilities/CommonFunction'

export default class extends React.PureComponent<any, any> {
  client = new TravelCloudClient(config.tcUser)

  state: any = {
    loading: true,
    noRef: false,
    order: null
  }

  async componentDidMount() {
    window.scrollTo(0, 0)
    const ref = (new URL(location.href)).searchParams.get('ref')
    if (ref == null) {
      this.setState({
        loading: false,
        noRef: true
      })
    } else {
      const order = await this.client.order({ ref })
      this.setState({
        loading: false,
        order
      })
    }
  }

  async payWithAccountCredit() {
    const ref = (new URL(location.href)).searchParams.get('ref')
    if (ref == null) {
      this.setState({
        loading: false,
        noRef: true
      })
      return
    }
    this.setState({
      loading: true
    })
    await this.props.cart.payOrderWithCustomerCredit(ref)
    const order = await this.client.order({ref})
    this.setState({
      loading: false,
      order
    })
  }

  render() {
    // const cart = this.props.cart
    // const baseDeposit = !!this.state.order && this.state.order.result.deposit_required
    // const basePrice = !!this.state.order && this.state.order.result.payment_required

    if (this.state.loading) {
      return (
        <div className="wrap pad-y">
          <Card loading={true} style={{border: 0}} />
        </div>
      )
    }

    if (this.state.noRef || (this.state.order != null && this.state.order.result == null)) {
      return (
        <div className="wrap pad-y">
          <h1>Unable to load order</h1>
        </div>
      )
    }

    const customer = this.props.customer && this.props.customer.result
    const bigAccountBalance = customer == null 
      ? Big(0) 
      : this.props.customer.result.payments
          .reduce((acc, payment) => acc.plus(payment.amount), Big(0))
          .times(-1)
    // const invoice = this.state.order.result.ref
    
    return (
      <section className="grey pad-y">
        <div id="payment">
          <Row type="flex" justify="space-between" gutter={{ lg: 48 }}>
            <Col
              id="checkout"
              xs={{ span: 24, order: 2 }} 
              sm={{ span: 24, order: 2 }} 
              md={24}
              lg={{ span: 14, order: 1 }}
            >
              <section id="order-details">
                <Order order={this.state.order.result} />
              </section>
            </Col>

            {this.state.order.result.order_status === 'Canceled' &&
              <Col 
                xs={{ span: 24, order: 1 }} 
                sm={{ span: 24, order: 1 }} 
                md={{ span: 24, order: 1 }} 
                lg={10}
              >
                <h1>Your order has expired</h1>
              </Col>
            }

            {this.state.order.result.order_status === 'Invoice' &&
              <Col 
                xs={{ span: 24, order: 1 }} 
                sm={{ span: 24, order: 1 }} 
                md={{ span: 24, order: 1 }} 
                lg={10}
              >
                <h1>Your payment has been received</h1>
                <p>Thank you for your order! Our team is processing your order.</p>
                <p>Please check your email for a copy of the invoice.</p>
              </Col>
            }
            
            {this.state.order.result.order_status === "Quotation" &&
              <Col xs={24} md={10} style={{ marginBottom: 40 }}>
                <h1>Select payment method</h1>
                {customer !== null &&
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", borderBottom: "1px solid #e8e8e8" }}>
                    <div>
                      <strong>Account Credit</strong>
                      <div>Balance ${bigAccountBalance.toFixed(2)}</div>
                    </div>
                    <Button
                      size="large"
                      type="primary"
                      style={{ flexShrink: 0 }}
                      onClick={() => this.payWithAccountCredit()}
                    >
                      {parseInt(this.state.order.result.deposit_required) < parseInt(this.state.order.result.payment_required)
                        ? "Pay Deposit of " + priceDisplay({ value: this.state.order.result.deposit_required, showZeroCents: false })
                        : "Pay " + priceDisplay({ value: this.state.order.result.payment_required, showZeroCents: false })
                      }
                      <Icon type="right" />
                    </Button>
                  </div>
                }
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", borderBottom: "1px solid #e8e8e8" }}>
                  <img src="/img/paynow.png" style={{ width: 120 }} />
                  <Button
                    size="large"
                    type="primary"
                    onClick={() => this.setState({ visible: true })}
                    style={{ flexShrink: 0 }}
                  >
                    {parseInt(this.state.order.result.deposit_required) < parseInt(this.state.order.result.payment_required)
                      ? "Pay Deposit of " + priceDisplay({ value: this.state.order.result.deposit_required, showZeroCents: false })
                      : "Pay " + priceDisplay({ value: this.state.order.result.payment_required, showZeroCents: false })
                    }
                    <Icon type="right" />
                  </Button>
                  <Modal 
                    visible={this.state.visible}
                    onCancel={() => this.setState({ visible: false })}
                    closable={false}
                    title={
                      <Row>
                        <Col span={20}>
                          PAYNOW
                        </Col>
                        <Col span={4} style={{ textAlign: "right" }}>
                          <a onClick={() => this.setState({ visible: false })}><Icon type="close" /></a>
                        </Col>
                      </Row>
                    }
                    footer={false}
                  >
                    <img src="/img/qr-code.png" width={300} /><br /><br />
                    <p><strong>PayNow</strong> to our <span style={{ textDecoration: "underline" }}>UEN Number</span>: <strong className="color-primary">{config.payNowUEN}</strong></p>
                    <p>Please include your order number <strong className="color-primary">{this.state.order.result.ref || "XXXXX"}</strong> in the reference note.</p>
                    <p>We will contact you asap once the transaction has been verified. If payment is not received, your order will be auto-cancelled within 20 mins from the time of booking.</p>
                    <p>If you need further assistance: kindly contact us at <a href={`tel:${config.phone.replace(/[^0-9]/g, '')}`}>{config.phone}</a></p>
                  </Modal>
                </div>
                {this.state.order.result._payment_groups.map((paymentGroup, paymentGroupIndex) =>
                  paymentGroup.options.map((option, optionIndex) => {
                    const deposit = Big(option.deposit_required)
                    const fullfee = Big(option.payment_required)
                    let fee = Big(option.payment_required).minus(paymentGroup.payment_required)
                    let amt = option.payment_required
                    let grpAmt = paymentGroup.payment_required
                    let payBtnText = "Pay"
                    if (deposit.lt(fullfee)) {
                      fee = Big(option.deposit_required).minus(paymentGroup.deposit_required)
                      amt = option.deposit_required
                      grpAmt = paymentGroup.deposit_required
                      payBtnText = "Pay Deposit of"
                    }
                    return (
                      <div key={paymentGroupIndex + "/" + optionIndex} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", borderBottom: "1px solid #e8e8e8" }}>
                        <div>
                          {option.source.includes('paypal') && <img src="/img/paypal.png" style={{ width: 120 }} />}
                          {Big(amt).gt(grpAmt) && 
                            <div style={{ fontStyle: "italic" }}>
                              (Inclusive of {formatCurrency(fee)} processing fee)
                            </div>
                          }
                          {Big(amt).lt(grpAmt) && 
                            <div style={{ fontStyle: "italic" }}>
                              (Inclusive of {formatCurrency(fee)} discount)
                            </div>
                          }
                        </div>
                        <Button
                          size="large"
                          type="primary"
                          style={{ flexShrink: 0 }}
                          onClick={() =>
                            redirectToPayment({
                              orderRef: this.state.order.result.ref,
                              tcUser: config.tcUser,
                              paymentProcessor: option.source,
                              successPage: "payment-successful",
                              failurePage: "payment-failed",
                              amount: amt
                            })
                          }
                        >
                          {payBtnText} {formatCurrency(amt)} <Icon type="right" />
                        </Button>
                      </div>
                    )
                  })
                )}
              </Col>
            }
            
            {customer != null && bigAccountBalance != 0 && 
              <>
                <Col sm={12} md={12} lg={12}>
                  <Card.Meta
                    avatar={<Avatar size="large" icon="user" style={{ backgroundColor: "#af0201" }} />}
                    title={customer.name
                      ? customer.name
                      : customer.email
                    }
                    description={<span>Account balance ${bigAccountBalance.toFixed(2)}</span>} 
                  />
                </Col>
                <Col sm={12} md={12} lg={12}>
                  <Button disabled={bigAccountBalance.lt(this.state.order.result.payment_required)} type="primary" onClick={() => this.payWithAccountCredit()}>Account Credit <Icon type="right" /></Button>
                </Col>
              </>
            }
          </Row>
        </div>
      </section>
    )
  }
}