import * as fs from 'fs-extra';
import * as svgToJsx from 'svg-to-jsx';

export default async function(
  svgs: SvgDefinition[],
  inputPath: string,
  outputPath: string
) {
  console.log(
    `Generating ${svgs.length} icon components from ${inputPath} to ${outputPath}`
  );

  for (const svgDefinition of svgs) {
    // Parse each SVG string into a JSX string
    svgDefinition.jsx = await parseSVGToJSX(svgDefinition.svg);

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
  }
});
  `;
}

function generateGenericIconComponent(svgs: SvgDefinition[]) {
  const componentDescriptions = svgs.reduce<
    Array<{ id: string; name: string; importPath: string }>
  >((acc, svg) => {
    acc.push({
      id: svg.id,
      name: svg.metadata.name,
      importPath: `${svg.relativeOutputDirectory}${svg.metadata.name}`
    });
    return acc;
  }, []);

  return `
import * as React from 'react';
import { addPropertyControls, ControlType } from 'framer';
${componentDescriptions.reduce<string>((acc, component) => {
  acc += `import { ${component.name} } from "${component.importPath}";\n`;
  return acc;
}, '')}

const icons = {${componentDescriptions.reduce<string>((acc, component) => {
    acc += `\n  "${component.id}": ${component.name},`;
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
      componentDescriptions.map(component => component.id)
    )}
  }
});
    `;
}
