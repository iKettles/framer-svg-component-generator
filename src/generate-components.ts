import * as fs from 'fs-extra';
import * as svgToJsx from 'svg-to-jsx';
import * as path from 'path';

export default async function (
  svgs: SvgDefinition[],
  inputPath: string,
  outputPath: string
) {
  console.log(
    `Generating ${svgs.length} icon components from ${inputPath} to ${outputPath}`
  );

  initialiseGenericIconComponent(svgs, outputPath);

  for (const svgDefinition of svgs) {
    await svgToJsx(
      svgDefinition.svg,
      {
        passProps: true,
      },
      (err: Error, svgContent: string) => {
        // svg-to-jsx is used for class components so we should replace any instance of this.props
        svgContent = svgContent.replace(/this.props/g, 'props');

        // Create output directory if it doesn't yet exist
        fs.mkdirpSync(svgDefinition.outputDirectory);

        // Write the generated component to the output path
        fs.writeFileSync(
          `${svgDefinition.outputDirectory}${svgDefinition.metadata.sanitizedName}.tsx`,
          generateSVGComponent(svgDefinition.metadata.sanitizedName, svgContent)
        );
      }
    );
  }
}

function initialiseGenericIconComponent(
  svgs: SvgDefinition[],
  outputPath: string
) {
  fs.writeFileSync(
    `${outputPath}/Icon.tsx`,
    generateGenericIconComponent(svgs)
  );
}

function generateSVGComponent(name: string, svgContent: string) {
  return `
import * as React from 'react';
import { addPropertyControls, ControlType } from 'framer';

export function ${name}(props) {
  return (
    ${svgContent}
  );
};

addPropertyControls(${name}, {
  fill: {
    type: ControlType.Color,
    title: 'Fill',
    defaultValue: '#ffffff'
  },
  onClick: {
    type: ControlType.EventHandler
  }
});
  `;
}

function generateGenericIconComponent(svgs: SvgDefinition[]) {
  const componentDescriptions = svgs.reduce<
    Array<{
      id: string;
      name: string;
      sanitizedName: string;
      importPath: string;
    }>
  >((acc, svg) => {
    acc.push({
      id: svg.id,
      name: svg.metadata.name,
      sanitizedName: svg.metadata.sanitizedName,
      importPath: `./${path.join(
        svg.relativeOutputDirectory,
        svg.metadata.sanitizedName
      )}`,
    });
    return acc;
  }, []);

  return `
import * as React from 'react';
import { addPropertyControls, ControlType } from 'framer';
${componentDescriptions.reduce<string>((acc, component) => {
  acc += `import { ${component.sanitizedName} } from "${component.importPath}";\n`;
  return acc;
}, '')}

const icons = {${componentDescriptions.reduce<string>((acc, component) => {
    acc += `\n  "${component.id}": ${component.sanitizedName},`;
    return acc;
  }, '')}
};

export function Icon(props) {
  const NamedIcon = icons[props.icon];
  return <NamedIcon {...props}/>
};

addPropertyControls(Icon, {
  fill: {
    type: ControlType.Color,
    title: 'Fill',
    defaultValue: '#ffffff'
  },
  icon: {
    type: ControlType.Enum,
    options: ${JSON.stringify(
      componentDescriptions.map((component) => component.id)
    )}
  },
  onClick: {
    type: ControlType.EventHandler
  }
});
    `;
}
