// scripts/build.js
// const { execSync } = require('child_process');
const glob = require('glob');
const fs = require('fs').promises;
const JavaScriptObfuscator = require('javascript-obfuscator');
const { minify } = require('terser');
const archiver = require('archiver');
const Client = require('ssh2').Client;
const cliProgress = require('cli-progress');
require('dotenv').config();

// 远程部署目录
const REMOTE_DEPLOY_PATH = '/www/wwwroot/swap-admin';

// 远程服务器配置
const sshConfig = {
  host: process.env.SSH_HOST,
  port: 22,
  username: 'root',
  // 检查SSH私钥路径是否存在
  privateKey: process.env.SSH_PRIVATE_KEY
    ? require('fs').readFileSync(process.env.SSH_PRIVATE_KEY)
    : undefined,
};

// 创建压缩包
async function createZipArchive() {
  await fs.mkdir('build', { recursive: true });

  const output = require('fs').createWriteStream('build/dist.zip');
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  progressBar.start(100, 0);

  archive.on('progress', (progress) => {
    const percent = Math.round((progress.fs.processedBytes / progress.fs.totalBytes) * 100);
    progressBar.update(percent);
  });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      progressBar.stop();
      resolve();
    });
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory('dist/', false);
    archive.finalize();
  });
}

// 混淆和压缩
async function processFiles() {
  // const files = glob.sync('dist/**/*.js');
  // const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  // console.log('开始处理文件...');
  // progressBar.start(files.length, 0);

  // for (let i = 0; i < files.length; i++) {
  //   const file = files[i];
  //   let code = await fs.readFile(file, 'utf8');

  //   // 混淆
  //   code = JavaScriptObfuscator.obfuscate(code, {
  //     compact: true,
  //     stringArrayEncoding: ['rc4'],
  //   }).getObfuscatedCode();

  //   // 压缩
  //   const result = await minify(code, {
  //     compress: true,
  //     mangle: true,
  //   });
  //   if (result.error) throw result.error;

  //   await fs.writeFile(file, result.code);
  //   progressBar.update(i + 1);
  // }
  // progressBar.stop();

  console.log('开始创建压缩包...');
  await createZipArchive();

  // 仅当存在SSH_HOST和SSH_PRIVATE_KEY环境变量时才执行远程部署
  if (process.env.SSH_HOST && process.env.SSH_PRIVATE_KEY) {
    await uploadAndExtract();
    // 上传并执行清理脚本
    // await uploadAndExecuteCleanScript();
  } else {
    console.log('跳过远程部署: 缺少SSH_HOST或SSH_PRIVATE_KEY环境变量');
  }
}

// 上传并解压文件到远程服务器
async function uploadAndExtract() {
  const conn = new Client();
  console.log('开始上传文件到远程服务器...');

  await new Promise((resolve, reject) => {
    conn
      .on('ready', async () => {
        try {
          // 先确保远程目录存在
          await new Promise((res, rej) => {
            conn.exec(`mkdir -p ${REMOTE_DEPLOY_PATH}`, (err, stream) => {
              if (err) rej(err);
              stream.on('close', res);
              stream.on('data', (data) => {}); // 忽略输出
              stream.stderr.on('data', (data) => {}); // 忽略错误输出
            });
          });

          // 上传文件
          await new Promise((res, rej) => {
            conn.sftp((err, sftp) => {
              if (err) rej(err);
              const uploads = [{ src: 'build/dist.zip', dest: `${REMOTE_DEPLOY_PATH}/dist.zip` }];
              const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
              progressBar.start(100, 0);

              // 串行上传所有文件
              const uploadSequentially = async () => {
                for (const file of uploads) {
                  await new Promise((resolve, reject) => {
                    const fileSize = require('fs').statSync(file.src).size;
                    let uploaded = 0;

                    sftp.fastPut(
                      file.src,
                      file.dest,
                      {
                        step: (total_transferred, chunk, total) => {
                          uploaded = total_transferred;
                          const percent = Math.round((uploaded / fileSize) * 100);
                          progressBar.update(percent);
                        },
                      },
                      (err) => {
                        if (err) reject(err);
                        resolve();
                      },
                    );
                  });
                }
              };

              uploadSequentially()
                .then(() => {
                  progressBar.stop();
                  res();
                })
                .catch(rej);
            });
          });

          console.log('开始解压文件...');
          // 解压文件
          await new Promise((res, rej) => {
            conn.exec(
              `cd ${REMOTE_DEPLOY_PATH} && \
              rm -rf dist && \
              mkdir -p dist && \
              unzip -o dist.zip -d dist && \
              rm dist.zip`,
              (err, stream) => {
                if (err) rej(err);
                stream.on('close', res);
                stream.on('data', (data) => console.log('STDOUT: ' + data));
                stream.stderr.on('data', (data) => console.error('STDERR: ' + data));
              },
            );
          });

          resolve();
        } catch (error) {
          reject(error);
        } finally {
          conn.end();
        }
      })
      .connect(sshConfig);
  });
}

// 上传并执行清理脚本
async function uploadAndExecuteCleanScript() {
  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn
      .on('ready', async () => {
        try {
          console.log('开始上传清理脚本...');
          // 上传清理脚本
          await new Promise((res, rej) => {
            conn.sftp((err, sftp) => {
              if (err) rej(err);
              const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
              progressBar.start(100, 0);

              const fileSize = require('fs').statSync('scripts/clean.sh').size;
              let uploaded = 0;

              sftp.fastPut(
                'scripts/clean.sh',
                `${REMOTE_DEPLOY_PATH}/clean.sh`,
                {
                  step: (total_transferred, chunk, total) => {
                    uploaded = total_transferred;
                    const percent = Math.round((uploaded / fileSize) * 100);
                    progressBar.update(percent);
                  },
                },
                (err) => {
                  if (err) rej(err);
                  progressBar.stop();
                  res();
                },
              );
            });
          });

          console.log('开始执行清理脚本...');
          // 添加执行权限并运行清理脚本
          await new Promise((res, rej) => {
            conn.exec(
              `cd ${REMOTE_DEPLOY_PATH} && chmod u+x clean.sh && ./clean.sh`,
              (err, stream) => {
                if (err) rej(err);
                stream.on('close', res);
                stream.on('data', (data) => console.log('清理脚本输出: ' + data));
                stream.stderr.on('data', (data) => console.error('清理脚本错误: ' + data));
              },
            );
          });

          resolve();
        } catch (error) {
          reject(error);
        } finally {
          conn.end();
        }
      })
      .connect(sshConfig);
  });
}

processFiles()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
