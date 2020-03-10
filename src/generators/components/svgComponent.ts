export default function generateSVGComponent(name: string, svgContent: string) {
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
