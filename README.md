# WebHare MCP Server

This Model Context Protocol (MCP) server provides a simple interface to interact with the WebHare installation.

## Installing as a WebHare Module
- We except to be named `mcp_test`
- Install us as `whdata/installedmodules/webwerf/mcp_test`

### Claude Desktop

Set this to `~/Library/Application Support/Claude/claude_desktop_config.json` (or add it to the mcpServers)

```json
{
  "mcpServers": {
      "webhare": {
          "command": "/Users/arnold/projects/webhare-runkit/bin/runkit",
          "args": [
              "wh",
              "run",
              "mod::mcp_test/src/index.ts"
          ]
      }
  }
}
```

See also: https://github.com/davidteren/claude-server/blob/main/docs/CLAUDE_DESKTOP_INTEGRATION.md

## Features

- Get information about the WebHare installation
- Execute commands in the WebHare directory
- Execute WebHare CLI commands directly

## Installation

The server has been installed and configured for use with Claude. The configuration is stored in:
```
~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

The server uses the WebHare installation at:
```
~/projects/webhare/whtree
```

And the WebHare data root at:
```
~/whrunkit/myserver/whdata/
```

## Usage

### Get WebHare Installation Information

```
<use_mcp_tool>
<server_name>webhare-server</server_name>
<tool_name>wh_info</tool_name>
<arguments>
{}
</arguments>
</use_mcp_tool>
```

### Execute a Command in the WebHare Directory

```
<use_mcp_tool>
<server_name>webhare-server</server_name>
<tool_name>wh_command</tool_name>
<arguments>
{
  "command": "ls -la bin"
}
</arguments>
</use_mcp_tool>
```

### Execute a WebHare CLI Command

```
<use_mcp_tool>
<server_name>webhare-server</server_name>
<tool_name>wh_cli</tool_name>
<arguments>
{
  "command": "dirs",
  "args": []
}
</arguments>
</use_mcp_tool>
```

## Development

To make changes to the server:

1. Navigate to the server directory:
   ```
   cd ~/Documents/Cline/MCP/webhare-server
   ```

2. Edit the source code in the `src` directory

3. Build the server:
   ```
   npm run build
   ```

4. Restart Claude to apply changes

## Troubleshooting

### WebHare Installation Not Found

If the server cannot find the WebHare installation, make sure it exists at:
```
~/projects/webhare/whtree
```

### WebHare Data Root Not Found

If the server cannot find the WebHare data root, make sure it exists at:
```
~/whrunkit/myserver/whdata/
```

### Command Execution Errors

If you get errors when executing commands, check the error message for details. Common issues include:

- WebHare not installed or not in the specified path
- WebHare data root not set correctly
- WebHare not running (for commands that require a running WebHare instance)
- Invalid command or arguments
- Permission issues
