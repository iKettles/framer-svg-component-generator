export default function generateGenericIconComponent(svgs: SvgDefinition[]) {
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
