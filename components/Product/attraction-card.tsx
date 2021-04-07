import { Typography } from 'antd'
import Link from 'next/link'
import React from 'react'
import config from '../../customize/config'
import { cleanUrl, useOptimisedImage } from '../Utilities/CommonFunction'
import { FixedAspectRatio } from '../Utilities/fixed-aspect-ratio'

export const AttractionCard = ({
  generic = null as any
}) => {

  if (!generic) {
    return null
  }

  const cheapest = generic.options.reduce((acc, cur) => {
    if (acc === 0 || parseFloat(cur.price) < acc) {
      if ((cur.stock_type === 'Unlimited' || Number(cur.stock) > 0) && cur.name.toLowerCase().indexOf('child') < 0) {
        acc = cur.price
      }
    }
    return acc
  }, 0)

  return (
    <Link passHref href={`/attraction/${cleanUrl(generic.name)}/${generic.id}`}>
      <a>
        <div className="staycation-card">
          <div className="photo">
            <FixedAspectRatio ratio="5:3" imageUrl={useOptimisedImage(generic.photo_url)} />
            <h4>{generic.name}</h4>
            <div className="price">
              {cheapest > 0
                ? <>
                    {generic.attributes.usual_price &&
                      <Typography.Text delete>
                        <small>{generic.attributes.usual_price}</small>
                      </Typography.Text>
                    }
                    <strong>{config.currency + " " + cheapest}</strong>
                  </>
                : <strong>View</strong>
              }
            </div>
          </div>
        </div>
      </a>
    </Link>
  )
}