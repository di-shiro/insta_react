import React, { useEffect } from "react";
import Auth from "../auth/Auth";

import styles from "./Core.module.css";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import { withStyles, styled } from "@material-ui/core/styles";
import {
  Button,
  Grid,
  Avatar,
  Badge,
  CircularProgress,
} from "@material-ui/core";

import { MdAddAPhoto } from "react-icons/md";

import {
  editNickname,
  selectProfile,
  selectIsLoadingAuth,
  setOpenSignIn,
  resetOpenSignIn,
  setOpenSignUp,
  resetOpenSignUp,
  setOpenProfile,
  resetOpenProfile,
  fetchAsyncGetMyProf,
  fetchAsyncGetProfs,
} from "../auth/authSlice";

import {
  selectPosts,
  selectIsLoadingPost,
  setOpenNewPost,
  resetOpenNewPost,
  fetchAsyncGetPosts,
  fetchAsyncGetComments,
} from "../post/postSlice";

import Post from "../post/Post";

/* Material-uiのサイトからコピーした。
https://mui.com/material-ui/react-avatar/#with-badge
 */
const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "$ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}))(Badge);

const Core: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const posts = useSelector(selectPosts);
  const isLoadingPost = useSelector(selectIsLoadingPost);
  const isLoadingAuth = useSelector(selectIsLoadingAuth);

  useEffect(() => {
    const fetchBootLoader = async () => {
      if (localStorage.localJWT) {
        dispatch(resetOpenSignIn());
        const result = await dispatch(fetchAsyncGetMyProf());
        // Tokenの有効期限が切れている場合の処理
        if (fetchAsyncGetMyProf.rejected.match(result)) {
          dispatch(setOpenSignIn());
          return null;
        }
        await dispatch(fetchAsyncGetPosts());
        await dispatch(fetchAsyncGetProfs());
        await dispatch(fetchAsyncGetComments());
      }
    };
    fetchBootLoader();
  }, [dispatch]);

  return (
    <div>
      <Auth />

      <div className={styles.core_header}>
        <h1 className={styles.core_title}>SNS clone</h1>
        {
          // profileが存在する時に、profile.nickName が存在するか判定する。
          profile?.nickName ? (
            <>
              <button
                className={styles.core_btnModal}
                onClick={() => {
                  dispatch(setOpenNewPost());
                  dispatch(resetOpenProfile());
                }}
              >
                <MdAddAPhoto />
              </button>
              <div className={styles.core_logout}>
                {(isLoadingPost || isLoadingAuth) && <CircularProgress />}
                <Button
                  onClick={() => {
                    localStorage.removeItem("localJWT");
                    dispatch(editNickname(""));
                    // もし、profileやPostの編集モーダルが開いていた場合に閉じる
                    dispatch(resetOpenProfile());
                    dispatch(resetOpenNewPost());
                    // SignInモーダルを開く
                    dispatch(setOpenSignIn());
                  }}
                >
                  Logout
                </Button>
                <button
                  className={styles.core_btnModal}
                  onClick={() => {
                    dispatch(setOpenProfile());
                    dispatch(resetOpenNewPost()); // 新規Postモーダルが開いていた場合、閉じる。
                  }}
                >
                  <StyledBadge
                    overlap="circle"
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    variant="dot"
                  >
                    <Avatar alt="" src="/static/images/avatar/1.jpg" />
                  </StyledBadge>
                </button>
              </div>
            </>
          ) : (
            <div>
              <Button
                onClick={() => {
                  dispatch(setOpenSignIn());
                  dispatch(resetOpenSignUp());
                }}
              >
                LogIn
              </Button>
              <Button
                onClick={() => {
                  dispatch(setOpenSignUp());
                  dispatch(resetOpenSignIn());
                }}
              >
                SignUp
              </Button>
            </div>
          )
        }
      </div>

      {profile?.nickName && (
        <>
          <div className={styles.core_posts}>
            <Grid container spacing={4}>
              {posts
                .slice(0)
                .reverse()
                .map((post) => (
                  <Grid key={post.id} item xs={12} md={4}>
                    <Post
                      postId={post.id}
                      title={post.title}
                      loginId={profile.userProfile} // LoginUserのID
                      userPost={post.userPost} // 投稿UserのIDで、これはDjango側で割り当てている。
                      imageUrl={post.img} // 投稿ImageのURL
                      liked={post.liked}
                    />
                  </Grid>
                ))}
            </Grid>
          </div>
        </>
      )}
    </div>
  );
};

export default Core;
