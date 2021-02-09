export const permissions = {
  admin: [
    "view:spots",
    "edit:spots",
    "view:marines",
    "edit:marines",

    "view:reservations",
    "edit:reservations",

    "view:vessels",
    "edit:vessels",
    "view:services",
    "edit:services",
  ],
  marine: [
    "view:spots",
    "edit:spots",
    "view:reservations",
    "edit:reservations",
    "view:services",
    "edit:services",
  ],
  user: [
    "view:spots",
    "view:marines",
    "edit:vessels",
    "view:vessels",
    "view:services",
  ],
};
