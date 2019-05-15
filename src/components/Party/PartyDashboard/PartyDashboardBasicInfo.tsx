import React from 'react';
import { Row, Col, Typography } from 'antd';

interface Props {
  description: string;
  title: string;
}

const PartyDashboardBasicInfo: React.FC<Props> = props => {
  return (
    <Row gutter={24} className="dashboard-content-item">
      <Col span={24}>
        <Typography.Title level={3}>{props.title}</Typography.Title>
      </Col>
      <Col sm={24} lg={16}>
        <Typography.Title level={4}>Description</Typography.Title>
        <Typography.Paragraph
          type={props.description ? undefined : 'secondary'}
        >
          {props.description || 'No description provided'}
        </Typography.Paragraph>
      </Col>
      <Col sm={24} lg={8}>
        <Typography.Title level={4}>Date and time</Typography.Title>
        <Typography.Paragraph>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Debitis
        </Typography.Paragraph>
        <Typography.Title level={4}>Location</Typography.Title>
      </Col>
    </Row>
  );
};

export default PartyDashboardBasicInfo;
