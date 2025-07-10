import { describe, it, expect, vi } from '@jest/globals';
import fetchMock from 'jest-fetch-mock';
import { getApiClient } from '../providers/litellm.js';

// Enable fetch mocking for all tests
fetchMock.enableMocks();

describe('LiteLLM API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data correctly with valid response', async () => {
    const mockData = {
      result: "Here is the mocked response data from the LiteLLM API",
      status: 200
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockData), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

    const client = getApiClient();
    const response = await client.fetchResources();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/litellm-endpoint',
      expect.objectContaining({ method: 'GET' })
    );

    expect(response).toEqual(mockData);
  });

  it('should handle API errors and surface exceptions correctly', async () => {
    const errorMessage = 'API encountered an error, failed to get data';

    fetchMock.mockRejectOnce(new Error(errorMessage));

    const client = getApiClient();

    try {
      await client.fetchResources();
    } catch (error) {
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/litellm-endpoint',
        expect.objectContaining({ method: 'GET' })
      );

      expect(error.message).toEqual(errorMessage);
    }
  });

  // Additional tests
  it('should manage API keys for authenticated requests', async () => {
    const authData = {
      apiKey: '123e4567-e89b-12d3-a456-426614174000',
    };

    fetchMock.mockResponseOnce(JSON.stringify({
      output: `API Key validation successful, can proceed to generate completions`
    }), {status: 200});

    const client = getApiClient(authData);
    const response = await client.generateCompletions();

    expect(fetchMock.mock.calls[0][1].headers['Authorization']).toBe(`Bearer ${authData.apiKey}`);
    expect(response).toEqual({ output: `API Key validation successful, can proceed to generate completions` });
  });

  it('should return error for missing API key', async () => {
    const invalidAuth = {
      apiKey: '',  // Empty API key
    };

    fetchMock.mockResponseOnce(JSON.stringify({
      error: 'Invalid or missing API key'
    }), {
      status: 403   
    });

    const client = getApiClient(invalidAuth);

    try {
      await client.generateCompletions();
    } catch (error) {
      expect(fetchMock.mock.calls[0][1].headers['Authorization']).toBe(`Bearer ${invalidAuth.apiKey}`);
      expect(error.message).toEqual('Invalid or missing API key');
    }
  });

  // Example test for handling long responses
  it('should paginate through large request data correctly', async () => {
    const mockPage1 = { data: Array(50).fill({ id: 1, value: 'item1' }) };
    const mockPage2 = { data: Array(50).fill({ id: 2, value: 'item2' }) };

    fetchMock.mockResponses([JSON.stringify(mockPage1), { status: 200 }], [JSON.stringify(mockPage2), { status: 200 }]);

    const client = getApiClient();
    const results = await client.fetchPaginatedData(2, 100);

    expect(results).toEqual([...mockPage1.data, ...mockPage2.data]);
    expect(fetchMock.mock.calls.length).toBe(2);
    expect(fetchMock.mock.lastCall[0]).toContain('page=2');
  });
});