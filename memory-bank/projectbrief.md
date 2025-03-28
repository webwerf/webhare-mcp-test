# WebHare MCP Server Project Brief

## Project Overview

The WebHare MCP Server is a Model Context Protocol (MCP) server that provides tools for interacting with the WebHare platform. It enables Claude to execute WebHare CLI commands, check WebHare status, and get information about the WebHare installation, making it easier to work with the WebHare platform.

## Core Requirements

1. **WebHare CLI Integration**
   - Execute WebHare CLI commands
   - Check WebHare status
   - List installed modules
   - Run WebHare scripts

2. **WebHare Status Monitoring**
   - Check if WebHare is installed
   - Check if WebHare is running
   - Get WebHare installation information

3. **Resource Exposure**
   - Expose WebHare installation as a resource
   - Provide detailed installation information

## Technical Implementation

The server is implemented as a TypeScript application using the MCP SDK. It uses:

- Node.js child_process module for executing commands
- WebHare CLI for WebHare-specific operations
- File system operations for checking WebHare installation

## Project Structure

```
/Users/wouter/Documents/Cline/MCP/webhare-server/
├── README.md           # Documentation
├── package.json        # Project configuration
├── tsconfig.json       # TypeScript configuration
├── src/
│   └── index.ts        # Main server implementation
└── build/              # Compiled JavaScript (generated)
```

## Configuration

The server is configured in the MCP settings file:
```
/Users/wouter/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

The key configuration parameter is:
- `WEBHARE_CLI_PATH`: Path to the WebHare CLI executable (default: "/Users/wouter/projects/webhare/whtree/bin/wh")

## Usage

The server exposes several tools that can be used with the `use_mcp_tool` function:

```
<use_mcp_tool>
<server_name>webhare-server</server_name>
<tool_name>wh_status</tool_name>
<arguments>
{}
</arguments>
</use_mcp_tool>
```

It also exposes resources that can be accessed with the `access_mcp_resource` function:

```
<access_mcp_resource>
<server_name>webhare-server</server_name>
<uri>webhare://installation/local</uri>
</access_mcp_resource>
```

## Future Enhancements

Potential future enhancements include:

1. **WebHare API Integration**
   - Direct API access for more advanced operations
   - Authentication support

2. **Module Management**
   - Install/update modules
   - Module configuration

3. **User Management**
   - List users
   - Manage user permissions
   - Create/update users

4. **Backup and Restore**
   - Create backups
   - Restore from backups
   - Manage backup history

5. **Monitoring and Logging**
   - Log retrieval and analysis
   - Performance monitoring

6. **Web UI**
   - Simple web UI for WebHare management
   - Dashboard for WebHare status
   - Command history and favorites
