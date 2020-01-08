import { parse, stringify } from 'svgson';

export default async function(
  filename: string,
  svg: string
): Promise<SvgDefinition> {
  let parsedSvg = await parse(svg);

  const metadataDefinitions: MetadataDefinition = parsedSvg.children.find(
    (child: any) => child.name === 'metadata'
  );

  if (!metadataDefinitions) {
    throw new Error(`Could not find metadata for ${filename}`);
  }

  // Filter metadata from SVG
  parsedSvg.children = parsedSvg.children.filter(
    (child: any) => child.name !== 'metadata'
  );

  return metadataDefinitions.children.reduce<SvgDefinition>(
    (acc: any, definition) => {
      acc[definition.name] = definition.children.map(child => {
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
      name: filename.replace('.svg', ''),
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
