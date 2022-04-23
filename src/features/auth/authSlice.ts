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
以下のfetchAsyncLoginがコンポーネント側から呼び出された際、{email, password}を引数として渡す。
これが引数authen に入ってくる。PROPS_AUTHEN型 は、別途types.ts ファイルに定義されている。
 */
export const fetchAsyncLogin = createAsyncThunk(
  "auth/post",
  async (authen: PROPS_AUTHEN) => {
    const res = await axios.post(`${apiUrl}authen/jwt/create`, authen, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }
);

export const fetchAsyncRegister = createAsyncThunk(
  "auth/register",
  async (auth: PROPS_AUTHEN) => {
    const res = await axios.post(`${apiUrl}api/register/`, auth, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }
);

/*
このアプリの仕様では、最初に作るProfile情報には、nickNameだけを登録して、画像データはnullで作られる。
また、Django側でProfileのアクセスを受けるViewsは、JWT認証していないとアクセスできないので、
headersに JWT Token を含めてDjango側のProfileViewsにアクセスする。
 */
export const fetchAsyncCreateProf = createAsyncThunk(
  "profile/post",
  async (nickName: PROPS_NICKNAME) => {
    const res = await axios.post(`${apiUrl}api/profile/`, nickName, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

/* Profileの更新 */
export const fetchAsyncUpdateProf = createAsyncThunk(
  "profile/put",
  async (profile: PROPS_PROFILE) => {
    const uploadData = new FormData();

    uploadData.append("nickName", profile.nickName);
    profile.img && uploadData.append("img", profile.img, profile.img.name);
    const res = await axios.put(
      `${apiUrl}api/profile/${profile.id}/`,
      uploadData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      }
    );
    return res.data;
  }
);

/* LoginUser自身のProfileを取得する非同期関数
最後の rturn res.data[0] は、
Django側のviews.pyのMyProfileListViewでの戻り値return が、filterで絞り込むので配列型の値が
responseとして帰ってくるため、配列の最初０番を指定することで値を取り出している。
*/
export const fetchAsyncGetMyProf = createAsyncThunk("profile/get", async () => {
  const res = await axios.get(`${apiUrl}api/myprofile/`, {
    headers: {
      Authorization: `JWT ${localStorage.localJWT}`,
    },
  });
  return res.data[0];
});

/* 存在する全てのuserのProfileを取得する */
export const fetchAsyncGetProfs = createAsyncThunk("profiles/get", async () => {
  const res = await axios.get(`${apiUrl}api/profile/`, {
    headers: {
      Authorization: `JWT ${localStorage.localJWT}`,
    },
  });
  return res.data;
});

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
