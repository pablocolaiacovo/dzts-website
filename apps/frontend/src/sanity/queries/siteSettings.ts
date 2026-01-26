import { defineQuery } from "next-sanity";

export const SITE_SETTINGS_QUERY = defineQuery(/* groq */ `
  *[_type == "siteSettings"][0] {
    siteName,
    logo {
      asset->{
        _id,
        url,
        metadata { lqip, dimensions }
      },
      alt
    },
    favicon {
      asset->{
        _id,
        url
      }
    },
    mainNavigation[] {
      _key,
      label,
      linkType,
      internalPath,
      externalUrl,
      actionId
    },
    phone,
    email,
    address,
    whatsappNumber,
    socialLinks[] {
      _key,
      platform,
      url
    },
    copyrightText,
    footerLinks[] {
      _key,
      label,
      url
    },
    certificationLogos[] {
      _key,
      image {
        asset->{
          _id,
          url,
          metadata { lqip, dimensions }
        }
      },
      alt,
      title,
      url
    }
  }
`);
