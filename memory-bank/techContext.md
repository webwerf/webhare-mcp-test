# WebHare MCP Server Technical Context

## Technologies Used

### Core Technologies
- **TypeScript**: The server is written in TypeScript for type safety and better developer experience.
- **Node.js**: The runtime environment for the server.
- **MCP SDK**: The Model Context Protocol SDK for creating MCP servers.

### Dependencies
- **@modelcontextprotocol/sdk**: The official MCP SDK for creating MCP servers.
- **axios**: HTTP client for making API requests.
- **child_process**: Node.js module for executing shell commands.
- **fs**: Node.js module for file system operations.
- **path**: Node.js module for path manipulation.
- **os**: Node.js module for operating system utilities.

## Development Setup

### Project Structure
```
/Users/wouter/Documents/Cline/MCP/webhare-server/
├── README.md           # Documentation
├── package.json        # Project configuration
├── tsconfig.json       # TypeScript configuration
├── src/
│   └── index.ts        # Main server implementation
└── build/              # Compiled JavaScript (generated)
```

### Build Process
The server is built using the TypeScript compiler (tsc). The build process:
1. Compiles TypeScript to JavaScript
2. Makes the main script executable (chmod 755)

Build command:
```
npm run build
```

## Technical Constraints

### WebHare CLI Dependency
- The server requires the WebHare CLI to be installed on the host machine.
- It uses the WebHare CLI to execute WebHare commands.
- The WebHare CLI path is configured in the MCP settings.

### Security Considerations
- The server executes commands on the host machine, which could be a security risk if not properly validated.
- It currently doesn't implement authentication for WebHare operations.

## Integration Points

### WebHare CLI Integration
- Uses the WebHare CLI to execute WebHare commands
- Retrieves information from WebHare instances
- Runs WebHare scripts

## Configuration

### Environment Variables
- `WEBHARE_CLI_PATH`: Path to the WebHare CLI executable (default: "/Users/wouter/projects/webhare/whtree/bin/wh")

### MCP Settings
The server is configured in the MCP settings file:
```json
{
  "mcpServers": {
    "webhare-server": {
      "command": "node",
      "args": ["/Users/wouter/Documents/Cline/MCP/webhare-server/build/index.js"],
      "disabled": false,
      "autoApprove": [],
      "env": {
        "WEBHARE_CLI_PATH": "/Users/wouter/projects/webhare/whtree/bin/wh"
      }
    }
  }
}
```

## Exposed Functionality

### Tools
- `wh_info`: Get information about the WebHare installation
- `wh_command`: Execute a command in the WebHare directory
- `wh_cli`: Execute a WebHare CLI command
- `wh_list_modules`: List all installed WebHare modules (returns a structured JSON with modules array and count)
- `wh_status`: Check if WebHare is installed and running (returns a structured JSON with installation and running status)

### Resources
- `webhare://installation/local`: Information about the local WebHare installation

## Error Handling

The server implements error handling for:
- Command execution failures
- Invalid requests
- WebHare CLI errors

Errors are returned with appropriate error codes and messages.

## WebHare CLI Commands

The server supports all WebHare CLI commands, including:

- `isrunning`: Check if WebHare is running
- `getmodulelist`: Get list of installed modules
- `getrootdir`: Get the WebHare installation root directory
- `getdatadir`: Get the WebHare installation data directory
- `dirs`: Show paths and environment settings
- `run`: Run a WebHare script
- `console`: Run WebHare in console mode
- `backuplocal`: Create a local snapshot backup of WebHare
- `cachereset`: Clear all caches
- `pstree`: Show WebHare processes
- `terminate`: Terminate all WebHare processes nicely
- `kill`: Kill all WebHare processes abruptly

And many more as listed in the WebHare CLI documentation.

## Implementation Details

### WebHare Status Checking
The server checks if WebHare is installed and running by:
1. Checking if the WebHare CLI executable exists
2. Executing the `isrunning` command to check if WebHare is running

```typescript
async function checkWebHareStatus(): Promise<{ installed: boolean; running: boolean }> {
  try {
    // Check if WebHare CLI exists
    const installed = existsSync(WEBHARE_CLI_PATH);
    
    if (!installed) {
      return { installed, running: false };
    }
    
    // Check if WebHare is running
    try {
      const output = await executeWebHareCommand("isrunning");
      // isrunning exits with code 0 if running, 1 if not
      // Since we got here without an error, it's running
      return { installed, running: true };
    } catch (error) {
      // If isrunning fails with an error, WebHare is not running
      return { installed, running: false };
    }
  } catch (error) {
    // If any other error occurs, assume WebHare is not installed or running
    return { installed: false, running: false };
  }
}
```

### WebHare Command Execution
The server executes WebHare commands by:
1. Constructing the full command with proper escaping
2. Executing the command using Node.js child_process
3. Handling the command output and errors

```typescript
async function executeWebHareCommand(command: string, args: string[] = []): Promise<string> {
  try {
    // Construct the full command with proper escaping
    const fullCommand = `${WEBHARE_CLI_PATH} ${command} ${args.map(arg => `"${arg.replace(/"/g, '\\"')}"`).join(' ')}`;
    
    // Execute the command
    const { stdout, stderr } = await executeCommand(fullCommand);
    
    if (stderr) {
      console.error(`WebHare command stderr: ${stderr}`);
    }
    
    return stdout.trim();
  } catch (error: any) {
    throw new McpError(
      ErrorCode.InternalError,
      `WebHare command execution failed: ${error.message}`
    );
  }
}
