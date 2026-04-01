/**
 * Message and streaming utility functions
 * Re-exports from @bks/cbim-shared plus local extensions
 */

// Types from shared package
export type {
  UnifiedMessage,
  ParsedContent,
  ParsedMetadata,
  MessageGroup,
  AgentStatus,
  StreamingToolCall,
  StreamingMetadata,
} from '@bks/cbim-shared';

// Local type extensions
export type {
  ToolCallData,
  ToolResultData,
  StreamingState,
  ToolCallDisplayInfo,
} from './types';

// Streaming utilities from shared package
export {
  extractTextFromPartialJson,
  extractTextFromStreamingAskComplete,
  isAskOrCompleteTool,
  getAskCompleteToolType,
  extractTextFromArguments,
  findAskOrCompleteTool,
  extractStreamingAskCompleteContent,
  shouldSkipStreamingRender,
} from '@bks/cbim-shared';

// Tool call utilities (portable)
export {
  safeJsonParse,
  parseToolCallArguments,
  getUserFriendlyToolName,
  normalizeToolName,
  getToolDisplayParam,
  parseToolCallForDisplay,
  extractAndParseToolCalls,
  isFileOperationTool,
  isCommandTool,
  isWebTool,
  getToolCategory,
  type ParsedToolCallData,
} from './tool-call-utils';

// Assistant message renderer (web-specific due to React components)
export { 
  renderAssistantMessage, 
  type AssistantMessageRendererProps 
} from './assistant-message-renderer';
