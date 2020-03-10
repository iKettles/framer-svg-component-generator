function parseKeywords(keywords: string): string[] {
  return keywords
    .split(',')
    .map(value => value.trim())
    .filter(value => !!value.length);
}

export default function(
  name: string,
  metadataDefinitions: ParsedSvgChild | undefined
): SvgMetadata {
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
