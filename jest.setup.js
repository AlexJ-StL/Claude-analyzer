/* global global */
/* eslint-disable no-unused-vars */
/* global global */
/* eslint-disable no-unused-vars */
/* global global */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-undef */
/* eslint-disable no-undef */
import { vi } from '@jest/globals';
import fetchMock from 'jest-fetch-mock';


// Expose vi globally for mocking purposes
// Enable fetch mocks for API testing
fetchMock.enableMocks();

global.vi = vi;