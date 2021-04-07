import React, { useState } from 'react'
import Router from 'next/router'
import config from '../customize/config'
import { TravelCloudClient } from 'travelcloud-antd'
import { Col, Icon, List, Radio, Row } from 'antd'
import { SplendTourCard } from '../components/Product/tour-card'

const ToursPage = ({ query, tours, tourCategories }) => {

  const [ category, setCategory ] = useState(query?.category || "all")
  const filteredTours = category !== 'all'
    ? tours.filter(tour => tour.categories.some(cat => cat.name === category))
    : tours

  return (
    <section id="tours" className="wrap-large p-t-50">
      <Row type="flex" justify="center">
        <Col>
          <h2 className="fs-36 bold center black mar-0">Tours</h2>
          <p className="fs-18 center grey">推荐行程</p>
        </Col>
      </Row>

      <Radio.Group
        className="radio-tabs"
        value={category}
        style={{ 
          marginBottom: 40,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center"
        }}
        onChange={(e) => {
          const cat = e.target.value
          setCategory(cat)
          if (cat !== 'all') {
            Router.push({ 
              pathname: '/tours',
              query: { category: cat }
            })
          } else {
            Router.push({ 
              pathname: '/tours'
            })
          }
        }}
      >
        <Radio.Button value="all">
          All
        </Radio.Button>
        {tourCategories
          .filter(cat => cat.description !== "")
          .map((cat, catIndex) => 
            <Radio.Button key={catIndex} value={cat.name}>
              {cat.description}
            </Radio.Button>
          )
        }
      </Radio.Group>
        
      <List
        className="tours-list hide-pagination arrows-bottom"
        grid={{ gutter: 30, xs: 1, sm: 1, md: 2, lg: 2 }}
        pagination={{
          pageSize: 12,
          itemRender: (_current, type) => {
            if (filteredTours.length > 12) {
              if (type === 'prev') return <Icon type="arrow-left" className="border-grey fs-18 bg-white pad-15 left-0 circle" />
              if (type === 'next') return <Icon type="arrow-right" className="border-grey fs-18 bg-white pad-15 right-0 circle" />
            }
            return null
          }
        }}
        dataSource={filteredTours}
        renderItem={(tour:any) =>
          <List.Item key={tour.id}>
            <SplendTourCard tour={tour} />
          </List.Item>
        }
      />
    </section>
  )
}

ToursPage.getInitialProps = async context => {
  const client = new TravelCloudClient(config.tcUser)
  const query = context.query
  const tours = (await client.tours({ 'categories.name': 'singapore' })).result
  const tourCategories = (await client.categories({ category_type: 'tour_package', parent: 'Themes' })).result
  return { query, tours, tourCategories }
}

export default ToursPage