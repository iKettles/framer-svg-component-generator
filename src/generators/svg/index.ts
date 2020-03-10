import { parse, stringify } from 'svgson';
import * as path from 'path';
import parseMetadata from './parseMetadata';
import findAndAssignConfigurableFillAttributes from './configurableFillAttributes';

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

  // Collect metadata of SVG
  const metadataDefinitions = parsedSvg.children.find(
    (child: any) => child.name === 'metadata'
  );

  parsedSvg.children = parsedSvg.children.reduce((acc: any[], child: any) => {
    // Strip metadata so it won't be present in the generated output
    if (child.name !== 'metadata') {
      // Refine the SVG child (strip irrelevant attributes, add custom fill properties where relevant)
      acc.push(refineSVGChild(child));
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
    svg: await stringify(parsedSvg)
  } as SvgDefinition;
}

function refineSVGChild(parsedSvgChild: ParsedSvgChild) {
  let svgChildCopy = { ...parsedSvgChild };
  // let configurablePaths = {};

  // Remove all irrelevant attributes
  svgChildCopy = recursivelyRemoveIrrelevantAttributes(svgChildCopy);
  const [
    svgChildWithConfigurableFillAttributes,
    configurablePaths
  ] = findAndAssignConfigurableFillAttributes(svgChildCopy);

  svgChildCopy = svgChildWithConfigurableFillAttributes;

  console.log(`configurablePaths`, svgChildWithConfigurableFillAttributes);
  console.log(`configurablePaths`, configurablePaths);

  return svgChildCopy;
}
