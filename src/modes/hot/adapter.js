import { previaMixAdapter } from '../previa-mix/adapter.js';

export const hotAdapter = {
  ...previaMixAdapter,
  modeId: 'hot',

  async createSession(args = {}) {
    const rawModeConfig = args.modeConfig || {};
    const enabledTypes = rawModeConfig.enabledTypes || [];
    const bonusAllowed = enabledTypes.includes('bonus') || rawModeConfig.bonusEnabled !== false;
    const forcedTypes = bonusAllowed ? ['hot', 'bonus'] : ['hot'];

    return previaMixAdapter.createSession.call(this, {
      ...args,
      modeConfig: {
        ...rawModeConfig,
        enabledTypes: forcedTypes,
        enableHot: true,
        adultsConfirmed: true,
        everyoneConsentsHot: true,
        customCardsEnabled: rawModeConfig.customCardsEnabled !== false
      }
    });
  }
};
