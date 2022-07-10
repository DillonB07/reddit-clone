import { NextPage } from "next";
import { useMutation, useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { default as PostDisplay } from "../../../../components/Post";
import { GET_POST_BY_POST_ID } from "../../../../graphql/queries";
import { SubmitHandler, useForm } from "react-hook-form";
import { ADD_COMMENT } from "../../../../graphql/mutations";
import toast from "react-hot-toast";
import Head from "next/head";
import Avatar from "../../../../components/Avatar";
import Timeago from "react-timeago";

const Post: NextPage = () => {
  const router = useRouter();

  const { data, error } = useQuery(GET_POST_BY_POST_ID, {
    variables: {
      post_id: router.query.postId,
    },
  });

  const post: Post = data?.getPostListByPostId;

  return (
    <div className="mx-auto my-7 max-w-5xl">
      <Head>
        <title>
          {post?.title} | r/{post?.subreddit[0]?.topic}
        </title>
      </Head>
      <PostDisplay post={post} comments />
    </div>
  );
};

export default Post;
