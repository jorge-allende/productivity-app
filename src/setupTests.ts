// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Convex API
jest.mock('../convex/_generated/api', () => ({
  api: {
    auth: {
      syncUser: jest.fn(),
      joinWorkspaceViaInvitation: jest.fn(),
      getCurrentUser: jest.fn(),
      getUserWorkspace: jest.fn(),
    },
    tasks: {
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workspaces: {
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));
