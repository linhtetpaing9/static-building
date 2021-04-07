import React from "react"
// import Terms from "../components/Utilities/Terms"
import { Row, Col, Card, Button, Icon, Checkbox, Modal, Input } from "antd"
import { withRouter, SingletonRouter } from "next/router"
import { Cart, updateFormState, TcResponse, TravelCloudClient } from "travelcloud-antd"
import { Customer, PriceRules } from "travelcloud-antd/types"
import { CheckoutForm, initialCheckoutForm } from "../components/Payment/Checkout"
import { Order } from "../components/Payment/Order"
import config from "../customize/config"

// function vw(value) {
//   return { value }
// }

class Page extends React.PureComponent<{
  terms?,
  router: SingletonRouter,
  order: any,
  cart: Cart,
  windowWidth,
  customer: TcResponse<Customer>,
  priceRules: TcResponse<PriceRules>
}, any> {

  formRef

  static async getInitialProps(context) {
    const client = new TravelCloudClient(config.tcUser)
    const query = context.query
    const terms = (await client.documents({ code: 'terms-of-use' })).result[0]
    return { query, terms }
  }

  state = {
    submittingOrder: false,
    orderLoading: true,
    error: null,
    errorRef: null,
    userClickedSubmit: false,
    showTerms: false,
    acceptTerms: false,
    confirmLoading: false,
    checkoutForm: null,
    remarks: "",
  }

  componentDidMount() {
    this.props.router.prefetch('/payment') // prefetch payment page
  }

  onSubmit(e) {
    e.preventDefault()
    this.setState({ userClickedSubmit: true })
    this.formRef.props.form.validateFieldsAndScroll(async (error, values) => {
      if (!error && this.state.acceptTerms) {
        this.setState({ submittingOrder: true })
        values.user_message = this.state.remarks
        const result = await this.props.cart.checkout(values)
        if (result.result == null) {
          this.setState({ error: true })
        } else {
          if (result.result.order_status === 'Quotation') {
            this.props.router.push('/payment?ref=' + result.result.ref)
          } else {
            this.setState({
              error: true,
              errorRef: result.result.ref
            })
          }
        }
      } else {
        //console.log('error', error, values)
      }
    })
  }

  // scroll up after order loaded
  static getDerivedStateFromProps(props, current_state) {
    const checkoutForm:any = initialCheckoutForm(props.order.result, false)
    if (checkoutForm != null) {
      checkoutForm.travelers = [] // comment this line to checkout with travelers details
      checkoutForm.phone_country = { value: "65" } // default phone country to SG
    }
    if (current_state.orderLoading === true && props.order.result != null) {
      setTimeout(() => window.scrollTo(0, 0), 100)
      return {
        orderLoading: false,
        checkoutForm: checkoutForm
      }
    }
    return null
  }

  onChange = (e) => {
    this.setState({
      acceptTerms: e.target.checked,
      userClickedSubmit: true
    })
  }

  handleOk = () => {
    this.setState({
      confirmLoading: true,
      acceptTerms: true
    })
    setTimeout(() => {
      this.setState({
        showTerms: false,
        confirmLoading: false
      })
    }, 1000)
  }

  render() {
    const cart = this.props.cart
    const order = this.props.order.result

    if (this.state.error === true) {
      return (
        <div className="wrap pad-y">
          <h1>We have receive your booking</h1>
          <p>Our travel consultants will be contacting you to follow up with your booking.</p>
          {this.state.errorRef != null && <p>Order reference: {this.state.errorRef}</p>}
        </div>
      )
    }

    if (this.props.order.loading) {
      return (
        <div className="wrap pad-y">
          <Card loading={true} style={{ border: 0 }} />
        </div>
      )
    }

    if (order == null || order.products == null || order.products.length === 0) {
      return (
        <div className="wrap pad-y">
          <h1>Your cart is empty</h1>
        </div>
      )
    }

    const gotPayment = order.products.filter(i => i.product_type.includes('hotel')).length > 0

    return (
      <article id="checkout" className="grey">

        <section id="checkout-form" className="wrap pad-y">
          <Row type="flex" justify="space-between" gutter={{ lg: 24 }}>
            <Col xs={24} sm={24} md={24} lg={9}>
              <section id="order-details">
                <h2>Order Details</h2>
                <Order order={order} showSection={{ products: true }} cart={cart} />
              </section>
            </Col>
            <Col xs={24} sm={24} md={24} lg={15}>
              <section id="details">

                <h1>Contact Details</h1>
                <CheckoutForm
                  formState={this.state.checkoutForm}
                  onChange={updateFormState(this, 'checkoutForm')}
                  wrappedComponentRef={(inst) => this.formRef = inst} 
                />

                <h1>Additional Information</h1>
                <div className="center-block remarks">
                  <Input.TextArea
                    rows={4}
                    value={this.state.remarks}
                    onChange={(e) => this.setState({ remarks: e.target.value })}
                    placeholder={!!order.products && order.products.filter(a => a.product_type.includes('nontour_product')).length === 0
                      ? `Please indicate bed type for each room.`
                      : order.products.filter(a => a.product_type.includes('nontour_product') || a.product_type.includes('tour_package')).length > 0
                        ? `For Visa: Please state date of entry & departure.`
                        : ``
                    } 
                  />
                </div>
                
                <div
                  id="extra-fields"
                  className={this.state.userClickedSubmit && !this.state.acceptTerms ? 'error' : ''}
                >
                  <Checkbox
                    checked={this.state.acceptTerms}
                    onChange={this.onChange}
                    className="m-r-15"
                  />
                  I have read, understood and accepted the <a onClick={() => this.setState({ showTerms: true })}>terms and conditions.</a>
                </div>

                <Modal 
                  visible={this.state.showTerms}
                  wrapClassName="terms-and-condition"
                  onCancel={() => this.setState({ showTerms: false })}
                  closable={false}
                  title={
                    <Row>
                      <Col span={20}>
                        TERMS AND CONDITIONS
                      </Col>
                      <Col span={4} style={{ textAlign: "right" }}>
                        <a onClick={() => this.setState({ showTerms: false })}><Icon type="close" /></a>
                      </Col>
                    </Row>
                  }
                  footer={false}
                >
                  {this.props.terms && 
                    <div className="innerHTML" dangerouslySetInnerHTML={{__html: this.props.terms.content || "" }} />
                  }
                </Modal>
                <Button
                  size="large"
                  type="primary"
                  disabled={this.state.submittingOrder}
                  onClick={(e) => this.onSubmit(e)}
                >
                  {gotPayment 
                    ? 'Proceed to payment' 
                    : 'Submit'
                  }
                  &nbsp;
                  <Icon type={this.state.submittingOrder ? 'loading' : 'right'} />
                </Button>
              </section>
            </Col>
          </Row>
        </section>
      </article>
    )
  }
}

export default withRouter(Page)