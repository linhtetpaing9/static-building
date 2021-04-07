import React from "react"
import { Icon } from "antd"

export default class Page extends React.PureComponent<any> {
  render() {
    return (
      <section id="payment">
        <div className="wrap">
          <h2><Icon type="check-circle" /> Thank you for your order!</h2>
          <p>A copy of the invoice has been sent to your email. Please quote your invoice reference when contacting us.</p>
        </div>
      </section>
    )
  }
}