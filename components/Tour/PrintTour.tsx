import React, { Fragment } from "react";
import { Row, Col, Button, Icon, List } from "antd";
import config from "../../customize/config";
import { mapTourOptionDepartures } from "travelcloud-antd/travelcloud";
import Big from "big.js";
import { PrintDiv } from "travelcloud-antd/components/print-div";

export default class PrintTour extends React.PureComponent<any> {
  render() {
    const social = [
      <a key="wa" href={`https://api.whatsapp.com/send?phone=${config.whatsapp.replace(/[^0-9]/g, '')}&amp;text=Would%20you%20like%20%20to%20know%20more%20about%20our%20packages?`} target="_blank" className="social"><img src="../static/images/icon-wa.png" /></a>,
      <a key="fb" href={config.facebook} target="_blank" className="social"><Icon type="facebook" theme="filled" /></a>,
      <a key="tw" href={config.instagram} target="_blank" className="social"><Icon type="instagram" theme="filled" /></a>
    ]

    const { tour, cart, itinerary, sections } = this.props;
    const numberWithCommas = x => {
      var parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    };
    const extraKvpWithPhotos = Object.entries(sections).map(
      (extraSectionKvp: any) => {
        const split = extraSectionKvp[1].header.split("]");
        extraSectionKvp[1].photos = tour.photos
          .filter(photo => {
            const split2 = photo.title.split("]");
            return split[0] === split2[0];
          })
          .map(photo => {
            const split2 = photo.title.split("]");
            const photo2 = Object.assign({}, photo);
            photo2.title = split2.length === 1 ? split2[0] : split2[1].trim();
            return photo2;
          });

        extraSectionKvp[1].header =
          split.length === 1 ? split[0] : split[1].trim();

        return extraSectionKvp;
      }
    );

    const itineraryKvpWithPhotos = Object.entries(itinerary).map(
      (itinerarySectionKvp: any) => {
        if (itinerarySectionKvp[1].header != null) {
          const split = itinerarySectionKvp[1].header.split("]");
          itinerarySectionKvp[1].photos = tour.photos
            .filter(photo => {
              const split2 = photo.title.split("]");
              return split[0] === split2[0];
            })
            .map(photo => {
              const split2 = photo.title.split("]");
              const photo2 = Object.assign({}, photo);
              photo2.title = split2.length === 1 ? split2[0] : split2[1].trim();
              return photo2;
            });

          itinerarySectionKvp[1].header =
            split.length === 1 ? split[0] : split[1].trim();

          return itinerarySectionKvp;
        }
      }
    );

    const itineraryWithTag = itineraryKvpWithPhotos.filter(
      item => item[0] !== "noSection"
    );
    tour.options.sort(function (a, b) {
      return parseInt(a.TWN) - parseInt(b.TWN);
    });

    const calendarRooms = [
      {
        adult: 2
      }
    ];
    const contact = [
      <Fragment>
        <p className="center-block">
          Email us at <a href={"email:" + config.email}>{config.email}</a> or
          call us @ <a href={"tel:" + config.phone}>{config.phone}</a> to find
          out more!
        </p>
      </Fragment>
    ];
    return (
      <Fragment>
        <PrintDiv printDivId="printHeader" hideOriginalDiv={true}>
          <section id="main-head">
            <Row id="top-head" type="flex" justify="space-between" align="top">
              <Col span={5}>
                <div id="logo">
                  <a href={"/"} target="_blank"><img src="../static/images/logo.jpg" /></a>
                </div>
              </Col>
              <Col span={19} className="right">
                <span id="big"><a href={'email:' + config.email}> <Icon type="mail" theme="filled" /> {config.email}</a></span>
                <span>{social}</span>
              </Col>
            </Row>
          </section>

        </PrintDiv>
        <PrintDiv printDivId="printPhoto" hideOriginalDiv={true}>
          <img
            src={tour.photo_url.replace(".jp", "_o.jp")}
            style={{ display: "block", margin: "20px auto" }}
          />
        </PrintDiv>
        <PrintDiv printDivId="printBody" hideOriginalDiv={true}>
          <section id="item-details">
            {tour.options.length > 0 ? (
              <Fragment>
                <section className="center-block">
                  <div id="start-book">
                    <List
                      size="large"
                      grid={{ xs: 1, sm: 1, md: 1, lg: 1, xxl: 1 }}
                      dataSource={tour.options}
                      renderItem={(option: any) => {
                        const cheapestComputed =
                          cart == null
                            ? null
                            : mapTourOptionDepartures(
                              option,
                              (departure, departureDate) => {
                                //compute price for each departure

                                if (
                                  departure != null &&
                                  departure.slots_taken >=
                                  departure.slots_total
                                )
                                  return null;

                                const product = cart.addTour(
                                  tour,
                                  {
                                    tour_id: tour.id,
                                    option_id: option.id,
                                    departure_date: departureDate,
                                    rooms: calendarRooms
                                  },
                                  true
                                );

                                if (product == null) return null;
                                const beforePriceRules = product.items
                                  .filter(item => parseInt(item["price"]) > 0)
                                  .reduce(
                                    (acc, item) =>
                                      acc.add(
                                        Big(item.price).times(item.quantity)
                                      ),
                                    Big(0)
                                  )
                                  .div(2);
                                const afterPriceRules = product.items
                                  .reduce(
                                    (acc, item) =>
                                      acc.add(
                                        Big(item.price).times(item.quantity)
                                      ),
                                    Big(0)
                                  )
                                  .div(2);
                                return {
                                  beforePriceRules,
                                  afterPriceRules,
                                  option,
                                  departureDate
                                };
                              }
                            )
                              // filter out invalid departures
                              .filter(val => val != null)

                              // find the cheapest
                              .reduce((acc, computed) => {
                                if (
                                  acc == null ||
                                  computed.afterPriceRules <
                                  acc.afterPriceRules
                                ) {
                                  return computed;
                                }
                                return acc;
                              }, null);

                        return (
                          <Fragment>
                            <div
                              key={option.id}
                              className={
                                option.type === "Land Tour"
                                  ? "land"
                                  : option.type === "Full Package"
                                    ? "fullp"
                                    : option.type === "Free and Easy"
                                      ? "free"
                                      : option.type === "Cruise"
                                        ? "cruise"
                                        : ""
                              }
                            >
                              <h3>Price Guide</h3>
                              {cheapestComputed == null ? (
                                <h2>
                                  {" "}
                                  <sup> frm</sup>{" "}
                                  {!!option["_cheapest"] ? (
                                    <Fragment>
                                      {config.currency}$
                                      {Math.round(option["_cheapest"])}
                                    </Fragment>
                                  ) : (
                                      <Fragment>
                                        {config.currency}$
                                        {Math.round(option["TWN"])}
                                      </Fragment>
                                    )}
                                </h2>
                              ) : cheapestComputed.beforePriceRules.eq(
                                cheapestComputed.afterPriceRules
                              ) ? (
                                    <h2>
                                      <sup> frm</sup> {config.currency}$
                                      {numberWithCommas(
                                        cheapestComputed.beforePriceRules.toFixed(0)
                                      )}
                                    </h2>
                                  ) : (
                                    <h2>
                                      {" "}
                                      <sup> frm</sup> {config.currency}$
                                      {numberWithCommas(
                                        cheapestComputed.afterPriceRules.toFixed(0)
                                      )}
                                    </h2>
                                  )}
                            </div>
                          </Fragment>
                        );
                      }}
                    />
                  </div>
                </section>
              </Fragment>
            ) : (
                ""
              )}
            <div className="center-block">
              {" "}
              <h1>{tour.name}</h1>
            </div>
            {!!tour.short_desc && (
              <article className="info">
                {!!tour.short_desc && (
                  <div dangerouslySetInnerHTML={{ __html: tour.short_desc }} />
                )}
              </article>
            )}
            {!!tour.extras && (extraKvpWithPhotos.filter(s => s[0].includes("activity")).length === 0 &&
              <article className="info">
                <div dangerouslySetInnerHTML={{ __html: tour.extras }} />
              </article>
            )}

            {extraKvpWithPhotos.length > 1 &&
              <article id="more-info">
                {extraKvpWithPhotos.filter(s => s[0].includes("activity"))
                  .length !== 0 && (
                    <Fragment>
                      {!!extraKvpWithPhotos[0]
                        ? extraKvpWithPhotos
                          .filter(s => s[0].includes("activity"))
                          .map((iSection, index) => {
                            return (
                              <Fragment key={"e" + index}>
                                {!!iSection[1].header ? (
                                  <h2>{iSection[1].header}</h2>
                                ) : (
                                    ""
                                  )}
                                <Row>
                                  {!!iSection[1].photos.length ? (
                                    iSection[1].photos.length > 1 ? (
                                      <Fragment>
                                        <Col span={16}>
                                          <article className="text-box">
                                            {iSection[1].photos.map(
                                              (desc, index) => (
                                                <Fragment key={"edesc2" + index}>
                                                  {!!desc.title ? (
                                                    <h1>{desc.title}</h1>
                                                  ) : (
                                                      ""
                                                    )}
                                                  <p
                                                    dangerouslySetInnerHTML={{
                                                      __html: desc.desc
                                                    }}
                                                  />
                                                </Fragment>
                                              )
                                            )}
                                          </article>
                                        </Col>
                                        <Col span={8}>
                                          {<img src={iSection[1].photos[0].url} />}
                                        </Col>
                                      </Fragment>
                                    ) : (
                                        iSection[1].photos.map((photo, index) => (
                                          <Fragment key={"epic" + index}>
                                            <Col span={16}>
                                              <article className="text-box">
                                                <h1>{photo.title}</h1>
                                                <p
                                                  dangerouslySetInnerHTML={{
                                                    __html: photo.desc
                                                  }}
                                                />
                                              </article>
                                            </Col>
                                            <Col span={8}>
                                              <img src={photo.url} />
                                            </Col>
                                          </Fragment>
                                        ))
                                      )
                                  ) : (
                                      ""
                                    )}{" "}
                                </Row>
                              </Fragment>
                            );
                          })
                        : null}
                    </Fragment>
                  )}
                {extraKvpWithPhotos.filter(s => s[0].includes("shop"))
                  .length !== 0 && (
                    <Fragment>
                      {!!extraKvpWithPhotos[0]
                        ? extraKvpWithPhotos
                          .filter(s => s[0].includes("shop"))
                          .map((iSection, index) => {
                            return (
                              <Fragment key={"s" + index}>
                                {!!iSection[1].header ? (
                                  <h2>{iSection[1].header}</h2>
                                ) : (
                                    ""
                                  )}
                                <Row>
                                  {!!iSection[1].photos.length ? (
                                    iSection[1].photos.length > 1 ? (
                                      <Fragment>
                                        <Col span={16}>
                                          <article className="text-box">
                                            {iSection[1].photos.map(
                                              (desc, index) => (
                                                <Fragment key={"shop2" + index}>
                                                  {!!desc.title ? (
                                                    <h1>{desc.title}</h1>
                                                  ) : (
                                                      ""
                                                    )}
                                                  <p
                                                    dangerouslySetInnerHTML={{
                                                      __html: desc.desc
                                                    }}
                                                  />
                                                </Fragment>
                                              )
                                            )}
                                          </article>
                                        </Col>
                                        <Col span={8}>
                                          {<img src={iSection[1].photos[0].url} />}
                                        </Col>
                                      </Fragment>
                                    ) : (
                                        iSection[1].photos.map((photo, index) => (
                                          <Fragment key={"shoppic" + index}>
                                            <Col span={16}>
                                              <article className="text-box">
                                                <h1>{photo.title}</h1>
                                                <p
                                                  dangerouslySetInnerHTML={{
                                                    __html: photo.desc
                                                  }}
                                                />
                                              </article>
                                            </Col>
                                            <Col span={8}>
                                              <img src={photo.url} />
                                            </Col>
                                          </Fragment>
                                        ))
                                      )
                                  ) : (
                                      ""
                                    )}
                                </Row>
                              </Fragment>
                            );
                          })
                        : null}
                    </Fragment>
                  )}
              </article>
            }


            {!!tour.itinerary ? (
              !!itineraryKvpWithPhotos ? (
                <Fragment>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: itineraryKvpWithPhotos[0][1].html
                    }}
                  />
                  <article className="details">
                    {itineraryWithTag.map((iSection, index) => {
                      return (
                        <Fragment key={"i" + index}>
                          {!!iSection[1].header ? (
                            <h2
                              dangerouslySetInnerHTML={{
                                __html: iSection[1].header
                              }}
                            />
                          ) : (
                              ""
                            )}
                          {!!iSection[1].photos.length ? (
                            <Row type="flex" gutter={8}>
                              {iSection[1].photos.map((photo, index) => (
                                <Col
                                  className="photo"
                                  key={`iti${index}`}
                                  span={6}
                                >
                                  <div>
                                    <img src={photo.url} />
                                  </div>
                                </Col>
                              ))}
                            </Row>
                          ) : (
                              ""
                            )}
                          <div
                            dangerouslySetInnerHTML={{
                              __html: iSection[1].html
                            }}
                          />
                        </Fragment>
                      );
                    })}
                  </article>
                </Fragment>
              ) : (
                  ""
                )
            ) : (
                contact
              )}

            {!!tour._next_departure && (
              <section className="info">
                <h2>Departures</h2>
                <article className="tc-tour-form">
                  <Row type="flex" className="ant-list-grid" gutter={16}>
                    {tour.options.map(option => (
                      <Col span={12} key={`option${option.id}`}>
                        <div className="ant-list-item depart-box">
                          <h2>{option.name}</h2>
                          {!!option._next_departure && (
                            <div>
                              Next departure: <b>{option._next_departure}</b>
                            </div>
                          )}
                          {!!option.TWN && (
                            <div>
                              Prices from: <b>${option.TWN}</b>
                            </div>
                          )}
                          <Button
                            type="primary"
                            href={`/tour?id=${tour.id}&tab=priceoption`}
                            target="_blank"
                          >
                            Book Now <Icon type="right" />
                          </Button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </article>
              </section>
            )}

            {!!tour.remarks && (
              <Fragment>
                <h2>Remarks</h2>
                <div dangerouslySetInnerHTML={{ __html: tour.remarks }} />
              </Fragment>
            )}
          </section>
        </PrintDiv>
        <PrintDiv printDivId="printFooter" hideOriginalDiv={true}>
          <section id="foot-end" className="center-block">
            <span>
              <Icon type="home" /> {config.address1} {config.address2}
            </span>
            <span>
              <Icon type="phone" />{" "}
              <a href={"tel:" + config.phone}>{config.phone} </a>
            </span>
            <br />
            <span>
              <Icon type="clock-circle" /> Mon - Sat: 10am to 7pm | Sun: 10am to 3pm <em>(Closed on Sun & Public Holidays)</em>
            </span>
          </section>
        </PrintDiv>
      </Fragment>
    );
  }
}
