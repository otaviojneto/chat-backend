/** Campos enviados no PATCH (sem `userId`: vem do JWT). */
export type UpsertUserSettingsBody = {
  /** Atualiza `User.name` quando enviado. */
  name?: string;
  email?: string;
  uploadAvatar?: string;
  colorTheme?: string;
  themeDarkMode?: boolean;
};
