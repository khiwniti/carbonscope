#!/bin/bash
# Monitor Phase 2 parallel agents in tmux split view

SESSION="phase2-agents"
OUTPUT_DIR="/tmp/claude-1000/-teamspace-studios-this-studio-comprehensive-suna-bim-agent/7166f407-b5a4-4420-bf5b-df67cfa675d3/tasks"

# Agent output files
WAVE2="$OUTPUT_DIR/a3d4b0d1886bc99e4.output"  # Material Matching
WAVE3="$OUTPUT_DIR/a162e9462b409f107.output"  # Carbon Pipeline
WAVE4="$OUTPUT_DIR/a16a7eeabe32cd26c.output"  # Redis Caching
WAVE5="$OUTPUT_DIR/a5edae9f7a5f0390c.output"  # API Endpoints

# Kill existing session if it exists
tmux kill-session -t $SESSION 2>/dev/null

# Create new session
tmux new-session -d -s $SESSION

# Split into 4 panes (2x2 grid)
tmux split-window -h -t $SESSION
tmux split-window -v -t $SESSION:0.0
tmux split-window -v -t $SESSION:0.1

# Set up each pane with agent monitoring
tmux send-keys -t $SESSION:0.0 "echo '=== WAVE 2: Material Matching ===' && tail -f $WAVE2 2>/dev/null || echo 'Waiting for agent to start...'" C-m
tmux send-keys -t $SESSION:0.1 "echo '=== WAVE 3: Carbon Pipeline ===' && tail -f $WAVE3 2>/dev/null || echo 'Waiting for agent to start...'" C-m
tmux send-keys -t $SESSION:0.2 "echo '=== WAVE 4: Redis Caching ===' && tail -f $WAVE4 2>/dev/null || echo 'Waiting for agent to start...'" C-m
tmux send-keys -t $SESSION:0.3 "echo '=== WAVE 5: API Endpoints ===' && tail -f $WAVE5 2>/dev/null || echo 'Waiting for agent to start...'" C-m

# Select first pane and attach
tmux select-pane -t $SESSION:0.0
tmux attach-session -t $SESSION
