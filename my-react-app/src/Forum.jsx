import React, { useEffect, useState } from "react";
import styles from "./Forum.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PostsPage = ({ useremail, username }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [visibleComments, setVisibleComments] = useState({});
  const [view, setView] = useState("all"); // "all", "myposts", "mycomments", "myupvotes"
  const navigate = useNavigate();

  useEffect(() => {
    if (view === "all") {
      fetchAllPosts();
    } else if (view === "myposts") {
      fetchMyPosts();
    } else if (view === "mycomments") {
      fetchMyComments();
    } else if (view === "myupvotes") {
      fetchMyUpvotes();
    }
  }, [view]);

  const fetchAllPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/posts");
      if (response.data.status === "Success") {
        setPosts(response.data.posts);
      } else {
        console.error("Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/myposts/${useremail}`);
      if (response.data.status === "Success") {
        setPosts(response.data.posts);
      } else {
        console.error("Failed to fetch my posts");
      }
    } catch (error) {
      console.error("Error fetching my posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyComments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/mycomments/${useremail}`);
      if (response.data.status === "Success") {
        setPosts(response.data.posts);
      } else {
        console.error("Failed to fetch my comments");
      }
    } catch (error) {
      console.error("Error fetching my comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyUpvotes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/myupvotes/${useremail}`);
      if (response.data.status === "Success") {
        setPosts(response.data.posts);
      } else {
        console.error("Failed to fetch my upvotes");
      }
    } catch (error) {
      console.error("Error fetching my upvotes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (postId) => {
    if (!useremail) {
        console.error("User email is undefined. Cannot proceed with upvote.");
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3001/posts/${postId}/${useremail}`,
            {
                method: "GET",
            }
        );

        const data = await response.json();

        if (data.status === "Success") {
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === postId ? { ...post, upvotes: data.count } : post
                )
            );
        } else {
            console.error("Failed to upvote post:", data.message);
        }
    } catch (error) {
        console.error("Error upvoting post:", error);
    }
  };

  const handleAddComment = async (postId) => {
    if (!useremail || !username) {
      console.error("User email or username is undefined. Cannot add comment.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3001/posts/${postId}/comment`,
        {
          email: useremail,
          text: commentText,
        }
      );

      if (response.data.status === "Success") {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  comments: [
                    ...post.comments,
                    { email: useremail, name: username, text: commentText },
                  ],
                }
              : post
          )
        );
        setCommentText("");
      } else {
        console.error("Failed to add comment:", response.data.message);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const deletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:3001/post/${postId}`);
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const deleteComment = async (postId, commentId) => {
    try {
      await axios.delete(`http://localhost:3001/comment/${postId}/${commentId}`);
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.filter((comment) => comment._id !== commentId),
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const toggleComments = (postId) => {
    setVisibleComments((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  return (
    <div className={styles.maindiv}>
      <div className={styles.header}>
        <button onClick={() => navigate("/CreatePost")} className={styles.activityButton}>
          Make Post
        </button>
        <button onClick={() => setView("all")} className={styles.activityButton}>
          All Posts
        </button>
        <button onClick={() => setView("myposts")} className={styles.activityButton}>
          My Posts
        </button>
        <button onClick={() => setView("mycomments")} className={styles.activityButton}>
          My Comments
        </button>
        <button onClick={() => setView("myupvotes")} className={styles.activityButton}>
          My Upvotes
        </button>
      </div>

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        posts.map((post) => (
          <div key={post._id} className={styles.postContainer}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>

            <div className={styles.imageGrid}>
              {post.image &&
                post.image.map((imgSrc, index) => (
                  <img
                    key={index}
                    src={imgSrc.startsWith("http") ? imgSrc : `http://localhost:3001${imgSrc}`}
                    alt="Post"
                    className={styles.postImage}
                  />
                ))}
            </div>

            <p>Upvotes: {post.upvotes}</p>
            <button onClick={() => handleUpvote(post._id)}>Upvote</button>

            {view === "myposts" && (
              <button onClick={() => deletePost(post._id)} className={styles.CommentsButton}>
                Delete Post
              </button>
            )}

            <button onClick={() => toggleComments(post._id)} className={styles.CommentsButton}>
              {visibleComments[post._id] ? "Hide Comments" : "View Comments"}
            </button>

            {visibleComments[post._id] && (
              <div className={styles.commentsSection}>
                <h4>Comments:</h4>
                {post.comments && post.comments.length > 0 ? (
                  post.comments
                    .filter((comment) => view !== "mycomments" || comment.email === useremail)
                    .map((comment) => (
                      <div key={comment._id} className={styles.comment}>
                        <p>
                          <strong>{comment.name || comment.email}:</strong> {comment.text}
                        </p>
                        {view === "mycomments" && comment.email === useremail && (
                          <button
                            onClick={() => deleteComment(post._id, comment._id)}
                            className={styles.deleteCommentButton}
                          >
                            Delete Comment
                          </button>
                        )}
                      </div>
                    ))
                ) : (
                  <p>No comments yet.</p>
                )}
                {view !== "mycomments" && (
                  <>
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className={styles.commentInput}
                    />
                    <button
                      onClick={() => handleAddComment(post._id)}
                      className={styles.CommentsButton}
                    >
                      Comment
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PostsPage;