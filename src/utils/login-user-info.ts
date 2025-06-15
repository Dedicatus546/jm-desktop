import CryptoJS from "crypto-js";

// 32 位
const key = CryptoJS.enc.Utf8.parse(
  CryptoJS.SHA256("cm-desktop-key").toString(CryptoJS.enc.Hex).slice(0, 32),
);

// 16位
const iv = CryptoJS.enc.Utf8.parse(
  CryptoJS.MD5("cm-desktop-iv").toString(CryptoJS.enc.Hex).slice(0, 16),
);

export const encryptLoginUser = (query: {
  username: string;
  password: string;
}) => {
  return CryptoJS.AES.encrypt(
    JSON.stringify({
      username: query.username,
      password: query.password,
    }),
    key,
    {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  ).toString();
};

export const decryptLoginUser = (str: string) => {
  return JSON.parse(
    CryptoJS.AES.decrypt(str, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8),
  ) as { username: string; password: string };
};
