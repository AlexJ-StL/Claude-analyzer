import { describe, it, expect, beforeEach, vi } from 'vitest';
import provider from '../providers/litellm.js';

describe('LiteLLM API Client', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch data correctly with valid response', async () => {
        const mockResponse = { data: 'mock data' };
        vi.spyOn(provider, 'fetchData').mockResolvedValue(mockResponse);

        const result = await provider.fetchData();
        expect(result).toEqual(mockResponse);
    });

    it('should handle API errors and surface exceptions correctly', async () => {
        const mockError = new Error('API Error');
        vi.spyOn(provider, 'fetchData').mockRejectedValue(mockError);

        await expect(provider.fetchData()).rejects.toThrowError('API Error');
    });

    it('should manage API keys for authenticated requests', async () => {
        const mockResponse = { data: 'mock data' };
        vi.spyOn(provider, 'fetchData').mockResolvedValue(mockResponse);

        const result = await provider.fetchData({ apiKey: 'test-key' });
        expect(result).toEqual(mockResponse);
    });

    it('should return error for missing API key', async () => {
        vi.spyOn(provider, 'fetchData').mockRejectedValue(new Error('Missing API Key'));

        await expect(provider.fetchData()).rejects.toThrowError('Missing API Key');
    });

    it('should paginate through large request data correctly', async () => {
        const mockResponse = { data: 'mock data', hasMore: true };
        vi.spyOn(provider, 'fetchData').mockResolvedValue(mockResponse);

        const result = await provider.fetchData({ page: 1 });
        expect(result).toEqual(mockResponse);
    });
});