import { vi } from 'vitest';

// Expose vi globally for mocking purposes
global.vi = vi;

// Mock fetch globally for API testing
global.fetch = vi.fn();
