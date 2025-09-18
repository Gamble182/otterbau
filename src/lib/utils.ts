export const isoDate = (d = new Date()) =>
  new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10); // yyyy-mm-dd

export const isoNow = () => new Date().toISOString();
