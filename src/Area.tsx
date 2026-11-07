import type { AreaProps } from "./types/AreaProps.ts";
import { useLinkProps } from "./useLinkProps.ts";

export const Area = ({ alt, ...props }: AreaProps) => {
  let updatedProps = useLinkProps(props);

  return <area {...updatedProps} alt={alt} />;
};
