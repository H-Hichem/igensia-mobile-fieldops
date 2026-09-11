import { registerPlugin } from '@capacitor/core';

import type { AndroidShareTargetPlugin } from './definitions.d';

const AndroidShareTarget = registerPlugin<AndroidShareTargetPlugin>('AndroidShareTarget'); // same as in kotlin code @CapacitorPlugin(name = "AndroidShareTarget")

export * from './definitions.d';
export { AndroidShareTarget };