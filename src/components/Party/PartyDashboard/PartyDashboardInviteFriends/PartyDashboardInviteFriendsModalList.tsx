import React from 'react';
import {
  PaginateUsersInviteToPartyQueryEdges,
  PaginateUsersInviteToPartyQueryNode
} from '@generated/graphql';
import styled from '@emotion/styled';
import { List, Button, Tag } from 'antd';
import NoData from '@components/NoData';
import css from '@emotion/css';

import { PartyDashboardContext } from '@pages/party';
import PartyDashboardInviteFriendsModalListItem from './PartyDashboardInviteFriendsModalListItem';

const ListContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 0px 6px;
`;

interface InvitesInfo {
  hasInvites: boolean;
  yourInvitationId: string | null;
}

interface Props {
  loading: boolean;
  data: PaginateUsersInviteToPartyQueryEdges[];
  toBeInvitedPeople: Record<string, boolean>;
  toHaveInvitationCanceledPeople: Record<string, boolean>;
  onRemoveToBeInvited: (personId: string) => void;
  onAddToBeInvited: (personId: string) => void;
  onRemoveToHaveInvitationCanceled: (invitationId: string) => void;
  onAddToHaveInvitationCanceled: (invitationId: string) => void;
}

const PartyDashboardInviteFriendsModalList: React.FC<Props> = props => {
  const { currentlyAuthenticatedUserId } = React.useContext(
    PartyDashboardContext
  );

  return (
    <ListContainer>
      <List
        locale={ListLocale}
        loading={props.loading}
        size="small"
        dataSource={props.data}
        renderItem={({
          node
        }: {
          node: PaginateUsersInviteToPartyQueryNode;
        }) => (
          <PartyDashboardInviteFriendsModalListItem
            node={node}
            actions={getListItemActions(node)}
          />
        )}
      />
    </ListContainer>
  );

  function getListItemActions(node: PaginateUsersInviteToPartyQueryNode) {
    const { hasInvites, yourInvitationId } = getInvitationsData(node);

    if (!hasInvites && !props.toBeInvitedPeople[node.id])
      return [
        <Button
          onClick={() => props.onAddToBeInvited(node.id)}
          type="primary"
          key={1}
          size="small"
        >
          Invite
        </Button>
      ];

    if (props.toBeInvitedPeople[node.id])
      return [
        <Button
          key={node.id}
          size="small"
          type="danger"
          onClick={() => props.onRemoveToBeInvited(node.id)}
        >
          Cancel invitation
        </Button>
      ];

    if (hasInvites && yourInvitationId == null)
      return [
        <Tag color="blue" key={1}>
          Already invited
        </Tag>
      ];

    if (
      hasInvites &&
      yourInvitationId !== null &&
      props.toHaveInvitationCanceledPeople[yourInvitationId]
    )
      return [
        <Button
          onClick={() =>
            props.onRemoveToHaveInvitationCanceled(yourInvitationId)
          }
          type="primary"
          key={1}
          size="small"
        >
          Invite
        </Button>
      ];

    if (hasInvites && yourInvitationId !== null)
      return [
        <Button
          icon="user-delete"
          key={node.id}
          size="small"
          type="danger"
          onClick={() => props.onAddToHaveInvitationCanceled(yourInvitationId)}
        >
          <span className="hide-on-mobile">Cancel invitation</span>
        </Button>,
        <Tag color="green" key={1} style={{ margin: 0 }}>
          Invited by you
        </Tag>
      ];
  }

  function getInvitationsData(
    node: PaginateUsersInviteToPartyQueryNode
  ): InvitesInfo {
    let invitationsData: InvitesInfo = {
      hasInvites: false,
      yourInvitationId: null
    };
    if (!node.pendingPartyInvitations) return invitationsData;
    node.pendingPartyInvitations.forEach(pendingInvitation => {
      invitationsData.hasInvites = true;
      if (pendingInvitation.invitedBy.id == currentlyAuthenticatedUserId) {
        invitationsData.yourInvitationId = pendingInvitation.id;
      }
    });
    return invitationsData;
  }
};

const ListLocale = {
  emptyText: (
    <NoData
      cssStyles={css`
        img {
          height: 200px;
        }
      `}
      message="No results found"
      action={null}
    />
  ) as any
};

export default PartyDashboardInviteFriendsModalList;
