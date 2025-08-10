#!/usr/bin/env node

// Prefer tsx over ts-node for better ESM support
process.env.NODE_OPTIONS = '--loader tsx/esm --no-warnings ' + (process.env.NODE_OPTIONS || '');

import {execute} from '@oclif/core'

await execute({dir: import.meta.url, development: true})