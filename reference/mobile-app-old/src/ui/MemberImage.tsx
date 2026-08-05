import React from "react";
import DefaultImageAsText from "./DefaultImageAsText";
import { isEmpty } from "lodash";
import ImageViewer from "./ImageViewer";

type Props = {
  initials: string[];
  style?: any;
  url?: string;
  as?: "normal" | "executive" | "familymember";
};

const MemberImage = ({ url, initials, style, as }: Props) => {
  if (isEmpty(url)) {
    return <DefaultImageAsText as={as} initials={initials} style={style} />;
  }
  const IMAGE_SIZE = as === "familymember" ? 54 : 78;
  return (
    <ImageViewer
      style={[
        {
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          borderRadius: 8,
        },
        style,
      ]}
      url={url}
    />
  );
};

export default MemberImage;
