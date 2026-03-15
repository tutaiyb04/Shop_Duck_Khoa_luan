import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

function UserAvatar({ className, user }) {
  return (
    <Avatar className={className}>
      <AvatarImage
        src={user?.avatar || "https://github.com/shadcn.png"}
        className="object-cover"
      />
      <AvatarFallback className="font-bold bg-primary text-primary-foreground">
        {user?.username?.charAt(0).toUpperCase() || "U"}
      </AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
