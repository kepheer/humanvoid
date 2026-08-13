export interface ISecChUaBrand {
  brand: string
  version: string
}

const CHROME_VERSION_PATTERN = /Chrome\/(\d+)/
const EDGE_VERSION_PATTERN = /Edg\/(\d+)/
const SEC_CH_UA_BRAND_PATTERN = /"([^"]+)";v="(\d+)"/g
const NOT_A_BRAND_PATTERN = /not.a.brand/i

export const extractChromeVersion = (ua: string): number | null => {
  const match = CHROME_VERSION_PATTERN.exec(ua)
  const versionRaw = match?.[1]

  return versionRaw === undefined ? null : Number(versionRaw)
}

export const extractEdgeVersion = (ua: string): number | null => {
  const match = EDGE_VERSION_PATTERN.exec(ua)
  const versionRaw = match?.[1]

  return versionRaw === undefined ? null : Number(versionRaw)
}

export const isModernChromeUa = (ua: string): boolean => {
  const version = extractChromeVersion(ua)

  return version !== null && version >= 90
}

export const isModernChromeOrEdgeUa = (ua: string): boolean => {
  if (isModernChromeUa(ua) === true) {
    return true
  }

  const edgeVersion = extractEdgeVersion(ua)

  return edgeVersion !== null && edgeVersion >= 90
}

export const parseSecChUaBrands = (headerValue: string): ISecChUaBrand[] => {
  const brands: ISecChUaBrand[] = []
  const pattern = new RegExp(SEC_CH_UA_BRAND_PATTERN)
  let match = pattern.exec(headerValue)

  while (match !== null) {
    const brand = match[1]
    const version = match[2]

    if (brand !== undefined && version !== undefined) {
      brands.push({ brand, version })
    }

    match = pattern.exec(headerValue)
  }

  return brands
}

export const isRealBrand = (brand: string): boolean => NOT_A_BRAND_PATTERN.test(brand) === false

export const brandMatchesUa = (brand: string, ua: string): boolean => {
  const normalizedBrand = brand.toLowerCase()
  const normalizedUa = ua.toLowerCase()

  if (normalizedBrand.includes('edge') === true) {
    return normalizedUa.includes('edg') === true
  }

  if (normalizedBrand.includes('chromium') === true || normalizedBrand.includes('chrome') === true) {
    return normalizedUa.includes('chrome') === true
  }

  return normalizedUa.includes(normalizedBrand) === true
}
