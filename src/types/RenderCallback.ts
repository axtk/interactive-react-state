export type RenderCallback<T> = (
  render: () => void,
  payload: T,
) => boolean | undefined | void;
