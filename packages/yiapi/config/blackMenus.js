import { system } from '../system.js';
import { fnImportAppConfig } from '../utils/fnImportAppConfig.js';
import { fnMerge } from '../utils/fnMerger.js';

const { blackMenus: importConfig } = await fnImportAppConfig('blackMenus', {});

export const blackMenusConfig = fnMerge({}, importConfig);
