import { Typography } from 'antd'
import Link from 'next/link'
import React from 'react'
import config from '../../customize/config'
import { cleanUrl, useOptimisedImage } from '../Utilities/CommonFunction'
import { FixedAspectRatio } from '../Utilities/fixed-aspect-ratio'

export const StaycationCard = ({
  tour = null as any
}) => {
  if (tour === "empty") {
    return (
      <FixedAspectRatio ratio="5:3" style={{ opacity: 0 }} />
    )
  }
  return (
    <Link passHref href={`/staycation/${cleanUrl(tour.name)}/${tour.id}`}>
      <a>
        <div className="staycation-card">
          <div className="photo">
            <FixedAspectRatio ratio="5:3" imageUrl={useOptimisedImage(tour.photo_url)} />
            <h4>{tour.name}</h4>
            <div className="price">
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