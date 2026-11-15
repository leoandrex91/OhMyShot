import { previaMixAdapter } from '../previa-mix/adapter.js';

export const yoNuncaAdapter = {
  ...previaMixAdapter,
  modeId: 'yo-nunca',

  async createSession(args = {}) {
    const rawModeConfig = args.modeConfig || {};
    const enabledTypes = rawModeConfig.enabledTypes || [];
    const bonusAllowed = enabledTypes.includes('bonus') || rawModeConfig.bonusEnabled !== false;
    const forcedTypes = bonusAllowed ? ['yo nunca', 'bonus'] : ['yo nunca'];

    return previaMixAdapter.createSession.call(this, {
      ...args,
      modeConfig: {
        ...rawModeConfig,
        enabledTypes: forcedTypes,
        enableHot: false,
        customCardsEnabled: rawModeConfig.customCardsEnabled !== false
      }
    });
  }
};
