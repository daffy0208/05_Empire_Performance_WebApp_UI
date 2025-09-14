import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ title, description, canonical, ogImage }) => {
  const pageTitle = title ? `${title}` : 'Empire Performance Coaching';
  return (
    <Helmet>
      {pageTitle && <title>{pageTitle}</title>}
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="website" />
    </Helmet>
  );
};

export default SEO;

