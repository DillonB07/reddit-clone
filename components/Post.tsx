import React, { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookmarkIcon,
  ChatAltIcon,
  DotsHorizontalIcon,
  GiftIcon,
  ShareIcon,
} from "@heroicons/react/outline";
import Avatar from "./Avatar";
import TimeAgo from "react-timeago";
import Link from "next/link";
import { MrMiyagi } from "@uiball/loaders";
import Timeago from "react-timeago";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { ADD_COMMENT, ADD_VOTE } from "../graphql/mutations";
import { useMutation, useQuery } from "@apollo/client";
import { GET_POST_BY_POST_ID, GET_VOTES_BY_POST_ID } from "../graphql/queries";
import { useSession } from "next-auth/react";

type Props = {
  post: Post;
  comments?: Boolean;
};

type FormData = {
  comment: string;
};

const Post = ({ post, comments }: Props) => {
  const router = useRouter();
  const { data: session } = useSession();

  const [vote, setVote] = useState<boolean>();
  const { data, loading } = useQuery(GET_VOTES_BY_POST_ID, {
    variables: { post_id: post?.id },
  });
  const [addVote] = useMutation(ADD_VOTE, {
    refetchQueries: [GET_VOTES_BY_POST_ID, "getVotesByPostId"],
  });

  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const [addComment] = useMutation(ADD_COMMENT, {
    refetchQueries: [GET_POST_BY_POST_ID, "getPostListByPostId"],
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const notification = toast.loading("Posting your comment...");

    await addComment({
      variables: {
        post_id: router.query.postId,
        username: session?.user?.name,
        text: data.comment,
      },
    });

    setValue("comment", "");

    toast.success("Comment succesfully posted!!", { id: notification });
  };

  const upvote = async (isUpvote: boolean) => {
    if (!session) {
      toast.error("You need to sign in to vote");
      return;
    }

    if (vote && isUpvote) return;
    if (vote === false && !isUpvote) return;

    console.log("Voting", isUpvote);

    await addVote({
      variables: {
        post_id: post?.id,
        username: session?.user?.name,
        upvote: isUpvote,
      },
    });
  };

  const displayVotes = (data: any) => {
    const votes: Vote[] = data?.getVotesByPostId;
    const displayNumber = votes?.reduce(
      (total, vote) => (vote?.upvote ? (total += 1) : (total -= 1)),
      0
    );

    if (votes?.length === 0) {
      return 0;
    }

    if (displayNumber === 0) {
      return votes[0]?.upvote ? 1 : -1;
    }

    return displayNumber;
  };

  useEffect(() => {
    const votes: Vote[] = data?.getVotesByPostId;

    const vote = votes?.find(
      (vote) => vote?.username == session?.user?.name
    )?.upvote;

    setVote(vote);
  }, [data]);

  if (!post)
    return (
      <div className="flex w-full items-center justify-center p-10 text-xl">
        <MrMiyagi size={35} color="#FF4501" />
      </div>
    );

  return (
    <>
      <Link href={`/r/${post?.subreddit[0]?.topic}/post/${post?.id}`}>
        <div
          className={`flex cursor-pointer rounded-md border border-gray-300 bg-white shadow-sm hover:border hover:border-gray-600 ${
            comments && "mx-auto my-7 max-w-5xl flex-col "
          } `}
        >
          <div className="flex flex-row">
            {/* Votes */}
            <div className="flex flex-col items-center justify-start space-y-1 rounded-l-md bg-gray-50 p-4 text-gray-400">
              <ArrowUpIcon
                onClick={() => upvote(true)}
                className={`voteButtons hover:text-red-400 ${
                  vote && "text-red-400"
                }`}
              />
              <p className={`text-xs font-bold text-black `}>
                {displayVotes(data)}
              </p>
              <ArrowDownIcon
                onClick={() => upvote(false)}
                className={`voteButtons hover:text-blue-400 ${
                  vote === false && "text-blue-400"
                }`}
              />
            </div>
            <div className="p-3 pl-1">
              {/* Header */}
              <div className="flex items-center space-x-2">
                <Avatar seed={post?.subreddit[0]?.topic} />
                <p className="text-xs text-gray-400">
                  <Link href={`/r/${post?.subreddit[0]?.topic}`}>
                    <span className="font-bold text-black hover:text-blue-400 hover:underline">
                      r/{post?.subreddit[0]?.topic}
                    </span>
                  </Link>
                  · Post by u/
                  {post?.username} <TimeAgo date={post?.created_at} />
                </p>
              </div>
              {/* Body */}
              <div className="py-4">
                <h2 className="text-xl font-semibold">{post?.title}</h2>
                <p className="mt-2 text-sm font-light">{post?.body}</p>
              </div>
              {/* Image */}
              <img className="w-full" src={post?.image} alt="" />
              {/* Footer */}
              <div className="flex flex-row space-x-4 text-gray-400">
                <div className="postButtons">
                  <ChatAltIcon className="w6 h-6" />
                  <p className="">{post?.comments?.length} Comments</p>
                </div>
                <div className="postButtons">
                  <GiftIcon className="w6 h-6" />
                  <p className="hidden sm:inline">Award</p>
                </div>
                <div className="postButtons">
                  <ShareIcon className="w6 h-6" />
                  <p className="hidden sm:inline">Share</p>
                </div>
                <div className="postButtons">
                  <BookmarkIcon className="w6 h-6" />
                  <p className="hidden sm:inline">Save</p>
                </div>
                <div className="postButtons">
                  <DotsHorizontalIcon className="w6 h-6" />
                </div>
              </div>
            </div>
          </div>
          {comments && (
            <div className=" my-7 max-w-5xl">
              <div className="-mt-1 rounded-b-md border border-t-0 border-gray-300 bg-white p-5 pl-16">
                <p className="text-sm">
                  Comment as{" "}
                  <span className="text-red-500">{session?.user?.name}</span>
                </p>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col space-y-2"
                >
                  <textarea
                    {...register("comment")}
                    disabled={!session}
                    className="h-24 rounded-md border border-gray-200 p-2 pl-4 outline-none disabled:bg-gray-50"
                    placeholder={
                      session
                        ? `Whats you on your mind?`
                        : "Please sign in to comment"
                    }
                  />
                  <button
                    disabled={!session}
                    type="submit"
                    className="rounded-full bg-red-500 p-3 font-semibold text-white disabled:bg-gray-200"
                  >
                    Comment
                  </button>
                </form>
              </div>

              <div className="-my-5 rounded-b-md py-5 px-10">
                <hr className="py-2" />
                {post?.comments.map((comment) => (
                  <div
                    className="relative flex items-center space-x-2 space-y-5"
                    key={comment.id}
                  >
                    <hr className="absolute top-10 left-7 z-0 h-16 border" />
                    <div className="z-50">
                      <Avatar seed={comment.username} />
                    </div>
                    <div className="flex flex-col">
                      <p className="py-2 text-xs text-gray-400">
                        <span className="font-semibold text-gray-600">
                          {comment.username}
                        </span>{" "}
                        · <TimeAgo date={comment.created_at} />
                      </p>
                      <p>{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Link>
    </>
  );
};

export default Post;
