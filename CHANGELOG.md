# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-01

### Added

- Initial release of the n8n TypeScript SDK
- **Workflows API**
  - Create, read, update, delete workflows
  - Activate and deactivate workflows
  - Manage workflow tags
  - Transfer workflows between projects
- **Executions API**
  - List executions with filtering by status, workflow, project
  - Get execution details with optional data
  - Delete executions
  - Convenience methods for running, failed, successful, and waiting executions
- **Credentials API**
  - Create and delete credentials
  - List credentials
  - Get credential schemas
  - Transfer credentials between projects
- **Users API**
  - List, get, create, and delete users
  - Invite users with specific roles
- **Tags API**
  - Full CRUD operations for tags
- **Variables API**
  - Create, update, delete environment variables
  - List variables with project filtering
- **Projects API**
  - Full CRUD operations for projects
- **Audit API**
  - Generate security audits with configurable categories
- **Error Handling**
  - Typed errors: `N8nApiError`, `N8nTimeoutError`, `N8nNetworkError`, `N8nAbortError`, `N8nConfigError`
  - Convenience methods for checking error types
- **TypeScript Support**
  - Full type definitions for all API operations
  - Exported types for use in applications
- **Additional Features**
  - Automatic pagination support
  - Request timeout configuration
  - Request cancellation via AbortController
  - Custom headers support
