import { describe, it, expect, beforeEach } from '@jest/globals';
import provider from '../providers/openrouter.js';
import fetchMock from 'jest-fetch-mock';

beforeEach(() => {
  fetchMock.enableMocks();
});

// Helper to create mock HTTP responses
function mockApiResponse(status, body) {
  fetchMock.mockResponseOnce(JSON.stringify(body), {
    status: status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

describe('OpenRouter Provider Tests', () => {
  it('processes valid response correctly', async () => {
    const mockSuccess = provider.fetchData.mockImplementation(() =>
      Promise.resolve({
        id: 'valid_id',
        body: { output: 'test completion' }
      })
    );

    mockApiResponse(200, {
      id: 'valid_id',
      body: { output: 'test completion' }
    });

    const result = await provider.processResponse({ model: 'gpt2', apiKey: 'test-key' });
    expect(result.statusCode).toBe(200);
    expect(result.apiResponse.id).toBe('valid_id');
    expect(result.apiResponse.body.output).toBe('test completion');
    expect(fetchMock).toHaveBeenCalledWith('https://api.openrouter.ai/v1/completions');
  });

  it('normalizes 404 responses', async () => {
    mockApiResponse(404, { error: 'Not found' });

    const result = await provider.processResponse({});
    expect(result.statusCode).toBe(404);
    expect(result.apiResponse).toEqual({ error: 'Not found' });

    // Verify error response content
    const errorResponse = await fetchMock.mock.calls[0].promise;
    expect(errorResponse).toHaveProperty('status', 404);
    expect(errorResponse).toHaveProperty('body.error', 'Not found');
  });

  it('surfaces network errors', async () => {
    // Mock network error
    provider.fetchData.mockImplementation(() => Promise.reject(new Error('Network error')));

    await expect(provider.processResponse({})).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Network error"`
    );
  });
});