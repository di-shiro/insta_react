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
  const openSignUp = useSelector(selectOpenSignUp);
  const isLoadingAuth = useSelector(selectIsLoadingAuth);
  const dispatch: AppDispatch = useDispatch();

  return (
    <>
      <Modal
        isOpen={openSignUp}
        onRequestClose={async () => {
          await dispatch(resetOpenSignUp());
          /* モーダルの外側をクリックすると閉じる仕組みを作成。
     Redux-storeの中の state.openSignUp をfalseにしている。 */
        }}
        style={customStyles}
      >
        <Formik
          initialErrors={{ email: "required" }}
          initialValues={{ email: "", password: "" }} // Formで制御するものを指定
          // Submitボタンが押された時に実行する処理
          onSubmit={async (values) => {
            await dispatch(fetchCredStart());
            const resultReg = await dispatch(fetchAsyncRegister(values));

            // dispatch の結果と 非同期関数のfulfilledの値が 一致した時に続く処理を実行。
            if (fetchAsyncRegister.fulfilled.match(resultReg)) {
              await dispatch(fetchAsyncLogin(values));
              await dispatch(fetchAsyncCreateProf({ nickName: "anonymous" }));

              await dispatch(fetchAsyncGetProfs());
              // await dispatch(fetchAsyncGetProfs());
              // await dispatch(fetchAsyncGetComments());
              await dispatch(fetchAsyncGetMyProf());
            }
            await dispatch(fetchCredEnd());
            await dispatch(resetOpenSignUp()); // モーダルを閉じる
          }}
          // 実際にvalidationでチェックする内容
          validationSchema={Yup.object().shape({
            email: Yup.string()
              .email("email format is wrong")
              .required("email is must"),
            password: Yup.string().required("password is must").min(4),
          })}
        >
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            errors,
            touched, // FormにマウスOverした時にTrueを返す
            isValid, // validationが通過した滝にTrueを返す
          }) => (
            <div>
              <form onSubmit={handleSubmit}>
                <div className={styles.auth_signUp}>
                  <h1 className={styles.auth_title}>SNS clone</h1>
                  <br />
                  <div className={styles.auth_progress}>
                    {isLoadingAuth && <CircularProgress />}
                  </div>
                  <br />

                  <TextField
                    placeholder="email"
                    type="input"
                    name="email"
                    // onChangeは、入力Formの値を変える度に、Formikが handleChange でvalidationを走らせてくれる。
                    onChange={handleChange}
                    // onBlurは、入力Formからマウスが離れた時にvalidationを走らせてくれる。
                    onBlur={handleBlur}
                    value={values.email}
                  />
                  <br />
                  {touched && errors.email ? (
                    <div className={styles.auth_errors}>{errors.email}</div>
                  ) : null}

                  <TextField
                    placeholder="password"
                    type="password"
                    name="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  {touched && errors.password ? (
                    <div className={styles.auth_errors}>{errors.password}</div>
                  ) : null}
                  <br />
                  <br />

                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!isValid} // validationを通過していない場合はボタンを押せなくする。
                    type="submit"
                  >
                    Register
                  </Button>
                  <br />
                  <br />

                  <span
                    className={styles.auth_text}
                    onClick={async () => {
                      await dispatch(setOpenSignIn());
                      await dispatch(resetOpenSignUp());
                    }}
                  >
                    You already have a account ?
                  </span>
                </div>
              </form>
            </div>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default Auth;
