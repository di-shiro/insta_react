import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import postReducer from "../features/post/postSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postReducer,
  },
});

/*
今回の様に TypeScript を使っている場合、Redux の dispatch にも型を定義する必要がある。
そこで、TypeScriptの typeof を使って、store.dispatch の型を取得して、
それを用いて、AppDispatch型 というのを定義している。
*/
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
