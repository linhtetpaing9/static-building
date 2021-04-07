import React from 'react';
import { Row, Col } from 'antd';

const TwoNestedLayout = props => {
  
  return (
    <Row gutter={16}>
      <Col span={8} style={{padding: 12}}>
        <div className="overflow-scroll" style={{ background: '#fff', padding: 12, maxHeight: 800 }}>
          {
            props.left ? props.left : null
          }
        </div>
      </Col>
      <Col span={16} style={{padding: 12}}>
        <div style={{ background: '#fff', padding: 12, minHeight: 800 }}>
          {
            props.right ? props.right : null
          }
        </div>
      </Col>
    </Row>
  )
};

export default TwoNestedLayout;