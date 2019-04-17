import { PartiesQueryVariables } from '@generated/graphql';
import moment from 'moment';

export function getPartiesDateVariables(
  dateToGetVariablesFor: Date,
  userId: string
): Partial<PartiesQueryVariables> {
  return {
    where: {
      start_gte: moment(dateToGetVariablesFor)
        .startOf('month')
        .subtract(7, 'days')
        .format(),
      end_lte: moment(dateToGetVariablesFor)
        .endOf('month')
        .add(7, 'days')
        .format(),
      members_some: {
        id: userId
      }
    }
  };
}

export function getCorrectTextFromPartyDates(start: Date, end: Date) {
  const parsedStart = moment(start);
  const parsedEnd = moment(end);
  if (parsedStart.isSame(parsedEnd, 'day')) {
    return `${parsedStart.format('DD MMM')} from ${parsedStart.format(
      'HH:mm'
    )} to ${parsedEnd.format('HH:mm')}`;
  } else {
    return `${parsedStart.format('DD MMM HH:mm')} to ${parsedEnd.format(
      'DD MMM HH:mm'
    )}`;
  }
}