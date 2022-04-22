import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import axios from "axios";
import { PROPS_AUTHEN, PROPS_PROFILE, PROPS_NICKNAME } from "../types";

/*
.envファイル内に、変数名が REACT_APP_ から始まる変数を作り、値を代入すると、
環境変数とみなされ、process.env. から呼び出せる。
 */
const apiUrl = process.env.REACT_APP_DEV_API_URL;

/*
export const incrementAsync = createAsyncThunk(
  "counter/fetchCount",
  async (amount: number) => {
    const response = await fetchCount(amount);
    // The value we return becomes the `fulfilled` action payload
    return response.data;
  }
);
 */
export const authSlice = createSlice({
  name: "auth",
  initialState: {
    openSignIn: true, // SignIn編集用のモーダルダイアログの表示・非表示を制御するState
    openSignUp: false, // SignUp編集用の
    openProfile: false, // Profile編集用の
    isLoadingAuth: false,
    // LoginUserのプロフィールデータをReact内で保持するためのState
    myprofile: {
      id: 0,
      nickName: "",
      userProfile: 0,
      created_on: "",
      img: "",
    },
    // 全ユーザーのProfileをDownloadして保持するState
    profiles: [
      {
        id: 0,
        nickName: "",
        userProfile: 0,
        created_on: "",
        img: "",
      },
    ],
  },

  reducers: {
    fetchCredStart(state) {
      state.isLoadingAuth = true;
    },
    fetchCredEnd(state) {
      state.isLoadingAuth = false;
    },
    // SignInモーダルダイアログの Open, Close
    setOpenSignIn(state) {
      state.openSignIn = true;
    },
    resetOpenSignIn(state) {
      state.openSignIn = false;
    },
    // SignUpモーダルダイアログの Open, Close
    setOpenSignUp(state) {
      state.openSignUp = true;
    },
    resetOpenSignUp(state) {
      state.openSignUp = false;
    },
    // Profileモーダルダイアログの Open, Close
    setOpenProfile(state) {
      state.openProfile = true;
    },
    resetOpenProfile(state) {
      state.openProfile = false;
    },
    //
    editNickname(state, action) {
      state.myprofile.nickName = action.payload;
    },
  },
});

export const {
  fetchCredStart,
  fetchCredEnd,
  setOpenSignIn,
  resetOpenSignIn,
  setOpenSignUp,
  resetOpenSignUp,
  setOpenProfile,
  resetOpenProfile,
  editNickname,
} = authSlice.actions;

export default authSlice.reducer;
