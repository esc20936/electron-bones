import fs from 'fs';
import webpackPaths from '../config/webpack.paths';

const { srcNodeModulesPath, appNodeModulesPath } = webpackPaths;

if (fs.existsSync(appNodeModulesPath)) {
  if (!fs.existsSync(srcNodeModulesPath)) {
    fs.symlinkSync(appNodeModulesPath, srcNodeModulesPath, 'junction');
  }
}
 