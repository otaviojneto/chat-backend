export type UpsertUserSettingsDto = {
  userId: string;
  /** Atualiza `User.name` quando enviado. */
  name?: string;
  email?: string;
  uploadAvatar?: string;
  colorTheme?: string;
  themeDarkMode?: boolean;
};
