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
  const name = filename.replace('.svg', '');
  const relativeOutputDirectory = `./${filePath
    .replace(inputPath, '')
    .replace(filename, '')}`;

  const metadataDefinitions: MetadataDefinition = parsedSvg.children.find(
    (child: any) => child.name === 'metadata'
  );

  // Filter metadata from SVG
  parsedSvg.children = parsedSvg.children.filter(
    (child: any) => child.name !== 'metadata'
  );

  return {
    id: `${relativeOutputDirectory.replace('./', '')}${name}`,
    filename,
    path: filePath,
    outputDirectory: `${outputPath}${
      outputPath.endsWith('/') ? '' : '/'
    }${relativeOutputDirectory}`,
    relativeOutputDirectory,
    metadata: parseMetadata(name, metadataDefinitions),
    svg: await stringify(parsedSvg)
  } as SvgDefinition;
}

function parseKeywords(keywords: string): string[] {
  return keywords
    .split(',')
    .map(value => value.trim())
    .filter(value => !!value.length);
}

function parseMetadata(name: string, metadataDefinitions: any): SvgMetadata {
  let toReturn: SvgMetadata = {
    name
  };

  if (!metadataDefinitions) {
    return toReturn;
  }

  return (metadataDefinitions.children as any[]).reduce<SvgMetadata>(
    (acc, definition) => {
      acc[definition.name] = definition.children.map((child: any) => {
        switch (definition.name) {
          case 'keywords':
            return parseKeywords(child.value);
          default:
            return child.value;
        }
      })[0];
      return acc;
    },
    toReturn
  ) as SvgMetadata;
}
