import { Storage } from '@google-cloud/storage';
import * as process from 'process';

const storage = new Storage({
  keyFilename: 'keys.json',
  projectId: process.env.PROJECT_ID,
});

export default storage;
