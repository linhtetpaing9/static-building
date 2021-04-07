import React, { Fragment } from "react";
import { Icon } from "antd";
import {
  Cart,
  mapTourOptionDepartures,
  nextDeparture
} from "travelcloud-antd/travelcloud";
import { Room } from "travelcloud-antd/components/tour-booking";
import Slider from "react-slick";
import config from "../../customize/config";
import { Tour } from "travelcloud-antd/types";
import Big from "big.js";
import moment from 'moment'
export function computeTourPricesAndNextDeparture(
  tours: Tour[],
  options: {
    rooms?: Room[];
    divisor?: number;
    filterOptionType?: string;
    cart?: Cart;
  }
): any[] {
  let toursResultCloned: Tour[] = JSON.parse(JSON.stringify(tours));

  const {
    rooms = [{ adult: 2 }],
    divisor = 2,
    filterOptionType,
    cart
  } = options;

  return (
    toursResultCloned
      // filter base on filterOptionType
      .map(tour => {
        if (filterOptionType != null)
          tour.options = tour.options.filter(
            option => option.type === filterOptionType
          );

        tour["_next_departure"] = nextDeparture(tour.options);

        if (cart == null) return tour;

        tour.options = tour.options.map(option => {
          option["_cheapest_computed"] =
            //compute price for each departure
            mapTourOptionDepartures(option, (departure, departureDate) => {
              if (
                departure != null &&
                departure.slots_taken >= departure.slots_total
              )
                return null;

              const product = cart.addTour(
                tour,
                {
                  tour_id: tour.id,
                  option_id: option.id,
                  departure_date: departureDate,
                  rooms: rooms
                },
                true
              );

              if (product == null) return null;
              const beforePriceRules = product.items
                .filter(item => parseInt(item["price"]) > 0)
                .reduce(
                  (acc, item) => acc.add(Big(item.price).times(item.quantity)),
                  Big(0)
                )
                .div(divisor);
              const afterPriceRules = product.items
                .reduce(
                  (acc, item) => acc.add(Big(item.price).times(item.quantity)),
                  Big(0)
                )
                .div(divisor);
              const discounts = product.items
                .filter(item => parseInt(item["price"]) < 0)
                .reduce(
                  (acc, item) => acc.add(Big(item.price).times(item.quantity)),
                  Big(0)
                )
                .div(divisor);

              return {
                beforePriceRules,
                afterPriceRules,
                option,
                departureDate,
                discounts,
                breakdown: product.items
              };
            })
              // filter out invalid departures
              .filter(val => val != null)

              // find the cheapest
              .reduce((acc, computed) => {
                if (
                  acc == null ||
                  computed.afterPriceRules.cmp(acc.afterPriceRules) === -1
                ) {
                  return computed;
                }
                return acc;
              }, null);

          return option;
        });

        tour["_cheapest_computed"] = tour.options.reduce((acc: any, option) => {
          if (option["_cheapest_computed"] == null) return acc;

          if (
            acc == null ||
            option["_cheapest_computed"].afterPriceRules.cmp(
              acc.afterPriceRules
            ) === -1
          ) {
            return option["_cheapest_computed"];
          }

          return acc;
        }, null);

        return tour;
      })
  );
}
export const ToursResultHome = ({
  toursResult,
  onTourClick,
  cart,
  rooms = [{ adult: 2 }],
  divisor = 2,
  filterOptionType
}: {
  className?: string;
  toursResult: any;
  onTourClick: (any) => any;
  style?: React.CSSProperties;
  cart: Cart;
  rooms?: Room[];
  divisor?: number;
  filterOptionType?: string;
}) => {
  toursResult.sort(function (a, b) {
    return parseInt(b.sort_order) - parseInt(a.sort_order);
  });
  let toursResultComputed = computeTourPricesAndNextDeparture(toursResult, {
    cart,
    rooms,
    divisor,
    filterOptionType
  })

  function NextArrow(props) {
    const { className, onClick } = props;
    return (
      <div className={className} onClick={onClick}>
        <Icon type="right" theme="outlined" onClick={onClick} />
      </div>
    );
  }

  function PrevArrow(props) {
    const { className, onClick } = props;
    return (
      <div className={className} onClick={onClick}>
        <Icon type="left" theme="outlined" onClick={onClick} />
      </div>
    );
  }
  const feature = {
    autoplay: false,
    arrows: true,
    dots: false,
    infinite: false,
    speed: 500,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    pauseOnHover: false,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 1380,
        settings: {
          dots: false,
          arrows: true,
          adaptiveHeight: true,
          slidesToShow: 3,
          slidesToScroll: 3
        }
      },
      {
        breakpoint: 980,
        settings: {
          dots: false,
          arrows: true,
          adaptiveHeight: true,
          slidesToShow: 2,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 780,
        settings: {
          dots: false,
          arrows: true,
          adaptiveHeight: true,
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  const listTours = toursResultComputed.map((tour, index) => (
    <div key={"t" + index}>
      <article className="tour border" onClick={() => onTourClick(tour)}>
        <div className="card">
          <div className="card-img">
            <img src={tour.photo_url} />
          </div>
          <div className="card-text">
            <h3><span>
              {tour["_cheapest"] == null ?
                <Fragment>VIEW</Fragment>
                :
                <Fragment>
                  <sup>frm </sup>
                  {config.currency} {Math.round(tour["_cheapest"])}
                </Fragment>
              }
            </span>
            </h3>
            <h4>
              {tour.name.length > 40 ? (
                <Fragment>{tour.name.substring(0, 40)}... </Fragment>
              ) : (
                  tour.name
                )}
            </h4>
            {!!tour._next_departure ? <h5> Next Departure: {moment(tour._next_departure).format('D MMM YYYY')} </h5> : null}
          </div>
        </div>
      </article>
    </div>
  ));
  return (
    <section id="tours">
      <Slider {...feature}>{listTours}</Slider>
    </section>
  );
};
