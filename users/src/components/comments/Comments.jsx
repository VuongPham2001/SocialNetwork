import { useContext, useState } from "react";
import "./comments.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import moment from "moment";

const Comments = ({ postId }) => {
  const [desc, setDesc] = useState("");
  const { currentUser } = useContext(AuthContext);
  const { isPending, error, data } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () =>
      makeRequest.get("/comments?postId=" + postId).then((res) => {
        return res.data;
      }),
  });

  const queryClient = useQueryClient();

  // Mutation
  const mutation = useMutation({
    mutationFn: (newComment) => {
      return makeRequest.post("/comments", newComment);
    },
    onSuccess: () => {
      // Huỷ và fetch lại
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    mutation.mutate({ desc, postId });
    setDesc("");
  };

  return (
    <div className="comments">
      <div className="write">
        <img src={currentUser.user.profilePic} alt="" />
        <input
          type="text"
          placeholder="write a comment"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button onClick={handleClick}>Send</button>
      </div>
      {isPending
        ? "loading"
        : data.map((comment) => {
            console.log("Comment Data:", comment);
            const key =
              comment.id || (comment.createdAt && comment.createdAt.seconds);
            return (
              <div className="comment" key={key}>
                <img src={comment.profilePic} alt="" />
                <div className="info">
                  <span>{comment.displayName}</span>
                  <p>{comment.desc}</p>
                </div>
                <span className="date">
                  {comment.createdAt && comment.createdAt.seconds
                    ? moment
                        .unix(comment.createdAt.seconds)
                        .add(comment.createdAt.nanoseconds / 1e9, "seconds")
                        .fromNow()
                    : "Unknown Date"}
                </span>
              </div>
            );
          })}
    </div>
  );
};

export default Comments;
