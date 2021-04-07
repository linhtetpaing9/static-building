import { Carousel } from "antd"
import React, { Fragment } from "react"
import { scroller } from 'react-scroll'

const HomeSlider = ({ homeSlider }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const scrollToForm = () => {
    scroller.scrollTo("latest-featured-tours", {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart',
      offset: -10
    })
  }

  return (
    <Fragment>
      <Carousel {...settings} autoplay={false}>
        {
          homeSlider.photos.map((banner, index) => (
            <img
              onClick={scrollToForm}
              className="banner-img"
              key={`banner_${index}`}
              src={banner.url.replace(".jp", "_o.jp")}
            />
          ))
        }
      </Carousel>
    </Fragment>
  )
}
export default HomeSlider