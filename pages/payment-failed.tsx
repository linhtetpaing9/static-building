import React from "react"
import config from "../customize/config"

export default class Page extends React.PureComponent<any> {
  render() {
    return (
      <section id="payment">
        <div className="wrap">
          <h2>Payment unsuccessful</h2>
          <p>If you are having difficulties making payment online, please contact us @<a href={`tel:` + `${config.phone}`}>{config.phone}</a> for assistance.</p>
        </div>
      </section>
    )
  }
}