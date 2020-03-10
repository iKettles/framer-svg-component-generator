function recursivelyRemoveIrrelevantAttributes(parsedSvgChild: ParsedSvgChild) {
  const svgChildCopy = { ...parsedSvgChild };

  if (svgChildCopy.attributes.hasOwnProperty('fill')) {
    delete svgChildCopy.attributes.fill;
  }

  if (svgChildCopy.children.length > 0) {
    svgChildCopy.children = svgChildCopy.children.map(
      recursivelyRemoveIrrelevantAttributes
    );
  }

  return svgChildCopy;
}
