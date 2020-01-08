import * as fs from 'fs-extra';
import generateComponents from './generate-components';
import generateSvgDefinition from './generate-svg-definition';

export default async function(inputPath: string, outputPath: string) {
  const svgFileNames = (fs.readdirSync(inputPath) as string[]).filter(
    name => name !== '.DS_Store'
  );

  const output: SvgDefinition[] = [];

  for (const filename of svgFileNames) {
    const svg = fs.readFileSync(`${inputPath}/${filename}`, 'utf8');
    try {
      output.push(await generateSvgDefinition(filename, svg));
    } catch (err) {
      console.error(`Failed to parse ${filename}`, err);
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

  await generateComponents(output, outputPath);
}
