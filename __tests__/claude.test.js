import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import provider from '../providers/claude.js';

// Mock server setup
const server = setupServer(
	http.post('https://api.anthropic.com/v1/complete', () => {
		return HttpResponse.json({ completions: ['Mock response'] });
	})
);

// Start and stop the mock server for each test
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Claude Provider Tests', () => {
	it('should generate a prompt', () => {
		// Mock project details
		const projectDetails = {
			name: 'Sample Project',
			files: ['file1.js', 'file2.js'],
			dependencies: ['lodash', 'react'],
		};

		// Generate prompt from project details
		const prompt = provider.formatPrompt(projectDetails);

		// Verify the prompt structure (ensure relevant parts are structured as expected)
		expect(prompt).toContain('Sample Project');
		expect(prompt).toContain('file1.js');
		expect(prompt).toContain('lodash');
	});

	it('should handle successful API response', async () => {
		// Mock request data
		const inputData = { text: 'Hello world!' };

		// Generate response
		const response = await provider.sendRequest(inputData);

		// Validate response structure
		expect(response).toBeTruthy();
		expect(response).toContain('Mock response');
	});

	it('should handle API errors gracefully', async () => {
		// Modify server to simulate an API error
		server.use(
			http.post('https://api.anthropic.com/v1/complete', () => {
				return HttpResponse.json({ error: 'Something went wrong' }, { status: 500 });
			})
		);

		// Test with invalid input
		const invalidData = { invalid: 'data' };
		const result = await provider.sendRequest(invalidData);
		expect(result).toBeNull();
	});
});
