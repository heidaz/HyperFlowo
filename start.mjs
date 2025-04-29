#!/usr/bin/env node

import { spawn } from 'child_process';

// Run serve command directly
const serve = spawn('npx', ['serve', '-s', 'dist', '-p', process.env.PORT || '3000'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

serve.on('close', (code) => {
  console.log(`serve process exited with code ${code}`);
  process.exit(code);
});

// Handle termination signals
process.on('SIGINT', () => {
  serve.kill('SIGINT');
});

process.on('SIGTERM', () => {
  serve.kill('SIGTERM');
}); 