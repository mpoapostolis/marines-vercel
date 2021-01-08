export const permissions = {
  admin: [
    "view:spots",
    "edit:spots",
    "view:marines",
    "edit:marines",
    "view:reservations",
    "view:vessels",
  ],
  marine: ["view:spots", "edit:spots", "view:reservations"],
  user: ["view:spots", "view:vessels"],
};
