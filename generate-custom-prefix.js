// include node fs module
var fs = require('fs');

const SPACE = ' ';
const NEXT_LINE = '\n';

function fontSizes(value) {
  const range = Array.from({ length: value + 1 }, (_, i) => i)
  return range.map(val => {
    return `.fs-${val}{ font-size: ${val}px; }`
  }).join(NEXT_LINE)
}

function gutting(value) {
  const range = Array.from({ length: value + 1 }, (_, i) => i)
  const prefixes = [
    {
      name: '',
    },
    {
      name: 't',
      positions: ['top']
    },
    {
      name: 'b',
      positions: ['bottom']
    },
    {
      name: 'l',
      positions: ['left']
    },
    {
      name: 'r',
      positions: ['right']
    },
    {
      name: 'x',
      positions: ['left', 'right']
    },
    {
      name: 'y',
      positions: ['top', 'bottom']
    },
  ];

  const padding = prefixes.map(prefix => {
    return range.map(val => {
      if (prefix.positions != null) {
        const jointPositions = prefix.positions.map(position => `padding-${position}: ${val}px;`).join(SPACE);
        return `.p-${prefix.name}-${val}{ ${jointPositions}}`
      }
      if (prefix.name.length <= 0) {
        return `.p-${val}{ padding: ${val}px; }`
      }
      return `.p-${prefix.name}-${val}{ padding-${prefix.name}: ${val}px; }`
    }).join(NEXT_LINE)
  }).join(NEXT_LINE)
  const margin = prefixes.map(prefix => {
    return range.map(val => {
      if (prefix.positions != null) {
        const jointPositions = prefix.positions.map(position => `margin-${position}: ${val}px;`).join(SPACE);
        return `.m-${prefix.name}-${val}{ ${jointPositions}}`
      }
      if (prefix.name.length <= 0) {
        return `.m-${val}{ margin: ${val}px; }`
      }
      return `.m-${prefix.name}-${val}{ margin-${prefix.name}: ${val}px; }`
    }).join(NEXT_LINE)
  }).join(NEXT_LINE)
  return [padding, margin].join(NEXT_LINE);
}

function main(value) {
  return [
    gutting(value),
    fontSizes(value)
  ].join(NEXT_LINE)
}

fs.writeFile('./customize/gutting-font-prefix.less', main(100), function (err) {
  if (err) throw err;
  console.log('Gutting File is created successfully.');
});
// fs.writeFile('/styles/custom-prefix.less', padding(100), function (err) {
//   if (err) throw err;
//   console.log('Padding File is created successfully.');
// }); 