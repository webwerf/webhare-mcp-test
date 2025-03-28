#!/bin/bash

# Wrapper script for WebHare CLI
# This script sources the user's shell profile and then runs the WebHare CLI

# Source the user's shell profile
if [ -f ~/.bash_profile ]; then
  source ~/.bash_profile
elif [ -f ~/.profile ]; then
  source ~/.profile
fi

# Run the WebHare CLI with the provided arguments
/Users/wouter/projects/webhare/whtree/bin/wh "$@"
