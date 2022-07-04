import { useSession } from "next-auth/react";
import Avatar from "./Avatar";
import { LinkIcon, PhotographIcon } from "@heroicons/react/outline";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_POST, ADD_SUBREDDIT } from "../graphql/mutations";
import client from "../apollo-client";
import { GET_ALL_POSTS, GET_SUBREDDIT_BY_TOPIC } from "../graphql/queries";
import toast from "react-hot-toast";

type FormData = {
  postTitle: string;
  postBody: string;
  postImage: string;
  subreddit: string;
};

function PostBox() {
  const { data: session } = useSession();
  const [addPost] = useMutation(ADD_POST, {
    refetchQueries: [GET_ALL_POSTS, "getPostList"],
  });
  const [addSubreddit] = useMutation(ADD_SUBREDDIT);

  const [imageBoxOpen, setImageBoxOpen] = useState<boolean>(false);
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = handleSubmit(async (formData) => {
    console.log(formData);
    const notification = toast.loading("Creating post...");
    try {
      const {
        data: { getSubredditListByTopic },
      } = await client.query({
        query: GET_SUBREDDIT_BY_TOPIC,
        variables: {
          topic: formData.subreddit,
        },
      });

      const subredditExists = getSubredditListByTopic.length > 0;

      if (!subredditExists) {
        console.log("Subreddit doesn't exist! Creating it...");

        const {
          data: { insertSubreddit: newSubreddit },
        } = await addSubreddit({
          variables: {
            topic: formData.subreddit,
          },
        });

        console.log("Subreddit created!");

        const image = formData.postImage || "";

        const {
          data: { insertPost: newPost },
        } = await addPost({
          variables: {
            title: formData.postTitle,
            body: formData.postBody,
            image: image,
            subreddit_id: newSubreddit.id,
            username: session?.user?.name,
          },
        });

        console.log("Post created! Data: ", newPost);
      } else {
        console.log("Subreddit exists! Using it...");
        console.log(getSubredditListByTopic);

        const image = formData.postImage || "";

        const {
          data: { insertPost: newPost },
        } = await addPost({
          variables: {
            title: formData.postTitle,
            body: formData.postBody,
            image: image,
            subreddit_id: getSubredditListByTopic[0].id,
            username: session?.user?.name,
          },
        });

        console.log("Post created! Data: ", newPost);
      }

      setValue("postBody", "");
      setValue("postTitle", "");
      setValue("postImage", "");
      setValue("subreddit", "");

      toast.success("Post successfully created!", {
        id: notification,
      });
    } catch (error) {
      console.log(error);
      toast.error("Whoops! Something went wrong", {
        id: notification,
      });
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="sticky top-16 z-50 bg-white border rounded-md border-gray-300 p-2"
    >
      <div className="flex items-center space-x-3">
        <Avatar />
        <input
          {...register("postTitle", { required: true })}
          disabled={!session}
          className="bg-gray-50 p-2 pl-5 outline-none flex-1 rounded-md"
          type="text"
          placeholder={session ? `Create a post` : "Sign in to create a post"}
        />

        <PhotographIcon
          onClick={() => setImageBoxOpen(!imageBoxOpen)}
          className={`h-6 text-gray-300 cursor-pointer ${
            imageBoxOpen && "text-blue-300"
          }`}
        />
        <LinkIcon className="h-6 text-gray-300" />
      </div>

      {!!watch("postTitle") && (
        <div className="flex flex-col py-2">
          <div className="flex items-center px-2">
            <p className="min-w-[90px]">Body:</p>
            <input
              {...register("postBody")}
              className="m-2 flex-1 bg-blue-50 p-2 outline-none"
              type="text"
              placeholder="Text (Optional)"
            />
          </div>

          <div className="flex items-center px-2">
            <p className="min-w-[90px]">Subreddit:</p>
            <input
              {...register("subreddit", { required: true })}
              className="m-2 flex-1 bg-blue-50 p-2 outline-none"
              type="text"
              placeholder="Subreddit"
            />
          </div>

          {imageBoxOpen && (
            <div className="flex items-center px-2">
              <p className="min-w-[90px]">Image URL:</p>
              <input
                {...register("postImage")}
                className="m-2 flex-1 bg-blue-50 p-2 outline-none"
                type="url"
                placeholder="Text (Optional)"
              />
            </div>
          )}

          {/* Errors */}
          {Object.keys(errors).length > 0 && (
            <div className="space-y-2 p-2 text-red-500">
              {errors.postTitle?.type === "required" && (
                <p>- A Post Title is required</p>
              )}

              {errors.subreddit?.type === "required" && (
                <p>- A Subreddit is required</p>
              )}
            </div>
          )}

          {!!watch("postTitle") && (
            <button
              type="submit"
              className="w-full rounded-full bg-blue-400 p-2 text-white"
            >
              Create Post
            </button>
          )}
        </div>
      )}
    </form>
  );
}

export default PostBox;
