import { describe, it, expect, beforeEach, vi } from 'vitest';
import provider from '../providers/openrouter.js';

describe('OpenRouter Provider Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('processes valid response correctly', async () => {
        const mockResponse = { id: 'valid_id', body: { output: 'test completion' } };
        vi.spyOn(provider, 'fetchData').mockResolvedValue(mockResponse);

        const result = await provider.fetchData();
        expect(result).toEqual(mockResponse);
    });

    it('normalizes 404 responses', async () => {
        const mockResponse = { error: 'Not found' };
        vi.spyOn(provider, 'processResponse').mockResolvedValue({ statusCode: 404, apiResponse: mockResponse });

        const result = await provider.processResponse({});
        expect(result.statusCode).toBe(404);
        expect(result.apiResponse).toEqual(mockResponse);
    });

    it('surfaces network errors', async () => {
        vi.spyOn(provider, 'fetchData').mockRejectedValue(new Error('Network error'));

        await expect(provider.fetchData()).rejects.toThrowError('Network error');
    });
});