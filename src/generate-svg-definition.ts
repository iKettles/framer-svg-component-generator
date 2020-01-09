import { parse, stringify } from 'svgson';
import * as path from 'path';

export default async function(
  filePath: string,
  svg: string,
  inputPath: string,
  outputPath: string
): Promise<SvgDefinition> {
  let parsedSvg = await parse(svg);
  const filename = path.basename(filePath);
  const relativeOutputDirectory = `./${filePath
    .replace(inputPath, '')
    .replace(filename, '')}`;

  const metadataDefinitions: MetadataDefinition = parsedSvg.children.find(
    (child: any) => child.name === 'metadata'
  );

  if (!metadataDefinitions) {
    throw new Error(`Could not find metadata for ${filePath}`);
  }

  // Filter metadata from SVG
  parsedSvg.children = parsedSvg.children.filter(
    (child: any) => child.name !== 'metadata'
  );

  return metadataDefinitions.children.reduce<SvgDefinition>(
    (acc: any, definition) => {
      acc.metadata[definition.name] = definition.children.map(child => {
        switch (definition.name) {
          case 'keywords':
            return parseKeywords(child.value);
          default:
            return child.value;
        }
      })[0];
      return acc;
    },
    {
      filename,
      path: filePath,
      outputDirectory: `${outputPath}${
        outputPath.endsWith('/') ? '' : '/'
      }${relativeOutputDirectory}`,
      relativeOutputDirectory,
      metadata: {
        name: filename.replace('.svg', '')
      },
      svg: await stringify(parsedSvg)
    }
  ) as SvgDefinition;
}

function parseKeywords(keywords: string): string[] {
  return keywords
    .split(',')
    .map(value => value.trim())
    .filter(value => !!value.length);
}
