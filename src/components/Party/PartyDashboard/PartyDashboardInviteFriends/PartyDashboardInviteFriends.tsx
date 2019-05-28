import React from 'react';
import { Button, Icon, message } from 'antd';

import {
  PaginateUsersInviteToPartyQueryQuery,
  MutationType,
  usePaginateUsersInviteToPartyQueryQuery,
  usePartyInvitationSubscriptionSubscription,
  useCreatePartyInvitationMutation,
  PaginateUsersInviteToPartyQueryDocument,
  useDeletePartyInvitationMutationMutation
} from '@generated/graphql';
import GraphqlInlineError from '@components/GraphqlInlineError';
import { handleRefetch, hasGraphqlData } from '@shared/graphqlUtils';
import PartyDashboardInviteFriendsModalList from './PartyDashboardInviteFriendsModalList';
import { PartyDashboardContext } from '@pages/party';
import { map, concat } from 'ramda';
import PartyDashboardInviteFriendsSearch from './PartyDashboardInviteFriendsSearch';
import PartyDashboardInviteFriendsModal from './PartyDashboardInviteFriendsModal';

interface Props {
  isOnMobile: boolean;
}

const PartyDashboardInviteFriends: React.FC<Props> = ({ isOnMobile }) => {
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = React.useState<boolean>(false);
  const [searchValue, setSearchValue] = React.useState<string>('');
  const { partyId, currentlyAuthenticatedUserId } = React.useContext(
    PartyDashboardContext
  );

  const {
    data,
    loading,
    error,
    refetch
  } = usePaginateUsersInviteToPartyQueryQuery({
    variables: {
      partyInvitationWhere: {
        party: { id: partyId }
      },
      where: {
        OR: [
          { firstName_contains: searchValue },
          { lastName_contains: searchValue }
        ],
        AND: [
          { parties_none: { id: partyId } },
          { friends_some: { id: currentlyAuthenticatedUserId } }
        ]
      }
    }
  });

  // listen to deleted invitation, we should update the list when user declines / accepts an invitation
  usePartyInvitationSubscriptionSubscription({
    variables: {
      where: {
        mutation_in: [MutationType.Deleted]
      }
    },
    onSubscriptionData: ({ subscriptionData: { data } }) => {
      if (
        !hasGraphqlData(data, ['partyInvitation']) ||
        data.partyInvitation.previousValues.partyId != partyId
      )
        return;
      refetch();
    }
  });

  // listen to userJoined (by invite link)
  // TODO:
  // https://www.graph.cool/docs/reference/graphql-api/subscription-api-aip7oojeiv/#relation-subscriptions

  const INVITE_CANCEL_INVITE_VARIABLES = React.useMemo(
    () => ({
      partyInvitationWhere: {
        party: { id: partyId }
      },
      where: {
        parties_none: { id: partyId }
      }
    }),
    [partyId]
  );

  // Im batching this operation in initApollo.ts
  const createPartyInvitation = useCreatePartyInvitationMutation({
    refetchQueries: [
      {
        query: PaginateUsersInviteToPartyQueryDocument,
        variables: INVITE_CANCEL_INVITE_VARIABLES
      }
    ]
  });

  // Im batching this operation in initApollo.ts
  const deletePartyInvitation = useDeletePartyInvitationMutationMutation({
    refetchQueries: [
      {
        query: PaginateUsersInviteToPartyQueryDocument,
        variables: INVITE_CANCEL_INVITE_VARIABLES
      }
    ]
  });

  const [toBeInvitedPeople, setToBeInvitedPeople] = React.useState<
    Record<string, boolean>
  >({});

  const [
    toHaveInvitationCanceledPeople,
    setToHaveInvitationCanceledPeople
  ] = React.useState<Record<string, boolean>>({});

  return (
    <React.Fragment>
      <PartyDashboardInviteFriendsModal
        visible={modalVisible}
        onOk={handleModalClose}
        onCancel={resetState}
        isOnMobile={isOnMobile}
        confirmLoading={confirmLoading}
      >
        <React.Fragment>
          <PartyDashboardInviteFriendsSearch
            onSearchValueChange={setSearchValue}
          />
          {error ? (
            <GraphqlInlineError style={{ padding: '24px 0px' }}>
              <Button
                data-testid="chatsMenuRefetchButton"
                onClick={async () => await handleRefetch(refetch)}
              >
                Try again
              </Button>
            </GraphqlInlineError>
          ) : (
            <PartyDashboardInviteFriendsModalList
              toHaveInvitationCanceledPeople={toHaveInvitationCanceledPeople}
              onAddToHaveInvitationCanceled={handleAddToHaveInvitationCanceled}
              onRemoveToHaveInvitationCanceled={
                handleRemoveToHaveInvitationCanceled
              }
              toBeInvitedPeople={toBeInvitedPeople}
              onAddToBeInvited={handleAddToBeInvited}
              onRemoveToBeInvited={handleRemoveToBeInvited}
              loading={loading}
              data={getModalListData(data)}
            />
          )}
        </React.Fragment>
      </PartyDashboardInviteFriendsModal>
      <Button type="primary" onClick={() => setModalVisible(true)}>
        {isOnMobile ? (
          <Icon type="usergroup-add" />
        ) : (
          <React.Fragment>
            <Icon type="usergroup-add" /> Manage invitations
          </React.Fragment>
        )}
      </Button>
    </React.Fragment>
  );

  function handleAddToBeInvited(personId: string) {
    setToBeInvitedPeople(prevObj => ({ ...prevObj, [personId]: true }));
  }

  function handleRemoveToBeInvited(personId: string) {
    const modifiedToBeInvitedPeople = { ...toBeInvitedPeople };
    Reflect.deleteProperty(modifiedToBeInvitedPeople, personId);
    setToBeInvitedPeople(modifiedToBeInvitedPeople);
  }

  function handleAddToHaveInvitationCanceled(invitationId: string) {
    setToHaveInvitationCanceledPeople(prevObj => ({
      ...prevObj,
      [invitationId]: true
    }));
  }

  function handleRemoveToHaveInvitationCanceled(invitationId: string) {
    const modifiedToHaveInvitationCanceledPeople = {
      ...toHaveInvitationCanceledPeople
    };
    Reflect.deleteProperty(
      modifiedToHaveInvitationCanceledPeople,
      invitationId
    );
    setToHaveInvitationCanceledPeople(modifiedToHaveInvitationCanceledPeople);
  }

  async function handleModalClose() {
    const idsToInvite = Object.keys(toBeInvitedPeople);
    const idsToCancel = Object.keys(toHaveInvitationCanceledPeople);

    if (idsToInvite.length <= 0 && idsToCancel.length <= 0) {
      setModalVisible(false);
      return;
    }

    const promises = concat(
      map(createPartyInvitationPromise, idsToInvite),
      map(createDeletePartyInvitationPromise, idsToCancel)
    );

    try {
      setConfirmLoading(true);
      await Promise.all(promises);
      setConfirmLoading(false);
      message.success('Operation successful');
      resetState();
    } catch (e) {
      setConfirmLoading(false);
      message.error('An error occurred!, try again.');
    }
  }

  function resetState() {
    setConfirmLoading(false);
    setModalVisible(false);
    setToBeInvitedPeople({});
    setToHaveInvitationCanceledPeople({});
  }

  function createPartyInvitationPromise(userToInvite: string) {
    return createPartyInvitation({
      variables: {
        data: {
          invitedBy: { connect: { id: currentlyAuthenticatedUserId } },
          party: { connect: { id: partyId } },
          user: { connect: { id: userToInvite } },
          invitedUserId: userToInvite,
          partyId
        }
      }
    });
  }

  function createDeletePartyInvitationPromise(idToDelete: string) {
    return deletePartyInvitation({
      variables: {
        where: { id: idToDelete }
      }
    });
  }

  function getModalListData(
    data: PaginateUsersInviteToPartyQueryQuery | undefined
  ) {
    return data && data.paginateUsers && data.paginateUsers.edges
      ? data.paginateUsers.edges
      : [];
  }
};

export default PartyDashboardInviteFriends;
