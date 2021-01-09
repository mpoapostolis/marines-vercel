export const permissions = {
  admin: [
    "view:spots",
    "edit:spots",
    "view:marines",
    "edit:marines",
    "view:reservations",
    "view:vessels",
    "edit:vessels",
  ],
  marine: ["view:spots", "edit:spots", "view:reservations"],
  user: ["view:spots", "view:marines", "edit:vessels", "view:vessels"],
};
