export const profileApiMock = {
  async deleteData(_token: string): Promise<void> {
    // rien a faire en mode mock : pas de persistance
  },

  async updatePreferences(_token: string, _patch: Record<string, unknown>): Promise<void> {
    // idem
  },
};
