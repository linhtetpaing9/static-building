import React, { useState } from 'react'
import Router from 'next/router'
import config from '../customize/config'
import { TravelCloudClient } from 'travelcloud-antd'
import { Col, Icon, List, Radio, Row } from 'antd'
import { AttractionCard } from '../components/Product/attraction-card'

const Page = ({ 
  query,
  generics,
  genericCategories
}) => {

  const [ category, setCategory ] = useState(query ? query['categories.name'] : "all")
  
  return (
    <section id="attractions">
      <div className="wrap-large pad-y">
        <Row type="flex" justify="center">
          <Col>
            <h2 className="fs-36 bold center black mar-0">Explore Attractions!</h2>
            <p className="fs-18 center grey">这是汉字的描述</p>
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
                pathname: '/attractions',
                query: { 'categories.name': cat }
              })
            } else {
              Router.push({ 
                pathname: '/attractions'
              })
            }
          }}
        >
          <Radio.Button value="all">
            All
          </Radio.Button>
          {genericCategories
            .map((cat, catIndex) => 
              <Radio.Button key={catIndex} value={cat.name}>
                {cat.description || cat.name}
              </Radio.Button>
            )
          }
        </Radio.Group>
        <List
          className="tours-list hide-pagination arrows-bottom"
          grid={{ gutter: 30, xs: 1, sm: 2, lg: 3 }}
          pagination={{
            pageSize: 12,
            itemRender: (_current, type) => {
              if (generics.length > 12) {
                if (type === 'prev') return <Icon type="arrow-left" className="border-grey fs-18 bg-white pad-15 left-0 circle" />
                if (type === 'next') return <Icon type="arrow-right" className="border-grey fs-18 bg-white pad-15 right-0 circle" />
              }
              return null
            }
          }}
          dataSource={generics}
          renderItem={(generic:any) =>
            <List.Item key={generic.id}>
              <AttractionCard generic={generic} />
            </List.Item>
          }
        />
      </div>
    </section>
  )
}

Page.getInitialProps = async context => {
  const client = new TravelCloudClient(config.tcUser)
  const query = context.query
  const generics = (await client.generics(query)).result
  const genericCategories = (await client.categories({ category_type: 'nontour_product' })).result
  return { query, generics, genericCategories }
}

export default Page