import type { AProps } from "./types/AProps.ts";
import { useLinkProps } from "./useLinkProps.ts";

export const A = ({ children, ...props }: AProps) => {
  let updatedProps = useLinkProps(props);

  return <a {...updatedProps}>{children}</a>;
};
