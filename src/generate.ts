import * as fs from 'fs-extra';
import * as glob from 'glob';
import generateComponents from './generate-components';
import generateSvgDefinition from './generate-svg-definition';

export default async function(inputPath: string, outputPath: string) {
  if (!fs.pathExistsSync(inputPath)) {
    throw new Error(`Input path does not exist`);
  }

  const filePaths = glob.sync(`${inputPath}/**/*.svg`);
  const output: SvgDefinition[] = [];

  for (const filePath of filePaths) {
    const svg = fs.readFileSync(`${filePath}`, 'utf8');
    try {
      output.push(await generateSvgDefinition(filePath, svg));
    } catch (err) {
      console.error(`Failed to parse ${filePath}`, err);
      throw err;
    }
  }

  fs.mkdirpSync(`${outputPath}`);

  fs.writeFileSync(
    `${outputPath}/schema.json`,
    JSON.stringify(
      output.map(definition => {
        const { svg, ...rest } = definition;
        return rest;
      }),
      null,
      2
    )
  );

  await generateComponents(output, inputPath, outputPath);
}
