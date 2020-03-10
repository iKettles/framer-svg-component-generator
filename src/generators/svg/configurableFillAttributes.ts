import svgElementAttributes from 'svg-element-attributes';

/**
 * This function recursively calls itself until we have traversed the entire tree.
 * Each call modifies the child SVG nodes and generates an object that describes which
 * paths have a configurable fill. We then use this object to feed property
 * control generation for individual path fills.
 *
 * @param parsedSvgChild The current SVG node
 * @param configurablePaths An accumulated object that describes all of the configurable paths for an SVG node
 */
export default function findAndAssignConfigurableFillAttributes(
  parsedSvgChild: ParsedSvgChild,
  configurablePaths = {}
): [ParsedSvgChild, any] {
  const svgChildCopy = { ...parsedSvgChild };

  if (svgChildCopy.children.length > 0) {
    const {
      updatedChildren,
      updatedConfigurablePaths
    } = svgChildCopy.children.reduce<{
      updatedChildren: ParsedSvgChild[];
      updatedConfigurablePaths: any;
    }>(
      (acc, child) => {
        // Update the child
        const [
          updatedChild,
          childConfigurablePaths
        ] = findAndAssignConfigurableFillAttributes(
          child,
          acc.updatedConfigurablePaths
        );
        acc.updatedChildren.push(updatedChild);
        acc.updatedConfigurablePaths = {
          ...acc.updatedConfigurablePaths,
          ...childConfigurablePaths
        };
        return acc;
      },
      {
        updatedChildren: [],
        updatedConfigurablePaths: {}
      }
    );

    // Update the children of the current child
    svgChildCopy.children = updatedChildren;

    // Update the accumulated configurablePaths with the ones determined from this child
    configurablePaths = {
      ...configurablePaths,
      updatedConfigurablePaths
    };
  }

  if (svgChildCopy.type === 'element') {
    // Get the available attributes for this svg element
    const availableAttributes = svgElementAttributes[svgChildCopy.name] || [];

    // If fill is an available attribute set the value accordingly
    if (availableAttributes.includes('fill')) {
      svgChildCopy.attributes.fill = 'fill-placeholder';
    }
  }

  return [svgChildCopy, configurablePaths];
}
