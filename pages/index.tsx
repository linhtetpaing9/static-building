import React, { Fragment } from 'react';
import { TravelCloudClient } from 'travelcloud-antd';
import HomeSlider from '../components/Home/HomeSlider';
import LatestFeaturedTours from '../components/Home/LatestFeaturedTours';
import SellingPoints from '../components/Home/SellingPoints';
import config from '../customize/config';

const Index = ({ homeSlider, sellingPoints, latestTours }) => {
  return (
    <Fragment>
      <HomeSlider homeSlider={homeSlider} />
      <SellingPoints sellingpoints={sellingPoints} />
      <LatestFeaturedTours latestTours={latestTours.result} />
    </Fragment>
  );
}
Index.getInitialProps = async context => {
  const query = context.query;
  const client = new TravelCloudClient(config.tcUser)
  const homeSlider = (await client.documents(Object.assign({ "code": "homeslider" }))).result[0]
  const latestTours = await client.tours(Object.assign({ "categories.name": "#featured" }))
  const sellingPoints = (await client.documents(Object.assign({ "code": "selling-points" }))).result[0]
  return { query, homeSlider, sellingPoints, latestTours }
}
export default Index;
