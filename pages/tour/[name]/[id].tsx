import React from "react"
import config from "../../../customize/config"
import { TravelCloudClient } from "travelcloud-antd"
import { TourPage } from "../../../components/Tour/tour-page"

const Page = ({ 
  tour,
  windowSize,
  cart
}) => {
  return (
    <TourPage
      tour={tour}
      windowSize={windowSize}
      cart={cart}
    />
  )
}

Page.getInitialProps = async context => {
  const client = new TravelCloudClient(config.tcUser)
  const query = context.query
  const tour = (await client.tour({ id: query.id })).result
  return { tour }
}

export default Page