module.exports = {
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
};