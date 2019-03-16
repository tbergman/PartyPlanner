import React from 'react';

import posed, { PoseGroup } from 'react-pose';
import styled from '@emotion/styled';
import { Typography } from 'antd';

const PosedTileWrapper = styled(
  posed.div({
    enter: { opacity: 1 },
    exit: { opacity: 0 }
  })
)`
  height: max-content;
  display: flex;
  margin: 0 auto;
  margin-bottom: 24px;
  h1,
  h3 {
    margin-top: 0 !important;
    margin-bottom: 0;
    color: #1890ff;
  }

  span {
    font-size: 20px;
    align-self: flex-end;

    font-weight: bold;
    margin-right: 8px;
  }
`;

const UserDashboardTitle: React.FC = () => {
  return (
    <PoseGroup>
      <PosedTileWrapper key={1} initialPose={'exit'}>
        <Typography.Text>Welcome</Typography.Text>
        <Typography.Title>Mateusz</Typography.Title>
      </PosedTileWrapper>
    </PoseGroup>
  );
};

export default UserDashboardTitle;
