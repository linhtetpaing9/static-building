import { Tag, Typography } from 'antd'
import Link from 'next/link'
// import { useRouter } from 'next/router'
import React from 'react'
import config from '../../customize/config'
import { cleanUrl, useOptimisedImage } from '../Utilities/CommonFunction'
import { FixedAspectRatio } from '../Utilities/fixed-aspect-ratio'

export const SplendTourCard = ({
  tour = null as any
}) => {
  // const Router = useRouter();

  const result = {
    id: tour.id,
    imageUrl: tour?.photo_url,
    title: tour?.name,
    duration: tour?.attributes?.duration,
    isVoucher: tour?.categories.find(category => category.name == '#srv-eligible'),
    isTopPick: tour?.categories.find(category => category.name == '#top-pick'),
    price: Number(tour?.options[0]?.TWN),
    srvLink: tour?.attributes?.srv_url
  }

  return (
    <Link passHref href={`/tour/${cleanUrl(result.title)}/${result.id}`}>
      <a>
        <div className="relative">
          {/* <img style={{ width: '100%', maxHeight: 283 }} src={result.imageUrl} /> */}
          <FixedAspectRatio ratio="4:2" imageUrl={useOptimisedImage(result.imageUrl)} />
          {
            result.isTopPick &&
            <img className="top-pick-tag" src="/img/top-pick.png" />
          }

          {result.isVoucher ?

            <div
              className="voucher-tag"
              style={{ backgroundImage: 'url(/img/voucher.png)', cursor: 'pointer' }}
              // onClick={() => Router.push(result.srvLink)}
            >
              <h2>S$ {result.price}</h2>
              <p>Price Per Person</p>
            </div>
            :
            <div className="not-voucher-tag" style={{ backgroundImage: 'url(/img/not-voucher.png)' }}>
              <h2>S$ {result.price}</h2>
              <p>Price Per Person</p>
            </div>
          }
        </div>
        <div className="p-36" style={{height: 200}}>
          <p className="fs-16 color-accent-1"><span className="font-bold">Duration:</span> {result.duration}</p>
          <h2 className="fs-26 font-black text-black">{result.title}</h2>
        </div>
      </a>
    </Link>
  )

}
export const TourCard = ({
  tour = null as any
}) => {

  const _isForFriends = tour.categories.some(category => category.name == '#for-friends')
  const _isForCouples = tour.categories.some(category => category.name == '#for-couples')
  const _isForFamilies = tour.categories.some(category => category.name == '#for-families')
  const _isRecommended = tour.categories.some(category => category.name == '#recommended')
  const _srvEligible = tour.categories.some(category => category.name == '#srv-eligible')

  return (
    <Link passHref href={`/tour/${cleanUrl(tour.name)}/${tour.id}`}>
      <a>
        <div className="tour-card">
          <div>
            <div className="photo">
              <FixedAspectRatio ratio="5:3" imageUrl={useOptimisedImage(tour.photo_url)} />
              {_isRecommended && <img className="photo-icon" src="/img/tag-featured.png" />}
              {_srvEligible && <Tag>Eligible for SingapoRediscovers Voucher</Tag>}
            </div>
            <div className="content">
              <div className="attribute color-accent-3">
                {tour.attributes.duration
                  ? <>
                    <img src="/img/icon-duration.png" />
                    {tour.attributes.duration}
                  </>
                  : <span>&nbsp;</span>
                }
              </div>
              <h4>{tour.name}</h4>
              <div className="attribute grey">
                {tour.attributes.short_desc || <span>&nbsp;</span>}
              </div>
            </div>
          </div>
          <div className="actions">
            <div className="action action-left">
              {_isForCouples && <img src="/img/icon-for-couples.png" />}
              {_isForFamilies && <img src="/img/icon-for-families.png" />}
              {_isForFriends && <img src="/img/icon-for-friends.png" />}
            </div>
            <div className="action action-right">
              {tour.attributes.usual_price &&
                <Typography.Text delete>
                  <small>{tour.attributes.usual_price}</small>
                </Typography.Text>
              }
              <strong>
                {tour._cheapest
                  ? <span>{config.currency + " " + parseInt(tour._cheapest).toFixed(2)}</span>
                  : <span>View</span>
                }
              </strong>
            </div>
          </div>
        </div>
      </a>
    </Link>
  )
}