import Post from "../post/Post";
import "./posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const Posts = ({ userId }) => {
  const { isPending, error, data } = useQuery({
    queryKey: ["posts"],
    queryFn: () => {
      let url = "/posts";
      if (userId) {
        // Nếu có userId, thêm userId vào URL
        url += `?userId=${userId}`;
      }
      // Gọi API để lấy dữ liệu
      return makeRequest.get(url).then((res) => res.data);
    },
  });

  return (
    <div className="posts">
      {error
        ? "Something went wrong!"
        : isPending
        ? "loading"
        : data && Array.isArray(data)
        ? data.map((post) => <Post post={post} key={post.id} />)
        : "No posts found"}
    </div>
  );
};

export default Posts;
