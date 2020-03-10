import { parse, stringify } from 'svgson';
import * as path from 'path';
import parseMetadata from './parseMetadata';
import findAndAssignConfigurableFillAttributes from './configurableFillAttributes';
import removeIrrelevantAttributes from './irrelevantAttributes';

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

  // Replace the children of this SVG with a refined version
  parsedSvg.children = parsedSvg.children.reduce(
    (acc: ParsedSvgChild[], child: any) => {
      // Strip metadata so it won't be present in the generated output
      if (child.name !== 'metadata') {
        // Refine the SVG child (strip irrelevant attributes, add custom fill properties where relevant)
        const [refinedChild] = refineSvgChild(child);
        acc.push(refinedChild);
      }
      return acc;
    },
    []
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

function refineSvgChild(parsedSvgChild: ParsedSvgChild): [ParsedSvgChild, any] {
  let svgChildCopy = { ...parsedSvgChild };

  // Remove all irrelevant attributes
  svgChildCopy = removeIrrelevantAttributes(svgChildCopy);

  // FInd the configurable paths and attach the relevant attributes that can be configured
  const [
    svgChildWithConfigurableFillAttributes,
    configurablePaths
  ] = findAndAssignConfigurableFillAttributes(svgChildCopy);

  svgChildCopy = svgChildWithConfigurableFillAttributes;

  return [svgChildCopy, configurablePaths];
}
