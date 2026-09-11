import { DEV_MODE_MOCK_DATA, BACKEND } from '../../config';
import { observationsApiMock } from './observationsApi.mock';
import { observationsApiRest } from './observationsApi.rest';
import { observationsApiGraphql } from './observationsApi.graphql';

export type { ObservationInput } from '../types';

export const observationsApi = DEV_MODE_MOCK_DATA
  ? observationsApiMock
  : BACKEND === 'rest'
  ? observationsApiRest
  : observationsApiGraphql;
