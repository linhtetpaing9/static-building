import React from 'react'
import config from '../customize/config'
import { TravelCloudClient } from 'travelcloud-antd'
import { Icon, List } from 'antd'
import { Banner } from '../components/Utilities/banner'
import { StaycationCard } from '../components/Product/staycation-card'
import { splitNameAndUrl, useOriginalImage } from '../components/Utilities/CommonFunction'

const ToursPage = ({ 
  document,
  tours
}) => {
  
  const banner = document?.photo_url || ""
  const [ title, subtitle ] = splitNameAndUrl(document?.name || "")

  return (
    <section id="tours">
      <Banner
        title={title || ""}
        subtitle={subtitle || ""}
        backgroundImageUrl={useOriginalImage(banner)}
      />

      <div className="wrap-large pad-y">
        <List
          className="tours-list hide-pagination arrows-bottom"
          grid={{ gutter: 30, xs: 1, sm: 2, lg: 3 }}
          pagination={{
            pageSize: 12,
            itemRender: (_current, type) => {
              if (tours.length > 12) {
                if (type === 'prev') return <Icon type="arrow-left" className="border-grey fs-18 bg-white pad-15 left-0 circle" />
                if (type === 'next') return <Icon type="arrow-right" className="border-grey fs-18 bg-white pad-15 right-0 circle" />
              }
              return null
            }
          }}
          dataSource={tours}
          renderItem={(tour:any) =>
            <List.Item key={tour.id}>
              <StaycationCard tour={tour} />
            </List.Item>
          }
        />
      </div>
    </section>
  )
}

ToursPage.getInitialProps = async () => {
  const client = new TravelCloudClient(config.tcUser)
  const document = (await client.documents({ code: 'staycations' })).result[0]
  const tours = (await client.tours({ 'categories.name': 'staycations' })).result
  return { document, tours }
}

export default ToursPage