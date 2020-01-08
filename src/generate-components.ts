import * as fs from 'fs-extra';
import * as svgToJsx from 'svg-to-jsx';

const utilsPath = `utils`;

export default async function(svgs: SvgDefinition[], outputPath: string) {
  console.log(`Generating components for ${svgs.length} svgs to ${outputPath}`);

  fs.mkdirpSync(`${outputPath}/${utilsPath}`);

  initialiseUtils(outputPath);

  for (const svgDefinition of svgs) {
    await svgToJsx(
      svgDefinition.svg,
      {
        passProps: true
      },
      (err: Error, svgContent: string) => {
        // svg-to-jsx is used for class components so we should replace any instance of this.props
        svgContent = svgContent.replace(/this.props/g, 'props');
        fs.writeFileSync(
          `${outputPath}/${svgDefinition.name}.tsx`,
          generateSVGComponent(svgDefinition.name, svgContent)
        );
      }
    );
  }
}

function initialiseUtils(outputPath: string) {
  fs.writeFileSync(
    `${outputPath}/${utilsPath}/createSvgIcon.tsx`,
    createSvgIconComponent
  );
  fs.writeFileSync(`${outputPath}/${utilsPath}/SvgIcon.tsx`, SvgIconComponent);
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

const createSvgIconComponent = `
import * as React from 'react';
import SvgIcon from './SvgIcon';

export default function createSvgIcon(path, displayName) {
  const Component = React.memo(
    React.forwardRef((props, ref) => (
      <SvgIcon ref={ref} {...props}>
        {path}
      </SvgIcon>
    )),
  );

  return Component;
}
`;

const SvgIconComponent = `
import * as React from 'react';

const SvgIcon = React.forwardRef(function SvgIcon(props: any, ref) {
  const {
    children,
    classes,
    className,
    color = 'inherit',
    component: Component = 'svg',
    fontSize = 'default',
    htmlColor,
    viewBox = '0 0 24 24',
    ...other
  } = props;

  return (
    <Component
      focusable="false"
      viewBox={viewBox}
      color={htmlColor}
      ref={ref}
      {...other}
    >
      {children}
    </Component>
  );
});

export default SvgIcon;
`;
