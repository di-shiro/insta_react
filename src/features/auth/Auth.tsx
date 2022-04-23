import React from "react";
import { AppDispatch } from "../../app/store";
import { useSelector, useDispatch } from "react-redux";
import styles from "./Auth.module.css";
import Modal from "react-modal";
import { Formik } from "formik";
import * as Yup from "yup";
import { TextField, Button, CircularProgress } from "@material-ui/core";

import {
  selectIsLoadingAuth,
  selectOpenSignIn,
  selectOpenSignUp,
  fetchCredStart,
  fetchCredEnd,
  setOpenSignIn,
  resetOpenSignIn,
  setOpenSignUp,
  resetOpenSignUp,
  fetchAsyncLogin,
  fetchAsyncRegister,
  fetchAsyncGetMyProf,
  fetchAsyncGetProfs,
  fetchAsyncCreateProf,
} from "./authSlice";
/*
select...から始まるものはuseSelectに関係している。
set... , reset... , から始まるものは Reducer に関係する
fetch... から始まるものは非同期。
*/

const customStyles = {
  overlay: {
    // モーダルの外側の背景色を灰色に設定してる。
    backgroundColor: "#777777",
  },
  content: {
    // モーダルの位置。ブラウザ画面の上から55%、左から50%の位置に配置。
    top: "55%",
    left: "50%",

    width: 280,
    height: 350,
    padding: "50px",

    /*
    通常、座標指定する場合、 頂点はモーダルの左上だが、
    "translate(-50%, -50%)",により、座標指定の点がモーダルの中央の位置になる */
    transform: "translate(-50%, -50%)",
  },
};

const Auth: React.FC = () => {
  // ReactModalを使う場合、モーダルを使うDomのIDを指定する必要がある。
  Modal.setAppElement("#root");
  const openSignIn = useSelector(selectOpenSignIn);
  const openSignUP = useSelector(selectOpenSignUp);
  const isLoadingAuth = useSelector(selectIsLoadingAuth);
  const dispatch: AppDispatch = useDispatch();

  return <div>Auth</div>;
};

export default Auth;
