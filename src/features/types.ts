export interface File extends Blob {
  readonly lastModified: number;
  readonly name: string;
}

/* authSlice.ts */
export interface PROPS_AUTHEN {
  email: string;
  password: string;
}

export interface PROPS_PROFILE {
  id: number;
  nickName: string;
  img: File | null;
}

export interface PROPS_NICKNAME {
  nickName: string;
}

/* postSlice.ts */

// 新規Post
export interface PROPS_NEWPOST {
  title: string;
  img: File | null;
}

// いいね をしたUser
export interface PROPS_LIKED {
  id: number; // 投稿したUserのID
  title: string; // 投稿のタイトル
  current: number[]; // Postに Liked(いいね) を付けてくれたUserのID
  new: number; // このアプリを現在表示しているログインUserが Likedボタンを押した時に、そのUser_IDを格納。
}

// Postに対してのComment
export interface PROPS_COMMENT {
  text: string;
  post: number;
}

/* Post.tsx */
export interface PROPS_POST {
  postId: number;
  loginId: number;
  userPost: number;
  title: string;
  imageUrl: string;
  liked: number[];
}
