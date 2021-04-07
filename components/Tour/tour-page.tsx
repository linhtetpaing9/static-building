import React, { useState } from "react"
import Router from "next/router"
import Link from "next/link"
import scrollToElement from "scroll-to-element"
import config from "../../customize/config"
import { initialTourBookingForm } from "travelcloud-antd/components/tour-booking"
import { TourBookingForm } from "./tour-booking"
import { ContactFormComponent } from "./tour-contact"
import { Button, Icon, Result, Tabs } from "antd"
import { PhotoGallery } from "../Utilities/photo-gallery"
import { FacebookShareButton, FacebookIcon, TwitterIcon, TwitterShareButton, WhatsappShareButton, WhatsappIcon } from "react-share"
import { TourItinerary } from "./tour-itinerary"
import { cleanUrl } from "../Utilities/CommonFunction"

export const TourPage = ({
  tour,
  windowSize,
  cart
}) => {

  if (!tour) {
    return (
      <Result
        status="404"
        title="Error: 404"
        subTitle="Sorry, page not found."
        extra={
          <Link passHref href="/tours">
            <a>
              <Button type="primary">Check out other tours</Button>
            </a>
          </Link>
        }
      />
    )
  }

  const [currentTab, setCurrentTab] = useState('overview')
  const [contactFormVisible, setContactFormVisible] = useState(false)
  const [tourBookingForm, setTourBookingForm] = useState(null)
  if (!tourBookingForm) setTourBookingForm(initialTourBookingForm(tour))
  const availableOptions = tour.options.filter(option => option['_next_departure'])
  const singapoRediscoversLink = tour.attributes.srv_url || ""

  const actions = []
  if (singapoRediscoversLink)
    actions.push(<Button size="large" className="srv-btn" key="srv" onClick={() => window.open(singapoRediscoversLink)}>Book with SRV</Button>)
  if (availableOptions.length > 0)
    actions.push(
      <Button
        size="large"
        className="book-btn"
        key="book"
        onClick={() => {
          setCurrentTab('price')
          scrollToElement('.tabs', {
            offset: 0,
            ease: 'in-out-bounce',
            duration: 300
          })
        }}
      >
        Book Now
      </Button>
    )
  // enquire
  actions.push(<Button size="large" className="enquire-btn" key="enquire" onClick={() => setContactFormVisible(true)}>Enquire</Button>)

  const tourPhotos = tour.photos.filter(photo =>
    photo.title.trim().toLowerCase() !== "[map]"
    && photo.title.trim().toLowerCase() !== "[video]"
  )
  // const tourVideos = tour.photos
  //   .filter(photo => photo.title.trim().toLowerCase() === "[video]")
  //   .reduce((acc, cur) => {
  //     if (cur.desc) {
  //       acc += `<div class="video-container">${cur.desc.trim()}</div>`
  //     }
  //     return acc
  //   }, "")
  const tourMaps = tour.photos
    .filter(photo => photo.title.trim().toLowerCase() === "[map]")
    .reduce((acc, cur) => {
      if (cur.desc) {
        acc += `<div class="map-container">${cur.desc.trim()}</div>`
      }
      return acc
    }, "")
  // const tourItinerary = tour.itinerary?.replace('[video]', tourVideos) || ""
  const tourRemarks = tour.remarks?.replace('[map]', tourMaps) || ""
  const sharingUrl = `${config.domain}/tour/${cleanUrl(tour.name)}/${tour.id}`

  return (
    <div id="top" className="product-page">
      <PhotoGallery
        photos={tourPhotos}
        windowWidth={windowSize.width}
      />

      <div className="product-actions">
        <div className="action-card">
          {tour._cheapest &&
            <div className="product-price">
              <div>Price Guide</div>
              <div>frm <h3>{config.currency}${tour._cheapest}</h3></div>
            </div>
          }
          <Button.Group className="tour-actions">
            {actions}
          </Button.Group>
        </div>
      </div>

      <div className="wrap">
        <div className="tour-content">

          <h1 className="product-name font-bold">{tour.name}</h1>
          <h3 className="product-name-alt">{tour.attributes.short_desc || <span>&nbsp;</span>}</h3>

          <Tabs
            className="tabs"
            activeKey={currentTab}
            onChange={(e) => {
              setCurrentTab(e)
              scrollToElement('.tabs', {
                offset: 0,
                ease: 'in-out-bounce',
                duration: 200
              })
            }}
          // tabBarGutter={32}
          >
            <Tabs.TabPane tab="OVERVIEW" key="overview">
              <div className="innerHTML" dangerouslySetInnerHTML={{ __html: tour.short_desc }} />
              <div className="innerHTML" dangerouslySetInnerHTML={{ __html: tour.extras }} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="WHAT TO EXPECT" key="what-to-expect">
              <TourItinerary
                itinerary={tour.itinerary}
                photos={tour.photos}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="PRICE GUIDE" key="price">
              {availableOptions.length > 0
                ? <TourBookingForm
                  grid={1}
                  cart={cart}
                  value={tourBookingForm}
                  tour={tour}
                  onChange={(tourBookingForm) => setTourBookingForm(tourBookingForm)}
                  onSubmit={() => {
                    cart
                      .reset()
                      .addTour(tour, tourBookingForm)
                    Router.push("/checkout")
                  }}
                />
                : <Result
                  icon={<Icon type="smile" theme="twoTone" />}
                  title="No departures available."
                  extra={"Please check back later."}
                  style={{ backgroundColor: "#f0f0f0" }}
                />
              }
            </Tabs.TabPane>
            <Tabs.TabPane tab="REMARKS" key="remarks">
              <div className="innerHTML" dangerouslySetInnerHTML={{ __html: tourRemarks }} />
            </Tabs.TabPane>
          </Tabs>

          <ContactFormComponent
            subject={`Enquiry on ${tour.name}`}
            emailAdmins={[config.email]}
            useModal
            visible={contactFormVisible}
            closeModal={() => setContactFormVisible(false)}
          />

          <div className="text-center pad-y">
            <h3 className="font-bold fs-16 p-10">Share on</h3>
            <FacebookShareButton url={sharingUrl}>
              <FacebookIcon size={32} round={true} path="" />
            </FacebookShareButton>
            <span>&nbsp;</span>
            <TwitterShareButton url={sharingUrl} title={tour.name}>
              <TwitterIcon size={32} round={true} path="" />
            </TwitterShareButton>
            <span>&nbsp;</span>
            <WhatsappShareButton url={sharingUrl} title={tour.name}>
              <WhatsappIcon size={32} round={true} path="" />
            </WhatsappShareButton>
          </div>
        </div>
      </div>
    </div>
  )
}