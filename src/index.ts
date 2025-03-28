#!/usr/bin/env node

/**
 * WebHare MCP Server
 * 
 * This MCP server provides a simple interface to the WebHare CLI.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import { homedir } from "os";

// Promisify exec for async/await usage
const execAsync = promisify(exec);

// WebHare installation directory
const WEBHARE_DIR = `${homedir()}/projects/webhare/whtree`;
const WEBHARE_DATAROOT = `${homedir()}/whrunkit/myserver/whdata/`;

/**
 * Execute a shell command and return the result
 */
async function executeCommand(command: string): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
    }
    
    return stdout.trim();
  } catch (error: any) {
    if (error.stdout) {
      return error.stdout.trim();
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Command execution failed: ${error.message}`
    );
  }
}

/**
 * Execute a WebHare CLI command
 */
async function executeWebHareCommand(command: string, args: string[] = []): Promise<string> {
  try {
    // Create a temporary script to execute the WebHare command
    const scriptContent = `
#!/bin/bash
cd ${WEBHARE_DIR}
export HOME="${homedir()}"
export WEBHARE_DIR="${WEBHARE_DIR}"
export WEBHARE_DATAROOT="${WEBHARE_DATAROOT}"
export WEBHARE_BASEPORT=13679
export PATH="$PATH:/usr/local/bin:/opt/homebrew/bin"
source "${WEBHARE_DIR}/lib/wh-functions.sh"
./bin/wh ${command} ${args.join(' ')}
`;
    
    // Write the script to a temporary file
    const tempScriptPath = `/tmp/webhare-command-${Date.now()}.sh`;
    await executeCommand(`cat > ${tempScriptPath} << 'EOF'
${scriptContent}
EOF
chmod +x ${tempScriptPath}`);
    
    // Execute the script
    const output = await executeCommand(`${tempScriptPath}`);
    
    // Clean up the temporary script
    await executeCommand(`rm ${tempScriptPath}`);
    
    return output;
  } catch (error: any) {
    throw new McpError(
      ErrorCode.InternalError,
      `WebHare command execution failed: ${error.message}`
    );
  }
}

/**
 * Create the MCP server
 */
const server = new Server(
  {
    name: "webhare-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler for listing available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "wh_info",
        description: "Get information about the WebHare installation",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "wh_command",
        description: "Execute a command in the WebHare directory",
        inputSchema: {
          type: "object",
          properties: {
            command: {
              type: "string",
              description: "Command to execute"
            }
          },
          required: ["command"]
        }
      },
      {
        name: "wh_cli",
        description: "Execute a WebHare CLI command",
        inputSchema: {
          type: "object",
          properties: {
            command: {
              type: "string",
              description: "WebHare command to execute"
            },
            args: {
              type: "array",
              items: {
                type: "string"
              },
              description: "Command arguments"
            }
          },
          required: ["command"]
        }
      },
      {
        name: "wh_list_modules",
        description: "List all installed WebHare modules",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "wh_status",
        description: "Check if WebHare is installed and running",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ]
  };
});

/**
 * Handler for tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "wh_info": {
        // Get information about the WebHare installation
        const webhareExists = existsSync(WEBHARE_DIR);
        const webhareCliExists = existsSync(`${WEBHARE_DIR}/bin/wh`);
        const webhareFunctionsExists = existsSync(`${WEBHARE_DIR}/lib/wh-functions.sh`);
        const webhareDataRootExists = existsSync(WEBHARE_DATAROOT);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              webhareDir: WEBHARE_DIR,
              webhareDataRoot: WEBHARE_DATAROOT,
              webhareExists,
              webhareCliExists,
              webhareFunctionsExists,
              webhareDataRootExists,
              home: homedir()
            }, null, 2)
          }]
        };
      }
      
      case "wh_command": {
        const command = String(request.params.arguments?.command);
        
        // Execute the command
        const output = await executeCommand(`cd ${WEBHARE_DIR} && ${command}`);
        
        return {
          content: [{
            type: "text",
            text: output || "Command executed successfully with no output"
          }]
        };
      }
      
      case "wh_cli": {
        const command = String(request.params.arguments?.command);
        const args = request.params.arguments?.args as string[] || [];
        
        // Execute the WebHare CLI command
        const output = await executeWebHareCommand(command, args);
        
        return {
          content: [{
            type: "text",
            text: output || "Command executed successfully with no output"
          }]
        };
      }
      
      case "wh_list_modules": {
        // Execute the WebHare CLI command to list modules
        const output = await executeWebHareCommand("getmodulelist", []);
        
        // Format the output as a JSON array for better parsing
        const modules = output.split(/\s+/).filter(Boolean);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              modules: modules,
              count: modules.length
            }, null, 2)
          }]
        };
      }
      
      case "wh_status": {
        try {
          // Check if WebHare is running
          const output = await executeWebHareCommand("isrunning", []);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                installed: true,
                running: true,
                message: "WebHare is installed and running"
              }, null, 2)
            }]
          };
        } catch (error) {
          // If the command fails, WebHare might be installed but not running
          const webhareExists = existsSync(WEBHARE_DIR);
          const webhareCliExists = existsSync(`${WEBHARE_DIR}/bin/wh`);
          
          if (webhareExists && webhareCliExists) {
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  installed: true,
                  running: false,
                  message: "WebHare is installed but not running"
                }, null, 2)
              }]
            };
          } else {
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  installed: false,
                  running: false,
                  message: "WebHare is not installed"
                }, null, 2)
              }]
            };
          }
        }
      }
      
      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
    }
  } catch (error: any) {
    return {
      content: [{
        type: "text",
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});

/**
 * Start the server using stdio transport
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("WebHare MCP server running on stdio");
  
  // Log WebHare installation directory
  console.error(`Using WebHare installation at: ${WEBHARE_DIR}`);
  console.error(`Using WebHare data root at: ${WEBHARE_DATAROOT}`);
  
  // Check if WebHare installation directory exists
  const webhareExists = existsSync(WEBHARE_DIR);
  console.error(`WebHare installation exists: ${webhareExists}`);
  
  // Check if WebHare CLI exists
  const webhareCliExists = existsSync(`${WEBHARE_DIR}/bin/wh`);
  console.error(`WebHare CLI exists: ${webhareCliExists}`);
  
  // Check if WebHare functions exist
  const webhareFunctionsExists = existsSync(`${WEBHARE_DIR}/lib/wh-functions.sh`);
  console.error(`WebHare functions exist: ${webhareFunctionsExists}`);
  
  // Check if WebHare data root exists
  const webhareDataRootExists = existsSync(WEBHARE_DATAROOT);
  console.error(`WebHare data root exists: ${webhareDataRootExists}`);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
