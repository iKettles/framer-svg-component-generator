import { parse, stringify } from 'svgson';
import { camelCase, startCase } from 'lodash';
import * as path from 'path';

export default async function (
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

  const metadataDefinitions = parsedSvg.children.find(
    (child: any) => child.name === 'metadata'
  );

  // Filter metadata from SVG
  parsedSvg.children = parsedSvg.children.reduce((acc: any[], child: any) => {
    if (child.name !== 'metadata') {
      acc.push(recursivelyRemoveIrrelevantAttributes(child));
    }
    return acc;
  }, []);

  return {
    id: `${relativeOutputDirectory.replace('./', '')}${name}`,
    filename,
    path: filePath,
    outputDirectory: `${outputPath}${
      outputPath.endsWith('/') ? '' : '/'
    }${relativeOutputDirectory}`,
    relativeOutputDirectory,
    metadata: parseMetadata(name, metadataDefinitions),
    svg: await stringify(parsedSvg),
  } as SvgDefinition;
}

function parseKeywords(keywords: string): string[] {
  return keywords
    .split(',')
    .map((value) => value.trim())
    .filter((value) => !!value.length);
}

function parseMetadata(
  name: string,
  metadataDefinitions: ParsedSvgChild | undefined
): SvgMetadata {
  let toReturn: SvgMetadata = {
    name,
    sanitizedName: sanitizeSVGName(name),
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

function recursivelyRemoveIrrelevantAttributes(parsedSvgChild: ParsedSvgChild) {
  const svgChildCopy = { ...parsedSvgChild };

  if (svgChildCopy.attributes.hasOwnProperty('fill')) {
    delete svgChildCopy.attributes.fill;
  }

  if (svgChildCopy.children.length > 0) {
    svgChildCopy.children = svgChildCopy.children.map(
      recursivelyRemoveIrrelevantAttributes
    );
  }

  return svgChildCopy;
}

const reservedWords = ['Error'];

function sanitizeSVGName(name: string) {
  const sanitizedName = startCase(camelCase(name)).replace(/ /g, '');

  if (reservedWords.includes(sanitizedName) || sanitizedName[0].match(/\d/g)) {
    return `Icon${sanitizedName}`;
  }

  return sanitizedName;
}
