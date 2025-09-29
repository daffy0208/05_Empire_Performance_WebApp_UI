# MCP Integration - Archon Server

## Overview
The Empire Performance Coaching project has been successfully configured with the Archon Model Context Protocol (MCP) server for enhanced AI capabilities and tools integration.

## Configuration Details

### MCP Server Connection
- **Server Name**: archon
- **Transport Type**: HTTP
- **URL**: http://localhost:8051/mcp
- **Status**: ✅ Connected

### Setup Process
1. **Installation Command**:
   ```bash
   claude mcp add --transport http archon http://localhost:8051/mcp
   ```

2. **Configuration Location**:
   - Global: `/home/david/.claude.json`
   - Project-specific: Configured under project path `/mnt/c/Users/david/OneDrive - Qolcom/AI/AI_Development_Projects/05_Empire_Performance_WebApp_UI`

### Verification
- ✅ **Connection Status**: Server responds successfully
- ✅ **Health Check**: `claude mcp list` shows "Connected" status
- ✅ **HTTP Response**: Server is accepting connections (returns 406 for direct curl, which is expected for MCP protocol)

## Available Features

### Archon MCP Tools
Based on your previous experience with Archon MCP in Cursor, the available tools include:
- `health_check` - Server health monitoring
- `session_info` - Session information and management
- `rag_knowledge_base` - RAG (Retrieval Augmented Generation) knowledge base access

### Integration Benefits
1. **Enhanced AI Capabilities**: Access to Archon's specialized tools and knowledge base
2. **RAG Integration**: Knowledge base queries for more contextual responses
3. **Session Management**: Better handling of conversation context and state
4. **Health Monitoring**: Real-time status of MCP services

## Project Impact

### Empire Performance Coaching Platform
The MCP integration enhances the Empire Performance Coaching platform by providing:

1. **Intelligent Assistance**: Better AI responses with access to knowledge bases
2. **Development Support**: Enhanced code analysis and recommendations
3. **Documentation Aid**: Improved understanding of complex coaching business logic
4. **Testing Support**: Better test generation and validation

### Usage in Development
- **Code Analysis**: Archon can provide deeper insights into React/TypeScript patterns
- **Database Queries**: Enhanced support for Supabase schema understanding
- **Component Design**: Better UI/UX recommendations for coaching interfaces
- **Business Logic**: Improved understanding of multi-role dashboard requirements

## Technical Notes

### Current Status
- **Empire Performance App**: Running on localhost:4028 ✅
- **Archon MCP Server**: Running on localhost:8051 ✅
- **Integration**: Fully functional ✅

### Configuration Files Modified
- `~/.claude.json` - Added Archon MCP server configuration
- `.claude/settings.local.json` - Updated permissions for MCP commands

### Permissions
Current allowed MCP-related tools:
- `mcp__ide__getDiagnostics`
- `claude mcp:*` (all claude mcp commands)

## Future Enhancements

### Potential Integrations
1. **Supabase Integration**: Direct MCP tools for database operations
2. **Testing Automation**: MCP tools for Playwright/Vitest integration
3. **Deployment Tools**: MCP integration for CI/CD processes
4. **Documentation Generation**: Automated docs from codebase analysis

### Monitoring
- Regular health checks using `claude mcp list`
- Monitor Archon server logs on port 8051
- Track MCP tool usage and performance

## Troubleshooting

### Common Issues
1. **Connection Failed**: Ensure Archon server is running on localhost:8051
2. **Permission Denied**: Check `.claude/settings.local.json` permissions
3. **Tool Not Found**: Verify MCP server health with `claude mcp list`

### Support Commands
```bash
# Check MCP server status
claude mcp list

# Get detailed server info
claude mcp get archon

# Remove server if needed
claude mcp remove archon
```

---

**Last Updated**: 2025-09-29
**Integration Status**: ✅ Active and Operational
**Next Review**: Monitor usage patterns and expand tool integration