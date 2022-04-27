import React, { useState } from "react";
import styles from "./Post.module.css";

import { makeStyles } from "@material-ui/core/styles";
import { Avatar, Divider, Checkbox } from "@material-ui/core";
import { Favorite, FavoriteBorder } from "@material-ui/icons";

import AvatarGroup from "@material-ui/lab/AvatarGroup";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import { selectProfiles } from "../auth/authSlice";

import {
  selectComments,
  fetchPostStart,
  fetchPostEnd,
  fetchAsyncPostComment,
  fetchAsyncPatchLiked,
} from "./postSlice";

import { PROPS_POST } from "../types";

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
}));

const Post: React.FC<PROPS_POST> = ({
  postId,
  loginId,
  userPost,
  title,
  imageUrl,
  liked,
}) => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const profiles = useSelector(selectProfiles);
  const comments = useSelector(selectComments);
  const [text, setText] = useState("");

  /* ReduxStoreにある全commentの中から１つだけ取り出す。 */
  const commentsOnPost = comments.filter((com) => {
    return com.post === postId;
  });

  /* Profileの一覧からPostしたUserのProfileのみを抜き出している。 */
  const prof = profiles.filter((prof) => {
    return prof.userProfile === userPost;
  });

  const postComment = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const packet = { text: text, post: postId };
    await dispatch(fetchPostStart());
    await dispatch(fetchAsyncPostComment(packet));
    await dispatch(fetchPostEnd());
    setText("");
  };

  const handlerLiked = async () => {
    const packet = {
      id: postId,
      title: title,
      current: liked,
      new: loginId,
    };
    await dispatch(fetchPostStart());
    await dispatch(fetchAsyncPatchLiked(packet));
    await dispatch(fetchPostEnd());
  };

  if (title) {
    return (
      <div className={styles.post}>
        <div className={styles.post_header}>
          {/* prof は上で作成した全Userのpforileをfilterしたものなので、配列として帰って来ている */}
          <Avatar className={styles.post_avatar} src={prof[0]?.img} />
          <h3>{prof[0]?.nickName}</h3>
        </div>
        {/* Post画像のURL */}
        <img className={styles.post_image} src={imageUrl} alt="" />

        <h4 className={styles.post_text}>
          {/* Likeのチェックボックス */}
          <Checkbox
            className={styles.post_checkBox}
            icon={<FavoriteBorder />}
            checkedIcon={<Favorite />}
            checked={liked.some((like) => like === loginId)}
            onChange={handlerLiked}
          />
          {/* LoginUserがLikedをチェックした場合、そのUserの nickName が表示される */}
          <strong>{prof[0]?.nickName}</strong> {title}
          {/* Liked をクリックした他のUser達のAvatar画像を表示 */}
          <AvatarGroup max={7}>
            {liked.map((like) => (
              <Avatar
                className={styles.post_avatarGroup}
                key={like}
                src={profiles.find((prof) => prof.userProfile === like)?.img}
              />
            ))}
          </AvatarGroup>
        </h4>

        <Divider />
        <div className={styles.post_comments}>
          {
            /* commentsOnPostの中に、このPostコンポーネントに渡された投稿への全commentが入っているので、
          これを１つ１つ展開。 */
            commentsOnPost.map((comment) => (
              <div key={comment.id} className={styles.post_comment}>
                <Avatar
                  src={
                    // CommentしたUserのAvatar画像を表示
                    profiles.find(
                      (prof) => prof.userProfile === comment.userComment
                    )?.img
                  }
                  className={classes.small}
                />
                <p>
                  <strong className={styles.post_strong}>
                    {
                      // CommentしたUserの nickName
                      profiles.find(
                        (prof) => prof.userProfile === comment.userComment
                      )?.nickName
                    }
                  </strong>
                  {
                    comment.text // Comment内容
                  }
                </p>
              </div>
            ))
          }
        </div>

        {/* Commentの入力Form */}
        <form className={styles.post_commentBox}>
          <input
            className={styles.post_input}
            type="text"
            placeholder="add a comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            disabled={!text.length} // 入力された文字列の長さが 0 の場合、ボタンを非表示にする。
            className={styles.post_button}
            type="submit"
            onClick={postComment}
          >
            Post
          </button>
        </form>
      </div>
    );
  }
  return null;
};

export default Post;
