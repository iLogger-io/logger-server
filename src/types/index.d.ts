export type ResStt =
  | {
      status: number;
      msg: string;
      payload: any;
    }
  | {
      status: number;
      msg: string;
      code: number;
    };
export type WSDataType = {
  topic: string;
  payload: any;
};
