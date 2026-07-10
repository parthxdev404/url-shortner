import dotenv from 'dotenv'
import 'dotenv/config';

import { env } from './config/env.js';

console.log('Environment loaded successfully');
console.log(`Running on port ${env.PORT}`);