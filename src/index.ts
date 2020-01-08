#!/usr/bin/env node

import { demandCommand } from 'yargs';
import * as path from 'path';
import generate from './generate';

const argv = demandCommand(2).argv;

async function main() {
  const inputPath = argv._[0];
  const outputPath = argv._[1];
  try {
    await generate(
      path.normalize(inputPath as string),
      path.normalize(outputPath as string)
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
