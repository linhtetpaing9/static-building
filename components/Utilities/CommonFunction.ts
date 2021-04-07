import config from "../../customize/config";

export function useOriginalImage(url: string) {
  if (!url) return null
  return url.slice(0, -4) + "_o.jpg"
}

export function useOptimisedImage(url: string) {
  if (!url) return null
  return url.slice(0, -4) + "_z.jpg"
}

export function splitNameAndUrl(title) {
  // really need refactor
  var value = '';
  var insideValue = '';
  if (title.includes('[') && title.includes(']')) {
    insideValue = title.substring(title.indexOf('[') + 1, title.indexOf(']'));
    value = title.split('[')[0];
  } else {
    value = title
  }
  return [value, insideValue];
}

export function extractSquareBracket(title: string): string[] {
  const squareBrackets = title.match(/\[(.*?)\]/g)
  let value1 = title, value2 = ""
  if (squareBrackets) {
    value1 = title.replace(squareBrackets[0], '').trim()
    value2 = squareBrackets[0].replace('[', '').replace(']', '').trim()
  }
  return [value1, value2]
}


export function chunk(inputArray: [], perChunk: number) {
  var i, j, result = [];
  for (i = 0, j = inputArray.length; i < j; i += perChunk) {
    result.push(inputArray.slice(i, i + perChunk))
  }
  return result;
}

export function splitName(title) {
  var insideValue = '';
  if (title.includes('[') && title.includes(']')) {
    insideValue = title.substring(title.indexOf('[') + 1, title.indexOf(']'));
  } else {
    insideValue = title
  }
  return insideValue;
}

export function splitSearchItem(content) {
  // need refactor
  const splitLi = content
    .replace(/\n/g, '')
    .replace('<ul>', '')
    .replace('</ul>', '')
    .split('<li>')
  splitLi.shift();

  const values = splitLi.map(li => {
    const item = li.replace('</li>', '')
    const [title, link] = splitNameAndUrl(item)
    return {
      title,
      link
    }
  })
  return values;
}

export function splitContent(menuContent) {
  const splitP = menuContent.content.replace(/\n/g, '').split("<p>")
  splitP.shift()
  const menu = splitP.map(item => {
    const getUrl = item.match(/\[(.*?)\]/g)
    const hasChildren = item.match(/<ul(.*?)\/ul>/g)
    let value: any = {
      title: item.replace('</p>', '').trim()
    }
    if (hasChildren) {
      value.title = value.title.replace(hasChildren[0], '').trim()
      value.children = hasChildren[0]
        .match(/<li(.*?)\/li>/g)
        .map(child => {
          const getChildUrl = child.match(/\[(.*?)\]/g)
          let childValue: any = {
            title: child.replace('<li>', '').replace('</li>', '').trim()
          }
          if (getChildUrl) {
            childValue.title = childValue.title.replace(getChildUrl[0], '').trim()
            const rawUrl = getChildUrl[0].replace('[', '').replace(']', '').trim()
            const [url, chineseTitle] = rawUrl.split(', ')
            childValue.url = url
            childValue.chineseTitle = chineseTitle
          }
          return (childValue)
        })
    }
    if (getUrl) {
      value.title = value.title.replace(getUrl[0], '').trim()
      const rawUrl = getUrl[0].replace('[', '').replace(']', '').trim()
      const [url, chineseTitle] = rawUrl.split(', ')
      value.url = url
      value.chineseTitle = chineseTitle
    }
    return (value)
  })
  return menu;
}


export function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0;
}

export function cleanUrl(url: string) {
  if (!url) return null
  const alpanumericHyphened = url
    .toLowerCase()                    // convert to lowercase
    .replace(/[^a-zA-Z0-9]/g, ' ')     // replace non alpanumerics with spaces
    .trim()                           // remove trailing spaces
    .replace(/( )\1{1,}/g, ' ')        // reduce consecutive spaces
    .replace(/ /g, '-')                // replace spaces with hyphens
  return (alpanumericHyphened || "-") // use hyphen in case of ""
}

export function priceDisplay({
  value,
  locale = config.locale as string,
  currency = "USD" as string,
  showZeroCents = true as boolean
}) {
  if (!value) return

  const floatValue = parseFloat(value)
  const neg = floatValue < 0 ? "-" : ""
  var formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.replace(/\s/g, '')
  })

  const priceString = neg + formatter.format(floatValue)

  if (showZeroCents) {
    return priceString
  } else {
    return priceString.replace(".00", "")
  }
}

export function includeHttps(link){
  const https = /^https:\/\//;
  const matchFound = link.match(https);
  if (matchFound != null) {
    return true;
    // const [insideValue] = matchFound
    // return [value, insideValue]
  }
  return false
}

export async function getLayout(url = '/api/layout') {
  const dev = process.env.NODE_ENV !== 'production';

  const server = dev ? config.local : config.domain ;

  const res = await fetch(`${server}${url}`)
  return await res.json()
}