import React from 'react';

function Image({
  src,
  alt = "Image Name",
  className = "",
  loading = "lazy",
  decoding = "async",
  ...props
}) {

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      onError={(e) => {
        e.target.src = "/assets/images/no_image.png"
      }}
      {...props}
    />
  );
}

export default Image;
