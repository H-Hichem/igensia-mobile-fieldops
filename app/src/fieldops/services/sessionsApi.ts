import { Session } from '../types';
import { DEV_MODE_MOCK_DATA, BACKEND } from '../../config';
import { sessionsApiMock } from './sessionsApi.mock';
import { sessionsApiRest } from './sessionsApi.rest';
import { sessionsApiGraphql } from './sessionsApi.graphql';

export type SessionInput = Pick<Session, 'name' | 'location' | 'notes' | 'address_name'>;

export const sessionsApi = DEV_MODE_MOCK_DATA
  ? sessionsApiMock
  : BACKEND === 'rest'
  ? sessionsApiRest
  : sessionsApiGraphql;