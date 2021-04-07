import { Col, Row } from 'antd';
import React from 'react';
import { Element } from 'react-scroll'
import { SplendTourCard } from '../Product/tour-card';


const LatestFeaturedTours = ({ latestTours }) => {
  // const dumpTours = [
  //   {
  //     imageUrl: "/img/tour-dump-1.png",
  //     title: "Discover Uniquely Singapore",
  //     duration: "7.5 Hours",
  //     isVoucher: true,
  //     isTopPick: true,
  //     price: '120',
  //     srvLink: 'https://splendourholidays-srv.globaltix.com/?display=all'
  //   },
  //   {
  //     imageUrl: "/img/tour-dump-2.png",
  //     title: "Discover Uniquely Singapore",
  //     duration: "7.5 Hours",
  //     isVoucher: true,
  //     isTopPick: true,
  //     price: '320',
  //     srvLink: 'https://splendourholidays-srv.globaltix.com/?display=all'
  //   },
  //   {
  //     imageUrl: "/img/tour-dump-3.png",
  //     title: "Discover Uniquely Singapore",
  //     duration: "7.5 Hours",
  //     isVoucher: true,
  //     isTopPick: false,
  //     price: '220',
  //     srvLink: 'https://splendourholidays-srv.globaltix.com/?display=all'
  //   },
  //   {
  //     imageUrl: "/img/tour-dump-4.png",
  //     title: "Discover Uniquely Singapore",
  //     duration: "7.5 Hours",
  //     isVoucher: false,
  //     isTopPick: true,
  //     price: '200',
  //     srvLink: 'https://splendourholidays-srv.globaltix.com/?display=all'
  //   },
  // ];

  return (
    <Element name="latest-featured-tours" className="bg-accent-5">
      <div className="wrap p-x-10">
        <h1 className="content-title p-y-60">Latest Featured Tours</h1>
        <Row gutter={29}>
          {latestTours.map((tour, index) =>
            <Col md={12} key={`featured-tour-${index}`}>
              <SplendTourCard tour={tour} />
            </Col>
          )}
        </Row>
      </div>
    </Element>
  )
}

export default LatestFeaturedTours;