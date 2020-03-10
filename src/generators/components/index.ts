import * as fs from 'fs-extra';
import svgToJsx from 'svg-to-jsx';
import generateGenericIconComponent from './genericIconComponent';
import generateSVGComponent from './svgComponent';

export default async function(
  svgs: SvgDefinition[],
  inputPath: string,
  outputPath: string
) {
  console.log(
    `Generating ${svgs.length} icon components from ${inputPath} to ${outputPath}`
  );

  for (const svgDefinition of svgs) {
    // console.log(svgDefinition.svg);
    // Parse each SVG string into a JSX string
    svgDefinition.jsx = await parseSVGToJSX(svgDefinition.svg);
    // console.log(svgDefinition.jsx);

    // Create output directory if it doesn't yet exist
    fs.mkdirpSync(svgDefinition.outputDirectory);

    // Write the generated component to the output path
    fs.writeFileSync(
      `${svgDefinition.outputDirectory}${svgDefinition.metadata.name}.tsx`,
      generateSVGComponent(svgDefinition.metadata.name, svgDefinition.jsx)
    );
  }

  // Write the generic <Icon/> component to the output path
  fs.writeFileSync(
    `${outputPath}/Icon.tsx`,
    generateGenericIconComponent(svgs)
  );
}

function parseSVGToJSX(svg: string): Promise<string> {
  return new Promise((resolve, reject) => {
    svgToJsx(
      svg,
      {
        passProps: true
      },
      (err: Error, svgContent: string) => {
        if (err) {
          return reject(new Error('Failed to parse SVG to JSX'));
        }

        // svg-to-jsx is used for class components so we should replace any instance of this.props
        svgContent = svgContent.replace(/this.props/g, 'props');

        return resolve(svgContent);
      }
    );
  });
}
