import { DEV_MODE_MOCK_DATA, BACKEND } from '../../config';
import { profileApiMock } from './profileApi.mock';
import { profileApiRest } from './profileApi.rest';
import { profileApiGraphql } from './profileApi.graphql';

export const profileApi = DEV_MODE_MOCK_DATA
  ? profileApiMock
  : BACKEND === 'rest'
  ? profileApiRest
  : profileApiGraphql;
