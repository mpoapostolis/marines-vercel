import { NowRequest } from "@vercel/node";

export type OffsetLimitType = {
  offset: number;
  limit: number;
};
export function getCursorOffset(req: NowRequest): OffsetLimitType {
  const { offset = 0, limit = 10 } = req.query;
  return { offset: +offset, limit: +limit };
}
