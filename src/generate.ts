import * as fs from 'fs-extra';
import * as glob from 'glob';
import generators from './generators';

export default async function(inputPath: string, outputPath: string) {
  if (!fs.pathExistsSync(inputPath)) {
    throw new Error(`Input path does not exist`);
  }

  const filePaths = glob.sync(`${inputPath}/**/*.svg`);
  const output: SvgDefinition[] = [];

  for (const filePath of filePaths) {
    const svg = fs.readFileSync(`${filePath}`, 'utf8');
    try {
      output.push(await generators.svg(filePath, svg, inputPath, outputPath));
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
        const {
          svg,
          path,
          filename,
          outputDirectory,
          relativeOutputDirectory,
          ...rest
        } = definition;
        return rest;
      }),
      null,
      2
    )
  );

  await generators.components(output, inputPath, outputPath);
}
