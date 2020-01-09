# Framer SVG Component Generator

A simple utility which takes a folder of SVGs and generates React components with Framer Property Controls. It will also generate a `schema.json` file which contains parsed metadata about each SVG.

## Installation

`yarn global add framer-svg-component-generator`

## Usage

`framer-svg-component-generator ./icons ./components`

## Generated Schema

By default this utility will write a `schema.json` file to the root of the output directory. This schema provides a definition of each imported SVG with metadata parsed from the body of the SVG itself. The structure will look similar to the following:

```json
[
  {
    "id": "Circle",
    "metadata": {
      "name": "Circle",
      "asset": "Icon",
      "description": "A circle icon for testing",
      "keywords": ["Circle", "round"],
      "size": "16"
    }
  }
]
```

The `keywords` metadata is interpreted as a comma-separated list of keywords and parsed to a JSON array.
