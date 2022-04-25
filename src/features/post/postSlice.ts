import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import axios from "axios";
import { PROPS_NEWPOST, PROPS_LIKED, PROPS_COMMENT } from "../types";

/*
.envファイル内に、変数名が REACT_APP_ から始まる変数を作り、値を代入すると、
環境変数とみなされ、process.env. から呼び出せる。
 */
const apiUrlPost = `${process.env.REACT_APP_DEV_API_URL}api/post/`;
const apiUrlComment = `${process.env.REACT_APP_DEV_API_URL}api/comment/`;

export const fetchAsyncGetPosts = createAsyncThunk("post/get", async () => {
  const res = await axios.get(apiUrlPost, {
    headers: {
      Authorization: `JWT ${localStorage.localJWT}`,
    },
  });
  return res.data; // GETの結果、DjangoサーバからPost一覧が配列で取得できるので、関数のreturnとする。
});

/*
  新規Postの作成*/
export const fetchAsyncNewPost = createAsyncThunk(
  "post/post",
  async (newPost: PROPS_NEWPOST) => {
    const uploadData = new FormData();

    uploadData.append("title", newPost.title);
    newPost.img && uploadData.append("img", newPost.img, newPost.img.name);
    const res = await axios.post(apiUrlPost, uploadData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

/* Like機能 */
export const fetchAsyncPatchLiked = createAsyncThunk(
  "post/patch",
  async (liked: PROPS_LIKED) => {
    const currentLiked = liked.current;
    const uploadData = new FormData();

    /* Likedを解除する: Likedボタンをもう一度押した時に解除が発動 */
    let isOverlapped = false;
    currentLiked.forEach((current) => {
      if (current === liked.new) {
        isOverlapped = true;
      } else {
        uploadData.append("liked", String(current));
      }
    });

    if (!isOverlapped) {
      uploadData.append("liked", String(liked.new));
    } else if (currentLiked.length === 1) {
      /* もし Liked を既に押していて(2回目)、それがLoginUserの1人のみの場合、
      Liked[]配列を空にして、PUTメソッドで更新する。どうやら、空配列はPATCHで更新できないらしい。
      この際、更新データには title を設定しないと正常に更新できないらしい。
      Likedを空配列で更新完了したら、returnでこのLike関数を終了する。*/
      uploadData.append("title", liked.title);
      const res = await axios.put(`${apiUrlPost}${liked.id}/`, uploadData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      });
      return res.data;
    }
    const res = await axios.patch(`${apiUrlPost}${liked.id}/`, uploadData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

/* Comment一覧を取得 */
export const fetchAsyncGetComments = createAsyncThunk(
  "comment/get",
  async () => {
    const res = await axios.get(apiUrlComment, {
      headers: {
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

/* Commentを新規作成 */
export const fetchAsyncPostComment = createAsyncThunk(
  "comment/post",
  async (comment: PROPS_COMMENT) => {
    const res = await axios.post(apiUrlComment, comment, {
      headers: {
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

export const postSlice = createSlice({
  name: "post",
  initialState: {
    isLoadingPost: false, // Django側からPost一覧データを取得する間のローディング制御のState
    openNewPost: false, // 新規Postをするモーダルダイアログの表示・非表示を制御するためのState
    /*
    下の posts と comments のパラメータは、Django側のmodels.py に作成した
    Postaクラス や Commentsクラス と対応するように設定している。
     */
    posts: [
      {
        id: 0,
        title: "",
        userPost: 0,
        created_on: "",
        img: "",
        liked: [0],
      },
    ],
    comments: [
      {
        id: 0,
        text: "",
        userComment: 0,
        post: 0,
      },
    ],
  },

  reducers: {
    fetchPostStart(state) {
      state.isLoadingPost = true;
    },
    fetchPostEnd(state) {
      state.isLoadingPost = false;
    },
    setOpenNewPost(state) {
      state.openNewPost = true;
    },
    resetOpenNewPost(state) {
      state.openNewPost = false;
    },
  },
  extraReducers: (builder) => {
    /*
    createAsyncThunkで作成した非同期関数のreturn値 は、
    下の action.payload に入ってくる。
    JWTの場合は２つの属性 access と refresh がある。
     */
    builder.addCase(fetchAsyncLogin.fulfilled, (state, action) => {
      localStorage.setItem("localJWT", action.payload.access);
    });
    /* initialStateで定義した myprofile にDjango側で作成して、
    response で帰ってきた Profileデータ を格納する。 */
    builder.addCase(fetchAsyncCreateProf.fulfilled, (state, action) => {
      state.myprofile = action.payload;
    });
    builder.addCase(fetchAsyncGetMyProf.fulfilled, (state, action) => {
      state.myprofile = action.payload;
    });
    /*
    Django-APIから取得した全UserのProfileを配列としてStateに保持する。
    initialSate を参照。 */
    builder.addCase(fetchAsyncGetProfs.fulfilled, (state, action) => {
      state.profiles = action.payload;
    });
    /*
    ここでは、State内のProfileを、Djangoから帰ってきた「更新後Profileデータ」で置き換えている。
    まず、非同期関数でDjango-APIに対してPUTメソッドでアクセスして更新処理を実行させる。
    その後、Django側で更新処理完了した後、返り値として 更新されたProfile が帰ってくる。
    これが、action.payload に入っているので、ReactのStateを、この新Profileで置き換える。
     */
    builder.addCase(fetchAsyncUpdateProf.fulfilled, (state, action) => {
      state.myprofile = action.payload;
      state.profiles = state.profiles.map((prof) =>
        prof.id === action.payload.id ? action.payload : prof
      );
    });
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

/*
select関数は、単純に Stateの中にある 値を取り出すだけ。
ここでは、単にisLoadingAuth の値を返している。
ちなみに、state.auth の auth は、store.ts の中で authReducer を他のReducerと統合する
configureStoreで設定したオブジェクト名と同じでなければならない。

RootStateとは、全部のslice のStateを一纏めにしたもの。
全てのStateのデータ型を持っている。
 */
export const selectIsLoadingAuth = (state: RootState) =>
  state.auth.isLoadingAuth;

export const selectOpenSignIn = (state: RootState) => state.auth.openSignIn;
export const selectOpenSignUp = (state: RootState) => state.auth.openSignUp;
export const selectOpenProfile = (state: RootState) => state.auth.openProfile;
export const selectProfile = (state: RootState) => state.auth.myprofile;
export const selectProfiles = (state: RootState) => state.auth.profiles;

export default authSlice.reducer;
