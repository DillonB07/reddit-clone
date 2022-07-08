import { useQuery } from "@apollo/client";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { default as PostComponent } from "../../../../components/Post";
import { GET_POST_BY_POST_ID } from "../../../../graphql/queries";

const Post: NextPage = () => {
  const router = useRouter();
  console.log("🚀 ~ file: [postid].tsx ~ line 9 ~ PostPage ~ router", router);
  const { data, error } = useQuery(GET_POST_BY_POST_ID, {
    variables: {
      post_id: router.query.postId,
    },
  });

  console.log("🚀 ~ file: [postid].tsx ~ line 14 ~ PostPage ~ data", data);

  const post: Post = data?.getPostListByPostId;

  return (
    <div className="">
      <Head>
        <title>Reddit 2.0</title>
      </Head>
      <PostComponent post={post} />
    </div>
  );
};

export default Post;
