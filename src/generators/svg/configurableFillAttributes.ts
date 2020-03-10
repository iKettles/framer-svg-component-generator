export default function findAndAssignConfigurableFillAttributes(
  parsedSvgChild: ParsedSvgChild,
  configurablePaths = {}
): [ParsedSvgChild, any] {
  const svgChildCopy = { ...parsedSvgChild };

  /**
   * If this SVG has children, recursively call this function until we have
   * traversed the entire tree. Each call to findAndAssignCustomFillAttributes
   * modifies the child SVG nodes and generates an object that describes which
   * paths have a configurable fill. We then use this object to feed property
   * control generation for individual path fills.
   */
  if (svgChildCopy.children.length > 0) {
    const {
      updatedChildren,
      updatedConfigurablePaths
    } = svgChildCopy.children.reduce<{
      updatedChildren: ParsedSvgChild[];
      updatedConfigurablePaths: any;
    }>(
      (acc, child) => {
        // Update the c
        const [
          childDescendants,
          childConfigurablePaths
        ] = findAndAssignConfigurableFillAttributes(
          child,
          acc.updatedConfigurablePaths
        );
        acc.updatedChildren = [...acc.updatedChildren, childDescendants];
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

  // if (svg) svgChildCopy.attributes.fill = '#ff0000';

  return [svgChildCopy, configurablePaths];
}
