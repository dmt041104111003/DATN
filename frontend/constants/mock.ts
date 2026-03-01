export const MOCK_TRACE_DATA = {
  policyId: 'a1b2c3d4e5f6789012345678901234567890abcdef',
  assetName: 'TraceableAsset001',
  createdAt: '2025-03-02T10:00:00Z',
  steps: [
    { step: 1, location: 'Farm A, Lam Dong', timestamp: '2025-01-15', coords: '11.9404,108.4583' },
    { step: 2, location: 'Processor B, Ho Chi Minh', timestamp: '2025-01-20', coords: '10.8231,106.6297' },
    { step: 3, location: 'Warehouse C, Hanoi', timestamp: '2025-01-25', coords: '21.0285,105.8542' },
  ],
};

export const MOCK_ROUTE_COORDS = '11.9404,108.4583;10.8231,106.6297;21.0285,105.8542';

export const MOCK_ROUTE_LABEL = 'Lam Dong → Ho Chi Minh City → Hanoi';
