import { system } from '../system.js';
import { fnImportAppConfig } from '../utils/fnImportAppConfig.js';
import { fnMerge } from '../utils/fnMerger.js';

const { product: importConfig } = await fnImportAppConfig('product', {});

export const productConfig = fnMerge({}, importConfig);
