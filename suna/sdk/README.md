# BKS cBIM AI SDK

[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://python.org)

> [!WARNING]
> **This SDK is currently in early development and is NOT ready for production use.**
> 
> The API is subject to breaking changes, features may be incomplete, and documentation may be outdated. Use at your own risk.

A Python SDK that enables you to create, manage, and interact with AI Workers on [BKS cBIM AI](https://www.cbim.com).

## 📦 Installation

Install directly from the GitHub repository:

```bash
pip install "cbim @ git+https://github.com/cbim-ai/suna.git@main#subdirectory=sdk"
```

Or using uv:

```bash
uv add "cbim @ git+https://github.com/cbim-ai/suna.git@main#subdirectory=sdk"
```

## 🔧 Quick Start

```python
import asyncio
from cbim import cbim

async def main():
    mcp_tools = cbim.MCPTools(
        "http://localhost:4000/mcp/",  # Point to any HTTP MCP server
        "BKS cBIM AI",
    )
    await mcp_tools.initialize()

    # Initialize the client
    client = cbim.BKS cBIM AI(api_key="your-api-key")

    # Create an agent
    agent = await client.Agent.create(
        name="My Assistant",
        system_prompt="You are a helpful AI assistant.",
        mcp_tools=[mcp_tools],
        allowed_tools=["get_wind_direction"],
    )

    # Create a conversation thread
    thread = await client.Thread.create()

    # Run the agent
    run = await agent.run("Hello, how are you?", thread)

    # Stream the response
    stream = await run.get_stream()
    async for chunk in stream:
        print(chunk, end="")

if __name__ == "__main__":
    asyncio.run(main())
```

## 🔑 Environment Setup

Get your API key from [https://www.cbim.com/settings/api-keys](https://www.cbim.com/settings/api-keys)

## 🧪 Running Examples

```bash
# Install dependencies
uv sync

# Run the main example
PYTHONPATH=$(pwd) uv run example/example.py
```
