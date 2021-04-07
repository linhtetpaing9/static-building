import React, { Fragment } from "react";
import {
  formatCurrency,
  Cart,
  objectEntries
} from "travelcloud-antd/travelcloud";
import { Row, Col, Icon, List } from "antd";
import moment from "moment";

export const Order = ({
  order,
  cart,
  showSection = {
    status: true,
    contact: true,
    products: true,
    remove: true,
    message: true,
    travelers: true,
    payments: true
  }
}: {
  order;
  cart?: Cart;
  showSection?: {
    status?: boolean;
    contact?: boolean;
    products?: boolean;
    remove?: boolean;
    message?: boolean;
    travelers?: boolean;
    payments?: boolean;
  };
}) => {
  const products = order.products || [];

  // group by name
  // same products may have different names
  const productsGrouped = objectEntries(
    products.reduce((acc, product) => {
      if (acc[product.product_name] == null) {
        // clone product because we are flattening items from all products into one
        acc[product.product_name] = Object.assign({}, product);
        acc[product.product_name].items = product.items.slice(0);
      } else {
        acc[product.product_name].items = acc[
          product.product_name
        ].items.concat(product.items);
      }
      return acc;
    }, {})
  );

  // properties in the outermost dive may not be rendered when
  // nextjs replaces client rendered dom with server rendered dom
  // add additional div outside to workaround this
  return (
    <section>
      <div className="tc-invoice">
        {showSection.status && <h1>{order.order_status}</h1>}
        {showSection.status && order.ref != null && (
          <div>
            <div>Reference: REF-{order.ref}</div>
            <div>Order Date: {order.order_date}</div>
          </div>
        )}

        {showSection.contact &&
          order.first_name != null &&
          order.first_name != "" && (
            <div>
              <div className="block-header">Bill To</div>
              <div>
                {order.first_name} {order.last_name}
              </div>
              {order.customer != null && <div>{order.customer.email}</div>}
              <div>{order.phone}</div>
            </div>
          )}

        {showSection.products &&
          productsGrouped.map((kvp, index) => {
            const product = kvp[1];
            const invoiceItemsGrouped = product.items.reduce((acc, line) => {
              if (acc[line.sub_header] == null) acc[line.sub_header] = [];
              acc[line.sub_header].push(line);
              return acc;
            }, {});

            // not sure how to enable Object.entries in babel
            const groups = [];
            for (var i in invoiceItemsGrouped) {
              groups.push([i, invoiceItemsGrouped[i]]);
            }

            return (
              <section className="invoice" key={`i${index}`}>
                <h3 className="icon">
                  <Row type="flex" align="middle">
                    <Col xs={20} sm={21} md={22} lg={20} xl={20} xxl={20}>
                      <h3>{product.product_name}</h3>
                    </Col>
                  </Row>
                </h3>
                {product.product_source_ref && (
                  <div className="subtitle">
                    Booking Ref: {product.product_source_ref}
                  </div>
                )}
                {product.product_source_ref && (
                  <div className="subtitle">
                    Departure date: {product.from_date}
                  </div>
                )}
                {showSection.remove && cart && (
                  <a
                    className="remove"
                    onClick={() =>
                      cart.removeProductByName(product.product_name)
                    }
                  >
                    remove
                  </a>
                )}
                <h4>
                  Details <Icon type="caret-down" />
                </h4>
                {!!product.from_date && (
                  <Row type="flex" justify="space-between">
                    <Col xs={16} sm={16} lg={17}>
                      Departure date
                    </Col>
                    <Col xs={8} sm={8} lg={7} className="right">
                      {product.from_date}
                    </Col>
                  </Row>
                )}
                {groups.map((group, index) => (
                  <article key={index}>
                    <div className="item">{group[0]}</div>

                    {group[0] && (
                      <h4>
                        <Icon type="caret-down" />{" "}
                      </h4>
                    )}
                    {group[1].map((item, index) => (
                      <div key={index} className="list">
                        <Row type="flex" justify="space-between">
                          <Col xs={16} sm={16} lg={17}>
                            {item.name}
                          </Col>
                          {/* {console.log(item.quantity)} */}
                          <Col xs={8} sm={8} lg={7} className="right">
                            {item.quantity > 0 ? (
                              <Fragment>
                                {" "}
                                ({item.quantity} x {formatCurrency(item.price)})
                              </Fragment>
                            ) : (
                                formatCurrency(item.price)
                              )}
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </article>
                ))}
              </section>
            );
          })}

        {showSection.products && [
          <article style={{ textAlign: "right" }} key={1}>
            <div className="total">
              <span>Total</span>
              <span className="amount">
                {formatCurrency(order.payment_required)}
              </span>
            </div>
          </article>
        ]}
        {showSection.message &&
          order.user_message != null &&
          order.user_message.trim() !== "" && (
            <section>
              <h4>
                <Icon type="caret-down" /> Additional Requests
              </h4>
              <div className="item">{order.user_message}</div>
            </section>
          )}

        {showSection.travelers &&
          order.travelers != null &&
          order.travelers.length > 0 && (
            <div>
              <h4>
                <Icon type="caret-down" /> Travelers
              </h4>
              {order.travelers != null && order.travelers.length > 0 && (
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, lg: 2 }}
                  dataSource={order.travelers}
                  renderItem={(traveler: any, index) => (
                    <List.Item key={index} className="box">
                      <h2>
                        {" "}
                        {traveler.first_name} {traveler.last_name}
                      </h2>
                      <div className="info">
                        {traveler.type && (
                          <Fragment>
                            Type: {traveler.type} <br />
                          </Fragment>
                        )}
                        Date of birth: {traveler.birth_date}
                        <br />
                        Gender: {traveler.title === "Ms" ? "female" : "male"}
                        <br />
                        Nationality: {traveler.country}
                        <br />
                        Passport: {traveler.passport}
                        <br />
                        Expiry: {traveler.expiry}
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </div>
          )}

        {showSection.payments && (
          <section>
            <h4>Payments</h4>
            {order.payments != null && order.payments.length > 0
              ? order.payments.map((payment, index) => (
                <Row key={index}>
                  <Col span={16}>
                    {" "}
                    {payment.description.length === 0
                      ? "Added by " + payment.source
                      : payment.description}
                    {!!payment.date_added &&
                      ` (${moment(payment.date_added).format(
                        "Do MMM YYYY HH:mm"
                      )})`}
                  </Col>
                  <Col span={8} className="right">
                    Amount {formatCurrency(payment.amount)}{" "}
                    {!!payment.status && `(${payment.status})`}
                  </Col>
                </Row>
              ))
              : `No payments received`}
          </section>
        )}
      </div>
    </section>
  );
};
