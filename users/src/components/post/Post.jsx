import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { currentUser } = useContext(AuthContext);
  console.log("currentUser:", currentUser.user.isAdmin);

  // useEffect(() => {
  //   // Kiểm tra xem giá trị của currentUser có thay đổi không
  //   console.log("CurrentUser updated:", currentUser);
  // }, [currentUser]); // Chỉ kích hoạt khi currentUser thay đổ

  const { isPending, error, data } = useQuery({
    queryKey: ["likes", post.id],
    queryFn: () =>
      makeRequest.get("/likes?postId=" + post.id).then((res) => {
        return res.data;
      }),
  });

  const {
    isPending: commentsPending,
    error: commentsError,
    data: commentsData,
  } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () =>
      makeRequest.get("/comments?postId=" + post.id).then((res) => res.data),
  });

  const queryClient = useQueryClient();

  // Mutation
  const mutation = useMutation({
    mutationFn: (liked) => {
      if (liked) return makeRequest.delete("/likes?postId=" + post.id);
      return makeRequest.post("/likes", { postId: post.id });
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["likes"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      console.error("Server response:", error.response.data);
    },
  });

  // Mutation
  const deletemutation = useMutation({
    mutationFn: (postId) => {
      return makeRequest.delete("/posts/" + postId);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      console.error("Server response:", error.response.data);
      alert("Không được phép: Bài đăng không thuộc về người dùng.");
    },
  });

  // Chuyển đổi post.createdAt thành đối tượng Date
  const createdAtDate = post.createdAt
    ? new Date(
        post.createdAt.seconds * 1000 + (post.createdAt.nanoseconds || 0) / 1e6
      )
    : null;

  const isLiked = data && data.some((user) => user.id === currentUser.user.id);

  // console.log("Is liked:", isLiked); // Log giá trị của isLiked
  // console.log("currentUser.id:", currentUser.user.id); // Log giá trị của currentUser.id
  // console.log("data[0]:", data && data[0]); // Log giá trị của data[0]

  const handeLike = () => {
    mutation.mutate(isLiked);
  };

  const handleDelete = () => {
    console.log("Post ID for deletion:", post.id);
    deletemutation.mutate(post.id);
  };

  const canDeletePost =
    currentUser.user.isAdmin ||
    (post.userId === currentUser.user.id && !currentUser.user.isAdmin);

  return (
    <div className="post">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img src={post.userData.profilePic} alt="" />
            <div className="details">
              <Link
                to={`/profile/${post.userId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.userData.displayName}</span>
              </Link>

              <span className="date">{moment(createdAtDate).fromNow()}</span>
            </div>
          </div>
          {canDeletePost && (
            <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} />
          )}
          {canDeletePost && menuOpen && (
            <button onClick={handleDelete}>Delete</button>
          )}
        </div>
        <div className="content">
          <p>{post.desc}</p>
          <img src={post.img} alt="" />
        </div>
        <div className="info">
          <div className="item">
            {isPending ? (
              "loading"
            ) : isLiked ? (
              <FavoriteOutlinedIcon
                style={{ color: "red" }}
                onClick={handeLike}
              />
            ) : (
              <FavoriteBorderOutlinedIcon onClick={handeLike} />
            )}
            {data && data.length} Likes
          </div>

          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <TextsmsOutlinedIcon />
            {commentsPending
              ? "loading"
              : commentsData && commentsData.length
              ? `${commentsData.length} Comments`
              : "0 Comments"}
          </div>
        </div>
        {commentOpen && (
          <Comments
            postId={post.id}
            createdAt={post.createdAt}
            comments={post.comments}
          />
        )}
      </div>
    </div>
  );
};

export default Post;
