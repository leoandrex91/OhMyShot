import { previaMixAdapter } from '../previa-mix/adapter.js';

export const quienAdapter = {
  ...previaMixAdapter,
  modeId: 'quien',

  async createSession(args = {}) {
    const rawModeConfig = args.modeConfig || {};
    const enabledTypes = rawModeConfig.enabledTypes || [];
    const bonusAllowed = enabledTypes.includes('bonus') || rawModeConfig.bonusEnabled !== false;
    const forcedTypes = bonusAllowed ? ['quien es más probable', 'bonus'] : ['quien es más probable'];

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
