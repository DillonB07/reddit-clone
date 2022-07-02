import { useSession } from "next-auth/react";
import Image from "next/image";

type Props = {
  seed?: string;
  large?: boolean;
};

function Avatar({ seed, large }: Props) {
  const { data: session } = useSession();
  return (
    <div
      className={`relative overflow-hidden h-10 w-10 rounded-full border-gray-300 bg-white ${
        large && "h-20 w-20"
      }`}
    >
      <Image
        src={`https://avatars.dicebear.com/api/avataaars/${
          seed || session?.user?.name || "reddit-clone-db07"
        }.svg`}
        layout="fill"
      />
    </div>
  );
}
export default Avatar;
